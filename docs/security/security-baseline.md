# Sprint-Ops Tracker : Security Baseline

> [!info] ***Overview***
> ---
> This note defines the baseline security expectations for SprintOpsTracker during the MVP phase. It documents the minimum controls, design boundaries, and security tradeoffs for the first version of the application.

---

### Security Goal
The goal of the SprintOpsTracker MVP is not to be fully production-hardened, but to demonstrate that the application was designed with foundational security thinking in mind.

The MVP security baseline is intended to show:
- controlled access to backend resources
- separation between frontend, backend, and data layers
- safe handling of application input
- basic logging and visibility
- avoidance of obvious insecure design choices
- a clear path for future security enhancements

---

# Security Philosophy for the MVP
`Sprint-Ops Tracker` will follow a simple principle:

###### Keep the architecture secure by default where practical, but avoid adding complexity that would significantly delay completion of the first working version.

That means the MVP will focus on:
- strong architectural boundaries
- least privilege where possible
- safe backend patterns
- clear documentation of known limitations

Rather than:
- full identity and access management
- advanced detection engineering
- enterprise-grade hardening
- high-complexity controls that belong in later phases

---

### Core Security Boundaries

#### *1. No Direct Browser Access to the Database*
The frontend will not communicate directly with DynamoDB.

Instead:
- the browser talks to API Gateway
- API Gateway invokes Lambda
- Lambda performs validation and database operations

This creates a controlled boundary between user input and persistent data.

#### *2. Backend-Mediated Data Access*
All reads and writes will go through the backend API layer.

This allows the backend to:
- validate input
- enforce allowed field values
- shape responses
- reduce accidental exposure of internal data structures


#### *3. Layer Separation*
`Sprint-Ops Tracker` is intentionally separated into:
- frontend layer
- backend/API layer
- data layer

This supports a cleaner and safer architecture than exposing storage directly to the client.

---

### Minimum Security Controls for MVP

#### *1. Least Privilege IAM*
IAM permissions should be scoped so each backend function only has the permissions it needs.

Examples:
- Lambda functions should only access the tables they require
- Lambda should only have required DynamoDB actions
- permissions should avoid broad unnecessary wildcards where practical

Purpose:
- reduce blast radius
- reinforce good cloud security design habits


#### *2. Input Validation in the Backend*
All POST and PUT requests should be validated in the backend before writing data.

Examples of validation:
- required fields must be present
- allowed status values must be enforced
- allowed priority values must be enforced
- story points should be numeric
- string lengths should be constrained where appropriate

Purpose:
- reduce invalid data
- avoid trusting client input
- support more predictable application behavior


#### *3. Safe Error Handling*
The backend should return safe, controlled error messages.

Avoid:
- returning raw stack traces
- exposing internal implementation details
- leaking sensitive configuration values

Preferred pattern:
- log technical details internally
- return simple error responses to the frontend

Purpose:
- reduce unnecessary internal exposure
- improve application professionalism


#### *4. Logging and Visibility*
Backend execution should be logged to CloudWatch.

Logging should support:
- troubleshooting
- reviewing request failures
- understanding basic backend behavior

At minimum, logging should capture:
- handler activity
- validation failures
- backend errors
- major CRUD operations where useful

Purpose:
- support debugging
- reinforce operational awareness
- improve transparency during development


#### *5. HTTPS-Based Access*
The application should be delivered over HTTPS through:
- CloudFront for the frontend
- API Gateway for backend requests

Purpose:
- reduce insecure transport risk
- align with standard secure web delivery expectations


#### *6. Restricted CORS*
CORS should be configured intentionally rather than left overly broad.

Goal:
- allow requests from the intended frontend origin
- avoid unnecessary permissive cross-origin behavior

Purpose:
- reinforce clean browser-to-API boundaries
- reduce accidental exposure to unwanted origins


#### *7. No Secrets in Source Code*
No credentials, tokens, or secrets should be hardcoded into the frontend or backend source code.

Examples:
- no AWS secrets in code
- no sensitive config committed to Git
- use environment variables or managed configuration patterns when needed

Purpose:
- prevent avoidable credential exposure
- establish good engineering habits early

---

### Current Security Tradeoffs

#### *1. No Authentication in the MVP*
Authentication is intentionally excluded from the MVP.

This means:
- the app does not identify individual users
- the app behaves as a shared persisted workspace
- anyone with access to the app can view and modify the same board state

This is a known limitation, not an oversight.

Reason for deferral:
- authentication adds major implementation complexity
- the project should first prove its core architecture and workflow
- auth is better treated as an immediate post-MVP enhancement

#### *2. No User-Specific Authorization*
Because the MVP does not include sign-in, it also does not include:
- ownership controls
- role-based access control
- per-user data isolation
- audit attribution by user

These are planned future improvements.


#### *3. Not a Production-Hardened Security Model*
The MVP should be understood as a security-aware portfolio application, not a fully hardened enterprise platform.

That means the focus is:
- sound design choices
- reasonable boundaries
- clean cloud patterns
- documented limitations

---

### Data Protection Approach

#### *Current MVP Data Model*
The application will persist:
- project records
- sprint records
- work item records

At the MVP stage, the design assumption is:
- data is application data only
- no sensitive regulated data should be stored
- the project is for portfolio and learning use

This reduces the need for advanced data protection features in the initial release.

---

### Security Design Rules for Implementation
As development continues, these rules should guide implementation decisions:
1. Do not trust the frontend to validate security-critical input.
2. Do not give the browser direct access to backend storage.
3. Do not add secrets to source control.
4. Do not expose unnecessary internal details in responses.
5. Do not widen IAM permissions without a clear need.
6. Prefer simple secure patterns over clever but fragile designs.

---

### Security Features Deferred to Post-MVP
The following security-related enhancements are intentionally deferred:
- `Cognito` user authentication
- authorization rules
- user ownership model
- audit history
- stronger request throttling strategies
- `WAF`
- richer monitoring and alerting
- CI/CD security scanning
- signed deployment controls
- secret management enhancements

These are valid future improvements, but they are not part of the MVP baseline.

---

### MVP Security Success Criteria
The MVP security baseline will be considered met when:
- frontend does not access DynamoDB directly
- backend validates write requests
- backend returns controlled error messages
- Lambda permissions are scoped reasonably
- logs are available in CloudWatch
- frontend and API are delivered over HTTPS
- secrets are not stored in source code
- known security limitations are documented clearly

---

### Current Security Baseline Lock
The current security baseline for SprintOpsTracker is:
- API-mediated database access only
- no direct browser-to-database communication
- least privilege IAM for backend functions
- backend input validation
- safe error handling
- CloudWatch logging
- HTTPS delivery
- restricted CORS
- no secrets in source code
- no authentication until post-MVP

This is the locked minimum security posture for the MVP.

---

### Immediate Next Security Follow-Up
The next security-related documentation step should be to align these controls with the eventual implementation plan so that:
- frontend behavior
- backend logic
- IAM design
- infrastructure configuration

all reflect this baseline consistently.