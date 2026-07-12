# Faction icon extraction cleanup plan

## Goal

Remove verified background, neighboring-print, or crop-edge contamination from visible faction/nation icons while preserving thin emblem details and the existing authorized reference-pack boundary.

## Acceptance criteria

- Every published `nation-mark` asset is audited by nation and card kind, not only a hand-picked subset.
- Contaminated icons become transparent outside the intended emblem without erasing rings, crosses, stars, shields, or fine lines.
- The fix occurs at the proven source boundary: extraction rules or stale published assets, not a Canvas fallback.
- Existing named private-tool and renderer/build verification entrypoints cover the repaired contract.
- Focused RED/GREEN evidence, visual contact-sheet comparison, independent reviews, and `npm run validate` pass.

## Stages

- [x] Inventory current published assets, reference crops, and extraction data flow.
- [x] Identify each contaminated family and prove one root-cause hypothesis.
- [x] Add the smallest failing contract test before production changes.
- [x] Implement the minimal extraction/publication correction and regenerate only authorized outputs.
- [x] Compare before/after transparent contact sheets and stable Canvas samples.
- [x] Run three independent final reviews and the full validation gate.
- [x] Commit and push with a Lore-protocol commit, update registry/lessons, then archive this task.

## Constraints

- Do not change README.
- Do not use generic AI background removal or fuzzy post-processing without a reproduced failure mode.
- Do not bundle private source cards; only the existing authorized runtime closure may be published.
- The primary agent exclusively owns Vite on `127.0.0.1:5173` and all live tests/builds.
