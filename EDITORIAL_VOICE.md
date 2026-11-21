# Editorial Voice & Rolling Publishing Protocol
### *How Not to Die on an Ordinary Tuesday*

## 1. Voice Calibration ("Darkly Funny, Dead Serious")
- **Target Vibe:** A sleep-deprived forensic pathologist writing a 2 a.m. *New Yorker* field dispatch—equal parts Mary Roach (*Stiff*), *The Worst-Case Scenario Survival Handbook*, and dry gallows humor.
- **Turn the darkness up—aimed at the right target:** Roast bad physics, smug consumer appliances, human hubris, overconfident folk remedies, and how laughably thin the margin is between "ordinary Tuesday" and "stainless-steel table." **Never** mock, blame, or punch down at any real patient, victim, or grieving family.
- **No Boilerplate Template Kickers:** Let bespoke literary subheadings carry each chapter naturally—do NOT stamp `01 · THE INNOCENT TUESDAY` / `02 · PHYSICS ENTERS THE CHAT` onto every story. Keep only the iconic visual anchors readers rely on:
  1. **Toe-Tag Verdict** (`Looks Like` vs. `Actually Is` + `Cause / Mechanism / Manner / Fatal False Reassurance`)
  2. **Perforated `✂ First 60 Seconds` Tear-Off Survival Card**
  3. **Verbatim Autopsy / Clinical Proof Ledger + Clickable Primary DOIs**
- **Strict Epistemological Honesty:** Zero invented meals, dialogue, vitals, or causal leaps. Preserve missing fields and source discrepancies transparently.

## 2. Rolling "Listen → Greenlight → Publish" Workflow
Because episodes are being listened to and QC'd in real time:
1. **Listen:** Matthew listens to an episode (any existing Ep 901–986, C-series, or brand-new Ep 987–992+).
2. **Greenlight:** Send the episode number (plus any favorite dark line, twist, or takeaway from listening).
3. **Draft & Publish:**
   - Pull the verbatim transcript + primary treatise from Drive.
   - Add/promote the entry in `data/catalog.json` (`"status": "live"`, `"audioReviewed": true`) and write the full chapter in `data/stories.json`.
   - Run `python3 scripts/build_all.py` to regenerate `data/bundle.js`, `carrd/carrd_embed.html`, `book/MASTER_LINEUP.md`, and the compiled book manuscripts.
   - Push to GitHub Pages (`git push`) → Static Reader updates live immediately, and `carrd_dynamic_embed.html` updates the Carrd magazine automatically with zero re-pasting.
