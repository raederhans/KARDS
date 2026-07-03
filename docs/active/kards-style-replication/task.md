# KARDS Style Replication Task Notes

## Current Worktree

- Worktree name/path: main checkout, `C:\Users\raede\Documents\KARDS`
- Thread/task: KARDS official-style card-face replication research
- Base branch/base commit: `master`, `27f5ae7`
- Current branch/HEAD: `master`, research closeout committed in current HEAD
- Task goal: replace rough styling assumptions with evidence-backed official card-face replication requirements
- Status: integrated

## Hotspot Files Expected In Next Implementation

- Core renderer: `src/canvas/cardRenderer.ts`
- Card model/schema: `src/cardModel.ts`, `src/types.ts`
- Presets and visual vocabulary: `src/presets.ts`
- Canvas interaction: `src/components/CardCanvas.tsx`
- UI layout and preview sizing: `src/styles.css`
- Renderer tests: `src/canvas/cardRenderer.test.ts`

## Validation Log

- `git status --short`: clean before research docs were created.
- Official support images downloaded and dimensions confirmed with local image inspection.
- KardsGen `frame.png` dimensions confirmed locally as 500x702.
- KardsGen `CardGen.cs`, `Material.cs`, CraftSoul `index.html`/`builder.html`, and KARDS-Assets README/index script inspected.

## Open Items

- Future implementation should decide the exact user-facing asset-pack import UX.

## Delivery Package

1. Changed this phase:
   - Added active research plan/context/task notes.
   - Added an evidence-backed research report for official-style replication.
   - Confirmed that current MVP size is right but its visual structure is wrong.
   - Identified KardsGen coordinates as the best next renderer baseline.
   - Identified a no-official-asset geometry pass as the safest first implementation path.
   - Identified local asset-pack import as a later gated research mode, not a legal guarantee.
2. Files touched:
   - Core files: none.
   - Test files: none.
   - Docs: `docs/active/kards-style-replication/plan.md`, `context.md`, `task.md`, `research.md`.
   - Lessons: `lessons learned.md`.
   - Temporary evidence: `.runtime/research/**` only.
3. Diff summary:
   - Documentation-only research and planning update; no production behavior changed.
4. Commit status:
   - Documentation-only closeout is committed in the current HEAD.
5. Base divergence:
   - Base commit `27f5ae7`; no remote configured in this repo.
6. Potential conflicts:
   - No other KARDS worktrees detected. Future implementation will touch renderer hotspots listed above.
7. Validation:
   - Local image dimensions checked.
   - Reference files inspected with targeted `rg` and line reads.
8. Unverified risks:
   - Exact high-resolution official original card size and font files are not bundled.
   - Asset distribution policy needs a user decision before shipping or enabling official-derived assets.
9. Recommended next step:
   - Implement the precision layout pass on top of `master`, using fixed layout tables and programmatic placeholder layers first.
10. Integration recommendation:
   - This documentation is safe to commit directly on `master`. Stage 1 implementation should follow as a separate commit.
