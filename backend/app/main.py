import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.database import engine
from app.models.album import Album  # noqa: F401 — 确保模型被导入以便建表
from app.models.photo import Photo  # noqa: F401 — 确保模型被导入以便建表
from app.models.user import Base

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables if DB is reachable. Shutdown: dispose engine."""
    # Ensure all model classes are imported so Base.metadata knows about them
    # (imports at module level above serve this purpose via noqa F401)

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables verified/created successfully")
    except Exception:
        logger.exception("Database initialization failed — the server may not work correctly")
    yield
    await engine.dispose()


app = FastAPI(
    title="Family Website API",
    description="家庭门户网站后端接口",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount v1 routes
app.include_router(v1_router)

# Mount uploaded files — ensure the directory exists
_upload_dir = Path(settings.UPLOAD_DIR)
_upload_dir.mkdir(parents=True, exist_ok=True)
(_upload_dir / "avatars").mkdir(parents=True, exist_ok=True)
(_upload_dir / "photos").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_upload_dir)), name="uploads")
