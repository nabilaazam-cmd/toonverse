// Toonverse execution plan — part 1: Phases 0, 1, 6 (spike), 2, 3
// T(localId, title, priority, objective, prerequisites[], files[], action, result, doneWhen[], commitMessage?)

PH(0, "Scope Lock & Technical Decisions", "Documents only. No application code.");

T("0.1","Create the develop branch and the planning branch","P0",
 "Give planning documents and all later work a proper branch to land on.",
 [], [".git (branches)", ".gitignore", "GitHub repository settings (owner: Nabila Azam)"],
 "Revert the uncommitted trailing-space edit to `.gitignore` on `database` (whitespace only; needs approval). Nabila Azam, as repository owner and signed in as herself, creates `develop` from `main` and sets `develop` as the default branch (Q4), or explicitly authorizes an administrator to do it. Locally: fetch, then rename `database` to `feature/02-data-model` (Khadija Gulzar's branch, used in Phase 2) and push the rename only with approval. Create `feature/00-planning` from `develop` for this phase.",
 "`main` (production), `develop` (integration, default), `feature/02-data-model` and `feature/00-planning` exist on GitHub.",
 ["`git branch -a` lists all four branches", "GitHub shows `develop` as the default branch", "The `.gitignore` whitespace edit is gone and no other uncommitted change was touched", "No owner setting was changed by anyone other than Nabila Azam or someone she authorized"]);

T("0.2","Review and commit the decision log","P0",
 "One place where every architecture decision is written down.",
 ["0.1"], ["docs/decisions.md"],
 "The decision log was prepared from the team’s confirmed answers (2026-10-12). Check it has one section per decision D1–D15 with Question, Decision, Date, Consequences and Affected tasks, and that nothing in it differs from what the team confirmed.",
 "A structured decision log the team has reviewed.",
 ["All 15 sections exist", "Each section uses the same five fields", "The team has read it"]);

T("0.3","Confirm decisions D1–D5 in the log","P0",
 "Fix the decisions that shape users, auth and drawing storage.",
 ["0.2"], ["docs/decisions.md"],
 "Check the confirmed answers: guests explore and try, but must register and log in to save and publish (D1); Konva JSON in MongoDB plus Cloudinary images for published panels (D2); PNG and PDF export in the browser (D3); JWT in an httpOnly cookie (D4); one User collection with `role`, `isPremium`, `premiumUntil`, first admin by script (D5).",
 "D1–D5 are confirmed.",
 ["Every field of D1–D5 is filled", "Each decision lists its affected tasks"]);

T("0.4","Confirm decisions D6–D11 in the log","P0",
 "Fix premium, payments, lifecycle, panel size, saving and AI rules.",
 ["0.3"], ["docs/decisions.md"],
 "Check the confirmed answers: limits free 5 layers, 10 AI requests a day, 1× export and premium 20 layers, 50 AI requests, 2× export, configurable and enforced on the server except export resolution, which is a documented browser-only limit (D6); one-time sandbox payment for 30 days with the PKR price pending (D7); draft, published, unpublished (D8); 800 px panels (D9); manual save + auto-save after 3 s idle with a 30 s fallback and version numbers + local recovery drafts in IndexedDB (D10); AI quota, output limits and server-side validation (D11).",
 "D6–D11 are confirmed, with the price explicitly pending.",
 ["Every limit has a number", "D7 says ‘price pending, decide before task 11.1’", "D10 records why IndexedDB was chosen over localStorage", "D6 lists export resolution as a known limitation"]);

T("0.5","Confirm D12–D15 and the supporting libraries","P0",
 "Close the remaining decisions and the library list before any install.",
 ["0.4"], ["docs/decisions.md"],
 "Check: D12 hosting deferred to task 15.1; D13 admin = search and view users, suspend and reactivate, unpublish episodes (payments list and stats lower priority); D14 Payment model with user, unique txnRefNo, amount, status and provider response, premium only from verified payments; D15 delete a Cloudinary image only after confirming nothing else references it. Vite and Mongoose are confirmed by the team; the team approves or rejects each remaining supporting library: React Router, cors, helmet, express-rate-limit, express-validator, cookie-parser, Vitest, Supertest, React Testing Library, Playwright, ESLint, Prettier.",
 "Complete decision log and library list.",
 ["D12 shows ‘deferred to task 15.1’", "The library list is in the log"],
 "docs: add confirmed decision log, plan documents and git workflow");

T("0.6","Write the data model document","P0",
 "Describe every collection before writing a model.",
 ["0.5"], ["docs/data-model.md"],
 "For User, Series, Episode, Note, Panel, Favorite and Payment, list each field with type, required, default, limits and references. List indexes: unique email; unique series + number; status + publishedAt; episode + order; unique user + series favorite; unique txnRefNo.",
 "A complete data model on paper.",
 ["All 7 collections are described", "Every reference names its target collection", "Every index has a reason"]);

