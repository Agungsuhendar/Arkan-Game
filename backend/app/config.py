import logging
from typing import List, Optional
from pydantic import model_validator
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

INSECURE_SECRET_KEYS = {
    "arkan_super_secret_jwt_key_2026_education_app",
    "change_this_to_a_secure_random_32_character_key",
    "secret",
    "secretkey",
}

class Settings(BaseSettings):
    PROJECT_NAME: str = "Arkan Educational Game API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    ENABLE_DOCS: bool = False
    SEED_DEFAULT_DATA: bool = False

    # Security & Auth
    SECRET_KEY: str = "arkan_super_secret_jwt_key_2026_education_app"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALLOWED_ORIGINS: str = "https://mini.arsaku.web.id,http://localhost:3000,http://localhost:8080"

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

    @property
    def cors_origins(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return []
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_production_environment(self) -> "Settings":
        if self.ENVIRONMENT.lower() == "production":
            if not self.SECRET_KEY or self.SECRET_KEY in INSECURE_SECRET_KEYS or len(self.SECRET_KEY) < 16:
                raise ValueError(
                    "CRITICAL SECURITY RISK: Insecure or default SECRET_KEY detected in production mode! "
                    "Please specify a secure SECRET_KEY in your .env file."
                )
            if self.MINIO_SECRET_KEY in {"minio_password", "change_this_to_a_secure_minio_password"}:
                logger.warning("SECURITY WARNING: MinIO is using a default or placeholder password in production!")
        return self

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

