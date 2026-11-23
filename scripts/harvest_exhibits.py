#!/usr/bin/env python3
"""
Reusable Commercial-Book-Safe Clinical Exhibit & Evidence Locker Harvester
for "How Not to Die on an Ordinary Tuesday".

Enforces the Commercial Book Copyright Firewall:
  - CC BY 3.0 / CC BY 4.0 / CC0 papers: selects the highest-value dignified
    diagnostic figure (CT, X-ray, MRI, ECG, ultrasound, endoscopy, clinical photo),
    optimizes via Pillow (max 1080px, JPEG Q82) into assets/exhibits/, applies
    opt-in blur shield for graphic wounds/eyes/gross pathology/histology, and
    records complete journal/author/year/PMC/license attribution in data/exhibits.json.
  - CC BY-NC / CC BY-NC-ND / all-rights-reserved papers: NEVER mirrors locally;
    records a clean External Clinical Evidence Locker link-out bar instead.
  - Never overwrites existing hand-curated exhibits or manual exclusions.

Usage:
  python3 scripts/harvest_exhibits.py                  # scan all stories missing exhibits
  python3 scripts/harvest_exhibits.py --slugs slug1,slug2
  python3 scripts/harvest_exhibits.py --manifest /path/to/manifest.json --out /path/to/preharvest.json
"""

import argparse
import io
import json
import re
import time
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
EX_DIR = REPO_ROOT / "assets" / "exhibits"

# Known boilerplate / non-case PMCs and manually excluded slugs (dignity/caption-swap guardrails)
IGNORE_PMCS = {"PMC12927301"}
EXCLUDE_SLUGS = {
    "room-not-safe-to-finish",
    "fall-beneath-the-scalp",
    "migrating-heart-valves-air-sprays",
    "lesion-that-needed-a-name",
    "thread-across-the-road-kite-string",
}

UA_XML = {"User-Agent": "OrdinaryTuesdayForensicArchive/2.0 (mailto:yorekms@gmail.com)"}
UA_WEB = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"}

# Dignity / quality reject keywords
REJECT_CAPTION_RE = re.compile(
    r"\b(death scene|crime scene|body found|cadaver|autopsy room|face of the patient|facial portrait|"
    r"cut[\-\s]throat|fatal\s+.*\s+injury|external\s+autopsy|homicide|suicide\s+scene|"
    r"prisma|flow\s*chart|flowchart|consort|kaplan[\-\s]meier|forest plot|receiver operating|"
    r"roc curve|western blot|gel electrophoresis|scatter plot|bar\s*(chart|graph)|box\s*plot|"
    r"search strategy|parameters?\s+table|study\s+design|timeline\s+of\s+events)\b",
    re.I,
)

# Opt-in blur shield keywords
BLUR_CAPTION_RE = re.compile(
    r"\b(gross|macroscop|autopsy|post[\-\s]?mortem|necropsy|intraoperative|operative|excised|resected|laparotom|"
    r"deglov|avuls|burn|blister|ulcer|necrosis|necrotic|gangrene|laceration|wound|puncture|hematoma|bruis|ecchymos|"
    r"bleed|hemorrhage|eye|fundus|retina|cornea|slit[\-\s]lamp|skin|erythema|rash|swelling|strangul|"
    r"toe|finger|hand|foot|thigh|limb|specimen|biopsy|histolog|microscop|h[/&]e|haematoxylin|hematoxylin|endoscop|laryngoscop|"
    r"bronchoscop|cloacoscop|fistula|abscess|clot|thrombus|dissection|rupture|perforat|hernia\s+sac)\b",
    re.I,
)

# Imaging / clean non-graphic override (radiology & ECGs are crisp unblurred exhibits unless combined with gross photos)
CLEAN_IMAGING_RE = re.compile(
    r"\b(x-ray|radiograph|computed tomography|\bct\b|pmct|mri|magnetic resonance|"
    r"ultrasound|sonograph|echocardiog|ecg|ekg|electrocardiog|angiog|fluoroscop|schematic|diagram)\b",
    re.I,
)


