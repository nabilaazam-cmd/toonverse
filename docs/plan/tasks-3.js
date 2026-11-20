// Toonverse execution plan — part 3: Phases 8, 9, 10, 5 (AI), 11

PH(8, "Save & Auto-save", "");

T("8.1","Create the scene save service","P0",
 "Save a panel scene without overwriting newer work.",
 ["7.25"], ["server/src/services/panel.service.js"],
 "Branch `feature/08-save`. `saveScene(panelId, user, { scene, version })`: `findOneAndUpdate({ _id, version }, { scene, $inc: { version: 1 } })`. No match but the panel exists → 409 `VERSION_CONFLICT` with `currentVersion`. Update the episode’s `lastSavedAt`.",
 "Versioned saving (D10).",
 ["A stale version never overwrites"]);

T("8.2","Create the scene validation rules","P0",
 "Reject broken or oversized scenes.",
 ["8.1"], ["server/src/validators/scene.validators.js"],
 "Scene is an object with a `layers` array; layer count at most the user’s limit (5 now, real limits in task 11.4); shape types only `stroke`, `bubble`, `text`, `image`; text max 500 characters. Route-level body limit 2 MB.",
 "Scene validation.",
 ["Six layers on a free account return 400"]);

T("8.3","Create the scene save route","P0",
 "Expose saving.",
 ["8.2"], ["server/src/routes/panel.routes.js", "server/src/controllers/panel.controller.js"],
 "`PUT /api/panels/:panelId/scene` with body `{ scene, version }` → 200 `{ version, savedAt }`.",
 "Save API.",
 ["Saving returns the new version"]);

T("8.4","Test the save API","P0",
 "Prove saving is safe.",
 ["8.3"], ["server/tests/panels/save.test.js"],
 "Cases: save and reload identical scene, version increments, stale version 409, body over 2 MB 413, invalid scene 400, foreign panel 404.",
 "Save tests passing.",
 ["All save tests pass"],
 "feat(save): add versioned scene save API");

T("8.5","Load saved scenes into the workspace","P0",
 "Open an episode exactly as it was saved.",
 ["7.24"], ["client/src/features/panels/usePanelsState.js"],
 "On load, build each panel’s state from `fromJSON(panel.scene)` and keep its `version`.",
 "Saved work loads back.",
 ["A scene from the mock panel data in `client/src/mocks/` appears in the editor, and each panel keeps its `version`", "FYP 2 check: a scene saved through the API appears in the editor"]);

T("8.6","Create the save manager","P0",
 "One place that decides when and what to save.",
 ["8.5"], ["client/src/features/save/useSaveManager.js"],
 "Tracks dirty panels. Every edit increments a per-panel change counter. `save(panelId)` sends `toJSON(scene)` and the version, remembers which change counter that snapshot had, then stores the new version. One request at a time per panel; changes made during a save are saved next. Exposes status: `saved`, `saving`, `unsaved`, `error`. Provides the hooks the recovery draft store (task 8.16) uses: ‘changed’ (with scene, base version and counter) and ‘saved’ (with the counter that was saved).",
 "Save logic ready for manual save, auto-save and local recovery (D10 Option A).",
 ["Two quick saves never run at the same time for one panel", "After a save, the manager knows exactly which changes were saved and which are newer"]);

T("8.7","Add manual save","P0",
 "Save on demand.",
 ["8.6"], ["client/src/features/workspace/EpisodeWorkspace.jsx"],
 "A visible Save button in the workspace header and Ctrl+S (blocks the browser’s save dialog). It shows saving, success and failure states; after a failure the button becomes ‘Retry save’.",
 "Manual save with retry.",
 ["Ctrl+S saves all dirty panels", "A failed save can be retried from the button"]);

T("8.8","Add auto-save","P0",
 "Save without the user thinking about it.",
 ["8.7"], ["client/src/features/save/useSaveManager.js"],
 "Save 3 s after the last change, plus every 30 s while anything is dirty. Never send a request when nothing changed.",
 "Auto-save (D10).",
 ["No requests appear in the network tab while idle and clean"]);

T("8.9","Add the save status indicator","P0",
 "Show what is saved.",
 ["8.8"], ["client/src/features/save/SaveStatus.jsx"],
 "Shows ‘Saved at 14:03’, ‘Saving…’, ‘Unsaved changes’ or ‘Couldn’t save. Retrying…’. After task 8.16 it also shows ‘Recovery copy kept on this device’ when a save failed and the draft is safe.",
 "Visible save state.",
 ["Status changes match what the network tab shows"]);

T("8.10","Add retry and offline handling","P0",
 "Survive short connection losses.",
 ["8.9"], ["client/src/features/save/useSaveManager.js"],
 "On failure retry after 2, 4, 8 … up to 60 s. On the browser `online` event, retry at once. Unsaved state stays in memory, and a failed save never clears the recovery draft (task 8.16).",
 "Resilient saving.",
 ["Work drawn offline saves when the connection returns", "A failed save leaves the recovery draft untouched"]);

