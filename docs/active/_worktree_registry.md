# Worktree Registry

## KARDS initial static generator

- Worktree name/path: main checkout, `C:\Users\raede\Documents\KARDS`
- Thread/task: KARDS static card-face generator MVP
- Base branch/base commit: `master`, no prior commit
- Current branch/HEAD: `master`, committed initial baseline
- Task goal: create a local static React/Vite card-face editor with Canvas preview and PNG/JSON export
- Status: integrated
- Main changed files:
  - `src/App.tsx`
  - `src/components/CardCanvas.tsx`
  - `src/components/FieldPanel.tsx`
  - `src/components/ProjectPanel.tsx`
  - `src/canvas/cardRenderer.ts`
  - `src/cardModel.ts`
  - `src/storage.ts`
  - `src/limits.ts`
  - `src/*.test.ts`
  - `package.json`, `package-lock.json`, `vite.config.ts`, TypeScript config, CSS, favicon, lessons learned, docs
- Shared hotspot files touched: app shell, Canvas renderer, card schema/model, project storage, build config
- Validation run:
  - `npm run test`: passed, 13 tests
  - `npm run typecheck`: passed
  - `npm run build`: passed
  - Browser smoke at `http://127.0.0.1:5173/`: passed for desktop and mobile, Canvas nonblank, PNG data URL works, autosave excludes image data URL
- Tests not run: no full E2E suite exists yet
- Potential overlap with other worktrees: none detected; `git worktree list` has not shown parallel KARDS worktrees in this checkout
- Recommended integration order: integrate this initial skeleton first before future asset-pack, preset-library, or typography refinements
- Delivery package: `docs/archive/kards-card-generator/task.md`
- Next action: no push because no remote is configured; future work can branch from the current `master` commit

## KARDS official-style replication research

- Worktree name/path: main checkout, `C:\Users\raede\Documents\KARDS`
- Thread/task: KARDS official card-face style replication research
- Base branch/base commit: `master`, `27f5ae7`
- Current branch/HEAD: `master`, research closeout committed in current HEAD
- Task goal: verify why the MVP looks unlike official KARDS cards and define the shortest low-risk path toward precise card-face replication
- Status: integrated
- Main changed files:
  - `docs/active/kards-style-replication/plan.md`
  - `docs/active/kards-style-replication/context.md`
  - `docs/active/kards-style-replication/task.md`
  - `docs/active/kards-style-replication/research.md`
  - `lessons learned.md`
- Shared hotspot files touched: none in production code; future implementation is expected to touch `src/canvas/cardRenderer.ts`, `src/presets.ts`, `src/types.ts`, `src/components/CardCanvas.tsx`, and renderer tests
- Validation run:
  - Official support images downloaded to `.runtime/research/official/` and dimensions checked
  - KardsGen `frame.png` confirmed as `500x702`
  - KardsGen `CardGen.cs`/`Material.cs`, CraftSoul `index.html`/`builder.html`, and KARDS-Assets README/index script inspected with targeted search
- Tests not run: no production code changed in this research pass
- Potential overlap with other worktrees: none detected by `git worktree list`
- Recommended integration order: this research is integrated; implement the precision layout pass as a separate follow-up
- Delivery package: `docs/active/kards-style-replication/task.md`
- Next action: implement template-driven Canvas rendering with fixed geometry and programmatic placeholder layers first; defer asset-pack UX
