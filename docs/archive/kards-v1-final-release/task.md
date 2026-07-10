# KARDS Card Forge v1.0.0 Final Release Task

## Checklist

- [x] Confirm clean base, release history, GitHub authentication, and current rights notices.
- [x] Select a standardized limited-fork source-available license from official text.
- [x] Add and review the Simplified Chinese README.
- [x] Add the license and resource-rights scope notice.
- [x] Advance package metadata to `1.0.0`.
- [x] Complete independent reviews and repair confirmed findings.
- [x] Run all local release gates.
- [ ] Package and verify the code-only archive from the immutable candidate.
- [ ] Integrate and push the exact release candidate.
- [ ] Verify GitHub CI, Pages, and Vercel Production for the candidate SHA.
- [ ] Save and deploy the same candidate privately through Sites.
- [ ] Publish and verify GitHub Release `v1.0.0`.
- [x] Freeze and archive the pre-publication repository record.
- [ ] Clean the integrated worktree and verify final alignment without a post-candidate commit.

## Delivery package

1. Changed the project-owned software license to the exact PolyForm Perimeter 1.0.1 text, separated resource/brand rights, added complete third-party notices, and documented the source-available boundary in English and Simplified Chinese.
2. Added the Chinese README, corrected both README and Help-page storage/resource language, advanced package metadata to `1.0.0`, and added a minimal Sites static Worker packaging step without changing application behavior or dependencies.
3. Core files: `README.md`, `README.zh-CN.md`, `LICENSE`, `RESOURCE-RIGHTS.md`, `package.json`, `package-lock.json`, `src/i18n.ts`, `.openai/hosting.json`, and `tools/prepare_sites_dist.mjs`. Test files: `src/components/HelpPage.test.ts`. Documentation/notice files: roadmap, reference-pack rights notice, third-party notice, registry, and this archived record. Temporary files: ignored `.runtime/v1-release/**` logs and generated `dist/**`, neither included in Git.
4. Relative to base `4a49d36992d43037fcb60dbd2733f287a3e8a534`, the candidate is a focused documentation/licensing/release-hosting change with one Help-copy test extension; no dependency or product-state architecture change. It will be committed once, then fast-forwarded to clean `main`.
5. Base, branch, local `main`, and `origin/main` were aligned before implementation; no branch divergence exists before candidate integration.
6. Worktree intersection check found no other active implementation worktree. Risk is green for file overlap, yellow for public license/README semantics, and red only for external publication until exact-SHA verification completes.
7. Verified: focused Vitest 2 files / 9 tests; full `npm run validate` 17 files / 242 tests plus 13 Python contracts; TypeScript; standard, Pages, and Sites builds; strict dist boundary; exact license plaintext; `git diff --check`; and `npm audit` with 0 vulnerabilities.
8. Remaining publication risks: GitHub CI/Pages, Vercel, Sites private deployment, Release assets, and exact-SHA alignment depend on external services. Sites must use the plugin packaging helper and private deployment only.
9. Recommended integration: commit the frozen candidate, fast-forward clean `main`, push once, verify all external targets against that SHA, create the code-only artifact/checksum externally, then tag and publish without another repository commit.
10. Integration status: ready for integration. Publication IDs, URLs, checksums, and remote run evidence belong in the GitHub Release and final operator report, not in a later repository commit.
