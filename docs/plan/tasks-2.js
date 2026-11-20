// Toonverse execution plan — part 2: Phases 4, 5 (notes), 6 (engine), 7

PH(4, "App Shell, Dashboard, Series & Episodes", "");

T("4.1","Create the ownership and id helpers","P0",
 "Stop users touching other people’s content.",
 ["3.29"], ["server/src/utils/ownership.js", "server/src/middleware/validateObjectId.js"],
 "Branch `feature/04-series-episodes`. `assertOwner(doc, userId)` throws 404 `NOT_FOUND` when the doc is missing or owned by someone else (404 hides that it exists). `validateObjectId('seriesId')` returns 400 for malformed ids.",
 "Helpers every owner-scoped service uses.",
 ["A malformed id returns 400 instead of a 500 cast error"]);

T("4.2","Create the series service","P0",
 "Business logic for series.",
 ["4.1"], ["server/src/services/series.service.js"],
 "`createSeries`, `listMySeries` (with episode count and last edited episode), `getSeriesForOwner`, `updateSeries` (title, description), `deleteSeries` (deletes episodes, notes, panels, favorites; Cloudinary cleanup is added in task 7.21).",
 "Series logic.",
 ["Every function except create calls `assertOwner`"]);

T("4.3","Create the series controller, rules and routes","P0",
 "Expose series endpoints.",
 ["4.2"], ["server/src/controllers/series.controller.js", "server/src/validators/series.validators.js", "server/src/routes/series.routes.js"],
 "`POST /api/series`, `GET /api/series/mine`, `GET /api/series/:seriesId`, `PATCH /api/series/:seriesId`, `DELETE /api/series/:seriesId`. All use requireAuth, id validation and body rules (title 1–100, description max 1000).",
 "Series API.",
 ["Every route matches docs/api.md"]);

T("4.4","Test the series API","P0",
 "Prove CRUD and ownership.",
 ["4.3"], ["server/tests/series/series.test.js"],
 "Cases: create, list mine only, get, update, delete with cascade, user B gets 404 on user A’s series, validation errors, logged-out 401.",
 "Series tests passing.",
 ["All series tests pass"],
 "feat(series): add series CRUD API with ownership checks");

T("4.5","Create the episode service","P0",
 "Business logic for episodes.",
 ["4.4"], ["server/src/services/episode.service.js"],
 "`createEpisode` (number = highest + 1), `listEpisodes(seriesId)`, `getEpisodeForOwner`, `updateEpisode` (title), `reorderEpisodes(seriesId, orderedIds)`, `deleteEpisode` (deletes its note and panels).",
 "Episode logic.",
 ["Creating three episodes numbers them 1, 2, 3"]);

T("4.6","Create the episode controller, rules and routes","P0",
 "Expose episode endpoints.",
 ["4.5"], ["server/src/controllers/episode.controller.js", "server/src/validators/episode.validators.js", "server/src/routes/episode.routes.js"],
 "`POST` and `GET /api/series/:seriesId/episodes`, `GET`, `PATCH` and `DELETE /api/episodes/:episodeId`, `PUT /api/series/:seriesId/episodes/order` (body `{ episodeIds }`, must contain exactly the series’ episodes).",
 "Episode API.",
 ["Reorder with a missing or foreign id returns 400"]);

T("4.7","Test the episode API","P0",
 "Prove episodes behave correctly.",
 ["4.6"], ["server/tests/episodes/episodes.test.js"],
 "Cases: create and numbering, list order, rename, reorder, delete cascade, ownership 404, validation.",
 "Episode tests written.",
 ["All cases run"]);

T("4.8","Fix episode numbering conflicts","P0",
 "Debug the reorder edge case.",
 ["4.7"], ["server/src/services/episode.service.js"],
 "Reordering can collide with the unique `{ series, number }` index mid-update. Fix with two passes: first set temporary negative numbers, then the final numbers. Re-run the tests.",
 "Safe reordering.",
 ["Reversing five episodes succeeds", "All episode tests pass"],
 "feat(episodes): add episode CRUD and reorder API");

