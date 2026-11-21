#!/usr/bin/env python3
"""
One-Command Validation, Build, PDF Rendering, GitHub Pages Deploy, and
Google Drive Backup Vault In-Place Sync for "How Not to Die on an Ordinary Tuesday".

Preserves every existing Google Drive file ID so shared URLs never break!

Usage:
  python3 scripts/publish_release.py --message "Wave 5: Add Ep 2621-2653 (169 stories)"
  python3 scripts/publish_release.py --skip-push --skip-drive   # local verify + PDF only
"""

import argparse
import datetime
import json
import re
import subprocess
import sys
import zipfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# Permanent Google Drive Vault IDs (updated in-place so shared URLs stay valid forever)
DRIVE_VAULT_FOLDER = "1GxL-gO_RQPRLUkBf24wu7pF-2NH9pXLk"
DRIVE_DATA_FOLDER = "1_oZwlQaMqBXrHHuALJhuPrtRIcuNItKC"
DRIVE_CHAPTERS_FOLDER = "1_bd54qpX8qJxnv3sA01PJvlB4rogOK8U"
DRIVE_ROOT_IDS = {
    "pdf": "1xVQWHysuuUiyflrIvY9hphpdHzS79LYH",
    "zip": "1D2q4a3ZLuqHu9EoMXjxxfABIrJaxFa_u",
    "manuscript_md": "12tGwgzl_FcOL3nmx6WUwLZKQGKf3ksw8",
    "print_html": "1xGeoUYZaIBGCvc7Q13WwOU-ldrW5FkJg",
    "master_lineup": "11msi3HtIyztV_bpiaIU14HAfz3VdRGQh",
    "restore_map": "1qZa0ANBSZ7RYFy_rdCsHqCjvNUCn7bKi",
}


def run(cmd, cwd=None, check=True):
    print(f"  $ {' '.join(str(c) for c in cmd)}")
    p = subprocess.run(cmd, cwd=cwd or REPO_ROOT, text=True)
    if check and p.returncode != 0:
        raise RuntimeError(f"Command exited {p.returncode}: {cmd}")
    return p.returncode


def validate_repo():
    print("\n[1/5] Validating JS syntax, exhibits integrity, and inline Carrd scripts...")
    for js in ("assets/diagrams.js", "assets/app.js", "data/bundle.js", "carrd/embed.js"):
        run(["node", "--check", str(REPO_ROOT / js)])

    for fn in ("carrd/carrd_embed.html", "carrd/carrd_dynamic_embed.html"):
        txt = (REPO_ROOT / fn).read_text(encoding="utf-8")
        m = re.search(r"<script>(.*?)</script>", txt, re.S)
        assert m, f"Missing <script> in {fn}"
        p = subprocess.run(["node", "--check"], input=m.group(1), text=True, capture_output=True)
        assert p.returncode == 0, f"Inline JS error in {fn}: {p.stderr}"

    ex = json.loads((REPO_ROOT / "data/exhibits.json").read_text(encoding="utf-8"))
    cat = json.loads((REPO_ROOT / "data/catalog.json").read_text(encoding="utf-8"))
    stories = json.loads((REPO_ROOT / "data/stories.json").read_text(encoding="utf-8"))

    assert len(cat["cases"]) == len(stories), f"Catalog ({len(cat['cases'])}) != Stories ({len(stories)})"

    referenced = set()
    for sl, v in ex["stories"].items():
        for fg in v.get("clinicalFigures", []):
            p = REPO_ROOT / fg["src"]
            assert p.exists() and p.stat().st_size > 2000, f"Missing exhibit JPEG: {fg['src']} on {sl}"
            referenced.add(p.name)

    on_disk = {p.name for p in (REPO_ROOT / "assets/exhibits").glob("*")}
    orphans = on_disk - referenced
    if orphans:
        print(f"  [cleanup] Removing {len(orphans)} unreferenced exhibit JPEG(s): {sorted(orphans)}")
        for o in orphans:
            (REPO_ROOT / "assets/exhibits" / o).unlink()

    print(f"  OK: {len(cat['cases'])} stories, {len(referenced)} verified exhibit JPEGs, 0 JS errors.")
    return cat, ex


