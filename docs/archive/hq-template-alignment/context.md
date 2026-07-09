# HQ template alignment context

## 2026-07-09 - reproduction and diagnosis

- Base: `main` at `1d6c9da01b6f3ea0570767661e804b7230bebd36`; only the main checkout exists and it started clean.
- Browser reproduction at `http://127.0.0.1:5173/` showed the generated Moscow HQ still using a generic card composition while the official reference uses a large top title, centered emblem, central defense board, and simple lower text area.
- `DEV_PREVIEW_REFERENCE_SAMPLES` includes HQ samples even though `ProjectPanel` also renders a second HQ selector.
- `App` stores `selectedReferenceSampleId` and `selectedHqSampleId` separately while both handlers replace the same editable card and reference.
- The HQ selector is preselected as Washington before Washington is loaded. Returning from an ordinary sample to the same displayed HQ value does not fire native `select` change, so the card remains on the ordinary sample.
- Current HQ layout reuses command composition: top-right nation mark, bottom title, command border, and generic placeholder artwork.

## Process ownership

- Browser, tests, build, and validation owner: main agent (`/root`).
- Static review lanes only: `hq_state_flow`, `hq_visual_audit`, `hq_ui_review`.
- No shared live-process log exists yet; commands are short foreground checks unless a long process requires a `.runtime` log.

## 2026-07-09 - implementation and verification

- Replaced the overlapping ordinary-card and HQ selectors with one grouped action picker. It returns to its placeholder after every action, so the same template can always be loaded again after edits or resets.
- Template loading now commits the card, reference sample, and reference URL only after the card JSON or HQ artwork crop is ready. The picker exposes a loading state and template failures render beside the picker.
- HQ rendering now uses the full `166x179` shield at `(166,343)`, omits the `HQ` label and corner nation mark, and renders the defense value at the visually calibrated `104px`, `0.85` horizontal scale, centered at `y=420.5`.
- HQ dev samples use the official top artwork crop `(12,13,476,476)` without committing private pixels, plus localized titles and rules text for all five references.
- Browser checks passed for Washington, London, Moscow, Truk, and Danzig; `London HQ -> T-70 -> London HQ` and `London -> edit title -> reload London` both updated immediately.
- Final verification passed: targeted 80 tests, `npm run validate` with 149 tests, production build, private-boundary check, `git diff --check`, and three independent static reviews.
