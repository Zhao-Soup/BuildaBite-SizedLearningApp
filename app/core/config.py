from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Bite-Sized Learning API"
    environment: str = "development"
    backend_cors_origins: list[str] = ["http://localhost:3000"]

    # Default to a simple local SQLite database so the app works out of the box.
    # You can override this with a PostgreSQL URL via the DATABASE_URL env var.
    database_url: str = "sqlite:///./app.db"

    jwt_secret: str = "dev-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_exp_minutes: int = 60 * 24

    openai_api_key: str | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
