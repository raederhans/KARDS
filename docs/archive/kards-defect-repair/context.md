# KARDS Defect Repair Context

## Starting Point

- Base branch: `main`
- Base commit: `8ae036ce641bee80f90f3fbb6a7e318754cadcf9`
- Worktree: `C:\Users\raede\.codex\worktrees\kards-defect-repair-20260709`
- Branch: `codex/kards-defect-repair`
- Starting checkout: clean; `main` matched `origin/main`.

## Confirmed Defects

- Publish workflows do not enforce the final artifact boundary check.
- Artwork decoding can race with export and reuse an old image.
- PDF scale changes page size as well as raster resolution.
- Project JSON embedded artwork bypasses decoded-pixel validation.
- Local-library read-modify-write can lose overlapping saves.
- Asset packs have per-file limits but no aggregate contract.
- Project/artwork file inputs are not reset after successful reads and omit
  `FileReader` error/abort handling.
- Numeric crop offsets from -4 through 4 are forced to zero.
- README/roadmap/security-scan state conflicts with the authorized v0.2.0 public
  reference-pack contract.
- Python calibration contracts are not reached by a named package/CI entry.

## Live Process Ownership

- Owner: root agent.
- Root agent alone starts, polls, retries, stops, and interprets baseline/full npm
  validation and Python contract commands.
- Logs: `.runtime/repair-logs/` inside this worktree.
- Subagents may perform static analysis and edit isolated file sets, but must not
  start or monitor the same live tests.

## Progress Notes

- 2026-07-09: created isolated worktree and repair branch from the clean v0.2.0
  publication closeout.
- 2026-07-09: baseline `npm run validate` passed: TypeScript, 15 Vitest files / 169
  tests, Vite production build, and the strict dist/reference-pack boundary check.
  Log: `.runtime/repair-logs/baseline-validate.out.log`.
- 2026-07-09: added regressions to five existing test files. The first targeted
  run failed in all intended areas: local-library lost update, six asset-pack
  resource contracts, scaled PDF page geometry, and the missing shared browser
  file/readiness APIs.
- 2026-07-09: implemented source-bound artwork readiness, embedded artwork
  byte/signature/pixel validation, reliable file reads/reset, fixed PDF page
  geometry, precise crop inputs, origin-wide library write locking, and bounded
  asset-pack manifests/counts/bytes/pixels/concurrency.
- 2026-07-09: first post-fix targeted verification passed 5 files / 49 tests;
  `npm run typecheck` and `npm run verify:private-tools` (13 Python tests)
  passed.
- 2026-07-09: independent review found late aggregate-budget checks, incomplete
  untrusted-manifest validation, normalize-before-validate project imports, and a
  deployment-entry contract gap. Each issue was repaired at its source and covered
  by existing or extended regression suites.
- 2026-07-09: the final targeted lane passed 6 files / 61 tests. The final
  `npm run validate` passed 16 Vitest files / 195 tests, 13 Python contract tests,
  TypeScript, Vite production build, and the exact `dist` boundary verifier.
- 2026-07-09: Pages-mode `npm run build` passed with the same verifier;
  `npm audit --audit-level=moderate` reported 0 vulnerabilities; `git diff
  --check` passed. No live validation process remains.
- 2026-07-09: public pack metadata was reduced to neutral ownership/use wording;
  authorization and release evidence remain an internal repository/build concern,
  with no additional public UI.
- 2026-07-09: three independent code, architecture, and verification reviewers
  returned `APPROVE`. Repair commit `fd953d9` was fast-forwarded into clean
  `main`, pushed to `origin/main`, and revalidated there with the same 195 Vitest,
  13 Python, TypeScript, build, and dist-verifier result.
- 2026-07-09: after push and post-merge validation, the temporary worktree and
  branch were removed. This task record moved from `docs/active/` to
  `docs/archive/` as the final closeout step.
