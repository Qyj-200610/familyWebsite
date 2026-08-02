import ssl

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

_connect_args: dict = {}
if settings.DATABASE_SSL:
    # TiDB Cloud uses Let's Encrypt — system CA certs should trust it.
    # Falls back gracefully: if DATABASE_SSL_CA_PATH is set in .env, use that as the CA bundle.
    ca_path: str | None = getattr(settings, "DATABASE_SSL_CA_PATH", None)
    ssl_ctx = ssl.create_default_context(cafile=ca_path) if ca_path else ssl.create_default_context()
    _connect_args["ssl"] = ssl_ctx

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=_connect_args or {},
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """Dependency that provides an async database session per request."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
