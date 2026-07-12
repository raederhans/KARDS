# Context

## 2026-07-12 — investigation start

- Task classified as `complex` because it crosses original visual evidence, private extraction tooling, production assets, Canvas rendering, and visual verification.
- Repository state: one worktree only, clean `main` at `b73e86f73c8f33817ba7eaab74f2bab72b087e00`, aligned with `origin/main`.
- Live process owner: primary agent owns Vite at `http://127.0.0.1:5173/`; stdout is `.runtime/vite-dev.stdout.log`.
- Initial evidence shows original Standard = four dark pips, Limited = three bronze pips, Special = two silver star tiles, Elite = one winged star badge.
- Current renderer already treats Elite/Special as grouped marks, so the remaining fault is likely in extraction fidelity, production asset freshness, exact size/anchor, or a combination. No code change is allowed until this is proven.
- Three read-only child reviews are active: original visual evidence, current code/data flow, and test/architecture strategy.

## 2026-07-12 — root cause and repair

- Root cause proven at the publication boundary: `public/reference-pack/v1/images/rarity-pip/elite-pip.png` and `special-pip.png` were stale `9x12` single-pip Stage 5 assets, while the renderer correctly expects one complete grouped mark for Elite/Special.
- Original-card evidence shows Elite is one centered winged badge and Special is two centered silver star tiles. The renderer's existing natural-size centered path already matches this contract.
- TDD RED added a public-resource contract to `tools/kards_private_calibration_contract_test.py`; it failed twice with actual `(9, 12)` versus expected Elite `(47, 20)` and Special `(33, 20)`.
- Minimal repair replaced only the two public PNGs with the already-generated complete authorized marks from the Stage 3 regression pack. Renderer, UI, state, schema, export, and extraction code were intentionally unchanged.
- TDD GREEN: `py -3 tools/kards_private_calibration_contract_test.py` passed 14/14.
- Browser verification used the existing primary-agent-owned Vite server. Both corrected resources returned HTTP 200. Stable Canvas pixels were saved to `.runtime/qa/rarity-special-canvas-stable.png` and `.runtime/qa/rarity-elite-canvas-stable-v2.png`; Special shows two silver tiles and Elite shows the full winged badge.
- A transient black Canvas capture occurred while asset-backed rerenders were still settling. Direct Canvas extraction plus a sampled black-pixel readiness condition proved the final Canvas was intact; no fallback or renderer patch was added.

## 2026-07-12 — scope extension

- The user requested a small visual consistency pass for Standard and “Rare”. The project has no `rare` id; the available adjacent option is `limited`, so the work proceeds as Standard + Limited.
- The Elite/Special change passed the full repository gate before this extension: 17 Vitest files / 242 tests, 14 Python contracts, TypeScript, Vite production build, and strict dist/reference-pack verification.
- The task remains active because Standard/Limited evidence, TDD, implementation, review, and a fresh final full gate are still pending.

## 2026-07-12 — Standard and Limited micro-adjustment

- Reference and source measurements proved the local inconsistency: both authorized single-pip PNGs are naturally `9x12`, but the renderer stretched them to `8x13` and anchored their shared fan baseline one pixel high.
- The original cards support keeping the existing `4/3` counts, `4px` gap, `0.08` rotation step, and `1.1px` fan drop. A larger grouped-asset migration could reproduce per-pip silhouette variation, but it is outside the requested micro-adjustment and would change the current resource contract.
- TDD RED extended the existing renderer test for both Standard and Limited. It first failed on width `8` versus `9`, then exposed the old baseline after the natural-size correction.
- Minimal GREEN changed only `pipWidth=9`, `pipHeight=12`, and the shared anchor from `slot.y+9` to `slot.y+10`; the focused renderer suite passed 55/55 and the private calibration contract passed 14/14.
- Stable Canvas evidence is `.runtime/qa/rarity-standard-final-stable.png` and `.runtime/qa/rarity-limited-final.png`. Both preserve their original counts, read as one centered fan, and share the corrected footer baseline.
- The first Standard capture contained transient black layers while image-backed rendering was settling. A later frame with zero sampled opaque-black pixels decoded normally; no recovery path or renderer fallback was justified.

## 2026-07-12 — final review and validation

- Three independent final reviews covered production code/architecture, original-reference visual fidelity, and test maintainability. All three approved the result after the test fixtures, rotation coverage, floating-point assertion, and Elite wing alpha threshold were corrected.
- First-principles conclusion: the smallest complete repair is two authorized grouped-mark assets plus three shared single-pip geometry constants. Runtime asset detection, rarity-specific presets, a second rendering path, or fallback layers would hide bad inputs or overfit this micro-adjustment.
- Final `npm run validate` passed: 17 Vitest files / 242 tests, 14 Python contracts, TypeScript, Vite production build, and strict dist/private-boundary verification.
- `git diff --check` passed with only expected Windows line-ending notices. `origin/main` remained aligned with the task base immediately before closeout.
- `lessons learned.md` already contains the applicable single-pip versus grouped-mark lesson, so no duplicate lesson was added.
- Remaining declared limitation: Standard/Limited still reuse one authorized pip image and therefore do not reproduce tiny per-pip silhouette differences from every original card. The requested consistency micro-adjustment is complete without changing that asset contract.
