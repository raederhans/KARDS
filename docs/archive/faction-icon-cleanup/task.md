# Faction icon extraction cleanup delivery

## Status

- Integrated closure: implementation, independent review, and all validation gates are complete. This record is included in the task's Lore commit and pushed with `main`.

## Delivery package

1. Changes: replaced color-only cleanup with deterministic family silhouettes; removed the opaque-crop fail-open path; normalized the US paper-white emblem; regenerated 12 contaminated public PNGs; strengthened the existing private-tool contract suite.
2. Files: core — `tools/kards_private_calibration.py` and 12 `public/reference-pack/v1/images/nation-mark/**/*.png` files; tests — `tools/kards_private_calibration_contract_test.py`; docs — this archived task, registry, and lessons; temporary QA files — removed before commit.
3. Diff relative to base: one extraction module, one existing contract file, 12 authorized nation-mark images, and task/control-plane records. No renderer, manifest schema, dependency, or README change.
4. Commit state: committed in this task closure commit on `main`; use `git HEAD` as the recovery reference.
5. Base/divergence: task base was `516db9e33e1b30f95791cfd3b8249cfc88eb4d11`, which matched `origin/main` at start. The sole checkout advances from that base and is pushed at closure.
6. Conflict assessment: green. `git worktree list` shows only the main checkout, so there is no changed-file overlap or pending integration order with another worktree.
7. Validation: all 65 public PNGs hash-match Stage6; 20 focused Python contracts pass; `npm run validate` passes 17 Vitest files / 242 tests, private contracts, TypeScript, Vite build, and dist/private-boundary; a checkerboard contact sheet and minimal Canvas smoke were also reviewed.
8. Remaining risk: no blocking gap. A full perceptual comparison against every possible live-client card variant was not run; the bounded evidence covers all 65 authorized outputs and the affected source families.
9. Recommended next step: no merge/rebase/cherry-pick is needed because work was completed directly on the sole clean `main` checkout. Keep the running local server for subjective follow-up.
10. Integration result: safe to integrate and already integrated by the primary owner; push status is recorded by the final repository state.
