# Sprint-Ops Tracker : Build Phases

> [!info] ***Overview***
> ---
> This note documents the planned implementation order for SprintOpsTracker. Its purpose is to keep development structured, reduce scope creep, and ensure the project is built in a finishable sequence.

---

### Build Strategy
SprintOpsTracker will be built in controlled phases.

The general strategy is:

- build the application shell first
- prove frontend and backend can communicate
- complete one working workflow before expanding features
- keep the MVP focused
- delay higher-complexity features until the core application works

This approach reduces the risk of overengineering and helps keep the project portfolio-ready.

---

### High-Level Build Order
The project will be built in this general order:

1. project structure and documentation
2. frontend shell
3. backend shell
4. fake data integration
5. real work item CRUD
6. sprint CRUD
7. sprint board workflow
8. AWS deployment
9. security/polish/documentation updates

---

> [!abstract] ***Phase 1 - Project Structure and Documentation***
> ---
> #### *Goal*
> Create the project foundation and lock the planning before implementation expands.
>
> #### *Main Tasks*
> - create repo structure
> - create `frontend/`, `backend/`, `infra/`, and `docs/`
> - set up `.gitignore`
> - initialize GitHub repo connection
> - create initial planning notes in Obsidian/docs
>
> #### *Outcome*
> A clean project structure exists and the planning baseline is documented.

---

> [!abstract] ***Phase 2 - Frontend Shell***
> ---
> #### *Goal*
> Create the basic React application structure and page routing without worrying about real backend data yet.
>
> #### *Main Tasks*
> - initialize React app
> - set up routing
> - create `Navbar`
> - create empty pages:
>   - `DashboardPage`
>   - `BacklogPage`
>   - `SprintBoardPage`
>   - `SprintManagementPage`
> - create `api.js` service placeholder
>
> #### *Outcome*
> The frontend can run locally and the user can navigate between the main app pages.

---

> [!abstract] ***Phase 3 - Backend Shell***
> ---
> #### *Goal*
> Create the basic backend API structure using Node.js handlers before connecting to a real database.
>
> #### *Main Tasks*
> - initialize backend project structure
> - create:
>   - `itemsHandler.js`
>   - `sprintsHandler.js`
>   - `projectsHandler.js`
> - create:
>   - `response.js`
>   - `validation.js`
> - return fake/mock JSON responses first
>
> #### *Outcome*
> The backend has a real shape and the frontend can begin calling API-style endpoints.

---

> [!abstract] ***Phase 4 - Frontend to Fake Backend Integration***
> ---
> #### *Goal*
> Prove the frontend and backend can communicate successfully before real persistence is added.
>
> #### *Main Tasks*
> - connect `BacklogPage` to fake `GET /items`
> - display fake work item data in the UI
> - verify response handling and page rendering
> - test simple loading and error states
>
> #### *Outcome*
> The app demonstrates a working frontend-to-backend data flow, even with mock data.

---

> [!abstract] ***Phase 5 - Real Work Item CRUD***
> ---
> #### *Goal*
> Implement the first full working vertical slice of the application.
>
> #### *Main Tasks*
> - define work item model shape
> - connect item operations to DynamoDB
> - implement:
>   - `GET /items`
>   - `GET /items/{id}`
>   - `POST /items`
>   - `PUT /items/{id}`
>   - `DELETE /items/{id}`
> - connect `BacklogPage` to real item CRUD
> - validate request bodies and return controlled responses
>
> #### *Outcome*
> Work items can be created, viewed, updated, and deleted with persistent backend storage.

---

> [!abstract] ***Phase 6 - Sprint CRUD***
> ---
> #### *Goal*
> Add sprint management as the second major application workflow.
>
> #### *Main Tasks*
> - define sprint model shape
> - connect sprint operations to DynamoDB
> - implement:
>   - `GET /sprints`
>   - `GET /sprints/{id}`
>   - `POST /sprints`
>   - `PUT /sprints/{id}`
>   - `DELETE /sprints/{id}`
> - connect `SprintManagementPage`
> - support sprint statuses such as:
>   - `planned`
>   - `active`
>   - `closed`
>
> #### *Outcome*
> Sprints can be created, viewed, updated, and managed through the application.

---

> [!abstract] ***Phase 7 - Sprint Board Workflow***
> ---
> #### *Goal*
> Connect work items and sprints into the main Jira-like workflow.
>
> #### *Main Tasks*
> - allow items to be assigned to sprints
> - build active sprint board logic
> - group items by status
> - support updating item status from the board
> - render status columns:
>   - Backlog
>   - Ready
>   - In Progress
>   - Blocked
>   - Done
>
> #### *Outcome*
> The application behaves like a lightweight sprint board rather than disconnected CRUD screens.

---

> [!abstract] ***Phase 8 - Dashboard View***
> ---
> #### *Goal*
> Add a simple operational overview page.
>
> #### *Main Tasks*
> - display project summary
> - show active sprint
> - calculate and display simple item counts
> - present a small dashboard view for the app
>
> #### *Outcome*
> The application includes a basic summary page and feels more complete.

---

> [!abstract] ***Phase 9 - AWS Infrastructure and Deployment***
> ---
> #### *Goal*
> Deploy the application using the planned AWS architecture.
>
> #### *Main Tasks*
> - define Terraform structure
> - provision:
>   - S3 bucket
>   - CloudFront distribution
>   - API Gateway
>   - Lambda functions
>   - DynamoDB tables
>   - IAM roles and policies
>   - CloudWatch resources as needed
> - build frontend for deployment
> - connect frontend to deployed backend API
>
> #### *Outcome*
> SprintOpsTracker is deployed as a working AWS-hosted portfolio application.

---

 

---

### Build Priorities
The development priorities for SprintOpsTracker are:

1. finishability
2. clear architecture
3. working end-to-end flow
4. simple but realistic UI
5. security-minded implementation
6. strong portfolio presentation

If a new feature threatens those priorities, it should likely be deferred.

---

### Scope Control During Build
When considering whether to add a feature during implementation, ask:

1. Does this help complete the core sprint/backlog workflow?
2. Does this strengthen the main architecture story?
3. Does this add more value than complexity?
4. Can this wait until post-MVP?

If the feature fails these checks, it should likely be deferred.

---

### Current Build Lock
The current build sequence for SprintOpsTracker is locked as:

- structure and docs first
- frontend shell second
- backend shell third
- fake integration before real persistence
- work item CRUD before sprint workflow
- sprint workflow before deployment
- deployment before polish

This sequence is meant to keep the project understandable and finishable.

---

### Immediate Next Build Step
The next practical implementation task is:

create the file-by-file starter blueprint for Stage 1 and Stage 2, including:
- which files get created first
- what each file does
- which files can stay minimal initially