# Sprint-Ops Tracker : Tech Stack

> [!info] ***Overview***
> ---
> This note documents the current technology choices for `Sprint-Ops Tracker` and explains why each part of the stack was selected for the MVP.

### Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | Build the user interface and manage app state |
| Backend | Node.js | Power the serverless API logic |
| API Layer | AWS API Gateway | Expose HTTPS endpoints to the frontend |
| Compute | AWS Lambda | Run backend logic without managing servers |
| Database | DynamoDB | Store projects, sprints, and work items |
| Infrastructure as Code | Terraform | Define and deploy AWS infrastructure consistently |
| Frontend Hosting | Amazon S3 | Host the built static frontend assets |
| CDN / HTTPS Delivery | Amazon CloudFront | Deliver frontend content securely and efficiently |
| Logging / Monitoring | Amazon CloudWatch | Capture logs and support troubleshooting |

---

### Frontend

#### *React*
React was selected for the frontend because the application needs:
- multiple pages
- reusable UI components
- form handling
- dynamic updates without full page reloads
- stateful views such as backlog and sprint board pages

React is also a strong portfolio choice because it is widely used and fits well with application-style frontends.

> [!note ] ***Note: Why Not Plain HTML/CSS/JS***
> ---
> Vanilla JavaScript would be simpler at the very beginning, but the app is state-driven enough that React provides better structure and better portfolio value.


### Backend

#### *Node.js*
Node.js was selected for the backend because:
- it aligns with the JavaScript used in React
- it reduces context switching between frontend and backend
- it works well with JSON-heavy APIs
- it is commonly used in AWS Lambda examples and serverless projects
- it is practical for a first cloud portfolio application

---

### API Layer

#### *AWS API Gateway*
API Gateway will provide the public API endpoints used by the React frontend.

It was selected because it:
- integrates directly with Lambda
- supports HTTPS endpoints
- fits AWS serverless design patterns
- allows the frontend to call backend logic cleanly

This keeps the frontend separated from the database and enforces an application boundary.

---

### Compute Layer

#### *AWS Lambda*
Lambda was selected as the compute model for the backend because:
- it avoids managing servers
- it supports low-cost usage for small projects
- it aligns with the goal of learning AWS serverless architecture
- it is a strong fit for event-driven API processing

For the MVP, the backend will use three main handlers:
- `projectsHandler`
- `sprintsHandler`
- `itemsHandler`

This keeps the backend organized without overcomplicating the Lambda design.

---

### Database

#### *DynamoDB*
DynamoDB was selected because:
- it fits serverless AWS architecture well
- it avoids the overhead of managing a traditional database server
- it is a strong learning opportunity for AWS-native data modeling
- it is suitable for storing work items, sprint records, and project records

For the MVP, the design will favor clarity over advanced optimization.

Current plan:
- `Projects` table
- `Sprints` table
- `WorkItems` table


---

### Infrastructure as Code

#### *Terraform*
Terraform was selected because:
- it is highly relevant for cloud and DevSecOps roles
- it allows the infrastructure to be defined consistently
- it makes the project easier to recreate and document
- it strengthens the portfolio value of the project

Terraform will be used to define:
- S3 bucket
- CloudFront distribution
- API Gateway
- Lambda functions
- DynamoDB tables
- IAM roles and policies
- CloudWatch log groups

---

### Frontend Hosting

#### *Amazon S3*
The frontend build output will be hosted in S3 because:
- the frontend is a static web application after build
- S3 is low-cost and fits static hosting well
- it works naturally with CloudFront

#### *Amazon CloudFront*
CloudFront will sit in front of S3 because:
- it improves delivery of frontend assets
- it supports HTTPS delivery
- it reflects a more production-like hosting pattern
- it is commonly used in AWS web architectures

---

### Logging and Monitoring

#### *Amazon CloudWatch*
CloudWatch will be used for:
- Lambda execution logs
- debugging backend behavior
- reviewing errors
- monitoring general application activity

> [!note] ***Note***
> ---
> Logging is part of the project’s security and operations baseline, not just a deployment extra.

---

### Security Alignment of the Stack

The stack supports the project’s security baseline in several ways:

- React frontend does not access the database directly
- API Gateway and Lambda provide an application control layer
- DynamoDB access can be restricted through IAM
- CloudWatch supports visibility and troubleshooting
- CloudFront and API Gateway support HTTPS-based access
- Terraform helps make infrastructure decisions explicit and repeatable

---

# $ Cost Alignment of the Stack 

The stack was also chosen to support a low-cost learning and portfolio project.

Cost-conscious choices include:
- static frontend hosting instead of always-on servers
- Lambda instead of a persistent backend server
- DynamoDB instead of a managed relational database for the MVP
- serverless-first architecture to reduce idle cost

This helps keep the project practical to build and demo.

---

# Current Locked Stack

The current stack decision for `Sprint-Ops Tracker` is:
- Frontend: `React`
- Backend: `Node.js`
- API Layer: `AWS API Gateway`
- Compute: `AWS Lambda`
- Database: `DynamoDB`
- Infrastructure as Code: `Terraform`
- Frontend Hosting: `S3 + CloudFront`
- Logging / Monitoring: `CloudWatch`

---

# Future Enhancements Related to the Stack

Potential later additions:
- `Cognito` for authentication
- GitHub Actions for CI/CD
- `WAF` for additional edge protection
- Python `FastAPI` in a separate future portfolio project