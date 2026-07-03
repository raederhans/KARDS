# KARDS-style card generator context

## 2026-07-03

- Root started with only `.git` and `.omx`.
- No project-level `AGENTS.md` or `lessons learned.md` was present.
- Default branch is `master` with no commits yet and no configured remote.
- Product boundary: local static card-face generator only. No game logic, deck legality, account, automation, or official bundled assets.
- Visual direction: safe approximate war-archive card editor, not official logo/asset reproduction.
- Live process owner: main agent owns all install/build/test/dev-server/browser-smoke commands for this pass. No child agent may run or monitor the same live process.

## Implementation notes

- `CardSpec.version` is fixed at `1`.
- JSON export embeds uploaded image data URLs so a single-card project can reopen offline.
- Canvas export is fixed at `500 x 702`, matching the known fan-generator coordinate scale without copying its code.
- Presets are original local metadata, not official KARDS data.

## Review fixes

- Automatic drafts now save only lightweight card data. Uploaded image data stays in memory and in explicit JSON export, but is not written to `localStorage`.
- Card updates use functional state merging so async `FileReader` completion does not overwrite fields edited after selecting a file.
- Image loading has an effect cleanup guard so stale image loads cannot replace the current artwork.
- `CardCanvas` is the only Canvas render owner; `App` keeps the ref for export only.
- Upload/import boundaries now reject unsupported image types, oversized images, oversized JSON files, and oversized/unsupported imported data URLs.
- First-version schema no longer exposes unimplemented artwork presets or custom icon fields.
- Long body text is capped to the first-version visible range and renderer overflow is marked with `...`.
