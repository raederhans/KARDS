# KARDS Security Scan Task

## Checklist

- [x] Load requested security scan skill.
- [x] Read lessons learned.
- [x] Inspect file list before precise searches.
- [x] Run scan capability preflight.
- [x] Create scan goal.
- [x] Create task docs.
- [x] Write threat model.
- [x] Build discovery worklist and coverage ledger.
- [x] Run static security-reviewer subagent pass.
- [x] Validate candidate findings.
- [x] Patch confirmed issues.
- [x] Run verification.
- [x] Write final report and delivery package.
- [x] Implement the five lightweight follow-up hardening items.
- [x] Re-run targeted and full validation after the follow-up.

## Delivery Package

1. Changed:
   - Hardened private calibration cleanup against symlink/junction boundary crossing.
   - Added asset-pack manifest relative-path validation, including URL-encoded traversal rejection.
   - Added local asset-pack image/font type and size gates.
   - Added reference image import type/size validation and matching UI accept list.
   - Added regression tests and security scan artifacts.
2. Files:
   - Core: `src/assetPack.ts`, `src/components/ProjectPanel.tsx`, `src/i18n.ts`, `tools/kards_private_calibration.py`.
   - Tests: `src/assetPack.test.ts`, `src/components/ProjectPanel.test.ts`, `tools/kards_private_calibration_contract_test.py`.
   - Docs: `docs/active/security-scan/*`, `docs/active/_worktree_registry.md`, `lessons learned.md`.
   - Temporary scan artifacts: `C:\Users\raede\AppData\Local\Temp\codex-security-scans\KARDS\3be519432c11_20260709T110919\**`.
3. Diff summary:
   - The scan-specific diff is focused on local file/import bounds, private cleanup safety, tests, and documentation.
   - Full checkout diff also includes pre-existing user WIP outside this scan.
4. Commit state:
   - Not committed. Reason: checkout was dirty before the scan, and `src/i18n.ts` plus `lessons learned.md` contain both pre-existing/user and scan hunks.
5. Base/main divergence:
   - `HEAD` and `origin/main` both equal `3be519432c1109a873a435f522094bd4507cc8be` after fetch.
6. Potential conflicts:
   - Direct file overlap with pre-existing WIP in `src/i18n.ts` and `lessons learned.md`.
   - Semantic overlap with any future asset-pack loader, ProjectPanel import/export, or private calibration tooling work.
7. Verification:
   - `npm run validate`: passed, 15 Vitest files and 138 tests plus production build.
   - Python compile and contract tests: passed.
   - `npm audit --audit-level=moderate`: 0 vulnerabilities.
   - Production `dist` private-path grep: no matches.
   - `git diff --check`: passed with line-ending warnings only.
8. Unverified risk:
   - No browser smoke; fixed paths are covered by unit/type/build/Python checks.
   - No pixel-dimension image decode cap was added; current fix bounds blob size/type before decode.
9. Recommended next step:
   - Rebase is not needed because `main` matches `origin/main`.
   - Stage only security-scan hunks, then commit with Lore trailers.
10. Integration status:
   - Ready for integration.

## Lightweight Follow-Up Delivery Package

1. Changed:
   - Added shared PNG/JPEG/WebP magic-byte validation and decoded pixel limits.
   - Applied image authenticity and pixel-cost checks to artwork upload, reference comparison, and local asset-pack images.
   - Added 2 MB local-library file cap and 200-card normalization/save cap.
   - Added `verify:dist-private-boundary` and wired it into `npm run validate` after build.
   - Added Python download allowlist, non-2xx rejection, invalid URL rejection, and 12 MB response cap.
2. Files:
   - Core: `src/limits.ts`, `src/assetPack.ts`, `src/components/FieldPanel.tsx`, `src/components/ProjectPanel.tsx`, `src/visualDiff.ts`, `src/localLibrary.ts`, `tools/kards_private_calibration.py`.
   - Tests: `src/assetPack.test.ts`, `src/components/FieldPanel.test.ts`, `src/components/ProjectPanel.test.ts`, `src/visualDiff.test.ts`, `src/localLibrary.test.ts`, `tools/kards_private_calibration_contract_test.py`.
   - Config/tools: `package.json`, `tools/verify_dist_private_boundary.mjs`.
   - Docs: `docs/active/security-scan/*`, `docs/active/_worktree_registry.md`, `lessons learned.md`.
3. Diff summary:
   - Follow-up diff is focused on local input boundaries, local library resource bounds, production artifact leakage checks, and private download hardening.
   - Full checkout diff still includes pre-existing user WIP from before the security scan.
4. Commit state:
   - Not committed. Reason: checkout was dirty before this work and contains overlapping WIP that should be separated before staging.
5. Base/main divergence:
   - `HEAD` and `origin/main` both equal `3be519432c1109a873a435f522094bd4507cc8be`.
6. Potential conflicts:
   - Direct overlap with existing WIP in `src/App.tsx`, `src/components/FieldPanel.tsx`, `src/i18n.ts`, `src/styles.css`, and docs/lessons files.
   - Future overlap risk with asset-pack loader, ProjectPanel import flow, local-library persistence, visual diff, or private calibration tooling.
7. Verification:
   - Targeted front-end tests: passed, 5 files and 30 tests.
   - Python contract tests: passed, 12 tests.
   - Python compile: passed.
   - `npm run validate`: passed, including the new `verify:dist-private-boundary` script.
   - `git diff --check`: passed with line-ending warnings only.
8. Unverified risk:
   - No browser smoke; this pass changes file/import/resource boundaries that are covered by unit/type/build/Python checks.
   - No hash pinning for Python downloads by plan; add a hash manifest only if official resources become stable enough to maintain.
9. Recommended next step:
   - Isolate and stage only security-scan plus lightweight-hardening hunks, then commit with Lore trailers.
10. Integration status:
   - Ready for integration.
