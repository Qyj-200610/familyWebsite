from pathlib import Path

from pydantic_settings import BaseSettings

# Resolve .env relative to this config file (backend/.env), with CWD fallback
_ENV_CANDIDATES = [
    Path(__file__).resolve().parent.parent.parent / ".env",  # backend/.env
    Path(".env"),  # CWD/.env (fallback)
]
_ENV_FILE = next((p for p in _ENV_CANDIDATES if p.is_file()), _ENV_CANDIDATES[0])


class Settings(BaseSettings):
    """Application settings loaded from .env and environment variables."""

    DATABASE_URL: str = "mysql+asyncmy://root:password@localhost:3306/family_website"
    JWT_SECRET: str = "dev-secret-key-do-not-use-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours

    model_config = {
        "env_file": str(_ENV_FILE),
        "env_file_encoding": "utf-8",
    }


settings = Settings()
