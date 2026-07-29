from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ── Response Schemas ────────────────────────────────────────────


class PhotoUploaderResponse(BaseModel):
    """照片上传者的简要信息"""
    id: int
    username: str

    model_config = ConfigDict(from_attributes=True)


class PhotoResponse(BaseModel):
    id: int
    filename: str
    original_filename: str = Field(alias="originalFilename")
    file_size: int = Field(alias="fileSize")
    content_type: str = Field(alias="contentType")
    description: str | None = None
    uploaded_by: int = Field(alias="uploadedBy")
    uploader: PhotoUploaderResponse | None = None
    album_id: int | None = Field(None, alias="albumId")
    created_at: datetime = Field(alias="createdAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
