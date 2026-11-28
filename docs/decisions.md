# Toonverse decision log

Confirmed by the team on 2026-10-12. Updated on 2026-10-26 with Khadija Gulzar's review feedback. The project name is **Toonverse**.

Each decision has five fields: Question, Decision, Date, Consequences, and Affected tasks. Task IDs refer to `docs/plan/` (phase.task).

- Anything marked **awaiting confirmation**, **proposed** or **pending** is recorded so it isn't forgotten. The team has **not** approved it yet.
- **Plan details** are implementation choices from the Execution Plan, not separate team decisions.
- Open items are listed under "Pending decisions". Who has reviewed this log is shown under "Review status" at the end.

## D1 – Guest Mode
- **Question:** What can visitors do without an account?
- **Decision:**
  - Users may explore and try Toonverse. They must register and log in to save and publish their work.
  - Guests can use Discover, the Reader view and a temporary canvas sandbox.
  - **Guest drawings are never saved or recovered:**
    - No guest drawings are stored in MongoDB.
    - No local recovery drafts are kept for guests.
    - Only logged-in users can save and recover their work.
- **Date:** 2026-10-12 (guest-drawing rule confirmed 2026-10-26)
- **Consequences:**
  - Guest Mode exists only in the browser; the backend has no guest records.
  - Sandbox drawings are lost when the guest leaves the page. The sandbox shows a notice saying so.
- **Affected tasks:** 3.27, 6.22, 8.16

## D2 – Drawing storage and image download
- **Question:** Where is drawing data kept, and how do users get their artwork onto their own devices?
- **Decision:** Four different places, each with one job:

  | Where | What is kept | Who | When |
  |---|---|---|---|
  | **MongoDB** | Editable drawing data, as Konva JSON: one versioned scene per panel | Logged-in users | On manual save and auto-save (D10) |
  | **Cloudinary** | Rendered images of published panels | Logged-in users who publish | When an episode is published |
  | **Device download** | An image file (PNG) of the user's artwork, saved to their own computer or phone | Logged-in users, through Preview & Export | Only when the user clicks download |
  | **IndexedDB** (in the browser) | Local recovery drafts of unsaved changes | Logged-in users only | Automatically, until the change is saved (D10) |

- **Date:** 2026-10-12 (device download and the four-place split added 2026-10-26)
- **Consequences:**
  - Panels are rendered in the browser and uploaded on publish (issue I1).
  - **A device download and a recovery draft are different things:**
    - A download is a file the user asks for and keeps.
    - A recovery draft is an automatic, temporary safety copy inside the browser that the user doesn't manage.
    - A download never creates or replaces a recovery draft.
  - The device download is the existing browser export (D3). No new architecture is needed.
- **Affected tasks:**
  - 2.6, 6.3, 6.19, 8.1–8.6, 10.1, 10.5
  - **Device download:** 9.5 (render), 9.6 (PNG download), 9.7 (PDF download), 9.9 (export menu)
  - **Recovery drafts:** 8.16

### D2 – Measured canvas performance (Task 6.2)
This records measurements only. It does not change the D2 decision above. The scope was approved by all three members in Issue #36; measurement details were refined and approved during the task (Khadija Gulzar).

- **Question:** Does the canvas stay fast with a full panel of 2,000 strokes, and how much do `listening(false)` and layer caching help?
- **Measured on:** 2026-11-28, by Shumail Mirzaa, by hand in a visible browser window, on the `/dev/canvas-spike` page (production build served by `vite preview`).
- **Test setup:**
  - 2,000 generated strokes from a fixed seed (6202), 20–50 points each, colour `#111111`, 4 px, round caps and joins, on their own **stress layer**. Hand-drawn strokes are on a separate **drawing layer**.
  - Four setups: **A** no optimisation, **B** `listening(false)` on the stress layer, **C** layer cache on the stress layer, **D** both. Measured in the order A, C, B, D, with the cache turned on last.
  - **Redraw:** one warm-up batch (not counted), then 5 batches of 100 consecutive `stressLayer.draw()` calls. "Per draw" is the batch time divided by 100 (a batched average).
  - **Drawing lag:** time from each pointer move to the canvas paint that first shows its point. One warm-up stroke (not counted), then 5 hand-drawn strokes. The method was to clear the drawing before every stroke. A stroke needs at least 60 valid samples or it is rejected and drawn again. A stroke closes at the first paint that shows all of its points, with a 10-frame safety net.