def classify_code(cap):
    cl = cap.lower()
    if re.search(r"\b(ecg|ekg|electrocardiog)", cl): return "EXHIBIT A · ELECTROCARDIOGRAM"
    if re.search(r"\b(mri|magnetic resonance|venograph)", cl): return "EXHIBIT A · MRI SCAN"
    if re.search(r"\b(ultrasound|sonograph|echocardiog)", cl): return "EXHIBIT A · ULTRASOUND / ECHO"
    if re.search(r"\b(x-ray|radiograph)", cl): return "EXHIBIT A · RADIOGRAPH"
    if re.search(r"\b(ct|pmct|computed tomography|spect|angiog)\b", cl): return "EXHIBIT A · CT / IMAGING SCAN"
    if re.search(r"\b(fundus|slit-lamp|retina|cornea|oct|ophthalm)", cl): return "EXHIBIT A · OPHTHALMIC EXHIBIT"
    if re.search(r"\b(endoscop|laryngoscop|bronchoscop|cloacoscop|gastroscop)", cl): return "EXHIBIT A · ENDOSCOPY"
    if re.search(r"\b(histolog|microscop|low-power|h&e|cytolog)", cl): return "EXHIBIT A · MICROSCOPY"
    if re.search(r"\b(schematic|diagram)", cl): return "EXHIBIT A · TECHNICAL SCHEMATIC"
    return "EXHIBIT A · CLINICAL EVIDENCE"


def make_spoiler_note(cap, blur):
    if not blur:
        return "Medical imaging / diagnostic exhibit from the primary peer-reviewed case report."
    cl = cap.lower()
    if any(k in cl for k in ("retina", "fundus", "cornea", "eye", "ophthalm")):
        return "Contains close-up ophthalmology clinical photography. Click to unseal."
    if any(k in cl for k in ("burn", "wound", "lacerat", "toe", "finger", "hand", "bruis", "skin", "blister")):
        return "Contains real clinical injury/wound photography from the primary case report. Breakfast optional."
    return "Contains real surgical, endoscopic, or pathology photography from the primary journal report. Breakfast optional."


def score_figure(cap):
    cl = cap.lower()
    if len(cl) < 18 or REJECT_CAPTION_RE.search(cl):
        return -100
    s = 10
    if re.search(r"\b(ct|computed tomography|x-ray|radiograph|mri|magnetic resonance)\b", cl): s += 40
    if re.search(r"\b(ecg|ekg|ultrasound|echocardiog|angiog|fundus|oct|endoscop)\b", cl): s += 35
    if re.search(r"\b(arrow|showing|demonstrat|reveal|sign|foreign body|wire|clot|burn|tourniquet|fracture|rupture|tear|hernia|abscess|egg|mass|denture|stricture)\b", cl): s += 20
    if re.search(r"\b(gross|clinical photograph|appearance|presentation|initial|admission)\b", cl): s += 15
    if re.search(r"\b(histolog|h&e|stain|magnification|400x|200x)\b", cl): s -= 10
    if re.search(r"\b(postoperative|follow-up|healed|months later|recovery)\b", cl): s -= 5
    return s


def should_blur(cap):
    cl = cap.lower()
    is_imaging = bool(CLEAN_IMAGING_RE.search(cl))
    has_graphic = bool(BLUR_CAPTION_RE.search(cl))
    # Pure radiology / ECG without clinical/operative/gross photography stays unblurred
    if is_imaging and not re.search(r"\b(gross|macroscop|photograph|intraoperative|operative|laparotom|excised|resected|wound|burn|skin|toe|finger|hand|fundus|retina|endoscop|histolog|necropsy|autopsy|bruis|ecchymos|hernia\s+sac)\b", cl):
        return False
    return has_graphic


