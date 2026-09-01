# API Conventions — V0.1 Secure Core (Frozen)

**Status:** **FROZEN** (2026-09-01). Changes now require an explicit amendment.
**Depends on:** the frozen domain model (`docs/design/domain-model-v0.1.md`)
**Scope:** conventions only. No endpoint bodies, no Cognito, no authorization
logic, no CRUD in this document.
**Implementation:** Phase 0B.2.

Stack: FastAPI + Pydantic v2 + SQLAlchemy 2.0 (sync).

Guiding rule: the least reasonable amount of code and abstraction. Everything
below that isn't a concrete need for V0.1 is deliberately left out (see §10).

### Decisions locked at freeze

| # | Decision |
|---|---|
| 1 | Task item routes are **fully project-nested**: `/api/v1/projects/{project_key}/tasks/{task_key}`. No flat task route. |
| 2 | Archiving a task requires **`WRITE_WORKFLOW`**. |
| 3 | Soft archive (`DELETE` on project / task) returns **`200`** with the updated, archived resource. |
| 4 | `limit > 100` returns **`422`** — no silent clamping. |
| 5 | Error responses use the custom **`{"error": {"code", "message"}}`** envelope. |
| 6 | `GET /projects/{key}/activity` requires only **`READ`**. |
| 7 | Member responses embed a lightweight summary — **`user_id`, `display_name`, `role`** only. **`email` is not exposed** by any V0.1 response. |
| 8 | JSON is **`snake_case`**; no alias / camelCase layer. |

---

## 1. Route structure

Base path: **`/api/v1`**. One version, expressed only as the path prefix.

Identifiers in the path:
- **Project** → project `key` (`SOT`)
- **Task** → task `key` (`SOT-124`) — self-describing, globally unique
- **Sprint** → `id` (UUID) — no human key exists
- **Member** → the member's `user_id` (UUID)

Every resource route is **nested under its project**. Task items are addressed by
their key within the project path — `[[SOT-124]]`-style deep links resolve to
`/api/v1/projects/SOT/tasks/SOT-124`.

```
# Projects
GET    /api/v1/projects                          list projects the caller is a member of
POST   /api/v1/projects                          create (caller becomes OWNER)
GET    /api/v1/projects/{project_key}
PATCH  /api/v1/projects/{project_key}            name / description only
DELETE /api/v1/projects/{project_key}            archive (soft)

# Members
GET    /api/v1/projects/{project_key}/members
POST   /api/v1/projects/{project_key}/members            { user_id, role }
PATCH  /api/v1/projects/{project_key}/members/{user_id}  { role }
DELETE /api/v1/projects/{project_key}/members/{user_id}

# Sprints
GET    /api/v1/projects/{project_key}/sprints
POST   /api/v1/projects/{project_key}/sprints
GET    /api/v1/projects/{project_key}/sprints/{sprint_id}
PATCH  /api/v1/projects/{project_key}/sprints/{sprint_id}   incl. status transitions
DELETE /api/v1/projects/{project_key}/sprints/{sprint_id}   hard delete, empty PLANNED only

# Tasks
GET    /api/v1/projects/{project_key}/tasks              list (project-scoped)
POST   /api/v1/projects/{project_key}/tasks              create
GET    /api/v1/projects/{project_key}/tasks/{task_key}
PATCH  /api/v1/projects/{project_key}/tasks/{task_key}   content / status / sprint / assignee
DELETE /api/v1/projects/{project_key}/tasks/{task_key}   archive (soft)

# Activity (read-only)
GET    /api/v1/projects/{project_key}/activity

# Current user
GET    /api/v1/me
```

- No `dashboard` endpoint in V0.1 (aggregation is later). The existing
  `app/api/{dashboard,sprints,tasks}.py` stub routers are replaced.
- Trailing slashes: not used; `redirect_slashes=False`.
- `POST` creates return `201` with the resource body and a `Location` header.
- `POST …/members` takes an existing user's `user_id` (a user row exists only
  after that person has authenticated at least once). Invitation-by-email is
  V0.2; until then this is the only way to grant membership.

**Path-param validation** (FastAPI `Path(pattern=...)`):
- `project_key`: `^[A-Z][A-Z0-9]{1,9}$`
- `task_key`: `^[A-Z][A-Z0-9]{1,9}-[1-9][0-9]*$` (split into project key + number)
- `sprint_id`, `user_id`: UUID

A syntactically invalid identifier → `422`. A well-formed identifier that does
not resolve (or that the caller may not see) → `404` (see §4).

