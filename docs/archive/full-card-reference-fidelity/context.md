# Context

## 2026-07-12 — investigation start

- Classified as `complex`: the symptom crosses reference UI actions, async sample JSON loading, editor-state replacement, artwork decoding/crop state, Canvas rendering, and visual comparison.
- Base is clean `main` at `fb0db78f99b2c03b70cf4dc2a36953d77aa0f3b0`, aligned with `origin/main`; only the main checkout exists.
- Vite PID `72956` on `http://127.0.0.1:5173/` remains owned by the primary agent.
- Existing repository lessons require reference-only selectors, artwork-only application, and explicit full-card loads to remain separate actions.
- Three read-only review lanes cover UI/data flow, sample/renderer fidelity, and test-contract gaps. They may not run the live server, browser, tests, or builds.

## 2026-07-12 — reproduced root cause and minimal repair

- The explicit action path is correct: the selected sample ID reaches `resolveDevPreviewTemplateSelection`, replaces the editable card, and keeps the matching reference URL. Artwork data is present in all ordinary samples.
- Browser reproduction with T-70 proved the deterministic mismatch: under the Chinese UI, the English reference keyword `Guard` was rendered as `守护` because the Canvas used the global UI language.
- A first HQ title hypothesis was rejected after browser evidence: the reference intentionally contains an English title inside the artwork crop and a localized Chinese title in the lower text band, so the existing Chinese editable title was correct.
- The public pack has icon layers but no official fonts or complete frame/board layers. Pixel identity is not an honest contract; the action now says `载入可编辑模板` / `Load editable template`.
- RED evidence: focused Vitest run failed exactly three new contracts for sample keyword language, model normalization, and Canvas language precedence.
- Repair: `CardSpec.keywordLanguage` persists the sample's keyword language, reference samples set it to English, and the renderer prefers it over the UI language. Existing custom cards without this field still follow the UI language.
- Focused verification passed 5 files / 128 tests. Browser smoke after a clean reload and fresh T-70 load showed `Guard` under a Chinese UI and preserved the correct artwork, frame, stats, and title.

## 2026-07-12 — review and closure verification

- Three independent reviews found no P0/P1 blocker. Two reviewers identified the same persistence-test gap; the third identified a hidden-state edge case after explicit keyword or card-type edits.
- The language marker now survives autosave, project JSON import, and local-card-library round trips. Existing test entrypoints cover all three boundaries.
- Explicit keyword edits and card-type changes clear the reference language marker. This keeps the loaded template faithful until the player intentionally changes the keyword semantics, then returns rendering to the UI language.
- Review follow-up RED evidence failed the two intended contracts before implementation. The repaired focused suite passed 5 files / 102 tests.
- Full `npm run validate` passed 17 Vitest files / 252 tests, 25 private-tool contracts, TypeScript checks, the Vite production build, and the strict dist/private boundary check.
- Final first-principles review retained the optional card-level language field: it is the smallest persisted input that directly determines exported pixels. App-only state or a renderer-only override would drift across autosave/import/library boundaries.
