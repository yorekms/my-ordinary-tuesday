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
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# Permanent Google Drive Vault IDs (updated in-place so shared URLs stay valid forever)
DRIVE_VAULT_FOLDER = "1GxL-gO_RQPRLUkBf24wu7pF-2NH9pXLk"
DRIVE_DATA_FOLDER = "1_oZwlQaMqBXrHHuALJhuPrtRIcuNItKC"
DRIVE_CHAPTERS_FOLDER = "1_bd54qpX8qJxnv3sA01PJvlB4rogOK8U"
DRIVE_ROOT_IDS = {
    "pdf": "1xVQWHysuuUiyflrIvY9hphpdHzS79LYH",
    "zip": "1D2q4a3ZLuqHu9EoMXjxxfABIrJaxFa_u",
    "chapters_zip": "1VyTD2z6qiL0BO9rj9pT-z5E7l9e67Pvd",
    "manuscript_md": "12tGwgzl_FcOL3nmx6WUwLZKQGKf3ksw8",
    "print_html": "1xGeoUYZaIBGCvc7Q13WwOU-ldrW5FkJg",
    "master_lineup": "11msi3HtIyztV_bpiaIU14HAfz3VdRGQh",
    "restore_map": "1qZa0ANBSZ7RYFy_rdCsHqCjvNUCn7bKi",
}
GH_REPO = "yorekms/my-ordinary-tuesday"
GH_BOOK_TAG = "latest-book"


