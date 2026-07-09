# Card-kind reference samples plan

## Objective

When the editable card is still untouched, selecting any of the eight card kinds should load a complete, public-safe example for that kind into both the canvas and field panel. After the player changes card content, later kind selections must preserve authored content and may only fill target-required numeric fields that never had a value and were not deliberately cleared.

## Acceptance criteria

1. HQ, infantry, tank, fighter, bomber, artillery, order, and countermeasure each have a localized reference card with fields appropriate to that kind.
2. A pristine editor may switch repeatedly between kinds and receive the selected kind's full example.
3. Any normal field edit, artwork/crop edit, appearance edit, project import, or explicit private template load marks the editor as user-edited.
4. After user editing, kind selection never replaces title, body, keywords, identity, existing values, artwork, or appearance; target-required numeric values are filled only when absent and not explicitly cleared.
5. Reset returns the editor to pristine reference mode.
6. Card data, edited/pristine state, and deliberately cleared numeric fields are persisted atomically; legacy drafts are conservatively protected as authored.

## Execution stages

- [x] Inspect current card model, kind selector, autosave, reset, import, and async template paths.
- [x] Add failing regression tests for all kind templates, pristine switching, edited-card preservation, numeric-clear provenance, and reset/reload classification.
- [x] Implement one editor-state boundary and connect dedicated kind/import/reset handlers.
- [x] Run targeted tests, typecheck, full validation, browser smoke, and three independent reviews.
- [x] Complete delivery records and archive this task folder with the closeout change.

## Constraints

- Built-in examples must use generated placeholders only; no private or official-derived artwork may enter the public source tree.
- Edited/pristine state and numeric-clear provenance are editor state, not part of exported `CardSpec`.
- Do not add fallback layers or infer pristine state from localStorage key existence alone.
