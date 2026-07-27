from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.response import error_response, success_response
from app.models.user import User
from app.schemas.user import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)
from app.services.user import UserService


async def _auth_response(user: User, token: str):
    """Build the standard auth response with user + token."""
    return success_response(
        AuthResponse(
            user=UserResponse.model_validate(user),
            token=token,
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
    """Authenticate and return a JWT token."""
    result = await UserService.authenticate_user(db, data.email, data.password)
    if result is None:
        return error_response(1101, "邮箱或密码错误")
    user, token = result
    return await _auth_response(user, token)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout — the frontend clears the token client-side."""
    return success_response(None, "已退出登录")
