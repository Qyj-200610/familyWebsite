"""Shared response helpers used by multiple endpoint modules."""

from fastapi.responses import JSONResponse

from app.core.response import error_response
from app.models.photo import Photo
from app.models.user import User
from app.schemas.photo import PhotoResponse
from app.schemas.user import UserResponse
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


def user_to_response(user: User) -> dict:
    """Convert a User ORM object to a response dict (avatar public_id → full URL)."""
    return UserResponse.model_validate(user).model_dump(mode="json", by_alias=True)


def map_value_error(
    e: ValueError,
    error_map: dict[str, tuple[int, str]],
    default: tuple[int, str],
) -> JSONResponse:
    """Map a service-layer ``ValueError`` to a unified error response.

    The service layer raises ``ValueError`` with a symbolic code (e.g. ``"EMAIL_EXISTS"``);
    each endpoint supplies its own ``error_map`` (code → (error_code, message)) plus a
    module-appropriate ``default`` fallback.  This removes the repeated
    ``code, msg = error_map.get(str(e), default)`` boilerplate across endpoints.
    """
    code, msg = error_map.get(str(e), default)
    return error_response(code, msg)


# Shared photo upload error code map — used by both /photos/upload and /albums/{id}/photos/upload
PHOTO_UPLOAD_ERROR_MAP = {
    "FILENAME_MISSING": (3001, "请选择要上传的文件"),
    "UNSUPPORTED_FORMAT": (3002, "不支持的文件格式，仅允许 jpg、png、webp"),
    "UNSUPPORTED_CONTENT_TYPE": (3003, "不支持的文件类型，仅允许 jpg、png、webp"),
    "FILE_TOO_LARGE": (3004, "文件大小超出限制（最大 10 MB）"),
    "INVALID_IMAGE": (3005, "文件内容不是有效的图片格式"),
    "EMPTY_FILE": (3006, "文件内容为空，请选择有效的图片文件"),
    "CLOUDINARY_NOT_CONFIGURED": (3007, "服务器图片存储未配置，请联系管理员"),
    "CLOUDINARY_UPLOAD_FAILED": (3008, "图片存储服务暂时不可用，请稍后重试"),
}
