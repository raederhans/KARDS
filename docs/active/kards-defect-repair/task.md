# KARDS Defect Repair Task

## Checklist

- [x] Classify task as complex + integration.
- [x] Read applicable workflows and lessons learned.
- [x] Create isolated worktree and branch.
- [x] Record clean baseline validation.
- [x] Add and observe failing regression tests.
- [x] Repair artwork/project import/export correctness.
- [x] Repair PDF page-size semantics and crop precision.
- [x] Repair local-library concurrency.
- [x] Repair asset-pack aggregate resource bounds.
- [x] Repair publish gates and validation routing.
- [x] Align release/authorization internal documentation.
- [x] Run targeted and full verification.
- [x] Close the final independent code, architecture, and verification reviews.
- [ ] Commit, integrate into main, revalidate, push, and clean worktree.

## Delivery Package

1. Changed behavior (five points):
   - bound artwork export to the exact decoded source and validate embedded project
     artwork before normalization;
   - preserve PDF physical dimensions, precise crop values, reliable file reads,
     and repeatable file selection;
   - serialize local-library writes with the browser's origin-wide lock;
   - enforce local and URL asset-pack structure, type, signature, byte, pixel,
     ambiguity, and concurrency contracts;
   - make default CI/Pages/Vercel builds verify the exact publish artifact and run
     the named private-tool contract without adding authorization UI.
2. Files:
   - core: `src/App.tsx`, `src/browserFiles.ts`, `src/limits.ts`,
     `src/components/ProjectPanel.tsx`, `src/components/FieldPanel.tsx`,
     `src/assetPack.ts`, `src/localLibrary.ts`, `src/exportCard.ts`;
   - tests: existing tests beside those modules plus
     `tools/verify_dist_private_boundary.test.mjs`;
   - release/config: `package.json`, `requirements-dev.txt`, CI/Pages workflows,
     `.vercelignore`, the dist verifier, and its private-tool runner;
   - docs: roadmap, registry, public pack notice/neutral metadata, and archived
     security-scan records; no temporary source files remain.
3. Diff summary: approximately 1.3k insertions and 450 deletions across product,
   test, release-contract, and documentation surfaces; security-scan records are
   moved unchanged from active to archive.
4. Commit state: implementation, regressions, release contracts, and delivery
   records are committed together at this repair branch HEAD with Lore trailers.
5. Divergence: the repair branch is one commit ahead of base
   `8ae036ce641bee80f90f3fbb6a7e318754cadcf9`; `main` remains at that base until
   the planned fast-forward integration.
6. Overlap/conflict: no other KARDS worktree was present at task start; direct
   file-overlap risk is green, while release and asset-loading semantics are yellow
   and therefore require full validation and independent review before integration.
7. Verification: final targeted 61/61; final `npm run validate` passed 195 Vitest,
   13 Python, TypeScript, production build, and dist verifier; Pages-mode build
   passed; moderate audit found 0 vulnerabilities; `git diff --check` passed.
8. Remaining risk: no browser visual smoke was run because the changed behaviors
   are covered by code-level contracts; the dist negative test exercises verifier
   helpers rather than a full temporary malicious-dist CLI fixture.
9. Recommended next step: merge with `--ff-only` after final review approval,
   re-run `npm run validate` on `main`, then push and clean the worktree.
10. Integration readiness: three independent reviewers returned `APPROVE`; ready
    for integration, but not safe to clean until the commit is merged, revalidated,
    and pushed.
