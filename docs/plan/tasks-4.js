// Toonverse execution plan — part 4: Phases 12–16 and the optional backlog

PH(12, "Admin Panel", "");

T("12.1","Create the create-admin script","P1",
 "Make admins without a public sign-up.",
 ["11.21"], ["server/scripts/create-admin.js"],
 "Branch `feature/12-admin`. Takes an email (and a password for a new user); creates the user or promotes an existing one to `role: 'admin'`.",
 "Admin accounts.",
 ["Running it twice for one email is safe"]);

T("12.2","Create the admin router","P1",
 "Protect every admin route in one place.",
 ["12.1"], ["server/src/routes/admin.routes.js", "server/src/routes/index.js"],
 "Mount on `/api/admin` with `requireAuth` and `requireRole('admin')` applied to the whole router.",
 "Guarded admin routes.",
 ["A normal user gets 403 on any `/api/admin` path"]);

T("12.3","Create the admin user endpoints","P1",
 "Manage users (D13).",
 ["12.2"], ["server/src/services/admin.service.js", "server/src/controllers/admin.controller.js"],
 "`GET /api/admin/users?search=&page=` (name or email, 20 per page). `PATCH /api/admin/users/:userId/status` with `active` or `suspended`; an admin cannot suspend themselves.",
 "User management API.",
 ["Self-suspension returns 400"]);

T("12.4","Check that suspension ends sessions","P1",
 "A suspended user must lose access at once.",
 ["12.3"], ["server/tests/admin/suspend.test.js"],
 "Test: user logged in → admin suspends → the user’s next request returns 401 or 403 (requireAuth from task 3.13).",
 "Proven suspension.",
 ["Test passes"]);

T("12.5","Create the admin episode endpoints","P1",
 "Moderate published content.",
 ["12.4"], ["server/src/services/admin.service.js", "server/src/controllers/admin.controller.js"],
 "`GET /api/admin/episodes?status=published&page=` and `POST /api/admin/episodes/:episodeId/unpublish` (reuses the unpublish service from task 10.3).",
 "Moderation API.",
 ["An unpublished episode disappears from Discover"]);

T("12.6","Create the admin payments endpoint","P2",
 "See sandbox payments.",
 ["12.5"], ["server/src/controllers/admin.controller.js"],
 "`GET /api/admin/payments?status=&page=` with user email, amount, status and date.",
 "Payments overview API.",
 ["Filtering by status works"]);

T("12.7","Create the admin stats endpoint","P2",
 "Basic counts for the overview.",
 ["12.6"], ["server/src/controllers/admin.controller.js"],
 "`GET /api/admin/stats`: total users, series, published episodes, active premium users.",
 "Stats API.",
 ["Counts match the database"]);

T("12.8","Test the admin API","P1",
 "Prove admin is safe.",
 ["12.7"], ["server/tests/admin/admin.test.js"],
 "Loop over every admin route: 401 logged out, 403 as a normal user. Plus success cases for search, suspend, reactivate and unpublish.",
 "Admin tests passing.",
 ["All admin tests pass"],
 "feat(admin): add admin users, moderation, payments and stats APIs");

T("12.9","Build the admin layout","P1",
 "The admin area frame.",
 ["12.8"], ["client/src/api/admin.js", "client/src/features/admin/AdminLayout.jsx"],
 "Route `/admin` behind AdminRoute with tabs: Overview, Users, Episodes, Payments.",
 "Admin shell.",
 ["Non-admins see the 403 page"]);

T("12.10","Build the admin Users page","P1",
 "Manage users from the UI.",
 ["12.9"], ["client/src/features/admin/AdminUsersPage.jsx"],
 "Search box, paginated table (name, email, role, premium, status), suspend and reactivate with ConfirmDialog.",
 "User management UI.",
 ["Suspending updates the row without a reload"]);

T("12.11","Build the admin Episodes page","P1",
 "Moderate from the UI.",
 ["12.10"], ["client/src/features/admin/AdminEpisodesPage.jsx"],
 "Published episodes table with a Reader view link and Unpublish (with confirm).",
 "Moderation UI.",
 ["Unpublished rows leave the list"]);

