"""The whole V0.1 authorization model: a project role maps to a capability set.

Deliberately not a policy engine — a dict and one lookup function.
"""

READ = "read"
WRITE_CONTENT = "write_content"      # create / edit task & sprint content
WRITE_WORKFLOW = "write_workflow"    # change task status, archive a task
MANAGE_SPRINTS = "manage_sprints"    # create / activate / close sprints, move tasks
ASSIGN = "assign"                    # set a task's assignee
MANAGE_MEMBERS = "manage_members"    # members, roles, archive the project

CAPABILITIES: dict[str, frozenset[str]] = {
    "READER": frozenset({READ}),
    "WRITER": frozenset({READ, WRITE_CONTENT}),
    "WRITER_WORKFLOW": frozenset({READ, WRITE_CONTENT, WRITE_WORKFLOW}),
    "MANAGER": frozenset(
        {READ, WRITE_CONTENT, WRITE_WORKFLOW, MANAGE_SPRINTS, ASSIGN}
    ),
    "OWNER": frozenset(
        {READ, WRITE_CONTENT, WRITE_WORKFLOW, MANAGE_SPRINTS, ASSIGN, MANAGE_MEMBERS}
    ),
}


def can(role: str, capability: str) -> bool:
    return capability in CAPABILITIES.get(role, frozenset())
