# Carrd.co & Rolling Publishing Guide
### *How Not to Die on an Ordinary Tuesday*

Your Static Magazine Reader is live on GitHub Pages at:
**`https://yorekms.github.io/ordinary-tuesday/`**

Everything runs from **one single source of truth**:
- `data/catalog.json` — All 40+ book chapters, toe-tag verdicts, and verified audio/transcript links
- `data/stories.json` — Complete long-form chapters, primary peer-reviewed DOIs, and printable First-60-Seconds cards

---

## Paste Into Carrd (Recommended: Auto-Syncing Full 40-Story Embed)

1. Open your Carrd site → click your **Embed** element (`Type: Code`, `Style: Inline`).
2. Paste the full contents of **`carrd/carrd_dynamic_embed.html`** (~10.5 KB — safely under Carrd's `16,384` CRLF ceiling!).
3. Save & Publish!

### What `carrd_dynamic_embed.html` Includes Out of the Box
- **Full-Width Carrd Override:** Automatically widens Carrd's narrow default container (`.site-main > .inner`) to `1080px` so the 3-column magazine grid looks clean and spacious.
- **Top-Bar & Hero Reader Links:** Prominent **`Open Full Reader ↗`** buttons right at the top (not buried at the bottom).
- **All 40 Live Stories + Live Search + Room Filters:** Every single card links directly to its full story page in the reader (`Read Story ↗`), plays the full variable-speed (`1×–2×`) podcast episode right inside Carrd, and links to the verbatim Drive transcript.
- **Zero Re-Pasting Forever:** Whenever we publish Episode `987`, `988`, `989`, `990+` to GitHub Pages, your Carrd site automatically pulls the new stories on page load!

*(Need a zero-network offline fallback embed? **`carrd/carrd_embed.html`** stays verified under `16,384` CRLF chars with 12 featured front-page cards + direct links to the full reader.)*

---

## Rolling "Listen → Publish" Command

Whenever a new story is added to `data/catalog.json` and `data/stories.json`:

```bash
cd /home/yorekms/Downloads/ordinary-tuesday
python3 scripts/build_all.py
git add .
git commit -m "Publish new chapter"
git push
```

Within ~60 seconds, GitHub Pages, the live Static Reader, the auto-syncing Carrd site, and the compiled print book (`book/Ordinary_Tuesday_Print.html` & `book/Ordinary_Tuesday_Manuscript.md`) are all updated in lockstep.
