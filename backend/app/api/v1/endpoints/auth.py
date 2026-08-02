from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.response import error_response, success_response
from app.core.security import create_access_token, decode_refresh_token
from app.models.user import User
from app.schemas.user import (
    AuthResponse,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserResponse,
)
from app.services.user import UserService


def _auth_response(user: User, access_token: str, refresh_token: str):
    """Build the standard auth response with user + tokens."""
    return success_response(
        AuthResponse(
            user=UserResponse.model_validate(user),
            token=access_token,
            refreshToken=refresh_token,
        ).model_dump(mode="json", by_alias=True)
    )


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account. Does NOT auto-login — use /auth/login."""
    try:
        user = await UserService.create_user(db, data)
        return success_response(None, f"账号 {user.username} 注册成功，请登录")
    except ValueError as e:
        error_map = {
            "EMAIL_EXISTS": (1001, "该邮箱已被注册"),
            "USERNAME_TAKEN": (1002, "用户名已被占用"),
        }
        code, msg = error_map.get(str(e), (1000, "注册失败"))
        return error_response(code, msg)


@router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate and return JWT access + refresh tokens."""
    result = await UserService.authenticate_user(db, data.email, data.password)
    if result is None:
        return error_response(1101, "邮箱或密码错误")
    user, access_token, refresh_token = result
    return _auth_response(user, access_token, refresh_token)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout — the frontend clears the token client-side."""
    return success_response(None, "已退出登录")


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset a user's password — verifies the email is registered, then updates."""
    try:
        await UserService.reset_password(db, data.email, data.new_password)
        return success_response(None, "密码已重置，请使用新密码登录")
    except ValueError as e:
        error_map = {
            "USER_NOT_FOUND": (1201, "该邮箱未注册"),
        }
        code, msg = error_map.get(str(e), (1200, "密码重置失败"))
        return error_response(code, msg)


@router.post("/refresh")
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a valid refresh token for a new access token.

    The old refresh token is consumed and a new refresh token is issued
    (refresh token rotation).  If the refresh token is expired or invalid
    the caller must re-authenticate.
    """
    payload = decode_refresh_token(data.refreshToken)
    if payload is None:
        return error_response(1102, "刷新令牌无效或已过期")

    user_id = payload.get("sub")
    if user_id is None:
        return error_response(1103, "刷新令牌格式错误")

    try:
        user = await UserService.get_user_by_id(db, int(user_id))
    except (ValueError, TypeError):
        return error_response(1103, "刷新令牌格式错误")

    if user is None:
        return error_response(1104, "用户不存在")

    # Issue a fresh pair — rotate the refresh token so old ones are invalidated
    token_payload = {"sub": str(user.id)}
    new_access_token = create_access_token(token_payload)
    new_refresh_token = create_refresh_token(token_payload)

    return success_response(
        AuthResponse(
            user=UserResponse.model_validate(user),
            token=new_access_token,
            refreshToken=new_refresh_token,
        ).model_dump(mode="json", by_alias=True)
    )