T("12.12","Build the admin Payments and Overview pages","P2",
 "Show payments and counts.",
 ["12.11"], ["client/src/features/admin/AdminPaymentsPage.jsx", "client/src/features/admin/AdminOverviewPage.jsx"],
 "Payments table with a status filter; overview cards with the four counts.",
 "Complete admin panel.",
 ["Both pages load real data"]);

T("12.13","Test the admin flow by hand","P1",
 "Verify admin end to end.",
 ["12.12"], [],
 "Run create-admin, log in, search a user, suspend them (their open session stops working), reactivate, unpublish an episode (gone from Discover), view payments.",
 "Verified admin panel.",
 ["Every step works"],
 "feat(admin): add admin panel ui");

CP("Admin complete", ["Admins are created by script only", "Search, suspend and reactivate users", "Unpublish episodes", "View payments and counts", "Merge into develop · tag v0.5.0 (milestone M5)"]);

PH(13, "Security Hardening", "An audit of what earlier phases built, plus the missing protections.");

T("13.1","Audit request validation","P1",
 "Every endpoint validates its input.",
 ["12.13"], ["docs/security-checklist.md", "server/src/validators/"],
 "Branch `feature/13-security`. List every route in a checklist table with its validator. Add any missing rules (ids, query numbers, string lengths).",
 "Validation everywhere.",
 ["Every route in the table has a validator"]);

T("13.2","Audit ownership on every route","P1",
 "No user can reach another’s content.",
 ["13.1"], ["server/tests/security/ownership.test.js"],
 "One test that, as user B, calls every owner-scoped route with user A’s ids (series, episodes, notes, panels, scenes, references, renders, preview, AI, payments).",
 "Proven isolation.",
 ["Every call returns 404 or 403"]);

T("13.3","Add the injection guard","P1",
 "Block MongoDB operator injection.",
 ["13.2"], ["server/src/middleware/sanitizeInput.js", "server/src/app.js"],
 "Reject any body, query or params key that starts with `$` or contains `.` with 400 `INVALID_INPUT`. Test with `{ \"email\": { \"$gt\": \"\" } }` on login.",
 "Injection protection.",
 ["The operator payload returns 400"]);

T("13.4","Add the remaining rate limits","P1",
 "Slow down abuse.",
 ["13.3"], ["server/src/middleware/rateLimits.js"],
 "`authLimiter` 5 per minute per IP on login and register; `uploadLimiter` 20 per hour per user on references and renders; `paymentLimiter` 5 per 10 minutes on initiate. Tests for 429.",
 "Rate limiting complete.",
 ["Each limiter returns 429 when exceeded"]);

T("13.5","Add security headers and CSP","P1",
 "Harden browser behaviour.",
 ["13.4"], ["server/src/app.js", "client/index.html"],
 "Install `helmet` on the API. For the frontend, a Content-Security-Policy allowing self, Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`), Cloudinary images (`res.cloudinary.com`), the API origin for `connect-src` and the JazzCash sandbox domain for `form-action`. Set it as a host header in production (task 15.2) or a meta tag.",
 "Security headers.",
 ["The browser console shows no CSP violations during the creator flow"]);

T("13.6","Verify CORS","P1",
 "Only the Toonverse frontend can call the API with credentials.",
 ["13.5"], ["server/tests/security/cors.test.js"],
 "Test: the configured origin gets allow headers; any other origin does not.",
 "Confirmed CORS.",
 ["Test passes"]);

T("13.7","Review XSS exposure","P1",
 "No user text can run as code.",
 ["13.6"], ["client/src/"],
 "Confirm `react/no-danger` passes; AI output and bubble text are rendered as text; the text editor overlay uses `value`. Create content with `<script>alert(1)</script>` in titles, bios, notes and bubbles and check it shows as plain text.",
 "XSS reviewed.",
 ["No script runs anywhere"]);

