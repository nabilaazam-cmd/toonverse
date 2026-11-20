# Toonverse task instruction files

There is one file per Execution Plan task, 284 in total. Names follow `<global number>-<phase.task>-<short title>.md`. For example, `046-2.10-write-model-tests.md` is global Task 046, plan task 2.10.

- **Order:** work in global-number order, skipping every task marked `deferred (FYP 2)` or `deferred (later in FYP 1)` in `ALLOCATION.md` (Issue #19 D1, Issue #21). A `deferred (later in FYP 1)` task is done only when the next task needs it: Task 030 is done immediately before Task 076. If the next task depends on a `deferred (FYP 2)` task, or is an Issue #21 F2 task (mixed, manual-test, audit, E2E, deployment or release work), stop and ask the team to confirm its FYP 1/FYP 2 scope. Each file lists its prerequisites and the next task by global number.
- **How Claude uses them:** the `toonverse-task-runner` skill opens the right file. Ask "start Task 046", "continue", or "next task". All Git, push and merge steps follow the `toonverse-git-workflow` skill.
- **Where they come from:** `docs/plan/tasks-1.js` … `tasks-4.js`. The generator `.claude/skills/toonverse-task-runner/scripts/generate-task-files.ps1` creates missing files and never overwrites existing ones, so completion notes are safe.
- **If the plan changes:** with the user's approval, update the plan first, then edit or regenerate the affected task file.
- **Section 10 of each file** is filled in when the task ends, with the plain-language explanation, the Code Explained Simply section and the GitHub record.

## Existing GitHub Issues → plan tasks (mapping pending approval)

These issues were created by Nabila Azam on 2026-10-05, before the plan existed. They are linked to the plan tasks that cover the same work. **They do not change the execution order.** An issue's work is done only when its tasks come up in order.

| Issue (text on GitHub) | Assigned to | Plan tasks (global numbers) | When it can close | Notes |
|---|---|---|---|---|
| #3 setup data base — "initial database structure" | Khadija Gulzar | 0.6 data model document (006); 1.8 MongoDB databases (019); 1.9 connection module (020); Phase 2 models 2.1–2.12 (037–048) | When Task 048 (2.12) is merged into `develop`. This happens in FYP 2: Tasks 019–020 and 037–048 are deferred (Issue #19 D1) | Khadija's `database` branch becomes `feature/02-data-model` in Task 001 (pending approval). Task 2.2 waits for the I2 `aiUsage` decision. |
| #1 create login page UI — "email, password, login button, signup option" | Nabila Azam | 3.23 Register page (071) for "signup option"; 3.24 Login page (072) for email, password, login button | When Task 072 (3.24) is merged | In FYP 1, built against local mock data in `client/src/mocks/` (Issue #21 D8). The login API (Tasks 049–066, 3.1–3.18) is deferred to FYP 2. |
| #2 create home page UI — "basic home page UI" | Shumail Mirzaa | 10.9 Discover page, which is the home page `/` (180). Related earlier pieces: 1.16 temporary home placeholder (027), 3.22 app layout header (070) | When Task 180 (10.9) is merged | Shumail's `homepage` branch stays unchanged. Its migration is reviewed when she starts Task 180. The plan's branch for that work is `feature/10-publish-read`. |

**Proposed GitHub changes (not made; each needs approval and a confirmed account):**
1. Add one comment to each issue listing its plan tasks, global numbers and closing rule, as in the table. No title, body, assignee or state changes.
2. When the closing task's pull request is opened, put `Closes #N` in its description, so GitHub closes the issue on merge.
3. Labels: none now. Plan task 1.21 creates the `phase:NN` labels; adding them to these issues can be decided then.

Status: **proposed**. Nothing has been changed on GitHub.
