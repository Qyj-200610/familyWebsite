import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.response import error_response, success_response
from app.models.user import User
from app.schemas.user import UpdateUserRequest, UserResponse
from app.services.user import UserService
from app.utils.image import detect_image_type

router = APIRouter(prefix="/user", tags=["user"])

# 头像允许的扩展名
_AVATAR_ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return success_response(UserResponse.model_validate(current_user).model_dump(mode="json", by_alias=True))


@router.patch("/me")
async def update_me(
    data: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile."""
    try:
        user = await UserService.update_user(db, current_user, data)
        return success_response(UserResponse.model_validate(user).model_dump(mode="json", by_alias=True))
    except ValueError as e:
        error_map = {
            "USERNAME_TAKEN": (2002, "用户名已被占用"),
        }
        code, msg = error_map.get(str(e), (2000, "更新失败"))
        return error_response(code, msg)


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a new avatar for the current user.

    Only accepts JPEG, PNG, and WebP images up to 2 MB.
    """
    # ── 验证文件存在 ──
    if not file.filename:
        raise HTTPException(status_code=400, detail="请选择要上传的文件")

    # ── 验证扩展名 ──
    suffix = Path(file.filename).suffix.lower()
    if suffix not in _AVATAR_ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件格式：{suffix}，仅允许 jpg、png、webp",
        )

    # ── 验证 Content-Type ──
    if file.content_type and file.content_type not in settings.AVATAR_ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型：{file.content_type}，仅允许 jpg、png、webp",
        )

    # ── 验证文件大小 ──
    content = await file.read()
    if len(content) > settings.AVATAR_MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"文件大小超出限制（最大 {settings.AVATAR_MAX_SIZE // (1024 * 1024)} MB）",
        )

    # ── 二次验证：通过文件头魔数检测真实类型 ──
    detected_type = detect_image_type(content)
    if detected_type is None or detected_type not in settings.AVATAR_ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="文件内容不是有效的图片格式（仅允许 jpg、png、webp）")

    # ── 保存文件 ──
    avatar_dir = Path(settings.UPLOAD_DIR) / "avatars"
    avatar_dir.mkdir(parents=True, exist_ok=True)

    # 映射后缀（.jpeg → .jpg 统一）
    ext = ".jpg" if suffix == ".jpeg" else suffix
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = avatar_dir / filename
    filepath.write_bytes(content)

    # ── 更新用户头像字段 ──
    avatar_url = f"/uploads/avatars/{filename}"
    try:
        user = await UserService.update_user(db, current_user, UpdateUserRequest(avatar=avatar_url))
    except Exception:
        # DB update failed — clean up the file we just wrote
        filepath.unlink(missing_ok=True)
        raise

    # ── 删除旧头像文件（best-effort） ──
    if current_user.avatar and current_user.avatar.startswith("/uploads/avatars/"):
        old_filename = current_user.avatar[len("/uploads/avatars/"):]
        old_filepath = avatar_dir / old_filename
        if old_filepath != filepath:
            try:
                old_filepath.unlink(missing_ok=True)
            except OSError:
                pass

    return success_response(
        UserResponse.model_validate(user).model_dump(mode="json", by_alias=True),
        message="头像上传成功",
    )


