# KARDS Card Forge v1.3.0 Release Context

## Current truth

- Task class: complex external publication.
- Sole worktree: repository root, branch `main`, baseline `94e6b59a7479d6e965127a05ac4f3fb7deeab5e4`, aligned with `origin/main` before release edits.
- Published Release: `v1.3.0`, immutable candidate and annotated tag `8262f290ddf510143aab815fef3fc053da9f9ad4`.
- Version decision: `v1.3.0` because the candidate adds backward-compatible user-visible features and a large bilingual public sample/resource set.
- Candidate currently contains 25 modified tracked files and 159 untracked source/resource/record files after temporary browser snapshots were removed.
- No dependency changes are intended.

## Decisions and deviations

| Time | Evidence or decision | Impact |
| --- | --- | --- |
| 2026-07-22 | User requested audit, push, and a new Release. | External publication is authorized; force-push and history rewriting remain out of scope. |
| 2026-07-22 | Only one worktree exists and `main` equals `origin/main`. | No worktree integration workflow is required. |
| 2026-07-22 | Prior diagnosis found directory export permission is requested after asynchronous rendering. | Treat permission ordering as a release blocker and require a regression test. |
| 2026-07-22 | The previous Release established a code-only ZIP plus checksum contract. | Reuse that boundary and verify it against the new immutable candidate. |
| 2026-07-22 | Independent review found template-language provenance, generated-image identity, export permission ordering, startup readiness, and temporary snapshot gaps. | All five findings were repaired with focused regressions or live smoke evidence before full validation. |
| 2026-07-22 | Browser smoke loaded a Chinese template, refreshed it to English, then applied another sample's artwork and switched back to Chinese. | The untouched template localized correctly; the explicit artwork action cleared template ownership and prevented content overwrite. Console: 0 errors, 0 warnings. |
| 2026-07-22 | Final code review rejected the first-image hash bootstrap because a missing manifest could self-sign existing AVIF files. | Removed the fallback, added a missing-manifest regression, deleted the manifest, and re-downloaded all 69 images from the configured official source before regenerating hashes. Final code review: `APPROVE`. |
| 2026-07-22 | Final architecture review inspected the repaired trust bootstrap and current 69-entry manifest. | `CLEAR`; no remaining BLOCK or WATCH. |
| 2026-07-22 | Candidate `8262f290ddf510143aab815fef3fc053da9f9ad4` passed GitHub CI `29892787171` and Pages `29892787144`. | The published tag and Release were fixed to that SHA only after both workflows passed. |
| 2026-07-22 | Live Pages root, hashed JS entry, and `careless_talk.avif` returned HTTP 200. | Repository rename/base-path handling and the new bilingual resource path are publicly reachable. |
| 2026-07-22 | GitHub Release assets were downloaded fresh and expanded. | ZIP SHA-256 `768372f519cd4cd88dc7b38373efb813d5ecb736e4a07e5a69e8f6c6e9482609` matched `SHA256SUMS.txt`; 82 files expanded and every excluded path was absent. |

## Live process ownership

| Process | Owner | Command / resources | Log path | State |
| --- | --- | --- | --- | --- |
| Local preview | Primary agent | `npm run local -- --no-open`; port `5173` | `.runtime/local-ui.log` | Running; must remain reachable |
| Release validation | Primary agent | `npm run validate`; shared `dist/`, npm/Vite caches | `.runtime/releases/v1.3.0/validate-final.log` | Complete: 276 Vitest, 26 Python, typecheck/build/boundary passed |
| Pages-mode build | Primary agent | `npm run build` with `KARDS_GITHUB_PAGES=true`; shared `dist/` | `.runtime/releases/v1.3.0/pages-build.log` | Complete; standard dist restored and reverified |
| Release archive verification | Primary agent | code-only ZIP expansion, checksum, upload, and fresh download | `.runtime/releases/v1.3.0/` | Complete |

## Handoff

- Independent reviewers are read-only and must not edit files, start live servers, run the shared full validation, stage changes, create refs, or publish.
- The primary agent owns fixes, verification, commit, push, tag, Release, and final record reconciliation.

## Next step

None. Preserve the tag and Release on the immutable candidate; only this records-only closeout may advance `main`.
