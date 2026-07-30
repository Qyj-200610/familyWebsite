from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.user import Base


class Album(Base):
    __tablename__ = "albums"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, comment="相册名称")
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, comment="是否公开")
    created_by: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, comment="创建者 ID"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.utc_timestamp(), nullable=False
    )

    # 关系
    creator: Mapped["User"] = relationship("User", lazy="joined")  # type: ignore[name-defined]
    photos: Mapped[list["Photo"]] = relationship(  # type: ignore[name-defined]
        "Photo", back_populates="album"
    )

    def __repr__(self) -> str:
        return f"<Album(id={self.id}, name={self.name!r}, created_by={self.created_by})>"