T("0.7","Write the API contract: auth, users, series, episodes, notes","P0",
 "Let frontend and backend build against one agreed interface.",
 ["0.6"], ["docs/api.md"],
 "Define the shared error format `{ error: { code, message, details } }`. For each endpoint write method, path, auth rule, request body, success response and error codes. Covers `/api/auth/*`, `/api/users/me*`, `/api/series*`, `/api/episodes*` and notes.",
 "API contract part 1.",
 ["Every endpoint lists its error codes", "The error format is defined once at the top"]);

T("0.8","Write the API contract: panels, uploads, save, preview, publish, reader, favorites","P0",
 "Cover the whole creator and reader flow.",
 ["0.7"], ["docs/api.md"],
 "Add panels CRUD and reorder, reference uploads, scene save with version conflicts, preview, rendered image upload, publish and unpublish, Discover, public read routes and favorites.",
 "API contract part 2.",
 ["Every architecture module from the creator and reader flows has endpoints"]);

T("0.9","Write the API contract: AI, premium, payments, admin","P0",
 "Finish the contract.",
 ["0.8"], ["docs/api.md"],
 "Add the four `/api/ai/*` endpoints, `/api/premium/plan` and `/status`, JazzCash initiate, return and status, and every `/api/admin/*` endpoint.",
 "A complete API contract.",
 ["Every backend module in the architecture appears in docs/api.md"]);

T("0.10","Write the AI assistant policy","P1",
 "Turn ‘AI is an assistant only’ into rules the code can follow.",
 ["0.5"], ["docs/ai-policy.md"],
 "List allowed tasks (notes help, organizing ideas, panel planning, dialogue suggestions), refused tasks (full episodes, full stories, artwork), input and output length caps and the daily quota.",
 "The rules task 5.7 turns into a system prompt.",
 ["Allowed and refused tasks are listed", "Limits match D11"]);

T("0.11","Draw wireframes for the 11 frontend modules","P1",
 "Know what each screen contains before building it.",
 ["0.9"], ["docs/wireframes/"],
 "Sketch Authentication, Profile, Dashboard, Series & Episodes, Episode workspace (Notes, Draw, Panels, Preview, Publish), Discover, Reader, Premium and Admin. Any drawing tool or paper photographed as PNG.",
 "One wireframe per module.",
 ["11 wireframes exist", "Each shows its main actions and states"],
 "docs: add data model, API contract, AI policy and wireframes");

CP("Scope locked", ["Every decision D1–D15 has an answer or a scheduled task", "docs/data-model.md and docs/api.md cover the whole architecture", "The library list is approved", "Planning branch merged into develop through a PR"]);

PH(1, "Repository & Development Environment", "");

T("1.1","Create the monorepo layout","P0",
 "Separate the frontend, backend and docs in one repository.",
 ["0.11"], ["client/", "server/", "docs/", "package.json", ".gitignore"],
 "Create branch `feature/01-setup` from `develop`. Add a root `package.json` with npm workspaces `client` and `server`. Extend `.gitignore` with `node_modules`, `dist`, `coverage`, `.env`, `.env.*`, `!.env.example`, `playwright-report`.",
 "An empty but correctly ignored monorepo.",
 ["`npm install` at the root works", "`git status` shows no ignored files"]);

T("1.2","Create the server package","P0",
 "Start the Node.js + Express backend.",
 ["1.1"], ["server/package.json"],
 "Initialise with `\"type\": \"module\"`. Install `express`. Scripts: `dev` = `node --watch --env-file=.env src/server.js`, `start` = `node src/server.js`, `test` = `vitest run`. Require Node 20.6 or newer in `engines` (needed for `--env-file` and `--watch`, so no extra env or reload libraries).",
 "A server package with scripts.",
 ["`node -v` is 20.6 or newer", "Express is in dependencies"]);

T("1.3","Create the server folder structure","P0",
 "Fix where every kind of backend code lives.",
 ["1.2"], ["server/src/{config,models,routes,controllers,services,middleware,validators,utils}/", "server/scripts/", "server/tests/"],
 "Create the folders from the roadmap repository structure. Add a short comment file or `.gitkeep` where a folder is still empty.",
 "The backend skeleton every later task fills.",
 ["All folders exist and are committed"]);

T("1.4","Create the environment config module","P0",
 "Load settings in one place and refuse to start without them.",
 ["1.3"], ["server/src/config/env.js", "server/.env.example", "server/.env"],
 "Read `NODE_ENV`, `PORT`, `CLIENT_URL`, `MONGODB_URI`, `MONGODB_URI_TEST`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_ROUNDS`. Throw one error listing every missing required variable. Export a frozen config object. Put names only in `.env.example`.",
 "A typed config the rest of the server imports.",
 ["Removing a required variable stops startup with its name in the message", "`.env` is not tracked by git"]);