T("8.11","Handle save conflicts","P0",
 "Never lose work silently when two tabs edit one panel, or when a recovery draft meets a newer server version.",
 ["8.10"], ["client/src/features/save/ConflictDialog.jsx"],
 "On 409 show a dialog: ‘Load the latest version’ or ‘Keep my version’ (fetch the current version, then save over it). The same dialog is reused by task 8.17 when a recovery draft is older than the server version.",
 "Conflict handling.",
 ["Two tabs editing one panel show the dialog", "Neither side is overwritten without the user choosing"]);

T("8.12","Warn about unsaved work","P0",
 "Stop accidental loss on leaving.",
 ["8.11"], ["client/src/features/save/useUnsavedWarning.js"],
 "`beforeunload` warning when dirty. React Router’s blocker shows ConfirmDialog on in-app navigation while dirty.",
 "Leave protection.",
 ["Closing the tab with unsaved work shows the browser warning"]);

T("8.16","Create the local recovery draft store","P0",
 "Keep unsaved drawing changes on this device so a crash, closed tab or lost connection doesn’t lose them (D10 Option A).",
 ["8.12", "8.6"], ["client/src/features/save/recoveryStore.js", "client/src/features/save/useSaveManager.js", "docs/decisions.md"],
 "Use IndexedDB (database `toonverse-recovery`, store `drafts`), written with the browser API and no extra library. localStorage was rejected: about 5 MB per site, strings only, and it blocks the page while writing, while one dense panel can be several MB (record this in D10). Key each draft by user id + panel id, so another member on the shared laptop is never offered someone else’s draft. Store `{ episodeId, panelId, userId, baseVersion, changeCounter, scene, updatedAt }`. On the save manager’s ‘changed’ hook, write the draft (debounced 1 s). On ‘saved’, delete it only if the stored counter is not newer than the saved one. If IndexedDB is unavailable or full (QuotaExceededError), keep working and show ‘Recovery copy unavailable on this device’. Guest sandbox drawings stay temporary and are not stored (D1).",
 "A per-user recovery draft for every panel with unsaved changes.",
 ["Drawing and then killing the tab leaves a draft in IndexedDB", "A successful save clears only the changes it saved; newer edits stay in the draft", "A failed save keeps the draft", "A full or blocked IndexedDB never breaks drawing or server saving"]);

T("8.17","Offer to restore or discard a recovery draft","P0",
 "Let the user choose what happens to recovered work, without an old draft ever overwriting newer saved work.",
 ["8.16", "8.11"], ["client/src/features/save/RecoveryPrompt.jsx", "client/src/features/panels/usePanelsState.js"],
 "When an episode opens, look up the current user’s drafts for it. If a draft’s `baseVersion` equals the server version, offer ‘Restore my unsaved changes’ or ‘Discard’. If the server version is newer, show the conflict dialog from task 8.11 with both versions described (never restore silently). Restoring applies the draft as unsaved changes, so the normal save flow saves it; discarding deletes the draft after a confirm step.",
 "Recovered work is offered, never forced.",
 ["After a crash, reopening the episode offers the draft", "An old draft never replaces a newer server version without the user choosing", "Discard removes only that draft"]);

T("8.13","Auto-save notes","P1",
 "Use the same behaviour for notes.",
 ["8.17"], ["client/src/features/notes/NotesStep.jsx", "client/src/utils/debounce.js"],
 "Notes save 3 s after typing stops and show the same status indicator.",
 "Consistent saving.",
 ["Notes save without pressing Save"]);

T("8.14","Test saving and recovery","P0",
 "Prove no work is lost.",
 ["8.13"], ["client/src/features/save/useSaveManager.test.js", "client/src/features/save/recoveryStore.test.js"],
 "With fake timers: no request when clean; one request after 3 s idle; 30 s fallback; retry timing; no overlapping saves. Recovery store with a fake IndexedDB: draft written after edits; cleared after save only up to the saved counter; kept after a failed save; quota error handled. By hand: refresh after drawing, offline then online, two-tab conflict, kill the tab then restore, restore an old draft after another tab saved a newer version (conflict shown), discard a draft, a second member logged in on the same laptop sees no draft from the first.",
 "Save and recovery tests.",
 ["Automated tests pass", "All manual checks pass", "Every D10 behaviour has at least one test"]);

T("8.15","Fix save bugs","P0",
 "Debug what testing found.",
 ["8.14"], ["client/src/features/save/"],
 "Typical issues: a save during a stroke sending half a stroke, version not updated after retry, the blocker firing after a successful save, a draft deleted although newer edits existed. Fix and re-run 8.14.",
 "Reliable saving.",
 ["8.14 passes again in full"],
 "feat(save): add manual save, auto-save, local recovery drafts and conflict handling");

