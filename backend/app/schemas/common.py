from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    """Base for response schemas populated from SQLAlchemy ORM objects."""

    model_config = ConfigDict(from_attributes=True)
