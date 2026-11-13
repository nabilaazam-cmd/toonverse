# Toonverse API contract

One agreed description of the Toonverse REST API, so the frontend and the backend build against the same requests and responses.

- **This file has three parts.** Part 1 (Task 007) covers authentication, users, series, episodes and episode notes. Part 2 (Task 008) adds panels, uploads, drawing save, preview, publishing, the reader and favorites. Part 3 (Task 009) adds AI, premium, payments and admin.
- **Status:** Part 1 written for Task 007 (plan 0.7), 2026-11-10; review corrections 2026-11-11. Owner: Nabila Azam. Part 2 written for Task 008 (plan 0.8), 2026-11-13. Owner: Shumail Mirzaa.
- **Sources:** the Execution Plan (Tasks 1.5, 1.6, 1.15, 1.17, 3.3–3.18, 4.1–4.8, 5.1–5.3, 13.3, 13.4), `docs/data-model.md` (field limits), `docs/decisions.md` (D1, D4, D5, D8, D13), and the decisions recorded on GitHub Issue #8. Part 2 adds the Execution Plan (Tasks 6.3, 7.1, 7.2, 7.7, 7.16, 7.18–7.21, 7.23, 8.1–8.4, 8.11, 9.1, 9.2, 10.1–10.8, 10.10–10.13, 10.15), `docs/data-model.md` (Panel, Favorite, Scene), `docs/decisions.md` (D1, D2, D3, D6, D8, D9, D10, D13, D15), and the decisions recorded on GitHub Issue #10.
- **If this file and the decision log disagree,** the decision log wins. Tell the team, then fix this file.

## How to read this document

