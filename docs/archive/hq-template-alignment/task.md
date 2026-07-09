# HQ template alignment tasks

- [x] Confirm repository/worktree baseline.
- [x] Reproduce the selector failure and HQ visual mismatch in the local browser.
- [x] Trace selector, catalog, layout, renderer, and reference-data flow.
- [x] Add failing regression tests.
- [x] Unify template selection and make loading atomic.
- [x] Implement the dedicated HQ visual composition.
- [x] Run targeted tests and browser smoke for all HQ samples.
- [x] Run `npm run validate` and `git diff --check`.
- [x] Complete first-principles bug review and fix any findings.
- [x] Update delivery package, lessons learned, and registry.
- [x] Commit and push the verified closeout.

## Delivery package

1. Changed behavior: one action picker now loads ordinary cards and HQ templates; HQ visuals use the actual artwork window, shield geometry, localized lower text, and visually matched defense value.
2. Core files: `src/App.tsx`, `src/components/ProjectPanel.tsx`, `src/devPreviewCatalog.ts`, `src/devPreviewState.ts`, `src/canvas/layout.ts`, `src/canvas/cardRenderer.ts`, `src/i18n.ts`.
3. Test files: `src/components/ProjectPanel.test.ts`, `src/devPreviewCatalog.test.ts`, `src/canvas/layout.test.ts`, `src/canvas/cardRenderer.test.ts`. Documentation: this task folder, `docs/active/_worktree_registry.md`, `lessons learned.md`. Temporary files: none added; private references remain ignored under `.runtime`.
4. Diff from base: 7 production files, 4 existing test files, i18n, registry, lesson, and this task record; no private image bytes or new dependency.
5. Commit state: not yet committed at record-writing time; one Lore-protocol closeout commit is recommended because the selector and renderer changes form one tested behavior fix.
6. Base divergence: base `1d6c9da01b6f3ea0570767661e804b7230bebd36`; local `main` and `origin/main` were `0/0` before the closeout commit.
7. Conflict review: no second KARDS worktree exists. Shared-hotspot risk is yellow for `App`, `ProjectPanel`, catalog, and canvas renderer, but no path overlap with another live worktree was found.
8. Verification: targeted 80 tests passed; `npm run validate` passed 149 tests, typecheck, Vite production build, and private-boundary verification; browser passed all five HQs, repeated same-template load, and HQ/card/HQ switching; three independent final reviews found no blockers.
9. Remaining risk: private official reference images are dev-only, so a deployed production build cannot reproduce the local official-pixel comparison pane; the public renderer fallback and private-boundary check both pass.
10. Recommendation: commit directly on clean `main`, push `origin/main`, then mark this task integrated and archive the task record. No rebase, cherry-pick, or separate worktree cleanup is required.
