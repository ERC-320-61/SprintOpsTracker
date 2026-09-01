# Domain Model — V0.1 Secure Core (Frozen Schema Specification)

**Status:** **FROZEN** (2026-09-01) — approved after three decision rounds. Changes
now require an explicit amendment.
**Phase:** 0B.1 — Freeze the PostgreSQL domain model and core data conventions
**Scope:** `users`, `projects`, `project_memberships`, `sprints`, `tasks`,
`activity_events`.
**Implementation:** branch `feat/v01-schema` (Alembic migration + SQLAlchemy
models + constraint tests + seed).

Authoritative inputs: the confirmed Phase 0B.1 domain rules, three decision
rounds, and *SprintOps-Tracker Project Charter v2.0*.

**Final amendment (2026-09-01):** `users.email` is `NULL` (was `NOT NULL`). No
domain rule requires every identity to have an email; `cognito_sub` is the only
identity key. Any "email required" rule belongs in Cognito/application config,
not the database.

---

## 1. Resolved decisions

| # | Outcome |
|---|---|
| **DEC-1 — owner** | Creator **is** the owner. `projects.created_by` is immutable provenance. The creator also gets an `OWNER` `project_memberships` row, created in the same transaction as the Project. Ownership is **not transferable** in V0.1 and the `OWNER` membership **cannot be removed or role-changed** in V0.1. The partial unique index guarantees **at most one** `OWNER` per Project; that **exactly one** exists is a project-creation invariant guaranteed by application logic and tests — **no database trigger**. |
| **DEC-2 — permissions** | `role` preset enum on membership, mapped to capabilities in application code. No capability table. Presets: `OWNER`, `MANAGER`, `WRITER_WORKFLOW`, `WRITER`, `READER`. `WRITER` (content) is distinct from `WRITER_WORKFLOW` (may also change workflow status). |
| **DEC-3 — assignee** | A Task's assignee must be a current member of the Task's Project, enforced by a composite FK `tasks (project_id, assignee_id) → project_memberships (project_id, user_id)`. Removing a member is **blocked** (`RESTRICT`) while any Task is still assigned to that user; the application must explicitly unassign or reassign those Tasks first. Assignments are **never** auto-nulled. Assignment never grants authorization. |
| **DEC-4 — keys** | `projects.key`: globally unique, uppercase, immutable, stays reserved after archival. `CHECK (key ~ '^[A-Z][A-Z0-9]{1,9}$')`. Task key is derived `project.key || '-' || task.number` and **not stored**. |
| **DEC-5 — priority** | `tasks.priority`: `SMALLINT NOT NULL DEFAULT 3`, `CHECK (priority BETWEEN 1 AND 5)`, 1 = highest urgency. |
| **DEC-6 — estimation** | `tasks.story_points`: `SMALLINT` nullable, `CHECK (story_points IS NULL OR story_points > 0)`. `NULL` = unestimated. No `NUMERIC`; no Fibonacci set in PostgreSQL. |
| **DEC-7 — numbering** | Per-Project, monotonic, gaps acceptable, never recycled. Allocated from `projects.task_sequence` (counter kept on the Project row for V0.1 — brief serialisation of concurrent Task creation for one Project is acceptable; no separate counter table). |
| **status** | `tasks.status` default `TODO`; values `TODO, IN_PROGRESS, BLOCKED, DONE`. `BACKLOG` is not a status. Backlog = `tasks.sprint_id IS NULL` (derived). Changing `sprint_id` never changes `status`. |
| **sprint** | `sprints.status` values `PLANNED, ACTIVE, CLOSED`, default `PLANNED`. At most one `ACTIVE` Sprint per Project (partial unique index). No Sprint-name uniqueness. Deletion: application may delete an **empty `PLANNED`** Sprint; a Sprint with Tasks is blocked by `RESTRICT`; `ACTIVE`/`CLOSED` Sprints — the application rejects deletion outright. Historical Sprint assignments are never silently removed. |
| **archival** | `projects.archived_at`, `tasks.archived_at` (nullable). Archiving a Project does **not** rewrite child statuses and does **not** propagate `archived_at` to children. Projects and historical Sprints are archived/closed, not hard-deleted. |
| **deletes** | **No `ON DELETE CASCADE`, no `ON DELETE SET NULL` anywhere.** Every FK is `ON DELETE RESTRICT`. |
| **enums** | `text` + `CHECK (... IN (...))`. No native `ENUM`. |
| **updated_at** | Plain `timestamptz` column, maintained by SQLAlchemy `onupdate`. No PostgreSQL trigger. |
| **extensions / identity** | None (`citext`, `pgcrypto` not used). UUIDs generated in Python (`uuid.uuid4()`), no column default. `users.cognito_sub` is `NOT NULL UNIQUE` and is the **authoritative** external identity (JIT-provisioned on first authenticated request). No hard-delete path for users. |
| **users.email** | `NULL`, **no uniqueness constraint**. Mutable contact/profile data; `cognito_sub` is the only identity key. |
| **DEC-6b — composite FKs** | Both composite relationships (Task→Sprint, Task→assignee/membership) are modelled with explicit SQLAlchemy `ForeignKeyConstraint` (not column-level `ForeignKey`). |
| **activity_events — NEW** | A minimal append-only `activity_events` table is part of the **initial** schema. It records only the material V0.1 transitions listed in §7.6, each written **in the same transaction** as its state change. No activity UI, notification pipeline, EventBridge integration, or event framework in V0.1. |
| **Epic** | Deferred. Additive later: `epics` table + nullable `tasks.epic_id`. Nothing here blocks it. |

