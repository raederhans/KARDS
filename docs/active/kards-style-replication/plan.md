# KARDS Card Style Replication Plan

## Task Grade

- Grade: complex
- Reason: the request changes the core Canvas visual model, asset policy, typography, and future template structure.
- Current owner: main Codex agent owns research, documentation, and any live process.
- Subagents:
  - official visual evidence: official static card structure and licensing
  - reference projects: KardsGen, kards-image-tool, KARDS-Assets
  - current gap review: current renderer versus official card structure

## First-Principles Goal

The user does not need a generic WWII card generator. The target is a local static tool that can produce a KARDS-looking card face. Therefore the first acceptance bar is not "nice design"; it is structural similarity to official static card view:

1. Match the official card-body proportion.
2. Match the major information zones: header, artwork, stat row, ability text, rarity/set footer.
3. Match the visual grammar of costs, operation cost, title strip, nation mark, unit stats, text block, and rarity pips.
4. Keep official IP boundaries explicit: do not bundle official assets by default unless the user later accepts that policy risk.

## Plan

- [x] Confirm local repo state, existing constraints, and lessons learned.
- [x] Collect official card-face evidence from KARDS support pages and official images.
- [x] Inspect reference projects for coordinate systems, asset organization, and browser export patterns.
- [x] Compare current renderer against the evidence.
- [x] Produce an implementation-ready replication spec and risk notes.
- [x] Run a final review pass before reporting.

## Non-Goals For This Research Pass

- No gameplay, deck legality, account, automation, or cheating features.
- No README edits.
- No bundled official asset pack in production code during research.
- No broad redesign until the official structure is pinned down.