T("1.5","Create the error utilities","P0",
 "One error format for the whole API.",
 ["1.4"], ["server/src/utils/ApiError.js", "server/src/middleware/errorHandler.js", "server/src/middleware/notFound.js"],
 "`ApiError(status, code, message, details)`. `errorHandler` turns any error into `{ error: { code, message, details } }`, hides stack traces when `NODE_ENV=production` and logs server errors. `notFound` returns 404 `NOT_FOUND`.",
 "Error handling every route will use.",
 ["An unknown route returns the 404 JSON format", "A thrown ApiError returns its own status and code"]);

T("1.6","Create the Express app and server entry","P0",
 "Separate the app from the listener so tests can import it.",
 ["1.5"], ["server/src/app.js", "server/src/server.js", "server/src/routes/index.js"],
 "`app.js` builds the app: `express.json({ limit: '1mb' })`, mounts `routes/index.js` on `/api`, then `notFound` and `errorHandler`, and exports the app. `server.js` imports the app and listens on `PORT`.",
 "A running Express server.",
 ["`npm run dev -w server` starts without errors", "Any request returns JSON"]);

T("1.7","Add the health endpoint","P0",
 "A simple check that the server and database are alive.",
 ["1.6"], ["server/src/routes/health.routes.js"],
 "`GET /api/health` returns `{ status: 'ok', db: 'connected' | 'disconnected', uptime }`. Database state comes from task 1.9; return `disconnected` until then.",
 "A health route.",
 ["`GET /api/health` returns 200 with the three fields"]);

T("1.8","Set up MongoDB databases for development and testing","P0",
 "Have somewhere to store data.",
 ["1.4"], ["server/.env"],
 "Install MongoDB Community Server locally (or create a cloud MongoDB development database). Use two databases: `toonverse_dev` and `toonverse_test`. Put both connection strings in `.env`.",
 "Two reachable databases.",
 ["You can connect to both with MongoDB Compass or `mongosh`"]);

T("1.9","Create the database connection module","P0",
 "Connect Express to MongoDB.",
 ["1.7", "1.8"], ["server/src/config/db.js", "server/src/server.js", "server/src/routes/health.routes.js"],
 "Install `mongoose`. `connectDB(uri)` connects and logs success or failure; `disconnectDB()` closes. `server.js` connects before listening. The health route reads `mongoose.connection.readyState`.",
 "The server is connected to MongoDB.",
 ["Health shows `db: connected`", "With MongoDB stopped, startup logs a clear error"]);

T("1.10","Verify and debug the server foundation","P0",
 "Make sure the base works before building on it.",
 ["1.9"], ["server/"],
 "Run three checks: normal start, missing `JWT_SECRET`, MongoDB stopped. Fix anything that crashes without a clear message.",
 "A server that fails loudly and clearly.",
 ["All three checks behave as expected"],
 "chore(server): scaffold express server with config, errors, health check and mongodb");

T("1.11","Scaffold the React app","P0",
 "Start the frontend.",
 ["1.10"], ["client/"],
 "Create a Vite React (JavaScript) app in `client/`. Remove the demo content. Keep port 5173.",
 "An empty React app.",
 ["`npm run dev -w client` shows a blank page with the Toonverse title"]);

T("1.12","Configure Tailwind CSS","P0",
 "Set up the styling system.",
 ["1.11"], ["client/tailwind.config.js", "client/src/styles/index.css"],
 "Install and configure Tailwind for Vite. Define theme tokens: `ink`, `paper`, `accent`, `muted`, `danger`, and font families `ui` and `lettering`.",
 "Tailwind classes work.",
 ["A test element using `bg-accent text-paper` shows the theme colours"]);

T("1.13","Add Google Fonts","P1",
 "Load the UI font and the comic lettering fonts.",
 ["1.12"], ["client/index.html", "client/src/config/fonts.js"],
 "Link one UI font and three lettering fonts from Google Fonts in `index.html`. `fonts.js` exports the lettering font list (name and CSS family) for the text tool in Phase 7.",
 "Fonts available to the UI and later to the canvas.",
 ["The network tab shows the fonts loading", "`fonts.js` exports exactly the linked fonts"]);

T("1.14","Configure the development proxy","P0",
 "Let the client call `/api` without CORS problems during development.",
 ["1.11", "1.10"], ["client/vite.config.js", "client/.env.example"],
 "Proxy `/api` to `http://localhost:5000`. Add `VITE_API_URL=` to `.env.example` (empty in development, set in production).",
 "Client requests to `/api` reach Express.",
 ["Opening `http://localhost:5173/api/health` returns the server JSON"]);

T("1.15","Create the API client","P0",
 "One function every frontend API module uses.",
 ["1.14"], ["client/src/api/client.js"],
 "A `request(method, path, body)` wrapper around `fetch`: prefixes `VITE_API_URL`, sends `credentials: 'include'`, sends and parses JSON, and throws an `ApiRequestError` holding `status`, `code`, `message` and `details` from the shared error format.",
 "A consistent way to call the API.",
 ["A failed call throws an error with the server’s `code`"]);

