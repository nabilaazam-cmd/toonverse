---
name: toonverse-task-runner
description: Runs one Toonverse Execution Plan task from start to finish using that task's dedicated instruction file in docs/tasks/. Use whenever the user asks to start, continue, plan, implement, test, explain or complete a Toonverse task, says "next task" or "continue", or names a task number (e.g. "Task 046" or "task 2.10"). Works together with toonverse-git-workflow, which owns all Git identity, push, pull request and merge gates.
---

# Toonverse Task Runner

Every plan task has its own instruction file: `docs/tasks/<NNN>-<phase.task>-<slug>.md`. Examples are `001-0.1-…md` and `046-2.10-…md`. Each file holds that task's identification, purpose, planning, steps, files, tests, GitHub workflow, completion criteria, documentation and completion record.

**This skill decides *what* to do for a task. `toonverse-git-workflow` decides *how* it reaches GitHub.** Load both. If they disagree, the stricter rule wins, and you tell the user.

## How the right task file is found
1. **The user names a task.** Use `docs/tasks/<NNN>-*.md` for a global number, or `docs/tasks/*-<phase.task>-*.md` for a phase ID.
2. **The user says "next" or "continue".** Read the tracker (ArtifactData `list`, collection `status`, page https://claude.ai/artifact/XHrCTjLsH7cwvZGdThPFL1). Take the lowest-numbered task that is not `done` and whose prerequisites are all `done`. Never start a later task because a GitHub Issue is assigned to it; issue links are listed in `docs/tasks/README.md`.
3. **The task file is missing.** Run the generator, which never overwrites existing files:
   ```
   powershell -ExecutionPolicy Bypass -File .claude/skills/toonverse-task-runner/scripts/generate-task-files.ps1
   ```
4. **The task file and `docs/plan` disagree.** Stop and ask. The plan is the source of truth, and it changes only with the user's approval.

## Procedure for every task

Follow the task file's sections in order. Add these rules on top.

**At the start (before any change)**
1. Show the task number, name, phase, prerequisites, and the **planned owner from `docs/tasks/ALLOCATION.md`**. That file is the single source of truth for owners.
2. **Confirm the GitHub account.** Ask: "Which GitHub account will be used for Task NNN: Khadija Gulzar (`khadijagulzar877-hub`), Nabila Azam (`nabilaazam-cmd`) or Shumail Mirzaa (`shumailmizaa-ops`)?"
   - The planned owner is not authorization to push.
   - If the answer differs from the planned owner, ask whether the team agreed to the change, and record it.
   - Never reuse an account confirmed for another task.
   - Never switch accounts, change Git identity or change authentication without approval for that step.
3. Do the pre-task planning in section 3. Stop and ask about any unresolved decision. The current list is the "Pending decisions" table in `docs/decisions.md`. For example:
   - the exact `aiUsage` schema and reset rule (before Task 2.2);
   - the final D7 prices (before Task 11.1);
   - the layout/template scope (D6);
   - libraries not yet approved in Task 0.5.
4. Explain the plan in simple words, then wait for approval to begin.
5. Set the tracker doc `status/t<NNN>`: `s: "doing"`, `state: "in progress"`, `owner` (planned) and `contributors` (who is actually working). Use the field list in `docs/git-workflow/templates.md`.

**While working**
6. Follow section 4 and `docs/coding-standards.md`. Write simple, readable code a 7th-semester student can explain in a viva, with no unapproved libraries and no unnecessary layers.
7. If the task seems to need extra complexity or a new dependency, stop first. Explain why, offer the simpler alternative and the trade-offs, and ask for approval.

**Testing**
8. Run section 6's checks and every existing test and lint for regressions. Report real output only.

**Before any Git operation** (gates C, D and E in `toonverse-git-workflow`)
9. Show the combined approval request from `docs/git-workflow/templates.md`:
   - the changes and diff, the test results, and any risks;
   - the proposed commit message;
   - the current branch, the target branch, and whether a new remote branch is created;
   - the commit author, the **recommended account** (the planned owner) and the PR reviewer.
10. Ask exactly: **"Do you approve committing, pushing, and merging these changes using [member's name / GitHub username]?"**
    - After a yes, commit, push, open the PR and merge without asking again.
    - Preflight still runs before the commit and before the push.
    - The merge still waits for a genuine approving review from another member's own account.
    - If any check fails, a conflict appears, or anything is unexpected, stop and ask.

**At the end**
11. Run the end-of-task checkpoint from `templates.md`.
    - Label the task **locally complete** if it isn't pushed and merged yet; never call that "complete".
    - Mark `done` only when every completion criterion holds and the code is merged into `develop`.
12. Give the user the **plain-language explanation** and the **Code Explained Simply** section (templates in `templates.md`). Copy both into section 10 of the task file.
13. Update the tracker (`stage: "locally complete"` or `s: "done"`) and any documents the task changed. Then name the next task and its prerequisites, and stop until the user says to continue.

## Fair, genuine contribution
- **Ownership:** at task start, show the planned owner from `docs/tasks/ALLOCATION.md`, then confirm the GitHub account.
  - An owner changes only with the team's agreement, and the change is recorded in `ALLOCATION.md` with the user's approval.
  - Never reassign an in-progress task without checking its status and discussing it.
- **Honest commits:** every commit is real work by its listed author.
  - Never switch authors, commit for someone else, make empty commits, split changes artificially, or follow commit quotas.
  - Commit at natural points: a finished piece of a feature, a fix, tests, documentation.
- **Real pair work:** add `Co-authored-by: <Name> <noreply email>` for the second member so GitHub credits both, only when both genuinely contributed. Record each person's part in the tracker `contributors` field and in the task file's completion record.
- **Reviews:** the pull request reviewer is a different member from the author, rotating among the three. Record the reviewer in the tracker.
- **Shared tasks** (001, 14.12, 14.13): one primary owner is counted, and every contributor's part is recorded.
- **Milestone review:** at each milestone (M1–M6), fill in `docs/contributions.md` using the template in `docs/git-workflow/templates.md`.
  - Propose rebalancing of *upcoming* tasks only, for the user's approval.
  - Judge effort and responsibility, not commit counts.

## Rules that never bend
- Follow the plan's order: phase order and global number order.
- Never mark a task complete without its tests passing.
- Never claim something works, was pushed, or was changed unless it was verified.
- Never commit, push, merge, rename or delete a branch, or change repository settings outside an approval's exact scope.
- Repository-owner settings are done by Nabila Azam herself, or by someone she explicitly authorizes.
