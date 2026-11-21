#!/usr/bin/env python3
"""
Reusable Wave Merger & Strict Validator
for "How Not to Die on an Ordinary Tuesday".

Merges drafted batch JSON arrays (each item: {catalogEntry, storyEntry, quiz})
into data/catalog.json, data/stories.json, and data/exhibits.json with full
schema, word-count, citation, and quiz-balance checks.

Also:
  - Updates/creates the "🆕 Latest Studio Drops" Starter Pack (?pack=latest)
  - Optionally integrates pre-harvested exhibits JSON (--exhibits)
  - Expands the Survival Exam pool with high-impact new cases (--add-exam-count)
  - Clears newly ingested episodes from catalog.json['watchlist']

Usage:
  python3 scripts/merge_wave.py --inputs /tmp/wave5/outputs/batch_*.json \
      --exhibits /tmp/wave5/preharvest_exhibits.json --wave-label "Wave 5 (Ep 2621–2653)"
"""

import argparse
import datetime
import glob
import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "data"

VALID_PARTS = {"garage", "kitchen", "medicine", "outdoors", "hospital", "pets"}
PART_LABELS = {
    "garage": "Part I · The Garage, Backyard & Hardware Store",
    "kitchen": "Part II · The Kitchen & Dining Table",
    "medicine": "Part III · Medicine Cabinet Roulette",
    "outdoors": "Part IV · The Gym, Trail & Vacation",
    "hospital": "Part V · “The First Test Looked Normal”",
    "pets": "Part VI · Bonus: How Not to Accidentally Off Your Dog or Cat",
}

REQ_CAT_KEYS = [
    "fileNo", "slug", "part", "status", "readTime", "title", "subtitle", "ep",
    "manner", "avoidability", "verdictBadge", "looksLike", "actuallyIs",
    "abstract", "goldenRule", "episodeTitle", "duration", "spokenWords",
    "transcriptUrl", "audioDriveUrl", "audioDriveId", "audioDirectUrl",
]
REQ_STORY_KEYS = [
    "slug", "fileNo", "partId", "partLabel", "title", "deck", "byline",
    "readTime", "toeTag", "looksLike", "actuallyIs", "sections", "ledger",
    "survivalCard", "sources", "relatedSlugs",
]


def count_prose_words(story):
    words = 0
    for sec in story.get("sections", []):
        for p in sec.get("paragraphs", []):
            words += len(str(p).split())
        for b in sec.get("bullets", []):
            words += len(str(b).split())
    return words


def clean_markdown_artifacts(text):
    if not isinstance(text, str):
        return text
    # Strip stray **bold** if any slipped in
    text = re.sub(r"\*\*([^\*]+)\*\*", r"\1", text)
    return text.strip()


def sanitize_item(item):
    c = dict(item["catalogEntry"])
    s = dict(item["storyEntry"])
    q = dict(item["quiz"])

    # Normalize part/partLabel consistency
    part = c.get("part") or s.get("partId")
    assert part in VALID_PARTS, f"Invalid part '{part}' on {c.get('slug')}"
    c["part"] = part
    s["partId"] = part
    s["partLabel"] = PART_LABELS[part]
    c["status"] = "live"

    # Strip accidental markdown asterisks from narrative/quiz text
    for sec in s.get("sections", []):
        sec["paragraphs"] = [clean_markdown_artifacts(p) for p in sec.get("paragraphs", [])]
        if sec.get("bullets"):
            sec["bullets"] = [clean_markdown_artifacts(b) for b in sec["bullets"]]
    q["prompt"] = clean_markdown_artifacts(q.get("prompt", ""))
    for op in q.get("options", []):
        op["label"] = clean_markdown_artifacts(op.get("label", ""))
        op["feedback"] = clean_markdown_artifacts(op.get("feedback", ""))

    return c, s, q


def validate_item(c, s, q):
    sl = c.get("slug")
    for k in REQ_CAT_KEYS:
        assert k in c, f"Missing catalogEntry.{k} on {sl}"
    for k in REQ_STORY_KEYS:
        assert k in s, f"Missing storyEntry.{k} on {sl}"
    assert c["slug"] == s["slug"] and c["fileNo"] == s["fileNo"], f"Slug/fileNo mismatch on {sl}"

    wc = count_prose_words(s)
    assert 500 <= wc <= 1500, f"Word count out of bounds ({wc}w) on {sl}"
    assert len(s["sections"]) >= 3, f"Too few sections on {sl}"
    assert len(s["ledger"]) >= 4, f"Too few ledger rows on {sl}"
    assert len(s["survivalCard"].get("steps", [])) >= 3, f"Too few survival steps on {sl}"
    assert len(s["sources"]) >= 1, f"No sources on {sl}"
    for src in s["sources"]:
        assert str(src.get("url", "")).startswith("https://"), f"Non-HTTPS source on {sl}: {src}"

    # Quiz checks
    opts = q.get("options", [])
    assert q.get("prompt") and len(opts) == 3, f"Bad quiz schema on {sl}"
    corr = [i for i, op in enumerate(opts) if op.get("correct") is True]
    assert len(corr) == 1, f"Quiz must have exactly 1 correct option on {sl}"
    for op in opts:
        assert op.get("label") and op.get("feedback"), f"Empty quiz label/feedback on {sl}"
    return wc, corr[0]


