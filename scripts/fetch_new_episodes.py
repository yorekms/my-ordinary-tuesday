#!/usr/bin/env python3
"""
Reusable Wave Ingest Discovery & Transcript Staging Script
for "How Not to Die on an Ordinary Tuesday".

Reads the Master Podcast Sheet via `gsheets`, discovers every newly recorded
How Not to Die / Forensic Prevention episode not yet in data/catalog.json,
maps direct 256 kbps GitHub Release .m4a URLs + Google Drive audio fallback IDs,
downloads full word-level verbatim transcripts concurrently, extracts cited
PMCIDs/PMIDs/DOIs, checks for potential topic overlaps against existing stories,
and writes structured batch manifests ready for drafting.

Usage:
  python3 scripts/fetch_new_episodes.py --min-ep 2621 --max-ep 2653 --out /tmp/wave5
  python3 scripts/fetch_new_episodes.py --all-new --out /tmp/wave_next
"""

import argparse
import concurrent.futures
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SHEET_ID = "1BeAwVdAlCSZ7dxurF03hOJmdDzfxFPWcPcO1tnA4FR0"
SHEET_TAB = "All Episodes & Transcripts"
GH_RELEASES_API = "https://api.github.com/repos/yorekms/deep-dive-podcasts/releases?per_page=30"


def run_cmd(args):
    p = subprocess.run(args, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"Command failed ({' '.join(args)}): {p.stderr.strip()}")
    return p.stdout


def extract_drive_id(url):
    m = re.search(r"/d/([a-zA-Z0-9_-]{15,})", url or "")
    return m.group(1) if m else ""


def fetch_github_m4a_map():
    """Map 'Ep 2621' -> direct GitHub Release .m4a browser_download_url."""
    req = urllib.request.Request(GH_RELEASES_API, headers={"User-Agent": "ordinary-tuesday-updater/1.0"})
    rels = json.loads(urllib.request.urlopen(req, timeout=20).read().decode("utf-8"))
    mapping = {}
    for rel in rels:
        for asset in rel.get("assets", []):
            name = asset.get("name", "")
            if not name.lower().endswith(".m4a"):
                continue
            m = re.match(r"^(?:Ep|EP)[_ -]?(\d+|C\d+)(?=[_\-\s\.])", name)
            if m:
                ep_key = f"Ep {m.group(1)}"
                mapping[ep_key] = asset["browser_download_url"]
    return mapping


def download_drive_file(file_id, dest_path):
    if dest_path.exists() and dest_path.stat().st_size > 200:
        return True
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    p = subprocess.run(
        ["gdrive", "readonly", "download", file_id, "--output", str(dest_path)],
        capture_output=True,
        text=True,
    )
    if p.returncode != 0:
        # Fallback flag check (-o)
        p2 = subprocess.run(
            ["gdrive", "readonly", "download", file_id, "-o", str(dest_path)],
            capture_output=True,
            text=True,
        )
        if p2.returncode != 0:
            raise RuntimeError(f"Drive download failed for {file_id}: {p.stderr.strip()} / {p2.stderr.strip()}")
    return True


def extract_citations(text):
    pmcids = sorted(set(re.findall(r"\bPMC\d{5,9}\b", text)))
    dois = sorted(set(re.findall(r"\b10\.\d{4,9}/[-._;()/:A-Za-z0-9]+", text)))
    pmids = sorted(set(re.findall(r"\bPMID[:\s]*(\d{7,9})\b", text, re.I)))
    urls = sorted(set(re.findall(r"https?://[^\s\)\]>\"']+", text)))
    return {
        "pmcids": pmcids,
        "dois": [d.rstrip(".,;:") for d in dois],
        "pmids": pmids,
        "urls": urls[:25],
    }


