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
  | **Device download** | An image file (PNG) of the user's artwork, saved to their own computer or phone | Any user who chooses to download | Only when the user clicks download |
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

  | Plan | Proposed price | Duration |
  |---|---:|---|
  | Weekly | PKR 250 | 7 days |
  | Monthly | PKR 900 | 30 days |

  - **Both prices are proposed, pending final confirmation.** Nobody may treat them as final, or hard-code either amount into payment code.
  - A successful, server-verified JazzCash sandbox payment grants premium for the duration of the chosen plan: 7 days for weekly, 30 days for monthly.
- **Date:** 2026-10-12 (two plans and proposed prices added 2026-10-26; prices not final)
- **Consequences:**
  - Prices come from configuration (environment values with no default). The server refuses to start payments while a price is missing.
  - **Plan follow-up (needs approval):** these plan tasks were written for a single 30-day plan and must support both plans:
    - 2.8 Payment model: record which plan was bought. The exact field is confirmed in the data-model review.
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
  - With two plans (D7), the payment also records which plan was bought. The field is confirmed in the data-model review.
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
- **Confirmed:** React with Vite, Node.js + Express, MongoDB with Mongoose, Konva / React-Konva, Cloudinary + Multer, OpenAI, JazzCash sandbox, jsPDF, Google Fonts, JWT + bcrypt.
- **Pending team approval (task 0.5):** React Router, cors, helmet, express-rate-limit, express-validator, cookie-parser, Vitest, Supertest, React Testing Library, Playwright, ESLint, Prettier.
  - Being on this list is **not** approval.
  - Each library is reviewed and justified in task 0.5 before installation.

## Team and repository workflow (confirmed 2026-10-12)
- **Q1 – Branches:**
  - `main` holds production code.
  - `develop` is the integration branch.
  - Branch types: `feature/<phase>-<short-name>`, `fix/<issue>-<short-name>`, `release/vX.Y.0` and `hotfix/<short-name>`.
- **Q2 – Export limit:** the 2× export restriction is documented as a browser-only known limitation (see D6).
- **Q3 – Documents:** the authoritative plan, roadmap, decision log and workflow live under `docs/`. The plan is also republished for viewing and tracking.
- **Q4 – Default branch:** `develop` is the default branch. Nabila Azam created it and set it as default herself on 2026-10-14; this was verified on 2026-10-16. `main` stays the production branch.
- **Team:** see `docs/git-workflow/team.md`. Every commit is authored with the member's own noreply email.

## Pending decisions

| Item | Needed before | Status |
|---|---|---|
| D7 – weekly PKR 250 and monthly PKR 900 | Task 11.1 | **Proposed**, pending final confirmation |
| D6 – number and selection of panel layouts/templates (free and premium) | Before the new layout tasks are added to the plan | Pending |
| D6 – new plan tasks for panel layouts/templates | Before Phase 7 (task 7.5) | Pending team approval |
| D11 / I2 – exact `aiUsage` schema and the date/reset rule | Task 0.6, reviewed before 2.2 | Approach **approved**; details pending |
| Plan follow-up – update tasks to D6's new numbers (10 layers, 15 AI) and D7's two plans | Before those tasks start | Pending approval of the plan edits |
| Supporting libraries (list above) | Task 0.5, each reviewed and justified before installation | Not approved |

Resolved on 2026-10-26: D1 guest drawings (never saved or recovered) and D10 IndexedDB for recovery drafts.

## Review status

| Member | Reviewed the current version? | Notes |
|---|---|---|
| Khadija Gulzar | **Yes**, approved | Feedback given 2026-10-26 and applied; confirmed the updated text matches it |
| Nabila Azam | **Yes**, approved as is | No changes requested |
| Shumail Mirzaa | **Yes**, approved as is | No changes requested |

**Team review: complete.** All three members reviewed and approved this version. Items listed under "Pending decisions" remain pending; approving the log does not finalise them (for example, the D7 prices are still proposed).
