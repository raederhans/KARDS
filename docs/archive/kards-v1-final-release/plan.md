# KARDS Card Forge v1.0.0 Final Release Plan

## Goal

Publish a stable `v1.0.0` release with a complete Simplified Chinese README, a standardized limited-fork source-available license, explicit resource-rights boundaries, and verified GitHub Pages, Vercel, and Sites deployments.

## License Decision

- Apply the unmodified PolyForm Perimeter License 1.0.1 to repository-owned software.
- Describe the project as source-available, not OSI open source.
- Permit use, modification, and redistribution except when the result is offered as a competing substitute for KARDS Card Forge.
- Keep trademarks, project branding, KARDS-derived/reference resources, third-party resources, and user-supplied style packs outside the software license unless their own notice explicitly grants rights.
- Require Fork maintainers to obtain all rights needed for any resources they include or use.

## Scope

- Add `README.zh-CN.md` and reciprocal language links.
- Add the official `LICENSE` text and a bilingual scope/resource notice.
- Update package metadata to `1.0.0` without changing dependencies or runtime behavior.
- Add the minimal static-worker packaging entry required to host the same Vite output on Sites, with no product architecture change.
- Prepare bilingual release notes plus one code-only source archive and checksum. Exclude `public/reference-pack/v1/**`, `public/brand/**`, `public/favicon.svg`, `.openai/hosting.json`, generated output, runtime files, environment files, Vercel metadata, logs, uploads, and private calibration data; do not publish a standalone reference pack or complete `dist` archive.
- Validate standard, GitHub Pages, and Sites builds, dependency audit, license/resource boundaries, the code-only archive, GitHub CI/Pages, Vercel Production, Sites private deployment, tag, Release assets, and final local/remote alignment.

## Plan

- [x] Record repository, release, deployment, and authorization baselines.
- [x] Implement the Chinese README, license, resource notice, and version metadata.
- [x] Complete independent license, documentation, architecture, and release-readiness reviews.
- [x] Run focused checks, `npm run validate`, Pages-mode build, dependency audit, and release-boundary checks.
- [x] Finalize the pre-publication registry and delivery package, move the task records to `docs/archive/`, and form the single release candidate commit in the isolated worktree.
- [ ] Integrate that commit into clean `main` and push the exact candidate.
- [ ] Push the exact candidate and verify GitHub CI and Pages for its SHA.
- [ ] Deploy and verify the same candidate on Vercel Production.
- [ ] Build Sites from the clean candidate, package only with the Sites plugin `scripts/package-site.sh`, save the version against the pushed candidate SHA, privately deploy it, and verify the returned URL.
- [ ] Create the code-only archive from the exact candidate, expand it to confirm all excluded paths are absent and required source/license files are present, and place its SHA-256 checksum only in the external `SHA256SUMS.txt` Release asset.
- [ ] Create annotated tag `v1.0.0`, publish the GitHub Release, and verify the uploaded code-only archive and checksum.
- [ ] Confirm `main`, `origin/main`, tag, Release, Pages, Vercel, and Sites alignment without making a post-candidate repository commit, then clean the integrated worktree.

## Live Process Ownership

- The primary agent exclusively owns validation, builds, packaging, all three deployment targets, tag/release creation, and remote status polling.
- Review agents are read-only and may inspect completed files or logs, but must not start or monitor live processes.
