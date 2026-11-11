# Toonverse API contract

One agreed description of the Toonverse REST API, so the frontend and the backend build against the same requests and responses.

- **This file has three parts.** Part 1 (this task, Task 007) covers authentication, users, series, episodes and episode notes. Part 2 (Task 008) adds panels, uploads, drawing save, preview, publishing, the reader and favorites. Part 3 (Task 009) adds AI, premium, payments and admin.
- **Status:** Part 1 written for Task 007 (plan 0.7), 2026-11-10; review corrections 2026-11-11. Owner: Nabila Azam.
- **Sources:** the Execution Plan (Tasks 1.5, 1.6, 1.15, 1.17, 3.3–3.18, 4.1–4.8, 5.1–5.3, 13.3, 13.4), `docs/data-model.md` (field limits), `docs/decisions.md` (D1, D4, D5, D8, D13), and the decisions recorded on GitHub Issue #8.
- **If this file and the decision log disagree,** the decision log wins. Tell the team, then fix this file.

## How to read this document

| Label | Meaning |
|---|---|
| *(no label)* | From the Execution Plan or the decision log. |
| **(I8)** | Decided by Nabila on GitHub Issue #8 (comments of 2026-11-06, 2026-11-10 and 2026-11-11). |
| **(R)** | Recommendation not yet confirmed. Listed again under [Open items](#open-items). |

## Contents
1. [Conventions](#conventions)
2. [Error format](#error-format)
3. [Shared objects](#shared-objects)
4. [Authentication](#authentication)
5. [Users](#users)
6. [Series](#series)
7. [Episodes](#episodes)
8. [Episode notes](#episode-notes)
9. [Open items](#open-items)

## Conventions

| Topic | Rule |
|---|---|
| Base path | Every route starts with `/api` (Task 1.6). |
| Format | Requests and responses are JSON (`Content-Type: application/json`). A request body can be at most **1 MB** (Task 1.6). |
| Login | A JWT in the httpOnly cookie `tv_token` (D4). The browser sends it automatically when requests use `credentials: 'include'` (Task 1.15). The cookie is `SameSite=Lax`, `Secure` in production, `Path=/`, and lasts as long as the token (Task 3.3). JavaScript can never read it. |
| Ids | Every object has an `id` (MongoDB's `_id`, renamed by Task 2.1). The only `null` id is a Note that has not been saved yet (see [Note](#note)). Ids in paths are MongoDB ObjectIds: 24 hexadecimal characters. |
| Dates | ISO 8601 text in UTC, for example `"2026-11-10T09:55:28.000Z"`. A date that is not set is `null`. |
| Private fields | `passwordHash` and any other private field are never sent (Task 2.1). |
| Text input | Text fields are trimmed before their length is checked (Task 3.6; data model). |

### Who may call a route

| Access | Meaning |
|---|---|
| **Public** | No login needed. |
| **Logged in** | Needs a valid `tv_token` cookie for an active account (Task 3.13). |
| **Owner** | Logged in, and the series or episode must belong to the user. |

**Someone else's content looks missing.** If a series or episode belongs to another user, the answer is `404 NOT_FOUND`, exactly as if it did not exist. This hides that it exists (Task 4.1).

**Ids are checked in two steps (I8):**
1. An id that is not a valid ObjectId returns `400 VALIDATION_ERROR`, with the path parameter named in `details`.
2. A valid id that does not exist, or belongs to someone else, returns `404 NOT_FOUND`.

**Guests** can only call the public routes in this part (D1). Guest Mode reading routes are added in Part 2.

## Error format

Every error has the same shape (Task 1.5):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields are not valid.",
    "details": [
      { "field": "title", "message": "Title must be 1 to 100 characters." }
    ]
  }
}
```

- `code` is a fixed text that the frontend can check.
- `message` is a short sentence that can be shown to the user.
- `details` is always present (I8). It is a list of `{ field, message }` for `VALIDATION_ERROR`, and `null` for every other error.
- Stack traces and other technical details are never sent (Task 1.5).

### Error codes in Part 1

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | A body field, query value or path id is missing or not valid (Task 3.6). Also a body that is not valid JSON (I8), and an episode order list that does not match the series' episodes (I8). |
| 400 | `INVALID_INPUT` | A body, query or path key starts with `$` or contains `.` (Task 13.3). |
| 400 | `WRONG_PASSWORD` | The current password is wrong when changing the password (Task 3.17). |
| 401 | `UNAUTHENTICATED` | The `tv_token` cookie is missing, not valid or expired (Task 3.13, I8). The client always sees this one code for token problems. |
| 401 | `INVALID_CREDENTIALS` | Wrong email or wrong password at login. Both give the same message, `"Invalid email or password"` (Task 3.10). |
| 403 | `ACCOUNT_SUSPENDED` | The account is suspended, at login (Task 3.10) or on any later request while logged in (Task 3.13, I8). |
| 404 | `NOT_FOUND` | The route, series or episode does not exist, or belongs to someone else (Tasks 1.5, 4.1). |
| 409 | `EMAIL_TAKEN` | The email is already registered (Task 3.4). |
| 413 | `PAYLOAD_TOO_LARGE` | The request body is over 1 MB (I8). |
| 429 | `RATE_LIMITED` | Too many login or registration attempts: 5 a minute per IP address, added in Task 13.4 (I8). |
| 500 | `INTERNAL_ERROR` | An unexpected server error (I8). |

Every route can also return `500 INTERNAL_ERROR`. Parts 2 and 3 add their own codes.

## Shared objects

### User

The user's own account, returned by the authentication and user routes. The fields below are the approved list (I8).

**Two stored fields are left out on purpose.** The stored User record also has `updatedAt` and `aiUsage` (data model), but the server must not send them:
- `aiUsage` is left out, so this contract does not depend on the pending Decision A in `docs/data-model.md`.
- `updatedAt` is not part of the approved User object.

The Task 2.1 plugin removes only `private` fields, so the server has to leave these two out itself.

```json
{
  "id": "6730f1a2b3c4d5e6f7a8b9c0",
  "name": "Ayesha Khan",
  "email": "ayesha@example.com",
  "role": "user",
  "isPremium": false,
  "premiumUntil": null,
  "bio": "",
  "status": "active",
  "createdAt": "2026-11-10T09:00:00.000Z"
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `name` | string | 2–60 characters |
| `email` | string | Lowercase |
| `role` | string | `user` or `admin` (D5) |
| `isPremium` | boolean | |
| `premiumUntil` | date or `null` | End of the premium period |
| `bio` | string | 0–300 characters; `""` when empty |
| `status` | string | `active` or `suspended` |
| `createdAt` | date | |

### Series

```json
{
  "id": "6730f2c4d5e6f7a8b9c0d1e2",
  "creator": "6730f1a2b3c4d5e6f7a8b9c0",
  "title": "Moonlit Bakery",
  "description": "A baker who can only open her shop at night.",
  "createdAt": "2026-11-10T09:05:00.000Z",
  "updatedAt": "2026-11-10T09:05:00.000Z"
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `creator` | string | Id of the owning user |
| `title` | string | 1–100 characters |
| `description` | string | 0–1000 characters; `""` when empty |
| `createdAt`, `updatedAt` | date | |

### Episode

```json
{
  "id": "6730f3e6f7a8b9c0d1e2f3a4",
  "series": "6730f2c4d5e6f7a8b9c0d1e2",
  "creator": "6730f1a2b3c4d5e6f7a8b9c0",
  "number": 1,
  "title": "",
  "status": "draft",
  "publishedAt": null,
  "lastSavedAt": null,
  "createdAt": "2026-11-10T09:10:00.000Z",
  "updatedAt": "2026-11-10T09:10:00.000Z"
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `series` | string | Id of the series |
| `creator` | string | Id of the owning user |
| `number` | number | Position in the series. The first episode gets 1, and each new one the highest number plus 1 (Task 4.5). Numbers can have gaps after a delete; a reorder renumbers them 1, 2, 3 … (I8). |
| `title` | string | 0–100 characters. A draft may be untitled, and then the title is `""` (I8). Publishing needs a title (Task 10.2, Part 2). |
| `status` | string | `draft`, `published` or `unpublished` (D8). New episodes are `draft`. |
| `publishedAt` | date or `null` | Set on the first publish (Part 2) |
| `lastSavedAt` | date or `null` | Set when a panel in the episode is saved (Part 2) |
| `createdAt`, `updatedAt` | date | |

### Note

The planning note of one episode. Each episode has at most one note. The object has the same fields as the stored Note record (data model, Task 2.5), saved or not (I8).

A saved note:

```json
{
  "id": "6730f5a8b9c0d1e2f3a4b5c6",
  "episode": "6730f3e6f7a8b9c0d1e2f3a4",
  "creator": "6730f1a2b3c4d5e6f7a8b9c0",
  "content": "Mina finds a key in the flour sack.",
  "createdAt": "2026-11-10T09:20:00.000Z",
  "updatedAt": "2026-11-10T09:25:00.000Z"
}
```

A note that has never been saved. No record exists yet, so `id`, `createdAt` and `updatedAt` are `null` (Task 5.1, I8):

```json
{
  "id": null,
  "episode": "6730f3e6f7a8b9c0d1e2f3a4",
  "creator": "6730f1a2b3c4d5e6f7a8b9c0",
  "content": "",
  "createdAt": null,
  "updatedAt": null
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string or `null` | `null` until the note is saved for the first time |
| `episode` | string | Id of the episode |
| `creator` | string | Id of the owning user, also before the first save |
| `content` | string | 0–20,000 characters; `""` before the first save |
| `createdAt` | date or `null` | `null` until the first save |
| `updatedAt` | date or `null` | `null` until the first save |

## Authentication

### POST /api/auth/register

Creates an account and logs the new user in (Tasks 3.4–3.7).

- **Access:** Public
- **Request body:**

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `name` | string | Yes | 2–60 characters, trimmed |
  | `email` | string | Yes | A valid email address; stored lowercase |
  | `password` | string | Yes | At least 8 characters and at most 72 bytes in UTF-8 (I8) |

  ```json
  { "name": "Ayesha Khan", "email": "Ayesha@Example.com", "password": "correct horse 12" }
  ```

- **Why 72 bytes:** bcrypt uses only the first 72 **bytes** of a password and silently ignores the rest. English letters, digits and common symbols take 1 byte each, so for them the limit is 72 characters. Characters such as Urdu letters or emoji take 2–4 bytes, so fewer of them fit. A password over 72 bytes is rejected with `400 VALIDATION_ERROR`, instead of being silently shortened. The same rule applies to `newPassword` in [PATCH /api/users/me/password](#patch-apiusersmepassword).

- **Success:** `201 Created` with `{ "user": User }`, and the `tv_token` cookie is set. The new account always has `role: "user"` (D5).
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `409 EMAIL_TAKEN`, `413 PAYLOAD_TOO_LARGE`, `429 RATE_LIMITED`, `500 INTERNAL_ERROR`

### POST /api/auth/login

Logs in with email and password (Tasks 3.10, 3.11).

- **Access:** Public
- **Request body:**

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `email` | string | Yes | |
  | `password` | string | Yes | No length check, so existing accounts can always log in (I8) |

- **Success:** `200 OK` with `{ "user": User }`, and the `tv_token` cookie is set.
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 INVALID_CREDENTIALS`, `403 ACCOUNT_SUSPENDED`, `413 PAYLOAD_TOO_LARGE`, `429 RATE_LIMITED`, `500 INTERNAL_ERROR`

### POST /api/auth/logout

Logs out by clearing the login cookie (Task 3.14).

- **Access:** Public. It works with or without a valid cookie (I8).
- **Request body:** none
- **Success:** `204 No Content`, and the `tv_token` cookie is cleared (I8).
- **Errors:** `400 INVALID_INPUT`, `500 INTERNAL_ERROR`

### GET /api/auth/me

Returns the logged-in user. The frontend calls it when the app starts, to find out whether someone is logged in (Task 3.14).

- **Access:** Logged in
- **Success:** `200 OK` with `{ "user": User }`
- **Errors:** `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `500 INTERNAL_ERROR`

## Users

### GET /api/users/me

Returns the logged-in user's profile (Task 3.17). It returns the same object as `GET /api/auth/me`.

- **Access:** Logged in
- **Success:** `200 OK` with `{ "user": User }`
- **Errors:** `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `500 INTERNAL_ERROR`

### PATCH /api/users/me

Changes the user's name or bio (Task 3.17).

- **Access:** Logged in
- **Request body:** send one or both fields. Any other field, such as `role`, `email` or `isPremium`, is ignored.

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `name` | string | No | 2–60 characters, trimmed |
  | `bio` | string | No | 0–300 characters |

- **Success:** `200 OK` with `{ "user": User }`, showing the updated profile.
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `413 PAYLOAD_TOO_LARGE`, `500 INTERNAL_ERROR`

### PATCH /api/users/me/password

Changes the user's password (Task 3.17).

- **Access:** Logged in
- **Request body:**

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `currentPassword` | string | Yes | No length check (I8); must match the current password |
  | `newPassword` | string | Yes | At least 8 characters and at most 72 bytes in UTF-8, as for registration (I8) |

- **Success:** `204 No Content` (I8)
- **Errors:** `400 VALIDATION_ERROR`, `400 WRONG_PASSWORD`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `413 PAYLOAD_TOO_LARGE`, `500 INTERNAL_ERROR`

## Series

### POST /api/series

Creates a series owned by the logged-in user (Tasks 4.2, 4.3).

- **Access:** Logged in
- **Request body:**

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `title` | string | Yes | 1–100 characters, trimmed |
  | `description` | string | No | 0–1000 characters; `""` when not sent |

- **Success:** `201 Created` with `{ "series": Series }`
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `413 PAYLOAD_TOO_LARGE`, `500 INTERNAL_ERROR`

### GET /api/series/mine

Lists the logged-in user's own series, for the dashboard (Tasks 4.2, 4.3). Each item is a Series with two extra fields (I8).

- **Access:** Logged in
- **Success:** `200 OK` with `{ "series": [ ... ] }`. The list is empty (`[]`) when the user has no series.

  ```json
  {
    "series": [
      {
        "id": "6730f2c4d5e6f7a8b9c0d1e2",
        "creator": "6730f1a2b3c4d5e6f7a8b9c0",
        "title": "Moonlit Bakery",
        "description": "A baker who can only open her shop at night.",
        "createdAt": "2026-11-10T09:05:00.000Z",
        "updatedAt": "2026-11-10T09:05:00.000Z",
        "episodeCount": 2,
        "lastEditedEpisode": {
          "id": "6730f3e6f7a8b9c0d1e2f3a4",
          "number": 1,
          "title": "",
          "lastSavedAt": "2026-11-10T09:30:00.000Z"
        }
      }
    ]
  }
  ```

  | Extra field | Type | Notes |
  |---|---|---|
  | `episodeCount` | number | Number of episodes in the series (I8) |
  | `lastEditedEpisode` | object or `null` | The episode with the latest `lastSavedAt`, as `{ id, number, title, lastSavedAt }` **(R)**. `null` when no episode has been saved yet. |

- **Errors:** `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `500 INTERNAL_ERROR`

### GET /api/series/:seriesId

Returns one of the user's series (Task 4.3).

- **Access:** Owner
- **Success:** `200 OK` with `{ "series": Series }`
- **Errors:** `400 VALIDATION_ERROR` (badly formatted `seriesId`), `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `500 INTERNAL_ERROR`

### PATCH /api/series/:seriesId

Changes the title or description of a series (Tasks 4.2, 4.3).

- **Access:** Owner
- **Request body:** send one or both fields.

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `title` | string | No | 1–100 characters, trimmed |
  | `description` | string | No | 0–1000 characters |

- **Success:** `200 OK` with `{ "series": Series }`, showing the updated series.
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `413 PAYLOAD_TOO_LARGE`, `500 INTERNAL_ERROR`

### DELETE /api/series/:seriesId

Deletes a series together with its episodes, their notes and panels, and the favorites that point to it (Task 4.2). Images in Cloudinary are cleaned up afterwards, only if nothing else still uses them (Task 7.21, D15).

- **Access:** Owner
- **Success:** `204 No Content` (I8)
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `500 INTERNAL_ERROR`

## Episodes

### POST /api/series/:seriesId/episodes

Creates an episode in one of the user's series (Tasks 4.5, 4.6).

- **Access:** Owner of the series
- **Request body:** may be empty, because the title is optional for drafts (I8).

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `title` | string | No | 0–100 characters, trimmed; `""` when not sent |

- **Success:** `201 Created` with `{ "episode": Episode }`. The episode starts as a `draft`, and its `number` is the highest number in the series plus 1 (Task 4.5).
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND` (series), `413 PAYLOAD_TOO_LARGE`, `500 INTERNAL_ERROR`

### GET /api/series/:seriesId/episodes

Lists the episodes of one of the user's series, in number order (Tasks 4.5, 4.6).

- **Access:** Owner of the series
- **Success:** `200 OK` with `{ "episodes": [Episode, ...] }`, sorted by `number`. The list is empty when the series has no episodes.
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `500 INTERNAL_ERROR`

### PUT /api/series/:seriesId/episodes/order

Puts the episodes of a series in a new order (Tasks 4.5, 4.6, 4.8).

- **Access:** Owner of the series
- **Request body:**

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `episodeIds` | array of strings | Yes | Must contain every episode of the series exactly once, and nothing else (Task 4.6) |

  ```json
  { "episodeIds": ["6730f4a8b9c0d1e2f3a4b5c6", "6730f3e6f7a8b9c0d1e2f3a4"] }
  ```

- **Success:** `200 OK` with `{ "episodes": [Episode, ...] }` in the new order (I8). Each episode in the response has its **final** number, the number stored after the reorder.
- **Numbering rule:** the episodes are renumbered by their new positions: the first in `episodeIds` becomes 1, the second 2, and so on (I8). Any gaps left by deleted episodes close. For example, episodes numbered 1, 3, 4 and sent in the order 4, 1, 3 become 4 → 1, 1 → 2, 3 → 3.
- **Implementation note for Task 4.8 (not part of the API):** the database does not allow two episodes of one series to share a number. The server therefore first gives the episodes temporary negative numbers, then writes the final numbers. The temporary numbers are never returned. Running both steps in one database transaction would stop a failure between them from leaving negative numbers behind; Task 4.8 decides this.
- **Errors:** `400 VALIDATION_ERROR` (including a list that is missing an episode, repeats one, or includes one from another series), `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND` (series), `413 PAYLOAD_TOO_LARGE`, `500 INTERNAL_ERROR`

### GET /api/episodes/:episodeId

Returns one of the user's episodes (Task 4.6).

- **Access:** Owner
- **Success:** `200 OK` with `{ "episode": Episode }`
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `500 INTERNAL_ERROR`

### PATCH /api/episodes/:episodeId

Changes an episode's title (Task 4.5). The status changes only through publishing and unpublishing (Part 2).

- **Access:** Owner
- **Request body:**

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `title` | string | Yes | 0–100 characters, trimmed. `""` makes the draft untitled again (I8). |

- **Success:** `200 OK` with `{ "episode": Episode }`, showing the updated episode.
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `413 PAYLOAD_TOO_LARGE`, `500 INTERNAL_ERROR`

### DELETE /api/episodes/:episodeId

Deletes an episode together with its note and panels (Task 4.5). Images are cleaned up afterwards, only if nothing else still uses them (Task 7.21, D15).

- **Access:** Owner. A published episode can also be deleted (I8).
- **Other episodes keep their numbers.** The next new episode still gets the highest number plus 1 (I8). For example, deleting episode 2 of 1, 2, 3 leaves 1 and 3, and the next new episode is 4.
- **Success:** `204 No Content` (I8)
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `500 INTERNAL_ERROR`

## Episode notes

### GET /api/episodes/:episodeId/notes

Returns the planning note of one of the user's episodes (Tasks 5.1, 5.2).

- **Access:** Owner of the episode
- **Success:** `200 OK` with `{ "note": Note }`. If no note has been saved yet, the answer is still `200`, with an unsaved note (I8):

  ```json
  {
    "note": {
      "id": null,
      "episode": "6730f3e6f7a8b9c0d1e2f3a4",
      "creator": "6730f1a2b3c4d5e6f7a8b9c0",
      "content": "",
      "createdAt": null,
      "updatedAt": null
    }
  }
  ```

- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND` (episode), `500 INTERNAL_ERROR`

### PUT /api/episodes/:episodeId/notes

Saves the planning note of one of the user's episodes. It creates the note the first time and replaces its content after that (Tasks 5.1, 5.2).

- **Access:** Owner of the episode
- **Request body:**

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `content` | string | Yes | 0–20,000 characters |

- **Success:** `200 OK` with `{ "note": Note }`, showing the saved note.
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND` (episode), `413 PAYLOAD_TOO_LARGE`, `500 INTERNAL_ERROR`

## Open items

**Neither of these is confirmed.** Nabila has kept them open for a separate decision (Issue #8, 2026-11-10 and 2026-11-11). They do not block the other routes.

| # | Item | Proposal |
|---|---|---|
| 1 | Shape of `lastEditedEpisode` in `GET /api/series/mine` | `{ id, number, title, lastSavedAt }` of the episode saved most recently **(R)** |
| 3 | Order of the list in `GET /api/series/mine` | Not set by the plan; for example, most recently updated first **(R)**. To be decided with the dashboard work (Task 4.2). |

Item 2, the episode numbers after reordering, was decided on 2026-11-11: episodes are renumbered by their new positions (see [PUT /api/series/:seriesId/episodes/order](#put-apiseriesseriesidepisodesorder)). The numbers 1 and 3 are kept so they match the discussion on Issue #8.

**Follow-ups in `docs/data-model.md`** (Khadija's separate fix, decision 2a on Issue #8):
- The Episode `title` is now optional for drafts (decision 1b). The data model still treats it as required with a 1–100 limit.
- The reordering recommendation should follow plan Task 4.8: temporary negative numbers during the database update, instead of temporarily adding 1000. These temporary numbers are only an internal implementation detail. They are never returned or kept, and they are not the episode numbering rule. The final numbering rule stays as confirmed above: episodes are renumbered 1, 2, 3 … by their new positions (I8).
