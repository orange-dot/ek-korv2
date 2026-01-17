"""Application configuration from environment variables."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # App
    secret_key: str = "dev-secret-key-change-in-production"
    database_url: str = "sqlite:///./portal.db"
    debug: bool = False

    # JWT
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    algorithm: str = "HS256"

    # Email
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""

    # App URLs
    app_url: str = "http://localhost:5173"
    invite_expire_days: int = 7

    # Superadmin (created on first run)
    superadmin_email: str = "admin@elektrokombinacija.com"
    superadmin_password: str = "changeme123"
    superadmin_name: str = "Admin"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