---

## 2. Normalized domain rules

### Projects & keys
- **P1** A Project is the primary organizational and authorization boundary; every
  child record resolves to exactly one Project's security context.
- **P2** The Project creator is its owner: `projects.created_by` (immutable) **and**
  an `OWNER` membership row, both created in the project-creation transaction.
  Not transferable in V0.1; the `OWNER` membership cannot be removed.
- **P3** `projects.key` is global, uppercase, `^[A-Z][A-Z0-9]{1,9}$`, immutable,
  and stays reserved after archival.
- **P4** Task keys are `project.key + "-" + task.number`, derived, never stored.
- **P5** Task numbering is per-Project, monotonic, gap-tolerant, never recycled,
  independent of any future Epic.
- **P6** Archiving a Project (`projects.archived_at`) preserves child state: no
  status rewrites, no `archived_at` propagation. Archive — not delete — is the
  Project lifecycle operation.

### Users & membership
- **M1** Users ↔ Projects is many-to-many through `project_memberships`.
- **M2** Membership (its `role` preset) is the sole basis for Project
  authorization.
- **M3** A User may hold a different `role` in each Project.
- **M4** Task assignment is not authorization. The assignee must be a current
  member of the Task's Project (DB-enforced), but that membership — not the
  assignment — grants access.
- **M5** One membership row per (project, user). At most one `OWNER` per Project
  (DB); exactly one is guaranteed by project-creation logic + tests. The `OWNER`
  membership cannot be removed or role-changed in V0.1.
- **M6** A member cannot be removed while Tasks in that Project are still assigned
  to them; the application unassigns/reassigns first.

### Tasks
- **T1** Every Task belongs to exactly one Project (`project_id NOT NULL`).
- **T2** A Task has zero or one Sprint (`sprint_id` nullable).
- **T3** `sprint_id IS NULL` ⇒ the Task is in the Backlog (derived, not a status).
- **T4** Changing `sprint_id` (either direction) never changes `status`.
- **T5** A Task keeps its `status` across Sprint add/remove.
- **T6** A Task's Sprint, when set, must belong to the same Project (DB-enforced).
- **T7** A Task's assignee, when set, must be a current member of the Task's
  Project (DB-enforced).

### Sprints
- **S1** Every Sprint belongs to exactly one Project; never shared.
- **S2** Cross-project relationships are between Tasks, never Sprints.
- **S3** At most one `ACTIVE` Sprint per Project.
- **S4** Deletion: empty `PLANNED` Sprint → application may delete; Sprint with
  Tasks → blocked by `RESTRICT`; `ACTIVE`/`CLOSED` Sprint → application rejects.
  Historical Sprint assignment is never silently removed.

### Workflow status
- **W1** `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`; default `TODO`.
- **W2** `BACKLOG` is not a status.

### Priority & estimation
- **PR1** `priority` `SMALLINT` 1–5, default 3, 1 = highest urgency.
- **E1** `story_points` `SMALLINT`, nullable, `> 0` when present. `NULL` =
  unestimated. Allowed-value set is an application concern.
- **PR2 / E2** priority and estimation are independent columns.

### Activity
- **A1** Every material V0.1 transition (§7.6) writes one `activity_events` row in
  the **same transaction** as the state change.
- **A2** `activity_events` is **append-only**: rows are never updated or deleted.
- **A3** Task *content* edits (title, description, priority, points) do **not**
  generate events in V0.1 — only the listed transitions do.

### Dependencies (future — not built, not blocked)
- Later: `task_relationships` table (own rows, no `tasks` column), cross-project
  links resolved through the caller's authorization context, completion-blocking
  and cycle-rejection in application logic. Nothing here precludes them.

---

## 3. Entity set (V0.1)

`users`, `projects`, `project_memberships`, `sprints`, `tasks`, `activity_events`.
No placeholder tables.

---

## 4. Relationships & cardinality

