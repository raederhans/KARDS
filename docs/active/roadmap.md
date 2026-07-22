# KARDS Card Forge Roadmap

## Current Baseline — v1.3.0

KARDS Card Forge is a local, static tool for creating one custom card at a
time. The current release includes:

- Chinese and English editing, Canvas preview, and PNG/JPG/PDF export.
- `1×`, `2×`, and `3×` rerendered output with exposure and contrast controls.
- Project files, lightweight browser drafts, and a local card library.
- A versioned reference catalog with 74 bilingual sample/reference cards,
  search, comparison, explicit artwork application, and full-card loading.
- Bundled reference assets, optional local style packs, export preflight, and
  structured diagnostics.
- Verified Vercel and GitHub Pages release paths plus a code-only Release
  boundary.

The product boundary remains unchanged: a local single-card design tool, not a
gameplay, account, deck, batch-generation, or network-content platform.

## Release Scope — v1.4.0 Editing Safety and Visual Quality

The v1.4.0 scope is a bounded editor-quality increment that preserves the
local single-card product boundary.

### 1. Bounded Undo and Redo

- Add a bounded editor-state history for authored card changes and deliberate
  full-card replacements.
- Provide visible Undo/Redo actions and standard keyboard shortcuts.
- Keep asynchronous artwork derivation, loading state, export settings, and
  library filesystem operations outside authored history.
- Clear Redo after a new authored edit and avoid recording no-op transitions.

### 2. Useful Visual Difference Review

- Extend the existing comparison metrics with a visible diff result that helps
  locate changed pixels.
- Keep thresholds and scope explicit; a visual difference remains a review
  signal, not automatic proof of a defect.
- Keep fixed-environment browser baselines limited to representative cards and
  text lengths; do not turn runtime comparison into a baseline manager.

### 3. Focused Accessibility

- Make Undo/Redo, visual comparison, presets, tabs, and status changes usable
  from the keyboard with clear names and focus behavior.
- Add focused DOM and browser keyboard contracts for history, tabs, focus,
  diff text, presets, and the Canvas text alternative.
- Keep Canvas-specific layout, contrast, zoom, and screen-reader behavior in a
  documented manual review because automated checks cannot prove them.

### 4. Reference and Appearance Preset Library

- Keep the current 74-card public catalog unchanged until a candidate has the
  full bilingual image/JSON, source identity, SHA-256, rights, catalog, and
  closed-world build closure; private metadata alone is not publishable art.
- Add a small named appearance preset catalog backed by serialized
  `CardSpec.appearance`, so preview, export, project files, drafts, and local
  library restores remain identical.
- Presets may adjust existing supported appearance fields; they must not create
  a second renderer, arbitrary theme schema, or hidden runtime dependency.

## Later, If Evidence Supports It

- Print presets with explicit physical size, bleed, and cut-mark contracts.
- A portable local-library format with relative artwork sidecars.
- A larger appearance catalog after the first built-in set proves useful.

These are directions, not promised release items. Add them only after a clear
user need and a testable acceptance rule exist.

## Not Planned

- Deck builder or game-rule validation
- Account system or online sharing
- Network image gallery or official-resource downloader
- Large batch-generation or spreadsheet workflow
- Canvas engine rewrite or general-purpose theme/plugin platform

## Release Guardrails

- Every behavior change follows a failing-test-first cycle and the final
  `npm run validate` repository gate.
- `npm run build:sites` prepares the same verified static application for Sites
  hosting without changing product behavior.
- The public reference pack stays inside `public/reference-pack/v1` with an
  exact allowlist. Its presence does not grant fork or redistribution rights.
- Local paths, user-selected style packs, private calibration files, and
  `.runtime` contents stay outside public bundles and publishable documentation.
- README, roadmap, release notes, and the worktree registry must describe the
  code and release state that actually exist.
