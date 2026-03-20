# Sprint-Ops Tracker - Backend Logic and Troubleshooting Reflection Notes

> [!info]
> ##### Focus
> - Backend request flow and responsibility split
> - DynamoDB integration patterns
> - API response structure
> - Troubleshooting mistakes and what they taught me
> - Key backend lessons from building through dashboard and backlog logic

---

## Backend Architecture Reflection

> [!abstract]
> ##### Core backend flow
> - The backend was built so the frontend does **not** talk directly to `DynamoDB`.
> - The React frontend calls API endpoints exposed by the local `Express` server.
> - The `Express` server routes requests into backend handler logic.
> - Handler logic either:
>   - follows a Lambda-style wrapper pattern already used in the project, or
>   - uses direct Express handlers for newer features like dashboard summary.
> - Backend services perform the real data logic such as:
>   - reading items
>   - reading sprints
>   - calculating summary counts
>   - updating item fields
>   - assigning items to sprints

> [!abstract]
> ##### Responsibility split
> - `server.js`
>   - receives HTTP traffic
>   - maps routes to handlers
> - `handlers`
>   - receive request input
>   - call service logic
>   - return structured JSON responses
> - `services`
>   - contain business/data logic
>   - interact with `DynamoDB`
> - `utils`
>   - shared helpers such as:
>     - response formatting
>     - validation
>     - DynamoDB client setup

---

## Key Backend Logic I Built

> [!abstract]
> ##### Dashboard summary endpoint
> - A new backend route was added:
>   - `GET /dashboard/summary`
> - This route was designed to provide one aggregated payload for the dashboard page.
> - Instead of forcing the frontend to compute multiple counts, the backend computes and returns:
>   - project-wide item counts by status
>   - project-wide item counts by priority
>   - currently active sprint summary
>   - number of items assigned to the active sprint

> [!abstract]
> ##### Why this was the right design
> - It keeps the frontend lighter and simpler.
> - It centralizes summary logic in the backend.
> - It is easier to migrate later to `Lambda` / `API Gateway`.
> - It follows better separation of concerns:
>   - frontend = presentation
>   - backend = data shaping and logic

> [!abstract]
> ##### Summary logic details
> - The service reads from both:
>   - `WorkItems`
>   - `Sprints`
> - It identifies the active sprint using:
>   - `sprint.status === "Active"`
> - It calculates workflow counts using all items:
>   - `Backlog`
>   - `Ready`
>   - `In Progress`
>   - `Blocked`
>   - `Done`
> - It calculates priority counts using:
>   - `Low`
>   - `Medium`
>   - `High`
>   - `Critical`
> - If an active sprint exists, it counts how many items are assigned to that sprint by matching:
>   - `item.sprintId === activeSprint.sprintId`

---

## API Response Design Reflection

> [!abstract]
> ##### Response wrapper pattern
> - The backend uses helper functions for consistent response formatting.
> - `successResponse(data)` returns:
>
> ```js
> {
>   success: true,
>   data
> }
> ```
>
> - `errorResponse(message)` returns:
>
> ```js
> {
>   success: false,
>   error: message
> }
> ```

> [!abstract]
> ##### Why this matters
> - It gives the frontend a predictable response shape.
> - It makes error handling more consistent.
> - It helps avoid ad hoc JSON response patterns across different endpoints.
> - It is useful preparation for more mature API design later.

> [!abstract]
> ##### Lambda alignment note
> - `buildResponse(statusCode, body)` is not required for normal `Express` `res.json(...)` responses.
> - But keeping it was still valuable because it aligns with how `Lambda` handlers often return objects.
> - This helps bridge local `Express` development with possible future serverless migration.

---

## DynamoDB Logic Reflection

> [!abstract]
> ##### Client setup lesson
> - The project uses:
>   - `DynamoDBClient`
>   - wrapped with `DynamoDBDocumentClient`
> - This wrapper is important because it allows work with normal JavaScript objects instead of low-level DynamoDB attribute formats.

> [!abstract]
> ##### Key export/import lesson
> - `dynamoClient.js` exported:
>
> ```js
> module.exports = { dynamoDb };
> ```
>
> - That means the correct import pattern is:
>
> ```js
> const { dynamoDb } = require("../utils/dynamoClient");
> ```
>
> - I initially imported it incorrectly as:
>
> ```js
> const dynamoDb = require("../utils/dynamoClient");
> ```
>
> - That caused the runtime issue:
>   - `dynamoDb.send is not a function`

> [!caution]
> ##### Analyst Key Takeaways
> - The shape of an export determines the import syntax.
> - If a module exports an object with named properties, destructuring is required.
> - Runtime method errors like `X is not a function` often indicate:
>   - wrong import shape
>   - wrong export pattern
>   - stale assumptions about module structure

---

## Troubleshooting Lessons

> [!abstract]
> ##### Error 1 - `errorResponse is not a function`
> - The dashboard route initially failed with:
>   - `TypeError: errorResponse is not a function`
> - At first glance, it looked like the utility helper itself was wrong.
> - But the actual issue was that the catch block error was masking the real underlying dashboard service failure.
> - Replacing the catch response temporarily with inline JSON helped expose the true backend problem.

> [!abstract]
> ##### What this taught me
> - Secondary errors inside a catch block can hide the original root cause.
> - When debugging, sometimes simplifying the catch path is the fastest way to surface the real issue.
> - A failing error handler can make the wrong thing look broken.