T("4.9","Create the remaining shared UI components","P1",
 "Components the dashboard and workspace need.",
 ["3.22"], ["client/src/components/ui/Modal.jsx", "client/src/components/ui/Toast.jsx", "client/src/components/ui/EmptyState.jsx", "client/src/components/ui/ConfirmDialog.jsx"],
 "Accessible Modal (focus trap, Escape closes), Toast provider and `useToast()`, EmptyState (message and action), ConfirmDialog (built on Modal).",
 "UI kit complete for content screens.",
 ["Modal closes with Escape", "A toast appears and disappears"]);

T("4.10","Create the series and episode API modules","P0",
 "Frontend calls for the new endpoints.",
 ["4.9"], ["client/src/api/series.js", "client/src/api/episodes.js"],
 "One function per endpoint in tasks 4.3 and 4.6.",
 "API modules.",
 ["Functions match docs/api.md"]);

T("4.11","Build the Dashboard page","P0",
 "Show creators their series.",
 ["4.10"], ["client/src/features/dashboard/DashboardPage.jsx"],
 "List series cards (title, episode count, last updated, ‘Continue’ link to the last edited episode). Loading, empty (‘Create your first series’) and error states.",
 "A working dashboard.",
 ["Seed user sees their two series", "A new user sees the empty state"]);

T("4.12","Build the Create Series modal","P0",
 "Let creators start a series.",
 ["4.11"], ["client/src/features/series/CreateSeriesModal.jsx"],
 "Title and description fields with validation, loading button, API error display, success toast; the new series appears in the dashboard without a reload.",
 "Series creation from the UI.",
 ["The new series shows immediately"]);

T("4.13","Build the Series page","P0",
 "Manage one series and its episodes.",
 ["4.12"], ["client/src/features/series/SeriesPage.jsx"],
 "Route `/series/:seriesId`. Edit title and description. List episodes with number, title, status and last saved.",
 "Series detail screen.",
 ["A foreign or missing series shows a not-found page"]);

T("4.14","Add episode actions","P0",
 "Create, rename, reorder and delete episodes.",
 ["4.13"], ["client/src/features/series/EpisodeList.jsx"],
 "New episode button, inline rename, move up and down buttons (calls reorder), delete with ConfirmDialog.",
 "Episode management in the UI.",
 ["Order persists after refresh"]);

T("4.15","Add the delete series flow","P1",
 "Allow removing a whole series safely.",
 ["4.14"], ["client/src/features/series/SeriesPage.jsx"],
 "Delete button opens ConfirmDialog that states how many episodes will be deleted. On success go to the dashboard with a toast.",
 "Series deletion.",
 ["Deleted series disappears from the dashboard"]);

T("4.16","Build the episode workspace shell","P0",
 "The container for the creator flow.",
 ["4.15"], ["client/src/features/workspace/EpisodeWorkspace.jsx", "client/src/routes/AppRouter.jsx"],
 "Route `/episodes/:episodeId/:step`. Loads the episode. Stepper: Notes → Draw → Panels → Preview → Publish, each a placeholder component filled by later phases.",
 "The workspace frame.",
 ["Each step URL loads", "A foreign episode shows not found"]);

T("4.17","Test the dashboard flow","P1",
 "Verify before moving on.",
 ["4.16"], ["client/src/features/series/CreateSeriesModal.test.jsx"],
 "Component test for the modal’s validation. By hand: create series → add three episodes → reorder → rename → open workspace → delete an episode → delete the series.",
 "A verified content flow.",
 ["Component test passes", "Manual flow works"],
 "feat(dashboard): add dashboard, series page, episode management and workspace shell");

CP("Series & Episodes complete", ["Create, edit and delete a series", "Create, rename, reorder and delete episodes", "Open the episode workspace", "Other users’ content stays unreachable", "Merge into develop · tag v0.2.0 (milestone M2)"]);

