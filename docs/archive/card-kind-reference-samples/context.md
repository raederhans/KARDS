# Card-kind reference samples context

## 2026-07-09 — initial audit

- The only current card state is `card` in `App.tsx`; `updateCard` increments `cardEditVersionRef` but does not retain an edited/pristine classification.
- `FieldPanel` currently routes the kind selector through the same `onCardChange` callback as every other edit, so the type action cannot be distinguished from content authoring.
- `ProjectPanel` routes JSON import and reset through the same callback. Reset therefore needs a dedicated handler if it is to restore pristine reference behavior.
- Private template loading writes directly with `setCard`; its async request guard must remain intact and successful explicit loading must mark the card as user-edited.
- Autosave writes the initial card immediately. Therefore localStorage key presence is not evidence of a user edit; the classification must be stored explicitly with the draft.
- `FieldPanel` renders deployment for every non-HQ kind, operation only when `hasOperationCost`, attack/defense only when `hasStats`, and HQ defense only for HQ. Reference data must clear fields that a kind does not use.

## Live-process ownership

- Main agent owns all Vitest, typecheck, build, validation, dev-server, and browser checks for this task.
- Review agents are restricted to static analysis and completed command output.

## 2026-07-09 — implementation decisions

- Added one `CardEditorState` boundary containing the normalized card, explicit `hasUserEdits`, and provenance for the five numeric fields a player deliberately cleared.
- Pristine type selection replaces the whole card with a localized public-safe reference. Authored type selection preserves all card content and fills only target-required numeric fields that are absent and have no clear provenance.
- Numeric-clear provenance is type-aware: structural absence is not treated as a player clear, while an actual clear survives repeated HQ/command/unit round trips and page reloads.
- Full imports and explicit private template loads create fresh authored editor state instead of inheriting provenance from the previous card.
- Autosave now uses one versioned localStorage envelope for card content, edit classification, and clear provenance. Legacy raw-card drafts are read as authored and migrated conservatively.
- HQ rendering ignores preserved model keywords and uses the no-keyword body position, while retaining those keywords for a later switch back to a normal card.
- Corrected the adjacent private-preview error channels: asset-pack requests clear asset-pack errors and template requests clear template errors.

## Verification evidence

- Red/green regression passes covered all eight examples, authored preservation, cross-type value filling, multi-step clear provenance, replacement/import provenance reset, atomic persistence, legacy recovery, and HQ keyword suppression.
- Targeted gate: 5 files / 103 tests passed, followed by TypeScript checks.
- Repository gate: `npm run validate` passed 15 files / 168 tests, TypeScript, Vite production build, and `dist` private-boundary verification. Final stderr log was empty.
- Browser: verified pristine HQ initialization; edited HQ to fighter with title retained and unit values filled; edited draft persisted across reload; edited tank to HQ retained title and filled defense 20; HQ rarity/set controls remained disabled; reset restored the pristine tank reference. Browser console had no warnings or errors.
- Three independent static reviews covered UI/API wiring, state/persistence, and visual/data-shape behavior. Two discovered edge cases during review; both were fixed and their final reviews approved with no blocker.
