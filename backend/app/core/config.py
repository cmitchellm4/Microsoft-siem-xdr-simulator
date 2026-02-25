from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    DATABASE_URL: str = "postgresql://msiem:msiem_dev_password@localhost:5432/msiem_simulator"

    REDIS_URL: str = "redis://localhost:6379"

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    SCENARIOS_PATH: str = "./scenarios"
    DATA_PATH: str = "./data"

    class Config:
        env_file = ".env"


settings = Settings()