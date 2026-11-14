# Toonverse task allocation

**The single source of truth for planned task owners.** Approved by the team on 2026-10-26. Task files, the task-runner skill and the generator all read owners from here.

- Every task has **exactly one primary owner**. The totals count each task once, including the three shared tasks.
- A planned owner is **not** permission to push. The GitHub account is still confirmed at the start of every task and again right before every push.
- An owner changes only with the team's agreement. A task in progress is never reassigned without checking its status and discussing it.
- **State** moves through: planned → in progress → review → completed. The live state is also kept in the tracker (`status/tNNN`).
- **Contributors** records who actually did what. For shared or paired work, each person's part is listed.

## Primary areas

| Member | GitHub | Primary area |
|---|---|---|
| Khadija Gulzar | `khadijagulzar877-hub` | Database, data models, persistence and related backend work |
| Nabila Azam | `nabilaazam-cmd` | Server, authentication, security, payments and deployment (repository owner) |
| Shumail Mirzaa | `shumailmizaa-ops` | Frontend, canvas, UI components, and integration/testing |

Members may contribute outside their area. These areas guide the allocation; they don't restrict collaboration.

## Totals (284 unique tasks, each counted once)

| Member | Total | Planning 001–011 | MVP build 012–186 | After MVP 187–284 |
|---|---|---|---|---|
| Nabila Azam | 96 | 2 | 58 | 36 |
| Khadija Gulzar | 94 | 6 | 60 | 28 |
| Shumail Mirzaa | 94 | 3 | 57 | 34 |
| **All** | **284** | 11 | 175 | 98 |

## Shared tasks (one primary owner; every contribution recorded)

| Task | Primary owner (counted) | Actual contributions |
|---|---|---|
| 001 (0.1) Create the develop branch and the planning branch | Khadija Gulzar | **Khadija:** `.gitignore` fix, branch rename, all pushes. **Nabila:** created `develop` and set it as the default branch. |
| 256 (14.12) Run user acceptance testing | Shumail Mirzaa | Each member runs and records their own sessions (recorded when done) |
| 257 (14.13) Fix all P0 and P1 bugs | Nabila Azam | Each member fixes bugs in their own area, credited per commit (recorded when done) |

## Changes approved on 2026-10-26 (13 moves, Khadija ↔ Nabila)
- **Khadija → Nabila:**
  - 3.17–3.18 (065–066) profile API
  - 4.1 (078) ownership and ID-validation middleware
  - 5.6–5.9 (187–190) OpenAI configuration and service
- **Nabila → Khadija:**
  - 13.1–13.3 (234–236) validation, ownership and injection audits
  - 14.11 (255) performance checks
  - 15.4 (261) per-environment storage and keys
  - 16.1 (272) API docs

## GitHub Issues (created by Nabila Azam on 2026-10-05)
| Issue | Assigned to | Plan tasks | Owner here |
|---|---|---|---|
| #3 setup data base | Khadija Gulzar | 006, 019–020, 037–048 | Khadija Gulzar |
| #1 create login page UI | Nabila Azam | 071–072 | Nabila Azam |
| #2 create home page UI | Shumail Mirzaa | 180 | Shumail Mirzaa |

## All tasks

