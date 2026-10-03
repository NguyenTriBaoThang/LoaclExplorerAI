"""Download and convert the public HCMC flood-report table to UTF-8 CSV.

This preserves reported observations only. It does not create model labels,
road-edge IDs, flood-free intervals, or a flood_training.csv training set.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
from pathlib import Path
from urllib.request import Request, urlopen


SOURCE_URL = "https://dataverse.ird.fr/api/access/datafile/50148?format=original"
EXPECTED_MD5 = "39de82a4ff2401e527a6dc5be13b25f0"
DEFAULT_OUTPUT = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "raw"
    / "hcmc_flood_reports_2002_2026.csv"
)


def download_bytes() -> bytes:
    request = Request(SOURCE_URL, headers={"User-Agent": "LocalExplorerAI-data-import/1.0"})
    with urlopen(request, timeout=60) as response:
        payload = response.read()
    actual_md5 = hashlib.md5(payload).hexdigest()
    if actual_md5 != EXPECTED_MD5:
        raise RuntimeError(
            f"Source checksum mismatch: expected {EXPECTED_MD5}, got {actual_md5}. "
            "No output was written."
        )
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--force", action="store_true", help="replace an existing output CSV"
    )
    args = parser.parse_args()

    if args.output.exists() and not args.force:
        raise SystemExit(
            f"Refusing to overwrite {args.output}; choose another --output or pass --force."
        )

    source = download_bytes().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(source, newline=""), delimiter="\t")
    if not reader.fieldnames or len(reader.fieldnames) != 22:
        raise RuntimeError(
            f"Unexpected source schema: expected 22 columns, got {len(reader.fieldnames or [])}."
        )

    rows = list(reader)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8-sig", newline="") as output_file:
        writer = csv.DictWriter(output_file, fieldnames=reader.fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    date_column = "Date"
    missing_dates = sum(not (row.get(date_column) or "").strip() for row in rows)
    print(f"Saved {len(rows)} source observations × {len(reader.fieldnames)} columns")
    print(f"Output: {args.output.resolve()}")
    print(f"Rows without an exact Date value: {missing_dates}")
    print(f"Source MD5 verified: {EXPECTED_MD5}")
    print("This is a raw event-report export, not a validated model-training table.")


if __name__ == "__main__":
    main()