CP("Creator studio complete", ["Work survives refresh, logout, short offline periods and a crashed tab", "Recovered drafts are offered to restore or discard, never applied silently", "Conflicts are explained instead of overwriting", "Notes, drawings, panels and bubbles all persist", "Merge into develop · tag v0.3.0 (milestone M3)"]);

PH(9, "Preview & Export", "Rendering and export run in the browser (D3).");

T("9.1","Create the preview endpoint","P0",
 "Give the preview everything in one call.",
 ["8.15"], ["server/src/controllers/episode.controller.js", "server/src/routes/episode.routes.js"],
 "Branch `feature/09-preview-export`. `GET /api/episodes/:episodeId/preview` (owner only) returns episode, series title and ordered panels `{ id, order, width, height, scene }`.",
 "Preview API.",
 ["Panels come back in order"]);

T("9.2","Test the preview endpoint","P0",
 "Prove it is owner-only and ordered.",
 ["9.1"], ["server/tests/episodes/preview.test.js"],
 "Cases: owner 200 in order, other user 404, logged out 401.",
 "Preview tests passing.",
 ["All preview tests pass"]);

T("9.3","Create the read-only panel renderer","P0",
 "One component that draws a finished panel.",
 ["7.24"], ["client/src/features/preview/PanelRenderer.jsx"],
 "Wraps CanvasStage with no interaction, waits for fonts (task 7.13) and images (task 7.24) before drawing.",
 "Renderer used by Preview and publishing.",
 ["A saved panel looks the same as in the editor"]);

T("9.4","Build the Preview step","P0",
 "See the episode as readers will.",
 ["9.3"], ["client/src/features/preview/PreviewStep.jsx"],
 "Before opening, save any unsaved changes (or ask the user to). Preview renders the server data, never an unsaved recovery draft. Vertical strip of all panels at reader width, a ‘Back to editing’ button, and loading and error states.",
 "Preview.",
 ["Preview order matches the panel order", "Opening preview with unsaved changes saves them first"]);

T("9.5","Create the offscreen render utility","P1",
 "Turn panels into images for export and publishing.",
 ["9.4"], ["client/src/features/export/renderPanels.js"],
 "For each panel: create a hidden Konva stage, draw the scene, wait for fonts and images, return a canvas at a given `pixelRatio`. Destroy the stage afterwards.",
 "Panel images in memory.",
 ["Rendering 20 panels does not leak memory (stages destroyed)"]);

T("9.6","Export as PNG","P1",
 "Download the episode as an image.",
 ["9.5"], ["client/src/features/export/exportPng.js"],
 "Stack panel canvases vertically. Split into parts when the total height exceeds 16,000 px. Pixel ratio from the user’s limits (1 free, 2 premium; real limits in task 11.6). Download through a blob link. The resolution limit is applied in the browser only; it is a documented known limitation (D6), not server-enforced security.",
 "PNG export.",
 ["The PNG matches the preview", "Code comments and docs describe the resolution limit as browser-only"]);

T("9.7","Export as PDF","P1",
 "Download the episode as a PDF.",
 ["9.6"], ["client/src/features/export/exportPdf.js"],
 "Install `jspdf`. Page width matches 800 px; add each panel as a JPEG (quality 0.92); start a new page when the next panel doesn’t fit; keep aspect ratios.",
 "PDF export.",
 ["Panels are in order and never stretched"]);

T("9.8","Add export file names","P2",
 "Readable download names.",
 ["9.7"], ["client/src/utils/fileName.js"],
 "`series-title-ep-3.pdf` style slugs. Unit test.",
 "Named downloads.",
 ["Test passes for titles with spaces and symbols"]);

T("9.9","Build the export menu","P1",
 "Let creators choose an export.",
 ["9.8"], ["client/src/features/preview/ExportMenu.jsx"],
 "PNG and PDF options in the Preview step, a progress indicator per panel and an error toast.",
 "Export UI.",
 ["Progress shows while exporting"]);

T("9.10","Test exports in three browsers","P1",
 "Make sure exports work everywhere.",
 ["9.9"], [],
 "In Chrome, Edge and Firefox: fonts correct, reference images present, a 20-panel episode exports without crashing. Fix bugs.",
 "Verified export.",
 ["All three browsers produce correct files"],
 "feat(export): add episode preview and png/pdf export");

CP("Preview & Export complete", ["Preview the whole episode", "Download PNG and PDF that match the preview", "Merge into develop"]);

PH(10, "Publishing, Discover, Reader View & Favorites", "Panel images are rendered in the browser and uploaded through the backend (see issue I1).");

