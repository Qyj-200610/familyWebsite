import asyncio
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.v1.endpoints.family import FAMILY_MEMBER_NAMES
from app.core.config import settings
from app.core.database import get_db
from app.core.response import error_response, success_response
from app.models.photo import Photo
from app.models.user import User
from app.schemas.user import UpdateUserRequest
from app.services.user import UserService
from app.services.storage import (
    CloudinaryNotConfiguredError,
    CloudinaryUploadError,
    delete_image,
    get_url,
    is_cloudinary_id,
    upload_image,
)
from app.utils.image import detect_image_type
from app.utils.response_helpers import map_value_error, user_to_response

router = APIRouter(prefix="/user", tags=["user"])

# 头像允许的扩展名
_AVATAR_ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

_UPDATE_ERROR_MAP = {
    "USERNAME_TAKEN": (2002, "用户名已被占用"),
}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return success_response(user_to_response(current_user))


@router.patch("/me")
async def update_me(
    data: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile."""
    try:
        user = await UserService.update_user(db, current_user, data)
        return success_response(user_to_response(user))
    except ValueError as e:
        return map_value_error(e, _UPDATE_ERROR_MAP, (2000, "更新失败"))


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a new avatar for the current user.

    Only accepts JPEG, PNG, and WebP images up to 5 MB.
    """
    # ── 验证文件存在 ──
    if not file.filename:
        return error_response(2003, "请选择要上传的文件")

    # ── 验证扩展名 ──
    suffix = Path(file.filename).suffix.lower()
    if suffix not in _AVATAR_ALLOWED_EXTENSIONS:
        return error_response(2004, f"不支持的文件格式：{suffix}，仅允许 jpg、png、webp")

    # ── 验证 Content-Type ──
    if file.content_type and file.content_type not in settings.AVATAR_ALLOWED_CONTENT_TYPES:
        return error_response(2005, f"不支持的文件类型：{file.content_type}，仅允许 jpg、png、webp")

    # ── 读取并验证文件内容 ──
    content = await file.read()
    if len(content) == 0:
        return error_response(2006, "文件内容为空，请选择有效的图片文件")
    if len(content) > settings.AVATAR_MAX_SIZE:
        return error_response(2010, f"文件大小超出限制（最大 {settings.AVATAR_MAX_SIZE // (1024 * 1024)} MB）")

    # ── 二次验证：通过文件头魔数检测真实类型 ──
    detected_type = detect_image_type(content)
    if detected_type is None or detected_type not in settings.AVATAR_ALLOWED_CONTENT_TYPES:
        return error_response(2007, "文件内容不是有效的图片格式（仅允许 jpg、png、webp）")

    # ── 上传到 Cloudinary（在后台线程中执行，避免阻塞事件循环） ──
    try:
        public_id = await asyncio.to_thread(
            upload_image, content, uuid.uuid4().hex, "family-website/avatars"
        )
    except CloudinaryNotConfiguredError:
        return error_response(2008, "服务器图片存储未配置，请联系管理员", status_code=500)
    except CloudinaryUploadError:
        return error_response(2009, "图片存储服务暂时不可用，请稍后重试", status_code=503)

    # ── 记录旧头像 public_id ──
    old_avatar = current_user.avatar

    # ── 更新用户头像字段 ──
    try:
        user = await UserService.update_user(db, current_user, UpdateUserRequest(avatar=public_id))
    except Exception:
        # DB update failed — clean up the Cloudinary file we just uploaded
        await asyncio.to_thread(delete_image, public_id)
        raise

    # ── 删除旧头像（best-effort） ──
    if is_cloudinary_id(old_avatar):
        await asyncio.to_thread(delete_image, old_avatar)

    return success_response(user_to_response(user), message="头像上传成功")


@router.get("/me/stats")
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return aggregated stats for the current user's personal center."""
    # 用户上传的照片总数
    photo_result = await db.execute(
        select(func.count()).select_from(Photo).where(Photo.uploaded_by == current_user.id)
    )
    photo_count: int = photo_result.scalar() or 0

    # 家庭成员数量（当前为固定值，由 FAMILY_MEMBER_NAMES 常量定义）
    family_member_count: int = len(FAMILY_MEMBER_NAMES)

    return success_response({
        "photoCount": photo_count,
        "foodOrderCount": 0,  # 点单系统不存储订单，固定为 0
        "familyMemberCount": family_member_count,
    })
