# Sprint-Ops Tracker Reflection Log : Phase 5

> [!info] ***Overview***
> ---
> Phase 5 was the first time `Sprint-Ops Tracker` became a true end-to-end application slice instead of a structured prototype. This phase moved the project from fake frontend data and in-memory backend storage into real CRUD behavior backed by DynamoDB. It was also a major personal learning milestone because nearly every part of the workflow was new: React patterns, Node.js backend structure, local API development, AWS credentials, DynamoDB, the AWS SDK, and persistence testing.

---

> [!abstract] ***What This Phase Was About***
> ---
> #### *Primary Goal*
> Build the first fully working vertical slice of the application for work items.
>
> #### *What That Included*
> - defining the work item model
> - creating a local backend API for item CRUD
> - connecting the frontend to that real backend
> - moving from in-memory storage to DynamoDB
> - validating input and returning controlled responses
>
> #### *Why It Mattered*
> This was the phase where SprintOpsTracker stopped feeling like a mock application and started behaving like a real cloud-backed system.

---

> [!abstract] ***What I Built***
> ---
> #### *Backend Work*
> - created a local Express-based API layer for development
> - implemented item CRUD flow through:
>   - `GET /items`
>   - `GET /items/{id}`
>   - `POST /items`
>   - `PUT /items/{id}`
>   - `DELETE /items/{id}`
> - created and used:
>   - `itemsHandler.js`
>   - `itemsService.js`
>   - `dynamoClient.js`
>   - shared validation and response utilities
>
> #### *Frontend Work*
> - connected `BacklogPage` to the real backend API
> - added create item functionality
> - added delete item functionality
> - added inline edit functionality
> - added editing for:
>   - title
>   - status
>   - priority
>
> #### *AWS Work*
> - created the `WorkItems` DynamoDB table
> - configured AWS CLI credentials
> - installed AWS CLI in WSL
> - installed the AWS SDK packages for the backend
> - confirmed records were being written to DynamoDB

---

> [!abstract] ***What Was New to Me***
> ---
> #### *Completely New or Mostly New Areas*
> - React development workflow
> - Node.js backend project structure
> - Express local API development
> - import/export patterns in JavaScript
> - npm-based package management in a real project
> - AWS access key creation and CLI configuration
> - DynamoDB table setup
> - AWS SDK usage in code
> - connecting application code to real cloud persistence
>
> #### *Why This Stood Out*
> This phase felt significant because it was not just learning one new tool. It was learning how multiple unfamiliar tools and concepts fit together in a single development flow.

---

> [!abstract] ***What Made This Phase Challenging***
> ---
> #### *Technical Challenges*
> - JavaScript and React syntax still felt unfamiliar compared to Python
> - import/export issues caused white-screen frontend errors earlier in the process
> - understanding the difference between frontend API consumption and backend endpoint creation took effort
> - backend dependencies had to be installed and wired correctly
> - running tools across WSL and Windows introduced some confusion
> - AWS authentication and CLI setup added an infrastructure layer on top of the app logic
>
> #### *Conceptual Challenges*
> - learning the difference between:
>   - fake frontend data
>   - real local API behavior
>   - real persistence in DynamoDB
> - understanding that “CRUD working” is not the same as “persistent CRUD working”
> - realizing that local backend success still requires separate validation that cloud storage is actually receiving data
>
> #### *Reflection*
> This phase was challenging because every layer of the stack started mattering at once:
> - frontend
> - backend
> - local development server
> - credentials
> - AWS services
> - database persistence

---

> [!abstract] ***What Became Clearer During This Phase***
> ---
> #### *Backend Understanding*
> - handlers act like traffic controllers
> - services hold data logic and storage behavior
> - utility files keep repeated logic reusable
> - Express can be used as a local bridge before full AWS deployment
>
> #### *Frontend Understanding*
> - `api.js` acts as the frontend’s backend-client layer
> - pages load data, store state, and render based on responses
> - frontend CRUD behavior depends on clean request/response patterns
>
> #### *Cloud Understanding*
> - DynamoDB is the real persistence layer, not just a concept in the architecture
> - AWS CLI credentials are a practical requirement, not just a background setup task
> - SDK installation and configuration are part of making cloud services actually usable from code
>
> #### *Big Takeaway*
> This phase made the architecture real. The project now has a frontend, a backend, and a cloud data layer that are all actively interacting.

---

> [!abstract] ***What Went Well***
> ---
> #### *Wins*
> - item CRUD was successfully built end to end
> - the frontend now talks to a real backend instead of hardcoded data
> - the backend now talks to DynamoDB instead of in-memory storage
> - item records were successfully written to DynamoDB and visible in the console
> - create, update, and delete behavior now feel like real application functionality
> - the project now has a legitimate vertical slice that can be demonstrated
>
> #### *Why These Wins Matter*
> This was the first phase where the project proved that the system design was not just theoretical. The pieces actually worked together.

---

> [!abstract] ***What I Learned About the Dev Process***
> ---
> #### *Process Lessons*
> - building locally first was the right decision
> - using fake data before real persistence reduced complexity at the right time
> - moving from shell -> fake integration -> real local API -> real persistence created a logical learning path
> - testing each layer separately made debugging easier
> - validating backend behavior directly before relying on the frontend was important
>
> #### *Development Lesson*
> The best approach was not “understand everything first, then build.”  
> It was “build in controlled layers, understand each layer as it becomes relevant.”

---

> [!abstract] ***What This Phase Taught Me About Systems Design***
> ---
> #### *Architectural Lessons*
> - a working system depends on clear separation of concerns
> - frontend, backend, and persistence should each have their own responsibility
> - persistence choice changes the behavior and value of the system significantly
> - cloud services are not just architecture boxes; they introduce setup, permissions, SDK usage, and testing realities
>
> #### *Design Lesson*
> This phase reinforced that system design is not only about diagrams. It is also about making decisions that can actually be implemented and validated in a working system.

---

> [!abstract] ***What Still Feels Unfamiliar***
> ---
> #### *Current Weak Spots*
> - JavaScript fluency still needs improvement
> - React component patterns are still new
> - backend JavaScript code is more understandable than before, but not yet natural
> - AWS service setup still feels like something I am learning actively rather than something I can do automatically
>
> #### *Honest Reflection*
> I still do not feel fluent in this stack, but I do feel much more grounded. The project helped make the stack feel real instead of abstract.

---

> [!caution] ***Key Takeaways***
> ---
> - Phase 5 was the first major full-stack milestone in SprintOpsTracker.
> - This phase introduced real persistence, which made the app feel legitimate.
> - Nearly every part of the phase involved new technology or a new workflow.
> - The hardest part was not any single file, but learning how frontend, backend, AWS, and persistence all connect.
> - Seeing records successfully appear in DynamoDB was a major confidence point because it proved the system was actually working.
> - This phase showed that I can learn unfamiliar cloud and development tooling by building in structured stages.

---

> [!success] ***End-of-Phase Position***
> ---
> By the end of Phase 5, `Sprint-Ops Tracker` had:
>
> - real work item CRUD
> - a real local backend API
> - a React frontend connected to that backend
> - DynamoDB-backed persistence
> - visible records in AWS
> - a completed first vertical slice of the application
>
> This phase turned SprintOpsTracker from a structured learning project into a real cloud application in progress.