T("10.1","Create the rendered image upload endpoint","P0",
 "Store a published image for each panel.",
 ["9.10"], ["server/src/controllers/publish.controller.js", "server/src/routes/publish.routes.js", "server/src/services/panel.service.js"],
 "Branch `feature/10-publish-read`. `POST /api/panels/:panelId/render` (multipart `image` and `sceneVersion`): owner check, upload to `episodes/<id>/rendered`, save `rendered { url, publicId, version }`, then remove the previous rendered image with `deleteImageIfUnreferenced` (task 7.21) so a still-used image is never deleted (D15).",
 "Rendered images in Cloudinary.",
 ["Uploading twice leaves only one image in Cloudinary", "The old image is deleted only after the new one is saved and nothing else references it"]);

T("10.2","Create the publish service","P0",
 "Publish only complete, up-to-date episodes.",
 ["10.1"], ["server/src/services/publish.service.js"],
 "`publishEpisode(episodeId, user)`: needs a title, at least one panel, and every panel’s `rendered.version` equal to its `version`; otherwise 409 `RENDER_OUTDATED`. Set `status: 'published'` and `publishedAt` if empty.",
 "Publishing logic (D8).",
 ["An episode with an edited but unrendered panel cannot publish"]);

T("10.3","Create the unpublish service","P1",
 "Take an episode down.",
 ["10.2"], ["server/src/services/publish.service.js"],
 "`unpublishEpisode` sets `status: 'unpublished'`.",
 "Unpublish logic.",
 ["Unpublished episodes keep their data"]);

T("10.4","Create the publish routes and tests","P0",
 "Expose and verify publishing.",
 ["10.3"], ["server/src/routes/publish.routes.js", "server/tests/publish/publish.test.js"],
 "`POST /api/episodes/:episodeId/publish` and `/unpublish`. Tests with the storage service mocked: success, outdated render 409, no panels 400, other user 404.",
 "Publish API.",
 ["All publish tests pass"],
 "feat(publish): add panel render upload, publish and unpublish APIs");

T("10.5","Build the Publish step","P0",
 "Publish from the workspace.",
 ["9.5"], ["client/src/api/publish.js", "client/src/features/publish/PublishStep.jsx"],
 "Checklist (title set, at least one panel, everything saved, no pending recovery draft). ‘Publish’ saves, renders each panel from the saved server data (task 9.5, never from a recovery draft), uploads each with progress, then calls publish. Success shows a link to the Reader view. Unpublish button when published.",
 "One-click publishing.",
 ["A failed upload stops before calling publish"]);

T("10.6","Create the Discover endpoint","P0",
 "List published work.",
 ["10.5"], ["server/src/services/discover.service.js", "server/src/routes/read.routes.js"],
 "Public `GET /api/discover?page=&limit=` (limit max 24): series with at least one published episode, newest first by latest `publishedAt`, with creator name, latest episode and published count. Use the `{ status, publishedAt }` index.",
 "Discover API.",
 ["Drafts and unpublished episodes never appear"]);

T("10.7","Create the public read endpoints","P0",
 "Serve published episodes to anyone.",
 ["10.6"], ["server/src/services/read.service.js", "server/src/routes/read.routes.js"],
 "`GET /api/read/series/:seriesId` → series and its published episodes. `GET /api/read/episodes/:episodeId` → published episode with ordered rendered image URLs and previous and next published episode ids. Draft or unpublished → 404.",
 "Reader API.",
 ["A draft episode id returns 404"]);

T("10.8","Test Discover and read APIs","P0",
 "Prove nothing private leaks.",
 ["10.7"], ["server/tests/read/read.test.js"],
 "Cases: drafts hidden everywhere, pagination, ordering, previous and next ids, no scene JSON in public responses.",
 "Reader tests passing.",
 ["All read tests pass"],
 "feat(reader): add discover and public read APIs");

T("10.9","Build the Discover page","P0",
 "The public home page.",
 ["3.22"], ["client/src/api/read.js", "client/src/features/discover/DiscoverPage.jsx", "client/src/routes/AppRouter.jsx"],
 "Route `/` replaces the home placeholder. Text cards (title, creator, latest episode, episode count) per issue I9, ‘Load more’, and loading, empty and error states.",
 "Discover page.",
 ["The published series in the mock data in `client/src/mocks/` appear as text cards, and ‘Load more’ adds the next mock page", "FYP 2 check: seed data’s published series appears"]);

T("10.10","Build the series reader page","P0",
 "Let readers pick an episode.",
 ["10.9"], ["client/src/features/reader/SeriesReaderPage.jsx"],
 "Route `/read/series/:seriesId`: title, description, creator and the published episode list.",
 "Series page for readers.",
 ["Only published episodes are listed"]);

T("10.11","Build the Reader view","P0",
 "Read an episode.",
 ["10.10"], ["client/src/features/reader/ReaderView.jsx"],
 "Route `/read/episodes/:episodeId`: vertical images (`loading=\"lazy\"`, full width up to 800 px), previous and next buttons, back to series. Works for guests and at phone width.",
 "Reader view.",
 ["A 20-panel episode scrolls smoothly on a phone-width window"]);

