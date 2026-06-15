#!/usr/bin/env python3
"""Parse VAST Challenge 2021 MC1 news articles and email headers into CSV."""

from __future__ import annotations

import argparse
import csv
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

# Default paths relative to project root (MC1/)
DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent / "MC1"
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent.parent / "output"

HEADER_KEYS = ("SOURCE", "TITLE", "AUTHOR", "PUBLISHED", "LOCATION")

SOURCE_TYPE_MAP: dict[str, str] = {
    "The Abila Post": "primary_local",
    "Kronos Star": "primary_local",
    "Homeland Illumination": "primary_local",
    "Central Bulletin": "primary_local",
    "Daily Pegasus": "primary_local",
    "Athena Speaks": "primary_local",
    "The General Post": "primary_local",
    "Everyday News": "primary_local",
    "Modern Rubicon": "primary_local",
    "Tethys News": "primary_institutional",
    "Centrum Sentinel": "primary_institutional",
    "Worldwise": "derivative_international",
    "World Source": "derivative_international",
    "World Journal": "derivative_international",
    "International Times": "derivative_international",
    "International News": "derivative_international",
    "Who What News": "derivative_international",
    "The Wrap": "derivative_international",
    "The World": "derivative_international",
    "The Continent": "derivative_international",
    "The Truth": "derivative_international",
    "The Orb": "derivative_international",
    "The Tulip": "derivative_international",
    "The Light of Truth": "derivative_international",
    "The Guide": "derivative_international",
    "The Explainer": "derivative_international",
    "News Online Today": "aggregator",
    "All News Today": "aggregator",
    "News Desk": "aggregator",
}

ENTITY_PATTERNS: list[tuple[str, str]] = [
    ("GAStech", r"\bGAStech\b|\bGASTech\b|\bGastech\b"),
    ("POK", r"\bPOK\b|Protectors of Kronos"),
    ("APA", r"\bAPA\b|Asterian People'?s Army"),
    ("Government", r"\bGovernment\b|President Kapelou|Kronos Government|government of Kronos"),
    ("Elian Karel", r"Elian Karel"),
    ("Sten Sanjorge", r"Sten Sanjorge"),
    ("President Kapelou", r"President Kapelou|Kapelou"),
    ("Henk Bodrogi", r"Henk Bodrogi"),
    ("Elodis", r"\bElodis\b"),
    ("Abila", r"\bAbila\b"),
    ("Tethys", r"\bTethys\b"),
    ("Centrum", r"\bCentrum\b"),
]

TOPIC_RULES: list[tuple[str, str]] = [
    ("environment", r"environment|pollution|contamin|ecolog|toxic|spill|wellhead"),
    ("protest", r"protest|demonstrat|riot|rally|march|vandal"),
    ("ipo", r"\bIPO\b|initial public offering|windfall|vested shares"),
    ("kidnapping", r"kidnap|abduct|\bmissing\b|hostage"),
    ("business", r"profit|tax|employ|cooperation|revenue|investor|partnership"),
    ("security", r"security|police|patrol|cordons?|teargas|arrest"),
    ("legal", r"court|lawsuit|indict|tax avoidance|illegal"),
]

NARRATIVE_RULES: list[tuple[str, str]] = [
    ("1", r"cooperation|partnership|tax|employ|profit|investor|\bIPO\b|initial public offering|windfall"),
    ("2", r"environment|pollution|contamin|ecolog|toxic|health|illness"),
    ("3", r"\bPOK\b|Protectors of Kronos|\bAPA\b|Asterian|protest|demonstrat|riot|criminals?|gangsters?"),
    ("4", r"kidnap|abduct|\bmissing\b|hostage|January 20|2014/01/20|20 January 2014|VIP visit|security procedure"),
]

MONTHS = {
    "january": 1,
    "february": 2,
    "march": 3,
    "april": 4,
    "may": 5,
    "june": 6,
    "july": 7,
    "august": 8,
    "september": 9,
    "october": 10,
    "november": 11,
    "december": 12,
    "jan": 1,
    "feb": 2,
    "mar": 3,
    "apr": 4,
    "jun": 6,
    "jul": 7,
    "aug": 8,
    "sep": 9,
    "sept": 9,
    "oct": 10,
    "nov": 11,
    "dec": 12,
}