PH(5, "Episode Notes & AI Assistance", "Part 1 of 2 — notes only. The AI part runs after the MVP so the MVP never waits for OpenAI.");

T("5.1","Create the note service","P0",
 "Business logic for notes.",
 ["4.17"], ["server/src/services/note.service.js"],
 "Branch `feature/05-notes`. `getNote(episodeId, user)` returns the note or an empty one. `upsertNote(episodeId, user, content)` creates or updates it. Both check episode ownership.",
 "Notes logic.",
 ["A second save updates instead of creating a duplicate"]);

T("5.2","Create the notes controller, rules and routes","P0",
 "Expose notes.",
 ["5.1"], ["server/src/controllers/note.controller.js", "server/src/validators/note.validators.js", "server/src/routes/note.routes.js"],
 "`GET` and `PUT /api/episodes/:episodeId/notes`. Content max 20,000 characters.",
 "Notes API.",
 ["Too-long content returns 400"]);

T("5.3","Test the notes API","P0",
 "Prove notes are saved and private.",
 ["5.2"], ["server/tests/notes/notes.test.js"],
 "Cases: empty note on first get, save, update, other user 404, too long 400.",
 "Notes tests passing.",
 ["All notes tests pass"]);

T("5.4","Build the Notes step","P0",
 "Let creators write episode notes.",
 ["4.16"], ["client/src/api/notes.js", "client/src/features/notes/NotesStep.jsx"],
 "Large textarea with a short guide placeholder (premise, characters in this episode, scene list). Save button, saving state, ‘Unsaved changes’ indicator, error toast. Auto-save is added in task 8.13.",
 "The Notes step.",
 ["Saving sends the notes to the mock notes module in `client/src/mocks/` and shows the saving state, then saved; a mock save failure shows the error toast", "FYP 2 check: notes survive a refresh after saving"]);

T("5.5","Test the notes flow by hand","P0",
 "Verify notes end to end.",
 ["5.4"], [],
 "Write, save, refresh, edit, save again, try another user’s episode URL.",
 "Verified notes.",
 ["Every step works"],
 "feat(notes): add episode notes API and notes step");

CP("Episode Notes complete", ["Write and save notes for an episode", "Notes reload after refresh", "Merge into develop"]);

PH(6, "Drawing Canvas Engine", "Part 2 of 2 — the full editor, built on the spike from tasks 6.1–6.3.");

T("6.4","Create the canvas module structure","P0",
 "Organise the editor code.",
 ["5.5", "6.3"], ["client/src/features/canvas/CanvasEditor.jsx", "client/src/features/canvas/CanvasStage.jsx", "client/src/features/canvas/state/", "client/src/features/canvas/components/", "client/src/features/canvas/utils/"],
 "Branch `feature/06-canvas`. Create the files as empty components and modules. The editor takes `scene` and `onChange` props so it can later run per panel.",
 "Editor skeleton.",
 ["The editor renders an empty stage in the Draw step"]);

T("6.5","Create the scene reducer","P0",
 "Pure functions that change a scene.",
 ["6.4"], ["client/src/features/canvas/state/sceneReducer.js", "client/src/features/canvas/state/sceneReducer.test.js"],
 "Actions: `addLayer`, `removeLayer`, `renameLayer`, `moveLayer`, `setLayerVisibility`, `setLayerLock`, `setLayerOpacity`, `addShape(layerId, shape)`. Never mutate; follow the 6.3 format. Unit test each action.",
 "Scene logic independent of React.",
 ["Every action has a passing test"]);

T("6.6","Create the undo/redo history","P0",
 "Undo and redo any scene change.",
 ["6.5"], ["client/src/features/canvas/state/history.js", "client/src/features/canvas/state/history.test.js"],
 "`{ past, present, future }`. `commit(scene)` pushes and clears `future`; `undo`, `redo`; keep at most 50 past states.",
 "History logic.",
 ["Tests cover undo, redo, branch reset and the 50-step cap"]);

