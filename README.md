# KARDS Card Forge

English | [简体中文](README.zh-CN.md)

Create, preview, and export custom KARDS-style cards in your browser. Your card
content and the local files you choose are processed in the browser. The app
does not upload them; it only loads its own resources from the deployed site.

[Open the app on Vercel](https://kards-card-forge.vercel.app/) ·
[Open the GitHub Pages build](https://raederhans.github.io/KARDS/)

KARDS Card Forge is maintained as an unofficial, non-commercial fan tool. It is
not a game client, deck builder, account tool, or official asset downloader.
Software use is governed by [LICENSE](LICENSE).

For an in-app overview, select **Help** in the top bar. The guide explains the
first-card workflow, save options, reference actions, and local-file behavior.

## Make Your First Card

1. Edit the card fields on the left.
2. Upload artwork, or open **Reference**, choose a card, then select **Use
   artwork only**.
3. Drag the artwork to reposition it. Use the mouse wheel to zoom.
4. Use **Appearance** to adjust the paper texture or load a local style pack.
5. Open **Export**, check the status, then export PNG, JPG, or PDF.

The preview uses a fixed `500 × 702` layout. Exports at `2×` and `3×` rerender
the card at the target resolution instead of enlarging the preview.

## Workspace

The right-side workspace has four tabs:

| Tab | Use it to |
| --- | --- |
| **Appearance** | Adjust paper texture or load a local style pack. |
| **Library** | Download or open a project file, and manage a local card library. |
| **Export** | Choose format, resolution, exposure, contrast, and save location. |
| **Reference** | Search, filter, compare, and apply bundled reference cards. |

In **Reference**, selecting a reference card only changes the comparison card. **Use
artwork only** changes the artwork. **Load entire card** replaces the current
card. Automatic artwork matching only applies a unique match and never replaces
artwork you uploaded or chose yourself.

## Save Your Work

The three save paths have different purposes:

- The automatic draft keeps lightweight card data for the current site in the
  current browser. It does not keep embedded artwork, whether uploaded or
  applied from a reference card. Vercel and GitHub Pages use different site
  storage.
- A project file (`.card.json`) keeps the full editable card, including embedded
  artwork. Use it when you want to continue the same card later.
- The local card library (`card-forge-library.json`) stores reusable cards in a
  folder you choose. It supports add, load, update, and delete, but does not
  embed artwork.

## Browser Support

Folder access uses the browser's File System Access API. If that API is not
available, exports use normal browser downloads and the local card-library
folder cannot be opened.

If folder access is available but Web Locks are not, the local library is
read-only: you can browse and load cards, but cannot add, update, or delete
them. Remembering a folder does not grant permanent access; the browser may ask
for permission again when you open or write to it.

## Local Style Packs

A local style pack is a folder that contains `kards-asset-pack.json` plus the
images and fonts listed by that file. Choose the whole folder from
**Appearance**. The selected files stay in the current browser session and are
not uploaded by the app.

Start with the
[manifest example](docs/reference/asset-pack-manifest.example.json). Use only
files you are allowed to use.

## Software License and Resource Rights

Original project-owned software code is available under the
[PolyForm Perimeter License 1.0.1](LICENSE). The software code may be used,
modified, distributed, and used to create derivative software for permitted
purposes, but it may not be used to provide a product that competes with KARDS
Card Forge. This is a **source-available** license, not an OSI-approved
open-source license.

The software license does not grant rights to KARDS names or trademarks,
project branding, KARDS-derived or reference resources, separately licensed
third-party files, or user-supplied style packs. Before publicly forking,
publishing, or deploying the repository, remove resources you do not
have permission to redistribute or obtain the needed rights yourself. The
code-only archive attached to this release is the safest starting point for
derivative software because it omits the restricted reference pack, bundled
brand image files, and maintainer-specific Sites metadata. It still contains
the project name in source and documentation, so fork maintainers must rename
the project and remove remaining brand references unless they have permission
to retain them. Read [Software and Resource Rights](RESOURCE-RIGHTS.md) and
[Third-Party Notices](public/THIRD-PARTY-NOTICES.txt) for the exact repository
boundary.

## Local Development

The project uses React, TypeScript, Vite, and Canvas 2D. Install dependencies and
start the local server:

```bash
npm ci
npm run dev
```

The CI baseline is Node.js 22 and Python 3.12. Install the Python test
dependencies before running the full repository gate:

```bash
py -3 -m pip install -r requirements-dev.txt  # Windows
python3 -m pip install -r requirements-dev.txt # macOS or Linux
npm run validate
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm test` | Run the Vitest suite once. |
| `npm run typecheck` | Check the TypeScript projects. |
| `npm run build` | Build and verify the exact public `dist` output. |
| `npm run validate` | Run tests, private-tool contracts, typecheck, build, and artifact checks. |

## Project Map

```text
src/
  App.tsx                  Editor state and reference wiring
  components/              Field, preview, workspace, and library UI
  canvas/                  Fixed card geometry and renderer
  assetPack.ts             Bundled and local style-pack loading
  exportCard.ts            PNG, JPG, and PDF export pipeline
  localLibrary.ts          Local card-library file operations
  storage.ts               Lightweight browser draft
tools/                     Build-boundary and calibration checks
docs/active/               Current roadmap and worktree registry
docs/archive/              Completed implementation records
```

## Publication Boundary

This project is not affiliated with, endorsed by, sponsored by, or approved by
1939 Games.

Maintainer-hosted deployments contain versioned reference files under
`public/reference-pack/v1`, but their presence in the repository or maintainer
build does not grant permission to reuse or redistribute them. Fork maintainers
must remove them or obtain their own rights before publishing or deploying a
fork.

Local style packs, private calibration files, `.runtime`, environment files,
and generated `dist` output must not be committed. Always use `npm run build`
for a publish build. It checks the exact `dist` directory for unexpected
reference files, private paths, credentials, and other release-boundary
violations. GitHub Pages publishes the verified workflow artifact; do not push
a separate `gh-pages` build.

See the current [roadmap](docs/active/roadmap.md) for planned work.