T("1.16","Add routing and a health check page","P0",
 "Prove the client-to-server path.",
 ["1.15"], ["client/src/routes/AppRouter.jsx", "client/src/main.jsx", "client/src/features/discover/HomePlaceholder.jsx"],
 "Install React Router. `AppRouter` defines `/` with a placeholder page that calls `/api/health` and shows ‘API connected’ or the error.",
 "A routed app that talks to the server.",
 ["The page shows ‘API connected’ with both servers running", "Stopping the server shows a readable error"],
 "chore(client): scaffold react app with tailwind, google fonts, router and api client");

T("1.17","Add CORS and cookie parsing to the server","P0",
 "Prepare for cookie auth and a separate production frontend.",
 ["1.16"], ["server/src/app.js"],
 "Install `cors` and `cookie-parser`. Allow only `CLIENT_URL`, with `credentials: true`.",
 "The server accepts credentialed requests from the client origin only.",
 ["A request with `Origin: http://evil.test` gets no CORS allow header"]);

T("1.18","Configure ESLint and Prettier","P1",
 "One code style for the team.",
 ["1.17"], ["client/eslint.config.js", "server/eslint.config.js", ".prettierrc", "package.json"],
 "Set up ESLint for React (client) and Node (server), plus Prettier. Add the rule `react/no-danger: error` now (used by security task 13.7). Root script `npm run lint` runs both.",
 "Linting on both packages.",
 ["`npm run lint` passes"]);

T("1.19","Set up the test runners","P0",
 "Make testing possible from the first feature.",
 ["1.18"], ["server/vitest.config.js", "server/tests/setup.js", "server/tests/health.test.js", "client/vitest.config.js", "client/src/test/setup.js"],
 "Server: Vitest + Supertest. `setup.js` connects to `MONGODB_URI_TEST` and drops the test database after each file. First test: `GET /api/health` returns 200. Client: Vitest + React Testing Library + jsdom with one smoke test.",
 "Working test commands in both packages.",
 ["`npm test -w server` and `npm test -w client` pass", "Tests never touch `toonverse_dev`"]);

T("1.20","Create the third-party accounts","P1",
 "Have the keys ready before the phases that need them.",
 ["1.4"], ["server/.env", "server/.env.example"],
 "Create a Cloudinary account, an OpenAI API key with a low monthly spending limit, and a JazzCash sandbox merchant account. Put real values only in `.env` and names in `.env.example`. They are first used in tasks 7.15, 5.6 and 11.10.",
 "Credentials stored safely.",
 ["Every key is in `.env` and none is in git"]);

T("1.21","Configure GitHub","P1",
 "Protect branches and standardise pull requests.",
 ["1.1"], [".github/pull_request_template.md"],
 "PR template sections: What changed, How it was tested, Screenshots, New env variables. Create labels `phase:00`–`phase:16`, `P0`–`P3`, `type:*`, `area:client`, `area:server`. Repository-owner settings are done by Nabila Azam signed in as herself (or an administrator she authorizes): rulesets on `main` and `develop` (PR required, 1 approval from another member, no force push, no deletion), secret scanning and push protection, squash and merge commits allowed, auto-delete head branches. Create milestones M1–M6.",
 "A ready GitHub workflow.",
 ["A direct push to `develop` is rejected", "Each setting is verified on GitHub, not assumed"]);

T("1.22","Write the README setup guide","P1",
 "Anyone can run Toonverse from a fresh clone.",
 ["1.19"], ["README.md"],
 "Prerequisites (Node 20.6+, MongoDB), install, env setup, the two dev commands, test and lint commands.",
 "Setup documentation.",
 ["A teammate sets up a fresh clone in under 15 minutes using only the README"],
 "chore(repo): add cors, linting, test runners, github templates and readme");

CP("Foundation running", ["Server and client start with one command each", "The client shows ‘API connected’", "Tests and lint pass", "Secrets live only in .env", "Merge `feature/01-setup` into develop"]);

PH(6, "Drawing Canvas Engine", "Part 1 of 2 — spike. Done now because the canvas is the biggest risk and its format decides the Panel model.");

T("6.1","Build the React-Konva spike","P0",
 "Prove freehand drawing works with React-Konva.",
 ["1.16"], ["client/src/features/canvas/spike/CanvasSpike.jsx", "client/src/routes/AppRouter.jsx"],
 "Branch `feature/06-canvas-spike`. Install `konva` and `react-konva`. Add a temporary route `/dev/canvas-spike` with an 800 × 1200 Stage and one Layer. Pointer down starts a `Line`, move appends points, up finishes it.",
 "You can draw lines in the browser.",
 ["Strokes follow the mouse smoothly", "Lines have round caps and joins"]);

T("6.2","Run the stroke stress test","P0",
 "Find out whether the canvas stays fast with a full panel of strokes.",
 ["6.1"], ["client/src/features/canvas/spike/CanvasSpike.jsx", "docs/decisions.md"],
 "Add a button that generates 2,000 random strokes. Measure draw time and drawing lag, then try `listening(false)` and layer caching. Write the numbers into D2 in the decision log.",
 "Measured performance limits.",
 ["Numbers for before and after optimisation are recorded"]);

