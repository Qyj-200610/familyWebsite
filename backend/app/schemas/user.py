from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ── Request Schemas ────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50, description="用户名")
    email: EmailStr = Field(..., max_length=255, description="邮箱")
    password: str = Field(..., min_length=6, max_length=128, description="密码")


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., max_length=255, description="邮箱")
    password: str = Field(..., min_length=1, description="密码")


class UpdateUserRequest(BaseModel):
    username: Optional[str] = Field(None, min_length=2, max_length=50)
    avatar: Optional[str] = Field(None, max_length=500)


# ── Response Schemas ───────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    avatar: str | None = None
    last_login: datetime | None = Field(None, alias="lastLoginAt")
    created_at: datetime = Field(alias="createdAt")

    model_config = {"from_attributes": True, "populate_by_name": True}


class AuthResponse(BaseModel):
    user: UserResponse
    token: str
