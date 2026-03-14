# Sprint-Ops Tracker

> [!info] ***Project Description***
> ---
> `Sprint-Ops Tracker` is a lightweight, Jira-inspired sprint and backlog tracking application for small-team workflow management. It is being built as a portfolio project to demonstrate practical AWS serverless architecture, React frontend development, Node.js backend development, Terraform-based infrastructure as code, and foundational DevSecOps design thinking.
> 
> 
 > ### *** Project Goal***
>  
> The goal of SprintOpsTracker is to build a realistic, low-cost cloud project that helps demonstrate job-ready cloud and DevSecOps skills.
> 
> This project is intended to show:
> - AWS architecture understanding
> - frontend and backend integration
> - serverless API development
> - NoSQL data modeling
> - infrastructure as code
> - cloud security fundamentals
> - ability to scope and document a real project

---
### MVP Overview

In the MVP, SprintOpsTracker uses a shared persisted workspace model. Application data is stored in the backend and remains available across sessions, but access is not yet tied to authenticated users. As a result, anyone with access to the application can view and modify the same shared board until authentication and authorization are added.

> [!success] ***In Scope***
> ---
> - create work items
> - view backlog items
> - edit and delete work items
> - create sprints
> - view sprint list
> - assign work items to a sprint
> - update work item status
> - view active sprint board
> - simple dashboard view
> ---
> More details in: [[mvp-scope]]

> [!warning] ***Out of Scope***
> ---
> - authentication
> - comments
> - attachments
> - notifications
> - drag-and-drop interactions
> - analytics dashboards
> - audit history
> - multi-user roles
> - real-time collaboration
> ---
> More details in: [[mvp-scope]]

> [!example] Tech Stack
> ---
> - Frontend: `React`
> - Backend: `Node.js`
> - API Layer: `AWS API Gateway` + `AWS Lambda`
> - Database: `DynamoDB`
> - Infrastructure as Code: `Terraform`
> - Frontend Hosting: `S3` + `CloudFront`
> - Monitoring / Logging: `CloudWatch`
> ---
> More details in: [[tech-stack]]

> [!abstract] ***Core Workflow***
> ---
> 1. User opens the app
> 2. User views backlog items
> 3. User creates a work item
> 4. User creates a sprint
> 5. User assigns work items to that sprint
> 6. User opens the sprint board
> 7. User updates work item statuses as work progresses
> 8. User closes the sprint when complete

---
### Architecture Summary
Sprint-Ops Tracker uses a React frontend hosted through S3 and CloudFront. The frontend sends requests to API Gateway, which invokes Lambda functions written in Node.js. Lambda handles request validation, business logic, and reads/writes data in DynamoDB. Logs are sent to CloudWatch. More info in [[architecture-summary]].

#### *Security Baseline*
- no direct browser access to DynamoDB
- all data access goes through API Gateway and Lambda
- least privilege IAM
- backend input validation
- safe error handling
- CloudWatch logging
- restricted CORS
- no secrets in source code
- HTTPS through CloudFront and API Gateway

#### *Build Phases*
1. Create repo structure and documentation
2. Build React routing and empty pages
3. Build navbar
4. Build backend handlers with fake JSON
5. Connect Backlog page to fake `GET /items`
6. Implement real item CRUD
7. Implement sprint CRUD
8. Connect items to sprints and build sprint board
9. Deploy to AWS with Terraform
10. Polish documentation and portfolio presentation
