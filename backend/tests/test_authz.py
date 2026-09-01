import pytest

from app.authz import (
    CAPABILITIES,
    MANAGE_MEMBERS,
    MANAGE_SPRINTS,
    READ,
    WRITE_CONTENT,
    WRITE_WORKFLOW,
    can,
)
from app.deps import ProjectContext, require_capability
from app.errors import APIError
from app.models.constants import PROJECT_ROLES


def test_capability_roles_match_the_schema_roles():
    assert set(CAPABILITIES) == set(PROJECT_ROLES)


@pytest.mark.parametrize(
    "role, capability, expected",
    [
        ("READER", READ, True),
        ("READER", WRITE_CONTENT, False),
        ("WRITER", WRITE_CONTENT, True),
        ("WRITER", WRITE_WORKFLOW, False),
        ("WRITER_WORKFLOW", WRITE_WORKFLOW, True),
        ("WRITER_WORKFLOW", MANAGE_SPRINTS, False),
        ("MANAGER", MANAGE_SPRINTS, True),
        ("MANAGER", MANAGE_MEMBERS, False),
        ("OWNER", MANAGE_MEMBERS, True),
        ("nonsense", READ, False),
    ],
)
def test_can(role, capability, expected):
    assert can(role, capability) is expected


def _ctx(role: str) -> ProjectContext:
    return ProjectContext(project=None, membership=None, role=role)  # type: ignore[arg-type]


def test_require_capability_passes_the_context_through_when_permitted():
    dep = require_capability(READ)
    ctx = _ctx("READER")
    assert dep(ctx=ctx) is ctx


def test_require_capability_raises_403_when_missing():
    with pytest.raises(APIError) as exc:
        require_capability(MANAGE_MEMBERS)(ctx=_ctx("WRITER"))
    assert exc.value.status_code == 403
    assert exc.value.code == "forbidden"