def inspect_pmc_article(pmcid):
    """Fetch PMC JATS XML for exact license, author/year/journal metadata, and figure captions."""
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id={pmcid}"
    xml_raw = urllib.request.urlopen(urllib.request.Request(url, headers=UA_XML), timeout=20).read().decode("utf-8", "replace")
    root = ET.fromstring(xml_raw)

    # License inspection
    lic_urls = sorted(set(re.findall(r"https?://creativecommons\.org/(?:licenses|publicdomain)/[a-z0-9\-/\.]+", xml_raw, re.I)))
    lic_text = " ".join(lic_urls).lower()
    is_nc = ("by-nc" in lic_text) or ("noncommercial" in xml_raw.lower())
    is_nd = ("-nd" in lic_text) or ("noderivs" in xml_raw.lower())
    is_ccby = bool(re.search(r"creativecommons\.org/licenses/by/(?:3\.0|4\.0)|creativecommons\.org/publicdomain/zero", lic_text))
    commercial_safe = is_ccby and (not is_nc) and (not is_nd)

    lic_label = "Unknown"
    lic_url = ""
    if commercial_safe:
        for u in lic_urls:
            if "publicdomain/zero" in u.lower():
                lic_label, lic_url = "CC0 1.0", u
                break
            m = re.search(r"/licenses/by/(\d+\.\d+)", u, re.I)
            if m:
                lic_label, lic_url = f"CC BY {m.group(1)}", u
                break
    elif lic_urls:
        lic_url = lic_urls[0]
        lic_label = "CC BY-NC-ND" if (is_nc and is_nd) else ("CC BY-NC" if is_nc else "CC BY-ND")

    # Author, year, journal
    surname = ""
    for c in root.findall(".//contrib[@contrib-type='author']"):
        sn = c.find(".//surname")
        if sn is not None and sn.text:
            surname = sn.text.strip()
            break
    year = ""
    for pd in root.findall(".//article-meta/pub-date"):
        y = pd.find("year")
        if y is not None and y.text:
            year = y.text.strip()
            break
    journal = ""
    jt = root.find(".//journal-meta//journal-title")
    if jt is not None and jt.text:
        journal = jt.text.strip()

    # Figures
    figs = []
    for fig in root.findall(".//fig"):
        lbl = "".join(fig.find("label").itertext()).strip() if fig.find("label") is not None else "Figure"
        cap_el = fig.find("caption")
        cap = re.sub(r"\s+", " ", "".join(cap_el.itertext())).strip() if cap_el is not None else ""
        href = ""
        for g in fig.findall(".//graphic"):
            for k, v in g.attrib.items():
                if k.endswith("href") and v:
                    href = v.strip()
                    break
            if href:
                break
        if href and cap:
            figs.append({"label": lbl, "href": href, "caption": cap, "score": score_figure(cap)})

    return {
        "pmcid": pmcid,
        "commercial_safe": commercial_safe,
        "license": lic_label,
        "licenseUrl": lic_url,
        "author": surname or "Primary Authors",
        "year": year or "n.d.",
        "journal": journal or "PMC Open Access",
        "figs": figs,
    }


def fetch_pmc_cdn_map(pmcid):
    """Scrape PMC article HTML once to resolve exact cdn.ncbi.nlm.nih.gov/pmc/blobs/ URLs."""
    url = f"https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/"
    html = urllib.request.urlopen(urllib.request.Request(url, headers=UA_WEB), timeout=20).read().decode("utf-8", "replace")
    urls = sorted(set(re.findall(r"https://cdn\.ncbi\.nlm\.nih\.gov/pmc/blobs/[a-z0-9]+/[a-z0-9]+/[^\"'\s>]+\.(?:jpg|jpeg|png|gif)", html, re.I)))
    by_stem = {}
    for u in urls:
        fname = u.rsplit("/", 1)[-1]
        stem = fname.rsplit(".", 1)[0].lower()
        by_stem[stem] = u
        by_stem[fname.lower()] = u
    return by_stem, urls


def download_and_optimize_image(img_url, dest_jpg):
    req = urllib.request.Request(img_url, headers=UA_WEB)
    raw = urllib.request.urlopen(req, timeout=25).read()
    im = Image.open(io.BytesIO(raw))
    w, h = im.size
    if min(w, h) < 170 or max(w, h) < 420:
        return None, (w, h)
    if im.mode not in ("RGB", "L"):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        if im.mode == "RGBA":
            bg.paste(im, mask=im.split()[3])
        else:
            bg.paste(im.convert("RGB"))
        im = bg
    elif im.mode == "L":
        im = im.convert("RGB")
    if max(w, h) > 1080:
        im.thumbnail((1080, 1080), Image.Resampling.LANCZOS)
    EX_DIR.mkdir(parents=True, exist_ok=True)
    im.save(dest_jpg, "JPEG", quality=82, optimize=True)
    return dest_jpg.stat().st_size, im.size