T("13.8","Audit secrets","P1",
 "No key is exposed.",
 ["13.7"], [],
 "Search git history for key patterns. Build the client and search `dist/` for `sk-`, `CLOUDINARY_API_SECRET` and JazzCash values. Confirm `.env` was never committed.",
 "Clean repository and bundle.",
 ["No secret found anywhere"]);

T("13.9","Check production error mode","P1",
 "Errors don’t leak internals.",
 ["13.8"], ["server/src/middleware/errorHandler.js"],
 "Run with `NODE_ENV=production` and trigger a server error: the response has no stack trace; the server log keeps it with the request path.",
 "Safe error responses.",
 ["Responses contain only code and message"]);

T("13.10","Check CSRF protection","P1",
 "Cookie auth can’t be abused from other sites.",
 ["13.9"], ["docs/security-checklist.md"],
 "Confirm every state change uses POST, PUT, PATCH or DELETE; the cookie is SameSite=Lax; a cross-site form POST to the API carries no session. Document why the JazzCash return route is safe (hash-verified, no cookie needed).",
 "CSRF reviewed.",
 ["Checklist entries are complete"]);

T("13.11","Run the dependency audit","P1",
 "No known vulnerable packages.",
 ["13.10"], ["package-lock.json"],
 "`npm audit` for both packages; update or replace anything high or critical; re-run all tests.",
 "Clean audit.",
 ["No high or critical issues", "All tests still pass"],
 "chore(security): add input sanitising, rate limits, headers and complete security audit");

CP("Security hardened", ["Every row of the roadmap’s security table is checked", "Ownership, injection, CORS, XSS and CSRF tests pass", "No secrets in git or the client bundle", "Merge into develop"]);

PH(14, "Testing, QA & Performance", "");

T("14.1","Set up Playwright","P1",
 "Run real browser tests.",
 ["13.11"], ["e2e/playwright.config.js", "e2e/fixtures/", "package.json"],
 "Branch `feature/14-e2e`. Install Playwright at the root. Base URL `http://localhost:5173`. Before tests, reset and seed the test database. Projects: Chromium, Firefox and Edge (`msedge` channel).",
 "E2E test setup.",
 ["An empty test runs in all three browsers"]);

T("14.2","Write the authentication E2E test","P1",
 "Automate the auth flow.",
 ["14.1"], ["e2e/auth.spec.js"],
 "Register → logout → wrong password → login → refresh stays logged in → profile edit → guest mode banner.",
 "Auth E2E.",
 ["Passes in all browsers"]);

T("14.3","Write the creator flow E2E test","P1",
 "Automate the architecture’s main flow.",
 ["14.2"], ["e2e/creator.spec.js"],
 "Create series → episode → notes → draw a stroke with mouse moves → add a bubble with text → save → preview → publish → open the Reader view and see the images.",
 "Creator E2E.",
 ["Passes in all browsers"]);

T("14.4","Write the reader flow E2E test","P1",
 "Automate reading.",
 ["14.3"], ["e2e/reader.spec.js"],
 "Discover → series → episode → next episode → favourite → Favorites page.",
 "Reader E2E.",
 ["Passes in all browsers"]);

T("14.5","Write the admin E2E test","P1",
 "Automate moderation.",
 ["14.4"], ["e2e/admin.spec.js"],
 "Admin suspends a user (that user’s next action fails), unpublishes an episode (gone from Discover).",
 "Admin E2E.",
 ["Passes in all browsers"]);

T("14.6","Run the full test suite and fix failures","P0",
 "Get everything green together.",
 ["14.5"], [],
 "Run server, client and E2E tests together. Fix flaky waits (wait for responses, not timeouts) and real bugs.",
 "Green suite.",
 ["Three full runs in a row pass"],
 "test(e2e): add playwright tests for auth, creator, reader and admin flows");

T("14.7","Check browsers and phone width by hand","P1",
 "Catch what automation misses.",
 ["14.6"], [],
 "Draw, bubble and export by hand in Chrome, Edge and Firefox. Open Discover and the Reader view at 390 px width.",
 "Cross-browser confirmed.",
 ["No layout breaks and drawing works in all three"]);

