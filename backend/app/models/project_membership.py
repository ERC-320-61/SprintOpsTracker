import uuid

from sqlalchemy import CheckConstraint, ForeignKey, Index, Text, Uuid, text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin
from app.models.constants import PROJECT_ROLES, sql_in_list


class ProjectMembership(TimestampMixin, Base):
    __tablename__ = "project_memberships"

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey(
            "projects.id", ondelete="RESTRICT", name="fk_project_memberships_project"
        ),
        primary_key=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey(
            "users.id", ondelete="RESTRICT", name="fk_project_memberships_user"
        ),
        primary_key=True,
    )
    role: Mapped[str] = mapped_column(Text, nullable=False)

    __table_args__ = (
        CheckConstraint(
            sql_in_list("role", PROJECT_ROLES), name="ck_project_memberships_role"
        ),
        # At most one OWNER per project. "Exactly one" is guaranteed by the
        # project-creation transaction, not the database.
        Index(
            "uq_project_one_owner",
            "project_id",
            unique=True,
            postgresql_where=text("role = 'OWNER'"),
        ),
        Index("ix_project_memberships_user", "user_id"),
    )
