> [!success] ***Current Progress Update***
> ---
> SprintOpsTracker has now completed **Phase 7 - Sprint Board Workflow**.
>
> Current state of the project:
> - work item CRUD is fully connected to DynamoDB
> - sprint CRUD is fully connected to DynamoDB
> - items can be assigned to sprints
> - an active sprint can be detected by the backend
> - the sprint board now loads items for the active sprint
> - sprint items are grouped by workflow status
> - item status can be updated directly from the sprint board
>
> SprintOpsTracker now behaves like a lightweight sprint workflow application rather than separate CRUD pages.


# SprintOpsTracker - Reflection Log - Day 4

> [!info] ***Overview***
> ---
> Day 4 focused on completing the connection between backlog items and sprint workflows. The main accomplishment was moving SprintOpsTracker from separate item and sprint management into a real board-style workflow where active sprint items can be viewed and updated by status.

---

> [!abstract] ***What I Worked On***
> ---
> #### *Main Focus*
> - continued and completed Phase 6 sprint CRUD work
> - moved into Phase 7 sprint board workflow
> - connected work items to sprints
> - added active sprint lookup logic
> - built the sprint board to group items by status
> - enabled updating item status directly from the board

---

> [!abstract] ***What I Practiced***
> ---
> #### *Technical Practice*
> - backend route and handler troubleshooting
> - DynamoDB-backed sprint and item workflow logic
> - React state management across multiple pages
> - frontend-to-backend API integration
> - debugging route parameters and status-value matching
>
> #### *Systems Practice*
> - thinking about how separate data models connect
> - making workflow state drive UI behavior
> - validating that architecture decisions actually work in a live app

---

> [!abstract] ***What I Struggled With***
> ---
> #### *Main Friction*
> - status casing mismatches between route values and stored data
> - debugging why the active sprint was not being found
> - keeping track of what should be lowercase in URLs versus title case in actual sprint data
> - continuing to work through unfamiliar JavaScript and React patterns
>
> #### *Reflection*
> The hardest part was not building the concept itself, but tracking consistency across frontend, backend, routing, and stored data.

---

> [!abstract] ***What I Learned***
> ---
> #### *Key Lessons*
> - route parameter values and stored field values are different concerns and must be handled intentionally
> - one mismatch in casing can break a valid system flow
> - the sprint board depends on multiple layers all agreeing:
>   - backend lookup logic
>   - stored sprint status
>   - item-to-sprint assignment
>   - frontend board rendering
>
> #### *Big Takeaway*
> Day 4 reinforced that cloud application development is as much about consistency and integration as it is about writing code.

---

> [!caution] ***Key Takeaways***
> ---
> - Day 4 made SprintOpsTracker feel much more like a real product.
> - The biggest challenge was consistency across layers, not just syntax.
> - I practiced both debugging and systems thinking.
> - I am still learning the stack, but the app is becoming more understandable because each phase builds on the last.

---

> [!success] ***End-of-Day Position***
> ---
> By the end of Day 4, SprintOpsTracker had:
>
> - real item CRUD
> - real sprint CRUD
> - DynamoDB persistence for both
> - item-to-sprint assignment
> - active sprint detection
> - a functioning sprint board grouped by status
>
> The project is now behaving like a lightweight Jira-style workflow app.