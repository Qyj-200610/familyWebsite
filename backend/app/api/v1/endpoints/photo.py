from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.response import error_response, success_response
from app.models.user import User
from app.services.photo import PhotoService
from app.utils.response_helpers import PHOTO_UPLOAD_ERROR_MAP, map_value_error, photo_to_response

router = APIRouter(prefix="/photos", tags=["photos"])


@router.get("")
async def get_photos(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取照片列表（按上传时间倒序，分页）。仅返回公开相册或本人相册的照片。"""
    limit = min(max(limit, 1), 100)  # clamp to [1, 100]
    photos = await PhotoService.get_photos(
        db, skip=skip, limit=limit, current_user_id=current_user.id
    )
    return success_response([photo_to_response(p) for p in photos])


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
        return map_value_error(e, PHOTO_UPLOAD_ERROR_MAP, (3000, "上传失败"))

    return success_response(photo_to_response(photo), message="照片上传成功")


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
