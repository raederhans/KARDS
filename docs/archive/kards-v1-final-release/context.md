# KARDS Card Forge v1.0.0 Final Release Context

## 2026-07-10 — baseline

- Task class: complex integration and external production publication.
- Worktree: `C:\Users\raede\.codex\worktrees\kards-v1-final-release-20260710` on `codex/kards-v1-final-release`.
- Base: clean `origin/main` at `4a49d36992d43037fcb60dbd2733f287a3e8a534`.
- Latest published release: `v0.3.0`; latest successful CI and Pages runs both target base SHA `4a49d36992d43037fcb60dbd2733f287a3e8a534`.
- Repository has no root software license. `public/reference-pack/v1/RIGHTS-NOTICE.txt` grants no ownership or redistribution rights, while the paper texture has its own CC0 notice.
- The Open Source Definition requires free redistribution and unrestricted fields of endeavor, so a license that limits competing Forks must be described as source-available rather than open source.
- PolyForm Perimeter 1.0.1 permits use, modification, and distribution but excludes products marketed as substitutes for the software, including free substitutes. This matches the requested limited-Fork boundary more closely than a blanket noncommercial restriction.
- GitHub CLI is authenticated as `raederhans` with repository and workflow scopes. Repository is public at `raederhans/KARDS`.
- The primary agent owns all live validation and publication processes.
- The user added a Sites deployment target. The existing static Vite architecture remains unchanged; Sites receives the same `dist` plus a minimal static Worker entry and its own hosting metadata. The deployment will be private unless the connector exposes only public deployment, in which case publication must pause for explicit approval.

## 2026-07-10 — implementation and review findings

- Added reciprocal English and Simplified Chinese README files. Both now state the actual draft/project/library artwork boundary and distinguish File System Access from Web Locks.
- Added the official PolyForm Perimeter 1.0.1 plaintext as `LICENSE`; an exact normalized comparison against the official `.txt` matched SHA-256 `759c25fc92b55e5cec63ecd24c936e036266ff85bca098844d8b0c6d647d56c6`.
- Added bilingual `RESOURCE-RIGHTS.md`, a reference-pack cross-reference, and a deployed third-party notice containing the full OFL 1.1 text and package copyright statements.
- Independent license, documentation, and release-readiness reviews agree that the project must be described as source-available, that public repository copies must remove or independently license excluded resources, and that v1.0.0 must not upload a standalone reference pack or a complete `dist` archive.
- To make the limited derivative-software path practical, v1.0.0 will attach one code-only source archive and checksum. The archive excludes the reference pack, bundled brand image files, and maintainer-specific Sites metadata, but still contains the project name in source and documentation; it is explicitly not a ready-to-deploy complete application.
- The final exact-SHA sequence will place task archival and registry closeout in the candidate before publication. No repository commit may follow the tag, because that would move Pages and Vercel away from the tagged candidate.
- GitHub's automatically generated source archives will still contain tracked files at the tag. Release notes therefore state that repository/archive presence is not a resource-rights grant.

## 2026-07-10 — pre-publication verification

- Final local gate passed: 17 Vitest files / 242 tests, 13 private Python contracts, TypeScript typecheck, production build, and the strict dist/private-boundary verifier.
- The Pages-mode build passed and emitted the required `/KARDS/assets/` base. The Sites-mode build passed and emitted `dist/server/index.js`; the deployment archive must still be created only through the Sites plugin `scripts/package-site.sh` so hosting metadata is added and validated.
- `npm audit --audit-level=moderate` reported 0 vulnerabilities. Focused Help/i18n checks passed 2 files / 9 tests. The official PolyForm plaintext comparison remained exact after the final review edits.
- Three independent reviewers completed two rounds covering license/resource scope, Chinese/English user documentation, architecture, release sequencing, artifact boundaries, and Sites packaging. All blocking findings were repaired before candidate formation.
- Deterministic code-only artifact recipe: run `git archive --format=zip --output <archive> HEAD -- . ':(exclude)public/reference-pack/v1' ':(exclude)public/brand' ':(exclude)public/favicon.svg' ':(exclude).openai/hosting.json'` from the exact candidate. Expand/list the result and require that those paths, `dist/**`, `.runtime/**`, `.env*`, `.vercel/**`, logs, uploads, and private calibration outputs are absent while `LICENSE`, `RESOURCE-RIGHTS.md`, both README files, `public/THIRD-PARTY-NOTICES.txt`, `package.json`, and `src/**` are present.
- This record is frozen before publication so GitHub, Pages, Vercel, Sites, the tag, and Release can all target one commit. Deployment/run/version IDs and artifact checksums are external publication evidence and must not trigger a post-candidate repository commit.

## Official license references

- PolyForm Perimeter 1.0.1: https://polyformproject.org/licenses/perimeter/1.0.1
- PolyForm license comparison: https://polyformproject.org/licenses
- Open Source Definition: https://opensource.org/osd