| From → To | Cardinality | Required side | On delete |
|---|---|---|---|
| `users` ↔ `projects` via `project_memberships` | M:N | both FKs required | RESTRICT |
| `project_memberships` → `projects` | * → 1 | required | RESTRICT |
| `project_memberships` → `users` | * → 1 | required | RESTRICT |
| `projects` → `project_memberships` where `role='OWNER'` | 1 → 0..1 (DB) / exactly 1 (app) | required by app | — |
| `projects` → `users` (`created_by`) | * → 1 | required | RESTRICT |
| `projects` → `sprints` | 1 → 0..* | Sprint side required | RESTRICT |
| `projects` → `tasks` | 1 → 0..* | Task side required | RESTRICT |
| `sprints` → `tasks` | 1 → 0..* | Task side optional (`sprint_id` nullable) | RESTRICT |
| `project_memberships` → `tasks` (assignee) | 1 → 0..* | Task side optional | RESTRICT |
| `users` → `tasks` (`created_by`) | 1 → * | required | RESTRICT |
| `projects` → `activity_events` | 1 → 0..* | event side required | RESTRICT |
| `users` → `activity_events` (`actor_user_id`) | 1 → 0..* | optional (system events) | RESTRICT |

Cross-row invariants enforced in the DB:
- **T6** `tasks.(project_id, sprint_id)` ∈ `sprints.(project_id, id)`.
- **T7** `tasks.(project_id, assignee_id)` ∈
  `project_memberships.(project_id, user_id)`.