- **Environment:** AMD Ryzen 5 4500U with Radeon Graphics (6 cores), 15.4 GB RAM, Windows 11 Pro (build 26200), Microsoft Edge 158.0.4370.45 (64-bit), window 1272 × 588 at device pixel ratio 1.5, timer step 0.1 ms, plugged in (Balanced power plan). Chrome and WhatsApp were closed; VS Code, Claude, Windows Defender and Windows Explorer were running. Konva 10.11.0, react-konva 19.3.2.
- **Results:**

  | Setup | Redraw per draw: average (min–max of 5 batches) | Drawing lag: average of 5 strokes (min–max) | One-time cost when the cache is turned on |
  |---|---|---|---|
  | **A** – none | 11.454 ms (11.281–11.689) | 5.2 ms (5.0–5.3) | – |
  | **B** – `listening(false)` | 5.982 ms (5.551–6.290) | 5.2 ms (5.0–5.6) | – |
  | **C** – layer cache | 0.007 ms (0.007–0.008) | 5.2 ms (5.1–5.3) | `cache()` 17.1 ms, then first draw 144.2 ms (builds the hit cache) |
  | **D** – both | 0.004 ms (0.003–0.007) | 5.2 ms (4.9–5.4) | `cache()` 11.3 ms, then first draw 1.0 ms (no hit cache) |

  - Redraw batches, per draw: A 11.484, 11.419, 11.281, 11.689, 11.399 ms · B 6.290, 5.551, 6.204, 5.650, 6.217 ms · C 0.008, 0.007, 0.007, 0.008, 0.007 ms · D 0.007, 0.003, 0.003, 0.004, 0.003 ms.
  - Lag strokes (average / highest): A 5.0/14.8, 5.3/10.6, 5.2/13.8, 5.3/15.9, 5.1/16.2 ms · B 5.1/9.8, 5.1/14.0, 5.6/15.0, 5.5/15.8, 5.0/10.6 ms · C 5.2/14.0, 5.3/17.6, 5.1/13.6, 5.3/13.6, 5.1/15.0 ms · D 4.9/14.0, 5.1/13.1, 5.3/14.3, 5.4/14.8, 5.1/11.4 ms.
  - Every counted stroke had 60–185 valid samples, 0 never-painted samples, and was closed by "all points painted". Rejected strokes (fewer than 60 samples): A 3, B 1, C 3, D 1.
- **What this shows:**
  - `listening(false)` roughly halves the redraw time (11.5 ms → 6.0 ms). This is consistent with Konva skipping the hidden hit canvas.
  - Layer caching reduced the measured main-thread redraw time to under 0.01 ms per draw. Graphics-card completion and display were not measured. Building the cache cost about 161 ms with listening on and about 12 ms with it off. When a cached layer changes, the cache has to be rebuilt; this is expected Konva behaviour and was not measured in this experiment.
  - Drawing lag stays at about 5 ms in every setup, because only the drawing layer is repainted while drawing. This supports caching inactive layers with `listening(false)` (Task 6.20).
- **Limits of these numbers:**
  - The lag results cover only the case where the 2,000 strokes are on an **inactive** layer. Drawing on a layer that itself holds many strokes was not tested.
  - Redraw time is the main-thread time to issue the canvas drawing commands. It does not include graphics-card work or showing the frame on screen. Drawing lag is input to canvas paint, not to the screen.
  - The cached batches took only 0.3–0.8 ms, a few steps of the 0.1 ms timer. They show that caching works, but the exact difference between C and D is not reliable.
  - Lag includes a small cost from a diagnostic call (`getCoalescedEvents()`). Hand-drawn strokes varied in length and pace.
  - The numbers are for this laptop and browser only.
