"""Shared response helpers used by multiple endpoint modules."""

from app.models.photo import Photo
from app.schemas.photo import PhotoResponse
from app.services.storage import get_url


def photo_to_response(photo: Photo) -> dict:
    """Convert a Photo ORM object to a response dict with the uploader info embedded.

    Converts Cloudinary public_id in ``filename`` to a full public URL.
    Old-format plain filenames are passed through as-is.
    """
    return PhotoResponse(
        id=photo.id,
        filename=get_url(photo.filename),
        original_filename=photo.original_filename,
        file_size=photo.file_size,
        content_type=photo.content_type,
        description=photo.description,
        uploaded_by=photo.uploaded_by,
        uploader={"id": photo.uploader.id, "username": photo.uploader.username} if photo.uploader else None,
        album_id=photo.album_id,
        created_at=photo.created_at,
    ).model_dump(mode="json", by_alias=True)


# Shared photo upload error code map — used by both /photos/upload and /albums/{id}/photos/upload
PHOTO_UPLOAD_ERROR_MAP = {
    "FILENAME_MISSING": (3001, "请选择要上传的文件"),
    "UNSUPPORTED_FORMAT": (3002, "不支持的文件格式，仅允许 jpg、png、webp"),
    "UNSUPPORTED_CONTENT_TYPE": (3003, "不支持的文件类型，仅允许 jpg、png、webp"),
    "FILE_TOO_LARGE": (3004, "文件大小超出限制（最大 10 MB）"),
    "INVALID_IMAGE": (3005, "文件内容不是有效的图片格式"),
}
