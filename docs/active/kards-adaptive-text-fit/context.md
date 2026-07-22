# KARDS Adaptive Text Fit Context

## Current truth

- 2026-07-22: one worktree; local `main`, `HEAD`, and `origin/main` all resolve
  to `67d0c66a5fead87e54e5301690964506b697ec6c`; the worktree was clean before
  this task record was created.
- Title rendering currently starts from `45 * fontScale`, shrinks toward 18 px,
  then truncates a single line with `...`.
- Body rendering currently starts from `24 * fontScale`, wraps Latin/CJK and
  body markup, shrinks toward 16 px, then ellipsizes the final visible line.
- Existing manual `fontScale`, `scaleX`, `scaleY`, `offsetX`, `offsetY`, and
  title `bold` values are already normalized, serialized, stored, and included
  in authored history.
- The roadmap already calls for surfacing title/body truncation before export
  instead of silently relying on the renderer.

## Decisions and evidence

| Time | Evidence or decision | Impact |
| --- | --- | --- |
| 2026-07-22 | The user requested overflow control plus adaptive adjustment that composes with existing manual controls | Treat fitting as a derived safety layer over authored appearance preferences |
| 2026-07-22 | Task crosses renderer layout, editor feedback, localization, browser QA, tests, and documentation | Classified `complex`; use durable records, TDD, headed browser QA, and independent review |
| 2026-07-22 | Existing title/body renderers already implement partial automatic shrinking | Repair and expose the existing seam instead of adding another renderer or dependency |
| 2026-07-22 | Existing title band is designed as a single-line official-style region | Keep one-line layout by default; require evidence before adopting multi-line titles |
| 2026-07-22 | Prior body-markup repair showed blind string slicing can leave incomplete `**...**` tokens | Preserve semantic markup through fitting and ellipsis operations |
| 2026-07-22 | Figma separates Auto width, Auto height, and Fixed size; tldraw separates auto-size from fixed-width wrapping while preserving an alignment anchor | Keep the title's fixed centered safe region; do not grow or reposition the card from text content |
| 2026-07-22 | Konva applies ellipsis only after fixed width/height and visible-line calculation; Fabric.js and Excalidraw handle unspaced CJK/emoji at grapheme or measured-character boundaries | Preserve the current fixed-region/final-line fallback, and make truncation grapheme-safe rather than slicing UTF-16 code units |
| 2026-07-22 | Mature editors keep manual dimensions/style separate from derived measurement | Keep manual appearance serialized; return requested/resolved size and fit state from the renderer without persisting them |
| 2026-07-22 | Architecture review found that current title/body fitters return `void`, hiding their automatic decisions from the UI and export preflight | Add one renderer-owned `fits` / `adjusted` / `truncated` report; do not build a parallel validator |
| 2026-07-22 | Headed browser baseline on the current GitHub Pages release reproduced long Chinese and English title/body ellipsis with no user-visible fit status | Add field-level accessible feedback and export warnings sourced from the render report |
| 2026-07-22 | Setting both manual font scales to 145% left the long-text result governed by the hidden minimum-size fallback | Show requested and resolved font size so manual preference and automatic reduction are understandable together |
| 2026-07-22 | A hand-written fallback covered emoji but still split Hangul and Indic graphemes | Require native `Intl.Segmenter` rather than claiming incomplete Unicode safety or adding a new runtime dependency |
| 2026-07-22 | Review reproduced a stale-report window after card/font/render-option changes | Bind report freshness to card, render options, and font readiness; block export while pending and compare the authoritative export report before delivery |

## External references

- Figma Help, “Adjust text dimensions and resizing”:
  <https://help.figma.com/hc/en-us/articles/27378154668951-Adjust-text-dimensions-and-resizing>
- tldraw text shape and measurement:
  <https://tldraw.dev/sdk-features/text-shape> and
  <https://tldraw.dev/sdk-features/text-measurement>
- Konva `Text` fixed width/height, wrapping, measuring, and ellipsis:
  <https://konvajs.org/api/Konva.Text.html>
- Fabric.js `Textbox` fixed width, wrapping, and grapheme handling:
  <https://fabricjs.com/api/classes/textbox/>
- Excalidraw measured bound-text wrapping source:
  <https://github.com/excalidraw/excalidraw/blob/a3b90897b5d770a27d53773db670ddfda983ae85/packages/element/src/textWrapping.ts#L443-L547>

## Live process ownership

| Process | Owner | Port/session | Log or artifact path | State |
| --- | --- | --- | --- | --- |
| Remote v1.4 baseline browser | primary agent | Playwright session `kards-overflow-baseline` | `output/playwright/kards-adaptive-text-fit/` | Completed and closed; current Pages URL checked with long Chinese/English text and 145% manual font scale |
| Local adaptive-fit browser | primary agent | `127.0.0.1:5185`, Playwright session `kards-overflow-local` | `.runtime/local-ui-5185.log`; temporary screenshots inspected locally | Completed and closed; long Chinese/English, 145% manual scale, Ready/warning transitions, and clean console verified; port 5185 free |

## Live-test conditions

- Success: page and fonts load, long Chinese/English cases render, status text
  matches the Canvas outcome, screenshots are captured, and no unexpected
  console errors occur.
- Failure: port collision, server exit, missing fonts/assets, stale HMR state,
  or a status/Canvas mismatch.
- Stop: close the named Playwright sessions and terminate the exact local Vite
  process tree; verify port 5185 is free afterward.

## Handoff

The adopted seam is a renderer-owned derived report with field feedback and
export warnings. The fixed single-line title band remains unchanged; no second
validator, persisted calculated layout, or new dependency is introduced.
Focused RED reproduced missing-report/UI and grapheme-splitting failures. Final
local headed checks, 144 expanded targeted tests, the 316-test repository gate,
26 private-tool contracts, TypeScript, production build, and dist verification
pass. Follow-up review closed report freshness, Unicode, and offset-scope
concerns. Record archival and commit/push closeout remain.