- **Run notes:**
  - Setup A's redraw was measured twice. The first run is used above; the second gave 11.337 ms (10.998–11.642), which agrees.
  - Setup A's first lag test did not follow the clearing step: the drawing was not cleared before every stroke. It gave 5.3 ms (4.9–5.5), with 9 rejected strokes. Setup A's lag was then measured again, and that repeat is the result used above.
  - Whether the drawing was cleared before every stroke in setups B, C and D and in the Setup A repeat was not separately confirmed.
- **Affected tasks:** 6.3 (the same 2,000-stroke panel), 6.20 (performance tuning re-runs this test)

## D3 – Export
- **Question:** Where do PNG and PDF exports happen?
- **Decision:** In the browser (PNG through Konva, PDF through jsPDF). There is no server-side rendering.
- **Date:** 2026-10-12 (re-approved 2026-10-26)
- **Consequences:** The export resolution limit can't be enforced on the server (see D6).
- **Affected tasks:** 9.5–9.10

## D4 – Authentication
- **Question:** How are sessions kept?
- **Decision:** A JWT stored in an httpOnly cookie, following secure cookie practices.
- **Date:** 2026-10-12 (re-approved 2026-10-26)
- **Consequences:**
  - **Plan details** (task 3.3): the cookie is named `tv_token`, is SameSite=Lax, and is Secure in production.
  - In production the frontend and API must share a site (issue I3).
  - CSRF protection relies on SameSite and non-GET routes.
- **Affected tasks:** 1.17, 3.2, 3.3, 3.13, 13.10, 15.1

## D5 – Users and roles
- **Question:** How are regular users, premium users and admins modelled?
- **Decision:**
  - One User collection with `role` (`user` | `admin`), `isPremium` and `premiumUntil`.
  - The first administrator is created by a secure script, never through public registration.
  - **Regular users** can:
    - Register and log in.
    - Create and manage their own drawings and episodes.
    - Save, edit and publish their own work according to the application rules.
    - Use the free plan or buy premium.
    - Manage their own profile and content.
  - **Admins** can:
    - Search for and view users.
    - Suspend and reactivate users.
    - Unpublish episodes when authorized.
    - Use only the administrative functions the authorization rules permit.
  - **Premium is a subscription status, not a role.** A regular user can have premium without becoming an admin.
  - Admin permissions are protected by backend authorization checks.
- **Date:** 2026-10-12 (reviewed 2026-10-26, unchanged)
- **Consequences:** There is no admin sign-up route. Admin routes are checked on the server (`requireRole('admin')`), never only hidden in the user interface.
- **Affected tasks:** 2.2, 3.15, 12.1, 12.2

## D6 – Free and premium limits
- **Question:** What are the plan limits and where are they enforced?
- **Decision:**

  | Feature | Free plan | Premium plan |
  |---|---|---|
  | Layers per panel | 10 | 20 |
  | AI requests per day | 15 | 50 |
  | Export resolution | 1× | 2× |
  | Panel layouts / templates | Basic selected layouts | Additional unique premium layouts |

  - The limits are configurable. Layer and AI limits are enforced on the backend.
  - Some panel layouts/templates are available to free users. Other, unique layouts are for premium users only.
  - **Pending:** how many layouts/templates there are, and which ones, is not decided yet.
- **Date:** 2026-10-12 (layer and AI limits changed, layouts added 2026-10-26)
- **Consequences:**
  - **Known limitation:** export resolution is applied in the browser only, because export runs there (D3). It must never be described as server-enforced security.
  - **New scope:** no task in the current plan builds panel layouts/templates. New plan tasks are needed: a layout picker in Phase 7, and premium gating in Phase 11. Adding them needs the team's approval. Pending.
  - **Plan follow-up (needs approval):** these plan tasks still use the old numbers (5 layers, 10 AI requests) and must be updated to 10 and 15:
    - 0.4, 5.6 (`AI_DAILY_LIMIT_FREE`), 5.10, 6.14, 8.2, 11.1, 11.5.