| # | Task | Title | Primary owner | Reason | State | Contributors |
|---|---|---|---|---|---|---|
| 001 | 0.1 | Create the develop branch and the planning branch | Khadija Gulzar | Shared: Khadija primary (gitignore fix, rename, pushes); Nabila did the owner step | completed | Khadija Gulzar; Nabila Azam (owner step) |
| 002 | 0.2 | Review and commit the decision log | Khadija Gulzar | Decision log (in progress, Khadija) and the data model | completed | Khadija Gulzar (work, commit, merge); Nabila Azam (PR review); Shumail Mirzaa (log review) |
| 003 | 0.3 | Confirm decisions D1–D5 in the log | Khadija Gulzar | Decision log (in progress, Khadija) and the data model | completed | Khadija Gulzar (review, D2 clarification, commit, merge); Shumail Mirzaa (PR review) |
| 004 | 0.4 | Confirm decisions D6–D11 in the log | Khadija Gulzar | Decision log (in progress, Khadija) and the data model | completed | Khadija Gulzar (verification only; no file change needed) |
| 005 | 0.5 | Confirm D12–D15 and the supporting libraries | Khadija Gulzar | Decision log (in progress, Khadija) and the data model | completed | Khadija Gulzar (library review, decision log, commit, merge); Nabila Azam (PR review); all three agreed to the library decisions |
| 006 | 0.6 | Write the data model document | Khadija Gulzar | Decision log (in progress, Khadija) and the data model | completed | Khadija Gulzar (data model, D7 update, commit, merge); Shumail Mirzaa (PR review) |
| 007 | 0.7 | Write the API contract: auth, users, series, episodes, notes | Nabila Azam | API contract for auth, users and series: her server and auth area | completed | Nabila Azam (decisions; commit, push and merge done from her account); Khadija Gulzar (PR review); Claude assisted with drafting |
| 008 | 0.8 | Write the API contract: panels, uploads, save, preview, publish, reader, favorites | Shumail Mirzaa | API contract for creator and reader routes she will consume | completed | Shumail Mirzaa (decisions on Issue #10; commit, push and merge done from his account); Nabila Azam (agreement to G1, R1, S9, points 2, 3 and 7; PR review); Claude assisted with drafting |
| 009 | 0.9 | Write the API contract: AI, premium, payments, admin | Nabila Azam | API contract for AI, premium, payments and admin: server and payments | completed | Nabila Azam (decisions on Issue #12; commits, push and merge done from her account); Shumail Mirzaa (approval of Q1–Q10 and open items 1–3, 6–10; PR review); Khadija Gulzar (approval of Q1–Q10 and open items 1–3, 6–10); Claude assisted with drafting |
| 010 | 0.10 | Write the AI assistant policy | Shumail Mirzaa | AI policy and wireframes for the screens she builds | planned |  |
| 011 | 0.11 | Draw wireframes for the 11 frontend modules | Shumail Mirzaa | AI policy and wireframes for the screens she builds | planned |  |
| 012 | 1.1 | Create the monorepo layout | Nabila Azam | Server scaffold, config, errors, health route | planned |  |
| 013 | 1.2 | Create the server package | Nabila Azam | Server scaffold, config, errors, health route | planned |  |
| 014 | 1.3 | Create the server folder structure | Nabila Azam | Server scaffold, config, errors, health route | planned |  |
| 015 | 1.4 | Create the environment config module | Nabila Azam | Server scaffold, config, errors, health route | planned |  |
| 016 | 1.5 | Create the error utilities | Nabila Azam | Server scaffold, config, errors, health route | planned |  |
| 017 | 1.6 | Create the Express app and server entry | Nabila Azam | Server scaffold, config, errors, health route | planned |  |
| 018 | 1.7 | Add the health endpoint | Nabila Azam | Server scaffold, config, errors, health route | planned |  |
| 019 | 1.8 | Set up MongoDB databases for development and testing | Khadija Gulzar | MongoDB setup and connection (Issue #3) | planned |  |
| 020 | 1.9 | Create the database connection module | Khadija Gulzar | MongoDB setup and connection (Issue #3) | planned |  |
| 021 | 1.10 | Verify and debug the server foundation | Nabila Azam | Server foundation check | planned |  |
| 022 | 1.11 | Scaffold the React app | Shumail Mirzaa | React app, Tailwind, fonts, router, home placeholder | planned |  |
| 023 | 1.12 | Configure Tailwind CSS | Shumail Mirzaa | React app, Tailwind, fonts, router, home placeholder | planned |  |
| 024 | 1.13 | Add Google Fonts | Shumail Mirzaa | React app, Tailwind, fonts, router, home placeholder | planned |  |
| 025 | 1.14 | Configure the development proxy | Shumail Mirzaa | React app, Tailwind, fonts, router, home placeholder | planned |  |
| 026 | 1.15 | Create the API client | Shumail Mirzaa | React app, Tailwind, fonts, router, home placeholder | planned |  |
| 027 | 1.16 | Add routing and a health check page | Shumail Mirzaa | React app, Tailwind, fonts, router, home placeholder | planned |  |
| 028 | 1.17 | Add CORS and cookie parsing to the server | Nabila Azam | CORS and cookies: server security | planned |  |
| 029 | 1.18 | Configure ESLint and Prettier | Shumail Mirzaa | Linting setup | planned |  |
| 030 | 1.19 | Set up the test runners | Khadija Gulzar | Test runners and test database | planned |  |
| 031 | 1.20 | Create the third-party accounts | Nabila Azam | Third-party accounts and GitHub settings (repository owner) | planned |  |
| 032 | 1.21 | Configure GitHub | Nabila Azam | Third-party accounts and GitHub settings (repository owner) | planned |  |
| 033 | 1.22 | Write the README setup guide | Khadija Gulzar | README setup guide | planned |  |
| 034 | 6.1 | Build the React-Konva spike | Shumail Mirzaa | Canvas spike | planned |  |
| 035 | 6.2 | Run the stroke stress test | Shumail Mirzaa | Canvas spike | planned |  |
| 036 | 6.3 | Define the scene JSON format | Shumail Mirzaa | Canvas spike | planned |  |
| 037 | 2.1 | Create the model JSON plugin | Khadija Gulzar | Data models, indexes, seed (Issue #3; database owner) | planned |  |
| 038 | 2.2 | Create the User model | Khadija Gulzar | Data models, indexes, seed (Issue #3; database owner) | planned |  |
| 039 | 2.3 | Create the Series model | Khadija Gulzar | Data models, indexes, seed (Issue #3; database owner) | planned |  |
| 040 | 2.4 | Create the Episode model | Khadija Gulzar | Data models, indexes, seed (Issue #3; database owner) | planned |  |
| 041 | 2.5 | Create the Note model | Khadija Gulzar | Data models, indexes, seed (Issue #3; database owner) | planned |  |
| 042 | 2.6 | Create the Panel model | Khadija Gulzar | Data models, indexes, seed (Issue #3; database owner) | planned |  |
| 043 | 2.7 | Create the Favorite model | Khadija Gulzar | Data models, indexes, seed (Issue #3; database owner) | planned |  |
| 044 | 2.8 | Create the Payment model | Khadija Gulzar | Data models, indexes, seed (Issue #3; database owner) | planned |  |
| 045 | 2.9 | Create the index sync script | Khadija Gulzar | Data models, indexes, seed (Issue #3; database owner) | planned |  |
| 046 | 2.10 | Write model tests | Khadija Gulzar | Data models, indexes, seed (Issue #3; database owner) | planned |  |
| 047 | 2.11 | Fix model test failures | Khadija Gulzar | Data models, indexes, seed (Issue #3; database owner) | planned |  |
| 048 | 2.12 | Create the seed and reset scripts | Khadija Gulzar | Data models, indexes, seed (Issue #3; database owner) | planned |  |
| 049 | 3.1 | Create the password utility | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 050 | 3.2 | Create the token utility | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 051 | 3.3 | Create the auth cookie helper | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 052 | 3.4 | Create the registration service | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 053 | 3.5 | Create the registration controller | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 054 | 3.6 | Create the validation middleware and register rules | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 055 | 3.7 | Create the registration route | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 056 | 3.8 | Test the registration API | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 057 | 3.9 | Fix registration issues | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 058 | 3.10 | Create the login service | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 059 | 3.11 | Create the login controller, rules and route | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 060 | 3.12 | Test the login API | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 061 | 3.13 | Create the requireAuth middleware | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 062 | 3.14 | Create the me and logout endpoints | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 063 | 3.15 | Create the role and premium middleware | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 064 | 3.16 | Test sessions and middleware | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 065 | 3.17 | Create the profile service, controller and routes | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 066 | 3.18 | Test the profile API | Nabila Azam | Authentication API, sessions, roles, profile API | planned |  |
| 067 | 3.19 | Create the auth and user API modules | Shumail Mirzaa | Frontend auth modules, AuthContext, UI components, layout | planned |  |
| 068 | 3.20 | Create the AuthContext | Shumail Mirzaa | Frontend auth modules, AuthContext, UI components, layout | planned |  |
| 069 | 3.21 | Create the shared form components | Shumail Mirzaa | Frontend auth modules, AuthContext, UI components, layout | planned |  |
| 070 | 3.22 | Create the app layout | Shumail Mirzaa | Frontend auth modules, AuthContext, UI components, layout | planned |  |
| 071 | 3.23 | Build the Register page | Nabila Azam | Register and Login pages, route guards (Issue #1) | planned |  |
| 072 | 3.24 | Build the Login page | Nabila Azam | Register and Login pages, route guards (Issue #1) | planned |  |
| 073 | 3.25 | Create the route guards | Nabila Azam | Register and Login pages, route guards (Issue #1) | planned |  |
| 074 | 3.26 | Build the Profile page | Khadija Gulzar | Profile page | planned |  |
| 075 | 3.27 | Add Guest Mode | Shumail Mirzaa | Guest mode and auth component tests | planned |  |
| 076 | 3.28 | Write the auth component tests | Shumail Mirzaa | Guest mode and auth component tests | planned |  |
| 077 | 3.29 | Test the complete authentication flow by hand | Nabila Azam | Authentication flow test | planned |  |
| 078 | 4.1 | Create the ownership and id helpers | Nabila Azam | Ownership and ID-validation middleware: access security | planned |  |
| 079 | 4.2 | Create the series service | Khadija Gulzar | Series and episode services and APIs | planned |  |
| 080 | 4.3 | Create the series controller, rules and routes | Khadija Gulzar | Series and episode services and APIs | planned |  |
| 081 | 4.4 | Test the series API | Khadija Gulzar | Series and episode services and APIs | planned |  |
| 082 | 4.5 | Create the episode service | Khadija Gulzar | Series and episode services and APIs | planned |  |
| 083 | 4.6 | Create the episode controller, rules and routes | Khadija Gulzar | Series and episode services and APIs | planned |  |
| 084 | 4.7 | Test the episode API | Khadija Gulzar | Series and episode services and APIs | planned |  |
| 085 | 4.8 | Fix episode numbering conflicts | Khadija Gulzar | Series and episode services and APIs | planned |  |
| 086 | 4.9 | Create the remaining shared UI components | Shumail Mirzaa | UI kit, dashboard, create-series modal | planned |  |
| 087 | 4.10 | Create the series and episode API modules | Shumail Mirzaa | UI kit, dashboard, create-series modal | planned |  |
| 088 | 4.11 | Build the Dashboard page | Shumail Mirzaa | UI kit, dashboard, create-series modal | planned |  |
| 089 | 4.12 | Build the Create Series modal | Shumail Mirzaa | UI kit, dashboard, create-series modal | planned |  |
| 090 | 4.13 | Build the Series page | Khadija Gulzar | Series page, episode actions, workspace shell | planned |  |
| 091 | 4.14 | Add episode actions | Khadija Gulzar | Series page, episode actions, workspace shell | planned |  |
| 092 | 4.15 | Add the delete series flow | Khadija Gulzar | Series page, episode actions, workspace shell | planned |  |
| 093 | 4.16 | Build the episode workspace shell | Khadija Gulzar | Series page, episode actions, workspace shell | planned |  |
| 094 | 4.17 | Test the dashboard flow | Khadija Gulzar | Series page, episode actions, workspace shell | planned |  |
| 095 | 5.1 | Create the note service | Khadija Gulzar | Notes API | planned |  |
| 096 | 5.2 | Create the notes controller, rules and routes | Khadija Gulzar | Notes API | planned |  |
| 097 | 5.3 | Test the notes API | Khadija Gulzar | Notes API | planned |  |
| 098 | 5.4 | Build the Notes step | Shumail Mirzaa | Notes page | planned |  |
| 099 | 5.5 | Test the notes flow by hand | Shumail Mirzaa | Notes page | planned |  |
| 100 | 6.4 | Create the canvas module structure | Shumail Mirzaa | Canvas engine: tools, layers, undo/redo | planned |  |
| 101 | 6.5 | Create the scene reducer | Shumail Mirzaa | Canvas engine: tools, layers, undo/redo | planned |  |
| 102 | 6.6 | Create the undo/redo history | Shumail Mirzaa | Canvas engine: tools, layers, undo/redo | planned |  |
| 103 | 6.7 | Create the useCanvasEditor hook | Shumail Mirzaa | Canvas engine: tools, layers, undo/redo | planned |  |
| 104 | 6.8 | Render the scene on the stage | Shumail Mirzaa | Canvas engine: tools, layers, undo/redo | planned |  |
| 105 | 6.9 | Implement the brush tool | Shumail Mirzaa | Canvas engine: tools, layers, undo/redo | planned |  |
| 106 | 6.10 | Build the toolbar with brush settings | Shumail Mirzaa | Canvas engine: tools, layers, undo/redo | planned |  |
| 107 | 6.11 | Implement the eraser tool | Shumail Mirzaa | Canvas engine: tools, layers, undo/redo | planned |  |
| 108 | 6.12 | Build the colour picker | Shumail Mirzaa | Canvas engine: tools, layers, undo/redo | planned |  |
| 109 | 6.13 | Build the layers panel | Shumail Mirzaa | Canvas engine: tools, layers, undo/redo | planned |  |
| 110 | 6.14 | Add the layer limit | Shumail Mirzaa | Canvas engine: tools, layers, undo/redo | planned |  |
| 111 | 6.15 | Add undo/redo buttons and shortcuts | Shumail Mirzaa | Canvas engine: tools, layers, undo/redo | planned |  |
| 112 | 6.16 | Implement zoom | Nabila Azam | Zoom, pan, serialization, performance, sandbox | planned |  |
| 113 | 6.17 | Implement pan | Nabila Azam | Zoom, pan, serialization, performance, sandbox | planned |  |
| 114 | 6.18 | Debug drawing under zoom and pan | Nabila Azam | Zoom, pan, serialization, performance, sandbox | planned |  |
| 115 | 6.19 | Create scene serialization | Nabila Azam | Zoom, pan, serialization, performance, sandbox | planned |  |
| 116 | 6.20 | Tune canvas performance | Nabila Azam | Zoom, pan, serialization, performance, sandbox | planned |  |
| 117 | 6.21 | Put the editor in the Draw step | Nabila Azam | Zoom, pan, serialization, performance, sandbox | planned |  |
| 118 | 6.22 | Add the guest canvas sandbox | Nabila Azam | Zoom, pan, serialization, performance, sandbox | planned |  |
| 119 | 6.23 | Run the canvas test checklist | Nabila Azam | Zoom, pan, serialization, performance, sandbox | planned |  |
| 120 | 7.1 | Create the panel service | Khadija Gulzar | Panels API | planned |  |
| 121 | 7.2 | Create the panel controller, rules and routes | Khadija Gulzar | Panels API | planned |  |
| 122 | 7.3 | Test the panels API | Khadija Gulzar | Panels API | planned |  |
| 123 | 7.4 | Build the panel strip | Shumail Mirzaa | Panel strip and speech bubble rendering | planned |  |
| 124 | 7.5 | Add panel management | Shumail Mirzaa | Panel strip and speech bubble rendering | planned |  |
| 125 | 7.6 | Keep editor state per panel | Shumail Mirzaa | Panel strip and speech bubble rendering | planned |  |
| 126 | 7.7 | Add bubble and text shapes to the scene format | Shumail Mirzaa | Panel strip and speech bubble rendering | planned |  |
| 127 | 7.8 | Render speech bubbles | Shumail Mirzaa | Panel strip and speech bubble rendering | planned |  |
| 128 | 7.9 | Add select, move and resize | Shumail Mirzaa | Panel strip and speech bubble rendering | planned |  |
| 129 | 7.10 | Add the bubble tool | Nabila Azam | Bubble tool, text editing, fonts | planned |  |
| 130 | 7.11 | Add text editing | Nabila Azam | Bubble tool, text editing, fonts | planned |  |
| 131 | 7.12 | Add font controls | Nabila Azam | Bubble tool, text editing, fonts | planned |  |
| 132 | 7.13 | Wait for fonts before drawing text | Nabila Azam | Bubble tool, text editing, fonts | planned |  |
| 133 | 7.14 | Test bubbles and text by hand | Nabila Azam | Bubble tool, text editing, fonts | planned |  |
| 134 | 7.15 | Configure Cloudinary | Khadija Gulzar | Cloudinary storage and safe cleanup (D15) | planned |  |
| 135 | 7.16 | Create the storage service | Khadija Gulzar | Cloudinary storage and safe cleanup (D15) | planned |  |
| 136 | 7.17 | Test Cloudinary on its own | Khadija Gulzar | Cloudinary storage and safe cleanup (D15) | planned |  |
| 137 | 7.18 | Create the upload middleware | Khadija Gulzar | Cloudinary storage and safe cleanup (D15) | planned |  |
| 138 | 7.19 | Create the reference upload endpoint | Khadija Gulzar | Cloudinary storage and safe cleanup (D15) | planned |  |
| 139 | 7.20 | Create the reference delete endpoint | Khadija Gulzar | Cloudinary storage and safe cleanup (D15) | planned |  |
| 140 | 7.21 | Add safe image cleanup to deletes | Khadija Gulzar | Cloudinary storage and safe cleanup (D15) | planned |  |
| 141 | 7.22 | Test the upload API | Khadija Gulzar | Cloudinary storage and safe cleanup (D15) | planned |  |
| 142 | 7.23 | Build the reference image UI | Shumail Mirzaa | Reference image UI and cross-origin loading | planned |  |
| 143 | 7.24 | Load images with cross-origin access | Shumail Mirzaa | Reference image UI and cross-origin loading | planned |  |
| 144 | 7.25 | Test the complete panels flow | Shumail Mirzaa | Reference image UI and cross-origin loading | planned |  |
| 145 | 8.1 | Create the scene save service | Khadija Gulzar | Versioned save API | planned |  |
| 146 | 8.2 | Create the scene validation rules | Khadija Gulzar | Versioned save API | planned |  |
| 147 | 8.3 | Create the scene save route | Khadija Gulzar | Versioned save API | planned |  |
| 148 | 8.4 | Test the save API | Khadija Gulzar | Versioned save API | planned |  |
| 149 | 8.5 | Load saved scenes into the workspace | Shumail Mirzaa | Save manager, manual save, auto-save, status | planned |  |
| 150 | 8.6 | Create the save manager | Shumail Mirzaa | Save manager, manual save, auto-save, status | planned |  |
| 151 | 8.7 | Add manual save | Shumail Mirzaa | Save manager, manual save, auto-save, status | planned |  |
| 152 | 8.8 | Add auto-save | Shumail Mirzaa | Save manager, manual save, auto-save, status | planned |  |
| 153 | 8.9 | Add the save status indicator | Shumail Mirzaa | Save manager, manual save, auto-save, status | planned |  |
| 154 | 8.10 | Add retry and offline handling | Nabila Azam | Retry, conflicts, leave warning | planned |  |
| 155 | 8.11 | Handle save conflicts | Nabila Azam | Retry, conflicts, leave warning | planned |  |
| 156 | 8.12 | Warn about unsaved work | Nabila Azam | Retry, conflicts, leave warning | planned |  |
| 157 | 8.16 | Create the local recovery draft store | Khadija Gulzar | IndexedDB recovery drafts (D10) | planned |  |
| 158 | 8.17 | Offer to restore or discard a recovery draft | Khadija Gulzar | IndexedDB recovery drafts (D10) | planned |  |
| 159 | 8.13 | Auto-save notes | Shumail Mirzaa | Notes auto-save | planned |  |
| 160 | 8.14 | Test saving and recovery | Nabila Azam | Save tests and fixes | planned |  |
| 161 | 8.15 | Fix save bugs | Nabila Azam | Save tests and fixes | planned |  |
| 162 | 9.1 | Create the preview endpoint | Khadija Gulzar | Preview API | planned |  |
| 163 | 9.2 | Test the preview endpoint | Khadija Gulzar | Preview API | planned |  |
| 164 | 9.3 | Create the read-only panel renderer | Shumail Mirzaa | Panel renderer and preview step | planned |  |
| 165 | 9.4 | Build the Preview step | Shumail Mirzaa | Panel renderer and preview step | planned |  |
| 166 | 9.5 | Create the offscreen render utility | Khadija Gulzar | Render, PNG and PDF device download (D2) | planned |  |
| 167 | 9.6 | Export as PNG | Khadija Gulzar | Render, PNG and PDF device download (D2) | planned |  |
| 168 | 9.7 | Export as PDF | Khadija Gulzar | Render, PNG and PDF device download (D2) | planned |  |
| 169 | 9.8 | Add export file names | Khadija Gulzar | Render, PNG and PDF device download (D2) | planned |  |
| 170 | 9.9 | Build the export menu | Shumail Mirzaa | Export menu and browser tests | planned |  |
| 171 | 9.10 | Test exports in three browsers | Shumail Mirzaa | Export menu and browser tests | planned |  |
| 172 | 10.1 | Create the rendered image upload endpoint | Nabila Azam | Publishing (render upload, publish, unpublish) | planned |  |
| 173 | 10.2 | Create the publish service | Nabila Azam | Publishing (render upload, publish, unpublish) | planned |  |
| 174 | 10.3 | Create the unpublish service | Nabila Azam | Publishing (render upload, publish, unpublish) | planned |  |
| 175 | 10.4 | Create the publish routes and tests | Nabila Azam | Publishing (render upload, publish, unpublish) | planned |  |
| 176 | 10.5 | Build the Publish step | Nabila Azam | Publishing (render upload, publish, unpublish) | planned |  |
| 177 | 10.6 | Create the Discover endpoint | Khadija Gulzar | Discover and public read queries | planned |  |
| 178 | 10.7 | Create the public read endpoints | Khadija Gulzar | Discover and public read queries | planned |  |
| 179 | 10.8 | Test Discover and read APIs | Khadija Gulzar | Discover and public read queries | planned |  |
| 180 | 10.9 | Build the Discover page | Shumail Mirzaa | Discover (home), series reader, Reader view (Issue #2) | planned |  |
| 181 | 10.10 | Build the series reader page | Shumail Mirzaa | Discover (home), series reader, Reader view (Issue #2) | planned |  |
| 182 | 10.11 | Build the Reader view | Shumail Mirzaa | Discover (home), series reader, Reader view (Issue #2) | planned |  |
| 183 | 10.12 | Create the favorites service and routes | Khadija Gulzar | Favorites API | planned |  |
| 184 | 10.13 | Test the favorites API | Khadija Gulzar | Favorites API | planned |  |
| 185 | 10.14 | Build the favorite button and Favorites page | Shumail Mirzaa | Favorites UI | planned |  |
| 186 | 10.15 | Test the creator-to-reader flow | Nabila Azam | Creator-to-reader flow test | planned |  |
| 187 | 5.6 | Configure OpenAI | Nabila Azam | OpenAI configuration, prompts, service: external API and secret key | planned |  |
| 188 | 5.7 | Create the prompt builder | Nabila Azam | OpenAI configuration, prompts, service: external API and secret key | planned |  |
| 189 | 5.8 | Create the AI service | Nabila Azam | OpenAI configuration, prompts, service: external API and secret key | planned |  |
| 190 | 5.9 | Test OpenAI on its own | Nabila Azam | OpenAI configuration, prompts, service: external API and secret key | planned |  |
| 191 | 5.10 | Create the daily AI quota | Khadija Gulzar | AI usage quota (aiUsage), AI routes, rate limit, tests | planned |  |
| 192 | 5.11 | Create the AI controller and routes | Khadija Gulzar | AI usage quota (aiUsage), AI routes, rate limit, tests | planned |  |
| 193 | 5.12 | Add a burst rate limit for AI | Khadija Gulzar | AI usage quota (aiUsage), AI routes, rate limit, tests | planned |  |
| 194 | 5.13 | Test the AI API | Khadija Gulzar | AI usage quota (aiUsage), AI routes, rate limit, tests | planned |  |
| 195 | 5.14 | Create the AI API module | Shumail Mirzaa | AI suggestion screens | planned |  |
| 196 | 5.15 | Build the suggestion panel | Shumail Mirzaa | AI suggestion screens | planned |  |
| 197 | 5.16 | Add AI to the Notes step | Shumail Mirzaa | AI suggestion screens | planned |  |
| 198 | 5.17 | Add dialogue suggestions to the Panels step | Shumail Mirzaa | AI suggestion screens | planned |  |
| 199 | 5.18 | Test the AI flows with the real key | Shumail Mirzaa | AI suggestion screens | planned |  |
| 200 | 11.1 | Create the premium plan config | Khadija Gulzar | Premium plans, limits and server-side enforcement | planned |  |
| 201 | 11.2 | Create the premium service | Khadija Gulzar | Premium plans, limits and server-side enforcement | planned |  |
| 202 | 11.3 | Create the premium endpoints | Khadija Gulzar | Premium plans, limits and server-side enforcement | planned |  |
| 203 | 11.4 | Use premium limits on the server | Khadija Gulzar | Premium plans, limits and server-side enforcement | planned |  |
| 204 | 11.5 | Test premium logic | Khadija Gulzar | Premium plans, limits and server-side enforcement | planned |  |
| 205 | 11.6 | Use premium state in the client | Shumail Mirzaa | Premium page, client limits, upgrade prompts | planned |  |
| 206 | 11.7 | Build the Premium page | Shumail Mirzaa | Premium page, client limits, upgrade prompts | planned |  |
| 207 | 11.8 | Add upgrade prompts at limits | Shumail Mirzaa | Premium page, client limits, upgrade prompts | planned |  |
| 208 | 11.9 | Test premium gating without payments | Shumail Mirzaa | Premium page, client limits, upgrade prompts | planned |  |
| 209 | 11.10 | Configure the JazzCash sandbox | Nabila Azam | JazzCash sandbox integration (security-sensitive) | planned |  |
| 210 | 11.11 | Create the secure hash utility | Nabila Azam | JazzCash sandbox integration (security-sensitive) | planned |  |
| 211 | 11.12 | Create the payment request builder | Nabila Azam | JazzCash sandbox integration (security-sensitive) | planned |  |
| 212 | 11.13 | Create the initiate endpoint | Nabila Azam | JazzCash sandbox integration (security-sensitive) | planned |  |
| 213 | 11.14 | Create the return handler | Nabila Azam | JazzCash sandbox integration (security-sensitive) | planned |  |
| 214 | 11.15 | Test the payment service on its own | Nabila Azam | JazzCash sandbox integration (security-sensitive) | planned |  |
| 215 | 11.16 | Create the payment status endpoint | Nabila Azam | JazzCash sandbox integration (security-sensitive) | planned |  |
| 216 | 11.17 | Connect the Upgrade button to JazzCash | Shumail Mirzaa | Checkout redirect and result page | planned |  |
| 217 | 11.18 | Build the payment result page | Shumail Mirzaa | Checkout redirect and result page | planned |  |
| 218 | 11.19 | Run real sandbox payments | Nabila Azam | Sandbox payment runs | planned |  |
| 219 | 11.20 | Add payment history | Khadija Gulzar | Payment history | planned |  |
| 220 | 11.21 | Test the complete premium purchase | Nabila Azam | Premium purchase end-to-end test | planned |  |
| 221 | 12.1 | Create the create-admin script | Shumail Mirzaa | Admin APIs | planned |  |
| 222 | 12.2 | Create the admin router | Shumail Mirzaa | Admin APIs | planned |  |
| 223 | 12.3 | Create the admin user endpoints | Shumail Mirzaa | Admin APIs | planned |  |
| 224 | 12.4 | Check that suspension ends sessions | Shumail Mirzaa | Admin APIs | planned |  |
| 225 | 12.5 | Create the admin episode endpoints | Shumail Mirzaa | Admin APIs | planned |  |
| 226 | 12.6 | Create the admin payments endpoint | Shumail Mirzaa | Admin APIs | planned |  |
| 227 | 12.7 | Create the admin stats endpoint | Shumail Mirzaa | Admin APIs | planned |  |
| 228 | 12.8 | Test the admin API | Shumail Mirzaa | Admin APIs | planned |  |
| 229 | 12.9 | Build the admin layout | Nabila Azam | Admin screens | planned |  |
| 230 | 12.10 | Build the admin Users page | Nabila Azam | Admin screens | planned |  |
| 231 | 12.11 | Build the admin Episodes page | Nabila Azam | Admin screens | planned |  |
| 232 | 12.12 | Build the admin Payments and Overview pages | Nabila Azam | Admin screens | planned |  |
| 233 | 12.13 | Test the admin flow by hand | Nabila Azam | Admin screens | planned |  |
| 234 | 13.1 | Audit request validation | Khadija Gulzar | Validation audit, ownership audit, database injection guard | planned |  |
| 235 | 13.2 | Audit ownership on every route | Khadija Gulzar | Validation audit, ownership audit, database injection guard | planned |  |
| 236 | 13.3 | Add the injection guard | Khadija Gulzar | Validation audit, ownership audit, database injection guard | planned |  |
| 237 | 13.4 | Add the remaining rate limits | Nabila Azam | Rate limits, security headers, CORS | planned |  |
| 238 | 13.5 | Add security headers and CSP | Nabila Azam | Rate limits, security headers, CORS | planned |  |
| 239 | 13.6 | Verify CORS | Nabila Azam | Rate limits, security headers, CORS | planned |  |
| 240 | 13.7 | Review XSS exposure | Shumail Mirzaa | XSS review | planned |  |
| 241 | 13.8 | Audit secrets | Khadija Gulzar | Secrets, error mode, CSRF, dependency audit | planned |  |
| 242 | 13.9 | Check production error mode | Khadija Gulzar | Secrets, error mode, CSRF, dependency audit | planned |  |
| 243 | 13.10 | Check CSRF protection | Khadija Gulzar | Secrets, error mode, CSRF, dependency audit | planned |  |
| 244 | 13.11 | Run the dependency audit | Khadija Gulzar | Secrets, error mode, CSRF, dependency audit | planned |  |
| 245 | 14.1 | Set up Playwright | Nabila Azam | Playwright setup and authentication E2E | planned |  |
| 246 | 14.2 | Write the authentication E2E test | Nabila Azam | Playwright setup and authentication E2E | planned |  |
| 247 | 14.3 | Write the creator flow E2E test | Shumail Mirzaa | Creator and reader E2E | planned |  |
| 248 | 14.4 | Write the reader flow E2E test | Shumail Mirzaa | Creator and reader E2E | planned |  |
| 249 | 14.5 | Write the admin E2E test | Khadija Gulzar | Admin E2E and full suite fixes | planned |  |
| 250 | 14.6 | Run the full test suite and fix failures | Khadija Gulzar | Admin E2E and full suite fixes | planned |  |
| 251 | 14.7 | Check browsers and phone width by hand | Shumail Mirzaa | Cross-browser, bundle split, reader images | planned |  |
| 252 | 14.8 | Split the editor out of the main bundle | Shumail Mirzaa | Cross-browser, bundle split, reader images | planned |  |
| 253 | 14.9 | Optimise reader images | Shumail Mirzaa | Cross-browser, bundle split, reader images | planned |  |
| 254 | 14.10 | Check database query plans | Khadija Gulzar | Query plans and performance checks | planned |  |
| 255 | 14.11 | Run Lighthouse | Khadija Gulzar | Query plans and performance checks | planned |  |
| 256 | 14.12 | Run user acceptance testing | Shumail Mirzaa | Shared UAT: Shumail primary; each member runs and records sessions | planned |  |
| 257 | 14.13 | Fix all P0 and P1 bugs | Nabila Azam | Shared bug fixing: Nabila primary; each member fixes bugs in their own area | planned |  |
| 258 | 15.1 | Choose the hosting (D12) | Nabila Azam | Hosting choice and production configuration | planned |  |
| 259 | 15.2 | Prepare production configuration | Nabila Azam | Hosting choice and production configuration | planned |  |
| 260 | 15.3 | Create the staging and production databases | Khadija Gulzar | Production databases and per-environment storage/keys | planned |  |
| 261 | 15.4 | Prepare third-party services per environment | Khadija Gulzar | Production databases and per-environment storage/keys | planned |  |
| 262 | 15.5 | Deploy the staging backend | Nabila Azam | Staging backend and frontend | planned |  |
| 263 | 15.6 | Deploy the staging frontend | Nabila Azam | Staging backend and frontend | planned |  |
| 264 | 15.7 | Test on staging | Shumail Mirzaa | Staging tests and release candidate | planned |  |
| 265 | 15.8 | Tag the release candidate | Shumail Mirzaa | Staging tests and release candidate | planned |  |
| 266 | 15.9 | Set up the domain and HTTPS | Nabila Azam | Domain, HTTPS, production deploy, JazzCash URL, smoke test | planned |  |
| 267 | 15.10 | Deploy the production backend | Nabila Azam | Domain, HTTPS, production deploy, JazzCash URL, smoke test | planned |  |
| 268 | 15.11 | Deploy the production frontend | Nabila Azam | Domain, HTTPS, production deploy, JazzCash URL, smoke test | planned |  |
| 269 | 15.12 | Point JazzCash to production | Nabila Azam | Domain, HTTPS, production deploy, JazzCash URL, smoke test | planned |  |
| 270 | 15.13 | Smoke test production | Nabila Azam | Domain, HTTPS, production deploy, JazzCash URL, smoke test | planned |  |
| 271 | 15.14 | Set up monitoring | Khadija Gulzar | Monitoring and backups | planned |  |
| 272 | 16.1 | Finalise the API documentation | Khadija Gulzar | API docs, data model and decision log | planned |  |
| 273 | 16.2 | Finalise the data model and decision log | Khadija Gulzar | API docs, data model and decision log | planned |  |
| 274 | 16.3 | Finalise the README | Shumail Mirzaa | README and creator user guide | planned |  |
| 275 | 16.4 | Write the creator user guide | Shumail Mirzaa | README and creator user guide | planned |  |
| 276 | 16.5 | Write the admin guide | Nabila Azam | Admin guide | planned |  |
| 277 | 16.6 | Write the release notes | Khadija Gulzar | Release notes | planned |  |
| 278 | 16.7 | Release v1.0.0 | Nabila Azam | v1.0.0 release | planned |  |
| 279 | 16.8 | Record the demo | Shumail Mirzaa | Demo recording | planned |  |
| 280 | 6.24 | Add touch and stylus input | Shumail Mirzaa | Touch and pen pressure (backlog) | planned |  |
| 281 | 6.25 | Add pen pressure | Shumail Mirzaa | Touch and pen pressure (backlog) | planned |  |
| 282 | 7.26 | Insert AI dialogue into a bubble | Shumail Mirzaa | AI dialogue into bubbles (backlog) | planned |  |
| 283 | 12.14 | Add an admin audit trail | Khadija Gulzar | Admin audit trail (backlog) | planned |  |
| 284 | 1.23 | Add continuous integration | Nabila Azam | CI (backlog) | planned |  |