`activity_events.entity_id` is a **polymorphic** reference (Project, Sprint, Task,
or a member's `user_id`) and is deliberately **not** a foreign key — see §7.6.

---

## 5. Required vs nullable

| Column | Null? | Notes |
|---|---|---|
| `projects.created_by` | NOT NULL | immutable |
| `projects.key` | NOT NULL | immutable |
| `projects.archived_at` | nullable | archived when set |
| `project_memberships.project_id` / `.user_id` | NOT NULL | composite PK |
| `project_memberships.role` | NOT NULL | preset enum |
| `sprints.project_id` | NOT NULL | |
| `sprints.status` | NOT NULL | default `PLANNED` |
| `sprints.start_date` / `.end_date` | nullable | ordered when both present |
| `tasks.project_id` | NOT NULL | ownership + authz anchor |
| `tasks.number` | NOT NULL | project-scoped |
| `tasks.sprint_id` | **nullable** | NULL ⇒ Backlog |
| `tasks.assignee_id` | nullable | member of the project when set |
| `tasks.created_by` | NOT NULL | |
| `tasks.status` | NOT NULL | default `TODO` |
| `tasks.priority` | NOT NULL | default 3 |
| `tasks.story_points` | nullable | `NULL` = unestimated |
| `tasks.archived_at` | nullable | |
| `users.cognito_sub` | NOT NULL | unique — identity key |
| `users.email` | **nullable** | not unique; mutable contact data |
| `activity_events.project_id` | NOT NULL | FK |
| `activity_events.actor_user_id` | nullable | NULL ⇒ system-generated |
| `activity_events.entity_type` / `.entity_id` / `.event_type` | NOT NULL | |
| `activity_events.payload` | nullable | JSONB |
| all `created_at` | NOT NULL | default `now()` |
| `updated_at` (all except `activity_events`) | NOT NULL | default `now()`; app maintains |

---

## 6. Fields per entity

Conventions: `snake_case`; plural tables; FK columns `<referent>_id`; UUID PKs
generated in Python; all timestamps `timestamptz` (UTC).

### users
| column | type | null | default | notes |
|---|---|---|---|---|
| id | uuid | no | (Python) | PK |
| cognito_sub | text | no | | UNIQUE; Cognito `sub` claim; authoritative identity; JIT-provisioned |
| email | text | yes | | contact/profile data, not unique, may change |
| display_name | text | yes | | from Cognito profile |
| created_at | timestamptz | no | `now()` | |
| updated_at | timestamptz | no | `now()` | app-maintained |

### projects
| column | type | null | default | notes |
|---|---|---|---|---|
| id | uuid | no | (Python) | PK |
| key | text | no | | UNIQUE; `CHECK (key ~ '^[A-Z][A-Z0-9]{1,9}$')`; immutable (app) |
| name | text | no | | `CHECK (char_length(name) BETWEEN 1 AND 120)` |
| description | text | yes | | |
| created_by | uuid | no | | FK → users(id); immutable (app) |
| task_sequence | integer | no | `0` | task-number high-water mark; `CHECK (task_sequence >= 0)` |
| archived_at | timestamptz | yes | | set ⇒ read-only (app) |
| created_at | timestamptz | no | `now()` | |
| updated_at | timestamptz | no | `now()` | app-maintained |

### project_memberships
| column | type | null | default | notes |
|---|---|---|---|---|
| project_id | uuid | no | | PK part; FK → projects(id) |
| user_id | uuid | no | | PK part; FK → users(id) |
| role | text | no | | `CHECK (role IN ('OWNER','MANAGER','WRITER_WORKFLOW','WRITER','READER'))` |
| created_at | timestamptz | no | `now()` | access-granted time |
| updated_at | timestamptz | no | `now()` | app-maintained |

Composite PK `(project_id, user_id)`; no surrogate id.

### sprints
| column | type | null | default | notes |
|---|---|---|---|---|
| id | uuid | no | (Python) | PK |
| project_id | uuid | no | | FK → projects(id) |
| name | text | no | | `CHECK (char_length(name) BETWEEN 1 AND 120)` |
| goal | text | yes | | |
| status | text | no | `'PLANNED'` | `CHECK (status IN ('PLANNED','ACTIVE','CLOSED'))` |
| start_date | date | yes | | |
| end_date | date | yes | | `CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date)` |
| created_at | timestamptz | no | `now()` | |
| updated_at | timestamptz | no | `now()` | app-maintained |

Plus `UNIQUE (project_id, id)` — target for the Task→Sprint composite FK.

### tasks
| column | type | null | default | notes |
|---|---|---|---|---|
| id | uuid | no | (Python) | PK |
| project_id | uuid | no | | FK → projects(id); anchors numbering + authz |
| number | integer | no | | `CHECK (number > 0)`; allocated from `projects.task_sequence` |
| sprint_id | uuid | yes | | NULL ⇒ Backlog |
| title | text | no | | `CHECK (char_length(title) BETWEEN 1 AND 200)` |
| description | text | yes | | |
| status | text | no | `'TODO'` | `CHECK (status IN ('TODO','IN_PROGRESS','BLOCKED','DONE'))` |
| priority | smallint | no | `3` | `CHECK (priority BETWEEN 1 AND 5)` |
| story_points | smallint | yes | | `CHECK (story_points IS NULL OR story_points > 0)` |
| assignee_id | uuid | yes | | part of composite FK → project_memberships |
| created_by | uuid | no | | FK → users(id) |
| archived_at | timestamptz | yes | | |
| created_at | timestamptz | no | `now()` | |
| updated_at | timestamptz | no | `now()` | app-maintained |

### activity_events  (append-only)
| column | type | null | default | notes |
|---|---|---|---|---|
| id | uuid | no | (Python) | PK |
| project_id | uuid | no | | FK → projects(id); the security scope of the event |
| actor_user_id | uuid | yes | | FK → users(id); NULL ⇒ system-generated |
| entity_type | text | no | | `PROJECT` \| `PROJECT_MEMBERSHIP` \| `SPRINT` \| `TASK` (app-validated) |
| entity_id | uuid | no | | polymorphic; **not** a FK (see §7.6) |
| event_type | text | no | | app-validated vocabulary (§7.6) |
| payload | jsonb | yes | | small structured detail, e.g. `{"from": "...", "to": "..."}` |
| created_at | timestamptz | no | `now()` | no `updated_at` — rows are immutable |

---

## 7. Illustrative schema (spec, **not** a migration)

### 7.1 users
```sql
CREATE TABLE users (
    id           uuid        PRIMARY KEY,
    cognito_sub  text        NOT NULL,
    email        text,
    display_name text,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_cognito_sub UNIQUE (cognito_sub)
);
```

### 7.2 projects
```sql
CREATE TABLE projects (
    id            uuid        PRIMARY KEY,
    key           text        NOT NULL,
    name          text        NOT NULL,
    description   text,
    created_by    uuid        NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    task_sequence integer     NOT NULL DEFAULT 0,
    archived_at   timestamptz,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_projects_key      UNIQUE (key),
    CONSTRAINT ck_projects_key_fmt  CHECK (key ~ '^[A-Z][A-Z0-9]{1,9}$'),
    CONSTRAINT ck_projects_name_len CHECK (char_length(name) BETWEEN 1 AND 120),
    CONSTRAINT ck_projects_task_seq CHECK (task_sequence >= 0)
);
```

### 7.3 project_memberships
```sql
CREATE TABLE project_memberships (
    project_id uuid        NOT NULL REFERENCES projects (id) ON DELETE RESTRICT,
    user_id    uuid        NOT NULL REFERENCES users (id)    ON DELETE RESTRICT,
    role       text        NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pk_project_memberships PRIMARY KEY (project_id, user_id),
    CONSTRAINT ck_project_memberships_role
        CHECK (role IN ('OWNER','MANAGER','WRITER_WORKFLOW','WRITER','READER'))
);

-- at most one OWNER per project (exactly one is an app + test guarantee)
CREATE UNIQUE INDEX uq_project_one_owner
    ON project_memberships (project_id) WHERE role = 'OWNER';

CREATE INDEX ix_project_memberships_user ON project_memberships (user_id);
```

### 7.4 sprints
```sql
CREATE TABLE sprints (
    id         uuid        PRIMARY KEY,
    project_id uuid        NOT NULL REFERENCES projects (id) ON DELETE RESTRICT,
    name       text        NOT NULL,
    goal       text,
    status     text        NOT NULL DEFAULT 'PLANNED',
    start_date date,
    end_date   date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_sprints_project_id UNIQUE (project_id, id),   -- composite-FK target
    CONSTRAINT ck_sprints_status     CHECK (status IN ('PLANNED','ACTIVE','CLOSED')),
    CONSTRAINT ck_sprints_name_len   CHECK (char_length(name) BETWEEN 1 AND 120),
    CONSTRAINT ck_sprints_date_order
        CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date)
);

-- at most one ACTIVE sprint per project
CREATE UNIQUE INDEX uq_sprints_one_active
    ON sprints (project_id) WHERE status = 'ACTIVE';
```

### 7.5 tasks
```sql
CREATE TABLE tasks (
    id           uuid        PRIMARY KEY,
    project_id   uuid        NOT NULL,
    number       integer     NOT NULL,
    sprint_id    uuid,
    title        text        NOT NULL,
    description  text,
    status       text        NOT NULL DEFAULT 'TODO',
    priority     smallint    NOT NULL DEFAULT 3,
    story_points smallint,
    assignee_id  uuid,
    created_by   uuid        NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    archived_at  timestamptz,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tasks_sprint_same_project
        FOREIGN KEY (project_id, sprint_id)
        REFERENCES sprints (project_id, id) MATCH SIMPLE ON DELETE RESTRICT,
    CONSTRAINT fk_tasks_assignee_is_member
        FOREIGN KEY (project_id, assignee_id)
        REFERENCES project_memberships (project_id, user_id)
        MATCH SIMPLE ON DELETE RESTRICT,

    CONSTRAINT uq_tasks_project_number UNIQUE (project_id, number),
    CONSTRAINT ck_tasks_number   CHECK (number > 0),
    CONSTRAINT ck_tasks_status
        CHECK (status IN ('TODO','IN_PROGRESS','BLOCKED','DONE')),
    CONSTRAINT ck_tasks_priority CHECK (priority BETWEEN 1 AND 5),
    CONSTRAINT ck_tasks_points   CHECK (story_points IS NULL OR story_points > 0),
    CONSTRAINT ck_tasks_title_len CHECK (char_length(title) BETWEEN 1 AND 200)
);

CREATE INDEX ix_tasks_project_status ON tasks (project_id, status);
CREATE INDEX ix_tasks_sprint    ON tasks (sprint_id)   WHERE sprint_id   IS NOT NULL;
CREATE INDEX ix_tasks_backlog   ON tasks (project_id)  WHERE sprint_id   IS NULL;
CREATE INDEX ix_tasks_assignee  ON tasks (assignee_id) WHERE assignee_id IS NOT NULL;
```

`MATCH SIMPLE` (the PostgreSQL default) skips a composite FK whenever any key
column is NULL, so a Backlog task (`sprint_id NULL`) or unassigned task
(`assignee_id NULL`) is unaffected while a non-null value is fully validated
(exists **and** same project). Both composite FKs are `RESTRICT`: a Sprint with
Tasks cannot be deleted; a membership cannot be removed while the user is an
assignee. No single-column `sprint_id → sprints(id)` or `assignee_id → users(id)`
FK is added — the composite FKs already provide referential integrity.

### 7.6 activity_events
```sql
CREATE TABLE activity_events (
    id            uuid        PRIMARY KEY,
    project_id    uuid        NOT NULL REFERENCES projects (id) ON DELETE RESTRICT,
    actor_user_id uuid                 REFERENCES users (id)    ON DELETE RESTRICT,
    entity_type   text        NOT NULL,
    entity_id     uuid        NOT NULL,
    event_type    text        NOT NULL,
    payload       jsonb,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ix_activity_events_project_created
    ON activity_events (project_id, created_at);
CREATE INDEX ix_activity_events_entity
    ON activity_events (entity_type, entity_id, created_at);
```

- **Append-only** (A2): the application never issues `UPDATE` or `DELETE` on this
  table. Not DB-enforced in V0.1 (no trigger); a `REVOKE` on the DB role is a
  later option.
- Written **in the same transaction** as the state change (A1), so a rolled-back
  change leaves no event.
- `entity_id` is **polymorphic** and intentionally not a FK. It holds:

| entity_type | entity_id | event_type values |
|---|---|---|
| `PROJECT` | `projects.id` | `PROJECT_CREATED`, `PROJECT_ARCHIVED` |
| `PROJECT_MEMBERSHIP` | the member's `users.id` | `MEMBER_ADDED`, `MEMBER_REMOVED`, `MEMBER_ROLE_CHANGED` |
| `SPRINT` | `sprints.id` | `SPRINT_CREATED`, `SPRINT_ACTIVATED`, `SPRINT_CLOSED` |
| `TASK` | `tasks.id` | `TASK_CREATED`, `TASK_STATUS_CHANGED`, `TASK_SPRINT_CHANGED`, `TASK_ASSIGNEE_CHANGED` |

- Suggested `payload` shapes (not schema-enforced):

| event_type | payload |
|---|---|
| `PROJECT_CREATED` | `null` or `{"key": "SOT", "name": "..."}` |
| `PROJECT_ARCHIVED` | `null` |
| `MEMBER_ADDED` | `{"role": "WRITER"}` |
| `MEMBER_REMOVED` | `{"role": "WRITER"}` |
| `MEMBER_ROLE_CHANGED` | `{"from": "WRITER", "to": "READER"}` |
| `SPRINT_CREATED` | `{"name": "Sprint 4"}` |
| `SPRINT_ACTIVATED` / `SPRINT_CLOSED` | `null` |
| `TASK_CREATED` | `{"number": 124, "status": "TODO"}` |
| `TASK_STATUS_CHANGED` | `{"from": "TODO", "to": "IN_PROGRESS"}` |
| `TASK_SPRINT_CHANGED` | `{"from": null, "to": "<sprint uuid>"}` |
| `TASK_ASSIGNEE_CHANGED` | `{"from": "<user uuid>", "to": null}` |

- `entity_type` and `event_type` vocabularies live as application constants
  (no `CHECK`), so V0.2+ can add event types without a migration.

---

## 8. Enforced by PostgreSQL

- **T1 / S1** every Task / Sprint has exactly one Project (`project_id NOT NULL` +
  FK).
- **P5** task-key uniqueness — `UNIQUE (tasks.project_id, number)`.
- **T6** Task's Sprint is in the Task's Project — `fk_tasks_sprint_same_project`.
- **T7** Task's assignee is a member of the Task's Project —
  `fk_tasks_assignee_is_member`.
- **W1 / PR1 / E1** valid status / priority range / positive-or-null points —
  `CHECK`.
- **M5** one role per (project, user) — composite PK; **at most one** `OWNER` —
  `uq_project_one_owner`.
- **S3** at most one `ACTIVE` Sprint per Project — `uq_sprints_one_active`.
- **S4 / M6** nothing cascades or nulls on delete — every FK `RESTRICT`; a Sprint
  with Tasks and a membership with assignments are both undeletable.
- **P3** project-key format + global uniqueness (+ post-archival reservation via
  never deleting archived projects).
- **identity** `cognito_sub` uniqueness.
- Sprint date ordering — `CHECK`.
- `created_at` (all) and `updated_at` (all but `activity_events`) always present.

## 9. Enforced by application / business logic

- **P2 / M5 / DEC-1** create the `OWNER` membership row in the same transaction as
  the Project (the DB does not); reject changes to `projects.created_by`; reject
  removal or role change of the `OWNER` membership; no ownership-transfer path.
- **P4 / P5 / DEC-7** allocate the next number inside the create-task transaction:
  `UPDATE projects SET task_sequence = task_sequence + 1 WHERE id = :pid
  RETURNING task_sequence` (row lock serialises concurrent creates for that one
  Project; `UNIQUE (project_id, number)` is the backstop). Numbers are not
  recycled on Task deletion.
- **T4 / T5** never modify `status` in the same operation that changes `sprint_id`.
- **M2 / M4** authorization is computed only from the caller's `project_memberships`
  row and its `role`; `assignee_id` is never consulted for access.
- **M6 / DEC-3** before removing a membership, explicitly unassign or reassign
  every Task in that Project assigned to that user. Never auto-null.
- **S4** reject deletion of `ACTIVE` or `CLOSED` Sprints; only an empty `PLANNED`
  Sprint is deletable; everything else is `CLOSE`.
- **DEC-2** map `role` → capabilities (table below); enforce `WRITER` cannot do
  workflow transitions; sprint/assignment actions need `MANAGER`+; member/role
  management needs `OWNER`.
- **P1** every project-scoped read and write checks membership + capability first.
- **P3 / DEC-4** reject any change to `projects.key`.
- **P6 / archival** archived Project or Task ⇒ reject writes, keep reads; archival
  never touches child rows.
- **E1** validate `story_points` against any allowed set (e.g. Fibonacci).
- **DEC-5** priority direction / meaning (1 = most urgent) is a UI/app concern.
- **identity** JIT provisioning: on a verified Cognito token whose `sub` is
  unknown, insert a `users` row; match on `cognito_sub` thereafter. `email` is
  stored as received and may be updated later; it is not an identity key.
- **updated_at** set via SQLAlchemy `onupdate` on every update.
- **A1 / A2 / A3** write the `activity_events` row in the same transaction as each
  material transition in §7.6; never update or delete events; do not emit events
  for plain content edits.
- Dependency rules (completion-blocking, cycle rejection, cross-project privacy) —
  application logic when those entities are added.

### Preset → capability map (application code, no table)

| capability | READER | WRITER | WRITER_WORKFLOW | MANAGER | OWNER |
|---|:-:|:-:|:-:|:-:|:-:|
| read project data | ✓ | ✓ | ✓ | ✓ | ✓ |
| create / edit Task content | | ✓ | ✓ | ✓ | ✓ |
| change Task workflow status | | | ✓ | ✓ | ✓ |
| manage Sprints (create/activate/close, add/remove Tasks) | | | | ✓ | ✓ |
| assign Tasks | | | | ✓ | ✓ |
| manage members & roles | | | | | ✓ |

Starting map; `MANAGER` invite/role scope (narrower than `OWNER`) is finalised
with invitations. Refine in Phase 0B.2.

---

## 10. Intentionally deferred

| Item | How it slots in later (all additive, none blocked) |
|---|---|
| **Epic** | `epics` table (`epics.project_id`) + nullable `tasks.epic_id`. No effect on task numbering, keys, authz, or any V0.1 FK. |
| **TaskRelationship / dependencies** | `task_relationships(from_task_id, to_task_id, type)` — own rows, no `tasks` column. Cross-project privacy is app logic. |
| **Tag / TaskTag, Milestone** | additive tables (+ nullable `tasks.milestone_id`). |
| **Comment, Attachment** | additive child tables of `tasks`. |
| **Activity *history UI*, notification pipeline, EventBridge, event framework** | V0.3. The `activity_events` **table** exists in V0.1; only the consumers are deferred. |
| **Notification, Integration** | V0.3. |
| **ProjectInvitation** | V0.2 — until then, memberships are created directly for provisioned users. |
| **Capability table** | only if the `role` enum proves too coarse. |
| **Ownership transfer** | explicitly not built; would add an app path and relax the "one OWNER, immutable" assumption. |
| **Multiple assignees / collaborators / watchers** | `task_assignees` join table if single `assignee_id` proves insufficient. |
| **User soft-delete (`deleted_at`)** | only if a real delete requirement appears. |
| **Append-only enforcement for `activity_events`** (trigger / `REVOKE`) | optional hardening later. |

---

## 11. ER diagram (text)

```
                         ┌──────────────────────────────┐
                         │            users             │
                         │──────────────────────────────│
                         │ id           uuid   PK       │
                         │ cognito_sub  text   UQ       │
                         │ email        text            │   (not unique)
                         │ display_name text            │
                         │ created_at / updated_at      │
                         └──────────────────────────────┘
                          ▲       ▲        ▲        ▲       ▲
          created_by      │ user  │ created│ actor  │ created_by
        ┌─────────────────┘  _id  │  _by   │ _user  │       │
        │ 1              *  ┌──────┴────────┴──┐    _id      │
┌───────┴────────────┐  1  *│ project_memberships│  (nullable)│
│      projects      │─────▶│──────────────────│              │
│────────────────────│      │ project_id PK/FK │──┐           │
│ id          uuid PK│──┐   │ user_id    PK/FK │  │ assignee  │
│ key         text UQ│  │ 1 │ role       text  │  │ must be   │
│ name / description │  │   │ created_at/updated│  │ (project_id,
│ created_by  uuid FK│──┘   └──────────────────┘  │  user_id) │
│ task_sequence int  │      ≤1 role='OWNER'/proj   │  member   │
│ archived_at tstz?  │      (exactly 1 by app)     │           │
│ created_at/updated │1                          * │           │
└───┬──────────┬─────┘────────────────────────┐    │           │
    │ 1        │ 1                             │    ▼ ▼          │
    │          │                          ┌───┴────────────────┐│
    │          │                       *  │        tasks       ││
    │          └──────────────────────────▶│───────────────────││
    │                                      │ id          uuid PK││
    │  ┌────────────────────┐              │ project_id   uuid FK││
    │  │      sprints       │  0..1        │ number       int    ││
    │  │────────────────────│ sprint_id ───│ sprint_id    uuid FK?│
    │  │ id         uuid PK │◀─────────────│ title / description ││
    │  │ project_id uuid FK │  composite   │ status text(TODO..) ││
    │  │ name / goal        │  FK ⇒ same   │ priority smallint1-5││
    │  │ status text(PLAN..)│  project     │ story_points smallint?│
    │  │ start_date/end_date│              │ assignee_id  uuid FK?│┘
    │  │ UNIQUE(project_id, │              │ created_by   uuid FK │
    │  │        id)         │              │ archived_at  tstz?   │
    │  │ ≤1 status='ACTIVE' │              │ UNIQUE(project_id,   │
    │  │ created_at/updated │              │        number)       │
    │  └───────────────────┘              │ created_at/updated_at │
    │                                     └──────────────────────┘
    │ 1
    │        *   ┌───────────────────────────────┐
    └──────────▶│        activity_events         │   append-only
                │───────────────────────────────│
                │ id            uuid   PK        │
                │ project_id    uuid   FK  ─────▶ projects
                │ actor_user_id uuid   FK? ─────▶ users
                │ entity_type   text            │  PROJECT|PROJECT_MEMBERSHIP|
                │ entity_id     uuid            │  SPRINT|TASK  (polymorphic,
                │ event_type    text            │               not a FK)
                │ payload       jsonb?          │
                │ created_at    timestamptz     │  (no updated_at)
                └───────────────────────────────┘

  Legend  PK primary key  FK foreign key  UQ unique  ?  nullable  tstz timestamptz
  All FKs: ON DELETE RESTRICT
  Derived task key   = projects.key || '-' || tasks.number   (not stored)
  Derived "Backlog"  = tasks.sprint_id IS NULL
```

---

## 12. Core data conventions

- **Naming:** `snake_case`; plural table names; FK columns `<referent>_id`; index
  names `ix_<table>_<cols>`, unique `uq_<table>_<cols>`, check `ck_<table>_<rule>`,
  FK `fk_<table>_<purpose>`.
- **Primary keys:** `uuid`, generated in Python (`uuid.uuid4()`), no DB default;
  pure join tables use a natural composite PK (`project_memberships`).
- **Timestamps:** always `timestamptz`, UTC. Mutable tables have `created_at` and
  `updated_at` (`NOT NULL DEFAULT now()`); `updated_at` maintained by SQLAlchemy
  `onupdate`, no DB trigger. **Append-only tables** (`activity_events`) have only
  `created_at`.
- **Soft state:** user-facing aggregates use nullable `archived_at`; there is no
  routine hard-delete path. Any hard `DELETE` is a manual admin/test operation and
  must remove children first (every FK is `RESTRICT`). `activity_events` rows are
  never updated or deleted at all.
- **Enumerations:** `text` + `CHECK (col IN (...))` for closed V0.1 sets
  (`role`, task `status`, sprint `status`). Open, growing vocabularies
  (`activity_events.entity_type` / `event_type`) are `text` with **no** `CHECK`,
  validated by application constants.
- **Numbers:** `smallint` / `integer`; no floating point.
- **Derived values are never stored** (task key, Backlog flag).
- **Polymorphic references** (`activity_events.entity_id`) are bare `uuid`, not
  FKs, and are the only sanctioned non-FK reference.
- **Extensions:** none in V0.1.
- **Migrations:** Alembic, single head, forward-only in shared environments.

---

## 13. Notes for the reviewer

1. **`created_by` vs `OWNER` membership** are the same user in V0.1 (no transfer);
   both are stored deliberately — immutable provenance vs. authorization record.
2. **"Exactly one OWNER"** is *not* a database guarantee — the partial unique
   index only prevents a second one. Project-creation code and its tests are
   responsible for always creating the first. No trigger.
3. **`users.email` is nullable and has no uniqueness constraint.** An identity
   may have no email at all, and two users could share one; `cognito_sub` is the
   only identity key. An "email required" policy, if ever needed, lives in
   Cognito/application config.
4. **Removing a member** who is still an assignee, or **deleting a Sprint** with
   Tasks, is blocked by `RESTRICT`; the application must detach first. Sprint
   deletion is further restricted by app logic to empty `PLANNED` sprints only.
5. **`task_sequence`** row-locks the project row during task creation (brief
   serialisation of concurrent task creation for that one project). Accepted for
   V0.1.
6. **`MATCH SIMPLE` composite FKs** require explicit
   `ForeignKeyConstraint(...)` in the SQLAlchemy models (not column-level
   `ForeignKey`), for both `fk_tasks_sprint_same_project` and
   `fk_tasks_assignee_is_member`.
7. **`activity_events`** is a table only — no consumers in V0.1. It records the 12
   event types in §7.6, written in-transaction with each change, and is treated as
   append-only by convention (not yet DB-enforced). `entity_id` is polymorphic and
   deliberately not a FK.
8. **`activity_events.project_id` FK is `RESTRICT`**, so once a Project has any
   event (i.e. immediately after creation) it can never be hard-deleted — which is
   consistent with "archive, don't delete".

---

## 14. Recommended next implementation step

On approval of this spec:

1. One PR containing:
   - Alembic scaffold + initial migration creating `users`, `projects`,
     `project_memberships`, `sprints`, `tasks`, `activity_events` exactly as in §7.
   - SQLAlchemy models in `backend/app/models/` — composite FKs via
     `ForeignKeyConstraint`; `updated_at` via `onupdate`; `activity_events` model
     is insert-only (no update/delete methods exposed).
   - `pytest` constraint tests against a disposable PostgreSQL: task-number
     allocation under concurrency; `uq_project_one_owner`; `uq_sprints_one_active`;
     cross-project `sprint_id` and non-member `assignee_id` rejection;
     `RESTRICT` on Sprint delete with Tasks and on member delete with
     assignments; Backlog = `sprint_id IS NULL`; `sprint_id` change leaves
     `status` intact; an `activity_events` row is written in the same transaction
     as a representative change and survives/rolls back with it.
   - A minimal seed script (one project + owner membership + one sprint + a few
     tasks + the resulting `PROJECT_CREATED` / `MEMBER_ADDED` / `TASK_CREATED`
     events).
2. Then Phase 0B.2: Cognito token verification + the project-scoped authorization
   dependency (membership lookup → `role` → capability check).
```