- **Affected tasks:** 0.4, 5.6, 5.10, 6.14, 8.2, 9.6, 11.1, 11.4, 11.5, 11.6, 16.6, plus new layout tasks (pending)

## D7 – Premium plans and pricing
- **Question:** What does premium cost and how long does it last?
- **Decision:** There are **only two plans, weekly and monthly. There is no yearly plan.**

  | Plan | Price | Duration |
  |---|---:|---|
  | Weekly | PKR 250 | 7 days |
  | Monthly | PKR 900 | 30 days |
  | Yearly | Not offered | — |

  - **Both prices are confirmed** by the team (Khadija, Nabila and Shumail; reported to Claude on 2026-10-29). They are still set through configuration and never hard-coded into payment code.
  - A successful, server-verified JazzCash sandbox payment grants premium for the duration of the chosen plan: 7 days for weekly, 30 days for monthly.
- **Date:** 2026-10-12 (two plans and proposed prices added 2026-10-26; prices confirmed, reported 2026-10-29)
- **Consequences:**
  - Prices come from configuration (environment values with no default). The server refuses to start payments while a price is missing.
  - **Plan follow-up (needs approval):** these plan tasks were written for a single 30-day plan and must support both plans:
    - 2.8 Payment model: record which plan was bought, in the field `plan` (`docs/data-model.md`). Whether each payment also stores its duration in days is pending (Decision B there).
    - 11.1 premium config: two plans, two prices, two durations.
    - 11.2 `grantPremium`: grant the paid plan's days.
    - 11.3 plan endpoint: list both plans.
    - 11.7 Premium page: let the user choose a plan.
    - 11.12–11.13 payment request and initiate: the chosen plan's amount.
    - 11.14 return handler: grant the duration of the plan actually paid for.
    - 11.15 tests: both durations.
    - 11.18 result page: shows the new expiry.
    - 11.19 and 11.21: test a weekly and a monthly sandbox payment.
  - **Plan detail** (task 11.2): buying again while premium is active extends from the current end date.
- **Affected tasks:** 0.4, 2.8, 11.1, 11.2, 11.3, 11.7, 11.12, 11.13, 11.14, 11.15, 11.18, 11.19, 11.21

## D8 – Episode lifecycle
- **Question:** Which states can an episode be in?
- **Decision:** `draft`, `published`, `unpublished`. Publishing and unpublishing need appropriate authorization checks.
- **Date:** 2026-10-12
- **Consequences:**
  - **Plan detail** (from D8 and D13): only the episode's owner changes its status, and admins may unpublish.
  - Public routes return only published episodes.
- **Affected tasks:** 2.4, 10.2–10.4, 12.5

## D9 – Panel width
- **Question:** What is the standard panel size?
- **Decision:** 800 px is the standard panel width.
- **Date:** 2026-10-12
- **Consequences:**
  - **Plan detail** (task 7.5): panel height is adjustable from 200 to 2400 px.
  - Every canvas, export and reader view uses this width.
- **Affected tasks:** 2.6, 7.1, 7.5

## D10 – Saving strategy (Option A)
- **Question:** How is work saved and recovered?
- **Decision:** Manual save, auto-save and local recovery.
  - **Manual save:**
    - A visible Save button and Ctrl+S save to MongoDB through the API.
    - The button shows saving, success and failure states, and offers Retry after a failure.
  - **Auto-save:**
    - Saves 3 s after the last change, with a 30 s fallback.
    - Every save carries a version number; the server returns 409 on a stale version.
    - There is one save at a time per panel and no request when nothing has changed.
  - **Local recovery:**
    - A browser recovery draft is kept per user and per panel until the change is saved.
    - It is kept **for logged-in users only**. Guest drawings are never saved or recovered (D1).
    - A failed save keeps the draft.
    - After a successful save, only the changes that were saved are removed, so newer edits stay.
    - On reopening, the user chooses to restore or discard. An old draft never silently overwrites a newer server version; that case is shown as a conflict.
  - **Storage: IndexedDB, not localStorage** (approved 2026-10-26).
    - localStorage holds only about 5 MB per site, stores strings only, and blocks the page while writing. One dense panel can be several MB.
    - IndexedDB is asynchronous with a much larger quota, and needs no extra library.
    - If storage is unavailable or full, drawing and server saving continue, with a visible warning.
