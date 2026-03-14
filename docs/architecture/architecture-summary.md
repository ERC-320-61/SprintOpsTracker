# Sprint-Ops Tracker : Architecture Summary

> [!info] ***Overview***
> ---
> This note documents the high-level architecture for `Sprint-Ops Tracker`. It explains the major system components, how they interact, and the current architectural boundaries for the MVP.

> [!success] ***Architecture Goal***
> ---
> `Sprint-Ops Tracker` is designed as a lightweight serverless web application that demonstrates practical AWS architecture, frontend/backend separation, and low-cost cloud design.

The architecture is meant to support:
- a React frontend
- a serverless Node.js backend
- DynamoDB persistence
- Terraform-managed infrastructure
- a clear separation between UI, logic, and data layers

---

### High-Level Architecture
`Sprint-Ops Tracker` will use the following major components:
- React frontend
- Amazon S3
- Amazon CloudFront
- AWS API Gateway
- AWS Lambda
- Amazon DynamoDB
- Amazon CloudWatch
- IAM
- Terraform

At a high level, the frontend is delivered through S3 and CloudFront. The frontend sends API requests to API Gateway. API Gateway invokes Lambda functions. Lambda performs request validation, business logic, and DynamoDB reads/writes. Logs are written to CloudWatch.

---

### Core Layers

#### *1. Frontend Layer*
The frontend is a React single-page application.

Its responsibilities are:
- render the user interface
- collect user input
- display backlog, sprint, and dashboard data
- call backend API endpoints
- update the visible state of the application

Main planned views:
- Dashboard
- Backlog
- Sprint Board
- Sprint Management

The frontend does not directly communicate with DynamoDB.

#### *2. API / Logic Layer*
The backend is a serverless API built with Node.js on AWS Lambda.

Its responsibilities are:
- receive API requests from the frontend
- validate incoming data
- perform application logic
- read and write data in DynamoDB
- return JSON responses

The backend will initially use three main handlers:
- `projectsHandler`
- `sprintsHandler`
- `itemsHandler`

This keeps the API organized around the main application resources.

#### *3. Data Layer*
The data layer uses DynamoDB.

Its responsibilities are:
- store project data
- store sprint data
- store work item data
- persist application state across sessions

Current MVP plan favors clarity over advanced NoSQL optimization.

Planned tables:
- `Projects`
- `Sprints`
- `WorkItems`

This may evolve later, but the initial design will prioritize understandability.

---

### Request Flow

#### *Example High-Level Flow*
1. User opens `Sprint-Ops Tracker` in the browser
2. CloudFront delivers the frontend assets from S3
3. User interacts with the React application
4. React sends an HTTPS request to API Gateway
5. API Gateway invokes the appropriate Lambda handler
6. Lambda validates input and applies logic
7. Lambda reads or writes DynamoDB
8. Lambda returns a JSON response
9. React updates the UI with the result

---

### Hosting and Delivery

#### *Amazon S3*
S3 will hold the built static frontend assets.

#### *Amazon CloudFront*
CloudFront will provide:
- secure frontend delivery
- HTTPS access
- more production-like hosting behavior
- CDN-based distribution

This allows the frontend to be hosted without a traditional server.

---

### Backend Execution Model

#### *AWS Lambda*
Lambda is the compute layer for the backend.

Benefits for this project:
- no server management
- low-cost execution model
- good fit for small APIs
- strong alignment with AWS serverless learning goals

The MVP will avoid overcomplicating the backend by using a small number of handler files rather than a large number of tiny functions.

---

### API Layer

#### *AWS API Gateway*
API Gateway acts as the controlled entry point to the backend.

Its role is to:
- expose HTTPS endpoints
- route requests to Lambda
- separate frontend access from backend implementation

This creates a clean application boundary between the UI and the backend logic.

---

### Logging and Observability

#### *Amazon CloudWatch*
CloudWatch will be used for:
- Lambda execution logs
- debugging backend issues
- viewing request handling behavior
- supporting operational visibility

Logging is part of both the application design and the security baseline.

---

### Security Boundaries

The current architecture intentionally separates the application into controlled layers.

#### *Frontend Boundary*
The browser can interact with the frontend and call the backend API.

#### *Backend Boundary*
The backend is the only layer allowed to read and write application data.

#### *Database Boundary*
DynamoDB is not accessed directly by the browser.

This means the architecture follows a basic secure pattern:
- frontend for presentation
- backend for control and validation
- database for storage

---

### Current MVP Access Model
The MVP does not include authentication.

This means:
- application data is still persistent
- the board state is still saved in the cloud
- the app behaves as a shared workspace
- anyone with access to the app and API can view and modify the shared data

This is an intentional tradeoff to keep the first version finishable.

Authentication and user-specific authorization are planned as post-MVP enhancements.

---

### Infrastructure Management

#### *Terraform*
Terraform will be used to define the cloud infrastructure for `Sprint-Ops Tracker`.

Planned Terraform scope:
- S3 frontend hosting resources
- CloudFront distribution
- API Gateway
- Lambda functions
- DynamoDB tables
- IAM roles and policies
- CloudWatch-related resources as needed

This helps make the architecture repeatable and easier to explain.

---

### Architectural Priorities for MVP

The architecture is currently optimized for:
- simplicity
- finishability
- clear layer separation
- low-cost operation
- strong portfolio value
- room for future enhancement

It is not currently optimized for:
- multi-user identity
- advanced scaling patterns
- enterprise authorization models
- analytics-heavy reporting
- high feature depth

These can be added later once the core architecture is working.

---

### Current Architecture Lock
The current architecture for `Sprint-Ops Tracker` is:
- Frontend: React
- Frontend Hosting: S3 + CloudFront
- Backend: Node.js
- API Layer: API Gateway
- Compute: Lambda
- Database: DynamoDB
- Logging: CloudWatch
- Infrastructure as Code: Terraform

This is the locked architectural baseline for the MVP.

---

### Future Architecture Enhancements
Potential future additions include:
- `Cognito` for authentication
- protected API access
- user-specific data ownership
- `WAF`
- CI/CD pipelines
- richer observability
- a future Python API project as a separate portfolio track