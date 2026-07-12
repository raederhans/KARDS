# KARDS Card Forge v1.1.0 Release Plan

## Goal

Audit the complete `v1.0.0..HEAD` candidate, publish GitHub Release `v1.1.0`, and deploy the exact release commit to the linked Vercel Production project.

## Scope

- Preserve the current automatic-draft behavior; document that same-origin browser storage restores authored card content across reopen/redeploy.
- Advance package metadata from `1.0.0` to `1.1.0` without changing dependencies.
- Review all eleven functional commits since `v1.0.0`, repair only verified blockers, and validate the exact release candidate.
- Publish a code-only archive that additionally excludes `public/artwork/**`; do not attach a complete `dist` or standalone reference pack.
- Verify GitHub CI/Pages, annotated tag, Release assets/checksums, Vercel Production, stable alias resources, and exact-SHA alignment.
- Do not modify README or deploy Sites in this task.

## Plan

- [x] Complete independent code, architecture, persistence, and release-flow audits.
- [x] Record the automatic-draft conclusion and any verified release blockers.
- [x] Bump version metadata and prepare bilingual release notes.
- [x] Run focused persistence checks, full validation, Pages build, dependency audit, and artifact-boundary checks.
- [ ] Freeze the candidate records, commit with Lore trailers, and push `main`.
- [ ] Verify GitHub CI and Pages for the exact candidate SHA.
- [ ] Deploy and verify the same candidate on Vercel Production.
- [ ] Build, expand, and checksum the code-only release archive.
- [ ] Create annotated tag `v1.1.0`, publish the GitHub Release, and re-download/verify its assets.
- [ ] Archive records and confirm local/remote/tag/Release/Vercel alignment.

## Live Process Ownership

- The primary agent exclusively owns validation, builds, GitHub status polling, packaging, Release creation, Vercel deployment, and remote probes.
- Review agents are read-only and must not start or monitor live processes.