- **Date:** 2026-10-12 (IndexedDB approved 2026-10-26)
- **Consequences:**
  - Former backlog task 8.16 is now a required P0 task.
  - New task 8.17 handles restore or discard.
  - Preview and publish use saved server data only.
  - A recovery draft is not a download (see D2).
- **Affected tasks:** 8.6–8.17, 9.4, 10.5

## D11 – AI assistant policy and usage tracking
- **Question:** What may the AI do, and how is daily use counted?
- **Decision:**
  - It helps improve notes, organise ideas, plan panels and develop dialogue.
  - It never generates complete stories or finished artwork as core functionality.
  - It enforces daily quotas (D6), output limits and backend validation.
  - **Daily usage is stored on the User model** in an `aiUsage` field holding a date and a count. Conceptually: `aiUsage: { date, count }`. Approved 2026-10-26.
    - Free users: up to **15** AI requests per day. Premium users: up to **50**.
    - The backend applies the correct limit from the user's subscription status, and refuses any request over the limit.
    - Usage is tracked by date and resets when a new day begins.
- **Date:** 2026-10-12 (usage-tracking approach approved 2026-10-26)
- **Consequences:**
  - The OpenAI API key stays on the server and never appears in frontend code.
  - **Pending:** before implementation, the precise schema and the date and reset rule are confirmed in the data-model task (0.6, reviewed before 2.2). This covers which time zone defines "a new day", and how the reset is stored.
- **Affected tasks:** 0.6, 0.10, 2.2, 5.6–5.18, 11.4

## D12 – Hosting
- **Question:** Which hosting providers?
- **Decision:** Deferred to task 15.1. No provider is chosen yet.
- **Date:** 2026-10-12
- **Consequences:** The domain plan must keep the frontend and API on one site (D4).
- **Affected tasks:** 15.1–15.14

## D13 – Admin scope
- **Question:** What can admins do in v1.0?
- **Decision:**
  - Search and view users, suspend and reactivate users, and unpublish episodes when authorized.
  - Payment lists and statistics are lower priority (P2), done if time allows.
- **Date:** 2026-10-12
- **Consequences:** Tasks 12.6, 12.7 and 12.12 stay P2.
- **Affected tasks:** 12.1–12.13

## D14 – Payment data
- **Question:** What is stored for payments?
- **Decision:**
  - The Payment model stores the user, a unique `txnRefNo`, amount, status and the provider's response.
  - Only server-verified payments grant premium. A frontend success message never does.
- **Date:** 2026-10-12
- **Consequences:**
  - The JazzCash return handler verifies the hash, reference and amount, and is idempotent.
  - With two plans (D7), the payment also records which plan was bought, in the field `plan` (`docs/data-model.md`). Whether it also stores the duration in days is pending (Decision B there).
- **Affected tasks:** 2.8, 11.11–11.16

## D15 – Cloudinary cleanup
- **Question:** When are images deleted?
- **Decision:**
  - Unused images and their references are cleaned up safely.
  - An asset is deleted only after confirming no panel, episode or other record still references it.
  - Shared or still-used assets are never deleted.
- **Date:** 2026-10-12
- **Consequences:**
  - Every delete path uses one `deleteImageIfUnreferenced` helper.
  - A failed database save right after an upload removes the orphaned upload.
- **Affected tasks:** 7.19–7.22, 10.1

## Supporting libraries
- **Confirmed core technologies:** React with Vite, Tailwind CSS, Node.js + Express, MongoDB with Mongoose, Konva / React-Konva, Cloudinary + Multer, OpenAI, JazzCash sandbox, jsPDF, Google Fonts, JWT + bcrypt.
  - Tailwind CSS was already part of the architecture ("Tailwind CSS / CSS" in `docs/architecture.html`). It was added to this list in Task 005.
