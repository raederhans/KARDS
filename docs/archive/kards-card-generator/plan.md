# KARDS-style static card generator plan

## Task level

Complex. This is a new frontend tool with UI, Canvas rendering, import/export, and project documentation, but the first milestone must stay small.

## First-principles goal

Build a local static card-face editor. It creates a picture that looks like a war-card front. It must not provide gameplay automation, deck legality, account features, cheating helpers, or bundled official assets.

## Scope for this pass

- Create a Vite + React + TypeScript static app.
- Define a versioned single-card data model.
- Render one card face to Canvas at 500 x 702.
- Allow editing card text, nation, type, rarity, set, costs, stats, and uploaded artwork crop.
- Export PNG and save/open JSON.
- Add a visible unofficial/non-commercial disclaimer.
- Verify with typecheck, unit tests, production build, and a browser smoke check.

## Non-goals

- No official asset pack in the repository.
- No official logo or trademark-heavy branding.
- No card database, deck builder, gameplay, online account, automation, or scraping workflow.
- No backend.

## Checklist

- [x] Inspect project constraints and existing files.
- [x] Add project skeleton and dependency manifest.
- [x] Add card model, presets, and import normalization.
- [x] Add Canvas renderer.
- [x] Add React editing shell and export controls.
- [x] Install dependencies and generate lockfile.
- [x] Run verification commands.
- [x] Browser smoke check the app.
- [x] Run independent review/self-review and fix issues found.
- [x] Prepare final Lore commit package after verification.
