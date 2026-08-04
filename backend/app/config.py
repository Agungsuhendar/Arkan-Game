from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Arkan Educational Game API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "arkan_super_secret_jwt_key_2026_education_app"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://arkan_user:arkan_password@localhost:5440/arkan_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minio_admin"
    MINIO_SECRET_KEY: str = "minio_password"
    MINIO_BUCKET_NAME: str = "arkan-assets"
    MINIO_SECURE: bool = False

    # AI Integration
    GEMINI_API_KEY: Optional[str] = ""

    class Config:
        case_sensitive = True
        env_file = ".env"  # baca dari file .env jika ada
        env_file_encoding = "utf-8"

settings = Settings()
