from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.user import Base


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(200), nullable=False, comment="存储文件名 (UUID)")
    original_filename: Mapped[str] = mapped_column(String(200), nullable=False, comment="原始上传文件名")
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False, comment="文件大小 (bytes)")
    content_type: Mapped[str] = mapped_column(String(100), nullable=False, comment="MIME 类型")
    description: Mapped[str | None] = mapped_column(Text, nullable=True, default=None, comment="照片描述")
    uploaded_by: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, comment="上传者 ID"
    )
    album_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("albums.id", ondelete="SET NULL"), nullable=True, default=None, comment="所属相册 ID"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.utc_timestamp(), nullable=False
    )

    # 关系
    uploader: Mapped["User"] = relationship("User", lazy="joined")  # type: ignore[name-defined]
    album: Mapped["Album | None"] = relationship("Album", back_populates="photos")  # type: ignore[name-defined]

    def __repr__(self) -> str:
        return f"<Photo(id={self.id}, filename={self.filename!r}, uploaded_by={self.uploaded_by})>"


# NOTE: We intentionally do NOT use SQLAlchemy after_delete / after_commit events
# for cleaning up Cloudinary files.  Events that delete external resources are
# inherently unsafe — ``after_delete`` fires during ``session.flush()`` and the
# transaction may still roll back, leaving the Cloudinary file deleted but the
# DB record restored.  ``after_commit`` avoids that, but breaks the "best-effort"
# contract (it throws the cleanup onto a background thread where failures go
# unnoticed by the caller).
#
# Instead, the service layer (``PhotoService.delete_photo``) explicitly handles
# cleanup *after* the DB flush succeeds, so the caller can decide what to do on
# failure.