- **Task 005 team decisions.** Khadija Gulzar, Nabila Azam and Shumail Mirzaa agreed to them (see "Task 005 confirmations").
  - Nothing is installed in Task 005. Each library is installed only in its own task, under that task's approval.
  - Compatibility was checked against the npm registry on 2026-10-27, and is checked again at install time.
  - **Toonverse stays JavaScript.** No TypeScript and no `@types/*` packages.

**Libraries approved for their designated tasks**

| Library | Purpose | First task |
|---|---|---|
| React Router (`react-router`) | Page navigation; warning before leaving unsaved work (task 8.12) | 027 (1.16) |
| cors | Lets the frontend call the API from a different address; allow only `CLIENT_URL`, with credentials | 028 (1.17) |
| cookie-parser | Reads the login cookie (`tv_token`, D4) | 028 (1.17) |
| ESLint, **version 9 line** | Finds code mistakes; enforces the `react/no-danger` security rule | 029 (1.18) |
| Prettier | One automatic code format for the team | 029 (1.18) |
| Vitest | Test runner for both server and client | 030 (1.19) |
| Supertest | Sends test requests to the Express app | 030 (1.19) |
| React Testing Library (`@testing-library/react`) | Tests screens the way a user sees them | 030 (1.19) |
| express-validator | Server-side validation of request data | 054 (3.6) |

**ESLint 9, not ESLint 10:** `eslint-plugin-react` 7.37.5, which provides the required `react/no-danger` rule, supports ESLint only up to 9.7+. ESLint 9 is still maintained (npm tag `maintenance`).

**Required companion packages** (approved together with the library that needs them)

| Package | Needed by | Why |
|---|---|---|
| `@testing-library/dom` | React Testing Library | A required peer dependency of `@testing-library/react` v16 |
| `jsdom` | Vitest | A browser-like environment so screens can be tested; the plan's choice (task 1.19) |
| `@eslint/js` (9 line) | ESLint | ESLint's standard recommended rules |
| `globals` | ESLint | Stops ESLint from wrongly flagging browser and Node names (`window`, `process`) |
| `eslint-plugin-react` | ESLint | Provides the `react/no-danger` rule required by tasks 1.18 and 13.7 |

**Part of setting up approved tools** (no separate decision): `@vitejs/plugin-react` (Vite + React; its optional extras are not installed) and `@tailwindcss/vite` (Tailwind CSS v4 on Vite).

**Optional ESLint packages: both included by team decision.** This is a team decision, not a personal choice by Shumail Mirzaa (owner of task 029).

| Package | Purpose | Team decision |
|---|---|---|
| `eslint-plugin-react-hooks` | Catches incorrect use of React hooks | Include |
| `eslint-config-prettier` | Stops ESLint and Prettier disagreeing about formatting | Include |

Both support the ESLint 9 line and Prettier 3 (npm registry, 2026-10-27). The team decision was reported to Claude on 2026-10-27.

**Task 029 lint and format setup (approved 2026-11-21).** Implementation choices for task 029 (1.18), approved by the user before implementation:
- **Where the packages go:** ESLint and its companion packages in the client workspace; Prettier at the repository root. The root `npm run lint` runs the client's `lint` script (`eslint .`).
- **ESLint rules (`client/eslint.config.js`):** ESLint recommended, React recommended with the automatic JSX runtime, React Hooks recommended, browser globals, React version detection, `react/no-danger: error`, and `eslint-config-prettier` last. `dist/` is not linted.
- **`react/prop-types` is off.** Toonverse is JavaScript and does not use the `prop-types` library, which is not installed.
- **Prettier (`.prettierrc`):** `singleQuote: true` and `printWidth: 100`; every other option keeps Prettier's default.
- **Format scripts:** the root scripts `format` and `format:check` run Prettier on `client/` only, so documentation and planning files are never reformatted.
- **Existing code:** if `format:check` finds existing files that need formatting, the exact changes are shown and approved before any file is rewritten.

**Deferred**: decided again before their task