def harvest_for_pmcs(slug, pmcids):
    """Return (clinicalFigures_list, externalFigureLinks_list) for one story."""
    pmcids = [p for p in pmcids if p not in IGNORE_PMCS]
    if not pmcids or slug in EXCLUDE_SLUGS:
        return [], []

    best_ccby = None
    nc_links = []

    for pmcid in pmcids:
        try:
            meta = inspect_pmc_article(pmcid)
            time.sleep(0.38)
        except Exception as e:
            print(f"    [warn] PMC XML fetch failed for {pmcid} ({slug}): {e}")
            continue

        if not meta["figs"]:
            continue

        if meta["commercial_safe"]:
            ranked = sorted([f for f in meta["figs"] if f["score"] > 0], key=lambda x: x["score"], reverse=True)
            if ranked and (best_ccby is None or ranked[0]["score"] > best_ccby[0]["score"]):
                best_ccby = (ranked[0], meta)
        else:
            nc_links.append({
                "label": f"{meta['author']} et al. ({meta['year']}), {meta['journal']} — {len(meta['figs'])} clinical figure(s) on PMC",
                "url": f"https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/",
                "licenseNote": f"{meta['license']} (view directly on PMC)",
            })

    if best_ccby:
        fig, meta = best_ccby
        pmcid = meta["pmcid"]
        try:
            cdn_map, all_cdn = fetch_pmc_cdn_map(pmcid)
            time.sleep(0.35)
            href_base = fig["href"].rsplit("/", 1)[-1].lower()
            href_stem = href_base.rsplit(".", 1)[0]
            img_url = cdn_map.get(href_base) or cdn_map.get(href_stem)
            if not img_url:
                # Partial match fallback
                for k, u in cdn_map.items():
                    if href_stem in k or k in href_stem:
                        img_url = u
                        break
            if img_url:
                safe_stem = re.sub(r"[^A-Za-z0-9._-]+", "_", href_stem)
                dest_name = f"{pmcid}_{safe_stem}.jpg"
                dest_path = EX_DIR / dest_name
                sz, dims = download_and_optimize_image(img_url, dest_path)
                time.sleep(0.30)
                if sz and sz > 4000:
                    cap_clean = re.sub(r"\s+", " ", fig["caption"]).strip()
                    if len(cap_clean) > 280:
                        cap_clean = cap_clean[:277].rsplit(" ", 1)[0] + "…"
                    blur = should_blur(cap_clean)
                    return [{
                        "tier": "primary",
                        "exhibitCode": classify_code(cap_clean),
                        "src": f"assets/exhibits/{dest_name}",
                        "caption": cap_clean,
                        "spoilerNote": make_spoiler_note(cap_clean, blur),
                        "blurredByDefault": blur,
                        "citation": f"{fig['label']} from {meta['author']} et al. ({meta['year']}), {meta['journal']} · {pmcid}",
                        "license": meta["license"],
                        "licenseUrl": meta["licenseUrl"].replace("http://", "https://"),
                        "sourceUrl": f"https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/",
                    }], []
                else:
                    print(f"    [skip-tiny] {pmcid} {href_base} dims={dims} for {slug}")
        except Exception as e:
            print(f"    [warn] CDN download failed for {pmcid} ({slug}): {e}")

    return [], nc_links[:1]


