# KARDS Defect Repair Plan

## Goal

Close the confirmed v0.2.0 correctness, resource-boundary, release-gate, and
documentation-contract defects without changing the React + TypeScript + Canvas
static architecture or adding public authorization UI.

## Scope

1. Bind decoded artwork identity to the current card before export.
2. Validate embedded project artwork with the existing byte/signature/pixel gates.
3. Keep PDF physical page size stable across raster export scales.
4. Serialize local-library saves and detect overlapping writes.
5. Bound asset-pack manifest size, entry counts, aggregate bytes, duplicate paths,
   and URL-load concurrency.
6. Reset file inputs after every import attempt and surface read failures.
7. Remove the numeric crop dead zone while preserving deliberate pointer behavior.
8. Make publish builds verify the exact `dist` artifact they upload.
9. Align repository release/authorization documentation with the authorized public
   reference-pack allowlist, without adding public UI.
10. Connect the Python calibration contract test to a named validation entry.

## Execution

- Phase 1: record clean baseline and add failing regression tests.
- Phase 2: implement import, artwork/export, PDF, and crop fixes.
- Phase 3: implement local-library and asset-pack resource/concurrency fixes.
- Phase 4: repair Pages/Vercel publish gates and internal documentation contracts.
- Phase 5: run targeted tests, full validation, Python contracts, audit, diff checks,
  and independent code/architecture review.
- Phase 6: commit with Lore trailers, merge into `main`, revalidate, push, and clean
  the worktree.

## Acceptance Criteria

- Every behavior fix has a regression test observed failing before implementation.
- `npm run validate` passes.
- The named Python contract entry passes and is reachable from CI validation.
- `npm audit --audit-level=moderate` reports no moderate-or-higher advisories.
- Pages and Vercel publish commands run the boundary check against their own `dist`.
- Independent reviewer returns `APPROVE` and architect returns `CLEAR` or all raised
  issues are repaired and re-reviewed.
- `main` is clean, contains the repair commit, matches `origin/main`, and the
  temporary worktree is removed after successful integration.
