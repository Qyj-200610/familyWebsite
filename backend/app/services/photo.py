import asyncio
import logging
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.models.album import Album
from app.models.photo import Photo
from app.models.user import User
from app.services.storage import (
    CloudinaryNotConfiguredError,
    CloudinaryUploadError,
    delete_image,
    is_cloudinary_id,
    upload_image,
)
from app.utils.image import detect_image_type

logger = logging.getLogger(__name__)


class PhotoService:
    """Business logic for photo album operations."""

    # 允许的图片扩展名（用于文件名后缀检查）
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

    @staticmethod
    def _validate_file(filename: str, content_type: str | None, content: bytes) -> str | None:
        """Validate the uploaded file and return the detected content type.

        Raises ValueError on failure.
        """
        if not filename:
            raise ValueError("FILENAME_MISSING")

        suffix = Path(filename).suffix.lower()
        if suffix not in PhotoService.ALLOWED_EXTENSIONS:
            raise ValueError("UNSUPPORTED_FORMAT")

        if content_type and content_type not in settings.PHOTO_ALLOWED_CONTENT_TYPES:
            raise ValueError("UNSUPPORTED_CONTENT_TYPE")

        if len(content) == 0:
            raise ValueError("EMPTY_FILE")

        if len(content) > settings.PHOTO_MAX_SIZE:
            raise ValueError("FILE_TOO_LARGE")

        detected = detect_image_type(content)
        if detected is None or detected not in settings.PHOTO_ALLOWED_CONTENT_TYPES:
            raise ValueError("INVALID_IMAGE")

        # Normalize .jpeg → .jpg (kept for consistency; the extension is not used
        # by the upload path — Cloudinary uses uuid.hex as the public_id).
        return detected

    @staticmethod
    async def upload_photo(
        db: AsyncSession,
        user: User,
        file: UploadFile,
        description: str | None = None,
        *,
        album_id: int | None = None,
    ) -> Photo:
        """Upload a photo to Cloudinary and create a database record."""
        # 读取文件内容
        content = await file.read()
        original_filename = file.filename or ""

        # 验证文件
        detected_type = PhotoService._validate_file(original_filename, file.content_type, content)
        content_type = file.content_type or detected_type or "image/jpeg"

        # 上传到 Cloudinary（在后台线程中执行，避免阻塞事件循环）
        try:
            public_id = await asyncio.to_thread(
                upload_image, content, uuid.uuid4().hex, "family-website/photos"
            )
        except CloudinaryNotConfiguredError:
            raise ValueError("CLOUDINARY_NOT_CONFIGURED")
        except CloudinaryUploadError:
            raise ValueError("CLOUDINARY_UPLOAD_FAILED")

        # 创建数据库记录（filename 存 Cloudinary public_id）
        photo = Photo(
            filename=public_id,
            original_filename=original_filename,
            file_size=len(content),
            content_type=content_type,
            description=description,
            uploaded_by=user.id,
            album_id=album_id,
        )
        db.add(photo)
        try:
            await db.flush()
        except Exception:
            # DB write failed — clean up the Cloudinary file
            await asyncio.to_thread(delete_image, public_id)
            raise
        await db.refresh(photo)

        return photo

    @staticmethod
    async def get_photos(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 50,
        *,
        album_id: int | None = None,
        current_user_id: int | None = None,
    ) -> list[Photo]:
        """Get a paginated list of photos, newest first.

        When ``current_user_id`` is provided, filters out photos in private
        albums that don't belong to the user.
        """
        stmt = (
            select(Photo)
            .outerjoin(Album, Photo.album_id == Album.id)
            .options(selectinload(Photo.uploader))
            .order_by(Photo.created_at.desc())
        )

        if album_id is not None:
            stmt = stmt.where(Photo.album_id == album_id)

        if current_user_id is not None:
            # Only return photos from public albums, user's own albums, or album-less photos
            stmt = stmt.where(
                (Album.is_public)
                | (Album.created_by == current_user_id)
                | (Photo.album_id.is_(None))
            )

        result = await db.execute(stmt.offset(skip).limit(limit))
        return list(result.scalars().all())

    @staticmethod
    async def get_photo_by_id(db: AsyncSession, photo_id: int) -> Photo | None:
        """Get a single photo by ID."""
        result = await db.execute(
            select(Photo).options(selectinload(Photo.uploader)).where(Photo.id == photo_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def delete_photo(db: AsyncSession, photo: Photo) -> None:
        """Delete a photo record and its Cloudinary file.

        Cloudinary cleanup runs *after* the DB flush succeeds, so the file is
        only deleted once we know the DB delete is committed.  The cleanup is
        best-effort — a Cloudinary failure is logged but does not roll back
        the DB delete (the orphaned file is just wasted storage, not data loss).
        """
        # Save public_id before deleting the ORM object
        public_id: str = photo.filename

        await db.delete(photo)
        await db.flush()

        # Best-effort Cloudinary / local cleanup — must happen AFTER flush
        if is_cloudinary_id(public_id):
            await asyncio.to_thread(delete_image, public_id)
        else:
            # Old-format record: try local disk cleanup
            try:
                filepath = Path(settings.UPLOAD_DIR) / "photos" / public_id
                filepath.unlink(missing_ok=True)
            except Exception:
                logger.warning("Failed to delete photo file: %s", public_id, exc_info=True)
