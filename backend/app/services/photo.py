import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.photo import Photo
from app.models.user import User
from app.utils.image import detect_image_type


class PhotoService:
    """Business logic for photo album operations."""

    # 允许的图片格式及对应扩展名
    ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

    @staticmethod
    def _validate_file(filename: str, content_type: str | None, content: bytes) -> str:
        """Validate the uploaded file and return the normalized extension.

        Raises ValueError on failure.
        """
        if not filename:
            raise ValueError("FILENAME_MISSING")

        suffix = Path(filename).suffix.lower()
        if suffix not in PhotoService.ALLOWED_EXTENSIONS:
            raise ValueError("UNSUPPORTED_FORMAT")

        if content_type and content_type not in PhotoService.ALLOWED_CONTENT_TYPES:
            raise ValueError("UNSUPPORTED_CONTENT_TYPE")

        if len(content) > PhotoService.MAX_FILE_SIZE:
            raise ValueError("FILE_TOO_LARGE")

        if not detect_image_type(content):
            raise ValueError("INVALID_IMAGE")

        return ".jpg" if suffix == ".jpeg" else suffix

    @staticmethod
    async def upload_photo(
        db: AsyncSession,
        user: User,
        file: UploadFile,
        description: str | None = None,
        *,
        album_id: int | None = None,
    ) -> Photo:
        """Upload a photo and create a database record."""
        # 读取文件内容
        content = await file.read()
        filename = file.filename or ""

        # 验证文件
        ext = PhotoService._validate_file(filename, file.content_type, content)
        content_type = file.content_type or detect_image_type(content) or "image/jpeg"

        # 保存到磁盘
        photo_dir = Path(settings.UPLOAD_DIR) / "photos"
        photo_dir.mkdir(parents=True, exist_ok=True)

        stored_filename = f"{uuid.uuid4().hex}{ext}"
        filepath = photo_dir / stored_filename
        filepath.write_bytes(content)

        # 创建数据库记录
        photo = Photo(
            filename=stored_filename,
            original_filename=filename,
            file_size=len(content),
            content_type=content_type,
            description=description,
            uploaded_by=user.id,
            album_id=album_id,
        )
        db.add(photo)
        await db.flush()
        await db.refresh(photo)

        return photo

    @staticmethod
    async def get_photos(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 50,
        *,
        album_id: int | None = None,
    ) -> list[Photo]:
        """Get a paginated list of photos, newest first. Optionally filter by album."""
        stmt = select(Photo).order_by(Photo.created_at.desc())
        if album_id is not None:
            stmt = stmt.where(Photo.album_id == album_id)
        result = await db.execute(stmt.offset(skip).limit(limit))
        return list(result.scalars().all())

    @staticmethod
    async def get_photo_by_id(db: AsyncSession, photo_id: int) -> Photo | None:
        """Get a single photo by ID."""
        result = await db.execute(select(Photo).where(Photo.id == photo_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def delete_photo(db: AsyncSession, photo: Photo) -> None:
        """Delete a photo record and its file from disk."""
        # 删除磁盘文件
        filepath = Path(settings.UPLOAD_DIR) / "photos" / photo.filename
        try:
            filepath.unlink(missing_ok=True)
        except OSError:
            pass  # 文件不存在或无法删除时忽略

        # 删除数据库记录
        await db.delete(photo)
        await db.flush()