T("10.12","Create the favorites service and routes","P1",
 "Let readers save series.",
 ["10.11"], ["server/src/services/favorite.service.js", "server/src/routes/favorite.routes.js"],
 "`POST /api/favorites/:seriesId` (idempotent upsert; series must have a published episode), `DELETE /api/favorites/:seriesId`, `GET /api/favorites`. All behind requireAuth.",
 "Favorites API.",
 ["Favouriting twice keeps one record"]);

T("10.13","Test the favorites API","P1",
 "Prove favorites are correct.",
 ["10.12"], ["server/tests/favorites/favorites.test.js"],
 "Cases: add, add again, remove, list, unpublished series 404, logged out 401.",
 "Favorites tests passing.",
 ["All favorites tests pass"]);

T("10.14","Build the favorite button and Favorites page","P1",
 "Favorites in the UI.",
 ["10.11"], ["client/src/features/reader/FavoriteButton.jsx", "client/src/features/favorites/FavoritesPage.jsx"],
 "Toggle button on series and Reader pages (guests get a sign-in prompt). Route `/favorites` lists saved series.",
 "Favorites UI.",
 ["Toggling the button updates the mock favorites in `client/src/mocks/`, `/favorites` lists the series marked as favorites, and guests get the sign-in prompt", "FYP 2 check: the button state survives a refresh"]);

T("10.15","Test the creator-to-reader flow","P0",
 "Verify the MVP end to end.",
 ["10.14"], [],
 "Create a series → episode → notes → draw → bubbles → save → preview → publish → find it on Discover in another browser as a guest → read it → log in as a reader → favourite it. Then edit and republish. Fix bugs.",
 "A working MVP.",
 ["The whole flow works without help"],
 "feat(favorites): add favorites and complete the creator-to-reader flow");

CP("MVP complete", ["Creator flow: notes → drawing → panels → dialogue → preview → save → publish", "Reader flow: Discover → published episode → Reader view → favorites", "Drafts are never public", "Merge into develop · create `release/v0.4.0` · tag v0.4.0 (milestone M4)"]);

PH(5, "Episode Notes & AI Assistance", "Part 2 of 2 — AI assistance (OpenAI, server side only).");

T("5.6","Configure OpenAI","P1",
 "Connect the backend to OpenAI.",
 ["10.15", "1.20"], ["server/src/config/openai.js", "server/src/config/env.js", "server/.env.example"],
 "Branch `feature/05-ai`. Install `openai`. Env: `OPENAI_API_KEY`, `OPENAI_MODEL`, `AI_DAILY_LIMIT_FREE=10`, `AI_DAILY_LIMIT_PREMIUM=50`. Create one client with a 30 s timeout.",
 "OpenAI configured on the server only.",
 ["Missing key stops startup with a clear message"]);

T("5.7","Create the prompt builder","P1",
 "Enforce the assistant-only rule in every request.",
 ["5.6"], ["server/src/services/ai/prompts.js", "server/tests/ai/prompts.test.js"],
 "System prompt from docs/ai-policy.md: suggest and organise, never write a complete episode or story, never describe generating artwork. Builders for `notes`, `organize`, `panelPlan`, `dialogue`. User text truncated to 6,000 characters and wrapped in clear delimiters.",
 "Safe prompts.",
 ["Tests show the policy text is always included", "Long input is truncated"]);

T("5.8","Create the AI service","P1",
 "One function that calls OpenAI.",
 ["5.7"], ["server/src/services/ai/ai.service.js"],
 "`suggest(kind, input)` calls the chat completion with max 600 output tokens. Map errors: timeout → 504 `AI_TIMEOUT`, OpenAI 429 → 503 `AI_BUSY`, anything else → 502 `AI_ERROR`.",
 "AI service.",
 ["Every OpenAI failure becomes a known error code"]);

T("5.9","Test OpenAI on its own","P1",
 "Prove the integration before wiring it in.",
 ["5.8"], ["server/scripts/test-openai.js"],
 "A script that sends one `panelPlan` request with sample notes and prints the suggestion. Also try ‘write the whole episode for me’ and check it returns guidance instead.",
 "Confirmed OpenAI access and policy.",
 ["A suggestion prints", "The full-episode request is declined"]);

T("5.10","Create the daily AI quota","P1",
 "Limit AI use per user (D11).",
 ["5.9"], ["server/src/middleware/aiQuota.js"],
 "Uses `User.aiUsage { date, count }` (issue I2). One atomic `findOneAndUpdate` that resets the count on a new day and increments only while under the limit. Over the limit → 429 `AI_QUOTA_EXCEEDED` with the reset time. Limits read from env now; task 11.4 switches to premium limits.",
 "AI quota.",
 ["The 11th request of the day on a free account returns 429"]);

