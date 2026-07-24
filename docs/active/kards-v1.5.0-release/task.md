# KARDS Card Forge v1.5.0 Release Task

## Current status

In progress. Release/version baseline, authentication, v1.5.0 metadata,
roadmap, bilingual notes, and durable records are aligned. Full validation,
dependency audit, Pages build, and standard build restoration passed; exact
candidate formation and archive inspection are next.

## Checklist

- [x] Confirm worktree, remote, latest Release, package version, GitHub auth,
  Vercel project binding, and prior exact-SHA release rules.
- [x] Update package/lockfile metadata, roadmap, bilingual Release notes, and
  durable task records for v1.5.0.
- [ ] Run full validation, dependency audit, Pages build, standard restore, and
  code-only archive boundary checks.
- [ ] Create and inspect the Lore candidate commit and push `main`.
- [ ] Verify candidate GitHub CI and Pages runs.
- [ ] Tag and publish v1.5.0 with verified code-only ZIP and checksum assets.
- [ ] Deploy the exact candidate to Vercel Production and verify public assets.
- [ ] Archive this task record and reconcile the worktree registry.

## Evidence

| Check | Result |
| --- | --- |
| `git worktree list --porcelain` | One worktree at the repository root |
| `git fetch --prune origin` | Passed on 2026-07-24 |
| Pre-release branch state | Local `main` at `db79844f017cc2f58065187411402a8d70477ea0`, one commit ahead of `origin/main` |
| Latest GitHub Release | `v1.4.0`, published 2026-07-22 |
| `gh auth status` | Authenticated as `raederhans`; repository/workflow scopes available |
| Package metadata before edits | `1.4.0` in package and both lockfile root fields |
| Version decision | `v1.5.0`, a backward-compatible user-visible capability release |
| Vercel project link | `kards-card-forge`, project `prj_r7seUm18SrJauC6amLVTbdyqdRdi` |
| Vercel CLI path | Global CLI absent; reuse previously verified pinned `npx vercel@55.0.0` |
| `npx --yes vercel@55.0.0 whoami` | Authenticated as `qiushiyu2003-2073` |
| `npm run validate` | Passed: 24 Vitest files / 316 tests, 26 private-tool contracts, TypeScript, production build, and dist boundary |
| `npm audit --audit-level=moderate` | Passed: 0 vulnerabilities |
| Pages-mode build | Passed with `/KARDS-DIY-GENERATOR/` asset and favicon paths |
| Standard build restoration | Passed with root-relative assets; dist boundary reverified |

## Open risks

- Cross-OS text metrics are not claimed to be pixel-identical.
- Native `Intl.Segmenter` remains the browser baseline for grapheme-safe
  truncation; no partial fallback or new dependency is added.
- Manual offsets remain explicit authored geometry. A future safe-region
  warning would be a separate contract, not part of this release.