def guess_part(title, tags, text_sample):
    # Strip YAML/header metadata so "Comparative Human & Veterinary" doesn't force pets
    body = text_sample.split("TRANSCRIPT", 1)[-1][:2400] if "TRANSCRIPT" in text_sample[:2000] else text_sample[600:3000]
    hay = f"{title} {body}".lower()
    if any(k in hay for k in ("guinea pig", "ferret", "leopard gecko", "gecko", "hedgehog", "feline", "young cat", "kitten", "puppy", "canine", "rabbit", "encephalitozoon", "macaw", "cockatoo", "budgie", "parrot", "avian", "cockatiel", "cloacoscopy", "dystocia", "veterinarian", "vet clinic")):
        return "pets"
    if any(k in hay for k in ("lawn mower", "treadmill", "escalator", "wet cement", "cement burn", "hydrofluoric", "machinery", "entanglement", "cloth the machine", "handlebar", "power tool", "compressor", "generator")):
        return "garage"
    if any(k in hay for k in ("rice", "grill", "kitchen", "bleach", "mushroom", "honey", "seafood", "botulism", "canning")):
        return "kitchen"
    if any(k in hay for k in ("topical", "cream", "pill", "esophagitis", "medication", "biotin", "heparin", "drug", "otc", "supplement", "thiamine", "wernicke", "benzocaine", "lidocaine", "salicylate")):
        return "medicine"
    if any(k in hay for k in ("kite", "manja", "across the road", "water intoxication", "marathon", "heatstroke", "hypothermia", "hiking", "outdoor", "lightning", "bite", "sting")):
        return "outdoors"
    return "hospital"