def read_text(path: Path) -> str:
    for encoding in ("utf-8", "latin-1", "cp1252"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    return path.read_text(encoding="utf-8", errors="replace")


def looks_like_date(text: str) -> bool:
    text = text.strip()
    if not text:
        return False
    if re.match(r"^\d{4}[/-]\d{1,2}[/-]\d{1,2}$", text):
        return True
    if re.match(r"^\d{1,2}\s*[A-Za-z]+\s*\d{4}(\s+\d{3,4})?$", text):
        return True
    if re.match(r"^\d{1,2}\s+[A-Za-z]+\s+\d{4}$", text):
        return True
    if re.match(r"^\d{1,4}\s+[A-Za-z]+\s+\d{4}$", text):
        return True
    if re.match(r"^[A-Za-z]+\s+\d{1,2},\s+\d{4}$", text):
        return True
    return False


def parse_date(raw: str) -> tuple[str | None, str | None]:
    """Return (iso_date, parse_note). iso_date is YYYY-MM-DD or None."""
    raw = raw.strip()
    if not raw:
        return None, "empty"

    # Strip trailing blog timestamps like "1405", not the publication year.
    m = re.match(r"^(\d{1,2}\s+[A-Za-z]+\s+\d{4})\s+\d{3,4}\s*$", raw)
    if m:
        raw = m.group(1).strip()

    m = re.match(r"^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$", raw)
    if m:
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return f"{y:04d}-{mo:02d}-{d:02d}", "ok"

    m = re.match(r"^(\d{1,2})\s*([A-Za-z]+)\s*(\d{4})$", raw)
    if m:
        d, month_name, y = int(m.group(1)), m.group(2).lower(), int(m.group(3))
        mo = MONTHS.get(month_name)
        if mo:
            return f"{y:04d}-{mo:02d}-{d:02d}", "ok"
        return None, f"unknown_month:{month_name}"

    m = re.match(r"^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$", raw)
    if m:
        month_name, d, y = m.group(1).lower(), int(m.group(2)), int(m.group(3))
        mo = MONTHS.get(month_name)
        if mo:
            return f"{y:04d}-{mo:02d}-{d:02d}", "ok"
        return None, f"unknown_month:{month_name}"

    return None, f"unparsed:{raw[:40]}"


def parse_article_file(path: Path, folder_source: str) -> dict:
    text = read_text(path)
    lines = text.splitlines()

    fields: dict[str, str] = {}
    body_lines: list[str] = []
    i = 0
    consumed_date_line = False

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("SOURCE:"):
            fields["source"] = stripped.split(":", 1)[1].strip()
            i += 1
            continue
        if stripped.startswith("TITLE:"):
            fields["title"] = stripped.split(":", 1)[1].strip()
            i += 1
            continue
        if stripped.startswith("AUTHOR:"):
            fields["author"] = stripped.split(":", 1)[1].strip()
            i += 1
            continue
        if stripped.startswith("PUBLISHED:"):
            published_value = stripped.split(":", 1)[1].strip()
            if published_value.lower().startswith("by "):
                fields["author"] = fields.get("author") or published_value[3:].strip()
                j = i + 1
                while j < len(lines) and not lines[j].strip():
                    j += 1
                if j < len(lines) and looks_like_date(lines[j]):
                    fields["published_raw"] = lines[j].strip()
                    consumed_date_line = True
                    i = j + 1
                    continue
                fields["published_raw"] = published_value
            elif looks_like_date(published_value):
                fields["published_raw"] = published_value
            else:
                # Author name in PUBLISHED field; date often appears on a later line.
                fields["author"] = fields.get("author") or published_value
                j = i + 1
                while j < len(lines):
                    candidate = lines[j].strip()
                    if not candidate:
                        j += 1
                        continue
                    if candidate.startswith(("SOURCE:", "TITLE:", "AUTHOR:", "LOCATION:")):
                        break
                    if looks_like_date(candidate):
                        fields["published_raw"] = candidate
                        consumed_date_line = True
                        i = j + 1
                        break
                    break
                else:
                    i = j
                    continue
                if "published_raw" in fields:
                    continue
            i += 1
            continue
        if stripped.startswith("LOCATION:"):
            fields["location"] = stripped.split(":", 1)[1].strip()
            i += 1
            continue

        if fields.get("source") and fields.get("title"):
            if not stripped:
                i += 1
                continue
            if (
                not consumed_date_line
                and not fields.get("location")
                and looks_like_date(stripped)
                and "published_raw" not in fields
            ):
                fields["published_raw"] = stripped
                consumed_date_line = True
                i += 1
                continue
            body_lines = lines[i:]
            break

        i += 1

    body = "\n".join(body_lines).strip()
    article_id = path.stem
    source = fields.get("source") or folder_source

    # Some files put the date in AUTHOR by mistake.
    author_field = fields.get("author", "")
    if not fields.get("published_raw") and looks_like_date(author_field):
        fields["published_raw"] = author_field
        fields["author"] = ""

    published_raw = fields.get("published_raw", "")
    date_iso, date_note = parse_date(published_raw)

    if not date_iso:
        for line in lines[:20]:
            candidate = line.strip()
            if looks_like_date(candidate):
                date_iso, date_note = parse_date(candidate)
                if date_iso:
                    published_raw = fields.get("published_raw") or candidate
                    break

    combined = f"{fields.get('title', '')} {body}"
    entities = match_patterns(combined, ENTITY_PATTERNS)
    topics = match_patterns(combined, TOPIC_RULES)
    narrative_lines = match_patterns(combined, NARRATIVE_RULES)

    word_count = len(re.findall(r"\b\w+\b", body))
    summary = summarize(body)

    return {
        "article_id": article_id,
        "source": source,
        "source_folder": folder_source,
        "source_type": SOURCE_TYPE_MAP.get(source, "unclassified"),
        "title": fields.get("title", ""),
        "author": fields.get("author", ""),
        "published_raw": published_raw,
        "date": date_iso or "",
        "date_parse_note": date_note,
        "location": fields.get("location", ""),
        "word_count": word_count,
        "entities": "|".join(entities),
        "topics": "|".join(topics),
        "narrative_lines": "|".join(narrative_lines),
        "summary": summary,
        "body": body,
        "file_path": str(path.as_posix()),
    }


def match_patterns(text: str, rules: list[tuple[str, str]]) -> list[str]:
    found: list[str] = []
    for label, pattern in rules:
        if re.search(pattern, text, re.IGNORECASE):
            found.append(label)
    return found


def summarize(body: str, max_len: int = 240) -> str:
    text = re.sub(r"\s+", " ", body).strip()
    if len(text) <= max_len:
        return text
    cut = text[:max_len]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut + "..."


def parse_email_address(raw: str) -> tuple[str, str, str]:
    raw = raw.strip().strip('"')
    if "@" not in raw:
        return raw, "", ""
    local, domain = raw.rsplit("@", 1)
    name = local.replace(".", " ")
    org = "GAStech"
    if "kronos" in domain:
        org = "GAStech-Kronos"
    elif "tethys" in domain:
        org = "GAStech-Tethys"
    return name, domain, org


def normalize_subject(subject: str) -> str:
    s = subject.strip()
    while True:
        updated = re.sub(r"^(RE|FW|FWD):\s*", "", s, flags=re.IGNORECASE)
        if updated == s:
            break
        s = updated.strip()
    return s


def parse_emails(path: Path) -> list[dict]:
    rows: list[dict] = []
    with path.open(encoding="latin-1", newline="") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, start=1):
            from_raw = row.get("From", "").strip()
            to_raw = row.get("To", "").strip()
            date_raw = row.get("Date", "").strip()
            subject = row.get("Subject", "").strip()

            from_name, from_domain, from_org = parse_email_address(from_raw)
            recipients = [r.strip() for r in to_raw.split(",") if r.strip()]
            to_names: list[str] = []
            to_domains: set[str] = set()
            to_orgs: set[str] = set()
            for recipient in recipients:
                name, domain, org = parse_email_address(recipient)
                to_names.append(name)
                if domain:
                    to_domains.add(domain)
                if org:
                    to_orgs.add(org)

            date_iso = ""
            try:
                dt = datetime.strptime(date_raw, "%m/%d/%Y %H:%M")
                date_iso = dt.strftime("%Y-%m-%d %H:%M")
            except ValueError:
                date_iso = date_raw

            topics = match_patterns(f"{subject} {from_org}", TOPIC_RULES)
            if re.search(r"\bIPO\b", subject, re.IGNORECASE):
                topics = list(dict.fromkeys(topics + ["ipo"]))
            if re.search(r"security|patrol|VIP", subject, re.IGNORECASE):
                topics = list(dict.fromkeys(topics + ["security"]))

            rows.append(
                {
                    "email_id": idx,
                    "from_email": from_raw,
                    "from_name": from_name,
                    "from_domain": from_domain,
                    "from_org": from_org,
                    "to_emails": "; ".join(recipients),
                    "to_names": "; ".join(to_names),
                    "to_count": len(recipients),
                    "to_domains": "; ".join(sorted(to_domains)),
                    "to_orgs": "; ".join(sorted(to_orgs)),
                    "date_raw": date_raw,
                    "date": date_iso,
                    "subject": subject,
                    "thread_subject": normalize_subject(subject),
                    "topics": "|".join(topics),
                }
            )
    return rows