| Library | Revisit before |
|---|---|
| express-rate-limit | Task 193 (5.12) |
| helmet | Task 238 (13.5) |
| Playwright | Task 245 (14.1) |

**Not used** (built-in features or approved libraries already cover these):
- `dotenv` and `nodemon`: Node's `--env-file` and `--watch` replace them.
- `axios`: the built-in `fetch` is used instead.
- Jest: Vitest is used.
- Joi: express-validator is used.
- An in-memory test database: a separate test database is used.
- `happy-dom`: jsdom is used.
- Vite starter extras: `oxlint` (ESLint is used instead), and `@types/react` / `@types/react-dom` (TypeScript type packages; Toonverse is JavaScript).

**Task 005 confirmations**

| Member | Technical decisions (Part A) | Recorded |
|---|---|---|
| Khadija Gulzar | Agreed | Reported to Claude on 2026-10-27 |
| Nabila Azam | Agreed | Reported to Claude on 2026-10-27 |
| Shumail Mirzaa | Agreed | Reported to Claude on 2026-10-27 |

The date each member agreed was not provided; the date shown is when their agreement was reported. Part B: both optional packages are included by team decision (reported to Claude on 2026-10-27).

## Team and repository workflow (confirmed 2026-10-12)
- **Q1 – Branches:**
  - `main` holds production code.
  - `develop` is the integration branch.
  - Branch types: `feature/<phase>-<short-name>`, `fix/<issue>-<short-name>`, `release/vX.Y.0` and `hotfix/<short-name>`.
- **Q2 – Export limit:** the 2× export restriction is documented as a browser-only known limitation (see D6).
- **Q3 – Documents:** the authoritative plan, roadmap, decision log and workflow live under `docs/`. The plan is also republished for viewing and tracking.
- **Q4 – Default branch:** `develop` is the default branch. Nabila Azam created it and set it as default herself on 2026-10-14; this was verified on 2026-10-16. `main` stays the production branch.
- **Team:** see `docs/git-workflow/team.md`. Every commit is authored with the member's own noreply email.

## FYP 1 / FYP 2 scope split (confirmed 2026-11-19)
FYP 1 focuses on UI and frontend development. Backend implementation, server configuration, database integration and backend-dependent functionality are deferred to FYP 2. Approved unanimously by Khadija, Nabila and Shumail on GitHub Issue #19 (D1) and Issue #21 (D1–D10), with follow-up clarifications approved by the team. The plan (`docs/plan`), the task files and `docs/tasks/ALLOCATION.md` were updated to match. Global task numbering and order are unchanged.

- **Issue #19 D1 – Frontend-first order:**
  - Task 012 (1.1) is shared setup; `server/` stays an empty placeholder until FYP 2.
  - Task 022 (1.11) now depends on Task 012, and the frontend chain starts there.
  - Backend foundation tasks 013–021 (1.2–1.10) and the 101 backend-only tasks after Phase 1 are `deferred (FYP 2)`.