T("6.7","Create the useCanvasEditor hook","P0",
 "Connect reducer, history and tool settings to React.",
 ["6.6"], ["client/src/features/canvas/useCanvasEditor.js"],
 "Holds history state, active layer, active tool, brush size, opacity and colour. Exposes actions that commit to history and call `onChange`.",
 "Editor state hook.",
 ["Calling an action updates the rendered scene"],
 "feat(canvas): add scene reducer, undo/redo history and editor hook");

T("6.8","Render the scene on the stage","P0",
 "Draw any saved scene.",
 ["6.7"], ["client/src/features/canvas/CanvasStage.jsx"],
 "One Konva `Layer` per scene layer (in order, hidden layers skipped, layer opacity applied). Strokes render as `Line` with tension 0.5, round caps and the right composite operation.",
 "A scene renderer.",
 ["The 6.3 example scene renders correctly"]);

T("6.9","Implement the brush tool","P0",
 "Freehand drawing on the active layer.",
 ["6.8"], ["client/src/features/canvas/tools/brush.js", "client/src/features/canvas/CanvasStage.jsx"],
 "Pointer down starts a temporary stroke (not in history), move appends points from `stage.getRelativePointerPosition()` (keeps zoom correct later), up commits one stroke to history. Locked or hidden layers ignore input.",
 "Drawing works.",
 ["One stroke = one undo step"]);

T("6.10","Build the toolbar with brush settings","P0",
 "Let users choose size and opacity.",
 ["6.9"], ["client/src/features/canvas/components/Toolbar.jsx"],
 "Tool buttons (brush now, more later), size slider 1–100, opacity slider. Active tool is highlighted.",
 "A toolbar.",
 ["Size and opacity changes affect the next stroke"]);

T("6.11","Implement the eraser tool","P0",
 "Erase on the active layer only.",
 ["6.10"], ["client/src/features/canvas/tools/eraser.js"],
 "An eraser stroke uses `globalCompositeOperation: 'destination-out'` and is stored with `tool: 'eraser'`.",
 "Eraser.",
 ["Erasing on layer 2 leaves layer 1 untouched"]);

T("6.12","Build the colour picker","P0",
 "Choose brush colours.",
 ["6.11"], ["client/src/features/canvas/components/ColorPicker.jsx"],
 "Native colour input, 12 preset swatches and the last 8 used colours.",
 "Colour selection.",
 ["The chosen colour is used by the next stroke"]);

T("6.13","Build the layers panel","P0",
 "Manage layers.",
 ["6.12"], ["client/src/features/canvas/components/LayersPanel.jsx"],
 "List layers top to bottom; add, delete (confirm if it has shapes), rename, move up and down, show/hide, lock/unlock, select active.",
 "Layer management.",
 ["Every layer action can be undone"]);

T("6.14","Add the layer limit","P1",
 "Enforce the free and premium layer limits from D6 in the UI.",
 ["6.13"], ["client/src/features/premium/limits.js", "client/src/features/canvas/components/LayersPanel.jsx"],
 "`limits.js` exports default free limits (5 layers). Disable ‘Add layer’ at the limit and explain why. Task 11.6 replaces the defaults with the user’s real limits.",
 "Layer limit in the UI.",
 ["The sixth layer cannot be added on the free plan"]);

T("6.15","Add undo/redo buttons and shortcuts","P0",
 "Make history easy to use.",
 ["6.14"], ["client/src/features/canvas/components/Toolbar.jsx", "client/src/features/canvas/useKeyboardShortcuts.js"],
 "Undo and redo buttons (disabled when empty). Ctrl+Z, Ctrl+Shift+Z and Ctrl+Y; ignored while typing in an input or textarea.",
 "History controls.",
 ["Shortcuts do not fire while renaming a layer"],
 "feat(canvas): add brush, eraser, colours, layers and undo/redo controls");

