import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.database import engine
from app.models.photo import Photo  # noqa: F401 — 确保模型被导入以便建表
from app.models.user import Base

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables if DB is reachable. Shutdown: dispose engine."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.warning(f"Database unavailable during startup: {e}")
        logger.warning("The API will start, but DB-dependent endpoints will fail")
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
    allow_origins=["http://localhost:5175"],
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