- **Issue #21 D1 – Development proxy (Task 025):** the client-side proxy is configured in FYP 1, without the backend prerequisite.
- **Issue #21 D2 – Routing (Task 027):** frontend routing stays in FYP 1. The live backend health check is removed; backend health-check integration is implemented in FYP 2.
- **Issue #21 D3 – CORS and cookies (Task 028):** deferred to FYP 2. Task 029 now depends on Task 027.
- **Issue #21 D4 – Linting (Task 029):** ESLint and Prettier for the root workspace and the client in FYP 1; server configuration in FYP 2.
- **Issue #21 D5 – Test runners (Task 030):** `deferred (later in FYP 1)`. The client half is done immediately before Task 076 (3.28), which now depends on it. The server half is deferred to FYP 2.
- **Issue #21 D6 – Third-party accounts (Task 031):** deferred to FYP 2.
- **Issue #21 D7 – Phase 1 checkpoint:** root `npm install` succeeds, the client starts with one command, client lint passes, and `feature/01-setup` is merged into `develop`. Automated tests are not required at this checkpoint.
- **Issue #21 D8 – Frontend data:** frontend tasks that depend on backend APIs use simple local mock data/modules in `client/src/mocks/`, without an extra library. The 15 frontend-only tasks that waited on backend-only tasks now depend on the frontend task each one builds on (Tasks 067, 086, 098, 123, 142, 149, 164, 176, 180, 185, 195, 205, 216, 229 and 240). Tasks 098, 149, 180, 185, 205 and 216 have mock-based checks for FYP 1; their original backend checks are kept as FYP 2 checks.
- **Issue #21 D9 – API client (Task 026):** checked by hand in FYP 1 with a mocked `fetch` response; an automated test follows Task 030.
- **Issue #21 D10 – README (Task 033):** covers the frontend setup, Node.js v24.22.3, installation and running instructions; it now depends on Task 029. Backend and database instructions are added in FYP 2.
- **Task selection:** skip tasks marked `deferred (FYP 2)` or `deferred (later in FYP 1)`. A `deferred (later in FYP 1)` task is done only when the next task needs it. If the next task depends on a `deferred (FYP 2)` task, stop and ask the team. The rule is in `docs/tasks/README.md` and the task-runner skill.
- **Mixed and other tasks (F2):** the 57 mixed, manual-test, audit, E2E, deployment and release tasks are not deferred as a block. Each is checked when it is reached: frontend work that can use mocks stays in FYP 1, backend-dependent work goes to FYP 2, and mixed tasks are split where feasible. New scope decisions are made by the team.

## Pending decisions

| Item | Needed before | Status |
|---|---|---|
| D14 / D7 – payment plan history: store the plan name only (b1), or the plan name and its duration in days (b2). See Decision B in `docs/data-model.md` | Task 2.8 | Pending team decision |
| D6 – number and selection of panel layouts/templates (free and premium) | Before the new layout tasks are added to the plan | Pending |
| D6 – new plan tasks for panel layouts/templates | Before Phase 7 (task 7.5) | Pending team approval |
| D11 / I2 – exact `aiUsage` schema and the date/reset rule | Task 2.2 | Approach **approved**. Options documented in Task 0.6 (Decision A in `docs/data-model.md`: Pakistan time or UTC); team choice pending |
| Plan follow-up – update tasks to D6's new numbers (10 layers, 15 AI) and D7's two plans | Before those tasks start | Pending approval of the plan edits |
| Deferred libraries: express-rate-limit, helmet, Playwright | Tasks 193, 238 and 245 | Deferred |
| Node.js version: plan task 1.2 says 20.6+, but current packages need Node 22.22.2+ or 24.15+ (React Router, jsdom, Vitest) | Setup before Task 012 (with plan task 1.2) | **Decided 2026-11-18: Node.js 24 LTS, exact version v24.22.3.** Unanimously approved by Khadija, Nabila and Shumail on Issue #19 (D2). The pre-implementation compatibility check found that v24.22.3 satisfies the approved package requirements (the strictest is jsdom, `^24.15.0`). Node.js v24.22.3 and npm 11.19.1 were verified on the development laptop. |

Resolved on 2026-10-26: D1 guest drawings (never saved or recovered) and D10 IndexedDB for recovery drafts. Resolved on 2026-10-27: Task 005 library decisions (agreed by all three members), including both optional ESLint packages. Resolved (reported 2026-10-29): D7 prices, weekly PKR 250 and monthly PKR 900, agreed by all three members.

## Review status

| Member | Reviewed the Task 002 version? | Notes |
|---|---|---|
| Khadija Gulzar | **Yes**, approved | Feedback given 2026-10-26 and applied; confirmed the updated text matches it |
| Nabila Azam | **Yes**, approved as is | No changes requested |
| Shumail Mirzaa | **Yes**, approved as is | No changes requested |

**Team review: complete for the Task 002 version.** All three members reviewed and approved the Task 002 version, merged on 2026-10-27. The Task 005 changes are documented separately under "Task 005 confirmations" and have not yet been reviewed as updated file text. Items listed under "Pending decisions" remain pending; approving the log does not finalise them (for example, the D7 prices are still proposed).
