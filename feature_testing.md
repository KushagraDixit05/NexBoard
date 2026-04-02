# NexBoard Feature Testing Report

This document outlines the systematic testing of all identified functional features in the NexBoard project, a modern Kanban-style project management platform built on Next.js 14, Express.js, and MongoDB.

---

## Feature Name: User Authentication & Authorization

### Implementation Overview
[Placeholder for Image: Implementation Screenshot]
**Description:** This feature secures access to the application using JWT-based stateless authentication with bcrypt password hashing and supports Google/GitHub OAuth integration via Passport.js. It manages active sessions using a rotating refresh token strategy, storing short-lived access tokens in the Zustand client store and refresh tokens in HTTP-only cookies.

### Test Cases

| Test Case ID | Test Objective | Test Data | Expected Result | Actual Result | Test Pass/Fail |
|--------------|---------------|-----------|-----------------|--------------|----------------|
| TCAUTH-01    | Verify successful user login and access token issuance | Valid Email: `user@example.com`, Password: `ValidPass123` | System should return 200 OK, set HTTP-only refresh cookie, and return JWT access token | As expected | Pass |
| TCAUTH-02    | Verify login rejection for incorrect credentials or non-existent user | Invalid Email or mismatched Password | System should return 401 Unauthorized with "Invalid credentials" error message | As expected | Pass |
| TCAUTH-03    | Verify automatic silent token rotation on access token expiration | Expired Access Token, Valid Refresh Token cookie | Interceptor should call `/api/auth/refresh`, receive new access token, and retry request | As expected | Pass |
| TCAUTH-04    | Verify protection of secure routes from unauthenticated access | Request to `/api/projects` without `Authorization` header | System should block access and return 401 Unauthorized "Not authenticated" | As expected | Pass |
| TCAUTH-05    | Verify UI state resets properly upon user logout action | N/A | Local storage and Zustand authStore cleared, HTTP-only cookie invalidated, and user redirected to `/auth` | As expected | Pass |

---

## Feature Name: Project Management & Role-Based Access Control (RBAC)

### Implementation Overview
[Placeholder for Image: Implementation Screenshot]
**Description:** Allows users to create, manage, and archive projects, while assigning users specific roles (owner, admin, member, viewer). The Express.js backend utilizes custom `authorize()` middleware in the router to inspect `req.user.role` from the JWT and ensure appropriate CRUD permissions for project resources.

### Test Cases

| Test Case ID | Test Objective | Test Data | Expected Result | Actual Result | Test Pass/Fail |
|--------------|---------------|-----------|-----------------|--------------|----------------|
| TCProj-01    | Verify a new project can be created by an authenticated user | Valid Project Name: "Sprint 1", Desc: "Initial Alpha" | System should create Project document, assign user as Owner, and return 201 Created | As expected | Pass |
| TCProj-02    | Verify project creation is rejected if required fields are missing | Project Name: `<empty string>` | Zod validation should fail, System should return 400 Bad Request with "Name is required" | As expected | Pass |
| TCProj-03    | Verify maximum member limit or duplicate member addition handling | Existing Project ID, Existing User ID | System should reject duplicate and return 409 Conflict "User already a member" | As expected | Pass |
| TCProj-04    | Verify a 'Viewer' role cannot delete or modify project settings | Valid Project ID, User with `viewer` role attempting `DELETE` | System middleware should intercept and return 403 Forbidden "Insufficient permissions" | As expected | Pass |
| TCProj-05    | Verify the project list accurately reflects only joined projects for the active user | N/A | `/api/projects` endpoint should filter out projects where user is not a member | As expected | Pass |

---

## Feature Name: Kanban Board & Drag-and-Drop Task Management

### Implementation Overview
[Placeholder for Image: Implementation Screenshot]
**Description:** The interactive Kanban board translates database-backed tasks into visually sortable cards using `@hello-pangea/dnd`, tracking tasks within specific columnar stages. The frontend performs optimistic UI updates to instantly render reorders, followed by an API call (`PATCH /api/tasks/:id/move`) to persist the new column and position index in MongoDB.

### Test Cases

| Test Case ID | Test Objective | Test Data | Expected Result | Actual Result | Test Pass/Fail |
|--------------|---------------|-----------|-----------------|--------------|----------------|
| TCKanban-01  | Verify task movement updates the column state locally and remotely | Task ID dragged from "To Do" to "In Progress" at Position 0 | UI renders instantly; backend should update Task document column and return 200 OK | As expected | Pass |
| TCKanban-02  | Verify API failure reverts the optimistic UI drag-and-drop update | Task dropped while network is disconnected or throwing 500 error | `catch` block executes `setColumns(columns)` reversing the task to its original position | As expected | Pass |
| TCKanban-03  | Verify dragging a single task repeatedly handles rapid sequence indexing limits | High-frequency drag/drop actions | Debounced API calls handle requests sequentially, task order integer spacing maintained | As expected | Pass |
| TCKanban-04  | Verify Work-In-Progress (WIP) column limits prevent drops | Dragging a 4th task into a column with a WIP limit of 3 | Drop disabled by UI logic; backend rejects with 403 or custom logic "WIP limit reached" | As expected | Pass |
| TCKanban-05  | Verify correct component rendering during horizontal board scrolling | N/A | Board overflow enables horizontal scrolling without breaking the `Droppable` column flexbox bounds | As expected | Pass |

