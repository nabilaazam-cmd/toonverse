# Toonverse contribution log

A record of each member's **actual** contributions, reviewed at every milestone (M1–M6). Planned owners are in `docs/tasks/ALLOCATION.md`; this file records what really happened.

## Rules
- Every entry comes from real records: the task tracker, pull requests (`gh pr list`), and commits on `develop` (`git shortlog -sne develop`, grouped by noreply email).
- Effort and responsibility count, not the number of commits. One careful commit on a hard task is worth more than many tiny ones.
- Shared or paired work lists each person's real part. Shared tasks are counted once, under their primary owner.
- Rebalancing affects **upcoming** tasks only, and only with the team's agreement and the user's approval.
- The review template is in `docs/git-workflow/templates.md` ("Milestone contribution review").

## Contributions so far (before milestone M1)

| Task | Primary owner | Actual contributions | GitHub record |
|---|---|---|---|
| 001 (0.1) Create the develop branch and the planning branch | Khadija Gulzar | **Khadija:** `.gitignore` whitespace fix, local branch rename, pushes of `feature/02-data-model` and `feature/00-planning`, deletion of the old `database` branch. **Nabila:** created `develop` from `main` and set it as the default branch (repository-owner step). | No commits (branch setup). Pushes by `khadijagulzar877-hub`; owner settings by `nabilaazam-cmd`. Completed 2026-10-16. |
| 002 (0.2) Review and commit the decision log | Khadija Gulzar | **Khadija:** reviewed and gave feedback on the decision log; committed, pushed, opened PR #4 and merged it. **Nabila:** reviewed and approved the log, then approved PR #4. **Shumail:** reviewed and approved the log. | Commit `b224ba6` by Khadija (noreply email). PR #4 approved by `nabilaazam-cmd`. Squash-merged into `develop` as `38fa38f` on 2026-10-27; GitHub set that commit's author email to Khadija's Gmail. Completed. |

| 003 (0.3) Confirm decisions D1–D5 in the log | Khadija Gulzar | **Khadija:** checked D1–D5 against the team's decisions and clarified D2 (PNG download for logged-in users through Preview & Export); committed, pushed, opened PR #5 and merged it. **Shumail:** reviewed and approved PR #5. | Commit `07846ed` by Khadija (noreply). PR #5 approved by `shumailmizaa-ops`. Squash-merged into `develop` as `d6f04d8` on 2026-10-27, author Khadija's noreply address (verified). Completed. |

| 004 (0.4) Confirm decisions D6–D11 in the log | Khadija Gulzar | **Khadija:** verified D6–D11: fields, affected tasks, consistency between D6 and D11, pending items. Verification only; no change was needed. | No commit, PR or merge: nothing needed changing, and empty commits are not allowed. Completed 2026-10-27. |

| 005 (0.5) Confirm D12–D15 and the supporting libraries | Khadija Gulzar | **Khadija:** reviewed the supporting libraries and checked compatibility; recorded the team decisions in the decision log; committed, pushed, opened PR #6 and merged it. **Nabila:** reviewed and approved PR #6. **Khadija, Nabila, Shumail:** agreed to the library decisions (reported 2026-10-27). | Commit `35637f9` by Khadija (noreply). PR #6 approved by `nabilaazam-cmd`. Squash-merged into `develop` as `7be2d97` on 2026-10-28, author Khadija's noreply address (verified). Completed. |

| 006 (0.6) Write the data model document | Khadija Gulzar | **Khadija:** wrote `docs/data-model.md` (7 collections, fields, references, indexes with reasons, Decisions A and B left pending as options) and recorded the confirmed D7 prices in the decision log; committed, pushed, opened PR #7 and merged it. **Shumail:** reviewed and approved PR #7. **Khadija, Nabila, Shumail:** confirmed the D7 prices (reported 2026-10-29). | Commit `9e5e5c9` by Khadija (noreply). PR #7 approved by `shumailmizaa-ops`. Squash-merged into `develop` as `4875a37` on 2026-10-29, author Khadija's noreply address (verified). Completed. |

| 007 (0.7) Write the API contract: auth, users, series, episodes, notes | Nabila Azam | **Nabila:** made the API contract decisions on Issue #8 (1b, 2a, 3a, items 4–13, Note object, password rule, reordering). The commit, push, PR #9 and merge were done from her GitHub account on the shared laptop, with approval in this session. **Khadija:** reviewed and approved PR #9. **AI assistance:** Claude drafted the text of `docs/api.md`; Nabila provided and approved the decisions applied in it. | Commit `92063b3` authored under Nabila's identity (noreply), with Claude credited as co-author. PR #9 approved by `khadijagulzar877-hub`. Squash-merged into `develop` as `0a316c0` on 2026-11-11, author Nabila's noreply address (verified). Completed. |

| 008 (0.8) Write the API contract: panels, uploads, save, preview, publish, reader, favorites | Shumail Mirzaa | **Shumail:** made the Part 2 decisions on Issue #10 (S1–S13 with S7 (iii), R2, R3, G2–G6, points 1–6, and the written-out G5 reader shapes). The commit, push, PR #11 and merge were done from his GitHub account on the shared laptop, with approval in this session. **Nabila:** agreed to G1 (b), R1 (b), S9 (a), the 5 MB rendered-image limit and points 2, 3 and 7 on Issue #10; reviewed and approved PR #11. **AI assistance:** Claude drafted the text of Part 2 of `docs/api.md`; Shumail provided and approved the decisions applied in it. | Commit `7c9a573` authored under Shumail's identity (noreply), with Claude credited as co-author. PR #11 approved by `nabilaazam-cmd`. Squash-merged into `develop` as `40e3cf1` on 2026-11-13, author Shumail's noreply address (verified). Completed. |

| 009 (0.9) Write the API contract: AI, premium, payments, admin | Nabila Azam | **Nabila:** made the Part 3 decisions on Issue #12: Q1–Q10, open items 4 and 5 (her decisions as owner), and open items 1–3 and 6–10 (item 8 as Option C). The commits, push, PR #13 and merge were done from her GitHub account on the shared laptop. **Shumail:** approved Q1–Q10 and open items 1–3 and 6–10 on Issue #12; reviewed and approved PR #13. **Khadija:** approved Q1–Q10 and open items 1–3 and 6–10 on Issue #12. **AI assistance:** Claude drafted the text of Part 3 of `docs/api.md`; Nabila provided and approved the decisions applied in it. | Commits `45918f5` (with Claude credited as co-author) and `e927087` (no co-author line), both authored under Nabila's identity (noreply). PR #13 approved by `shumailmizaa-ops` on both commits, the last on `e927087`. Squash-merged into `develop` as `1606893` on 2026-11-14, author Nabila's noreply address (verified), with no co-author line. Completed. |

Earlier activity, before the plan existed:
- **Nabila:** initial repository commit, and GitHub Issues #1–#3.
- **Khadija:** commit `00749ed` ("add gitignore").
- **Shumail:** created the `homepage` branch.

## Milestone reviews

None yet. The first review is due at milestone M1 (v0.1.0, end of Phase 2 / Task 048).
