# KARDS Card Forge

KARDS Card Forge is a local static KARDS-style card-face generator. It is a
non-official, non-commercial fan utility for composing single custom card
images in the browser.

It is not a KARDS game client, deck builder, account tool, online service,
network automation tool, legality checker, or official asset downloader.

## Current Scope

- Edit card kind, nation, rarity, set mark, title, keywords, body text,
  deployment cost, operation cost, attack, defense, and HQ defense.
- Upload a local artwork image, then drag and zoom it inside the card artwork
  frame.
- Preview the card on a fixed `500x702` Canvas.
- Export the current card as PNG, JPG, or PDF.
- Export at `1x`, `2x`, or `3x`. Multi-size exports rerender the card into the
  target backing resolution, such as `1000x1404` for `2x`, instead of simply
  enlarging an already-rendered `500x702` canvas.
- Apply export-only exposure and contrast adjustments.
- Save and open a single-card project JSON file.
- Keep a lightweight `localStorage` draft. Uploaded artwork is intentionally
  not saved into the automatic draft.
- Use the browser File System Access API, when available, to save card files and
  append entries to a local card library file.
- Load the versioned bundled reference pack or a local style pack selected in
  the user's browser session. User-selected assets stay local to that session.
- Compare the generated card against a bundled or user-supplied reference image.
- In development builds, preview private local reference samples when the local
  private pack exists.
- Switch the UI between Chinese and English.

## Tech Stack

- React 19
- TypeScript
- Vite
- Canvas 2D rendering
- Vitest
- Playwright
- GitHub Pages
- Vercel

## Project Structure

```text
src/
  App.tsx                  App shell, editor state, and reference-pack wiring
  assetPack.ts             Bundled/local style-pack manifest loading
  cardModel.ts             Card defaults, normalization, and bounds
  exportCard.ts            PNG, JPG, PDF, scale, exposure, and contrast export
  localLibrary.ts          File System Access local library helpers
  storage.ts               Lightweight browser draft persistence
  visualDiff.ts            Reference image comparison metrics
  components/              Field, project, and Canvas preview panels
  canvas/                  Fixed geometry, renderer, and render assets
tools/                     Artifact verification, private calibration, and visual smoke utilities
docs/
  active/                  Current plans, roadmap, and worktree registry
  archive/                 Completed task records
```

## Local Development

```bash
npm install
npm run dev
```

For a clean install, use:

```bash
npm ci
py -3 -m pip install -r requirements-dev.txt  # Windows
python3 -m pip install -r requirements-dev.txt # macOS / Linux
```

Useful checks:

```bash
npm run validate
npm run typecheck
npm test -- --run
npm run build
npm run verify:private-tools
```

`npm run validate` is the standard local gate for repository-safe checks. It
includes the Python private-tool contract tests, but does not run the private
visual smoke workflow.

## Safety Boundary

This project is not affiliated with, endorsed by, sponsored by, or approved by
1939 Games.

KARDS-derived/reference resources in the public build are limited to the
versioned bundled reference pack. Declared app support assets such as the icon
and paper texture are separate; private local paths, user-selected packs, and
`.runtime` contents stay outside the build.

Do not commit or publish:

- `.runtime`
- `dist`
- `.env*`
- `.vercel`
- local private asset packs
- other private or local-only resources

`npm run build` validates the exact `dist` directory it creates. A build fails
if the public reference-pack closure changes unexpectedly or private paths,
intermediate markers, credentials, or undeclared reference-pack files enter the
artifact.

## Deployment

Vercel uses the normal root-path Vite build with base `/`.

GitHub Pages uses `KARDS_GITHUB_PAGES=true`, which changes the Vite base to
`/KARDS/` for the project site.

Both deployment paths use the default verified build. Do not replace it with a
raw `vite build`, and do not rebuild `dist` after its boundary check.

Do not commit `dist` or push built files to a `gh-pages` branch. GitHub Pages is
deployed from the workflow artifact produced by `.github/workflows/deploy-pages.yml`.

## Roadmap

The current long-term roadmap is maintained in `docs/active/roadmap.md`.