T("6.16","Implement zoom","P0",
 "Work on detail.",
 ["6.15"], ["client/src/features/canvas/useZoomPan.js", "client/src/features/canvas/components/ZoomControls.jsx"],
 "Mouse wheel zooms around the pointer (25 %–400 %). Plus, minus and ‘Fit’ buttons; show the current percentage.",
 "Zoom.",
 ["The point under the cursor stays put while zooming"]);

T("6.17","Implement pan","P0",
 "Move around a zoomed canvas.",
 ["6.16"], ["client/src/features/canvas/useZoomPan.js", "client/src/features/canvas/components/Toolbar.jsx"],
 "Hand tool and holding Space make the stage draggable; releasing returns to the previous tool.",
 "Pan.",
 ["Space + drag moves the view without drawing"]);

T("6.18","Debug drawing under zoom and pan","P0",
 "Make sure strokes land exactly under the pointer.",
 ["6.17"], ["client/src/features/canvas/tools/"],
 "Draw at 300 % after panning, and at 50 %. Fix any offset (usual cause: using `getPointerPosition` instead of the relative position).",
 "Accurate drawing at any zoom.",
 ["Strokes start exactly under the cursor at 50 %, 100 % and 300 %"]);

T("6.19","Create scene serialization","P0",
 "Turn a scene into saveable JSON and back.",
 ["6.18"], ["client/src/features/canvas/utils/serialize.js", "client/src/features/canvas/utils/serialize.test.js"],
 "`toJSON(scene)` rounds points and removes temporary fields. `fromJSON(json)` checks `formatVersion` and fills defaults. Round-trip test.",
 "The format saved in Phase 8.",
 ["`fromJSON(toJSON(scene))` equals the original"]);

T("6.20","Tune canvas performance","P1",
 "Keep drawing smooth with many strokes.",
 ["6.19"], ["client/src/features/canvas/CanvasStage.jsx"],
 "Inactive layers: `listening(false)` and `cache()`, refreshed when they change. Use `batchDraw`. Re-run the 2,000-stroke test from task 6.2 and record the result.",
 "A fast editor.",
 ["No visible lag with 2,000 strokes on a mid-range laptop"],
 "feat(canvas): add zoom, pan, serialization and performance tuning");

T("6.21","Put the editor in the Draw step","P0",
 "Use the real editor in the workspace.",
 ["6.20"], ["client/src/features/workspace/EpisodeWorkspace.jsx", "client/src/routes/AppRouter.jsx"],
 "The Draw step shows one in-memory editor (Phase 7 turns this into one editor per panel). Remove the `/dev/canvas-spike` route and folder.",
 "Editor inside the creator flow.",
 ["The spike route no longer exists"]);

T("6.22","Add the guest canvas sandbox","P1",
 "Let guests try drawing (D1).",
 ["6.21", "3.27"], ["client/src/features/canvas/SandboxPage.jsx", "client/src/routes/AppRouter.jsx"],
 "Route `/sandbox`, open to guests and users. Editor with no saving; a note says work is lost on leaving.",
 "Guest drawing.",
 ["A guest can draw with every tool"]);

T("6.23","Run the canvas test checklist","P0",
 "Catch editor bugs before panels depend on it.",
 ["6.22"], ["docs/testing/canvas-checklist.md"],
 "Check each tool; 50 undos then 50 redos; drawing on hidden and locked layers is refused; zoom and pan; layer reorder. Write the checklist, run it, fix every bug.",
 "A stable editor.",
 ["Every checklist item passes"],
 "feat(canvas): integrate editor into workspace and add guest sandbox");

CP("Drawing canvas complete", ["Draw with brush and eraser", "Pick colours", "Add, hide, lock, rename and reorder layers", "Undo and redo 50 steps", "Zoom and pan accurately", "Scene round-trips through JSON", "Merge `feature/06-canvas` into develop"]);

PH(7, "Panels, Speech Bubbles, Dialogue & Reference Images", "");