def build_zip(dest_zip):
    count = 0
    with zipfile.ZipFile(dest_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in sorted(REPO_ROOT.rglob("*")):
            if ".git" in p.parts or "__pycache__" in p.parts or p.is_dir() or p.suffix in (".zip", ".pdf"):
                continue
            zf.write(p, arcname=str(p.relative_to(REPO_ROOT.parent)))
            count += 1
    print(f"  Packed {count} repo files into {dest_zip.name} ({dest_zip.stat().st_size / 1024 / 1024:.2f} MB)")


def sync_google_drive(cat, ex, pdf_path, zip_path, commit_sha):
    print("\n[5/5] Syncing updated PDF, Repo Zip, Book Files & Data to Google Drive Vault (in-place)...")
    today = datetime.date.today().isoformat()
    total = len(cat["cases"])
    meta = ex.get("meta") or {}

    restore_md = REPO_ROOT / "book" / "_tmp_restore_map.md"
    restore_md.write_text(
        f"# How Not to Die on an Ordinary Tuesday — Complete Restore & Project Map\n\n"
        f"**Last Full Illustrated Backup:** {today} (GitHub commit `{commit_sha}`)\n\n"
        f"## Live URLs\n"
        f"- **Carrd Magazine Site (Auto-Synced):** https://my-ordinary-tuesday.carrd.co/\n"
        f"- **Full Static Web Reader:** https://yorekms.github.io/ordinary-tuesday/\n"
        f"- **Printable Wall Poster:** https://yorekms.github.io/ordinary-tuesday/poster.html\n"
        f"- **Randomized Survival Exam:** https://yorekms.github.io/ordinary-tuesday/?exam=1\n"
        f"- **GitHub Source Repo:** https://github.com/yorekms/ordinary-tuesday (`main`)\n\n"
        f"## Current Edition Totals\n"
        f"- **{total} Live Stories** arranged across all 6 Danger Zones (sequential Chapters 1–{total} with clickable Table of Contents in the Illustrated Book PDF)\n"
        f"- **{meta.get('ccByClinicalExhibitStories', 0)} Chapters with Verified CC-BY Clinical Exhibits** ({meta.get('ccByClinicalExhibitImages', 0)} local JPEGs) + **{meta.get('externalFigureLinkoutStories', 0)} NC/ND Evidence Lockers**\n"
        f"- **{meta.get('bespokeInfographics', 0)} Bespoke SVG Infographics** + **{meta.get('dynamicBlueprintStories', 0)} Dynamic Forensic Blueprints** ({total}/{total} illustrated)\n"
        f"- **{meta.get('perStoryQuizzes', 0)}/{total} Bespoke Per-Story Gut-Check Quizzes** + **{meta.get('examPoolSize', 0)}-Scenario Randomized Survival Exam**\n\n"
        f"## Reusable One-Command Update Pipeline\n"
        f"```bash\n"
        f"# 1. Pull newly recorded episodes & transcripts from Master Sheet + GitHub Releases\n"
        f"python3 scripts/fetch_new_episodes.py --all-new --out /tmp/next_wave\n"
        f"# 2. Pre-harvest commercial-safe CC-BY clinical exhibits\n"
        f"python3 scripts/harvest_exhibits.py --manifest /tmp/next_wave/manifest.json\n"
        f"# 3. Merge drafted story+quiz batches into data/{{catalog,stories,exhibits}}.json\n"
        f"python3 scripts/merge_wave.py --inputs /tmp/next_wave/outputs/batch_*.json --exhibits /tmp/next_wave/preharvest_exhibits.json\n"
        f"# 4. Validate, rebuild TOC + sequential book + PDF, push to GitHub, and sync Google Drive Vault\n"
        f"python3 scripts/publish_release.py --message \"Add next wave of chapters\"\n"
        f"```\n",
        encoding="utf-8",
    )

    # Update root Vault files in-place
    updates = [
        (DRIVE_ROOT_IDS["pdf"], pdf_path),
        (DRIVE_ROOT_IDS["zip"], zip_path),
        (DRIVE_ROOT_IDS["manuscript_md"], REPO_ROOT / "book/Ordinary_Tuesday_Manuscript.md"),
        (DRIVE_ROOT_IDS["print_html"], REPO_ROOT / "book/Ordinary_Tuesday_Print.html"),
        (DRIVE_ROOT_IDS["master_lineup"], REPO_ROOT / "book/MASTER_LINEUP.md"),
        (DRIVE_ROOT_IDS["restore_map"], restore_md),
    ]
    for fid, fp in updates:
        run(["gdrive", "mutate", "update", fid, str(fp)])

    # Rename PDF cleanly to reflect current chapter count while keeping the EXACT same Drive ID!
    run(["gdrive", "mutate", "rename", DRIVE_ROOT_IDS["pdf"], f"Ordinary_Tuesday_Book_Draft_{total}_Chapters_Illustrated.pdf"])
    restore_md.unlink(missing_ok=True)

    # Sync Data_and_Carrd_Files folder cleanly (update existing by name, upload only brand-new)
    ls_out = subprocess.check_output(["gdrive", "readonly", "ls", DRIVE_DATA_FOLDER, "--max", "0", "--json"], text=True)
    existing_by_name = {x["name"]: x["id"] for x in json.loads(ls_out)}
    sync_files = [
        REPO_ROOT / "assets/app.js",
        REPO_ROOT / "assets/styles.css",
        REPO_ROOT / "assets/diagrams.js",
        REPO_ROOT / "data/catalog.json",
        REPO_ROOT / "data/stories.json",
        REPO_ROOT / "data/exhibits.json",
        REPO_ROOT / "data/bundle.js",
        REPO_ROOT / "carrd/embed.js",
        REPO_ROOT / "carrd/carrd_embed.html",
        REPO_ROOT / "carrd/carrd_dynamic_embed.html",
        REPO_ROOT / "index.html",
        REPO_ROOT / "story.html",
        REPO_ROOT / "poster.html",
        REPO_ROOT / "scripts/build_all.py",
        REPO_ROOT / "scripts/fetch_new_episodes.py",
        REPO_ROOT / "scripts/harvest_exhibits.py",
        REPO_ROOT / "scripts/merge_wave.py",
        REPO_ROOT / "scripts/publish_release.py",
    ]
    for fp in sync_files:
        if not fp.exists():
            continue
        if fp.name in existing_by_name:
            run(["gdrive", "mutate", "update", existing_by_name[fp.name], str(fp)])
        else:
            run(["gdrive", "mutate", "upload", str(fp), "--parent", DRIVE_DATA_FOLDER])

    # Sync any brand-new individual markdown chapters into Book_Chapters folder (no duplicates)
    ch_ls = subprocess.check_output(["gdrive", "readonly", "ls", DRIVE_CHAPTERS_FOLDER, "--max", "0", "--json"], text=True)
    ch_existing = {x["name"] for x in json.loads(ch_ls)}
    new_chs = sorted(p for p in (REPO_ROOT / "book/chapters").glob("*.md") if p.name not in ch_existing)
    if new_chs:
        print(f"  Uploading {len(new_chs)} newly added individual chapters to Drive chapters folder...")
        for fp in new_chs:
            run(["gdrive", "mutate", "upload", str(fp), "--parent", DRIVE_CHAPTERS_FOLDER])
        run(["gdrive", "mutate", "rename", DRIVE_CHAPTERS_FOLDER, f"Book_Chapters_001_to_{total:03d}"])

    print("  Google Drive Vault sync complete!")


def main():
    ap = argparse.ArgumentParser(description="Validate, build (--pdf), push to GitHub, and sync Google Drive Vault.")
    ap.add_argument("--message", "-m", default="Update site, illustrated book, and clinical exhibits", help="Git commit message")
    ap.add_argument("--skip-push", action="store_true", help="Skip git commit & push")
    ap.add_argument("--skip-drive", action="store_true", help="Skip Google Drive Vault sync")
    args = ap.parse_args()

    print("[0/5] Running scripts/build_all.py --pdf ...")
    run([sys.executable, str(REPO_ROOT / "scripts/build_all.py"), "--pdf"])

    cat, ex = validate_repo()

    pdf_path = REPO_ROOT / "book/Ordinary_Tuesday_Book_Draft.pdf"
    assert pdf_path.exists() and pdf_path.stat().st_size > 100_000, "PDF rendering missing or empty!"

    print("\n[2/5] Packing full repo backup zip...")
    zip_path = Path("/tmp/Ordinary_Tuesday_FULL_REPO_BACKUP.zip")
    build_zip(zip_path)

    commit_sha = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"], cwd=REPO_ROOT, text=True).strip()
    if not args.skip_push:
        print("\n[3/5] Committing & pushing to GitHub origin main...")
        run(["git", "add", "-A"])
        status = subprocess.check_output(["git", "status", "--porcelain"], cwd=REPO_ROOT, text=True).strip()
        if status:
            run(["git", "commit", "-m", args.message])
            run(["git", "push", "origin", "main"])
            commit_sha = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"], cwd=REPO_ROOT, text=True).strip()
        else:
            print("  Working tree already clean; nothing new to commit.")

    if not args.skip_drive:
        sync_google_drive(cat, ex, pdf_path, zip_path, commit_sha)

    zip_path.unlink(missing_ok=True)
    print(f"\nALL DONE! Live release @ commit {commit_sha} ({len(cat['cases'])} chapters).")


if __name__ == "__main__":
    main()
