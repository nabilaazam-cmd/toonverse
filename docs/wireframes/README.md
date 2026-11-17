# Toonverse frontend wireframes (Task 011)

Low-fidelity wireframes for the 11 Toonverse frontend modules. They show what each screen contains, its main actions and its important states, so each screen can be built against an agreed layout.

> **These are low-fidelity frontend wireframes, not final UI designs.** They show structure, labels, actions and states. Colours, spacing, typography and illustrations are decided when each screen is built.

- **Task:** 011 (plan 0.11), *Draw wireframes for the 11 frontend modules*. Owner: Shumail Mirzaa.
- **Decisions followed:** GitHub Issue #17 (D1–D7), approved by Nabila Azam and Khadija Gulzar on 2026-11-17.
- **Semester scope (Issue #17 D1):** FYP 1 completes the frontend; backend implementation belongs to FYP 2. These boards cover frontend screens only. API routes and data fields are shown only where the frontend needs them, using the approved contract (`docs/api.md`) and data model (`docs/data-model.md`).

## Files

Each module has one **PNG board** (for viewing) and one **SVG source** (editable). A board can hold several related screens and states (Issue #17 D6).

| # | Module | PNG board | SVG source |
|---|---|---|---|
| 01 | Authentication | `01-authentication.png` | `01-authentication.svg` |
| 02 | Profile | `02-profile.png` | `02-profile.svg` |
| 03 | Dashboard | `03-dashboard.png` | `03-dashboard.svg` |
| 04 | Series & Episodes | `04-series-episodes.png` | `04-series-episodes.svg` |
| 05 | Episode Notes | `05-episode-notes.png` | `05-episode-notes.svg` |
| 06 | Drawing Canvas | `06-drawing-canvas.png` | `06-drawing-canvas.svg` |
| 07 | Panels & Dialogue | `07-panels-dialogue.png` | `07-panels-dialogue.svg` |
| 08 | Preview & Export | `08-preview-export.png` | `08-preview-export.svg` |
| 09 | Discover & Reader | `09-discover-reader.png` | `09-discover-reader.svg` |
| 10 | Premium | `10-premium.png` | `10-premium.svg` |
| 11 | Admin | `11-admin.png` | `11-admin.svg` |

The module names and order follow `docs/architecture.html`.

**Every board has the same layout:**
- the screens and states on the left;
- a yellow **Phone width (D5)** note and a blue **Decisions and sources** note on the right;
- a colour legend at the bottom right.

| Colour | Meaning |
|---|---|
| Dark button | Primary action |
| White button | Other action |
| Red | Error |
| Green | Success |
| Amber | Warning or limit |
| Blue | Information |
| Dashed grey | Placeholder content |

## Screens and states on each board

### 01 Authentication
- **Screens:** Register (`/register`), Login (`/login?next=…`), and what a guest sees (`/` as a guest).
- **Guest entry point:** "Continue as guest" on the Login page (Issue #17 D3), plus the guest banner with a Register link.
- **States:**
  - form validation errors (name 2–60 characters, valid email, password at least 8 characters);
  - "This email is already registered" (409);
  - incorrect login, "Invalid email or password" (401);
  - too many attempts (429);
  - suspended account (403).

### 02 Profile
- **Screens:** profile information (name, read-only email, bio 0–300), and password update.
- **P2 section:** payment history, clearly marked **P2** (Task 11.20).
- **States:**
  - saved ("Profile saved.", "Password updated.");
  - incorrect current password (400 `WRONG_PASSWORD`);
  - validation errors, loading, and a save error.

### 03 Dashboard
- **Screens:**
  - My Series with series cards (title, episode count, last updated, a Continue link);
  - the empty state ("Create your first series");
  - the Create Series modal (title 1–100, description 0–1000).
- **States:** loading, error with "Try again", and a modal validation error with a loading button.

### 04 Series & Episodes
- **Screens:**
  - the series page (`/series/:seriesId`): edit title and description, delete series;
  - the episode list: number, title, status, last saved, and actions.
- **Statuses:** draft, published and unpublished, with what each means (D8).
- **Publish and unpublish actions (Issue #17 D2):**
  - "Publish…" opens the Publish step in Module 08;
  - "Unpublish" asks for confirmation first.
- **Confirmations:** delete episode, delete series (with the episode count), and unpublish.

### 05 Episode Notes
- **Screens:** the Notes step of the episode workspace (stepper Notes → Draw → Panels → Preview → Publish).
  - The notes editor: premise, characters, scene list; 0–20,000 characters.
  - Three AI buttons: Help with notes, Organize ideas, Plan panels.
  - The AI suggestion panel, labelled **"AI suggestion: edit before using"**, with Copy, Insert and Dismiss.
  - The privacy notice and the remaining quota ("12 of 15").
- **AI states:** loading; timeout (504); busy (503); too many requests (429); quota used up (429, reset at midnight Pakistan time, with a Premium link); and a refused request (200 with guidance).
- **Save states:** saved, saving, unsaved changes, and couldn't save.
- **Refusals:** a list of what the assistant does not do (`docs/ai-policy.md`). The interface never offers to write a complete story or episode.

### 06 Drawing Canvas
- **Screens:**
  - the Draw step: brush, eraser and hand tools; size, opacity and colour (12 presets, last 8 used); a panel canvas 800 px wide; undo and redo; zoom 25%–400% and Fit; the layers panel;
  - the **guest sandbox** at `/sandbox` (Issue #17 D3): no Save, no save status, no draft restore, and a notice that the drawing is lost on leaving.
- **Limits:** 10 layers free, 20 premium; "Add layer" is disabled at the limit, with a Premium link.
- **Save states:** saving, saved, unsaved changes, couldn't save, and "Retry save".
- **Other states:**
  - offline, with "Recovery copy kept on this device";
  - the conflict dialog: "Load the latest version" or "Keep my version";
  - restore or discard a recovery draft, for logged-in users only.

### 07 Panels & Dialogue
- **Screens:** the Panels step.
  - **Panel strip:** add a panel, move it up or down, delete it.
  - **Editing area:** a speech bubble, and a height handle (200–2400 px).
  - **Bubble options:** oval, box and thought.
  - **Text:** dialogue editing and font controls.
  - **Reference images:** an upload area, with opacity and remove.
  - **Dialogue helper:** AI suggestions, up to 3 versions for one panel or moment, copied into a bubble by hand.
- **States:**
  - upload progress and upload errors (wrong file type, over 5 MB, upload failed);
  - delete-panel confirmation;
  - the AI dialogue states (the same as Module 05).
- **No layout or template picker** (Issue #17 D4).

### 08 Preview & Export
- **Screens:** the Preview step and the **Publish step** (Issue #17 D2).
  - **Preview:** a vertical panel strip at reader width; back to editing; jump to a panel.
  - **Export:** PNG and PDF, with free 1× and premium 2× HD.
  - **Publish:** a checklist (title, at least one panel, everything saved, no pending recovery draft), then rendering and upload progress.
- **States:**
  - the publish confirmation;
  - the published status, with a link to the Reader;
  - publish errors: missing title, no panels, out-of-date pictures;
  - export progress, export failure, and the 2× Premium prompt.

### 09 Discover & Reader
- **Screens:**
  - Discover (`/`): text cards and Load more;
  - the series reader (`/read/series/:seriesId`), with Favorite;
  - the episode reader (`/read/episodes/:episodeId`), with previous and next;
  - Favorites (`/favorites`).
- **States:** loading, empty, error, loading more, episode not available (404), and a sign-in prompt for guests who press Favorite.

### 10 Premium
- **Screens:**
  - the Premium page (`/premium`):
    - a free versus premium comparison (layers 10 / 20, AI 15 / 50 a day, export 1× / 2× HD);
    - **Weekly PKR 250 / 7 days** and **Monthly PKR 900 / 30 days**, with **no yearly plan**;
    - the **"Sandbox test payment"** label;
  - the checkout redirect to the JazzCash sandbox.
- **Payment result** (`/premium/result`): success (with the new premium expiry), failed, cancelled and pending.

### 11 Admin
- **Screens:**
  - Overview (four counts, **P2**);
  - Users: search, a table, suspend and reactivate;
  - Episodes: published only, with Open in Reader and Unpublish;
  - Payments (**P2**), with a status filter.
- **States:** suspend confirmation, unpublish confirmation, and **Access denied (403)** for non-admins.

## Tool and export method

- **Source:** each board is a hand-written SVG file. Edit it in any SVG editor (for example Inkscape, or draw.io and Figma by import) or as text. It uses only rectangles, lines and text in Arial or Helvetica, with no external images or fonts.
- **PNG:** each PNG was rendered from its SVG at **1800 × 1150 px** with the Microsoft Edge browser already installed on the team laptop, run headless (`--screenshot`). No package or application was installed for this task.
- **After editing an SVG,** render the PNG again the same way, so the PNG and SVG stay in step.

## Phone-width behaviour (Issue #17 D5)

The boards are desktop-first. Each board has a **Phone width (D5)** note with that module's rules. In general:
- **Layout:** multi-column layouts and card grids become one column, and forms become full width.
- **Tables:** they become stacked cards or lists, with row actions in a menu or at the bottom of each card.
- **Side panels** (AI assistant, layers, reference images, dialogue helper) move below the main area or open as bottom sheets.
- **Main actions** (export, publish, previous and next) move into a sticky bottom bar where needed.
- **The workspace stepper** becomes "Step 1 of 5" with a step menu.
- **The Reader** shows images at full screen width, up to 800 px.

No screen needed a separate mobile wireframe.

## Assumptions and open items

These are noted so nothing is mistaken for a new decision.

- **Example content:** names, titles, numbers and dates are made up for illustration.
- **Message wording:** messages that the plan or API contract defines are used as written, for example:
  - "Invalid email or password";
  - "This email is already registered";
  - "This panel was saved somewhere else. Load the latest version or keep yours.";
  - "AI suggestion: edit before using".

  Other short messages, such as "This account is suspended.", are placeholders. Their final wording is set in the screen's build task.
- **Panel layouts and templates:** not shown, because they're still pending (decision log D6; Issue #17 D4).
- **Layer and AI numbers:** some plan tasks still say 5 layers and 10 free AI requests. The boards follow the decision log: 10 / 20 layers (D6) and 15 / 50 AI requests (D11). Updating the plan is a separate follow-up.
- **Admin tabs:** the plan names the `/admin` route and its four tabs, but not a separate address for each tab. The boards label them "/admin (Users tab)" and so on.
- **Dashboard:** the target of "Continue" and the order of the series list are open items in `docs/api.md` Part 1.
- **AI moderation:** the provider and refusal guidance for languages other than English and Urdu are still pending (`docs/ai-policy.md`). The AI boards show English text only.
- **Commit message:** `docs: add Task 011 frontend wireframes` (Issue #17 D7).