T("7.1","Create the panel service","P0",
 "Business logic for panels.",
 ["6.23"], ["server/src/services/panel.service.js"],
 "Branch `feature/07-panels`. `listPanels(episodeId, user)` sorted by order; `createPanel(episodeId, user, { height })` with width 800, an empty scene with one layer and order = last; `updatePanelMeta` (height); `deletePanel`; `reorderPanels(episodeId, ids)`.",
 "Panel logic.",
 ["New panels get increasing order numbers"]);

T("7.2","Create the panel controller, rules and routes","P0",
 "Expose panels.",
 ["7.1"], ["server/src/controllers/panel.controller.js", "server/src/validators/panel.validators.js", "server/src/routes/panel.routes.js"],
 "`GET` and `POST /api/episodes/:episodeId/panels`, `PATCH /api/panels/:panelId` (height 200–2400), `PUT /api/episodes/:episodeId/panels/order`, `DELETE /api/panels/:panelId`. Scene saving comes in task 8.3.",
 "Panels API.",
 ["Routes match docs/api.md"]);

T("7.3","Test the panels API","P0",
 "Prove panels behave.",
 ["7.2"], ["server/tests/panels/panels.test.js"],
 "Cases: create, list order, resize limits, reorder, delete, ownership.",
 "Panel tests passing.",
 ["All panel tests pass"],
 "feat(panels): add panels API");

T("7.4","Build the panel strip","P0",
 "Show the episode as a vertical strip.",
 ["6.23"], ["client/src/api/panels.js", "client/src/features/panels/PanelStrip.jsx", "client/src/features/panels/PanelsStep.jsx"],
 "Load panels. Only the selected panel runs the full editor; the others render read-only (CanvasStage with `listening(false)`). Click a panel to edit it.",
 "A multi-panel workspace.",
 ["Switching panels keeps each panel’s drawing"]);

T("7.5","Add panel management","P0",
 "Create, delete, resize and reorder panels.",
 ["7.4"], ["client/src/features/panels/PanelStrip.jsx", "client/src/features/panels/PanelControls.jsx"],
 "Add panel (at the end or below the selected one), delete with confirm, move up and down, a height handle (200–2400 px). Each change calls the API.",
 "Panel controls.",
 ["Order and heights survive a refresh"]);

T("7.6","Keep editor state per panel","P0",
 "Each panel has its own scene and undo history.",
 ["7.5"], ["client/src/features/panels/usePanelsState.js"],
 "A map keyed by panel id holding scene, history and a dirty flag. Scenes start from `fromJSON(panel.scene)`.",
 "Independent panels.",
 ["Undo in panel 2 does not change panel 1"]);

T("7.7","Add bubble and text shapes to the scene format","P0",
 "Store dialogue in the scene.",
 ["7.6"], ["docs/data-model.md", "client/src/features/canvas/state/sceneReducer.js"],
 "Bubble: `{ type: 'bubble', id, variant: 'oval' | 'box' | 'thought', x, y, w, h, tail: { x, y }, fill, stroke, text: { content, font, size, align, color } }`. Text: `{ type: 'text', id, x, y, width, content, font, size, align, color }`. Add `updateShape` and `removeShape` with tests.",
 "Dialogue in the data format.",
 ["Reducer tests for the new actions pass", "data-model.md updated"]);

T("7.8","Render speech bubbles","P0",
 "Draw bubbles with wrapped text.",
 ["7.7"], ["client/src/features/panels/shapes/SpeechBubble.jsx", "client/src/features/panels/shapes/TextShape.jsx"],
 "A Konva Group: Ellipse, Rect or small circles (thought) plus a tail, and a Text clipped to the bubble width with padding.",
 "Bubble rendering.",
 ["Long text wraps inside the bubble"]);

T("7.9","Add select, move and resize","P0",
 "Edit bubbles and text after placing them.",
 ["7.8"], ["client/src/features/canvas/tools/select.js", "client/src/features/canvas/CanvasStage.jsx"],
 "Select tool with Konva Transformer. Commit to history on drag end and transform end. Delete key removes the selection.",
 "Shape editing.",
 ["Moving a bubble is one undo step"]);