T("5.11","Create the AI controller and routes","P1",
 "Expose the four assistant features.",
 ["5.10"], ["server/src/controllers/ai.controller.js", "server/src/validators/ai.validators.js", "server/src/routes/ai.routes.js"],
 "`POST /api/ai/notes`, `/api/ai/organize`, `/api/ai/panel-plan`, `/api/ai/dialogue`. Each: requireAuth, `episodeId` ownership, length rules, aiQuota. Response `{ suggestion, remaining }`.",
 "AI API.",
 ["Routes match docs/api.md"]);

T("5.12","Add a burst rate limit for AI","P1",
 "Stop rapid repeated AI calls.",
 ["5.11"], ["server/src/middleware/rateLimits.js"],
 "Install `express-rate-limit`. `aiLimiter`: 5 requests per minute per user. This file also holds the limiters added in task 13.4.",
 "AI burst protection.",
 ["A sixth request within a minute returns 429"]);

T("5.13","Test the AI API","P1",
 "Prove the AI endpoints without calling OpenAI.",
 ["5.12"], ["server/tests/ai/ai.test.js"],
 "Mock the AI service. Cases: success with `remaining`, quota exceeded, burst limit, validation, foreign episode 404, each mapped error code, logged out 401.",
 "AI tests passing.",
 ["All AI tests pass with no network calls"],
 "feat(ai): add openai assistant endpoints with policy prompt and quotas");

T("5.14","Create the AI API module","P1",
 "Frontend calls for AI.",
 ["1.15"], ["client/src/api/ai.js"],
 "One function per endpoint.",
 "AI API module.",
 ["Functions match docs/api.md"]);

T("5.15","Build the suggestion panel","P1",
 "Show AI help without taking over.",
 ["5.14"], ["client/src/features/ai/SuggestionPanel.jsx"],
 "Shows the suggestion as plain text labelled ‘AI suggestion: edit before using’ with Copy, Insert and Dismiss. Loading state; clear messages for timeout, busy and quota (with remaining count).",
 "Suggestion UI.",
 ["Nothing is inserted without clicking Insert"]);

T("5.16","Add AI to the Notes step","P1",
 "Help with notes, organising and panel planning.",
 ["5.15"], ["client/src/features/notes/NotesStep.jsx"],
 "Buttons: ‘Help with notes’, ‘Organize ideas’, ‘Plan panels’. Insert adds the suggestion at the cursor and never replaces existing text.",
 "AI-assisted notes.",
 ["Existing notes are never overwritten"]);

T("5.17","Add dialogue suggestions to the Panels step","P1",
 "Help with dialogue.",
 ["5.16"], ["client/src/features/panels/DialogueHelper.jsx"],
 "Side panel: describe the moment and the characters, get dialogue suggestions, copy them into a bubble by hand. (Direct insert into a bubble is backlog task 7.26.)",
 "AI-assisted dialogue.",
 ["Copying works and no bubble changes automatically"]);

T("5.18","Test the AI flows with the real key","P1",
 "Verify AI end to end.",
 ["5.17"], [],
 "Use each of the four features, try to get a full story (should be declined), reach the quota, check remaining counts, build the client and search `dist/` for the key (must not be there). Fix bugs.",
 "Verified AI assistance.",
 ["Every check passes"],
 "feat(ai): add ai suggestion panel to notes and panels steps");

CP("AI assistance complete", ["Get help with notes, idea organisation, panel planning and dialogue", "AI only suggests text and never overwrites", "Quotas and rate limits work", "The OpenAI key never reaches the browser", "Merge into develop"]);

PH(11, "Premium Tools & JazzCash Sandbox", "Premium first (works without payments), then JazzCash, then the end-to-end purchase.");

T("11.1","Create the premium plan config","P1",
 "Define premium in code (D6, D7).",
 ["5.18"], ["server/src/config/premium.js", "server/.env.example"],
 "Branch `feature/11-premium`. **Before starting, ask the team for the PKR price (D7 is pending) and record it in the decision log; never invent an amount.** Export price (`PREMIUM_PRICE`, required env value with no default), duration (`PREMIUM_DAYS=30`) and limits, overridable from env: free `{ maxLayers: 5, aiPerDay: 10, exportPixelRatio: 1 }`, premium `{ maxLayers: 20, aiPerDay: 50, exportPixelRatio: 2 }`.",
 "The single source of premium rules.",
 ["The numbers match the decision log", "The price comes from the team’s recorded decision, not from code", "The server refuses to start payments if `PREMIUM_PRICE` is missing"]);

T("11.2","Create the premium service","P1",
 "Premium state logic.",
 ["11.1"], ["server/src/services/premium.service.js", "server/src/middleware/requirePremium.js"],
 "`isPremiumActive(user)` (true only while `premiumUntil` is in the future), `getLimits(user)`, `grantPremium(userId, days)` (extends from the later of now and the current `premiumUntil`). `requirePremium` now uses `isPremiumActive`.",
 "Premium logic.",
 ["Expired premium counts as free with no scheduled job"]);

