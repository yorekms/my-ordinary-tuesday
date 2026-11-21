# Reusable Wave Update & Book Publishing Pipeline

Whenever new *How Not to Die* episodes are recorded and indexed in your Master Podcast Sheet (`1BeAwVdAlCSZ7dxurF03hOJmdDzfxFPWcPcO1tnA4FR0`), run this repeatable 4-script workflow from the repo root (`/home/yorekms/Downloads/ordinary-tuesday/`):

---

## Step 1 — Fetch & Stage New Episodes (`scripts/fetch_new_episodes.py`)
Discovers all newly recorded *How Not to Die* episodes not yet in `data/catalog.json`, matches direct 256 kbps GitHub Release `.m4a` URLs + Google Drive audio fallback IDs, downloads full verbatim `.md` transcripts concurrently, extracts primary PMC IDs/DOIs, and flags any topic overlaps:

```bash
python3 scripts/fetch_new_episodes.py --all-new --out /tmp/next_wave
```

## Step 2 — Harvest Commercial-Book-Safe `CC BY` Clinical Exhibits (`scripts/harvest_exhibits.py`)
Enforces the Commercial Book Copyright Firewall across every newly staged episode (or any existing story missing exhibits):
- **`CC BY 3.0` / `CC BY 4.0` / `CC0`:** Selects the highest-value dignified clinical figure (X-ray, CT, MRI, ECG, ultrasound, endoscopy, clinical photo), optimizes to `max 1080px` JPEG Q82 in `assets/exhibits/`, applies the opt-in `[ UNSEAL CLINICAL EXHIBIT ]` blur shield to graphic wounds/gross pathology, and records full citation + license metadata.
- **`CC BY-NC` / `CC BY-NC-ND`:** Never downloaded locally; automatically generates an External Clinical Evidence Locker link-out bar pointing directly to PMC.

```bash
python3 scripts/harvest_exhibits.py --manifest /tmp/next_wave/manifest.json --out /tmp/next_wave/preharvest_exhibits.json
```

*(Always audit the printed captions before publishing to confirm dignity and blur-shield settings.)*

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

## Step 4 — Build Book (Auto TOC + Sequential Chapters + Illustrated PDF), Deploy & Backup (`scripts/publish_release.py`)
Runs `scripts/build_all.py --pdf`, verifies JS syntax & exhibit integrity, commits and pushes to GitHub Pages (auto-updating `https://my-ordinary-tuesday.carrd.co/`), and updates your Google Drive Backup Vault **in-place** (preserving every Drive file ID and link):

```bash
python3 scripts/publish_release.py --message "Wave 6: Add next chapters + clinical exhibits"
```

### How Book Positioning Works
- Every chapter automatically slots into its matching Part (**Part I: Garage** through **Part VI: Pets**) inside `book/Ordinary_Tuesday_Manuscript.md`, `book/Ordinary_Tuesday_Print.html`, and `book/Ordinary_Tuesday_Book_Draft.pdf`.
- `scripts/build_all.py` automatically builds a **clickable Table of Contents** and assigns sequential **Chapter 1 .. Chapter N** numbering across Parts I–VI alongside each story's permanent `File №` archive ID.
- To pin or reorder flagship chapters inside any Part without changing URLs or `File №`, add `"bookOrder": 1` (or `2`, `3`...) to that entry in `data/catalog.json` and re-run `python3 scripts/build_all.py --pdf`.
