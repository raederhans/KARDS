# Full-card reference fidelity plan

## Goal

Make “Load entire card” produce a generated card that faithfully follows the selected bundled reference, without confusing reference-only selection with editable-card replacement.

## Acceptance criteria

- Reproduce the mismatch with a concrete bundled sample and capture source/state/render evidence.
- Identify one root cause at the earliest incorrect boundary before editing production code.
- Add a failing automated contract that compares the loaded card inputs or output against the selected sample.
- Preserve “select reference only” and “use artwork only” as separate actions.
- Verify representative unit/command/HQ samples, browser behavior, independent review, and `npm run validate`.
- Commit and push a Lore-protocol change; archive this task when complete.

## Stages

- [x] Trace reference selection, card JSON loading, editor-state replacement, and Canvas inputs.
- [x] Reproduce and quantify at least one mismatch against the selected reference PNG.
- [x] Add and observe the smallest RED contract.
- [x] Implement the minimal source-boundary correction.
- [x] Run focused and visual verification across representative card kinds.
- [x] Complete three independent reviews and full validation.
- [x] Update registry/lessons and prepare the task archive.
- [x] Commit and push the verified closure.

## Constraints

- Do not turn reference-only selection into an implicit edit.
- Do not hide mismatches with generic image overlays or heuristic pixel post-processing.
- Do not change README.
- Primary agent owns Vite, browser automation, and all live tests/builds.
