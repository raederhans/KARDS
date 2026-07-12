# KARDS Card Forge v1.1.0 Release Context

## 2026-07-12 — baseline

- Task class: complex integration and external production publication.
- Worktree: sole checkout `C:\Users\raede\Documents\KARDS` on `main` at `ace5b8accc8543a4305327020348c947528015e8`; worktree is clean and aligned with `origin/main`.
- Latest published Release: `v1.0.0`, tag commit `e60cfe9df6c718f63f62d6540a98a15c15ec2ebf`, published 2026-07-10 with a code-only archive and checksum.
- Candidate range: eleven commits in `v1.0.0..HEAD`, covering Vercel-only Speed Insights, disclosure correction, rarity/faction/set-mark cleanup, body emphasis, full-card reference fidelity, default placeholder artwork, and shared special-unit attack-reticle fidelity.
- Version decision: `v1.1.0` because the range includes backward-compatible user-visible capability additions, not only bug fixes.
- GitHub CI and Pages already passed for pre-release HEAD `ace5b8a`, but must run again for the versioned candidate commit.
- Vercel CLI `55.0.0` is authenticated and linked to `qiushiyu2003-2073s-projects/kards-card-forge` (`prj_r7seUm18SrJauC6amLVTbdyqdRdi`).
- Primary agent owns all live validation and publication processes. Independent agents own code-review, architecture, and persistence/release-flow read-only audits.

## Automatic draft behavior

- `App` initializes the editor from `loadDraftCardState(window.localStorage, fallback)` and saves the atomic draft back after edits.
- The production domain remains stable across Vercel deployments, so its same-origin `localStorage` survives a new build and is restored on the next visit.
- This is an intentional automatic-draft feature, not stale Vercel HTML or server-side state. The visible “Reset current card” action restores the localized default and the autosave then persists that reset state.
- Uploaded artwork data URLs are deliberately stripped from automatic drafts; lightweight card fields and appearance state are preserved.

## 2026-07-12 — independent audit blockers

- Code and architecture reviews found no functional regression in the eleven-commit candidate, but blocked publication on two distribution-boundary defects.
- `@vercel/speed-insights@2.0.0` is shipped in Vercel builds under Apache-2.0, while the deployed third-party notice omitted its license. The notice now carries the package/source attribution, Vercel copyright, and full Apache License 2.0 text.
- The user-supplied default placeholder under `public/artwork/**` has no separate redistributable provenance. `RESOURCE-RIGHTS.md` now excludes that directory from the software license, and the v1.1.0 code-only archive must exclude it.
- Regression tests first failed on both omissions and will gate the corrected notices before the release candidate is formed.
- Non-blocking observation: the 890,080-byte placeholder is fetched on first load. It is cached and is not a publication blocker; encoding or lazy-loading changes require a separate visual/performance task.

## 2026-07-12 — candidate metadata

- Package and lockfile metadata advanced together from `1.0.0` to `1.1.0`; dependency ranges and resolved dependency versions are unchanged.
- Bilingual release notes summarize the eleven-commit range, explain automatic drafts, and state that `public/artwork/**` is excluded from the code-only Release asset.

## 2026-07-12 — frozen local candidate evidence

- Independent final verdicts: code-reviewer `APPROVE` with zero remaining findings; architect `CLEAR`; persistence/release audit confirmed the automatic-draft contract and `v1.1.0` release shape.
- TDD publication-boundary cycle: the existing verifier first failed 2/5 on the missing Speed Insights license and artwork exclusion, then failed 1/5 on an exact stray-character defect, and finally passed 5/5 after the minimal notice fixes.
- Focused persistence/boundary suites passed 19/19. The full `npm run validate` passed 17 Vitest files / 257 tests, 26 Python contracts, TypeScript, standard Vite build, and strict dist/reference-pack verification.
- GitHub Pages-mode `build:verified` passed and emitted `/KARDS/assets/`; a final standard-root `build:verified` then passed to leave `dist/` in Vercel-comparable form.
- Speed Insights' 190-line Apache license block exactly matches the installed package license. `npm audit --audit-level=moderate` reported zero vulnerabilities across 158 dependencies.
- Known Vercel rollback baseline before the release: production deployment `dpl_2gTw282B99nigMt4F8b5igGhLtWM`, Ready at the stable alias.
- The repository record is frozen before publication. Candidate SHA, GitHub run IDs, Vercel deployment ID, artifact checksums, and release verification are written to ignored `.runtime/releases/v1.1.0/release-evidence.md` and the final operator report, not a post-tag repository commit.
