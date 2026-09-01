# Sprint-Ops Tracker : MVP Scope

> [!info] ***Overview***
> ---
> This note defines the minimum viable product (MVP) for `Sprint-Ops Tracker`. Its purpose is to clearly document what the `first version` of the project will include, what it will intentionally exclude, and what "done" means for the initial release.

> [!success] ***Goal***
> ---
> The MVP of `Sprint-Ops Tracker` is meant to deliver a working, portfolio-ready application that demonstrates:
> - React frontend development
> - Node.js backend development
> - AWS serverless architecture
> - API-driven CRUD workflows
> - DynamoDB data persistence
> - Terraform-based infrastructure planning
> - foundational security-minded design

---

### MVP Summary
`Sprint-Ops Tracker` will be a lightweight sprint and backlog tracking application for a small team. The MVP will allow a user to:
- create work items
- view and manage backlog items
- create and manage sprints
- assign work items to sprints
- update work item statuses
- view an active sprint board
- review a simple dashboard summary

---

### In-Scope Features

#### *1. Project-Level Scope*
For the MVP, the application will support a simple single-project workflow.

Included:
- one project context for managing work
- ability to associate sprints and items to that project

Simplification:
- the app may start with a single default project rather than a full multi-project experience


#### *2. Work Item Management*
The MVP will support basic work item CRUD.

Included:
- create work item
- view work item list
- edit work item
- delete work item
- assign priority
- assign story points
- assign assignee as plain text
- assign labels/tags
- update work item status
- optionally assign work item to a sprint

Example fields:
- `itemId`
- `projectId`
- `sprintId`
- `title`
- `description`
- `status`
- `priority`
- `storyPoints`
- `assignee`
- `labels`
- `createdAt`
- `updatedAt`


#### *3. Sprint Management*
The MVP will support basic sprint lifecycle management.

Included:
- create sprint
- view sprint list
- view sprint details
- update sprint
- delete sprint if needed
- mark sprint as planned, active, or closed

Example fields:
- `sprintId`
- `projectId`
- `name`
- `goal`
- `startDate`
- `endDate`
- `status`
- `createdAt`
- `updatedAt`

#### *4. Backlog View*
The MVP will include a backlog view.

Included:
- list work items not currently tied to an active sprint
- create new work items from the backlog area
- edit and delete work items
- prepare work items for sprint assignment


#### *5. Sprint Board View*
The MVP will include a sprint board for the active sprint.

Included:
- display items by workflow status
- show work items in columns
- update work item status from the board
- view active sprint context

Planned status columns:
- Backlog
- Ready
- In Progress
- Blocked
- Done

> [!info] ***Note***
> ---
> - drag-and-drop is not required for the MVP
> - status changes can be handled with buttons, menus, or edit forms


#### *6. Dashboard View*
The MVP will include a simple dashboard page.

Included:
- project name
- active sprint summary
- basic work item counts
- simple operational overview

Example metrics:
- backlog count
- in progress count
- blocked count
- done count

---

### Out-of-Scope Features

The following features are intentionally excluded from the MVP:

#### *Authentication and Identity*
- user sign-in
- user registration
- role-based access control
- team invitations

### *Collaboration Features*
- comments
- attachments
- mentions
- notifications
- real-time updates

#### *Advanced Workflow Features*
- drag-and-drop interaction
- burndown or burnup charts
- analytics dashboards
- audit history
- time tracking
- subtasks
- epics
- swimlanes

#### *Enterprise / Platform Features*
- multi-tenant architecture
- advanced permission models
- organization-level management
- external integrations
- mobile app support

These items may be considered later, but they are not part of the initial build.

---

### MVP Design Constraints

To keep the project realistic and finishable, the MVP should follow these constraints:

- keep the UI simple and functional
- prefer clarity over advanced optimization
- favor basic status updates over drag-and-drop
- use a single-project mental model
- separate frontend, backend, and data responsibilities clearly
- build one complete workflow before adding extra features

---

### MVP Success Criteria

The MVP will be considered successful when a user can:

- open the frontend
- create a work item
- view the backlog
- edit and delete work items
- create a sprint
- assign work items to a sprint
- open the sprint board
- update item statuses
- see data persist through the backend and database
- navigate the app through the main pages without broken flow

---

### Definition of Done for MVP

`Sprint-Ops Tracker` MVP is done when all of the following are true:

- React frontend pages exist and are navigable
- work item CRUD works end to end
- sprint CRUD works end to end
- sprint board shows active sprint items by status
- item-to-sprint assignment works
- backend API returns valid JSON responses
- DynamoDB persistence works
- core security baseline is in place
- the project is documented clearly enough to explain in a portfolio

---

### Scope Protection Rules

When deciding whether to add a feature during MVP development, use these rules:

1. Does this feature directly support the core sprint/backlog workflow?
2. Does this feature help demonstrate the main stack and architecture?
3. Can this feature be completed without significantly delaying the MVP?
4. Would the project still be impressive without it?

If the answer is no, it should likely move to a future enhancement list instead of the MVP.

---

## Current MVP Lock

The current MVP for SprintOpsTracker includes:

- single-project workflow
- backlog management
- work item CRUD
- sprint CRUD
- sprint assignment
- sprint board status updates
- simple dashboard
- React frontend
- Node.js backend
- AWS serverless architecture
- Terraform-planned infrastructure