T("7.10","Add the bubble tool","P0",
 "Place speech bubbles.",
 ["7.9"], ["client/src/features/canvas/tools/bubble.js", "client/src/features/canvas/components/Toolbar.jsx"],
 "Click places a default bubble on the active layer. Variant picker (oval, box, thought). Drag handle moves the tail.",
 "Bubble creation.",
 ["All three variants can be placed and their tails moved"]);

T("7.11","Add text editing","P0",
 "Type dialogue into bubbles and captions.",
 ["7.10"], ["client/src/features/panels/TextEditorOverlay.jsx", "client/src/features/canvas/tools/text.js"],
 "Double-click a bubble or text opens a textarea positioned over the shape; commit on blur or Ctrl+Enter, cancel on Escape. Max 500 characters. Text tool places a free caption.",
 "Dialogue editing.",
 ["Edited text is one undo step"]);

T("7.12","Add font controls","P0",
 "Choose lettering style.",
 ["7.11"], ["client/src/features/panels/FontControls.jsx"],
 "Font picker from `config/fonts.js` (task 1.13), size, alignment and colour for the selected bubble or text.",
 "Lettering controls.",
 ["Changing the font updates the shape immediately"]);

T("7.13","Wait for fonts before drawing text","P0",
 "Stop bubbles rendering in a fallback font.",
 ["7.12"], ["client/src/utils/fonts.js", "client/src/features/panels/PanelsStep.jsx"],
 "`ensureFontsLoaded()` calls `document.fonts.load()` for each lettering font, then awaits `document.fonts.ready`. Panels render text only after it resolves, then redraw.",
 "Correct fonts on first load.",
 ["After a hard refresh, bubbles show the chosen font at once"]);

T("7.14","Test bubbles and text by hand","P0",
 "Verify dialogue features.",
 ["7.13"], [],
 "Place every bubble type, type long text, change fonts, move, resize, undo, hard refresh. Fix bugs.",
 "Verified dialogue tools.",
 ["Every check passes"],
 "feat(panels): add panel strip, speech bubbles, text tool and lettering fonts");

T("7.15","Configure Cloudinary","P1",
 "Connect the backend to image storage.",
 ["7.14", "1.20"], ["server/src/config/cloudinary.js", "server/src/config/env.js", "server/.env.example"],
 "Install `cloudinary`. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER` (e.g. `toonverse/dev`) to the env config. Configure the SDK once.",
 "Cloudinary configured on the server only.",
 ["No Cloudinary secret exists in the client"]);

T("7.16","Create the storage service","P1",
 "One place for all Cloudinary calls.",
 ["7.15"], ["server/src/services/storage.service.js"],
 "`uploadImageBuffer(buffer, { folder })` uses `upload_stream` and returns `{ url: secure_url, publicId }`. `deleteImage(publicId)`. Folders: `<base>/users/<userId>/references` and `<base>/episodes/<episodeId>/rendered`.",
 "Storage service.",
 ["Functions resolve with url and publicId"]);

T("7.17","Test Cloudinary on its own","P1",
 "Prove the integration before wiring it in.",
 ["7.16"], ["server/scripts/test-cloudinary.js"],
 "A script that uploads a small sample image, prints the URL, then deletes it.",
 "Confirmed storage access.",
 ["The image appears and then disappears in the Cloudinary console"]);

T("7.18","Create the upload middleware","P1",
 "Accept image files safely.",
 ["7.17"], ["server/src/middleware/upload.js", "server/src/utils/fileSignature.js", "server/src/middleware/errorHandler.js"],
 "Install `multer`. Memory storage, 5 MB limit, one file, MIME whitelist PNG, JPEG, WebP. `fileSignature.js` checks the first bytes match the claimed type. Errors: 413 `FILE_TOO_LARGE`, 400 `INVALID_FILE_TYPE`.",
 "Upload validation.",
 ["A renamed .exe is rejected even with an image MIME type"]);