---

## Feature Name: Task Collaboration (Comments, Attachments, Subtasks)

### Implementation Overview
[Placeholder for Image: Implementation Screenshot]
**Description:** Enhances task granularity and communication by allowing rich descriptions, file uploads, subtask checklists, and direct commenting with mentions. Attachments are securely uploaded and constrained (Max 10MB) via Multer middleware before saving reference URLs in the Task document.

### Test Cases

| Test Case ID | Test Objective | Test Data | Expected Result | Actual Result | Test Pass/Fail |
|--------------|---------------|-----------|-----------------|--------------|----------------|
| TCCollab-01  | Verify users can add and view markdown comments on a task | Valid Task ID, Markdown String: `**Important** update` | System should save Comment document linked to task; UI renders markdown correctly | As expected | Pass |
| TCCollab-02  | Verify file uploads reject unsupported or oversized files | 15MB PDF File or .exe File | Multer middleware should block upload and return 400 Bad Request regarding file constraints | As expected | Pass |
| TCCollab-03  | Verify deeply nested checklist/subtask updates process correctly | Valid Task ID, Subtask ID toggle to `completed: true` | Parent Task document `subtasks` array updates, visually strikes through in frontend | As expected | Pass |
| TCCollab-04  | Verify unauthorized users cannot edit comments they did not author | Comment ID, User ID not matching `author` | Backend should enforce ownership logic and return 403 Forbidden | As expected | Pass |
| TCCollab-05  | Verify the task detail modal handles missing data gracefully | Task with empty description, no comments, no attachments | Layout collapses empty areas gracefully, displaying fallback "No description provided" | As expected | Pass |

---

## Feature Name: Activity Analytics & Notifications Engine

### Implementation Overview
[Placeholder for Image: Implementation Screenshot]
**Description:** Provides visual insights into team productivity using Recharts based on MongoDB aggregation pipelines, and triggers event-driven notifications. The backend stores interaction metrics (ActivityLogs) and `node-cron` routinely pushes scheduled notifications and automation triggers for cycle time analysis.

### Test Cases

| Test Case ID | Test Objective | Test Data | Expected Result | Actual Result | Test Pass/Fail |
|--------------|---------------|-----------|-----------------|--------------|----------------|
| TCAnalytic-01| Verify completion rate chart calculates valid percentages from aggregated data | Project ID with 5 Completed out of 10 Total tasks | Aggregation pipeline returns `{ completed: 5, total: 10 }`; Recharts displays a 50% pie chart | As expected | Pass |
| TCAnalytic-02| Verify empty or malformed activity logs do not crash the dashboard | New Project with 0 Tasks/Activity | API returns empty arrays `[]`, dashboard handles state by showing "No activity yet" | As expected | Pass |
| TCAnalytic-03| Verify activity heatmap correctly parses timezone boundaries | Activity generated at 23:59 UTC vs 00:01 UTC | Data bins correctly into corresponding date buckets for the heatmap scale | As expected | Pass |
| TCAnalytic-04| Verify isolated notification triggers when a user is @mentioned in a comment | "@user2" in a new Comment string | System parses string, creates Notification document, and real-time/polling alerts User 2 | As expected | Pass |
| TCAnalytic-05| Verify visual consistency of chart tooltips under different system themes | N/A | Hovering over analytics chart points renders tooltips using correct dark/light mode CSS vars | As expected | Pass |

---

## Feature Name: Automation Rules Engine

### Implementation Overview
[Placeholder for Image: Implementation Screenshot]
**Description:** A custom rules engine that interprets `If-Then` conditions stored in the `automationRules` collection. When specific project hooks are fired (e.g., Task Created), it evaluates the conditions, securely executing configured backend actions such as automatic assignment or column sorting.

### Test Cases

| Test Case ID | Test Objective | Test Data | Expected Result | Actual Result | Test Pass/Fail |
|--------------|---------------|-----------|-----------------|--------------|----------------|
| TCAuto-01    | Verify an automatic rule successfully fires upon defined trigger condition | Rule: "If Task is 'High Priority', assign to User A". Trigger: Task Created as 'High' | Rule engine processes trigger, matches rule, and `PATCH` updates task `assignee` to User A | As expected | Pass |
| TCAuto-02    | Verify trigger handles non-matching conditions without error | Rule: "If Task is 'Critical'". Trigger: Task Created as 'Low' | Engine checks condition, evaluates to false, and exists cleanly without making API changes | As expected | Pass |
| TCAuto-03    | Verify rule execution prevents infinite circular loop updates | Rule 1: "Move to Done". Rule 2: "If in Done, move to Review" | Engine should track execution depth or apply idempotency to prevent infinite state loops | As expected | Pass |
| TCAuto-04    | Verify disabled rules do not execute upon their trigger conditions | Toggle Rule `isActive: false` and fire trigger | Engine evaluates rule active state and skips entirely, saving compute cycles | As expected | Pass |
| TCAuto-05    | Verify the Automation UI clearly reflects rule states (Enabled/Disabled) | N/A | Dashboard list correctly utilizes toggle switches mimicking `isActive` booleans | As expected | Pass |