def parse_all_articles(news_dir: Path) -> list[dict]:
    articles: list[dict] = []
    for source_dir in sorted(news_dir.iterdir()):
        if not source_dir.is_dir():
            continue
        for file_path in sorted(source_dir.glob("*.txt"), key=lambda p: int(p.stem) if p.stem.isdigit() else p.stem):
            articles.append(parse_article_file(file_path, source_dir.name))
    articles.sort(key=lambda a: (a["date"] or "9999-99-99", a["article_id"]))
    return articles


def build_source_summary(articles: list[dict]) -> list[dict]:
    grouped: dict[str, list[dict]] = {}
    for article in articles:
        grouped.setdefault(article["source"], []).append(article)

    summary_rows: list[dict] = []
    for source in sorted(grouped):
        items = grouped[source]
        dates = [a["date"] for a in items if a["date"]]
        topic_counter: Counter[str] = Counter()
        entity_counter: Counter[str] = Counter()
        for item in items:
            for topic in filter(None, item["topics"].split("|")):
                topic_counter[topic] += 1
            for entity in filter(None, item["entities"].split("|")):
                entity_counter[entity] += 1

        summary_rows.append(
            {
                "source": source,
                "source_type": SOURCE_TYPE_MAP.get(source, "unclassified"),
                "article_count": len(items),
                "date_min": min(dates) if dates else "",
                "date_max": max(dates) if dates else "",
                "unparsed_dates": sum(1 for a in items if not a["date"]),
                "top_topics": "; ".join(f"{k}({v})" for k, v in topic_counter.most_common(5)),
                "top_entities": "; ".join(f"{k}({v})" for k, v in entity_counter.most_common(5)),
            }
        )
    return summary_rows


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def print_stats(articles: list[dict], emails: list[dict]) -> None:
    unparsed = [a for a in articles if not a["date"]]
    print(f"Articles parsed: {len(articles)}")
    print(f"  Sources: {len({a['source'] for a in articles})}")
    print(f"  Unparsed dates: {len(unparsed)}")
    if unparsed[:5]:
        print("  Examples:")
        for item in unparsed[:5]:
            print(f"    - {item['file_path']} -> {item['published_raw']!r}")
    print(f"Emails parsed: {len(emails)}")
    print(f"  Unique thread subjects: {len({e['thread_subject'] for e in emails})}")
    print(f"  IPO-related emails: {sum(1 for e in emails if 'ipo' in e['topics'])}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Parse MC1 dataset into CSV files.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=DEFAULT_DATA_DIR,
        help="Path to MC1 data folder containing 'News Articles' and 'email headers.csv'",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Directory for generated CSV files",
    )
    args = parser.parse_args()

    news_dir = args.data_dir / "News Articles"
    email_path = args.data_dir / "email headers.csv"

    if not news_dir.is_dir():
        raise SystemExit(f"News directory not found: {news_dir}")
    if not email_path.is_file():
        raise SystemExit(f"Email CSV not found: {email_path}")

    articles = parse_all_articles(news_dir)
    emails = parse_emails(email_path)
    sources = build_source_summary(articles)

    article_fields = [
        "article_id",
        "source",
        "source_folder",
        "source_type",
        "title",
        "author",
        "published_raw",
        "date",
        "date_parse_note",
        "location",
        "word_count",
        "entities",
        "topics",
        "narrative_lines",
        "summary",
        "body",
        "file_path",
    ]
    email_fields = [
        "email_id",
        "from_email",
        "from_name",
        "from_domain",
        "from_org",
        "to_emails",
        "to_names",
        "to_count",
        "to_domains",
        "to_orgs",
        "date_raw",
        "date",
        "subject",
        "thread_subject",
        "topics",
    ]
    source_fields = [
        "source",
        "source_type",
        "article_count",
        "date_min",
        "date_max",
        "unparsed_dates",
        "top_topics",
        "top_entities",
    ]

    out = args.output_dir
    lite_articles = [{k: v for k, v in a.items() if k != "body"} for a in articles]
    write_csv(out / "articles_lite.csv", lite_articles, [f for f in article_fields if f != "body"])
    write_csv(out / "emails.csv", emails, email_fields)
    write_csv(out / "sources.csv", sources, source_fields)

    print_stats(articles, emails)
    print(f"\nOutput written to: {out.resolve()}")


if __name__ == "__main__":
    main()
