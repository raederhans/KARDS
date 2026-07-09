# HQ template alignment plan

## Goal

Make HQ samples load reliably from one unambiguous control and render with the actual HQ composition: full upper artwork, top title, centered nation emblem, central HQ defense board, and lower rules text.

## Acceptance criteria

- The template picker has one state source and groups ordinary cards separately from HQ templates.
- The initial custom draft does not falsely claim that a sample has been loaded.
- `London HQ -> T-70 -> London HQ` always loads the requested card and matching reference.
- HQ rendering does not use the ordinary command/unit title, nation-mark, or footer composition.
- All five private HQ references can be selected in the browser and the generated preview updates immediately.
- Targeted tests, typecheck/build, `npm run validate`, browser smoke, and final review pass.

## Phases

1. Reproduce the selection and visual failures in the local browser; record root cause.
2. Add failing catalog, UI, state, layout, and renderer regression tests.
3. Replace the duplicated sample controls with one grouped template picker and one active sample state.
4. Implement the dedicated HQ layout and renderer composition using existing asset slots.
5. Verify every HQ sample in the browser, run the repository validation gate, review the diff, then commit and push.

## Constraints

- Official/private reference images remain under `.runtime` and are never bundled or committed.
- No automatic HQ load when a user merely edits the card type; explicit template selection may replace the draft.
- The main agent exclusively owns browser and live test/build processes.
