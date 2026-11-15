# Toonverse AI assistant policy

The rules the Toonverse AI assistant follows. Developers use this document to build the assistant, and plan task 5.7 turns it into the system prompt.

- **Status:** written for Task 010 (plan 0.10), 2026-11-15; updated after the team's final review the same day. Owner: Shumail Mirzaa.
- **Sources:** `docs/decisions.md` (D6, D11), `docs/architecture.html`, `docs/roadmap.html` (D11 row), `docs/api.md` Part 3, `docs/data-model.md` (User, Decision A), the Execution Plan (Tasks 5.6–5.18), and the decisions recorded on GitHub Issues #12 and #15.
- **If this file and the decision log disagree,** the decision log wins. Tell the team, then fix this file.

## How to read this document

| Label | Meaning |
|---|---|
| *(no label)* | From the decision log, the Execution Plan or `docs/api.md`. |
| **(I12)** | Decided on GitHub Issue #12 (Task 009). |
| **(I15)** | Decided on GitHub Issue #15 (Task 010): Shumail's answers and clarifications for Q1–Q7, approved by Khadija and Nabila on 2026-11-15. |
| **(TR)** | Approved in the team's final review of this policy on 2026-11-15, and recorded on GitHub Issue #15: Shumail's "Final team review decisions" comment, approved by Khadija and Nabila. See [Team review decisions](#team-review-decisions). |
| **PENDING** | Not decided. Listed again under [Pending decisions](#pending-decisions). Do not build it until it is decided. |
| **Needs separate approval** | Agreed as a policy rule, but it changes `docs/api.md` or `docs/data-model.md`. Those documents must be updated and approved first. Listed under [Changes that need separate approval](#changes-that-need-separate-approval). |

## Contents
1. [Purpose and scope](#purpose-and-scope)
2. [Allowed and refused assistance](#allowed-and-refused-assistance)
3. [Input and output limits](#input-and-output-limits)
4. [Content moderation](#content-moderation)
5. [Daily quota and rate limit](#daily-quota-and-rate-limit)
6. [Quota handling and errors](#quota-handling-and-errors)
7. [Privacy and data handling](#privacy-and-data-handling)
8. [Notices and labels in the interface](#notices-and-labels-in-the-interface)
9. [Language and response style](#language-and-response-style)
10. [Model configuration and testing](#model-configuration-and-testing)
11. [Spending limit](#spending-limit)
12. [Pending decisions](#pending-decisions)
13. [Changes that need separate approval](#changes-that-need-separate-approval)
14. [Team review decisions](#team-review-decisions)

## Purpose and scope

**The AI is an assistant only** (D11, `docs/architecture.html`). It helps creators with their own episodes. It suggests and organises; the creator writes the story and draws the artwork.

- It is available to logged-in creators, for their own episodes only, through four routes in `docs/api.md` Part 3: `POST /api/ai/notes`, `/api/ai/organize`, `/api/ai/panel-plan` and `/api/ai/dialogue`.
- Every answer is a suggestion. The creator decides whether to use it.
- The OpenAI API key stays on the server and never appears in frontend code (D11).

## Allowed and refused assistance

### Allowed

| Help | Rule |
|---|---|
| Episode notes | Help improve the creator's notes (D11). |
| Organising ideas | Help organise the creator's ideas (D11). |
| Panel planning | Allowed, **at most 10 panels per request** (I15). |
| Dialogue suggestions | Allowed for **one panel or moment at a time**, with **at most 3 alternatives** (I15). Three alternatives means up to three different versions of the dialogue for that one panel or moment, not three dialogue lines. |
| Rewriting the creator's notes | **Suggestions only** (I15). Keep the creator's original meaning and **do not invent new plot events**. |

### Refused

| Request | Rule |
|---|---|
| Complete episodes | Refused (D11). |
| Complete stories | Refused (D11). |
| Finished artwork | Refused, and the assistant never describes generating artwork (D11, Task 5.7). |
| "Continue this scene" | Refused (I15). |

**How a refusal works:** the assistant does not produce the content. It answers with guidance on what it can help with instead. The API answer is `200 OK`, with the guidance in `suggestion` (Task 5.9, `docs/api.md` Part 3). There is no error code for a refusal.

## Input and output limits

| Limit | Rule | Source |
|---|---|---|
| Input field | `text`, in the body of every AI request, with the creator's own `episodeId` | `docs/api.md` Part 3 (I12) |
| Input length | Must not be empty after trimming. Longer text is accepted, but **only the first 6,000 characters** are used | Task 5.7 (I12) |
| How input is sent | The creator's text is wrapped in clear delimiters in the prompt | Task 5.7 |
| Output length | **At most 600 tokens** per answer | Task 5.8 |
| Answer format | `{ suggestion, remaining }`: the suggestion text and the requests left today | Task 5.11, `docs/api.md` Part 3 |

## Content moderation

Agreed rules (I15):
- Moderation is used **together with** the rules in the system prompt.
- **Input** is checked before it is sent to the AI model.
- **Generated output** is checked before it is shown to the user.
- A moderation refusal uses the existing **`200 OK` guidance answer**.
- **Refusal guidance:** English and Urdu templates must be written and tested.

Not decided:
- **Moderation provider: PENDING.** The OpenAI Moderation API is the first technical option to evaluate, called through the OpenAI integration planned in Task 5.6. It is **not approved** until the team has reviewed its cost, the categories it checks and its implementation (I15).
- **Other languages: PENDING.** Support for users writing in languages other than English and Urdu, including the fallback language for refusal guidance, is not decided (I15).

Adding the moderation steps to the request flow changes `docs/api.md` Part 3. **Needs separate approval**; see [Changes that need separate approval](#changes-that-need-separate-approval).

## Daily quota and rate limit

| Limit | Rule | Source |
|---|---|---|
| Free accounts | **15 AI requests a day**. D11 takes priority over older plan wording that says 10 (TR) | D6, D11 |
| Premium accounts | **50 AI requests a day** | D6, D11 |
| What "a day" means | A day in **Pakistan time**, an approved decision. The counter resets at midnight in Pakistan (UTC+5, no daylight-saving time) | I12 (Q1), TR |
| Burst limit | **At most 5 AI requests a minute** per user. It applies to every request | Task 5.12 (I12), I15 |
| Who enforces it | The server. The backend applies the user's limit from their premium status and refuses any request over it | D11 |
| Counter | `aiUsage: { date, count }` on the User, per user | D11, `docs/data-model.md` |

The limit numbers come from the server's premium configuration (Task 11.1), never from the client.

## Quota handling and errors

### Errors

| Situation | Answer | Source |
|---|---|---|
| Daily quota used up | `429 AI_QUOTA_EXCEEDED`, with `resetAt` (the next midnight in Pakistan, as an ISO 8601 date in UTC) | Task 5.10, `docs/api.md` Part 3 (I12) |
| More than 5 requests in one minute | `429 RATE_LIMITED` | Task 5.12 (I12) |
| OpenAI does not answer within 30 seconds | `504 AI_TIMEOUT` | Tasks 5.6, 5.8 |
| OpenAI answers "too many requests" | `503 AI_BUSY` | Task 5.8 |
| Any other OpenAI failure | `502 AI_ERROR` | Task 5.8 |
| A request the policy does not allow | `200 OK`, with guidance in `suggestion` | Task 5.9 |

### What counts toward the daily quota

| Outcome | Counts toward the daily quota? | Why | Source |
|---|---|---|---|
| Input moderation refusal | **No** | The AI model is not called | I15 |
| Model-generated refusal (the model answers with guidance, for example for "continue this scene") | **Yes** | The model call was successful | TR |
| Output moderation refusal | **Yes** | The AI model has already been called | I15 |
| Failed model call: `502 AI_ERROR`, `503 AI_BUSY` or `504 AI_TIMEOUT` | **No:** the request is given back (refunded) | The model call failed | I15 |
| Successful suggestion | **Yes** | The normal case | Task 5.10 |

The **5 requests a minute** limit still applies to every request, including refused ones (I15).

These rules are not yet in `docs/api.md` Part 3, and Task 5.10 describes a single increment with no refund. **Needs separate approval** before implementation; see [Changes that need separate approval](#changes-that-need-separate-approval).

## Privacy and data handling

Agreed rules (I15):
- AI prompts and AI answers are **never stored in MongoDB**.
- Prompt and answer text **never appears in server logs**.
- **`aiUsage`** stays the per-user daily quota counter.

Not decided:
- **Aggregate monthly counter: PENDING.** If the team separately approves a monthly spending limit, a separate aggregate monthly usage or cost counter may be needed. It must not contain prompts, answers or personal content. Its storage location, calculation, and reset time and time zone are not decided. It is **not** an approved data-model change.

## Notices and labels in the interface

| Rule | Source |
|---|---|
| Every suggestion is labelled **"AI suggestion: edit before using"** | Task 5.15 |
| The suggestion panel offers Copy, Insert and Dismiss, with clear messages for timeout, busy and quota (with the remaining count) | Task 5.15 |
| **Insert never replaces** the creator's existing text; it adds the suggestion at the cursor | Task 5.16 |
| Dialogue suggestions are **copied into a speech bubble by hand** by the creator (direct insert into a bubble is backlog task 7.26) | Task 5.17 |
| A short privacy notice is shown next to the AI buttons; its exact text is below | I15 |

> Text you submit is sent to OpenAI to generate AI suggestions. Avoid including personal or sensitive information.

## Language and response style

Agreed rules (I15):
- AI answers use **the user's language**.
- The tone is **friendly, concise and respectful**.
- This applies to AI-generated answers. **Moderation refusal guidance** follows the language support described in [Content moderation](#content-moderation): English and Urdu templates, other languages PENDING.
- The language of interface labels and of technical error messages is **unchanged**. This policy does not change it.

## Model configuration and testing

Agreed rules (I15):
- The **`OPENAI_MODEL`** environment value configures the model (Task 5.6).
- The **starting model is chosen and approved by the team after testing.**
- **Before the model is changed,** the new model must pass tests against this policy's allowed and refused examples, like the Task 5.9 check.

Not decided:
- **The starting model: PENDING.** No model is chosen yet.

Existing tests that use this policy:
- Task 5.9: one panel-plan request prints a suggestion, and "write the whole episode for me" returns guidance instead.
- Task 5.18: each of the four features works, a full story is declined, the quota is reached, the remaining counts are right, and the key is not in the built client (`dist/`).

## Spending limit

Everything about a monthly spending limit is **PENDING** (I15). Do not build a spending limit or invent a budget.

| Question | Status |
|---|---|
| Who owns the OpenAI account and pays the bill | **PENDING**: to be confirmed by the authorized project or budget owner |
| The exact monthly budget | **PENDING** |
| Whether a server-side monthly spending limit is adopted | **PENDING** (a proposal to evaluate) |
| How monthly spending is calculated, stored and reset | **PENDING** |
| What the server does and what the API answers when the limit is reached | **PENDING** |

The proposal to evaluate (I15): if a server-side monthly limit is adopted and reached, new AI requests are blocked until the next month, and the interface shows guidance. The current API contract does not define a dedicated monthly-limit answer.

## Pending decisions

None of these is decided. Each needs the team's answer before it is built.

| # | Decision | Where it is described |
|---|---|---|
| 1 | Who owns the OpenAI account and pays the bill | [Spending limit](#spending-limit) |
| 2 | The exact monthly budget | [Spending limit](#spending-limit) |
| 3 | Whether a server-side monthly spending limit is adopted | [Spending limit](#spending-limit) |
| 4 | How monthly spending is calculated, stored and reset, including the time zone | [Spending limit](#spending-limit), [Privacy](#privacy-and-data-handling) |
| 5 | The status, error code and message when the spending limit is reached | [Spending limit](#spending-limit) |
| 6 | The moderation provider and its implementation (the OpenAI Moderation API is the first option to evaluate) | [Content moderation](#content-moderation) |
| 7 | Refusal guidance for languages other than English and Urdu, including the fallback language | [Content moderation](#content-moderation) |
| 8 | The starting OpenAI model | [Model configuration](#model-configuration-and-testing) |

## Changes that need separate approval

Issue #15 states: "No API contract or data-model changes are authorized by this comment." This policy changes neither document. Before the rules below are implemented, these changes must be made and approved separately.

**API contract (`docs/api.md` Part 3, and the related plan tasks):**
1. **Monthly limit reached:** a dedicated answer (status, error code, message), only if a spending limit is adopted. Task 5.8 currently maps every OpenAI "too many requests" answer to `503 AI_BUSY`.
2. **Quota refund:** state that `502`, `503` and `504` are given back. Task 5.10 currently describes a single increment.
3. **Order of checks:** Part 3's order (login, episode, body rules, daily quota) has no moderation step. Input moderation before the quota, and output moderation after the model call, change that order.
4. **Quota rule for refusals:** state that input moderation refusals do not count, and that output moderation refusals and model-generated refusals do (TR).

**Data model (`docs/data-model.md`):**

5. **Aggregate monthly usage or cost counter:** only if a monthly spending limit is approved. It must hold no prompts, answers or personal content.

Adding a moderation provider or any new package also needs approval under the team's library rules (`docs/decisions.md`, "Supporting libraries").

## Team review decisions

The team reviewed the three differences found while writing this policy and approved the following on 2026-11-15 (TR). They are no longer open. They are recorded on Issue #15 (Shumail's "Final team review decisions" comment, approved by Khadija and Nabila).

| # | Decision | Documentation follow-up (separate, not done here) |
|---|---|---|
| 1 | **The free daily quota is 15 AI requests.** D11 takes priority over older plan wording that says 10. | Plan tasks 5.6 (`AI_DAILY_LIMIT_FREE=10`), 5.10 and 11.5 still say 10. Updating them needs the user's approval (`docs/plan`); the update is already listed in `docs/decisions.md` and `docs/api.md` Part 3. |
| 2 | **The `aiUsage` daily quota uses Pakistan time.** This was decided on Issue #12 (Q1). | `docs/data-model.md` still lists the `aiUsage` time zone (Decision A) as pending. Updating it is Khadija's follow-up. |
| 3 | **Model-generated refusals use the daily quota,** because the model call was successful. With the I15 rules: input moderation refusals do not count, output moderation refusals count, and `502`, `503` and `504` are refunded. See [What counts toward the daily quota](#what-counts-toward-the-daily-quota). | Stating the quota rules in `docs/api.md` Part 3 is part of the API changes listed under [Changes that need separate approval](#changes-that-need-separate-approval). |