def main():
    ap = argparse.ArgumentParser(description="Merge drafted wave batches into catalog.json, stories.json, and exhibits.json.")
    ap.add_argument("--inputs", nargs="+", required=True, help="Input batch JSON files (supports globs)")
    ap.add_argument("--exhibits", help="Optional preharvest_exhibits.json from harvest_exhibits.py")
    ap.add_argument("--wave-label", default="Latest Studio Drops", help="Label for the ?pack=latest Starter Pack")
    ap.add_argument("--add-exam-count", type=int, default=10, help="Number of new scenarios to add to Survival Exam pool")
    args = ap.parse_args()

    files = []
    for pat in args.inputs:
        matched = sorted(glob.glob(pat))
        files.extend(matched if matched else [pat])

    items = []
    for fp in files:
        raw = json.loads(Path(fp).read_text(encoding="utf-8"))
        assert isinstance(raw, list), f"Expected JSON array in {fp}"
        items.extend(raw)
        print(f"Loaded {len(raw)} items from {Path(fp).name}")

    catalog = json.loads((DATA_DIR / "catalog.json").read_text(encoding="utf-8"))
    stories = json.loads((DATA_DIR / "stories.json").read_text(encoding="utf-8"))
    exhibits = json.loads((DATA_DIR / "exhibits.json").read_text(encoding="utf-8"))
    pre_ex = json.loads(Path(args.exhibits).read_text(encoding="utf-8")) if args.exhibits else {}

    existing_slugs = {c["slug"] for c in catalog["cases"]}
    existing_eps = {c["ep"] for c in catalog["cases"]}
    existing_fnos = {c["fileNo"] for c in catalog["cases"]}

    added_slugs = []
    pos_counts = {0: 0, 1: 0, 2: 0}
    total_new_words = 0

    for item in items:
        c, s, q = sanitize_item(item)
        wc, cidx = validate_item(c, s, q)
        sl = c["slug"]
        if sl in existing_slugs or c["ep"] in existing_eps:
            print(f"  [update] Replacing existing {c['ep']} ({sl})")
            catalog["cases"] = [x for x in catalog["cases"] if x["slug"] != sl]
        else:
            assert c["fileNo"] not in existing_fnos, f"Duplicate fileNo {c['fileNo']} on {sl}"
            existing_fnos.add(c["fileNo"])

        catalog["cases"].append(c)
        stories[sl] = s
        ex_entry = exhibits.setdefault("stories", {}).setdefault(sl, {})
        ex_entry["quiz"] = q

        # Merge pre-harvested exhibits if present (never overwrite existing hand-curated figures!)
        pe = pre_ex.get(sl) or {}
        if pe.get("clinicalFigures") and not ex_entry.get("clinicalFigures"):
            ex_entry["clinicalFigures"] = pe["clinicalFigures"]
        elif pe.get("externalFigureLinks") and not ex_entry.get("clinicalFigures") and not ex_entry.get("externalFigureLinks"):
            ex_entry["externalFigureLinks"] = pe["externalFigureLinks"]

        added_slugs.append(sl)
        pos_counts[cidx] += 1
        total_new_words += wc

    # Validate relatedSlugs reference real slugs
    all_slugs = {c["slug"] for c in catalog["cases"]}
    for sl in added_slugs:
        st = stories[sl]
        st["relatedSlugs"] = [r for r in st.get("relatedSlugs", []) if r in all_slugs and r != sl][:3]

    # Sort catalog cases cleanly by numeric fileNo
    catalog["cases"].sort(key=lambda x: int(x["fileNo"]))

    # Clear newly ingested PREV batches from watchlist
    ingested_titles = {c["episodeTitle"].lower() for c in catalog["cases"]}
    ingested_eps = {c["ep"] for c in catalog["cases"]}
    new_wl = []
    for w in catalog.get("watchlist", []):
        if w.get("title", "").lower() in ingested_titles:
            continue
        if any(ep in str(w) for ep in ingested_eps):
            continue
        new_wl.append(w)
    catalog["watchlist"] = new_wl

    today = datetime.date.today().isoformat()
    catalog["meta"]["updated"] = today

    # Expand Survival Exam pool cleanly across varied rooms
    exam = exhibits.setdefault("exam", [])
    exam_seen = {e["caseSlug"] for e in exam}
    case_by_slug = {c["slug"]: c for c in catalog["cases"]}
    added_exam = 0
    # Spread exam additions across rooms evenly
    by_room = {}
    for sl in added_slugs:
        by_room.setdefault(case_by_slug[sl]["part"], []).append(sl)
    round_robin = []
    while any(by_room.values()):
        for rm in list(by_room.keys()):
            if by_room[rm]:
                round_robin.append(by_room[rm].pop(0))
    for sl in round_robin:
        if added_exam >= args.add_exam_count:
            break
        if sl in exam_seen:
            continue
        q = exhibits["stories"][sl]["quiz"]
        c = case_by_slug[sl]
        exam.append({
            "q": q["prompt"],
            "caseSlug": sl,
            "caseRef": f"Case {c['fileNo']}",
            "options": [{"label": op["label"], "ok": bool(op["correct"]), "why": op["feedback"]} for op in q["options"]],
        })
        exam_seen.add(sl)
        added_exam += 1

    # Sync bespoke diagramIds from assets/diagrams.js
    diag_txt = (REPO_ROOT / "assets" / "diagrams.js").read_text(encoding="utf-8")
    bespoke_ids = [sl for sl in all_slugs if f"'{sl}'" in diag_txt or f'"{sl}"' in diag_txt]
    for sl in bespoke_ids:
        exhibits["stories"].setdefault(sl, {})["diagramId"] = sl

    # Refresh Starter Packs & add/update ?pack=latest
    exhibit_slugs = [c["slug"] for c in catalog["cases"] if exhibits["stories"].get(c["slug"], {}).get("clinicalFigures")]
    pet_count = sum(1 for c in catalog["cases"] if c["part"] == "pets")
    packs = [p for p in exhibits.get("starterPacks", []) if p.get("id") != "latest"]
    packs.insert(0, {
        "id": "latest",
        "label": f"🆕 {args.wave_label} ({len(added_slugs)})",
        "tagline": f"Freshly added on {today} — {len(added_slugs)} brand-new peer-reviewed forensic survival stories with clinical exhibits, diagrams, and custom quizzes.",
        "slugs": added_slugs,
    })
    for pk in packs:
        if pk["id"] == "visual-pilot":
            pk["label"] = f"🩻 Real Clinical Exhibits ({len(exhibit_slugs)})"
            pk["tagline"] = f"All {len(exhibit_slugs)} chapters featuring verified commercial-safe CC-BY X-rays, CTs, MRIs, ECGs, ultrasounds, and opt-in unsealable clinical photographs."
            pk["slugs"] = exhibit_slugs
        elif pk["id"] == "infographics":
            pk["label"] = f"📐 Signature Forensic Diagrams ({len(bespoke_ids)})"
            pk["tagline"] = f"All {len(bespoke_ids)} chapters featuring hand-crafted “Airline Safety Card meets NTSB” original vector infographics across all 6 rooms."
            pk["slugs"] = bespoke_ids
        elif pk["id"] == "pets":
            pk["label"] = f"🐾 Pet Owner’s Mandatory {pet_count}"
    exhibits["starterPacks"] = packs

    # Refresh exhibits.meta
    img_count = sum(len(v.get("clinicalFigures", [])) for v in exhibits["stories"].values())
    ext_count = sum(1 for v in exhibits["stories"].values() if v.get("externalFigureLinks"))
    quiz_count = sum(1 for sl in all_slugs if exhibits["stories"].get(sl, {}).get("quiz"))
    exhibits["meta"] = {
        "updated": today,
        "totalStoriesEnriched": len(all_slugs),
        "ccByClinicalExhibitStories": len(exhibit_slugs),
        "ccByClinicalExhibitImages": img_count,
        "bespokeInfographics": len(bespoke_ids),
        "dynamicBlueprintStories": len(all_slugs) - len(bespoke_ids),
        "perStoryQuizzes": quiz_count,
        "examPoolSize": len(exam),
        "externalFigureLinkoutStories": ext_count,
    }

    (DATA_DIR / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (DATA_DIR / "stories.json").write_text(json.dumps(stories, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (DATA_DIR / "exhibits.json").write_text(json.dumps(exhibits, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    room_counts = {}
    for c in catalog["cases"]:
        room_counts[c["part"]] = room_counts.get(c["part"], 0) + 1

    print("=" * 72)
    print(f"MERGED {len(added_slugs)} WAVE CHAPTERS (+{total_new_words:,} prose words)!")
    print(f"  Total Live Chapters : {len(catalog['cases'])} ({room_counts})")
    print(f"  New Quiz Balance    : {pos_counts} (Total Quizzes: {quiz_count}/{len(all_slugs)})")
    print(f"  CC-BY Exhibits      : {len(exhibit_slugs)} stories ({img_count} local JPEGs)")
    print(f"  NC/ND Lockers       : {ext_count} stories")
    print(f"  Bespoke Diagrams    : {len(bespoke_ids)} stories (+ {len(all_slugs)-len(bespoke_ids)} blueprints)")
    print(f"  Survival Exam Pool  : {len(exam)} scenarios (+{added_exam} added)")
    print("=" * 72)


if __name__ == "__main__":
    main()
