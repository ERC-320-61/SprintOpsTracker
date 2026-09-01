import uuid

from sqlalchemy import Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    # Authoritative external identity (Cognito `sub`). The only identity key.
    cognito_sub: Mapped[str] = mapped_column(Text, nullable=False)

    # Mutable contact/profile data. Not an identity key: nullable, not unique.
    email: Mapped[str | None] = mapped_column(Text)
    display_name: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        UniqueConstraint("cognito_sub", name="uq_users_cognito_sub"),
    )