T("11.3","Create the premium endpoints","P1",
 "Let the client read plans and status.",
 ["11.2"], ["server/src/controllers/premium.controller.js", "server/src/routes/premium.routes.js"],
 "Public `GET /api/premium/plan` → price, days, free and premium limits. `GET /api/premium/status` (requireAuth) → `isPremium`, `premiumUntil`, `limits`, `aiRemaining`.",
 "Premium API.",
 ["Status reflects the database"]);

T("11.4","Use premium limits on the server","P1",
 "Enforce limits where they matter.",
 ["11.3"], ["server/src/validators/scene.validators.js", "server/src/middleware/aiQuota.js"],
 "Scene validation uses `getLimits(user).maxLayers`; the AI quota uses `getLimits(user).aiPerDay`. Remove the hard-coded numbers from tasks 8.2 and 5.10.",
 "Server-side premium enforcement.",
 ["No limit number remains outside `config/premium.js`"]);

T("11.5","Test premium logic","P1",
 "Prove premium rules.",
 ["11.4"], ["server/tests/premium/premium.test.js"],
 "Cases: expiry, extension stacking, status endpoint, free user’s 20-layer scene rejected, premium user’s accepted, AI quota 10 vs 50.",
 "Premium tests passing.",
 ["All premium tests pass"],
 "feat(premium): add premium plan, status and server-side limits");

T("11.6","Use premium state in the client","P1",
 "Apply the user’s real limits in the UI.",
 ["5.17"], ["client/src/api/premium.js", "client/src/features/premium/usePremium.js", "client/src/features/premium/limits.js"],
 "`usePremium()` loads `/api/premium/status` for logged-in users (free limits for guests). The layer limit (6.14), export pixel ratio (9.6) and AI remaining count use it.",
 "Limits from the server.",
 ["Changing the mock premium status in `client/src/mocks/` between free and premium changes the layer limit, the export pixel ratio and the AI remaining count after a refresh", "FYP 2 check: changing premium in the database changes the UI after refresh"]);

T("11.7","Build the Premium page","P1",
 "Explain and sell premium (sandbox).",
 ["11.6"], ["client/src/features/premium/PremiumPage.jsx"],
 "Route `/premium`: free vs premium comparison from `/api/premium/plan`, price marked ‘sandbox test payment’, current status and expiry, and an Upgrade button (connected in task 11.17).",
 "Premium page.",
 ["Premium users see their expiry date"]);

T("11.8","Add upgrade prompts at limits","P1",
 "Point users to premium when they hit a limit.",
 ["11.7"], ["client/src/features/premium/UpgradePrompt.jsx"],
 "Show a short prompt with a link to `/premium` at the layer limit, on AI quota exceeded and next to HD export.",
 "Upgrade prompts.",
 ["Each limit shows the prompt"]);

T("11.9","Test premium gating without payments","P1",
 "Check premium tools work before adding JazzCash.",
 ["11.8"], ["server/scripts/set-premium.js"],
 "A script that sets or clears premium for an email. Toggle a test user and check layers, AI quota and export ratio in the UI.",
 "Verified premium tools.",
 ["Limits change correctly both ways"],
 "feat(premium): add premium page, client limits and upgrade prompts");

CP("Premium tools complete", ["Free and premium limits come from one config", "Limits are enforced by the API and shown in the UI", "Premium expires on its own", "Ready for payments"]);

T("11.10","Configure the JazzCash sandbox","P1",
 "Connect the backend to the payment sandbox.",
 ["11.9", "1.20"], ["server/src/config/jazzcash.js", "server/src/config/env.js", "server/.env.example"],
 "Env: `JAZZCASH_MERCHANT_ID`, `JAZZCASH_PASSWORD`, `JAZZCASH_INTEGRITY_SALT`, `JAZZCASH_POST_URL` (sandbox hosted checkout URL from the JazzCash sandbox portal), `JAZZCASH_RETURN_URL` (`http://localhost:5000/api/payments/jazzcash/return` in development).",
 "Payment configuration on the server only.",
 ["No JazzCash value exists in the client"]);

T("11.11","Create the secure hash utility","P1",
 "Sign and verify JazzCash messages.",
 ["11.10"], ["server/src/services/payments/jazzcashHash.js", "server/tests/payments/hash.test.js"],
 "Build `pp_SecureHash` as the JazzCash integration guide specifies (sorted `pp_` fields, non-empty values joined with `&`, prefixed with the integrity salt, HMAC-SHA256 keyed with the salt). Confirm every detail against the sandbox documentation. Test with a known example from the docs.",
 "Hash signing and checking.",
 ["The test reproduces the documented hash exactly"]);

