# How Not to Die on an Ordinary Tuesday

**A darkly funny, dead-serious forensic survival magazine & book incubator.**

Built directly from peer-reviewed autopsy & emergency-medicine case reports and the *How Not to Die* podcast archive. We roast bad physics, smug household appliances, and deceptive normal test results—never the people caught in them—so you know what to do in the first 60 seconds.

- **Live Magazine Reader:** `https://yorekms.github.io/ordinary-tuesday/`
- **Current Corpus:** **136 Full Live Stories** across 6 Everyday Danger Zones (all transcribed *How Not to Die* & Prevention episodes through `Ep 2620` / `Ep 1004`, plus 23 curated Forensic & Toxicology survival classics), with `Ep 1005–1007+` queued on the Rolling Studio Watchlist.
- **Single Source of Truth:** `data/catalog.json` + `data/stories.json`
- **One-Command Build Pipeline:** `python3 scripts/build_all.py`
  - Updates the static reader (`data/bundle.js`)
  - Rebuilds the 2-line hosted Carrd loader (`carrd/embed.js` + `carrd/carrd_2line_snippet.html`) plus fallback Carrd embeds (`carrd/carrd_embed.html` & `carrd/carrd_dynamic_embed.html`) with automatic `16,384` CRLF character validation
  - Compiles all individual Markdown chapters (`book/chapters/`), `book/MASTER_LINEUP.md`, and print-ready book manuscripts (`book/Ordinary_Tuesday_Manuscript.md` & `book/Ordinary_Tuesday_Print.html`)
- **Zero-Touch Carrd Sync:** Paste the 2-line `carrd/embed.js` snippet into Carrd (`Type: Code`, `Style: Inline` — never `Hidden`) to fetch `data/catalog.json` live from GitHub Pages so pushing new chapters to `main` updates both the Full Reader and the live Carrd site automatically without re-pasting.
