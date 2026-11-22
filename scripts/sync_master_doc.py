#!/usr/bin/env python3
"""
Reusable Native Google Doc Master Lineup Auto-Sync
for "How Not to Die on an Ordinary Tuesday".

Updates the existing native Google Doc (preserving its permanent URL & Drive shortcut)
from book/MASTER_LINEUP.md with auto-fitted tables and dynamic chapter-count title.
Refuses to overwrite if unresolved stakeholder comments exist unless --force is passed.

Usage:
  python3 scripts/sync_master_doc.py
  python3 scripts/sync_master_doc.py --doc-id <DOC_ID>
"""

import argparse
import json
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DOC_ID = "1z_DJsfEpC5ElgPFbr5Qwe077Fw-0grSjbU-SkC8kCRw"


def main():
    ap = argparse.ArgumentParser(description="Sync book/MASTER_LINEUP.md into the native Google Doc Master Lineup.")
    ap.add_argument("--doc-id", default=DEFAULT_DOC_ID, help="Target Google Doc ID")
    ap.add_argument("--force", action="store_true", help="Proceed even if open comments exist on the doc")
    args = ap.parse_args()

    md_path = REPO_ROOT / "book" / "MASTER_LINEUP.md"
    cat = json.loads((REPO_ROOT / "data" / "catalog.json").read_text(encoding="utf-8"))
    total = len(cat["cases"])
    assert md_path.exists(), f"Missing {md_path} — run scripts/build_all.py first."

    # 1. Collaborative review guardrail: verify zero unresolved comments before replacing doc content
    print(f"[1/3] Checking existing Google Doc ({args.doc_id}) for unresolved comments...")
    raw_doc = subprocess.check_output(["gdocs", "readonly", "read", args.doc_id, "--json"], text=True)
    doc_info = json.loads(raw_doc)
    open_comments = [c for c in doc_info.get("comments", []) if not c.get("resolved")]
    if open_comments and not args.force:
        raise RuntimeError(
            f"Refusing to replace Doc {args.doc_id}: found {len(open_comments)} unresolved comment(s). "
            f"Resolve them first or pass --force."
        )

    # 2. Import markdown in-place with auto-fitted tables & pageless formatting
    new_title = f"How Not to Die on an Ordinary Tuesday — {total}-Story Master Lineup & Pilots"
    print(f"[2/3] Syncing {md_path.name} ({md_path.stat().st_size:,} bytes) into Doc {args.doc_id} (--auto-fit-tables)...")
    subprocess.run(
        [
            "gdocs", "mutate", "import-md", str(md_path),
            "--update", args.doc_id,
            "--title", new_title,
            "--auto-fit-tables",
            "--pageless",
        ],
        check=True,
    )

    # 3. Ensure Drive file name reflects the updated chapter count (preserving exact Doc ID & shortcut!)
    print(f"[3/3] Updating Drive title -> '{new_title}'...")
    subprocess.run(["gdrive", "mutate", "rename", args.doc_id, new_title], check=True)
    print(f"\nDONE! Native Google Doc synced to {total} chapters:")
    print(f"  https://docs.google.com/document/d/{args.doc_id}/edit")


if __name__ == "__main__":
    main()
