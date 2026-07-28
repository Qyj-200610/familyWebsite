from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.user import Base


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False, comment="存储文件名 (UUID)")
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False, comment="原始上传文件名")
    file_size: Mapped[int] = mapped_column(Integer, nullable=False, comment="文件大小 (bytes)")
    content_type: Mapped[str] = mapped_column(String(50), nullable=False, comment="MIME 类型")
    description: Mapped[str | None] = mapped_column(Text, nullable=True, default=None, comment="照片描述")
    uploaded_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, comment="上传者 ID"
    )
    album_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("albums.id", ondelete="SET NULL"), nullable=True, default=None, comment="所属相册 ID"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # 关系
    uploader: Mapped["User"] = relationship("User", lazy="joined")  # type: ignore[name-defined]
    album: Mapped["Album | None"] = relationship("Album", back_populates="photos")  # type: ignore[name-defined]

    def __repr__(self) -> str:
        return f"<Photo(id={self.id}, filename={self.filename!r}, uploaded_by={self.uploaded_by})>"
