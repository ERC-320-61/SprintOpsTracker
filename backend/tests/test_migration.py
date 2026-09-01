from alembic import command

from tests.conftest import _alembic_config


def test_models_match_migration(engine):
    """`alembic check` raises if the models and the migration have drifted."""
    command.check(_alembic_config())