For task routes, the `task_key` prefix must equal the `{project_key}` in the same
path; a mismatch (e.g. `/projects/SOT/tasks/FG-3`) → `404`, not `422` — it is
treated as "no such task in this project".

---

## 2. Request / response schemas

- **Pydantic v2**, three schemas per mutable resource: `XCreate`, `XUpdate`,
  `XRead`. `XUpdate` has every field optional (PATCH). No shared generic base
  beyond `pydantic.BaseModel`.
- **JSON is `snake_case`** — same names as the columns and the Python code. No
  alias/camelCase layer. (The React client adapts; it is being reworked anyway.)
- **No response envelope for a single resource** — return the object directly.
- **Collections return a page object**: `{ "items": [...], "total": <int>,
  "limit": <int>, "offset": <int> }` (`Page[T]`, §5).
- **Timestamps**: RFC 3339 / ISO 8601, UTC, `Z` suffix
  (`2026-09-01T12:34:56Z`). Dates (`sprint.start_date/end_date`): `YYYY-MM-DD`.
- **Nulls are included** in responses, never omitted.
- **`XRead` never exposes** internal-only columns: `projects.task_sequence`,
  `users.cognito_sub`. **`users.email` is also not exposed** by any V0.1
  response (decision 7) — add it to a schema only when a screen needs it.

### Field lists

| Schema | Fields |
|---|---|
| `ProjectCreate` | `key`, `name`, `description?` |
| `ProjectUpdate` | `name?`, `description?` |
| `ProjectRead` | `id`, `key`, `name`, `description`, `created_by`, `archived_at`, `created_at`, `updated_at` |
| `MemberCreate` | `user_id`, `role` (not `OWNER`) |
| `MemberUpdate` | `role` (not `OWNER`, not on the owner row) |
| `MemberRead` | `user_id`, `display_name`, `role`, `created_at`, `updated_at` (`display_name` joined from `users`; no `email`) |
| `SprintCreate` | `name`, `goal?`, `start_date?`, `end_date?`, `status?` (default `PLANNED`) |
| `SprintUpdate` | `name?`, `goal?`, `start_date?`, `end_date?`, `status?` |
| `SprintRead` | `id`, `project_id`, `name`, `goal`, `status`, `start_date`, `end_date`, `created_at`, `updated_at` |
| `TaskCreate` | `title`, **`story_points`** (required, `> 0`), `description?`, `priority?` (default 3), `sprint_id?` (null ⇒ Backlog), `assignee_id?` |
| `TaskUpdate` | `title?`, `description?`, `story_points?` (`> 0`), `priority?`, `status?`, `sprint_id?` (nullable), `assignee_id?` (nullable) |
| `TaskRead` | `id`, `key`, `project_id`, `number`, `title`, `description`, `status`, `priority`, `story_points`, `sprint_id`, `assignee_id`, `archived_at`, `created_by`, `created_at`, `updated_at` |
| `UserRead` (`/me`) | `id`, `display_name`, `created_at` (no `email` in V0.1) |
| `ActivityEventRead` | `id`, `project_id`, `actor_user_id`, `entity_type`, `entity_id`, `event_type`, `payload`, `created_at` |

### PATCH semantics

- A field **absent** from the request body is unchanged.
- A field present with value `null` sets it to null, **only** where the column is
  nullable: `task.sprint_id`, `task.assignee_id`, `task.description`,
  `sprint.goal`, `sprint.start_date`, `sprint.end_date`, `project.description`.
- Implementation: `model_dump(exclude_unset=True)` → apply the resulting dict.
- Immutable via the API: `project.key`, any `id`, `task.number`,
  `task.project_id`, `*.created_by`, `*.created_at`, `*_at` archive timestamps
  (archive is its own verb — §8).
- No optimistic concurrency (ETag / `If-Match`) in V0.1 — last write wins.

---

## 3. Identifier usage

| Context | Project | Task | Sprint | User / member |
|---|---|---|---|---|
| URL path | `key` | `project_key` + `key` (nested) | `id` (UUID) | `user_id` (UUID) |
| Request body references | — | — | `sprint_id` (UUID) | `assignee_id`, `user_id` (UUID) |
| Response body | `id` + `key` | `id` + `key` | `id` | `user_id` |

- Bodies **reference other resources by UUID**, never by key. Keys appear only in
  project/task URL paths (and, later, in link payloads such as `[[SOT-142]]`).
- `TaskRead.key` and `TaskRead.number` are **derived** server-side
  (`project.key || '-' || number`) — not stored (frozen model P4).
