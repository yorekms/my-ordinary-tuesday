# Carrd.co & Rolling Publishing Guide
### *How Not to Die on an Ordinary Tuesday*

Your Static Magazine Reader is live on GitHub Pages at:
**`https://yorekms.github.io/ordinary-tuesday/`**

Everything runs from **one single source of truth**:
- `data/catalog.json` — All **111 live book chapters** (through `Ep 2620` / `PREV_1004`), toe-tag verdicts, and verified audio/transcript links
- `data/stories.json` — Complete long-form chapters, primary peer-reviewed DOIs, and printable First-60-Seconds survival cards

---

## Paste Into Carrd (Recommended: Rock-Solid 2-Line Hosted Loader)

1. Open your Carrd site (`https://my-ordinary-tuesday.carrd.co`) → click your **Embed** element.
2. Set **`Type: Code`** and **`Style: Inline`** — **NEVER `Hidden`**! *(Pasting the old 13.7 KB HTML into `Style: Hidden (Body End)` dropped the inline `<div id="otg">` markup and rendered a blank box.)*
3. Paste ONLY these **2 lines** (109 characters total — zero risk of Carrd truncation ever again):

```html
<div id="otg-mount"></div>
<script src="https://yorekms.github.io/ordinary-tuesday/carrd/embed.js"></script>
```

4. Save & Publish!

### What `carrd/embed.js` Includes Out of the Box
- **Bulletproof Mount & Fallback:** Injects CSS cleanly into `<head>`, mounts the `#otg` magazine cleanly into `#otg-mount` (with automatic `document.currentScript.parentNode` → `#embed01` → `.site-main > .inner` → `document.body` fallback if `#otg-mount` is absent), and appends the floating `#otg-dk` audio dock to `document.body`.
- **Full-Width Carrd Override:** Automatically widens Carrd's narrow default container (`.site-main > .inner`) to `1080px` so the 3-column magazine grid looks clean and spacious.
- **All 111 Live Stories + Live Search + Room Filters + Random Case:** Every card links directly to its full story page in the reader (`Read Story ↗`), plays the full variable-speed (`1×–2×`) podcast episode right inside Carrd with **`navigator.audioSession.type = 'playback'`** (so iOS Safari plays even with the silent switch on!), and links straight to the Resonance interactive transcript/player.
- **Zero Re-Pasting Forever:** Whenever `Ep 1005+` is published to GitHub Pages, your Carrd site automatically pulls the new stories on page load!

*(Legacy alternatives also rebuilt by `scripts/build_all.py`: **`carrd/carrd_dynamic_embed.html`** for single-block inline fetch, and **`carrd/carrd_embed.html`** as a zero-network offline fallback verified under Carrd's `16,384` CRLF character ceiling.)*

---

## Rolling "Listen → Publish" Command

Whenever a new story is added to `data/catalog.json` and `data/stories.json`:

```bash
cd /home/yorekms/Downloads/ordinary-tuesday
python3 scripts/build_all.py
git add -A
git commit -m "Publish new chapter"
git push origin main
```

Within ~60 seconds, GitHub Pages, the live 111-story Static Reader, the 2-line auto-syncing Carrd site (`carrd/embed.js`), and the compiled print book (`book/Ordinary_Tuesday_Print.html` & `book/Ordinary_Tuesday_Manuscript.md`) are all updated in lockstep.
