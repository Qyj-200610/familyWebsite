import logging
from datetime import datetime
from pathlib import Path

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, Text, event, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.user import Base

logger = logging.getLogger(__name__)


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(200), nullable=False, comment="存储文件名 (UUID)")
    original_filename: Mapped[str] = mapped_column(String(200), nullable=False, comment="原始上传文件名")
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False, comment="文件大小 (bytes)")
    content_type: Mapped[str] = mapped_column(String(50), nullable=False, comment="MIME 类型")
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


@event.listens_for(Photo, "after_delete")
def _cleanup_photo_file(mapper, connection, target: Photo) -> None:
    """Clean up the photo file from disk after the DB record is deleted.

    This handles cascade deletes as well as explicit deletes via the service layer.
    """
    try:
        from app.core.config import settings

        filepath = Path(settings.UPLOAD_DIR) / "photos" / target.filename
        filepath.unlink(missing_ok=True)
    except Exception:
        logger.warning("Failed to delete photo file: %s", target.filename, exc_info=True)
