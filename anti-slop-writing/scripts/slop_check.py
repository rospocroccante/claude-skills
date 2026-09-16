#!/usr/bin/env python3
"""slop_check.py: scan plain text for AI-slop tells (English and Italian).

Usage:
    python3 slop_check.py file1.txt [file2.md ...]
    cat draft.txt | python3 slop_check.py

Exit code 1 if any HARD violation is found, 0 otherwise.
For docx run `pandoc -t plain file.docx -o /tmp/t.txt` first; for pdf use pdftotext.
"""
import re
import sys

HARD_CHARS = {
    "\u2014": "em dash",
    "\u2013": "en dash",
    "\u00b7": "middle dot",
    "\u2192": "arrow",
    "\u2728": "sparkles",
}

HARD_PHRASES = [
    # English
    r"\bdelve\b", r"\bleverag(?:e|es|ed|ing)\b", r"\bseamless(?:ly)?\b",
    r"\bcutting[- ]edge\b", r"\bgame[- ]changer\b", r"\btestament to\b",
    r"\bin today'?s fast[- ]paced\b", r"\bit'?s (?:important|worth) (?:to note|noting)\b",
    r"\bwhen it comes to\b", r"\ba wide range of\b", r"\bdeep dive\b", r"\bdive into\b",
    r"\bat the end of the day\b", r"\bin conclusion\b", r"\bgreat question\b",
    r"\blet'?s dive in\b", r"\bnot only\b.{0,60}\bbut also\b", r"\btapestry\b",
    r"\bsupercharge\b", r"\bgame-changing\b", r"\bunlock(?:s|ed|ing)? the\b",
    # Italian
    r"\banche se\b", r"\b(?:è|e') importante notare\b", r"\bva sottolineato\b",
    r"\bin un mondo sempre pi(?:ù|u')\b", r"\bsenza soluzione di continuit(?:à|a')\b",
    r"\ball'avanguardia\b", r"\bpunto di svolta\b", r"\bnon solo\b.{0,60}\bma anche\b",
    r"\bun ventaglio di\b", r"\ba 360 gradi\b", r"\bin conclusione\b", r"\bin sintesi\b",
    r"\bsenza precedenti\b", r"\bcambia(?:re)? le regole del gioco\b",
]

REVIEW_PATTERNS = [
    (r"\bnot (?:just|only|merely|simply|about)\b.{0,50}\bbut\b", "antithesis pivot (not X but Y)"),
    (r"\bnot\s+\w+(?:\s+\w+){0,3},\s*but\b", "antithesis pivot (not X, but Y)"),
    (r"\brather than\b", "antithesis (rather than)"),
    (r"\bnon (?:è|sono)\s+(?:solo\s+)?\w+(?:\s+\w+){0,3},\s*(?:ma|è)\b", "antithesis pivot (non è X, ma Y)"),
    (r"\bpi(?:ù|u')\s+\w+\s+che\s+\w+\b", "antithesis flourish (più X che Y)"),
    (r",\s*(?:ensuring|allowing|enabling|empowering|helping|making it)\b", "participial result tail"),
    (r",\s*(?:garantendo|permettendo|consentendo|assicurando|rendendo)\b", "gerund result tail"),
    (r"\b(?:robust|robusto|robusta)\b", "stock adjective (check context)"),
    (r"\b(?:cruciale|fondamentale|pivotal|crucial)\b", "stock emphasis (check context)"),
    (r"\b(?:navigare|navigate|navigating)\b", "figurative navigation (check context)"),
    (r"\b(?:journey|viaggio)\b", "figurative journey (check context)"),
    (r"\b(?:landscape|panorama)\b", "figurative landscape (check context)"),
    (r"\b(?:sfrutt\w+|harness\w*|foster\w*|empower\w*)\b", "stock verb (check context)"),
    (r"\b(?:bottom line|the result:|in one line|la verit(?:à|a') (?:è|e'))\b", "punchline marker"),
    (r"[\U0001F300-\U0001FAFF\u2600-\u27BF]", "emoji or decorative symbol"),
]

def scan(name, text):
    hard, review = [], []
    lines = text.splitlines()
    for i, line in enumerate(lines, 1):
        for ch, label in HARD_CHARS.items():
            for _ in range(line.count(ch)):
                hard.append((i, label, line.strip()[:90]))
        for pat in HARD_PHRASES:
            for m in re.finditer(pat, line, re.IGNORECASE):
                hard.append((i, m.group(0), line.strip()[:90]))
        for pat, label in REVIEW_PATTERNS:
            for m in re.finditer(pat, line, re.IGNORECASE):
                review.append((i, f"{label}: \"{m.group(0)[:40]}\"", line.strip()[:90]))
    print(f"== {name} ==")
    if not hard and not review:
        print("  clean: no slop detected")
    for i, what, ctx in hard:
        print(f"  HARD   line {i}: {what}\n         > {ctx}")
    for i, what, ctx in review:
        print(f"  REVIEW line {i}: {what}\n         > {ctx}")
    print(f"  totals: {len(hard)} hard, {len(review)} review")
    return len(hard)

def main():
    total_hard = 0
    if len(sys.argv) > 1:
        for path in sys.argv[1:]:
            with open(path, encoding="utf-8", errors="replace") as f:
                total_hard += scan(path, f.read())
    else:
        total_hard += scan("stdin", sys.stdin.read())
    sys.exit(1 if total_hard else 0)

if __name__ == "__main__":
    main()