def main():
    ap = argparse.ArgumentParser(description="Fetch & stage new How Not to Die episodes from Master Sheet & Drive.")
    ap.add_argument("--min-ep", type=int, default=2601, help="Minimum numeric Ep # to scan (default: 2601)")
    ap.add_argument("--max-ep", type=int, default=9999, help="Maximum numeric Ep # to scan (default: 9999)")
    ap.add_argument("--all-new", action="store_true", help="Scan all Forensic/How Not to Die rows not yet in catalog.json")
    ap.add_argument("--out", required=True, help="Output staging directory")
    ap.add_argument("--workers", type=int, default=6, help="Concurrent Drive transcript download workers")
    args = ap.parse_args()

    out_dir = Path(args.out)
    tr_dir = out_dir / "transcripts"
    tr_dir.mkdir(parents=True, exist_ok=True)

    catalog = json.loads((REPO_ROOT / "data" / "catalog.json").read_text(encoding="utf-8"))
    have_eps = {c["ep"] for c in catalog["cases"]}
    existing_summaries = [(c["fileNo"], c["ep"], c["title"], c["actuallyIs"]) for c in catalog["cases"]]

    print(f"[1/4] Reading Master Sheet ({SHEET_ID})...")
    raw_rows = json.loads(run_cmd(["gsheets", "readonly", "read", SHEET_ID, f"{SHEET_TAB}!A1:O2000", "--json"]))
    raw_links = json.loads(run_cmd(["gsheets", "readonly", "read-links", SHEET_ID, f"{SHEET_TAB}!A1:O2000", "--json"]))
    rows = raw_rows.get("values", raw_rows) if isinstance(raw_rows, dict) else raw_rows
    links = raw_links.get("values", raw_links) if isinstance(raw_links, dict) else raw_links

    print("[2/4] Fetching direct GitHub Release .m4a audio URLs...")
    gh_m4a = fetch_github_m4a_map()
    print(f"      Indexed {len(gh_m4a)} direct .m4a assets from GitHub Releases.")

    candidates = []
    for idx, r in enumerate(rows):
        if idx == 0 or not r:
            continue
        ep = str(r[0]).strip()
        if ep in have_eps:
            continue
        m = re.match(r"^Ep (\d+)$", ep)
        if not m:
            continue
        ep_num = int(m.group(1))
        title_full = str(r[1]) if len(r) > 1 else ""
        notes = str(r[9]) if len(r) > 9 else ""
        is_hntd = ("How Not to Die" in notes) or ("Forensic Pathology, Diagnostic Verification" in title_full)
        if args.all_new:
            if not is_hntd:
                continue
        else:
            if not (args.min_ep <= ep_num <= args.max_ep and is_hntd):
                continue

        lr = links[idx] if idx < len(links) else []
        tr_url = str(lr[13]) if len(lr) > 13 else ""
        au_url = str(lr[14]) if len(lr) > 14 else ""
        tr_id = extract_drive_id(tr_url)
        au_id = extract_drive_id(au_url)
        if not tr_id:
            print(f"  [skip] {ep} has no transcript Drive ID yet.")
            continue

        clean_title = title_full.split(" — ")[0].strip()
        dur = str(r[10]).strip() if len(r) > 10 else ""
        words_raw = str(r[11]).replace(",", "").strip() if len(r) > 11 else "0"
        spoken_words = int(words_raw) if words_raw.isdigit() else 0
        tags = str(r[7]) if len(r) > 7 else ""
        entities = str(r[8]) if len(r) > 8 else ""
        cont_m = re.search(r"Continuation #(\d+)", notes)
        prev_tag = f"PREV_{cont_m.group(1)}" if cont_m else ""

        candidates.append({
            "ep": ep,
            "epNum": ep_num,
            "prevTag": prev_tag,
            "rawTitle": clean_title,
            "fullSheetTitle": title_full,
            "duration": dur,
            "spokenWords": spoken_words,
            "tags": tags,
            "entities": entities,
            "notes": notes,
            "transcriptDriveId": tr_id,
            "transcriptUrl": f"https://drive.google.com/file/d/{tr_id}/view",
            "audioDriveId": au_id,
            "audioDriveUrl": f"https://drive.google.com/file/d/{au_id}/view" if au_id else "",
            "audioDirectUrl": gh_m4a.get(ep, ""),
            "transcriptPath": str(tr_dir / f"{ep.replace(' ', '_')}.md"),
        })

    print(f"[3/4] Downloading {len(candidates)} verbatim transcripts ({args.workers} workers)...")
    def _dl(item):
        p = Path(item["transcriptPath"])
        download_drive_file(item["transcriptDriveId"], p)
        txt = p.read_text(encoding="utf-8", errors="replace")
        item["transcriptChars"] = len(txt)
        item["citations"] = extract_citations(txt)
        item["suggestedPart"] = guess_part(item["rawTitle"], item["tags"] + " " + item["entities"], txt)
        # Flag possible topic overlaps against existing catalog
        hay = (item["rawTitle"] + " " + item["entities"]).lower()
        overlaps = []
        for fno, eep, etit, eact in existing_summaries:
            for kw in ("hydrofluoric", "lithium", "benzocaine", "methemoglobin", "grill bristle", "dry ice", "minoxidil", "xylitol", "rat bait", "fentanyl", "rhabdo", "epiglott", "aortic dissection", "boerhaave"):
                if kw in hay and kw in (etit + " " + eact).lower():
                    overlaps.append(f"File {fno} ({eep}): {etit} [matched '{kw}']")
        item["overlapWarnings"] = overlaps
        return item

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
        staged = list(ex.map(_dl, candidates))

    staged.sort(key=lambda x: x["epNum"])
    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(staged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"[4/4] Staged {len(staged)} new episodes -> {manifest_path}")
    missing_m4a = [x["ep"] for x in staged if not x["audioDirectUrl"]]
    print(f"      Direct .m4a matched: {len(staged) - len(missing_m4a)}/{len(staged)}")
    if missing_m4a:
        print(f"      Missing direct .m4a (will use Drive proxy/fallback): {missing_m4a}")
    for x in staged:
        warn = f"  *** OVERLAP CHECK: {x['overlapWarnings']}" if x["overlapWarnings"] else ""
        print(f"  {x['ep']} ({x['prevTag']:9s}) | part={x['suggestedPart']:8s} | {x['transcriptChars']:6,d}c | PMCs={len(x['citations']['pmcids'])} | {x['rawTitle']}{warn}")


if __name__ == "__main__":
    main()
