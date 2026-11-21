# How Not to Die on an Ordinary Tuesday

**A darkly funny, dead-serious forensic survival magazine & book incubator.**

Built directly from peer-reviewed autopsy & emergency-medicine case reports and the *How Not to Die* podcast archive. We roast bad physics, smug household appliances, and deceptive normal test results—never the people caught in them—so you know what to do in the first 60 seconds.

- **Live Magazine Reader:** `https://yorekms.github.io/ordinary-tuesday/`
- **Current Corpus:** **105 Full Live Stories** across 6 Everyday Danger Zones (all transcribed *How Not to Die* & Prevention episodes through `Ep 2614` / `Ep 998`), with `Ep 999–1001+` queued on the Rolling Studio Watchlist.
- **Single Source of Truth:** `data/catalog.json` + `data/stories.json`
- **One-Command Build Pipeline:** `python3 scripts/build_all.py`
  - Updates the static reader (`data/bundle.js`)
  - Rebuilds both Carrd embeds (`carrd/carrd_embed.html` & `carrd/carrd_dynamic_embed.html`) with automatic `16,384` CRLF character validation
  - Compiles all individual Markdown chapters (`book/chapters/`), `book/MASTER_LINEUP.md`, and print-ready book manuscripts (`book/Ordinary_Tuesday_Manuscript.md` & `book/Ordinary_Tuesday_Print.html`)
- **Zero-Touch Carrd Sync:** Because `carrd/carrd_dynamic_embed.html` fetches `data/catalog.json` directly from GitHub Pages, pushing new chapters to `main` updates both the Full Reader and the live Carrd site automatically without re-pasting the embed.