T("6.3","Define the scene JSON format","P0",
 "Freeze the format that MongoDB, save, export and publish all depend on.",
 ["6.2"], ["docs/data-model.md"],
 "Document `{ formatVersion, width, height, layers: [{ id, name, visible, locked, opacity, shapes: [...] }] }`. Shape types: `stroke` (tool brush or eraser, color, size, opacity, points rounded to integers), `bubble` and `text` (detailed in task 7.7), `image` (referenceId, url, x, y, w, h, opacity). Measure the JSON size of the 2,000-stroke panel.",
 "The panel scene format.",
 ["Format documented with an example", "Measured size is far below MongoDB’s 16 MB document limit"],
 "chore(canvas): add react-konva spike and define panel scene format");

CP("Canvas risk measured", ["React-Konva handles a dense panel", "The scene format is documented", "Merge the spike branch into develop"]);

PH(2, "Data Model & MongoDB", "");

T("2.1","Create the model JSON plugin","P0",
 "Make every model return clean JSON.",
 ["6.3", "1.9"], ["server/src/models/plugins/toJSON.js"],
 "Switch to branch `feature/02-data-model` (rebased on develop). A Mongoose plugin that maps `_id` to `id`, removes `__v`, and removes any field marked `private: true`.",
 "A plugin all models apply.",
 ["A test document serialises without `_id` or `__v`"]);

T("2.2","Create the User model","P0",
 "Store accounts.",
 ["2.1"], ["server/src/models/User.js"],
 "Fields: `name` (2–60), `email` (unique, lowercase, trimmed), `passwordHash` (`select: false`, private), `role` (`user` | `admin`, default user), `isPremium` (false), `premiumUntil` (Date), `bio` (max 300), `status` (`active` | `suspended`), `aiUsage { date, count }`, timestamps.",
 "The User model.",
 ["Importing the model works", "Saving without email fails validation", "`passwordHash` never appears in JSON"]);

T("2.3","Create the Series model","P0",
 "Store series.",
 ["2.2"], ["server/src/models/Series.js"],
 "Fields: `creator` (ref User, indexed), `title` (1–100), `description` (max 1000), timestamps.",
 "The Series model.",
 ["Saving without a creator fails validation"]);

T("2.4","Create the Episode model","P0",
 "Store episodes and their lifecycle.",
 ["2.3"], ["server/src/models/Episode.js"],
 "Fields: `series` (ref), `creator` (ref), `number`, `title` (1–100), `status` (`draft` | `published` | `unpublished`, default draft), `publishedAt`, `lastSavedAt`, timestamps. Indexes: unique `{ series, number }`, `{ status, publishedAt: -1 }`.",
 "The Episode model.",
 ["Two episodes with the same number in one series fail", "Invalid status fails"]);

T("2.5","Create the Note model","P0",
 "Store episode notes.",
 ["2.4"], ["server/src/models/Note.js"],
 "Fields: `episode` (ref, unique), `creator` (ref), `content` (max 20,000), timestamps.",
 "The Note model.",
 ["A second note for one episode fails"]);

T("2.6","Create the Panel model","P0",
 "Store panels with their editable scene.",
 ["2.5"], ["server/src/models/Panel.js"],
 "Fields: `episode` (ref), `creator` (ref), `order`, `width` (800), `height` (200–2400), `scene` (Mixed, format from 6.3), `version` (default 0), `referenceImages [{ url, publicId }]`, `rendered { url, publicId, version }`. Index `{ episode, order }`.",
 "The Panel model.",
 ["A panel with the 6.3 example scene saves and reloads unchanged"]);

T("2.7","Create the Favorite model","P1",
 "Store reader favorites.",
 ["2.6"], ["server/src/models/Favorite.js"],
 "Fields: `user` (ref), `series` (ref), timestamps. Unique index `{ user, series }`.",
 "The Favorite model.",
 ["A duplicate favorite fails"]);

T("2.8","Create the Payment model","P1",
 "Store JazzCash sandbox transactions (D14).",
 ["2.7"], ["server/src/models/Payment.js"],
 "Fields: `user` (ref), `txnRefNo` (unique), `amount`, `currency` (PKR), `status` (`pending` | `paid` | `failed`), `responseCode`, `responseMessage`, `raw` (Mixed), `paidAt`, timestamps.",
 "The Payment model.",
 ["A duplicate `txnRefNo` fails"]);

T("2.9","Create the index sync script","P0",
 "Make sure every index really exists in MongoDB.",
 ["2.8"], ["server/scripts/sync-indexes.js", "server/package.json"],
 "Connect, run `syncIndexes()` on every model, print the result, disconnect. Script `npm run db:indexes`.",
 "Indexes created in the dev database.",
 ["MongoDB Compass shows every index from docs/data-model.md"]);

