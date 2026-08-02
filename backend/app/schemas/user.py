from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_serializer, field_validator

from app.services.storage import get_url


# ── Password validation regex ──────────────────────────────────

# 密码要求：至少 8 个字符，包含大小写字母和数字
PASSWORD_PATTERN = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
PASSWORD_ERROR = "密码至少 8 个字符，且必须包含大小写字母和数字"


# ── Request Schemas ────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50, description="用户名")
    email: EmailStr = Field(..., max_length=255, description="邮箱")
    password: str = Field(..., min_length=8, max_length=128, description="密码")

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        import re
        if not re.match(PASSWORD_PATTERN, v):
            raise ValueError(PASSWORD_ERROR)
        return v


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., max_length=255, description="邮箱")
    password: str = Field(..., min_length=1, description="密码")


class UpdateUserRequest(BaseModel):
    username: str | None = Field(None, min_length=2, max_length=50)
    avatar: str | None = Field(None, max_length=500)


class ResetPasswordRequest(BaseModel):
    email: EmailStr = Field(..., max_length=255, description="注册邮箱")
    new_password: str = Field(..., min_length=8, max_length=128, alias="newPassword", description="新密码")

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        import re
        if not re.match(PASSWORD_PATTERN, v):
            raise ValueError(PASSWORD_ERROR)
        return v


# ── Response Schemas ───────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    avatar: str | None = None
    last_login: datetime | None = Field(None, alias="lastLoginAt")
    created_at: datetime = Field(alias="createdAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @field_serializer("avatar")
    @classmethod
    def _serialize_avatar(cls, v: str | None) -> str | None:
        """Convert Cloudinary public_id to full URL. Old local paths pass through."""
        if v is None:
            return None
        return get_url(v)


class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    refreshToken: str


class RefreshTokenRequest(BaseModel):
    refreshToken: str = Field(..., min_length=1, description="刷新令牌")