def run(cmd, cwd=None, check=True):
    is_gdrive = len(cmd) > 0 and str(cmd[0]) == "gdrive"
    attempts = 5 if is_gdrive else 1
    for attempt in range(attempts):
        print(f"  $ {' '.join(str(c) for c in cmd)}")
        if is_gdrive:
            p = subprocess.run(cmd, cwd=cwd or REPO_ROOT, text=True, capture_output=True)
            if p.stdout:
                print(p.stdout, end="")
            if p.returncode == 0:
                return 0
            err = (p.stderr or p.stdout or "")
            if any(tok in err for tok in ("rateLimitExceeded", "RATE_LIMIT_EXCEEDED", "Error 403", "Error 429")):
                wait = 8 * (attempt + 1)
                print(f"  [backoff {wait}s] transient Google Drive rate limit — retrying ({attempt + 1}/{attempts})...")
                time.sleep(wait)
                continue
            if p.stderr:
                print(p.stderr, end="", file=sys.stderr)
            if check:
                raise RuntimeError(f"Command exited {p.returncode}: {cmd}")
            return p.returncode
        else:
            p = subprocess.run(cmd, cwd=cwd or REPO_ROOT, text=True)
            if check and p.returncode != 0:
                raise RuntimeError(f"Command exited {p.returncode}: {cmd}")
            return p.returncode
    raise RuntimeError(f"Exhausted retries after transient Drive rate limits: {cmd}")


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
            lic_check = (fg.get("license", "") + " " + fg.get("licenseUrl", "")).lower()
            for bad in ("by-nc", "noncommercial", "-nd", "noderiv", "by-sa", "sharealike"):
                assert bad not in lic_check, f"COMMERCIAL LICENSE FIREWALL VIOLATION on {sl}: {fg.get('license')} ({fg.get('licenseUrl')})"
            referenced.add(p.name)

    on_disk = {p.name for p in (REPO_ROOT / "assets/exhibits").glob("*") if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")}
    orphans = on_disk - referenced
    if orphans:
        print(f"  [cleanup] Removing {len(orphans)} unreferenced exhibit image(s): {sorted(orphans)}")
        for o in orphans:
            (REPO_ROOT / "assets/exhibits" / o).unlink()

    print(f"  OK: {len(cat['cases'])} stories, {len(referenced)} verified commercial-cleared exhibit images, 0 JS errors.")
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


def build_chapters_zip(dest_zip):
    count = 0
    with zipfile.ZipFile(dest_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in sorted((REPO_ROOT / "book/chapters").glob("*.md")):
            zf.write(p, arcname=p.name)
            count += 1
    print(f"  Packed {count} chapter markdown files into {dest_zip.name} ({dest_zip.stat().st_size / 1024:.1f} KB)")


def build_images_stock_zip(dest_zip):
    count = 0
    with zipfile.ZipFile(dest_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in sorted((REPO_ROOT / "assets/exhibits").glob("*")):
            if p.is_file():
                zf.write(p, arcname=f"exhibits/{p.name}")
                count += 1
        ledger = REPO_ROOT / "book/IMAGE_STOCK_LICENSE_LEDGER.md"
        if ledger.exists():
            zf.write(ledger, arcname="IMAGE_STOCK_LICENSE_LEDGER.md")
            count += 1
    print(f"  Packed {count} commercial-cleared image stock files into {dest_zip.name} ({dest_zip.stat().st_size / 1024 / 1024:.2f} MB)")


def publish_github_book_release(cat, ex, pdf_path, images_zip, chapters_zip, commit_sha):
    print("\n[4/5] Publishing Illustrated Book PDF & Commercial Image Stock to GitHub Release (latest-book)...")
    total = len(cat["cases"])
    meta = ex.get("meta") or {}
    latest_pdf = Path("/tmp/Ordinary_Tuesday_Book_Draft_Latest.pdf")
    versioned_pdf = Path(f"/tmp/Ordinary_Tuesday_Book_Draft_{total}_Chapters_Illustrated.pdf")
    latest_pdf.write_bytes(pdf_path.read_bytes())
    versioned_pdf.write_bytes(pdf_path.read_bytes())

    notes = (
        f"## How Not to Die on an Ordinary Tuesday — {total}-Chapter Illustrated Edition\n\n"
        f"- **Updated:** {datetime.date.today().isoformat()} (commit `{commit_sha}`)\n"
        f"- **Chapters:** {total} sequential chapters across Parts I–VI with clickable Table of Contents\n"
        f"- **Verified Commercial-Safe Image Stock:** {meta.get('ccByClinicalExhibitImages', 0)} cleared images across {meta.get('ccByClinicalExhibitStories', 0)} chapters "
        f"({meta.get('primaryClinicalExhibitStories', 0)} Primary Case, {meta.get('referenceClinicalExhibitStories', 0)} Peer-Reviewed Reference, {meta.get('hazardFieldPhotoStories', 0)} Verified Hazard Photos)\n"
        f"- **Vector Infographics:** {meta.get('bespokeInfographics', 0)} infinite-DPI forensic SVG diagrams embedded directly in the PDF\n"
        f"- **License Clearance:** 100% `CC BY` / `CC0` / `Public Domain` (zero `NC`/`ND`/`SA` encumbrances)\n"
    )
    exists = subprocess.run(["gh", "release", "view", GH_BOOK_TAG, "-R", GH_REPO], capture_output=True, text=True).returncode == 0
    if not exists:
        run([
            "gh", "release", "create", GH_BOOK_TAG, "-R", GH_REPO,
            "--title", f"Illustrated Book & Image Stock ({total} Chapters)",
            "--notes", notes,
            str(latest_pdf), str(versioned_pdf), str(images_zip), str(chapters_zip),
        ])
    else:
        run([
            "gh", "release", "edit", GH_BOOK_TAG, "-R", GH_REPO,
            "--title", f"Illustrated Book & Image Stock ({total} Chapters)",
            "--notes", notes,
        ])
        run([
            "gh", "release", "upload", GH_BOOK_TAG, "-R", GH_REPO, "--clobber",
            str(latest_pdf), str(versioned_pdf), str(images_zip), str(chapters_zip),
        ])
    latest_pdf.unlink(missing_ok=True)
    versioned_pdf.unlink(missing_ok=True)
    print(f"  GitHub Release live -> https://github.com/{GH_REPO}/releases/tag/{GH_BOOK_TAG}")


def sync_google_drive(cat, ex, pdf_path, zip_path, chapters_zip, images_zip, commit_sha):
    print("\n[5/5] Syncing updated PDF, Repo Zip, Image Stock, Book Files & Data to Google Drive Vault (in-place)...")
    today = datetime.date.today().isoformat()
    total = len(cat["cases"])
    meta = ex.get("meta") or {}

    restore_md = REPO_ROOT / "book" / "_tmp_restore_map.md"
    restore_md.write_text(
        f"# How Not to Die on an Ordinary Tuesday — Complete Restore & Project Map\n\n"
        f"**Last Full Illustrated Backup:** {today} (GitHub commit `{commit_sha}`)\n\n"
        f"## Live URLs\n"
        f"- **Carrd Magazine Site (Auto-Synced):** https://my-ordinary-tuesday.carrd.co/\n"
        f"- **Full Static Web Reader:** https://yorekms.github.io/my-ordinary-tuesday/\n"
        f"- **Direct Illustrated Book PDF (Public Release):** https://github.com/yorekms/my-ordinary-tuesday/releases/download/latest-book/Ordinary_Tuesday_Book_Draft_Latest.pdf\n"
        f"- **Browser Print-Layout Book Edition:** https://yorekms.github.io/my-ordinary-tuesday/book/Ordinary_Tuesday_Print.html\n"
        f"- **Commercial Image Stock Zip (Public Release):** https://github.com/yorekms/my-ordinary-tuesday/releases/download/latest-book/Ordinary_Tuesday_Images_Stock_All_Exhibits.zip\n"
        f"- **Printable Fridge 6-Pack:** https://yorekms.github.io/my-ordinary-tuesday/cards.html\n"
        f"- **Printable Wall Poster:** https://yorekms.github.io/my-ordinary-tuesday/poster.html\n"
        f"- **Randomized Survival Exam:** https://yorekms.github.io/my-ordinary-tuesday/?exam=1\n"
        f"- **GitHub Source Repo:** https://github.com/yorekms/my-ordinary-tuesday (`main`)\n\n"
        f"## Current Edition Totals\n"
        f"- **{total} Live Stories** arranged across all 6 Danger Zones (sequential Chapters 1–{total} with clickable Table of Contents in the Illustrated Book PDF)\n"
        f"- **{meta.get('ccByClinicalExhibitStories', 0)} Chapters with Commercial-Cleared Verified Exhibits** ({meta.get('ccByClinicalExhibitImages', 0)} local JPEGs: "
        f"{meta.get('primaryClinicalExhibitStories', 0)} Primary Case, {meta.get('referenceClinicalExhibitStories', 0)} Peer-Reviewed Reference, {meta.get('hazardFieldPhotoStories', 0)} Verified Hazard Photos) + "
        f"**{meta.get('externalFigureLinkoutStories', 0)} NC/ND Evidence Lockers**\n"
        f"- **{meta.get('bespokeInfographics', 0)} Bespoke SVG Infographics** + **{meta.get('dynamicBlueprintStories', 0)} Dynamic Forensic Blueprints** ({total}/{total} illustrated)\n"
        f"- **{meta.get('perStoryQuizzes', 0)}/{total} Bespoke Per-Story Gut-Check Quizzes** + **{meta.get('examPoolSize', 0)}-Scenario Randomized Survival Exam**\n\n"
        f"## Reusable One-Command Update Pipeline\n"
        f"```bash\n"
        f"# 1. Pull newly recorded episodes & transcripts from Master Sheet + GitHub Releases\n"
        f"python3 scripts/fetch_new_episodes.py --all-new --out /tmp/next_wave\n"
        f"# 2. Pre-harvest commercial-safe primary CC-BY exhibits + optional Tier 2/3 reference/hazard photos\n"
        f"python3 scripts/harvest_exhibits.py --manifest /tmp/next_wave/manifest.json\n"
        f"python3 scripts/harvest_reference_exhibits.py --out /tmp/next_wave/ref_exhibits.json\n"
        f"# 3. Merge drafted story+quiz batches into data/{{catalog,stories,exhibits}}.json\n"
        f"python3 scripts/merge_wave.py --inputs /tmp/next_wave/outputs/batch_*.json --exhibits /tmp/next_wave/preharvest_exhibits.json\n"
        f"# 4. Validate, rebuild TOC + sequential book + PDF + Image Stock Ledger, push GitHub + Release, and sync Drive Vault & Google Doc\n"
        f"python3 scripts/publish_release.py --sync-doc --message \"Add next wave of chapters\"\n"
        f"```\n",
        encoding="utf-8",
    )

    # Update root Vault files in-place
    updates = [
        (DRIVE_ROOT_IDS["pdf"], pdf_path),
        (DRIVE_ROOT_IDS["zip"], zip_path),
        (DRIVE_ROOT_IDS["chapters_zip"], chapters_zip),
        (DRIVE_ROOT_IDS["manuscript_md"], REPO_ROOT / "book/Ordinary_Tuesday_Manuscript.md"),
        (DRIVE_ROOT_IDS["print_html"], REPO_ROOT / "book/Ordinary_Tuesday_Print.html"),
        (DRIVE_ROOT_IDS["master_lineup"], REPO_ROOT / "book/MASTER_LINEUP.md"),
        (DRIVE_ROOT_IDS["restore_map"], restore_md),
    ]
    for fid, fp in updates:
        run(["gdrive", "mutate", "update", fid, str(fp)])

    # Rename PDF & chapters zip cleanly to reflect current chapter count while keeping the EXACT same Drive IDs!
    run(["gdrive", "mutate", "rename", DRIVE_ROOT_IDS["pdf"], f"Ordinary_Tuesday_Book_Draft_{total}_Chapters_Illustrated.pdf"])
    run(["gdrive", "mutate", "rename", DRIVE_ROOT_IDS["chapters_zip"], f"Ordinary_Tuesday_All_{total}_Chapters_MD.zip"])
    restore_md.unlink(missing_ok=True)

    # Sync Image Stock Zip + Ledger + CSV in Vault root (update in-place if present, upload once if new)
    vault_ls = json.loads(subprocess.check_output(["gdrive", "readonly", "ls", DRIVE_VAULT_FOLDER, "--max", "0", "--json"], text=True))
    vault_by_name = {x["name"]: x["id"] for x in vault_ls}
    for fp in (images_zip, REPO_ROOT / "book/IMAGE_STOCK_LICENSE_LEDGER.md", REPO_ROOT / "assets/exhibits/IMAGE_STOCK_MANIFEST.csv"):
        if not fp.exists():
            continue
        if fp.name in vault_by_name:
            run(["gdrive", "mutate", "update", vault_by_name[fp.name], str(fp)])
        else:
            run(["gdrive", "mutate", "upload", str(fp), "--parent", DRIVE_VAULT_FOLDER])

    # Sync browsable Images_Stock_and_Exhibits folder inside Vault (incremental upload, zero duplicates!)
    img_folder_id = vault_by_name.get("Images_Stock_and_Exhibits")
    if not img_folder_id:
        mk = subprocess.check_output(["gdrive", "mutate", "mkdir", "Images_Stock_and_Exhibits", "--parent", DRIVE_VAULT_FOLDER], text=True)
        m_id = re.search(r"ID:\s*([a-zA-Z0-9_\-]+)", mk)
        if m_id:
            img_folder_id = m_id.group(1)
        else:
            vault_ls2 = json.loads(subprocess.check_output(["gdrive", "readonly", "ls", DRIVE_VAULT_FOLDER, "--max", "0", "--json"], text=True))
            img_folder_id = next((x["id"] for x in vault_ls2 if x["name"] == "Images_Stock_and_Exhibits"), None)
        print(f"  Created Drive folder Images_Stock_and_Exhibits ({img_folder_id})")
    if img_folder_id:
        img_ls = json.loads(subprocess.check_output(["gdrive", "readonly", "ls", img_folder_id, "--max", "0", "--json"], text=True))
        img_existing = {x["name"]: x["id"] for x in img_ls}
        new_imgs = sorted(p for p in (REPO_ROOT / "assets/exhibits").glob("*.jpg") if p.name not in img_existing)
        if new_imgs:
            print(f"  Uploading {len(new_imgs)} new commercial-safe exhibit JPEG(s) to Drive Images_Stock_and_Exhibits (4 workers)...")
            def _up_img(fp):
                p = subprocess.run(["gdrive", "mutate", "upload", str(fp), "--parent", img_folder_id], cwd=REPO_ROOT, capture_output=True, text=True)
                if p.returncode != 0:
                    raise RuntimeError(f"Drive upload failed for {fp.name}: {p.stderr or p.stdout}")
                return fp.name
            done_n = 0
            with ThreadPoolExecutor(max_workers=4) as tp:
                futs = [tp.submit(_up_img, fp) for fp in new_imgs]
                for fut in as_completed(futs):
                    fut.result()
                    done_n += 1
                    if done_n % 25 == 0 or done_n == len(new_imgs):
                        print(f"    Uploaded {done_n}/{len(new_imgs)} exhibit JPEGs to Drive...")
        # Always keep IMAGE_STOCK_MANIFEST.csv updated inside the folder too
        manifest_fp = REPO_ROOT / "assets/exhibits/IMAGE_STOCK_MANIFEST.csv"
        if manifest_fp.exists():
            if manifest_fp.name in img_existing:
                run(["gdrive", "mutate", "update", img_existing[manifest_fp.name], str(manifest_fp)])
            else:
                run(["gdrive", "mutate", "upload", str(manifest_fp), "--parent", img_folder_id])

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
        REPO_ROOT / "cards.html",
        REPO_ROOT / "scripts/build_all.py",
        REPO_ROOT / "scripts/fetch_new_episodes.py",
        REPO_ROOT / "scripts/harvest_exhibits.py",
        REPO_ROOT / "scripts/harvest_reference_exhibits.py",
        REPO_ROOT / "scripts/merge_wave.py",
        REPO_ROOT / "scripts/publish_release.py",
        REPO_ROOT / "scripts/sync_master_doc.py",
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
    ap = argparse.ArgumentParser(description="Validate, build (--pdf), push to GitHub + Book Release, and sync Google Drive Vault.")
    ap.add_argument("--message", "-m", default="Update site, illustrated book, and clinical exhibits", help="Git commit message")
    ap.add_argument("--skip-push", action="store_true", help="Skip git commit, push & GitHub release")
    ap.add_argument("--skip-drive", action="store_true", help="Skip Google Drive Vault sync")
    ap.add_argument("--sync-doc", action="store_true", help="Also sync book/MASTER_LINEUP.md into the native Google Doc")
    args = ap.parse_args()

    print("[0/5] Running scripts/build_all.py --pdf ...")
    run([sys.executable, str(REPO_ROOT / "scripts/build_all.py"), "--pdf"])

    cat, ex = validate_repo()

    pdf_path = REPO_ROOT / "book/Ordinary_Tuesday_Book_Draft.pdf"
    assert pdf_path.exists() and pdf_path.stat().st_size > 100_000, "PDF rendering missing or empty!"

    total = len(cat["cases"])
    print("\n[2/5] Packing full repo backup, chapters archive, and commercial image stock zips...")
    zip_path = Path("/tmp/Ordinary_Tuesday_FULL_REPO_BACKUP.zip")
    chapters_zip = Path(f"/tmp/Ordinary_Tuesday_All_{total}_Chapters_MD.zip")
    images_zip = Path("/tmp/Ordinary_Tuesday_Images_Stock_All_Exhibits.zip")
    build_zip(zip_path)
    build_chapters_zip(chapters_zip)
    build_images_stock_zip(images_zip)

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

        publish_github_book_release(cat, ex, pdf_path, images_zip, chapters_zip, commit_sha)

    if not args.skip_drive:
        sync_google_drive(cat, ex, pdf_path, zip_path, chapters_zip, images_zip, commit_sha)

    if args.sync_doc:
        print("\n[6/6] Syncing native Google Doc Master Lineup...")
        run([sys.executable, str(REPO_ROOT / "scripts/sync_master_doc.py")])

    for tmp in (zip_path, chapters_zip, images_zip):
        tmp.unlink(missing_ok=True)
    print(f"\nALL DONE! Live release @ commit {commit_sha} ({total} chapters).")


if __name__ == "__main__":
    main()
