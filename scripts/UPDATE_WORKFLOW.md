# Reusable Wave Update & Book Publishing Pipeline

Whenever new *How Not to Die* episodes are recorded and indexed in your Master Podcast Sheet (`1BeAwVdAlCSZ7dxurF03hOJmdDzfxFPWcPcO1tnA4FR0`), run this repeatable 4-script workflow from the repo root (`/home/yorekms/Downloads/ordinary-tuesday/`):

---

## Step 1 — Fetch & Stage New Episodes (`scripts/fetch_new_episodes.py`)
Discovers all newly recorded *How Not to Die* episodes not yet in `data/catalog.json`, matches direct 256 kbps GitHub Release `.m4a` URLs + Google Drive audio fallback IDs, downloads full verbatim `.md` transcripts concurrently, extracts primary PMC IDs/DOIs, and flags any topic overlaps:

```bash
python3 scripts/fetch_new_episodes.py --all-new --out /tmp/next_wave
```

## Step 2 — Harvest Commercial-Book-Safe Visual Exhibits (`scripts/harvest_exhibits.py` + `scripts/harvest_reference_exhibits.py`)
Enforces the Commercial Book Copyright Firewall (**strictly allowed:** `CC BY 4.0`, `CC BY 3.0`, `CC BY 2.0`, `CC0 1.0`, `Public Domain` / US Gov; **hard-rejected:** `CC BY-NC`, `CC BY-ND`, `CC BY-SA`, GFDL, or unverified licenses):
- **Tier 1 — Primary Case Report (`scripts/harvest_exhibits.py`):** Selects the highest-value dignified clinical figure from each story's cited `CC BY` / `CC0` PMC article, optimizes to `max 1080px` JPEG Q82 in `assets/exhibits/`, applies the opt-in `[ UNSEAL CLINICAL EXHIBIT ]` blur shield to graphic wounds/gross pathology/endoscopy/histology, and creates External Clinical Evidence Lockers for `CC BY-NC` / `NC-ND` primary papers.
- **Tier 2 & 3 — Peer-Reviewed Reference & Hazard Field Photos (`scripts/harvest_reference_exhibits.py`):** Where a primary paper has no commercial-safe figure, searches Europe PMC OA `CC BY` cases (`tier: "reference"`, clearly labeled *"Illustrative — not the index patient"*) and Wikimedia Commons `PD`/`CC0`/`CC BY` photos (`tier: "hazard"`, clearly labeled *"Illustrative — not the index scene"*), rendering 4×4 contact sheets for visual review before merging.

```bash
python3 scripts/harvest_exhibits.py --manifest /tmp/next_wave/enriched_manifest.json --out /tmp/next_wave/preharvest_exhibits.json
# Optional: fill any remaining visual gaps with visually-audited Tier 2/3 commercial-safe exhibits
python3 scripts/harvest_reference_exhibits.py --out /tmp/next_wave/ref_staged.json --contact-sheets /tmp/next_wave/sheets
```

*(Always visually audit contact sheets before publishing to confirm subject accuracy, dignity, and blur-shield settings.)*

## Step 3 — Draft Chapters + Quizzes & Merge (`scripts/merge_wave.py`)
Draft each episode into `{catalogEntry, storyEntry, quiz}` following `EDITORIAL_VOICE.md`, then validate and merge cleanly into `data/catalog.json`, `data/stories.json`, and `data/exhibits.json`:

```bash
python3 scripts/merge_wave.py \
  --inputs /tmp/next_wave/outputs/batch_*.json \
  --exhibits /tmp/next_wave/preharvest_exhibits.json \
  --wave-label "Wave 6 Drops"
```

This automatically:
- Validates prose word counts, 5-pillar structure, HTTPS citations, and balanced 3-option quiz answers
- Places every chapter into its proper Room (`garage`, `kitchen`, `medicine`, `outdoors`, `hospital`, `pets`)
- Refreshes the **`🆕 Latest Studio Drops`** Starter Pack (`?pack=latest`) and expands the randomized Survival Exam pool
- Clears newly ingested episodes from the Studio Watchlist

## Step 4 — Build Book + Image Stock Ledger + PDF, Publish GitHub Release, Backup Drive & Sync Google Doc (`scripts/publish_release.py`)
Runs `scripts/build_all.py --pdf` (embedding all verified Tier 1/2/3 exhibits **and** all bespoke vector SVG infographics directly into the printable book, plus generating `assets/exhibits/IMAGE_STOCK_MANIFEST.csv` and `book/IMAGE_STOCK_LICENSE_LEDGER.md`), verifies JS syntax, exhibit integrity, and zero commercial-license violations, commits and pushes to GitHub Pages (auto-updating `https://my-ordinary-tuesday.carrd.co/`), updates the public GitHub Release `latest-book` (`Ordinary_Tuesday_Book_Draft_Latest.pdf`, `Ordinary_Tuesday_Images_Stock_All_Exhibits.zip`, `Ordinary_Tuesday_All_<N>_Chapters_MD.zip`), refreshes every Google Drive Vault file & browsable `Images_Stock_and_Exhibits/` folder in-place (`--max 0`, zero duplicates), and syncs your native Google Doc Master Lineup (`--sync-doc`):

```bash
python3 scripts/publish_release.py --sync-doc --message "Wave N: Add next chapters + clinical exhibits"
```

### How Book Positioning Works
- Every chapter automatically slots into its matching Part (**Part I: Garage** through **Part VI: Pets**) inside `book/Ordinary_Tuesday_Manuscript.md`, `book/Ordinary_Tuesday_Print.html`, and `book/Ordinary_Tuesday_Book_Draft.pdf`.
- `scripts/build_all.py` automatically builds a **clickable Table of Contents** and assigns sequential **Chapter 1 .. Chapter N** numbering across Parts I–VI alongside each story's permanent `File №` archive ID.
- To pin or reorder flagship chapters inside any Part without changing URLs or `File №`, add `"bookOrder": 1` (or `2`, `3`...) to that entry in `data/catalog.json` and re-run `python3 scripts/build_all.py --pdf`.
