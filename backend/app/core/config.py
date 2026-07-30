from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

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

    # CORS — 前端域名白名单（可通过 .env 逗号分隔覆盖，如 CORS_ORIGINS="http://a.com,https://b.com"）
    CORS_ORIGINS: list[str] = [
        "http://localhost:5175",
        "https://family-website-frontend-six.vercel.app",
    ]

    # File upload
    UPLOAD_DIR: str = str(Path(__file__).resolve().parent.parent.parent / "uploads")
    AVATAR_MAX_SIZE: int = 2 * 1024 * 1024  # 2 MB
    AVATAR_ALLOWED_CONTENT_TYPES: set[str] = {"image/jpeg", "image/png", "image/webp"}

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _parse_cors_origins(cls, v: object) -> list[str]:
        """Parse a comma-separated string from .env into a list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        if isinstance(v, list):
            return v
        raise ValueError(f"CORS_ORIGINS must be a comma-separated string or list, got {type(v)}")


settings = Settings()
