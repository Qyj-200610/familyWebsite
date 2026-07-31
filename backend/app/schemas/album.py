from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ── Request Schemas ────────────────────────────────────────────


class AlbumCreateRequest(BaseModel):
    """创建相册的请求体"""
    name: str = Field(..., min_length=1, max_length=100, description="相册名称")
    is_public: bool = Field(True, alias="isPublic", description="是否公开")

    model_config = ConfigDict(populate_by_name=True)


# ── Response Schemas ────────────────────────────────────────────


class AlbumCreatorResponse(BaseModel):
    """相册创建者的简要信息"""
    id: int
    username: str

    model_config = ConfigDict(from_attributes=True)


class AlbumResponse(BaseModel):
    """相册信息响应"""
    id: int
    name: str
    is_public: bool = Field(alias="isPublic")
    created_by: int = Field(alias="createdBy")
    creator: AlbumCreatorResponse | None = None
    photo_count: int = Field(0, alias="photoCount")
    created_at: datetime = Field(alias="createdAt")
    cover_photo: dict | None = Field(None, alias="coverPhoto")
    photos: list[dict] | None = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
