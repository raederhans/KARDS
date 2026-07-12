# Elite and Special rarity visual fidelity plan

## Goal

Make all visible rarity footmarks match the original KARDS card-face presentation using evidence from complete reference cards, transparent extracted assets, and the current renderer.

## Acceptance criteria

- Elite renders as one complete winged badge at the original footer size and anchor.
- Special renders as the complete two-tile silver star group, without missing subject pixels or duplicated single-pip behavior.
- Standard and Limited keep their original counts while matching the original size, spacing, fan angle, material, and footer baseline.
- Asset extraction and renderer behavior are covered by existing named test entrypoints.
- Focused tests, full validation, and a visual comparison pass succeed.

## Stages

- [x] Collect original/reference/current evidence and state one root-cause hypothesis.
- [x] Extend existing tests and observe the expected RED failures.
- [x] Implement the smallest extraction and/or rendering correction.
- [x] Regenerate the affected authorized runtime assets and visually compare them.
- [x] Quantify original-versus-current Standard and Limited pip size, gap, rotation, and baseline differences.
- [x] Add a focused RED test and implement only the confirmed Standard/Limited micro-adjustment.
- [x] Run independent reviews and the full validation gate for the expanded scope.
- [x] Commit and push with a Lore-protocol commit, update registry and lessons, then archive this task.

## Constraints

- Do not change README.
- Do not bundle new unauthorized assets; only repair the existing authorized reference-pack closure.
- Do not create a parallel test system or a second rarity rendering abstraction.
- The already-running Vite server on `127.0.0.1:5173` is owned by the primary agent; no child agent may poll or restart it.