T("11.12","Create the payment request builder","P1",
 "Build the fields JazzCash expects.",
 ["11.11"], ["server/src/services/payments/jazzcash.service.js"],
 "`buildPaymentRequest(payment)` returns the field set from the integration guide (version, merchant id, password, transaction reference, amount in paisa, PKR, date-time, expiry, description, return URL) plus `pp_SecureHash`.",
 "Signed payment request.",
 ["The amount is sent in the unit the guide requires"]);

T("11.13","Create the initiate endpoint","P1",
 "Start a payment.",
 ["11.12"], ["server/src/controllers/payment.controller.js", "server/src/routes/payment.routes.js"],
 "`POST /api/payments/jazzcash/initiate` (requireAuth): create a `pending` Payment with a unique `txnRefNo`, amount from the premium config, then return `{ postUrl, fields }`.",
 "Payment initiation.",
 ["A pending Payment is stored for every call"]);

T("11.14","Create the return handler","P1",
 "Receive and verify the payment result.",
 ["11.13"], ["server/src/controllers/payment.controller.js", "server/src/routes/payment.routes.js", "server/src/app.js"],
 "`POST /api/payments/jazzcash/return` with a urlencoded body parser and no auth (the browser posts it from JazzCash, see issue I4). Recompute and compare the hash, find the Payment by `pp_TxnRefNo`, check the amount, skip if already final, mark `paid` and call `grantPremium` on success code, otherwise `failed`. Save the raw response. Redirect 303 to `CLIENT_URL/premium/result?ref=…`.",
 "Verified payment results.",
 ["Premium is granted only inside this handler"]);

T("11.15","Test the payment service on its own","P1",
 "Prove payment security without the sandbox.",
 ["11.14"], ["server/tests/payments/return.test.js"],
 "Fake return bodies signed with the test salt: success grants premium; wrong hash → 400 and nothing changes; amount mismatch rejected; repeated success callback does not extend twice; failure code marks failed.",
 "Payment tests passing.",
 ["All payment tests pass"]);

T("11.16","Create the payment status endpoint","P1",
 "Let the result page read the outcome.",
 ["11.15"], ["server/src/routes/payment.routes.js"],
 "`GET /api/payments/:txnRefNo` (requireAuth, owner only) → status, amount, `paidAt`.",
 "Status API.",
 ["Another user’s reference returns 404"],
 "feat(payments): add jazzcash sandbox initiate, verified return handler and status");

T("11.17","Connect the Upgrade button to JazzCash","P1",
 "Send the user to the sandbox checkout.",
 ["11.7"], ["client/src/features/premium/useCheckout.js", "client/src/features/premium/PremiumPage.jsx"],
 "Call initiate, build a hidden form with the returned fields, submit it to `postUrl` (a full page navigation).",
 "Checkout redirect.",
 ["Clicking Upgrade builds the hidden form from the mock initiate response in `client/src/mocks/`: every returned field is in the form, and it targets `postUrl`", "FYP 2 check: clicking Upgrade opens the JazzCash sandbox page"]);

T("11.18","Build the payment result page","P1",
 "Tell the user what happened.",
 ["11.17"], ["client/src/features/premium/PaymentResultPage.jsx"],
 "Route `/premium/result`: read `ref`, call the status endpoint, show success (with new expiry, refreshing premium state), failed, cancelled or pending.",
 "Result page.",
 ["Every status has a clear message and next step"]);

T("11.19","Run real sandbox payments","P1",
 "Test with JazzCash itself.",
 ["11.18"], [],
 "Pay with the sandbox test credentials; check the Payment is `paid` and the user premium. Also run a failed and a cancelled payment. Usual fixes: hash field order, date format, amount unit.",
 "Working sandbox payments.",
 ["Success, failure and cancel all end in the correct state"]);

T("11.20","Add payment history","P2",
 "Show users their past payments.",
 ["11.19"], ["server/src/routes/payment.routes.js", "client/src/features/profile/PaymentHistory.jsx"],
 "`GET /api/payments/mine` and a list on the Profile page.",
 "Payment history.",
 ["Only the user’s own payments appear"]);

T("11.21","Test the complete premium purchase","P1",
 "Verify the architecture’s premium flow end to end.",
 ["11.20"], ["docs/testing/premium-manual.md"],
 "Write and run: free user hits the layer limit → upgrade prompt → Premium page → JazzCash sandbox → result page → 20 layers allowed → set `premiumUntil` in the past with the script → limits return.",
 "Verified premium flow.",
 ["Every step passes", "The script is saved for staging (task 15.8)"],
 "feat(premium): connect jazzcash checkout, result page and payment history");

CP("Premium & JazzCash complete", ["User → Premium Tools → Backend → JazzCash Sandbox → Premium Access works", "Tampered or repeated callbacks change nothing", "Premium expires automatically", "Merge into develop"]);
