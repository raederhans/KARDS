# KARDS Security Scan Plan

## Scope

- Task level: complex security/integrity/defense assessment.
- Target: repository-wide scan of `C:\Users\raede\Documents\KARDS`.
- Scan id: `3be519432c11_20260709T110919`.
- Scan bundle: `C:\Users\raede\AppData\Local\Temp\codex-security-scans\KARDS\3be519432c11_20260709T110919`.
- Base commit: `3be519432c1109a873a435f522094bd4507cc8be` on `main`.
- `origin/main` after `git fetch --prune origin`: `3be519432c1109a873a435f522094bd4507cc8be`.
- Current checkout was dirty before scan; existing edits are treated as user WIP and must not be reverted.

## Success Criteria

- Repository threat model is created or reused.
- High-impact runtime surfaces are reviewed with coverage receipts.
- Concrete findings are validated before fixes.
- Safe fixes are applied with targeted tests and `npm run validate`.
- Final scan report, worktree registry entry, and delivery package are written.

## Phases

- [x] Preflight: verify scan capability, subagent availability, and goal tracking.
- [x] Phase 1: create repository threat model.
- [x] Phase 2: discover findings across runtime, persistence, file/import/export, dependencies, build/deploy, and private-asset boundaries.
- [x] Phase 3: validate candidate findings and suppress false positives with evidence.
- [x] Phase 4: analyze attack paths and severity for surviving findings.
- [x] Fix: patch validated issues without touching unrelated WIP.
- [x] Verify: run targeted checks and final validation.
- [x] Closeout: write final report, update registry, and record major lessons.

## Live Process Ownership

- Main agent owned all live commands and tests.
- `security-reviewer` did a read-only static review only.
- No subagent started or monitored `npm run validate`, builds, browser smoke, or dev servers.

## Validation Run

- `npm run validate`: passed; typecheck, 15 Vitest files, 138 tests, production build.
- `py -3 -B -m py_compile tools\kards_private_calibration.py tools\kards_multisource_extraction.py tools\kards_private_calibration_contract_test.py`: passed.
- `py -3 tools\kards_private_calibration_contract_test.py`: passed, 10 tests.
- `npm audit --audit-level=moderate`: passed, found 0 vulnerabilities.
- `rg -n "\.runtime|kards-private-assets|stage5|stage6|DEV_PREVIEW|Washington\.png|t70\.card|dingo\.card" dist`: no matches.
- `git diff --check`: passed with Windows LF-to-CRLF warnings only.

## Closeout Status

- Ready for integration.
- Not committed because the main checkout had pre-existing user WIP, including files touched by this scan (`src/i18n.ts` and `lessons learned.md`).
- Final reviewer found an encoded traversal gap in asset-pack manifest validation; it was fixed and covered by `%2e%2e/...` tests before closeout.
- Recommended next step: isolate/stage only the security-scan hunks, then commit with Lore trailers after user WIP ownership is clear.

## Lightweight Hardening Follow-Up

- [x] Add shared image magic-byte validation for PNG/JPEG/WebP while preserving existing MIME and size gates.
- [x] Add decoded image pixel bounds for artwork upload, reference comparison, and local asset-pack image files.
- [x] Add local-library file size and card-count limits.
- [x] Add a production `dist` private-boundary verification script and run it from `npm run validate` after build.
- [x] Add Python download URL allowlist, response status checks, and a 12 MB response limit.

## Follow-Up Validation

- `npm test -- --run src/assetPack.test.ts src/components/FieldPanel.test.ts src/components/ProjectPanel.test.ts src/visualDiff.test.ts src/localLibrary.test.ts`: passed, 5 files and 30 tests.
- `py -3 tools\kards_private_calibration_contract_test.py`: passed, 12 tests.
- `py -3 -B -m py_compile tools\kards_private_calibration.py tools\kards_multisource_extraction.py tools\kards_private_calibration_contract_test.py`: passed.
- `npm run validate`: passed, typecheck plus 15 Vitest files and 142 tests, production build, and `verify:dist-private-boundary`.
- `git diff --check`: passed with Windows LF-to-CRLF warnings only.