T("14.8","Split the editor out of the main bundle","P1",
 "Make Discover and Reader load fast.",
 ["14.7"], ["client/src/routes/AppRouter.jsx"],
 "Lazy-load the workspace, canvas, export (Konva, jsPDF) and admin routes with `React.lazy`. Compare bundle sizes before and after.",
 "Smaller first load.",
 ["Discover no longer downloads Konva or jsPDF"]);

T("14.9","Optimise reader images","P1",
 "Serve the right image size and format.",
 ["14.8"], ["client/src/utils/cloudinaryUrl.js", "client/src/features/reader/ReaderView.jsx"],
 "Insert Cloudinary transformations `f_auto,q_auto,w_800` into rendered image URLs for the Reader view.",
 "Lighter images.",
 ["Network tab shows smaller, modern-format images"]);

T("14.10","Check database query plans","P1",
 "Make sure the main queries use indexes.",
 ["14.9"], ["docs/testing/performance.md"],
 "Run `explain()` for Discover, public read, panel list and favorites. Add any missing index to the models and data-model doc.",
 "Indexed queries.",
 ["No collection scan in the four main queries"]);

T("14.11","Run Lighthouse","P1",
 "Measure page performance.",
 ["14.10"], ["docs/testing/performance.md"],
 "Lighthouse on Discover and the Reader view (mobile). Record scores; fix the largest issues. The editor must open a 20-panel episode in under 3 s.",
 "Measured performance.",
 ["Scores and the editor load time are recorded"],
 "perf: lazy-load editor, optimise reader images and verify query indexes");

T("14.12","Run user acceptance testing","P1",
 "Watch real beginners use Toonverse.",
 ["14.11"], ["docs/testing/uat-script.md"],
 "3–5 beginner artists each create and publish a short episode using a written task script. Log every problem as a GitHub issue labelled `uat` with a priority.",
 "UAT report.",
 ["At least 3 sessions done", "Every problem is an issue"]);

T("14.13","Fix all P0 and P1 bugs","P0",
 "Clear blockers before release.",
 ["14.12"], [],
 "Work through open P0 and P1 issues, each on a `fix/` branch with a test where possible.",
 "Release-quality build.",
 ["Zero open P0 or P1 issues", "Full suite green"],
 "fix: resolve uat and qa issues");

CP("QA complete", ["All four architecture flows pass E2E in three browsers", "Performance targets met", "UAT done and its P0/P1 issues fixed", "Merge into develop"]);

PH(15, "Deployment", "");

T("15.1","Choose the hosting (D12)","P1",
 "Decide where Toonverse runs.",
 ["14.13"], ["docs/decisions.md"],
 "Pick a static host for the React build, a Node.js host for Express and a managed MongoDB service. Prefer frontend and API on the same site (e.g. `toonverse.app` and `api.toonverse.app`) so the SameSite=Lax cookie works (issue I3).",
 "Hosting decided.",
 ["D12 is filled in, including the domain plan"]);

T("15.2","Prepare production configuration","P1",
 "Make the code production-ready.",
 ["15.1"], ["server/src/app.js", "client/ (host config file)"],
 "`app.set('trust proxy', 1)` so secure cookies and rate limits work behind the host’s proxy. SPA fallback so every route serves `index.html`. CSP header from task 13.5 in the host config.",
 "Deployable builds.",
 ["`npm run build -w client` and `npm start -w server` work locally with production env"]);

T("15.3","Create the staging and production databases","P1",
 "Separate data per environment.",
 ["15.2"], [],
 "Two MongoDB databases, each with its own user (least privilege), network allowlist limited to the backend host, and backups on production.",
 "Databases ready.",
 ["Each environment’s user can access only its database"]);

T("15.4","Prepare third-party services per environment","P1",
 "Separate storage and keys per environment.",
 ["15.3"], [],
 "Cloudinary folders `toonverse/staging` and `toonverse/prod`. OpenAI keys per environment with spending limits. JazzCash sandbox return URLs per environment.",
 "Services ready.",
 ["Staging uploads never land in the prod folder"]);

