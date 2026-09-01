from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration, sourced from the environment (or a local .env)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # SQLAlchemy URL for the primary PostgreSQL database.
    database_url: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/sprintops"
    )


settings = Settings()
