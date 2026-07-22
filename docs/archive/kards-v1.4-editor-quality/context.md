# KARDS v1.4 Editor Quality Context

## Current truth

- 2026-07-22: one worktree; local `main`, `HEAD`, and `origin/main` all resolve to
  `3c83d776a453593cb22f8f6a5b1557d19da6dd6a`.
- The only pre-existing worktree change is the untracked, completed product
  direction research under `docs/archive/kards-product-direction-research-20260722/`.
- v1.3.0 is shipped. The old roadmap still named v1.0.0 as the baseline and has
  now been corrected before production implementation begins.
- Existing project lessons require export-visible appearance to remain in the
  serialized card model and public reference assets to stay inside verified
  source/rights/build boundaries.

## Decisions and deviations

| Time | Evidence or decision | Impact |
| --- | --- | --- |
| 2026-07-22 | User approved Undo/Redo, visual-difference, accessibility, more card images, and appearance presets | Treat as one bounded v1.4 quality increment |
| 2026-07-22 | Task crosses editor state, renderer review, UI, tests, and public assets | Classified `complex`; durable records and independent architecture review required |
| 2026-07-22 | Previous research rejected broad frameworks and unverified asset sources | Reuse existing seams; no new runtime framework or unknown-source imagery |
| 2026-07-22 | TDD workflow selected | No production behavior code before a focused test fails for the intended reason |
| 2026-07-22 | Architecture review marked the initial full-state history idea `WATCH` | Authored snapshots exclude monotonic `artworkRevision` and derived auto-reference artwork; Undo/Redo increments the runtime revision |
| 2026-07-22 | tldraw and Excalidraw use intent/transaction boundaries | Adopted bounded snapshot history plus 750 ms same-field coalescing; rejected their runtime/editor frameworks |
| 2026-07-22 | Playwright documents fixed-environment screenshot limits and separate ARIA contracts | Runtime diff adds threshold, review level, and changed bounds; no user-side baseline or diff-image manager |
| 2026-07-22 | Existing crop number/range inputs already provide keyboard alternatives to Canvas dragging | Accessibility work focuses on native history controls, focus visibility, readable Canvas content, and DOM/keyboard contracts |
| 2026-07-22 | Private source inventory has 1,544 IDs outside the public catalog, but no complete bilingual image/hash/rights closure | No new public card images this stage; retain as a gated follow-up rather than publishing incomplete assets |
| 2026-07-22 | Existing `CardSpec.appearance` already serializes all available fine-tuning fields | Five built-in presets apply appearance only; no preset id or schema migration |
| 2026-07-22 | First browser smoke used programmatic `focus()`, which does not guarantee the keyboard `:focus-visible` modality | Smoke failed at the focus-style assertion; changed the test to reach Undo with a real `Shift+Tab` before one evidence-backed retry |
| 2026-07-22 | Second browser smoke passed history/focus checks but assumed English while a clean profile defaults to Chinese | Make the smoke select English explicitly before localized name assertions; all earlier checks remain exercised on the next run |
| 2026-07-22 | Public repository issues contain no reports and issue creation is restricted | Direct KARDS user-frequency evidence is weak; roadmap priorities use repository contracts plus adjacent-product evidence and do not claim measured demand |
| 2026-07-22 | A board-game-design workflow discussion describes multi-tool export as clunky and values separation of content/layout plus quick visual iteration | Treat preset reuse and fewer destructive editing steps as a supported direction, but do not infer demand for batch generation |
| 2026-07-22 | An Excalidraw discussion records unrecoverable work after destructive replacement, while tldraw documents interaction-level history marks | Reinforces reversible intent-level edits; this is adjacent-product evidence, not a KARDS incident count |
| 2026-07-22 | Independent review found an empty coalesced Undo, a decreasing `artworkRevision`, and incomplete Windows smoke shutdown | Added title/checkbox rollback tests, strict authored-transition revision growth, and verified process-tree shutdown before rerunning all gates |
| 2026-07-22 | Final independent code review returned `APPROVE` | All three findings are closed; no new blocker was found |

## Live process ownership

| Process | Owner | Log path | State |
| --- | --- | --- | --- |
| Full validation | primary agent | `.runtime/kards-v14-editor-quality-validate.log` | Completed with exit 0: 24 Vitest files / 298 tests, 26 private-tool contracts, TypeScript, Vite build, and dist boundary; SHA-256 `92BE006EDD03CDF9A85AE35A26C123C82430D20CABB121E8C44AE3D415FF2FDD` |
| Editor-quality browser smoke | primary agent | `.runtime/kards-editor-quality-smoke/latest/report.json` | Completed with exit 0: `ok=true`, 16 checks, `errors=[]`; Vite process tree stopped and port 5184 was available afterward; SHA-256 `D1957839307F16FB3751E738C402838B7A8672ACF41B5C2DDD2C3AD9DD616349` |

## Handoff

Roadmap, architecture boundaries, implementation, validation, browser smoke,
and independent review are complete. The verified implementation remains a
local, uncommitted worktree change.

## Next step

Review the local v1.4 change set, then decide whether to commit it and prepare a
release candidate. Manual screen-reader, Canvas zoom, and contrast review remain
explicit release-level checks.