T("7.19","Create the reference upload endpoint","P1",
 "Upload reference images through the backend.",
 ["7.18"], ["server/src/controllers/upload.controller.js", "server/src/routes/upload.routes.js", "server/src/services/panel.service.js"],
 "`POST /api/panels/:panelId/references` (multipart field `image`): owner check, upload with the storage service, push to `referenceImages`, respond 201 `{ id, url }` (id = subdocument id). If the upload succeeds but saving the reference to the panel fails, delete the just-uploaded image so no orphan is left (D15).",
 "Reference upload API.",
 ["The returned URL opens the uploaded image", "A failed database save leaves no image behind in Cloudinary"]);

T("7.20","Create the reference delete endpoint","P1",
 "Remove reference images.",
 ["7.19"], ["server/src/controllers/upload.controller.js", "server/src/routes/upload.routes.js"],
 "`DELETE /api/panels/:panelId/references/:referenceId`: remove the reference from the panel first, then delete the Cloudinary image only if nothing else still references it (the check from task 7.21).",
 "Reference delete API.",
 ["The reference is gone from the panel", "The image is deleted from Cloudinary only when no other record uses it"]);

T("7.21","Add safe image cleanup to deletes","P1",
 "Stop orphaned images without ever deleting one still in use (D15).",
 ["7.20"], ["server/src/services/storage.service.js", "server/src/services/panel.service.js", "server/src/services/episode.service.js", "server/src/services/series.service.js"],
 "Add `deleteImageIfUnreferenced(publicId)` to the storage service: search every panel’s `referenceImages.publicId` and `rendered.publicId` (and any later field that stores a publicId); delete from Cloudinary only when no record remains. Deleting a panel, episode or series removes its database records first, then calls this for each of its images. Log a cleanup failure without blocking the delete.",
 "Clean storage that never removes shared or still-used images.",
 ["Deleting a series removes its unreferenced images in Cloudinary", "An image referenced by another panel is kept", "Every delete path uses the same helper"]);

T("7.22","Test the upload API","P1",
 "Prove uploads and cleanup are safe.",
 ["7.21"], ["server/tests/uploads/references.test.js"],
 "Mock the storage service. Cases: valid image 201, 6 MB 413, fake type 400, foreign panel 404, delete calls the cleanup helper, cascade cleanup, an image still referenced by another panel is not deleted, a failed database save after upload deletes the orphaned upload.",
 "Upload tests passing.",
 ["All upload tests pass", "The shared-image and orphan cases are covered"],
 "feat(storage): upload and delete reference images via multer and cloudinary");

T("7.23","Build the reference image UI","P1",
 "Use reference images while drawing.",
 ["7.13"], ["client/src/api/uploads.js", "client/src/features/panels/ReferenceImageControls.jsx"],
 "‘Add reference’ uploads with FormData and shows progress and errors. The image is added as an `image` shape on a locked ‘Reference’ layer, with an opacity slider and a remove button.",
 "Reference images in the editor.",
 ["Errors from 413 and 400 show clear messages"]);

T("7.24","Load images with cross-origin access","P0",
 "Keep export possible when reference images are used.",
 ["7.23"], ["client/src/utils/loadImage.js"],
 "`loadImage(url)` returns an HTMLImageElement with `crossOrigin = 'anonymous'`. Use it for every Cloudinary image. Check `stage.toDataURL()` works with a reference image present.",
 "No tainted canvas.",
 ["`toDataURL()` throws no SecurityError"]);

T("7.25","Test the complete panels flow","P0",
 "Verify Phase 7 end to end.",
 ["7.24"], [],
 "Create three panels, draw, add bubbles and a reference image, reorder, delete one. Scenes are not saved yet (Phase 8); check everything else.",
 "Verified panels.",
 ["Panels, bubbles and references all work"],
 "feat(panels): add reference image layer with cross-origin loading");

CP("Panels & dialogue complete", ["Create, resize, reorder and delete panels", "Draw in each panel", "Add speech bubbles and captions in Google Fonts", "Upload and remove reference images through Cloudinary", "Merge `feature/07-panels` into develop"]);