T("15.5","Deploy the staging backend","P1",
 "Run the API on staging.",
 ["15.4"], [],
 "Create `release/v1.0.0` from develop and deploy it. Set every env variable from `.env.example`. Run `npm run db:indexes`.",
 "Staging API online.",
 ["`/api/health` on staging shows `db: connected`"]);

T("15.6","Deploy the staging frontend","P1",
 "Run the client on staging over HTTPS.",
 ["15.5"], [],
 "Build with `VITE_API_URL` pointing to the staging API; set `CLIENT_URL` on the API to the staging frontend.",
 "Staging site online.",
 ["Login works on staging (cookie set and sent)"]);

T("15.7","Test on staging","P1",
 "Final check in a production-like setup.",
 ["15.6"], [],
 "Run Playwright against staging, the premium manual script from task 11.21 with real sandbox payments, and the security checklist.",
 "Verified release candidate.",
 ["All flows pass on staging"]);

T("15.8","Tag the release candidate","P1",
 "Mark the build that goes live.",
 ["15.7"], [],
 "Tag `v0.9.0` on the release branch and fix anything found in a short bug-fix window on that branch.",
 "v0.9.0 RC.",
 ["Tag exists on GitHub"]);

T("15.9","Set up the domain and HTTPS","P1",
 "Give Toonverse its production address.",
 ["15.8"], [],
 "DNS records for the frontend and API; HTTPS certificates through the host; redirect HTTP to HTTPS.",
 "Secure production domains.",
 ["Both domains load over HTTPS only"]);

T("15.10","Deploy the production backend","P1",
 "Run the API in production.",
 ["15.9"], [],
 "Deploy the release branch with production env variables and `NODE_ENV=production`. Run `db:indexes` and `create-admin`. Never run the seed script.",
 "Production API online.",
 ["`/api/health` returns ok"]);

T("15.11","Deploy the production frontend","P1",
 "Run the client in production.",
 ["15.10"], [],
 "Build with the production `VITE_API_URL`; confirm `CLIENT_URL` and the CSP match the production domains.",
 "Production site online.",
 ["Discover loads on the production domain"]);

T("15.12","Point JazzCash to production","P1",
 "Payments return to the live site (still sandbox mode).",
 ["15.11"], [],
 "Set `JAZZCASH_RETURN_URL` to the production HTTPS API route and update the sandbox portal if it requires registered URLs.",
 "Production payment flow.",
 ["A sandbox payment on production returns to the result page"]);

T("15.13","Smoke test production","P1",
 "Check the live site.",
 ["15.12"], [],
 "Run the four flows by hand on production with a fresh account. Fix through `hotfix/` branches if needed.",
 "Verified production.",
 ["All four flows work in production"]);

T("15.14","Set up monitoring","P1",
 "Know when something breaks.",
 ["15.13"], ["docs/operations.md"],
 "Uptime check on `/api/health`; usage alerts for Cloudinary storage and OpenAI spend; test restoring a MongoDB backup; write the weekly log-review routine.",
 "Monitoring in place.",
 ["An alert fires when health is stopped in a test", "A backup restore was tested"]);

CP("Toonverse is live", ["Frontend and API run over HTTPS on production domains", "Production uses its own database, storage folder and keys", "Monitoring and backups work"]);

PH(16, "Documentation & v1.0.0 Release", "");

T("16.1","Finalise the API documentation","P1",
 "Docs match the real API.",
 ["15.14"], ["docs/api.md"],
 "Branch `feature/16-release`. Compare every route in the code with docs/api.md and fix differences.",
 "Accurate API docs.",
 ["Every route is documented correctly"]);

T("16.2","Finalise the data model and decision log","P1",
 "Record the system as built.",
 ["16.1"], ["docs/data-model.md", "docs/decisions.md"],
 "Update fields and indexes to match the models; close every decision with its final answer.",
 "Accurate design docs.",
 ["No open item remains in the decision log"]);