T("2.10","Write model tests","P1",
 "Lock model rules with tests.",
 ["2.9", "1.19"], ["server/tests/models/*.test.js"],
 "Test required fields, enums, length limits and every unique index (duplicate error code 11000) against the test database.",
 "Model test suite.",
 ["Every model has at least one passing test"]);

T("2.11","Fix model test failures","P0",
 "Debug before moving on.",
 ["2.10"], ["server/src/models/"],
 "Fix failing tests. Usual causes: indexes not built before the duplicate test (await `init()`), wrong enum values, missing `lowercase` on email.",
 "A green model suite.",
 ["`npm test -w server` passes"]);

T("2.12","Create the seed and reset scripts","P1",
 "Fill the dev database with realistic sample data.",
 ["2.11"], ["server/scripts/seed.js", "server/scripts/reset.js", "server/package.json"],
 "Install `bcrypt` (used again in task 3.1). `seed.js` creates a creator, a reader and an admin (hashed passwords), two series, three episodes (one published), a note, and panels using the 6.3 example scene. `reset.js` clears all collections. Scripts `npm run seed` and `npm run db:reset`.",
 "Repeatable sample data.",
 ["`npm run db:reset && npm run seed` runs twice in a row without errors"],
 "feat(db): add mongoose models, indexes, tests and seed scripts");

CP("Data layer ready", ["All 7 collections exist with validation and indexes", "Model tests pass", "Seed data loads", "Merge `feature/02-data-model` into develop"]);

PH(3, "Authentication, Guest Mode & Profile", "Backend first (service → controller → validation → route → test), then frontend.");

T("3.1","Create the password utility","P0",
 "Hash and verify passwords in one place.",
 ["2.12"], ["server/src/utils/password.js", "server/tests/utils/password.test.js"],
 "Branch `feature/03-auth`. `hashPassword(plain)` uses bcrypt with `BCRYPT_ROUNDS` (default 12). `verifyPassword(plain, hash)`. Unit test both.",
 "Password helpers the register and login services use.",
 ["A hash never equals the input", "The right password verifies and the wrong one fails"]);

T("3.2","Create the token utility","P0",
 "Sign and verify JWTs.",
 ["3.1"], ["server/src/utils/token.js", "server/tests/utils/token.test.js"],
 "Install `jsonwebtoken`. `signToken({ sub, role })` with `JWT_SECRET` and `JWT_EXPIRES_IN`. `verifyToken(token)` returns the payload or throws `ApiError(401, 'INVALID_TOKEN')`.",
 "Token helpers.",
 ["Expired and tampered tokens throw 401 in tests"]);

T("3.3","Create the auth cookie helper","P0",
 "Store the JWT in an httpOnly cookie (D4).",
 ["3.2"], ["server/src/utils/authCookie.js"],
 "`setAuthCookie(res, token)`: name `tv_token`, `httpOnly`, `sameSite: 'lax'`, `secure` in production, `maxAge` equal to the token lifetime, `path: '/'`. `clearAuthCookie(res)`.",
 "Cookie helpers.",
 ["The cookie flags match the D4 decision"]);

T("3.4","Create the registration service","P0",
 "Business logic for creating an account.",
 ["3.3"], ["server/src/services/auth.service.js"],
 "`registerUser({ name, email, password })`: if the email exists throw `ApiError(409, 'EMAIL_TAKEN')`; hash the password; create the user; return it without the hash.",
 "A tested-ready register service.",
 ["Calling it twice with one email throws EMAIL_TAKEN"]);

T("3.5","Create the registration controller","P0",
 "Turn the service into an HTTP response.",
 ["3.4"], ["server/src/controllers/auth.controller.js"],
 "`register(req, res)`: call the service, sign a token, set the cookie, respond 201 `{ user }`.",
 "The register handler.",
 ["The handler never sends the password hash"]);

T("3.6","Create the validation middleware and register rules","P0",
 "Reject bad input before it reaches the service.",
 ["3.5"], ["server/src/middleware/validate.js", "server/src/validators/auth.validators.js"],
 "Install `express-validator`. `validate` returns 400 `VALIDATION_ERROR` with `details: [{ field, message }]`. `registerRules`: name 2–60 trimmed, valid email normalised, password 8–72 characters (bcrypt ignores bytes after 72).",
 "Reusable validation.",
 ["Invalid input returns 400 with one detail per bad field"]);

T("3.7","Create the registration route","P0",
 "Expose `POST /api/auth/register`.",
 ["3.6"], ["server/src/routes/auth.routes.js", "server/src/routes/index.js"],
 "Route: `registerRules`, `validate`, `register`. Mount the auth router on `/api/auth`.",
 "A working register endpoint.",
 ["A request with valid data returns 201 and sets the `tv_token` cookie"]);

T("3.8","Test the registration API","P0",
 "Prove registration works and fails correctly.",
 ["3.7"], ["server/tests/auth/register.test.js"],
 "Cases: valid → 201 with cookie and no password in body; duplicate email → 409; bad email, short password, missing name → 400; email stored lowercase.",
 "Register test suite.",
 ["All cases are written and run"]);