- "In the Backlog" is derived from `sprint_id is null`; there is no `is_backlog`
  field — the client checks `sprint_id`.

---

## 4. Errors and status codes

### Envelope

One shape for every error the API raises:

```json
{ "error": { "code": "active_sprint_exists", "message": "Project SOT already has an active sprint." } }
```

Validation errors add a `fields` array:

```json
{ "error": { "code": "validation_error", "message": "Request validation failed.",
             "fields": [ { "loc": "body.story_points", "msg": "Input should be greater than 0" } ] } }
```

Implementation cost: one `APIError(status_code, code, message)` exception + two
exception handlers (`APIError`, `RequestValidationError`) in `app/errors.py`.
FastAPI's default `{"detail": ...}` is not used for our responses.

### Status codes

| Code | When |
|---|---|
| `200` | `GET`, `PATCH`, and **soft-`DELETE` (archive) — body is the updated, archived resource** |
| `201` | `POST` create (+ `Location`) |
| `204` | hard `DELETE` (empty PLANNED sprint only) |
| `401` `unauthenticated` | missing / invalid / expired token |
| `403` `forbidden` | authenticated **and a member of the project**, but the role lacks the capability for this action |
| `404` `not_found` | resource does not exist **or** the caller is not a member of its project (existence is hidden) |
| `409` `<specific>` | rule violation — see below |
| `422` `validation_error` | body / query / path fails schema validation, including `limit > 100` |
| `500` `internal_error` | unhandled |

**The 403 vs 404 rule (frozen decision):**
- Not a member of the project → **404** for every route about or under it. The
  response never reveals whether the project/sprint/task exists.
- A member whose role lacks the capability → **403**.

### `409` codes (V0.1)

| code | situation |
|---|---|
| `duplicate_project_key` | `POST /projects` with an existing (incl. archived) key |
| `active_sprint_exists` | activating / creating a second `ACTIVE` sprint in a project |
| `sprint_has_tasks` | `DELETE` a sprint that still has tasks |
| `sprint_not_deletable` | `DELETE` a sprint that is not `PLANNED` |
| `member_has_assigned_tasks` | removing a member who is still a task assignee |
| `owner_role_forbidden` | adding or changing a membership to `OWNER` |
| `archived` | any mutation targeting an archived project or archived task |

Cross-row cases that the DB would otherwise raise as `IntegrityError` are
pre-checked in the endpoint and returned as the codes above (or as a `422` field
error for `assignee_id` / `sprint_id` that don't belong to the project:
`code: "not_a_project_member"` / `"sprint_not_in_project"`).

---

## 5. Pagination, filtering, sorting

### Pagination

- `?limit=` (default **50**) and `?offset=` (default `0`).
  `limit < 1`, `limit > 100`, or `offset < 0` → **`422`** (`Query(ge=1, le=100)` /
  `Query(ge=0)`). No silent clamping.
- Every collection response is `Page[T]`:
  `{ "items": [...], "total": <int>, "limit": <int>, "offset": <int> }`.
  `total` is the unpaginated count (one extra `COUNT(*)`).
- Delivered by one dependency `PageParams` and one helper
  `paginate(stmt, params) -> (items, total)`.

### Filtering — simple, exact-match, AND-combined, whitelisted per endpoint

| Endpoint | filters |
|---|---|
| `GET /projects` | `include_archived` (bool, default `false`) |
| `GET /projects/{k}/members` | `role` |
| `GET /projects/{k}/sprints` | `status` |
| `GET /projects/{k}/tasks` | `status`, `assignee_id`, `sprint_id`, `in_backlog` (bool), `include_archived` (default `false`) |
| `GET /projects/{k}/activity` | `entity_type`, `event_type` |

- `sprint_id` and `in_backlog=true` are mutually exclusive → `422` if both given.
- No text search, ranges, `OR`, or multi-value filters in V0.1.
- Filters are a few inline `if value is not None: stmt = stmt.where(...)` per
  endpoint — no filter framework.

### Sorting

- `?sort=field` (ascending) or `?sort=-field` (descending). **One field only.**
- Sortable fields are whitelisted per endpoint (`{name: column}` dict); an
  unknown field → `422`.
- Defaults: projects `key`, members `role`, sprints `-created_at`,
  tasks `number`, activity `-created_at`.
- One helper `apply_sort(stmt, sort, allowed) -> stmt`.

---

## 6. Authentication & authorization dependency interfaces

Design-only. These are the contracts endpoints will be written against;
implementations land in Phase 0B.2. No policy engine — a role→capability dict and
small dependencies.

