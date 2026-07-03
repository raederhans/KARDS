# KARDS Style Replication Context

## 2026-07-03 Research Start

- The user correctly reported that the first MVP is visually only "似是而非" and does not match the real official KARDS card face.
- Local repo has one main worktree at `C:\Users\raede\Documents\KARDS`, branch `master`, HEAD `27f5ae7`.
- Working tree was clean before this research pass.
- Prior MVP is an integrated baseline, not an official-style replica.

## Official Evidence Collected

- KARDS support "Cards" article states static cards contain deployment and operation costs, stats, abilities, and rarity. It also states the header contains deployment cost, operation cost, name, and nation, and that Orders/Countermeasures do not have operation costs.
- Downloaded official support image attachments into `.runtime/research/official/`:
  - `static-view.png`: 800x700
  - `cost-unit-info.png`: 550x250
  - `unit-stats.png`: 550x300
  - `unit-abilities.png`: 550x300
- A simple pixel measurement of the official `static-view.png` card body gives approximately 426x598 for the non-red card pixels, aspect 0.712. This matches the existing 500x702 canvas ratio closely, so the output size can stay 500x702 while the internal layout must change.

## Early Visual Findings

- The official static unit card is organized as a narrow header strip, large artwork, floating stat row, flat ability text block, centered rarity pips, and small set icon.
- Current MVP uses a thick decorative frame, centered title, large circular nation badge, custom red separators, serif body text, and programmatic texture. These are the wrong structural grammar for precision replication.
- The issue is not a simple palette or CSS fix; the Canvas renderer needs a new template model.

## Reference Project Findings

- KardsGen's `Material/frame.png` is exactly 500x702. Its `CardGen.Generate(...)` uses fixed coordinates and a fixed draw order, making it the strongest coordinate reference.
- KardsGen unit artwork is drawn at `12,99,476,426`; non-unit artwork is drawn at `12,13,476,476`.
- KardsGen draws the unit name bar at `98,13,390,86`, nation icon around `(450,52)`, rarity at `222,675`, set mark near `(488,692)`, attack board at `88,468`, defense board at `330,473`, and type icon at `208,473` for most unit cards.
- CraftSoul/kards-image-tool confirms browser Canvas export and a `500x702` card image assumption for deck-image composition. It uses official card image URLs through `www.kards.com/images/card/...`.
- KARDS-Assets is useful as an asset organization reference, but its README explicitly says the hosted game assets belong to 1939 Games and are for personal/non-commercial fan use.

## Current Decision

- Keep the 500x702 canvas target.
- Treat current renderer styling as a replaceable rough placeholder.
- Do not copy official-derived assets into the default app during this pass.
- Next implementation should first do a no-official-asset geometry pass: fixed official-style layout tables plus programmatic placeholder layers.
- Asset-pack import should be a later, gated research mode. The local asset-pack boundary is a risk-reduction design, not a legal guarantee. Official-derived assets should stay outside git and outside the default public build.

## Source Links

- Official card mechanics and layout: https://support.kards.com/hc/en-us/articles/360026768151-Cards
- Official static-view attachment: https://support.kards.com/hc/article_attachments/27534092718105
- Official cost/unit attachment: https://support.kards.com/hc/article_attachments/27534109436825
- Official stats attachment: https://support.kards.com/hc/article_attachments/27534109439257
- Official abilities attachment: https://support.kards.com/hc/article_attachments/27534109441561
- Official Community License: https://support.kards.com/hc/en-us/articles/360027838532-KARDS-Community-License
- KardsGen: https://github.com/Lasereyes5/KardsGen
- CraftSoul/kards-image-tool: https://github.com/CraftSoul/kards-image-tool
- KARDS-Assets: https://github.com/Gary-nope/KARDS-Assets
