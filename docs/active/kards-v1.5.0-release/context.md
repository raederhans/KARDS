# KARDS Card Forge v1.5.0 Release Context

## Current truth

- Task class: complex external publication.
- Sole worktree: repository root on `main`; pre-release HEAD is
  `db79844f017cc2f58065187411402a8d70477ea0`, one commit ahead of refreshed
  `origin/main` before release-specific edits.
- Latest published Release is `v1.4.0`; its annotated candidate is
  `caa2d5e6e57cf818128b1e6c56d912455cee4bde`.
- GitHub CLI is authenticated as `raederhans` with `repo` and `workflow`
  scopes.
- Vercel project `kards-card-forge` is linked locally as
  `prj_r7seUm18SrJauC6amLVTbdyqdRdi` under the recorded team. Global Vercel CLI
  is absent; the repository's last verified authenticated path is pinned
  `npx vercel@55.0.0`, and `whoami` succeeded as `qiushiyu2003-2073`.
- Version decision: `v1.5.0`, because the candidate adds backward-compatible
  user-visible adaptive text fitting and export diagnostics after `v1.4.0`.

## Decisions

| Date | Evidence or decision | Impact |
| --- | --- | --- |
| 2026-07-24 | User explicitly requested an updated Release and Vercel deployment. | GitHub tag/Release publication and Vercel Production deployment are authorized; force-push and credential changes remain out of scope. |
| 2026-07-24 | The feature uses the shared renderer and keeps automatic layout outside serialized authored state. | Release notes distinguish requested manual appearance from derived resolved layout. |
| 2026-07-24 | Prior releases require one immutable candidate across CI, Pages, tag, assets, and Vercel. | Freeze records before the Lore candidate; put deployment IDs and checksums in ignored runtime evidence and the final report. |
| 2026-07-24 | No new dependency or public card image entered the candidate. | Reuse the existing code-only archive exclusions and rights boundary unchanged. |

## Live process ownership

| Process | Owner | Command/shared resource | Stable evidence | State |
| --- | --- | --- | --- | --- |
| Release validation | Primary agent | `npm run validate`; `dist/`, Vite/npm caches | `.runtime/releases/v1.5.0/validate.log` | Passed: 24 files / 316 tests, 26 private contracts, typecheck, build, boundary check |
| Dependency audit | Primary agent | `npm audit --audit-level=moderate` | `.runtime/releases/v1.5.0/npm-audit.log` | Passed: 0 vulnerabilities |
| Pages and standard builds | Primary agent | Pages environment followed by standard `npm run build`; shared `dist/` | `.runtime/releases/v1.5.0/pages-build.log`, `standard-build-restore.log` | Passed serially; Pages subpath and root-relative paths verified, standard `dist/` restored |
| GitHub workflows | Primary agent | candidate CI and Pages runs | `.runtime/releases/v1.5.0/github-runs.log` | Planned after push |
| Vercel Production | Primary agent | `npx --yes vercel@55.0.0 deploy --prod --yes`; linked project and production alias | `.runtime/releases/v1.5.0/vercel-prod.log` | Planned after tag/Release verification |

Success requires exit code 0, exact candidate identity where the provider
exposes it, and public HTTP 200 with a live JavaScript asset containing v1.5
text-fit markers. Failure is any nonzero exit, candidate mismatch, boundary
failure, protection page at the production alias, or unexpected browser/build
error. The primary agent alone starts, polls, retries, and stops these
processes; identical failures are not retried more than three times.

## Handoff

Pre-candidate validation passed. Next: freeze one immutable candidate SHA,
inspect its exact code-only archive, then push and monitor remote gates.