```python
# app/deps.py  — signatures only

def get_db() -> Iterator[Session]:
    """One SQLAlchemy session and one transaction per request (see §7)."""

def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Verify the bearer token, JIT-provision by cognito_sub, return the User.
    Raises 401 (`unauthenticated`) on missing/invalid/expired token."""

@dataclass
class ProjectContext:
    project: Project
    membership: ProjectMembership
    role: str

def get_project_context(
    project_key: str = Path(pattern=PROJECT_KEY_RE),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectContext:
    """Load the project by key and the caller's membership.
    Raises 404 (`not_found`) if the project does not exist OR the caller has no
    membership — the two are indistinguishable to the client."""

@dataclass
class TaskContext(ProjectContext):
    task: Task

def get_task_context(
    project_key: str = Path(pattern=PROJECT_KEY_RE),
    task_key: str = Path(pattern=TASK_KEY_RE),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskContext:
    """Resolve project (by key) + membership + task (by key, within that project).
    Raises 404 if the project/task is missing, the caller is not a member, or the
    `task_key` prefix does not match `project_key`."""

def require_capability(capability: str) -> Callable[[ProjectContext], ProjectContext]:
    """Dependency factory. Returns a dependency that passes the context through
    if `can(ctx.role, capability)` else raises 403 (`forbidden`)."""
```

```python
# app/authz.py  — the entire authorization model

READ            = "read"
WRITE_CONTENT   = "write_content"     # create/edit task & sprint content
WRITE_WORKFLOW  = "write_workflow"    # change task status
MANAGE_SPRINTS  = "manage_sprints"    # create/activate/close sprints, add/remove tasks
ASSIGN          = "assign"            # set task assignee
MANAGE_MEMBERS  = "manage_members"    # add/remove members, change roles, archive project

CAPABILITIES: dict[str, frozenset[str]] = {
    "READER":          frozenset({READ}),
    "WRITER":          frozenset({READ, WRITE_CONTENT}),
    "WRITER_WORKFLOW": frozenset({READ, WRITE_CONTENT, WRITE_WORKFLOW}),
    "MANAGER":         frozenset({READ, WRITE_CONTENT, WRITE_WORKFLOW,
                                  MANAGE_SPRINTS, ASSIGN}),
    "OWNER":           frozenset({READ, WRITE_CONTENT, WRITE_WORKFLOW,
                                  MANAGE_SPRINTS, ASSIGN, MANAGE_MEMBERS}),
}

def can(role: str, capability: str) -> bool:
    return capability in CAPABILITIES.get(role, frozenset())
```

**Capability required per route:**

| Route | capability |
|---|---|
| `POST /projects` | *(authenticated only — no project yet)* |
| `GET` anything (incl. `…/activity`) | `READ` |
| `PATCH /projects/{k}` | `MANAGE_MEMBERS` |
| `DELETE /projects/{k}` (archive) | `MANAGE_MEMBERS` |
| `POST/PATCH/DELETE /projects/{k}/members…` | `MANAGE_MEMBERS` |
| `POST/PATCH/DELETE …/sprints…` | `MANAGE_SPRINTS` |
| `POST …/tasks` | `WRITE_CONTENT` |
| `PATCH …/tasks/{key}` — `title/description/story_points/priority` | `WRITE_CONTENT` |
| `PATCH …/tasks/{key}` — `status` | `WRITE_WORKFLOW` |
| `PATCH …/tasks/{key}` — `sprint_id` | `MANAGE_SPRINTS` |
| `PATCH …/tasks/{key}` — `assignee_id` | `ASSIGN` |
| `DELETE …/tasks/{key}` (archive) | `WRITE_WORKFLOW` |

A single `PATCH …/tasks/{key}` request that touches fields in several capability
groups requires **all** the corresponding capabilities.

`GET /projects` and `GET /me` need only `get_current_user`. Everything else
project-scoped composes `get_project_context` / `get_task_context` +
`require_capability(...)`.

---

## 7. Transaction boundaries

- **One session, one transaction, per HTTP request**, owned by `get_db`:

  ```python
  def get_db() -> Iterator[Session]:
      with SessionLocal.begin() as session:   # commit on clean exit, rollback on exception
          yield session
  ```

  `SessionLocal` already has `expire_on_commit=False`, so ORM objects remain
  usable for response serialization after the commit.

- **Endpoints never call `commit()` / `rollback()`.** Service functions
  (`create_project`, `create_task`, …) never commit either — they add to the
  session; `get_db` commits once at the end.