T("3.9","Fix registration issues","P0",
 "Debug what the tests found.",
 ["3.8"], ["server/src/middleware/errorHandler.js", "server/src/services/auth.service.js"],
 "Typical fix: two simultaneous sign-ups hit the unique index and return 500. Map MongoDB duplicate key error 11000 to 409 in the error handler.",
 "Reliable registration.",
 ["All register tests pass"],
 "feat(auth): add user registration with bcrypt hashing and validation");

T("3.10","Create the login service","P0",
 "Check credentials safely.",
 ["3.9"], ["server/src/services/auth.service.js"],
 "`loginUser({ email, password })`: load with `+passwordHash`; unknown email or wrong password both throw `ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')`; suspended → 403 `ACCOUNT_SUSPENDED`.",
 "The login service.",
 ["Unknown email and wrong password produce identical errors"]);

T("3.11","Create the login controller, rules and route","P0",
 "Expose `POST /api/auth/login`.",
 ["3.10"], ["server/src/controllers/auth.controller.js", "server/src/validators/auth.validators.js", "server/src/routes/auth.routes.js"],
 "`loginRules`: email and password required. Controller signs the token, sets the cookie and returns `{ user }`.",
 "A working login endpoint.",
 ["Valid login returns 200 and sets the cookie"]);

T("3.12","Test the login API","P0",
 "Prove login is safe.",
 ["3.11"], ["server/tests/auth/login.test.js"],
 "Cases: success; wrong password; unknown email (same body as wrong password); suspended user 403; missing fields 400.",
 "Login test suite passing.",
 ["All login tests pass"]);

T("3.13","Create the requireAuth middleware","P0",
 "Identify the user on protected routes.",
 ["3.12"], ["server/src/middleware/requireAuth.js"],
 "Read `tv_token`, verify it, load the user, reject a missing user or suspended account, set `req.user`. Missing or invalid token → 401 `UNAUTHENTICATED`.",
 "Middleware every private route uses.",
 ["A request without a cookie gets 401"]);

T("3.14","Create the me and logout endpoints","P0",
 "Restore sessions and end them.",
 ["3.13"], ["server/src/controllers/auth.controller.js", "server/src/routes/auth.routes.js"],
 "`GET /api/auth/me` (requireAuth) returns `{ user }`. `POST /api/auth/logout` clears the cookie and returns 204.",
 "Session endpoints.",
 ["`me` works right after login", "After logout, `me` returns 401"]);

T("3.15","Create the role and premium middleware","P0",
 "Guard admin and premium routes.",
 ["3.13"], ["server/src/middleware/requireRole.js", "server/src/middleware/requirePremium.js"],
 "`requireRole('admin')` → 403 `FORBIDDEN` for other roles. `requirePremium` → 403 `PREMIUM_REQUIRED` unless `isPremium` and `premiumUntil` is in the future (replaced by the premium service in task 11.2).",
 "Authorization middleware.",
 ["Both return 403 for a normal user in tests"]);

T("3.16","Test sessions and middleware","P0",
 "Cover the security edge cases.",
 ["3.14", "3.15"], ["server/tests/auth/session.test.js"],
 "Cases: `me` with and without cookie, expired token, token signed with another secret, logout, suspended user mid-session, `requireRole` on a route mounted only in the test.",
 "Session test suite.",
 ["All session tests pass"],
 "feat(auth): add login, logout, session and role middleware");

CP("Authentication API complete", ["Register a user through the API", "Log in and receive the httpOnly cookie", "Call `/api/auth/me` with the cookie", "Unauthorized requests are rejected with 401", "Log out"]);

T("3.17","Create the profile service, controller and routes","P1",
 "Let users manage their profile.",
 ["3.16"], ["server/src/services/user.service.js", "server/src/controllers/user.controller.js", "server/src/routes/user.routes.js", "server/src/validators/user.validators.js"],
 "`GET /api/users/me`, `PATCH /api/users/me` (name, bio only; other fields ignored), `PATCH /api/users/me/password` (currentPassword, newPassword; wrong current → 400 `WRONG_PASSWORD`). All behind requireAuth.",
 "Profile endpoints.",
 ["Sending `role: 'admin'` in PATCH does not change the role"]);

T("3.18","Test the profile API","P1",
 "Prove profile updates are safe.",
 ["3.17"], ["server/tests/users/profile.test.js"],
 "Cases: update name and bio; ignored role and email fields; password change success; wrong current password; new password too short.",
 "Profile tests passing.",
 ["All profile tests pass"],
 "feat(users): add profile and password change endpoints");

T("3.19","Create the auth and user API modules","P0",
 "Frontend functions for every auth endpoint.",
 ["3.18", "1.15"], ["client/src/api/auth.js", "client/src/api/users.js"],
 "`register`, `login`, `logout`, `me`, `getProfile`, `updateProfile`, `changePassword`, all using `request()` from task 1.15.",
 "Typed-feeling API calls for the UI.",
 ["Each function matches docs/api.md"]);

