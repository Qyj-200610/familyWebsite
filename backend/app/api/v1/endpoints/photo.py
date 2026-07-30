from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.response import error_response, success_response
from app.models.photo import Photo
from app.models.user import User
from app.schemas.photo import PhotoResponse
from app.services.photo import PhotoService

router = APIRouter(prefix="/photos", tags=["photos"])

# ---------- 错误码映射 ----------

_ERROR_MAP = {
    "FILENAME_MISSING": (3001, "请选择要上传的文件"),
    "UNSUPPORTED_FORMAT": (3002, "不支持的文件格式，仅允许 jpg、png、webp"),
    "UNSUPPORTED_CONTENT_TYPE": (3003, "不支持的文件类型，仅允许 jpg、png、webp"),
    "FILE_TOO_LARGE": (3004, f"文件大小超出限制（最大 {PhotoService.MAX_FILE_SIZE // (1024 * 1024)} MB）"),
    "INVALID_IMAGE": (3005, "文件内容不是有效的图片格式"),
}


def _photo_to_response(photo: Photo) -> dict:
    """Convert a Photo ORM object to a response dict with the uploader info embedded."""
    return PhotoResponse(
        id=photo.id,
        filename=photo.filename,
        original_filename=photo.original_filename,
        file_size=photo.file_size,
        content_type=photo.content_type,
        description=photo.description,
        uploaded_by=photo.uploaded_by,
        uploader={"id": photo.uploader.id, "username": photo.uploader.username} if photo.uploader else None,
        album_id=photo.album_id,
        created_at=photo.created_at,
    ).model_dump(mode="json", by_alias=True)


@router.get("")
async def get_photos(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取照片列表（按上传时间倒序，分页）。仅返回公开相册或本人相册的照片。"""
    photos = await PhotoService.get_photos(
        db, skip=skip, limit=limit, current_user_id=current_user.id
    )
    return success_response([_photo_to_response(p) for p in photos])


@router.post("/upload")
async def upload_photo(
    file: UploadFile = File(...),
    description: str | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """上传一张照片。仅允许 JPEG、PNG、WebP，最大 10 MB。"""
    try:
        photo = await PhotoService.upload_photo(db, current_user, file, description)
    except ValueError as e:
        code, msg = _ERROR_MAP.get(str(e), (3000, "上传失败"))
        return error_response(code, msg)

    return success_response(_photo_to_response(photo), message="照片上传成功")


@router.delete("/{photo_id}")
async def delete_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """删除一张照片（仅上传者可以删除）。"""
    photo = await PhotoService.get_photo_by_id(db, photo_id)
    if photo is None:
        return error_response(3101, "照片不存在", status_code=404)

    if photo.uploaded_by != current_user.id:
        return error_response(3102, "只能删除自己上传的照片", status_code=403)

    await PhotoService.delete_photo(db, photo)
    return success_response(None, message="照片已删除")
