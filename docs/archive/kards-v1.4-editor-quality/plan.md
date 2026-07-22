# KARDS v1.4 Editor Quality Plan

## Goal

Deliver a narrow v1.4 increment that makes single-card editing reversible,
visual differences locatable, key workflows more accessible, and supported
appearance/reference choices easier to reuse.

## Scope

- Correct the roadmap from the shipped v1.3.0 baseline.
- Add bounded Undo/Redo for authored `CardEditorState` transitions.
- Improve the existing visual-difference workflow without replacing the Canvas
  renderer.
- Add focused automated and manual accessibility gates.
- Expand only source-verified reference assets and serialized appearance
  presets.

## Sources of truth

- `main` and `origin/main` at `3c83d776a453593cb22f8f6a5b1557d19da6dd6a`.
- `docs/active/roadmap.md` and `docs/active/_worktree_registry.md`.
- `docs/archive/kards-product-direction-research-20260722/`.
- Current `App.tsx`, `cardEditorState.ts`, `visualDiff.ts`, reference generators,
  appearance model, and existing tests.
- Official documentation and maintainer guidance for adopted interaction and
  verification patterns.

## Stages

- [x] Stage 1: Reconcile repository truth and correct the v1.3.0/v1.4 roadmap.
- [x] Stage 2: Freeze architecture seams, external references, and failing-test
  inventory.
- [x] Stage 3: Implement bounded Undo/Redo through Red-Green-Refactor cycles.
- [x] Stage 4: Implement visible visual-difference output and representative
  baseline support through Red-Green-Refactor cycles.
- [x] Stage 5: Implement focused accessibility improvements and gates through
  Red-Green-Refactor cycles.
- [x] Stage 6: Prove source-verified sample-growth readiness and implement named serialized
  appearance presets through Red-Green-Refactor cycles.
- [x] Stage 7: Run targeted and full verification, independent review, and
  archive the completed task record.

## Acceptance criteria

- Undo/Redo is bounded, preserves the complete authored editor state, skips
  no-ops, clears Redo after a new edit, and treats deliberate replacements as a
  single step.
- Visible controls and standard keyboard shortcuts expose history state without
  breaking text entry or existing workbench keyboard navigation.
- Visual comparison shows both quantitative metrics and a locatable diff result
  with explicit scope and threshold semantics.
- Focused DOM and browser keyboard contracts exercise history controls,
  workbench tabs, focus visibility, diff text, and Canvas alternatives; manual
  screen-reader limits remain explicit.
- Every appearance preset is normalized and serialized through the existing
  `CardSpec.appearance` contract.
- Every new bundled reference asset passes the existing source identity,
  SHA-256, rights, and closed-world build gates.
- Targeted tests, typecheck, private-tool contracts, build verification, and the
  final `npm run validate` gate pass.

## Non-goals

- Accounts, cloud collaboration, decks, CSV/batch generation, or network image
  search.
- A general command bus, event-sourcing architecture, new Canvas engine, theme
  plugin system, or storage-format migration.
- Claiming WCAG conformance from automated checks alone.

## Risks and constraints

- Controlled form input can create one history entry per keystroke unless
  authored edits are grouped deliberately.
- Asynchronous reference/artwork loaders must not commit stale results or pollute
  history.
- Pixel baselines vary by browser, OS, fonts, and GPU; they require a fixed
  environment and must remain review signals.
- New public assets change the release closure and require exact rights and
  identity verification.