T("3.20","Create the AuthContext","P0",
 "Hold the current user for the whole app.",
 ["3.19"], ["client/src/context/AuthContext.jsx"],
 "State: `user` and `status` (`loading`, `authenticated`, `anonymous`, `guest`). On mount call `me()`. Expose `login`, `register`, `logout`, `continueAsGuest` and a `useAuth()` hook.",
 "App-wide auth state.",
 ["Refreshing while logged in ends in `authenticated`"]);

T("3.21","Create the shared form components","P0",
 "Reusable building blocks for every form.",
 ["3.20"], ["client/src/components/ui/Button.jsx", "client/src/components/ui/Input.jsx", "client/src/components/ui/FormError.jsx", "client/src/components/ui/Spinner.jsx"],
 "Button (variants, loading state, disabled), Input (label, error text, accessible id), FormError (shows an API error message), Spinner.",
 "UI components.",
 ["Each component renders in a quick test page or test"]);

T("3.22","Create the app layout","P0",
 "A header and navigation that respond to login state.",
 ["3.21"], ["client/src/components/layout/AppLayout.jsx", "client/src/routes/AppRouter.jsx"],
 "Header with the Toonverse name, Discover link, and either Login/Register or Dashboard/Profile/Logout depending on `useAuth()`. Wrap all routes.",
 "A consistent page frame.",
 ["The header changes after login and logout"]);

T("3.23","Build the Register page","P0",
 "Let people create an account.",
 ["3.22"], ["client/src/features/auth/RegisterPage.jsx"],
 "Order: page structure → form state → client validation mirroring 3.6 → call `register` → loading state → show server errors (409 shown as ‘This email is already registered’) → on success go to `/dashboard`.",
 "A working sign-up screen.",
 ["Invalid input is caught before sending", "A duplicate email shows the 409 message"]);

T("3.24","Build the Login page","P0",
 "Let people sign in.",
 ["3.23"], ["client/src/features/auth/LoginPage.jsx"],
 "Same order as 3.23. Shows the generic ‘Invalid email or password’ on 401 and a suspended message on 403. Returns to the page the user came from.",
 "A working sign-in screen.",
 ["Login redirects back to the protected page that sent the user here"]);

T("3.25","Create the route guards","P0",
 "Keep private pages private.",
 ["3.24"], ["client/src/routes/ProtectedRoute.jsx", "client/src/routes/AdminRoute.jsx", "client/src/routes/AppRouter.jsx"],
 "ProtectedRoute redirects anonymous users and guests to `/login?next=…`. AdminRoute shows a 403 page to non-admins. Add routes `/login`, `/register`, `/dashboard`, `/profile`, `/admin` (placeholders where needed).",
 "Guarded routes.",
 ["Visiting `/dashboard` logged out redirects to login"]);

T("3.26","Build the Profile page","P1",
 "Let users edit their name, bio and password.",
 ["3.25"], ["client/src/features/profile/ProfilePage.jsx"],
 "Two forms: profile (name, bio) and password change, each with loading, error and success states.",
 "A working profile screen.",
 ["Changes persist after refresh", "Wrong current password shows a clear error"]);

T("3.27","Add Guest Mode","P1",
 "Let visitors try Toonverse without an account (D1).",
 ["3.26"], ["client/src/context/AuthContext.jsx", "client/src/components/layout/GuestBanner.jsx", "client/src/features/auth/LoginPage.jsx"],
 "‘Continue as guest’ on the login page sets status `guest` (client only, no server record). Guests can open Discover, Reader view and later the canvas sandbox (task 6.22). A banner says work is not saved and links to Register.",
 "Guest Mode.",
 ["A guest who opens `/dashboard` is sent to login", "The banner is visible on every guest page"]);

T("3.28","Write the auth component tests","P1",
 "Protect the auth screens from regressions.",
 ["3.27"], ["client/src/features/auth/LoginPage.test.jsx", "client/src/features/auth/RegisterPage.test.jsx"],
 "With the API module mocked: validation messages appear, the submit button shows loading, server errors are displayed.",
 "Frontend auth tests.",
 ["`npm test -w client` passes"]);

T("3.29","Test the complete authentication flow by hand","P0",
 "Check the real flow end to end.",
 ["3.28"], [],
 "Register → logout → login with a wrong password → login → refresh → edit profile → change password → logout → continue as guest. Fix any bug before committing.",
 "A verified authentication flow.",
 ["Every step behaves as designed"],
 "feat(auth): add auth pages, context, route guards, profile and guest mode");

CP("Authentication complete", ["Register a user", "Log in and stay logged in after refresh", "Access protected routes only when logged in", "Edit the profile and change the password", "Log out", "Use Toonverse as a guest", "Merge `feature/03-auth` into develop"]);
