from pathlib import Path

from pydantic import ConfigDict
from pydantic_settings import BaseSettings

# Resolve .env relative to this config file (backend/.env), with CWD fallback
_ENV_CANDIDATES = [
    Path(__file__).resolve().parent.parent.parent / ".env",  # backend/.env
    Path(".env"),  # CWD/.env (fallback)
]
_ENV_FILE = next((p for p in _ENV_CANDIDATES if p.is_file()), _ENV_CANDIDATES[0])


class Settings(BaseSettings):
    """Application settings loaded from .env and environment variables."""

    DATABASE_URL: str = "mysql+aiomysql://root:password@localhost:3306/family_website"
    JWT_SECRET: str = "dev-secret-key-do-not-use-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours

    # SMTP Email (QQ)
    SMTP_HOST: str = "smtp.qq.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""  # QQ 邮箱 SMTP 授权码
    SMTP_NOTIFICATION_EMAIL: str = ""  # 接收订单通知的邮箱

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5175"]

    # File upload
    UPLOAD_DIR: str = str(Path(__file__).resolve().parent.parent.parent / "uploads")
    AVATAR_MAX_SIZE: int = 2 * 1024 * 1024  # 2 MB
    AVATAR_ALLOWED_CONTENT_TYPES: set[str] = {"image/jpeg", "image/png", "image/webp"}

    model_config = ConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
    )


settings = Settings()