- A request that does several writes (e.g. `POST /projects` → project + OWNER
  membership + two activity events) is therefore atomic for free. `activity_events`
  rows are always committed in the same transaction as the change they describe
  (frozen rule A1).
- Any exception (including `APIError` / `HTTPException`) unwinds through `get_db`,
  triggering `rollback()` **before** the exception handler formats the response.
- `_next_task_number`'s `UPDATE … RETURNING` row lock is held until that
  request's commit — short, and accepted in DEC-7.
- Read-only requests run in the same transaction; harmless, and keeps one code
  path.

---

## 8. Archive behavior

- **Soft archive = `DELETE`** on projects and tasks (decision 3). It sets
  `archived_at = now()` and returns **`200` with the updated, archived resource**
  (`ProjectRead` / `TaskRead` with `archived_at` populated). Re-archiving an
  already-archived resource is an idempotent `200` returning the same body.
- Task archive requires **`WRITE_WORKFLOW`** (decision 2); project archive
  requires `MANAGE_MEMBERS`.
- Archived resources **remain readable**:
  `GET /api/v1/projects/{project_key}/tasks/{task_key}` and
  `GET /api/v1/projects/{project_key}` return `200` with `archived_at` populated.
- **List endpoints exclude archived rows by default**; `?include_archived=true`
  includes them.
- Archived project or task is **read-only**: any mutating request targeting it —
  `PATCH`, child `POST`, or a `PATCH`/`DELETE` on a task inside an archived
  project — returns **`409 archived`**.
- Archiving a **project does not** touch its children — no status rewrites, no
  `archived_at` propagation (frozen rule P6). Its tasks/sprints simply become
  unreachable for mutation because their project is archived.
- **Un-archive is not in V0.1.** `archived_at` is never settable through `PATCH`.
  A `POST /…/unarchive` verb can be added later.
- **Sprints are not archived.** `DELETE` on a sprint is a *hard* delete, allowed
  only when the sprint is `PLANNED` **and** has no tasks (→ `204`); otherwise
  `409` (`sprint_not_deletable` / `sprint_has_tasks`). Sprints otherwise move
  `PLANNED → ACTIVE → CLOSED` via `PATCH … {status}`.

---

## 9. Proposed module layout (guidance, not frozen)

```
backend/app/
  main.py            app, router include, exception handlers, CORS
  errors.py          APIError + 2 handlers + error envelope
  deps.py            get_db, get_current_user, get_project_context,
                     get_task_context, require_capability
  authz.py           capability constants, CAPABILITIES, can()
  pagination.py      PageParams dep, Page[T], paginate(), apply_sort()
  schemas/           project.py sprint.py task.py membership.py user.py
                     activity.py common.py   (Pydantic)
  api/               projects.py members.py sprints.py tasks.py
                     activity.py me.py
                     (routers; all project-scoped ones mount under
                      /api/v1/projects/{project_key}; replace current stubs)
  services/          existing create_project / create_task / record_event,
                     plus create_sprint, add_member, … as endpoints need them
```

---

## 10. Deliberately excluded from V0.1

- Response envelopes for single resources; HATEOAS / links.
- Generic CRUD base classes, a repository layer, a serializer/alias layer.
- A filter or query DSL; multi-field sort; cursor pagination.
- ETag / `If-Match` / optimistic concurrency.
- Field-level partial responses (`?fields=`), sparse fieldsets, `?expand=`.
- API keys, rate limiting, request IDs/correlation headers (add with observability
  later).
- Bulk endpoints, PUT (only PATCH), PATCH JSON-Patch/merge-patch media types.
- `dashboard` / analytics endpoints, invitations, comments, attachments,
  dependencies, tags, notifications — later releases.

---

## 11. Review questions — all resolved at freeze

Every open question from the proposal has been decided (see the table at the top):
task routes fully nested (1); task archive = `WRITE_WORKFLOW` (2); soft archive →
`200` + resource (3); `limit > 100` → `422` (4); custom error envelope (5);
activity read = `READ` (6); member summary = `user_id` + `display_name` + `role`,
no `email` (7); `snake_case` JSON (8).

No open questions remain. This document is frozen.

---

## 12. Next step

Phase 0B.2 implementation, in dependency order:
`get_db` + `errors.py` + `pagination.py` + `authz.py` + the auth/authz
dependencies in `deps.py` → Pydantic schemas → routers, endpoint by endpoint,
each with tests. Cognito JWT verification is the one external piece and can be
stubbed behind `get_current_user` until wired.
