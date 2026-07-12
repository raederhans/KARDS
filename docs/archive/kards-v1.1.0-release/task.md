# KARDS Card Forge v1.1.0 Release Task

## Status

Local candidate verified and approved; frozen for exact-SHA publication.

## Delivery package

1. Change and release summary: advances metadata to `1.1.0`, closes Speed Insights Apache-2.0 notice coverage, excludes bundled placeholder artwork from the software/code-only boundary, and publishes bilingual notes for the eleven commits since `v1.0.0`.
2. Files: core metadata — `package.json`, `package-lock.json`; rights — `RESOURCE-RIGHTS.md`, `public/THIRD-PARTY-NOTICES.txt`; test — existing dist-boundary contract; documents — registry and this archived release record. Generated archives/logs remain ignored under `.runtime/releases/v1.1.0/`.
3. Candidate diff: no new runtime behavior or dependencies in this release commit; product functionality is the already-integrated `v1.0.0..ace5b8a` range. The release commit contains only version, rights, regression, notes, and control-plane closure.
4. Commit/tag/deployment state: the next Lore commit is the immutable candidate and recovery reference; tag `v1.1.0`, GitHub Release, and Vercel deployment must resolve to that exact SHA.
5. Alignment: task base `ace5b8a` was clean and equal to `origin/main`; no tag or Release is created until the candidate is pushed and its CI/Pages checks pass.
6. Conflict assessment: green at worktree level because only the main checkout exists. External publication remains red until the exact candidate is verified on GitHub and Vercel.
7. Local validation: focused 19/19; full 257 Vitest tests; 26 Python contracts; TypeScript; standard and Pages builds; exact Apache license comparison; strict dist boundary; zero npm audit findings; independent `APPROVE` and architecture `CLEAR`.
8. Remaining behavior/risk: authored fields intentionally persist as an automatic same-origin browser draft; they are not Vercel server state. Uploaded image bytes are excluded. Placeholder first-load size is a non-blocking follow-up, and fixed-path assets require post-deploy cache-header/hash probes.
9. Recovery: before publication, use `ace5b8a`; after publication, use the annotated `v1.1.0` tag. Vercel rollback baseline is `dpl_2gTw282B99nigMt4F8b5igGhLtWM`.
10. Readiness: safe to form one candidate commit, push, verify GitHub CI/Pages, deploy the same SHA through Vercel preview→promotion, then publish the expanded-and-verified code-only asset without any later repository commit.
