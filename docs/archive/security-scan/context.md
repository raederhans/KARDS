# KARDS Security Scan Context

## 2026-07-09 Start

- User requested a repository security, integrity, and defensive capability assessment plus safe fixes.
- Loaded `codex-security:security-scan` and its phase skills: threat model, finding discovery, validation, and attack-path analysis.
- Capability preflight passed as `ready` using `py -3`; `python` command name is not available on this Windows host.
- Goal tracking is active for this scan.
- `git worktree list --porcelain` showed only the main checkout.
- `git status --short` showed pre-existing dirty files before this security scan:
  - `lessons learned.md`
  - `src/App.tsx`
  - `src/components/FieldPanel.tsx`
  - `src/devPreviewCatalog.test.ts`
  - `src/devPreviewState.ts`
  - `src/i18n.ts`
  - `src/styles.css`
  - untracked `src/components/FieldPanel.test.ts`
- Treat those edits as user WIP. Do not revert them.

## Threat Model Summary

- KARDS is a static React/Vite local-first card-face editor.
- No backend/auth/session/SQL server is in scope.
- Important security boundaries are user project JSON, uploaded/reference images, local asset-pack manifests, File System Access/IndexedDB/localStorage, exported files, dev-only `.runtime` private assets, and Python private asset tooling.

## Findings And Fixes

- `KARDS-SEC-001-private-cleanup-links` (medium): `tools/kards_private_calibration.py` now handles symlinks and Windows junctions before recursive cleanup. Regression added in `tools/kards_private_calibration_contract_test.py`.
- `KARDS-SEC-002-asset-pack-paths` (low): `src/assetPack.ts` now rejects absolute, URL-scheme, plain traversal, and URL-encoded traversal manifest paths for images and fonts. Regression tests added in `src/assetPack.test.ts`.
- `KARDS-SEC-003-asset-pack-resource-bounds` (low): local asset-pack images/fonts now have type and size checks before decode/load. Regression added in `src/assetPack.test.ts`.
- `KARDS-SEC-004-reference-image-bounds` (low): reference comparison image import now shares the artwork import type/size policy, including localized error text and a test.

## Closed Non-Findings

- Project JSON XSS: no dangerous DOM/eval sink found; model data is normalized and rendered through React/canvas.
- Export path injection: export names go through `safeFileName`; directory writes use generated filenames.
- Private asset leakage: production `dist` did not contain `.runtime`, private pack path names, or known private sample names.
- Dependency advisories: `npm audit --audit-level=moderate` found 0 vulnerabilities.
- `.omx/state` rows from generated ranking are local agent runtime state and not product source.

## Current Phase

Closeout complete; ready for integration, not committed because of pre-existing dirty WIP.

Final reviewer pass found one low encoded-dot-segment gap in asset-pack path validation. The follow-up fix decodes path segments before accepting them, rejects encoded slash/backslash traversal, and `npm run validate` passed afterward.

## 2026-07-09 Lightweight Hardening Follow-Up

- Implemented the first five high-return hardening points without adding dependencies or changing README.
- `src/limits.ts` now owns shared image constants, PNG/JPEG/WebP magic-byte checks, decoded pixel limits, and local-library limits.
- Artwork upload, reference comparison imports, and local asset-pack image files now keep the existing MIME/size checks and add magic-byte validation. Artwork, reference diff, and local asset-pack decode paths also reject 0-pixel or over-16-million-pixel images.
- Local-library reads now reject `card-forge-library.json` files over 2 MB, and normalization keeps only the first 200 raw cards. Saving keeps the library file capped at 200 cards.
- `tools/verify_dist_private_boundary.mjs` scans production `dist` paths and contents for private markers, and `npm run validate` runs it after build.
- `tools/kards_private_calibration.py` now allows downloads only from CraftSoul raw GitHub data and official KARDS card image paths, rejects invalid/non-2xx responses, and caps responses at 12 MB.
- No commit was created because this checkout already contains pre-existing WIP and the security-scan/hardening changes still need hunk isolation before integration.

## Artifacts

- Threat model: `C:\Users\raede\AppData\Local\Temp\codex-security-scans\KARDS\3be519432c11_20260709T110919\artifacts\01_context\threat_model.md`.
- Coverage ledger: `C:\Users\raede\AppData\Local\Temp\codex-security-scans\KARDS\3be519432c11_20260709T110919\artifacts\03_coverage\repository_coverage_ledger.md`.
- Final report: `C:\Users\raede\AppData\Local\Temp\codex-security-scans\KARDS\3be519432c11_20260709T110919\final_report.md`.