| Label | Meaning |
|---|---|
| *(no label)* | From the Execution Plan or the decision log. |
| **(I8)** | Decided by Nabila on GitHub Issue #8 (comments of 2026-11-06, 2026-11-10 and 2026-11-11). |
| **(I10)** | Decided by Shumail and Nabila on GitHub Issue #10 (comments of 2026-11-12 and 2026-11-13). Used in Part 2; see [Part 2: overview](#part-2-overview-limits-and-error-codes). |
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
10. [Part 2: overview, limits and error codes](#part-2-overview-limits-and-error-codes)
11. [Shared objects in Part 2](#shared-objects-in-part-2)
12. [Panels](#panels)
13. [Reference images](#reference-images)
14. [Saving a drawing](#saving-a-drawing)
15. [Preview](#preview)
16. [Publishing](#publishing)
17. [Discover](#discover)
18. [Public reading](#public-reading)
19. [Favorites](#favorites)
20. [Part 2 follow-ups](#part-2-follow-ups)

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

---

## Part 2: overview, limits and error codes

Part 2 (Task 008, plan 0.8) adds the routes for the rest of the creator flow and the whole reader flow: panels, reference images, drawing save, preview, publishing, Discover, public reading and favorites. Owner: Shumail Mirzaa.

| Label | Meaning |
|---|---|
| **(I10)** | Decided on GitHub Issue #10. On 2026-11-12: Shumail's answers S1–S13 (S7 later refined to (iii)), R2, R3 and G2–G6, and Nabila's agreement to G1 (b), R1 (b), S9 (a) and the 5 MB rendered-image limit. On 2026-11-13: Shumail's answers to points 1–6 (the G5 shapes in [Public reading](#public-reading), the favorite delete, the rendered-upload version check, the publish check order, more than one file, and a repeated favorite), and Nabila's agreement to points 2 and 3 and to adding (I10) to the [How to read](#how-to-read-this-document) table (point 7). |

Part 2 uses no **(R)** labels and has no open questions.

**Everything in Part 1's rules applies here too:**
- [Conventions](#conventions), including the `tv_token` login cookie, ids, dates and trimming;
- [Who may call a route](#who-may-call-a-route), including the two-step id check (I8) and `404 NOT_FOUND` for someone else's content;
- the [Error format](#error-format), including the rule that `details` is a list for `VALIDATION_ERROR` and `null` for every other error.

**Owner, for the routes in Part 2:** the creator and editor routes (panels, reference images, drawing save, preview, rendered upload, publish and unpublish) work only on the logged-in user's own content: the panel, episode or series must belong to them. Someone else's panel or episode gives `404 NOT_FOUND`. The favorite routes are different: they need only a login, so a reader can favorite another creator's published series (Task 10.12).

**Guests** can call only the public routes: [Discover](#discover) and [Public reading](#public-reading). Guest drawings never reach the server (D1), so every panel, upload, save, preview, publishing and favorite route needs a login.

### Size limits

Three different limits. Each one applies only to its own kind of request.

| Request | Limit | Error when it is exceeded |
|---|---|---|
| Any other JSON request body | 1 MB (Part 1, Task 1.6) | `413 PAYLOAD_TOO_LARGE` |
| Drawing save, [PUT /api/panels/:panelId/scene](#put-apipanelspanelidscene) | **2 MB** for the whole JSON body (Task 8.2) | `413 PAYLOAD_TOO_LARGE` |
| Image upload: reference image or rendered panel image | **5 MB** for the one image file (Task 7.18; rendered images (I10)) | `413 FILE_TOO_LARGE` |

- The 2 MB limit is only for the drawing's JSON. The 5 MB limit is only for an uploaded image file. Neither limit changes the other.
- **Image uploads** are sent as `multipart/form-data`, not JSON (Task 7.18):
  - exactly one file, in the field `image`;
  - PNG, JPEG or WebP only.
- **The file type is checked by the file's first bytes,** not only by its declared type. A renamed file is rejected even if it claims to be an image (Task 7.18).

### Error codes in Part 2

New codes:

| Status | Code | When |
|---|---|---|
| 400 | `INVALID_FILE_TYPE` | The uploaded file is not PNG, JPEG or WebP, judged by its first bytes (Task 7.18). |
| 409 | `VERSION_CONFLICT` | A drawing save's `version`, or a rendered upload's `sceneVersion`, is not the panel's current version (Task 8.1; S8 (I10)). Nothing is saved. |
| 409 | `RENDER_OUTDATED` | Publishing, when at least one panel's rendered image was not made from its latest saved drawing (Task 10.2; S9 (I10)). |
| 413 | `FILE_TOO_LARGE` | An uploaded image is over 5 MB (Task 7.18; rendered images (I10)). |

Part 1 codes with extra cases in Part 2:
- **`400 VALIDATION_ERROR`:**
  - the `image` file is missing, or more than one file is sent (I10);
  - a drawing breaks the [scene rules](#put-apipanelspanelidscene);
  - publishing an episode with no title or no panels (S9 (I10));
  - unpublishing a draft (G3 (I10));
  - a `page` or `limit` value on Discover that is not valid.
- **`413 PAYLOAD_TOO_LARGE`:** also a drawing save over 2 MB.
- **`404 NOT_FOUND`:**
  - also a panel or reference image that does not exist or belongs to someone else;
  - on the public routes, a series or episode that is not public.

**The `VERSION_CONFLICT` error has one extra field (G1 (I10)):**

```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "This panel was saved somewhere else. Load the latest version or keep yours.",
    "details": null,
    "currentVersion": 7
  }
}
```

- `currentVersion` is the panel's version on the server now. The editor uses it in the conflict dialog (Task 8.11).
- `currentVersion` appears **only** on `VERSION_CONFLICT`.
- `details` stays `null`, as Part 1 requires for every error except `VALIDATION_ERROR`.

## Shared objects in Part 2

### Panel

One panel of an episode, with its drawing. Every route that returns a panel uses this shape (S1, S2 (I10)).

```json
{
  "id": "6731a0b1c2d3e4f5a6b7c8d9",
  "episode": "6730f3e6f7a8b9c0d1e2f3a4",
  "creator": "6730f1a2b3c4d5e6f7a8b9c0",
  "order": 1,
  "width": 800,
  "height": 1200,
  "scene": {
    "formatVersion": 1,
    "width": 800,
    "height": 1200,
    "layers": [
      { "id": "layer-1", "name": "Layer 1", "visible": true, "locked": false, "opacity": 1, "shapes": [] }
    ]
  },
  "version": 3,
  "referenceImages": [
    { "id": "6731a2c3d4e5f6a7b8c9d0e1", "url": "https://res.cloudinary.com/example/image/upload/v1/toonverse/dev/users/6730f1a2b3c4d5e6f7a8b9c0/references/sketch.png" }
  ],
  "rendered": {
    "url": "https://res.cloudinary.com/example/image/upload/v1/toonverse/dev/episodes/6730f3e6f7a8b9c0d1e2f3a4/rendered/panel.png",
    "version": 3
  }
}
```

The `scene` above is only an outline with example values. Task 6.3 freezes the exact scene format and adds it to `docs/data-model.md`.

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `episode` | string | Id of the episode |
| `creator` | string | Id of the owning user |
| `order` | number | Position in the episode. The first panel gets **1** (S4 (I10)), and each new one the highest number plus 1. Numbers can have gaps after a delete (S6 (I10)); a reorder renumbers them 1, 2, 3 … (S5 (I10)). |
| `width` | number | Always 800 (D9) |
| `height` | number | 200–2400 (D9) |
| `scene` | object | The drawing as Konva JSON (Scene in `docs/data-model.md`). A new panel starts with one empty layer (Task 7.1). |
| `version` | number | Starts at 0 and goes up by 1 on every successful drawing save (D10, Task 8.1). Resizing does not change it. |
| `referenceImages` | array of `{ id, url }` | Images the creator uploaded to trace or copy from. `id` is the reference id used by image shapes (`referenceId`) and by the delete route. |
| `rendered` | `{ url, version }` or `null` | The rendered image of this panel, which readers see once the episode is published. It is uploaded before publishing (Task 10.5), so it can exist while the episode is still a draft. `version` is the scene version it was made from. `null` until an image is uploaded. |

- **Cloudinary `publicId` values are never sent** (S2 (I10)). Only the server uses them, to delete images.
- **A panel is up to date** when `rendered.version` equals `version`. Publishing needs every panel to be up to date (Task 10.2).

### Public reader objects

Public answers contain only the fields below (G5 (I10)). They never contain:
- `scene`, `version`, `referenceImages` or any `publicId` (Task 10.8);
- `status`, `lastSavedAt`, or anything about drafts;
- private user fields such as `email`.

**Discover item** (S11 (I10)), used by [GET /api/discover](#get-apidiscover) and, with one extra field, by [GET /api/favorites](#get-apifavorites):

```json
{
  "series": { "id": "6730f2c4d5e6f7a8b9c0d1e2", "title": "Moonlit Bakery", "description": "A baker who can only open her shop at night." },
  "creator": { "id": "6730f1a2b3c4d5e6f7a8b9c0", "name": "Ayesha Khan" },
  "latestEpisode": { "id": "6730f3e6f7a8b9c0d1e2f3a4", "number": 1, "title": "The First Night", "publishedAt": "2026-11-13T10:00:00.000Z" },
  "publishedCount": 1
}
```

| Field | Type | Notes |
|---|---|---|
| `series` | `{ id, title, description }` | |
| `creator` | `{ id, name }` | The series' creator |
| `latestEpisode` | `{ id, number, title, publishedAt }` | The published episode with the latest `publishedAt` |
| `publishedCount` | number | Number of published episodes in the series |

The public series and episode answers are shown with their routes in [Public reading](#public-reading).

## Panels

### GET /api/episodes/:episodeId/panels

Lists the panels of one of the user's episodes, in order, with their drawings (Tasks 7.2, 7.4, 8.5; S1 (I10)).

- **Access:** Owner of the episode
- **Success:** `200 OK` with `{ "panels": [Panel, ...] }`, sorted by `order`. The list is empty (`[]`) when the episode has no panels.
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND` (episode), `500 INTERNAL_ERROR`

### POST /api/episodes/:episodeId/panels

Adds a new panel at the end of an episode (Tasks 7.1, 7.2).

- **Access:** Owner of the episode
- **Request body:**

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `height` | number | Yes | 200–2400 (D9; S3 (I10)) |

  ```json
  { "height": 1200 }
  ```

- **The new panel** has width 800, the next `order` (1 for an episode's first panel), a scene with one empty layer, `version` 0, no reference images and `rendered: null` (Task 7.1).
- **Success:** `201 Created` with `{ "panel": Panel }`
- **Errors:** `400 VALIDATION_ERROR` (height missing or outside 200–2400), `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND` (episode), `413 PAYLOAD_TOO_LARGE`, `500 INTERNAL_ERROR`

### PATCH /api/panels/:panelId

Changes a panel's height (Tasks 7.1, 7.2).

- **Access:** Owner
- **Request body:**

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `height` | number | Yes | 200–2400 (D9) |

- **It changes only the height.** The drawing and `version` stay the same; `version` changes only when a drawing is saved (data model).
- **Success:** `200 OK` with `{ "panel": Panel }`, showing the updated panel.
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `413 PAYLOAD_TOO_LARGE`, `500 INTERNAL_ERROR`

### PUT /api/episodes/:episodeId/panels/order

Puts the panels of an episode in a new order. The rules are the same as for [reordering episodes](#put-apiseriesseriesidepisodesorder) (Tasks 7.1, 7.2; S5 (I10)).

- **Access:** Owner of the episode
- **Request body:**

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `panelIds` | array of strings | Yes | Must contain every panel of the episode exactly once, and nothing else |

  ```json
  { "panelIds": ["6731a1c2d3e4f5a6b7c8d9e0", "6731a0b1c2d3e4f5a6b7c8d9"] }
  ```

- **Numbering rule:** the panels are renumbered by their new positions: the first in `panelIds` becomes 1, the second 2, and so on (S5 (I10)). Any gaps left by deleted panels close.
- **Success:** `200 OK` with `{ "panels": [Panel, ...] }` in the new order, each with its final `order`.
- **Errors:** `400 VALIDATION_ERROR` (including a list that is missing a panel, repeats one, or includes one from another episode), `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND` (episode), `413 PAYLOAD_TOO_LARGE`, `500 INTERNAL_ERROR`

### DELETE /api/panels/:panelId

Deletes a panel (Task 7.1). Its images are cleaned up afterwards, only if nothing else still uses them (Task 7.21, D15).

- **Access:** Owner
- **Other panels keep their numbers** (S6 (I10)). For example, deleting panel 2 of 1, 2, 3 leaves 1 and 3, and the next new panel is 4.
- **Success:** `204 No Content`
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `500 INTERNAL_ERROR`

## Reference images

### POST /api/panels/:panelId/references

Uploads one reference image to a panel, through the backend (Tasks 7.18, 7.19).

- **Access:** Owner
- **Request:** `multipart/form-data` with one file in the field `image`: PNG, JPEG or WebP, at most **5 MB** (see [Size limits](#size-limits)).
- **What the server does:**
  1. It uploads the image to Cloudinary, in the user's `references` folder (Task 7.16).
  2. It adds the image to the panel's `referenceImages`.
  3. If step 2 fails, it deletes the image it just uploaded, so nothing is left behind, and answers `500 INTERNAL_ERROR` (Task 7.19, D15).
- **The drawing is not changed.** To use the image, the editor adds an image shape with this `referenceId` and saves the drawing.
- **Success:** `201 Created` with `{ id, url }` (Task 7.19). `id` is the reference id.

  ```json
  { "id": "6731a2c3d4e5f6a7b8c9d0e1", "url": "https://res.cloudinary.com/example/image/upload/v1/toonverse/dev/users/6730f1a2b3c4d5e6f7a8b9c0/references/sketch.png" }
  ```

- **Errors:** `400 VALIDATION_ERROR` (no `image` file, or more than one file), `400 INVALID_FILE_TYPE`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND` (panel), `413 FILE_TOO_LARGE`, `500 INTERNAL_ERROR`

### DELETE /api/panels/:panelId/references/:referenceId

Removes a reference image from a panel (Task 7.20).

- **Access:** Owner
- **What the server does:**
  1. It removes the reference from the panel's `referenceImages`.
  2. It deletes the Cloudinary image only if no other record still uses it. The check (`deleteImageIfUnreferenced`, Task 7.21, D15) searches every panel's `referenceImages` and `rendered` images, and any later field that stores an image, so an image shared with another panel is kept.
- **The server does not change the saved drawing or `version`.**
- **What the editor does first (S7 (iii), I10):**
  1. It removes every image shape whose `referenceId` is this reference.
  2. It saves the drawing with [PUT /api/panels/:panelId/scene](#put-apipanelspanelidscene).
  3. Only then does it call this route.

  So the image disappears from the drawing, and no saved drawing points to a deleted file. This is the editor's job (Task 7.23). The server does not check the drawing.
- **Success:** `204 No Content`
- **Errors:** `400 VALIDATION_ERROR` (either id), `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND` (panel, or a reference that is not on this panel), `500 INTERNAL_ERROR`

## Saving a drawing

### PUT /api/panels/:panelId/scene

Saves a panel's drawing without overwriting newer work (Tasks 8.1–8.3, D10). Manual save and auto-save both use this route.

- **Access:** Owner
- **Size limit:** the whole JSON body can be at most **2 MB** (Task 8.2). This is larger than the usual 1 MB, and it applies only to this route.
- **Request body:**

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `scene` | object | Yes | Must follow the scene rules below |
  | `version` | number | Yes | The panel version the editor loaded or last saved |

  ```json
  {
    "scene": {
      "formatVersion": 1,
      "width": 800,
      "height": 1200,
      "layers": [
        { "id": "layer-1", "name": "Layer 1", "visible": true, "locked": false, "opacity": 1, "shapes": [] }
      ]
    },
    "version": 3
  }
  ```

- **Scene format:** the whole saved scene must follow the scene format in `docs/data-model.md` (Scene, frozen by Task 6.3). The rules below are the API-level checks and limits from Task 8.2. They add to that format; they don't replace it.
- **Scene rules** (Task 8.2, D6):
  - The scene is an object with a `layers` array.
  - The number of layers is at most the user's limit: **10 on a free account, 20 on premium** (D6). Plan Task 11.4 adds the real per-plan limits.
  - Only these shape types are allowed: `stroke`, `bubble`, `text` and `image`.
  - Text is at most 500 characters.
- **Version check (D10, Task 8.1):**
  - The save succeeds only if `version` equals the panel's current version. The version then goes up by 1.
  - Otherwise the answer is `409 VERSION_CONFLICT` with `currentVersion` (see [Error codes in Part 2](#error-codes-in-part-2)), and nothing is saved.
  - The editor then shows the conflict dialog (Task 8.11).
- **A successful save also updates the episode's `lastSavedAt`** (Task 8.1). It does not change `rendered`, so the panel stays out of date until a new picture is uploaded.
- **Success:** `200 OK` with the new version and the save time (Task 8.3):

  ```json
  { "version": 4, "savedAt": "2026-11-13T10:15:00.000Z" }
  ```

- **Errors:** `400 VALIDATION_ERROR` (including a scene that breaks the rules above), `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `409 VERSION_CONFLICT`, `413 PAYLOAD_TOO_LARGE` (over 2 MB), `500 INTERNAL_ERROR`

## Preview

### GET /api/episodes/:episodeId/preview

Returns everything the Preview step needs in one call (Tasks 9.1, 9.2). It uses the saved server data only, never a browser recovery draft (D10).

- **Access:** Owner. Another user gets `404 NOT_FOUND` (Task 9.2).
- **Success:** `200 OK` with the episode, its series title, and its panels in order:

  ```json
  {
    "episode": {
      "id": "6730f3e6f7a8b9c0d1e2f3a4",
      "series": "6730f2c4d5e6f7a8b9c0d1e2",
      "creator": "6730f1a2b3c4d5e6f7a8b9c0",
      "number": 1,
      "title": "The First Night",
      "status": "draft",
      "publishedAt": null,
      "lastSavedAt": "2026-11-13T10:15:00.000Z",
      "createdAt": "2026-11-10T09:10:00.000Z",
      "updatedAt": "2026-11-13T10:15:00.000Z"
    },
    "seriesTitle": "Moonlit Bakery",
    "panels": [
      {
        "id": "6731a0b1c2d3e4f5a6b7c8d9",
        "order": 1,
        "width": 800,
        "height": 1200,
        "scene": {
          "formatVersion": 1,
          "width": 800,
          "height": 1200,
          "layers": [
            { "id": "layer-1", "name": "Layer 1", "visible": true, "locked": false, "opacity": 1, "shapes": [] }
          ]
        }
      }
    ]
  }
  ```

  | Field | Type | Notes |
  |---|---|---|
  | `episode` | [Episode](#episode) | |
  | `seriesTitle` | string | Title of the episode's series |
  | `panels` | array of `{ id, order, width, height, scene }` | Sorted by `order` (Task 9.1) |

- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `500 INTERNAL_ERROR`

## Publishing

Publishing takes three steps, all done by the Publish step in the browser (Task 10.5):
1. Save the drawings.
2. Render each panel from its saved server data, never from a recovery draft, and upload it with [POST /api/panels/:panelId/render](#post-apipanelspanelidrender) (D3, D10).
3. Call [POST /api/episodes/:episodeId/publish](#post-apiepisodesepisodeidpublish).

### POST /api/panels/:panelId/render

Uploads the rendered picture of one panel (Task 10.1).

- **Access:** Owner
- **Request:** `multipart/form-data` with:

  | Field | Type | Required | Rules |
  |---|---|---|---|
  | `image` | file | Yes | One file: PNG, JPEG or WebP, at most **5 MB** (I10) |
  | `sceneVersion` | number | Yes | The version of the saved drawing the picture was made from. A whole number from 0. |

- **Version check (S8 (I10)):** `sceneVersion` must equal the panel's current `version`. Otherwise the answer is `409 VERSION_CONFLICT` with `currentVersion`, and nothing is stored.
- **What the server does** (Task 10.1, D15):
  1. It checks `sceneVersion` when the request arrives. If it is already old, the answer is `409 VERSION_CONFLICT` and nothing is uploaded.
  2. It uploads the image to Cloudinary, in the episode's `rendered` folder.
  3. It saves `rendered` on the panel, with `version` set to `sceneVersion`, **only if the panel's `version` still equals `sceneVersion` at that moment**. This is one conditional database update, the same pattern as the drawing save (Task 8.1). If a newer drawing was saved during the upload, nothing is stored: the server deletes the image it just uploaded (D15) and answers `409 VERSION_CONFLICT` with `currentVersion`. An older image therefore never becomes the current image for a newer drawing.
  4. If the update fails for any other reason, the server also deletes the image it just uploaded (D15).
  5. It removes the panel's previous rendered image with the same check as above (`deleteImageIfUnreferenced`, Task 7.21), only if nothing else still uses it.
- **Step 3 was confirmed** by Shumail, with Nabila's agreement (I10).
- **Success:** `201 Created` with `{ url, version }` (G2 (I10)):

  ```json
  { "url": "https://res.cloudinary.com/example/image/upload/v1/toonverse/dev/episodes/6730f3e6f7a8b9c0d1e2f3a4/rendered/panel.png", "version": 4 }
  ```

- **Errors:** `400 VALIDATION_ERROR` (no `image` file, more than one file, or `sceneVersion` missing or not valid), `400 INVALID_FILE_TYPE`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `409 VERSION_CONFLICT`, `413 FILE_TOO_LARGE`, `500 INTERNAL_ERROR`

### POST /api/episodes/:episodeId/publish

Publishes an episode (Tasks 10.2, 10.4; D8).

- **Access:** Owner
- **Request body:** none
- **Checks** (S9 (I10)):

  | Check | When it fails |
  |---|---|
  | The episode has a title | `400 VALIDATION_ERROR`, with `title` in `details` |
  | The episode has at least one panel | `400 VALIDATION_ERROR`, with `panels` in `details` |
  | Every panel is up to date (`rendered.version` equals `version`) | `409 RENDER_OUTDATED` |

  - The two `400` checks come first. `details` lists every one of them that fails (I10).
  - The image check runs only when both pass (I10).
- **Plan wording:** plan Task 10.2 says every failure gives `409 RENDER_OUTDATED`. The team chose the table above instead (S9 (I10)), which matches the `400` test in Task 10.4.
- **On success:**
  - the status becomes `published`;
  - `publishedAt` is set only if it is empty, so it keeps the date of the first publish (Task 10.2).
- **Publishing again is allowed** (S10 (I10)). A published or unpublished episode can be published again, for example after edits (Task 10.15). The same checks apply.
- **Success:** `200 OK` with `{ "episode": Episode }` (G3 (I10))
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `409 RENDER_OUTDATED`, `500 INTERNAL_ERROR`

### POST /api/episodes/:episodeId/unpublish

Takes a published episode down (Tasks 10.3, 10.4; D8).

- **Access:** Owner. Admin unpublishing is in Part 3 (Task 009, D13).
- **Request body:** none
- **What happens:**
  - The status becomes `unpublished`, and the episode disappears from every public route.
  - Its panels, pictures and `publishedAt` are kept (Task 10.3, data model).
- **A draft** (never published) can't be unpublished: `400 VALIDATION_ERROR`, with `status` in `details` (S10, G3 (I10)).
- **An episode that is already unpublished** gives `200 OK`, unchanged (G3 (I10)).
- **Success:** `200 OK` with `{ "episode": Episode }` (G3 (I10))
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `500 INTERNAL_ERROR`

## Discover

### GET /api/discover

Lists published work for the public home page (Tasks 10.6, 10.9).

- **Access:** Public
- **Query values** (S11 (I10)):

  | Name | Type | Default | Rules |
  |---|---|---|---|
  | `page` | number | 1 | A whole number from 1 |
  | `limit` | number | 12 | A whole number from 1 to 24 (Task 10.6) |

- **What is listed (Task 10.6):**
  - only series with at least one published episode;
  - newest first, by their latest `publishedAt`.

  Drafts and unpublished episodes never appear and are never counted.
- **Success:** `200 OK` with `{ items, page, limit, hasMore }` (G4 (I10)):

  ```json
  {
    "items": [
      {
        "series": { "id": "6730f2c4d5e6f7a8b9c0d1e2", "title": "Moonlit Bakery", "description": "A baker who can only open her shop at night." },
        "creator": { "id": "6730f1a2b3c4d5e6f7a8b9c0", "name": "Ayesha Khan" },
        "latestEpisode": { "id": "6730f3e6f7a8b9c0d1e2f3a4", "number": 1, "title": "The First Night", "publishedAt": "2026-11-13T10:00:00.000Z" },
        "publishedCount": 1
      }
    ],
    "page": 1,
    "limit": 12,
    "hasMore": false
  }
  ```

  | Field | Type | Notes |
  |---|---|---|
  | `items` | array of [Discover items](#public-reader-objects) | `[]` when nothing is published |
  | `page`, `limit` | number | The values used |
  | `hasMore` | boolean | `true` when another page exists, for the "Load more" button (Task 10.9) |

- **Errors:** `400 VALIDATION_ERROR` (`page` or `limit` not valid), `400 INVALID_INPUT`, `500 INTERNAL_ERROR`

## Public reading

Anyone can read published episodes, including guests. These routes never show a draft or an unpublished episode, not even to its owner (D8, Task 10.7).

### GET /api/read/series/:seriesId

A series and its published episodes, for the series reader page (Tasks 10.7, 10.10).

- **Access:** Public
- **Success:** `200 OK` (G5 (I10)):

  ```json
  {
    "series": {
      "id": "6730f2c4d5e6f7a8b9c0d1e2",
      "title": "Moonlit Bakery",
      "description": "A baker who can only open her shop at night.",
      "creator": { "id": "6730f1a2b3c4d5e6f7a8b9c0", "name": "Ayesha Khan" }
    },
    "episodes": [
      { "id": "6730f3e6f7a8b9c0d1e2f3a4", "number": 1, "title": "The First Night", "publishedAt": "2026-11-13T10:00:00.000Z" }
    ]
  }
  ```

  - `episodes` lists only published episodes, in number order.
- **Not public:** a series with no published episode gives `404 NOT_FOUND`, exactly as if it did not exist (S12 (I10)).
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `404 NOT_FOUND`, `500 INTERNAL_ERROR`

### GET /api/read/episodes/:episodeId

One published episode, for the Reader view (Tasks 10.7, 10.11).

- **Access:** Public
- **Success:** `200 OK` (G5 (I10)):

  ```json
  {
    "episode": {
      "id": "6730f3e6f7a8b9c0d1e2f3a4",
      "series": "6730f2c4d5e6f7a8b9c0d1e2",
      "number": 1,
      "title": "The First Night",
      "publishedAt": "2026-11-13T10:00:00.000Z"
    },
    "images": [
      "https://res.cloudinary.com/example/image/upload/v1/toonverse/dev/episodes/6730f3e6f7a8b9c0d1e2f3a4/rendered/panel.png"
    ],
    "previousEpisodeId": null,
    "nextEpisodeId": null
  }
  ```

  | Field | Type | Notes |
  |---|---|---|
  | `episode` | `{ id, series, number, title, publishedAt }` | |
  | `images` | array of strings | The rendered image URLs of its panels, in panel order (Task 10.7) |
  | `previousEpisodeId`, `nextEpisodeId` | string or `null` | The nearest published episode before and after it in the same series, by number. Episodes that are not published are skipped. `null` at either end. |

- **Not public:** a draft or unpublished episode gives `404 NOT_FOUND` (Task 10.7).
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `404 NOT_FOUND`, `500 INTERNAL_ERROR`

## Favorites

A logged-in reader can save series as favorites (Task 10.12). Every favorite route needs a login.

### POST /api/favorites/:seriesId

Adds a series to the user's favorites.

- **Access:** Logged in
- **Request body:** none
- **The series must have at least one published episode.** Otherwise the answer is `404 NOT_FOUND` (Tasks 10.12, 10.13).
- **Adding it again is harmless** (S13 (I10)):
  - the reader still has one favorite for the series;
  - the answer is the same `200 OK`, with the original `createdAt` of the existing favorite (I10).
- **Success:** `200 OK` (S13, G6 (I10)):

  ```json
  { "favorite": { "series": "6730f2c4d5e6f7a8b9c0d1e2", "createdAt": "2026-11-13T11:00:00.000Z" } }
  ```

- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `404 NOT_FOUND`, `500 INTERNAL_ERROR`

### DELETE /api/favorites/:seriesId

Removes a series from the user's favorites.

- **Access:** Logged in
- **Success:** `204 No Content`. The answer is the same when the series was not a favorite (G6 (I10)).
- **A badly formatted `seriesId`** gives `400 VALIDATION_ERROR`, following Part 1's two-step id check (I8).
- **A valid `seriesId` for a series that does not exist** also gives `204 No Content` (I10). This is an exception to Part 1's rule that a valid id that does not exist gives `404 NOT_FOUND`. The route only removes the reader's own favorite record and does not look up the series, so repeating the request is always harmless.
- **Errors:** `400 VALIDATION_ERROR`, `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `500 INTERNAL_ERROR`

### GET /api/favorites

Lists the user's favorite series, for the Favorites page (Tasks 10.12, 10.14).

- **Access:** Logged in
- **What is listed** (S13 (I10)):
  - only series that still have at least one published episode;
  - newest favorite first.
- **Success:** `200 OK` with `{ "favorites": [ ... ] }` (G6 (I10)). Each item is a [Discover item](#public-reader-objects) with one extra field, `favoritedAt` (when the favorite was added). The list is empty (`[]`) when there are none.

  ```json
  {
    "favorites": [
      {
        "series": { "id": "6730f2c4d5e6f7a8b9c0d1e2", "title": "Moonlit Bakery", "description": "A baker who can only open her shop at night." },
        "creator": { "id": "6730f1a2b3c4d5e6f7a8b9c0", "name": "Ayesha Khan" },
        "latestEpisode": { "id": "6730f3e6f7a8b9c0d1e2f3a4", "number": 1, "title": "The First Night", "publishedAt": "2026-11-13T10:00:00.000Z" },
        "publishedCount": 1,
        "favoritedAt": "2026-11-13T11:00:00.000Z"
      }
    ]
  }
  ```

- **Errors:** `400 INVALID_INPUT`, `401 UNAUTHENTICATED`, `403 ACCOUNT_SUSPENDED`, `500 INTERNAL_ERROR`

## Part 2 follow-ups

None of these block Part 2. Each needs its own approval.

**Plan wording that differs from the decisions** (`docs/plan` changes only with the user's approval):
- **Task 8.2** still says 5 layers. D6 sets 10 on a free account and 20 on premium; this is already on the pending list in `docs/decisions.md`.
- **Task 10.2** says every publish failure gives `409 RENDER_OUTDATED`. The team chose `400 VALIDATION_ERROR` for a missing title or no panels (S9 (I10)).
- **Task 10.1** has no version check for rendered uploads. The team added `409 VERSION_CONFLICT` (S8 (I10)).

**Follow-up in `docs/data-model.md`** (Khadija's separate fix, R3 (I10)):
- Panel `order` starts at **1** (S4 (I10)). The data model still says "whole number from 0 (R)".

**For the editor** (Task 7.23): before deleting a reference image, remove its image shapes from the drawing and save (S7 (iii) (I10)).
