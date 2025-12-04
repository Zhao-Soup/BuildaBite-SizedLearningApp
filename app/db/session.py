from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# Use a slightly different engine configuration for SQLite so it
# works cleanly in a local single-process dev setup.
if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url, future=True, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(settings.database_url, future=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

Base = declarative_base()