T("16.3","Finalise the README","P1",
 "The front page of the project.",
 ["16.2"], ["README.md"],
 "Overview, links to the architecture diagram and roadmap, setup, scripts, env variables, testing and deployment summary.",
 "Complete README.",
 ["A new developer can run Toonverse from it alone"]);

T("16.4","Write the creator user guide","P1",
 "Help beginners use Toonverse.",
 ["16.3"], ["docs/user-guide.md"],
 "From sign-up to publishing, with screenshots of each workspace step, AI help, premium and export.",
 "User guide.",
 ["Covers every step of the creator flow"]);

T("16.5","Write the admin guide","P2",
 "Help admins operate Toonverse.",
 ["16.4"], ["docs/admin-guide.md"],
 "Creating admins, user suspension, unpublishing, reading payments.",
 "Admin guide.",
 ["Covers every admin screen"]);

T("16.6","Write the release notes","P1",
 "Describe v1.0.0.",
 ["16.5"], ["CHANGELOG.md"],
 "List every feature by architecture module, known limitations (JazzCash sandbox only; export resolution enforced in the browser, see issue I5), and the setup changes.",
 "Release notes.",
 ["Every architecture module appears"]);

T("16.7","Release v1.0.0","P1",
 "Ship Toonverse.",
 ["16.6"], [],
 "Merge `release/v1.0.0` into `main`, tag `v1.0.0`, publish a GitHub Release with the notes, merge `main` back into `develop`.",
 "Toonverse v1.0.0.",
 ["Tag and GitHub Release exist", "main equals production"],
 "docs: finalise documentation and release notes for v1.0.0");

T("16.8","Record the demo","P2",
 "Show the four flows.",
 ["16.7"], [],
 "Screen-record the creator, authentication, reader and premium flows on production.",
 "Demo video.",
 ["Video covers all four flows"]);

CP("Toonverse v1.0.0 complete", ["Every architecture component is implemented and tested", "Production is live and monitored", "Docs and release notes are complete", "Milestone M6 closed"]);

PH(99, "Post-v1.0 Backlog (optional)", "P2 and P3 improvements from the roadmap. None blocks v1.0.0.");

T("6.24","Add touch and stylus input","P2",
 "Draw on tablets.",
 ["16.7"], ["client/src/features/canvas/tools/brush.js"],
 "Branch `feature/06-touch`. Handle touch and pen pointer types, block page scroll while drawing, add two-finger pan and pinch zoom.",
 "Tablet drawing.",
 ["Drawing works on a tablet browser without scrolling the page"]);

T("6.25","Add pen pressure","P3",
 "Pressure-sensitive brush strokes.",
 ["6.24"], ["client/src/features/canvas/tools/brush.js", "docs/data-model.md"],
 "Store pressure per point (format version bump with a migration in `fromJSON`) and vary width.",
 "Pressure brush.",
 ["Old scenes still load"]);

T("7.26","Insert AI dialogue into a bubble","P2",
 "One-click use of a dialogue suggestion.",
 ["6.25"], ["client/src/features/panels/DialogueHelper.jsx"],
 "An ‘Insert into selected bubble’ action that sets the bubble text as one undo step.",
 "Faster dialogue.",
 ["Undo restores the previous text"]);

T("12.14","Add an admin audit trail","P3",
 "Record who did what.",
 ["7.26"], ["server/src/models/AdminAction.js", "client/src/features/admin/AdminAuditPage.jsx"],
 "Store admin id, action, target and time for suspend, reactivate and unpublish; list them in the admin panel. This adds a collection, so record it in the decision log first.",
 "Audit trail.",
 ["Every admin action appears in the list"]);

T("1.23","Add continuous integration","P3",
 "Run lint and tests on every PR.",
 ["12.14"], [".github/workflows/ci.yml"],
 "A GitHub Actions workflow running lint and server and client tests with a MongoDB service container.",
 "CI.",
 ["A PR shows passing checks"]);