> [!abstract]
> ##### Error 2 - `dynamoDb.send is not a function`
> - After simplifying the dashboard handler catch logic, the real error appeared:
>   - `dynamoDb.send is not a function`
> - This led back to the import/export mismatch in `dynamoClient.js`.
> - Fixing the import to:
>
> ```js
> const { dynamoDb } = require("../utils/dynamoClient");
> ```
>
> solved the issue.

> [!abstract]
> ##### What this taught me
> - Do not assume utility imports match memory or previous examples.
> - Always inspect the actual exported module structure.
> - If a method expected on an object is missing, verify the object shape first.

> [!abstract]
> ##### Route wiring lesson
> - Existing item and sprint routes used a Lambda-style event wrapper pattern inside `server.js`.
> - The dashboard handler was built as a direct Express handler.
> - That meant it had to be mounted like:
>
> ```js
> app.get("/dashboard/summary", getDashboardSummaryHandler);
> ```
>
> rather than following the older `itemsHandler({...})` pattern.

> [!abstract]
> ##### What this taught me
> - Not all handlers in a codebase have to follow the exact same style if the system is evolving.
> - But mixed handler patterns increase the need to pay attention when wiring new routes.
> - I need to understand whether a handler expects:
>   - Express `req/res`
>   - or a custom event object

---

## Data Contract Lessons Between Frontend and Backend

> [!abstract]
> ##### Wrapped response awareness
> - The dashboard API did not return raw summary data directly.
> - It returned:
>
> ```js
> {
>   success: true,
>   data: {
>     ...
>   }
> }
> ```
>
> - That meant the frontend needed:
>
> ```js
> const result = await getDashboardSummary();
> setDashboardData(result.data);
> ```
>
> - instead of assuming the response itself was the summary object.

> [!abstract]
> ##### What this taught me
> - Backend response shape must be matched exactly in the frontend.
> - Even when the endpoint works, the UI can fail if the frontend reads the wrong level of the JSON structure.
> - Clear API contracts matter.

---

## Item Editing / Creation Logic Lessons

> [!abstract]
> ##### Update behavior
> - Updating an item required sending the full payload shape expected by the backend, not just one changed field.
> - For example, when updating title/status/priority, the update call still preserved:
>   - description
>   - storyPoints
>   - assignee
>   - labels
>   - sprintId
>   - projectId

> [!abstract]
> ##### Why this matters
> - If omitted fields are not preserved, updates can accidentally wipe out item properties.
> - Partial update assumptions are dangerous unless the backend explicitly supports patch semantics.

> [!abstract]
> ##### Sprint assignment logic
> - Assigning an item to a sprint was handled by updating the item’s `sprintId`.
> - This reinforced that sprint assignment is not a separate special object relationship in this MVP.
> - It is currently just a field on the item record.

> [!abstract]
> ##### Create-form lesson
> - When the create form expanded/collapsed, state had to be reset intentionally.
> - Status, priority, sprint, title, and description all needed clean reset behavior after:
>   - successful create
>   - cancel
> - Otherwise the UI would preserve stale values.

---

## Express + Form Logic Troubleshooting Lesson

> [!abstract]
> ##### Async click handler issue
> - A UI error appeared because `await loadItems()` was used inside a non-async click handler.
> - This created the familiar:
>   - `await expressions are only allowed within async functions`
> - The real lesson was that cancel logic did not need to reload items anyway.
> - The better fix was simply removing the unnecessary await/reload.

> [!abstract]
> ##### What this taught me
> - Not every UI action needs a backend refresh.
> - Cancel actions should usually just reset local state.
> - If I find myself adding `await` to cancel/reset logic, I should question whether reloading is actually necessary.

---

## Bigger Engineering Lessons

> [!info]
> ##### What I learned about backend development from this phase
> - Working backend logic is not just about writing code that compiles.
> - I have to reason through:
>   - route style
>   - response shape
>   - utility export/import structure
>   - service responsibility
>   - frontend/backend data contracts
>   - state reset behavior after API calls
> - Small mismatches in assumptions can break the full flow even when individual pieces look correct on their own.

> [!info]
> ##### What I learned about troubleshooting
> - Read the actual runtime error carefully.
> - Simplify the failing path if needed to expose the real root cause.
> - Verify file exports and imports rather than assuming them.
> - Debugging is often about confirming object shapes, response structures, and control flow more than “writing more code.”

> [!info]
> ##### What I learned about architecture
> - Centralizing summary logic in the backend made the frontend cleaner.
> - Response helpers improved consistency.
> - The handler/service/utils split made the system easier to reason about.
> - Even in a small MVP, clean layering makes future growth easier.

---

## Self-Check Questions

> [!caution]
> ##### Review prompts
> - Why is it better for the dashboard summary to be calculated in the backend instead of the frontend?
> - What is the difference between a direct Express handler and a Lambda-style wrapped handler?
> - Why did `dynamoDb.send is not a function` happen?
> - What import pattern is required when a file exports `module.exports = { dynamoDb }`?
> - Why can a failing catch block hide the real underlying error?
> - Why does the frontend need `result.data` instead of just `result` for wrapped API responses?
> - Why should cancel/reset actions usually avoid unnecessary reload calls?
> - Why is preserving unchanged fields important during an update request?

---

## Summary Reflection

> [!success]
> ##### Key Outcomes
> - I successfully added a new backend summary endpoint for the dashboard.
> - I worked through real backend troubleshooting issues involving:
>   - utility response handling
>   - import/export mismatches
>   - DynamoDB client usage
>   - route wiring differences
> - I reinforced the importance of:
>   - clean service boundaries
>   - stable response contracts
>   - careful debugging of runtime errors
> - This phase moved me beyond just basic CRUD and into more realistic backend design and troubleshooting thinking.