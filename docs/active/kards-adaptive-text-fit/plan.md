# KARDS Adaptive Text Fit Plan

## Goal

Make title and body overflow visible and predictable, while adapting text to
the card's existing layout and preserving the current manual font scale,
horizontal/vertical scale, offset, and title-weight controls.

## Product contract

- Automatic fitting is derived from the authored card plus the selected card
  layout; calculated font sizes, line breaks, and ellipses are not persisted.
- Manual appearance values remain authored preferences. Automatic fitting may
  reduce text from the requested size to keep it inside the supported region,
  but it never rewrites or resets those values.
- If text still cannot fit at the supported minimum size/line count, the
  renderer uses a deterministic ellipsis and the editor exposes that state
  before export.
- Chinese and English use the same fitting and status contract.
- Preview and export continue to share the same renderer; export may differ
  only by its requested pixel scale.

## Stages

- [x] Stage 1: Capture current repository, renderer, browser, and external
  reference evidence.
- [x] Stage 2: Freeze the narrow adaptive-layout and user-feedback contract.
- [x] Stage 3: Add focused failing tests for title/body fitting, manual-control
  composition, and overflow status.
- [x] Stage 4: Implement the smallest model-free derived layout and editor
  feedback changes.
- [x] Stage 5: Inspect representative long Chinese and English cards in a
  headed browser and refine only reproduced defects.
- [ ] Stage 6: Targeted/full verification, independent review, and roadmap/help
  updates are complete; archive the record, then commit and push.

## Acceptance criteria

- Long titles stay inside the title region at the supported minimum font size;
  unrecoverable overflow is deterministic and visible to the user.
- Long body copy wraps by Latin/CJK rules, shrinks from the manual requested
  size, respects the existing line/region limits, and ellipsizes only at the
  final visible line when necessary.
- Manual font scale, scale X/Y, offsets, and title bold remain serialized and
  stack with adaptive fitting without being mutated by rendering. Deliberate
  offset geometry remains an explicit override rather than being silently
  reset or mislabeled as content truncation.
- The editor reports normal, adaptively reduced, and truncated states for title
  and body before export, with localized accessible text.
- Focused renderer/model/UI tests, typecheck, build, browser checks, and final
  `npm run validate` pass.

## Non-goals

- Replacing Canvas, introducing a rich-text editor, or adding a runtime text
  dependency.
- Persisting calculated line breaks/font sizes or adding a second layout schema.
- Changing title/body maximum input lengths, card geometry, or the existing
  appearance preset contract without reproduced evidence.
- Treating deliberate manual offsets as content overflow; a future safe-region
  geometry diagnostic would be a separate, explicitly named contract.
- Pixel-perfect baselines across operating systems, fonts, browsers, and GPUs.

## Risks

- A multi-line title could conflict with the one-line official-style banner, so
  it is not adopted unless browser evidence proves it is needed and safe.
- Canvas measurements depend on the loaded fonts; checks must use the same
  renderer/font-loading path as preview and export.
- Manual offsets can deliberately move text toward or beyond a safe region.
  This pass preserves that authored geometry and reports only automatic
  size/wrap/ellipsis decisions; it does not silently rewrite the offset.