def main():
    ap = argparse.ArgumentParser(description="Harvest commercial-book-safe CC-BY clinical exhibits & NC/ND evidence lockers.")
    ap.add_argument("--manifest", help="Optional fetch_new_episodes manifest.json to pre-harvest before merge")
    ap.add_argument("--out", help="Optional JSON summary output path (when using --manifest)")
    ap.add_argument("--slugs", help="Comma-separated slugs in data/stories.json to harvest")
    ap.add_argument("--all-missing", action="store_true", help="Scan all stories in data/stories.json lacking clinicalFigures & externalFigureLinks")
    args = ap.parse_args()

    if args.manifest:
        man = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
        results = {}
        print(f"Pre-harvesting exhibits for {len(man)} manifest episodes...")
        for item in man:
            slug = item["slug"]
            pmcs = [p for p in item.get("citations", {}).get("pmcids", []) if p not in IGNORE_PMCS]
            cfigs, elinks = harvest_for_pmcs(slug, pmcs)
            results[slug] = {"fileNo": item.get("fileNo", ""), "ep": item["ep"], "clinicalFigures": cfigs, "externalFigureLinks": elinks}
            tag = f"CC-BY IMG ({cfigs[0]['src']}, blur={cfigs[0]['blurredByDefault']})" if cfigs else (f"NC/ND LOCKER ({elinks[0]['licenseNote']})" if elinks else "no eligible figures")
            print(f"  {item['ep']} | {slug:45s} -> {tag}")
        out_p = Path(args.out) if args.out else Path(args.manifest).with_name("preharvest_exhibits.json")
        out_p.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        cc_n = sum(1 for v in results.values() if v["clinicalFigures"])
        nc_n = sum(1 for v in results.values() if v["externalFigureLinks"])
        print(f"\nDONE pre-harvest: {cc_n} CC-BY local exhibits + {nc_n} NC/ND lockers -> {out_p}")
        return

    ex_path = REPO_ROOT / "data" / "exhibits.json"
    stories = json.loads((REPO_ROOT / "data" / "stories.json").read_text(encoding="utf-8"))
    exhibits = json.loads(ex_path.read_text(encoding="utf-8"))
    smap = exhibits.setdefault("stories", {})

    if args.slugs:
        target_slugs = [s.strip() for s in args.slugs.split(",") if s.strip()]
    else:
        target_slugs = [
            sl for sl in stories
            if not smap.get(sl, {}).get("clinicalFigures") and not smap.get(sl, {}).get("externalFigureLinks")
        ]

    print(f"Harvesting clinical exhibits for {len(target_slugs)} target stories...")
    added_cc, added_nc = 0, 0
    for sl in target_slugs:
        st = stories.get(sl)
        if not st:
            continue
        blob = " ".join(src.get("url", "") + " " + src.get("label", "") for src in st.get("sources", []))
        blob += " " + " ".join(row.get("value", "") for row in st.get("ledger", []))
        pmcs = sorted(set(re.findall(r"\bPMC\d{5,9}\b", blob)))
        cfigs, elinks = harvest_for_pmcs(sl, pmcs)
        if cfigs:
            smap.setdefault(sl, {})["clinicalFigures"] = cfigs
            added_cc += 1
            print(f"  + CC-BY [{sl}] -> {cfigs[0]['src']} ({cfigs[0]['license']}, blur={cfigs[0]['blurredByDefault']})")
        elif elinks:
            smap.setdefault(sl, {})["externalFigureLinks"] = elinks
            added_nc += 1
            print(f"  + NC/ND [{sl}] -> {elinks[0]['label']}")

    # Refresh meta counters & visual-pilot pack
    cat = json.loads((REPO_ROOT / "data" / "catalog.json").read_text(encoding="utf-8"))
    exhibit_slugs = [c["slug"] for c in cat["cases"] if smap.get(c["slug"], {}).get("clinicalFigures")]
    img_count = sum(len(v.get("clinicalFigures", [])) for v in smap.values())
    ext_count = sum(1 for v in smap.values() if v.get("externalFigureLinks"))
    exhibits["meta"]["ccByClinicalExhibitStories"] = len(exhibit_slugs)
    exhibits["meta"]["ccByClinicalExhibitImages"] = img_count
    exhibits["meta"]["externalFigureLinkoutStories"] = ext_count
    for pk in exhibits.get("starterPacks", []):
        if pk.get("id") == "visual-pilot":
            pk["label"] = f"🩻 Real Clinical Exhibits ({len(exhibit_slugs)})"
            pk["tagline"] = f"All {len(exhibit_slugs)} chapters featuring verified commercial-safe CC-BY X-rays, CTs, MRIs, ECGs, ultrasounds, and opt-in unsealable clinical photographs."
            pk["slugs"] = exhibit_slugs

    ex_path.write_text(json.dumps(exhibits, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nHarvest complete: +{added_cc} CC-BY stories, +{added_nc} NC/ND lockers. Total CC-BY: {len(exhibit_slugs)} stories ({img_count} images).")


if __name__ == "__main__":
    main()
