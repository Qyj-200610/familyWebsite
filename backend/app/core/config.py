from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env relative to this config file (backend/.env), with CWD fallback
_ENV_CANDIDATES = [
    Path(__file__).resolve().parent.parent.parent / ".env",  # backend/.env
    Path(".env"),  # CWD/.env (fallback)
]
_ENV_FILE = next((p for p in _ENV_CANDIDATES if p.is_file()), _ENV_CANDIDATES[0])

# 核心 CORS 域名 — 始终允许，不会被环境变量 CORS_ORIGINS 覆盖。
# 当 Render 等平台上的环境变量漏加新域名时，此列表确保核心域名不会因配置遗漏被 CORS 拦截。
_CORE_CORS_ORIGINS: list[str] = [
    "http://localhost:5175",
    "https://family-website-cgh.pages.dev",
]


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
    # 使用 str | list[str] 联合类型而非纯 list[str]：
    # pydantic-settings 对纯 list 类型会在 .env 加载阶段强制 JSON 解析，导致逗号分隔字符串报错；
    # 联合类型使其在 JSON 解析失败时回退到原始字符串，交由 field_validator 处理转换。
    CORS_ORIGINS: str | list[str] = [
        "http://localhost:5175",
        "https://family-website-frontend-six.vercel.app",
        "https://family-website-cgh.pages.dev",
    ]

    # Database SSL — PlanetScale requires SSL; set to False for local MySQL
    DATABASE_SSL: bool = True

    # File upload
    UPLOAD_DIR: str = str(Path(__file__).resolve().parent.parent.parent / "uploads")
    AVATAR_MAX_SIZE: int = 5 * 1024 * 1024  # 5 MB
    AVATAR_ALLOWED_CONTENT_TYPES: set[str] = {"image/jpeg", "image/png", "image/webp"}
    PHOTO_MAX_SIZE: int = 10 * 1024 * 1024  # 10 MB
    PHOTO_ALLOWED_CONTENT_TYPES: set[str] = {"image/jpeg", "image/png", "image/webp"}

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _parse_cors_origins(cls, v: object) -> list[str]:
        """Parse CORS_ORIGINS — supports JSON array or comma-separated string.
        Always merges _CORE_CORS_ORIGINS to ensure essential domains are never
        accidentally removed by a stale environment variable on platforms like Render."""
        parsed: list[str]
        if isinstance(v, list):
            parsed = v
        elif isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                import json

                try:
                    parsed = json.loads(v)
                except json.JSONDecodeError:
                    parsed = [origin.strip() for origin in v.split(",") if origin.strip()]
            else:
                parsed = [origin.strip() for origin in v.split(",") if origin.strip()]
        else:
            raise ValueError(f"CORS_ORIGINS must be a JSON array or comma-separated string, got {type(v)}")

        # 合并核心域名 — 去重并保持核心域名在前
        merged: list[str] = list(_CORE_CORS_ORIGINS)
        for origin in parsed:
            if origin not in merged:
                merged.append(origin)
        return merged


settings = Settings()
