# KARDS Card Forge v1.4.0 Release Task

## Current status

In progress. Independent review, repairs, and documentation synchronization are complete; release-grade local validation is running.

## Checklist

- [x] Confirm repository, branch, sole worktree, refreshed remote baseline, authentication, tag, and Release state.
- [x] Record scope, acceptance criteria, risks, and live-process ownership.
- [x] Complete code, test, documentation, and release-process audits.
- [x] Repair every confirmed release blocker with focused regression coverage.
- [x] Update English and Chinese README files plus in-app Help.
- [x] Bump package and lockfile metadata to `1.4.0` and write bilingual Release notes.
- [ ] Run focused tests, browser smoke, full validation, dependency audit, Pages build, and archive checks.
- [ ] Create and inspect the Lore candidate commit, then push `main`.
- [ ] Verify GitHub CI and Pages against the exact candidate SHA.
- [ ] Create annotated tag `v1.4.0`, publish the GitHub Release, and verify fresh downloads.
- [ ] Reconcile roadmap/registry truth and archive this task record.

## Validation evidence

| Command or check | Result |
| --- | --- |
| `git fetch --prune origin` | Passed; refreshed `origin/main` remains `3c83d776a453593cb22f8f6a5b1557d19da6dd6a` |
| `git worktree list --porcelain` | Passed; one `main` worktree |
| `gh auth status` | Passed; authenticated as `raederhans` |
| `gh release list --limit 10` | Passed; latest Release is `v1.3.0` |
| `git diff --check` | Passed before release-specific edits |
| Pages API and HTTP probes | Current `KARDS-DIY-GENERATOR` URL returned 200; former `/KARDS/` README URL returned 404 |
| Documentation/accessibility focused tests | Passed: 3 files / 30 tests |
| Version metadata check | Passed: package, lockfile root, and lockfile package all `1.4.0` |
| Final independent code re-review | APPROVE after closing the automatic-artwork derived-state P1; no remaining P0/P1/P2 findings |
| Primary-agent focused release tests | Passed: 10 files / 78 tests |
| Primary-agent typecheck and `git diff --check` | Passed |
| Editor-quality browser smoke | Passed: 16/16 checks, no page/console errors, port `5184` released |
| Final automatic-artwork regression | Passed: real `none → applyAutomaticArtwork → replace` path; focused App/history/upload suite 36/36 |
| `npm run validate` | Passed after the final repair: 24 files / 308 tests, 26 private-tool contracts, typecheck, production build, and dist boundary |
| `npm audit --audit-level=moderate` | Passed: 0 vulnerabilities |
| Pages-mode build | Passed: `/KARDS-DIY-GENERATOR/` favicon, JavaScript, and CSS paths verified |
| Standard build restoration | Passed: root-relative production paths restored and dist boundary rechecked |

## Open risks and remaining work

- Code-only archive inspection and remote publication checks remain.
- Commit, tag, and publication are not yet complete.