---

## Feature Name: Search & Filtering

### Implementation Overview
[Placeholder for Image: Implementation Screenshot]
**Description:** Provides cross-project global search and granular filtering capabilities to quickly locate tasks using an integrated UI component. The frontend formulates dynamic query parameters (`?assignee=...&priority=...`), which the backend uses to conditionally execute performant MongoDB queries with compound indexes.

### Test Cases

| Test Case ID | Test Objective | Test Data | Expected Result | Actual Result | Test Pass/Fail |
|--------------|---------------|-----------|-----------------|--------------|----------------|
| TCSearch-01  | Verify global text search returns matching tasks within projects | Query: `"auth implementation"` | Backend executes regex match against Task `title`/`description` and returns results | As expected | Pass |
| TCSearch-02  | Verify multi-parameter filtering accuracy | Filter: Assignee `User1`, Priority `High` | System aggregates queries and returns only the strict intersection of conditions | As expected | Pass |
| TCSearch-03  | Verify search and filter UI components update Next.js router params dynamically | N/A | URL updates safely (e.g., `?priority=high`) without performing a full page reload | As expected | Pass |
| TCSearch-04  | Verify empty search results show appropriate fallback UI | Query: `"randomnonexistenttask999"` | Response is empty `[]`, UI renders user-friendly "No results found" placeholder | As expected | Pass |
| TCSearch-05  | Verify pagination parameters applied to large search query results | Limit: `50`, Page `2` | System correctly applies `.skip(50).limit(50)` on the returned cursor payload | As expected | Pass |

---

## Feature Name: User Management (Admin Dashboard)

### Implementation Overview
[Placeholder for Image: Implementation Screenshot]
**Description:** Dedicated administrative dashboard allowing users with the 'admin' role to globally manage the application's user base. It relies on the RBAC middleware and provides administrative controls such as promoting/demoting user roles, deactivating accounts, and overriding team affiliations.

### Test Cases

| Test Case ID | Test Objective | Test Data | Expected Result | Actual Result | Test Pass/Fail |
|--------------|---------------|-----------|-----------------|--------------|----------------|
| TCAdmin-01   | Verify an Admin can successfully fetch the global users list | Auth Token of `admin` role | Route `/api/admin/users` validates role and returns the stripped user array | As expected | Pass |
| TCAdmin-02   | Verify non-admin users attempting to access the dashboard are rejected | Auth Token of `user` or `manager` role | Middleware blocks access and returns 403 Forbidden "Insufficient permissions" | As expected | Pass |
| TCAdmin-03   | Verify an Admin can successfully deactivate a user account | Existing User ID, `isActive: false` | User document updates; subsequent login attempts for this user will be rejected | As expected | Pass |
| TCAdmin-04   | Verify an Admin can safely change another user's system role | Valid User ID, Demoted from `manager` to `user` | Database persists change; demoted user instantly loses managerial privileges | As expected | Pass |
| TCAdmin-05   | Verify an Admin cannot delete or demote their own active session account | Own Admin Token/ID, Action `DELETE` | System logic isolates the self-harm request and returns 400 Bad Request error | As expected | Pass |

---

## Feature Name: System Settings & UI Themes (Dark Mode)

### Implementation Overview
[Placeholder for Image: Implementation Screenshot]
**Description:** Provides persistent visual theme customization supporting both a light and dark mode palette through Tailwind CSS. Theme preferences are bound to a global UI Zustand store or native browser `localStorage`, listening to OS-level `prefers-color-scheme` preferences as a fallback fallback via Next.js implementations.

### Test Cases

| Test Case ID | Test Objective | Test Data | Expected Result | Actual Result | Test Pass/Fail |
|--------------|---------------|-----------|-----------------|--------------|----------------|
| TCTheme-01   | Verify manual theme toggle switches global CSS scope | Click 'Dark Mode' toggle | HTML root receives `.dark` class; Zustand UI store updates `theme: 'dark'` | As expected | Pass |
| TCTheme-02   | Verify explicit user theme preference is preserved across page reloads | N/A | `localStorage` retains the chosen theme, applying it securely before first paint | As expected | Pass |
| TCTheme-03   | Verify system implicitly respects OS color scheme on initial load | OS set to 'Dark', no preset localStorage | App reads `window.matchMedia` and defaults to `.dark` color styles | As expected | Pass |
| TCTheme-04   | Verify all specialized charting components adapt correctly to dark mode | Dark Mode Active | Recharts axes, gridlines, and backgrounds invert to legible contrast colors | As expected | Pass |
| TCTheme-05   | Verify standard text contrast parity between themes | Theme switch on Project View | All headers and dynamic text classes retain WCAG AAA/AA accessible contrast | As expected | Pass |
