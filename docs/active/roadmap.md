# KARDS Card Forge Roadmap

## Current State

KARDS Card Forge is a v0.2-level single-card card-face
generator. The current app has working core editing, Canvas rendering, PNG/JPG/PDF
export, high-resolution rerendered export, lightweight local drafts, a local
card library path, bundled and local style-pack loading, a versioned reference
catalog, reference comparison, and public deployment paths for Vercel and
GitHub Pages.

The next stage should focus on stabilization, regression baselines, and small
careful improvements. The project should stay a local static fan card-face tool,
not grow into a gameplay or account platform.

## Priority Roadmap

### Completed Foundation: Repository And Release Trust

- `npm run validate` is the named repository gate for typecheck, Vitest, Python
  private-tool contracts, production build, and final artifact verification.
- The default `npm run build` verifies the exact `dist` directory it creates,
  so GitHub Pages and Vercel cannot publish an unchecked rebuild.
- `public/reference-pack/v1` is the versioned release allowlist for bundled
  KARDS-derived/reference resources. Declared app support assets are tracked
  separately; extracted, intermediate, local, and `.runtime` resources remain
  private.
- README, roadmap, worktree registry, and release notes must continue to match
  the code and release state that actually exist.

### Phase 1: Local Library Workbench

- Turn the current local library from a save log into a small workbench.
- Add browsing, loading, updating, and deleting saved cards.
- Keep File System Access permission behavior explicit and browser-local.

### Phase 2: Presentation-Aware Visual Smoke Baseline After Stage 8

- Treat Stage 8 as the current presentation-calibration line for type icons,
  rarity pips, typography, set/reference switching, and related card-face
  appearance fixes.
- Establish a visual smoke baseline after the Stage 8 presentation work is
  stable enough to compare against.
- Make the baseline state what it proves: layout, presentation, selected
  elements, or full-card appearance.
- Treat baseline drift as a review signal, not as automatic proof of a product
  bug.

### Phase 3: Small UX Audit

- Review artwork crop inputs and pointer behavior.
- Improve keyword editing accessibility.
- Clarify private style-pack wording and failure states.
- Continue localizing user-facing errors instead of storing translated error
  strings in state.

### Phase 4: Renderer Detail Tuning And Split

- Tune card rendering details only after the visual baseline is stable.
- Split renderer code by real responsibility when it reduces maintenance risk.
- Avoid large renderer rewrites until tests can distinguish intended visual
  changes from regressions.

## Not In Scope For Now

- Deck builder
- Account system
- Online sharing
- Game rule or legality validation
- Network image gallery
- Official resource auto-downloader
- Large batch-generation workflow

## Risk Register

- Release allowlist drift: the bundled reference pack must stay within
  `public/reference-pack/v1`, and every publish build must verify its exact
  file closure before deployment.
- Private path leakage risk: `.runtime` paths and user-local asset paths must not
  appear in public bundles or publishable documentation.
- Visual smoke baseline staleness: old baselines can hide real regressions or
  flag intentional renderer changes as failures.
- Maintenance risk in `ProjectPanel` and `cardRenderer`: both files keep
  collecting behavior and should be split only when the baseline and tests make
  the split safe.
- Local library maturity risk: the current local library is closer to an append
  save log than a complete CRUD workbench.

## Acceptance Criteria For Roadmap Work

- README and roadmap match the current code and do not conflict with each other.
- Future agents can use the phase order above without guessing what to do next.
- Publishable docs do not include private assets, real local absolute paths, or
  `.runtime` file contents.
- Vercel and GitHub Pages use the same default verified-build contract and
  publish the `dist` directory checked by that command.
- Planned features are described as planned, not as already implemented.
