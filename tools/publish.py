#!/usr/bin/env python3
"""Publish a sanitised copy of the local Claude Code skills into this repository.

The local skills directory keeps project-specific names. This script copies it into the repository, rewrites the text according to a rules file that lives outside the repository (the rules name the things to remove, so they must not be published), then refuses to commit if any blocklisted pattern survives.

Usage:
    tools/publish.py            # copy, rewrite, scan; leave the tree for review
    tools/publish.py --push     # same, then commit and push if the scan is clean
    tools/publish.py --rules PATH

Rules file (JSON):
    skills_dir          local skills directory, default ~/.claude/skills
    exclude_skills      top-level directories in skills_dir not to publish
    project_skills      list of {src, dest}: extra skill directories copied from projects
    text_extensions     file suffixes treated as text and rewritten
    skip_files          glob patterns never rewritten or scanned (lockfiles)
    replacements        ordered list of {pattern, replacement, files?, flags?}
    section_overrides   list of {file, heading, body}: replace a markdown section body
    blocklist           regex patterns; one surviving match aborts the publish
"""

import argparse
import fnmatch
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
KEEP_AT_ROOT = {".git", "tools", "README.md", ".gitignore"}
DEFAULT_RULES = Path(os.environ.get("CLAUDE_SKILLS_PUBLISH_RULES", str(Path.home() / ".config" / "claude-skills-publish" / "rules.json")))
COPY_IGNORE = shutil.ignore_patterns(".git", ".DS_Store", "node_modules", ".next", ".env", ".env.local", "__pycache__")


def load_rules(path: Path) -> dict:
    if not path.is_file():
        sys.exit(f"rules file not found: {path}")
    rules = json.loads(path.read_text(encoding="utf-8"))
    rules.setdefault("skills_dir", "~/.claude/skills")
    rules.setdefault("exclude_skills", [])
    rules.setdefault("project_skills", [])
    rules.setdefault("text_extensions", [".md", ".txt", ".ts", ".tsx", ".js", ".jsx", ".json", ".py", ".sh", ".css", ".prisma", ".yaml", ".yml", ".example", ".gitignore", ".gitattributes"])
    rules.setdefault("skip_files", ["**/package-lock.json", "**/yarn.lock", "**/pnpm-lock.yaml"])
    rules.setdefault("replacements", [])
    rules.setdefault("section_overrides", [])
    rules.setdefault("blocklist", [])
    return rules


def matches_any(relpath: str, globs) -> bool:
    return any(fnmatch.fnmatch(relpath, g) for g in globs)


def is_text(path: Path, rules: dict) -> bool:
    name = path.name
    return path.suffix in rules["text_extensions"] or name in rules["text_extensions"]


def reset_tree(produced: set[str]) -> None:
    for entry in REPO.iterdir():
        if entry.name in KEEP_AT_ROOT or entry.name in produced:
            continue
        if entry.is_dir():
            shutil.rmtree(entry)
        else:
            entry.unlink()


def copy_sources(rules: dict) -> list[Path]:
    produced: list[Path] = []
    skills_dir = Path(os.path.expanduser(rules["skills_dir"]))
    if not skills_dir.is_dir():
        sys.exit(f"skills_dir not found: {skills_dir}")
    for child in sorted(skills_dir.iterdir()):
        if not child.is_dir() or child.name.startswith(".") or child.name in rules["exclude_skills"]:
            continue
        if not (child / "SKILL.md").is_file():
            print(f"skip {child.name}: no SKILL.md")
            continue
        dest = REPO / child.name
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(child, dest, ignore=COPY_IGNORE)
        produced.append(dest)
    for parent in {Path(item["dest"]).parts[0] for item in rules["project_skills"]}:
        if (REPO / parent).is_dir():
            shutil.rmtree(REPO / parent)
    for item in rules["project_skills"]:
        src = Path(os.path.expanduser(item["src"]))
        dest = REPO / item["dest"]
        if not (src / "SKILL.md").is_file():
            print(f"skip project skill {src}: no SKILL.md")
            continue
        if dest.exists():
            shutil.rmtree(dest)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(src, dest, ignore=COPY_IGNORE)
        produced.append(dest)
    return produced


def iter_text_files(roots, rules: dict):
    for root in roots:
        for path in sorted(root.rglob("*")):
            if not path.is_file() or not is_text(path, rules):
                continue
            rel = path.relative_to(REPO).as_posix()
            if matches_any(rel, rules["skip_files"]):
                continue
            yield path, rel


def replace_section(text: str, heading: str, body: str) -> tuple[str, bool]:
    lines = text.splitlines(keepends=True)
    level = len(heading) - len(heading.lstrip("#"))
    start = next((i for i, l in enumerate(lines) if l.rstrip("\n") == heading), None)
    if start is None:
        return text, False
    end = len(lines)
    for j in range(start + 1, len(lines)):
        stripped = lines[j].lstrip("#")
        depth = len(lines[j]) - len(stripped)
        if 0 < depth <= level and stripped.startswith(" "):
            end = j
            break
    new_body = body.rstrip("\n") + "\n\n"
    return "".join(lines[: start + 1]) + "\n" + new_body + "".join(lines[end:]), True


def rewrite(roots, rules: dict) -> None:
    counts = [0] * len(rules["replacements"])
    compiled = []
    for r in rules["replacements"]:
        flags = re.MULTILINE
        if "i" in r.get("flags", ""):
            flags |= re.IGNORECASE
        compiled.append(re.compile(r["pattern"], flags))
    overrides_done = {o["file"]: False for o in rules["section_overrides"]}
    for path, rel in iter_text_files(roots, rules):
        original = path.read_text(encoding="utf-8", errors="surrogateescape")
        text = original
        for o in rules["section_overrides"]:
            if o["file"] == rel:
                text, ok = replace_section(text, o["heading"], o["body"])
                overrides_done[rel] = overrides_done[rel] or ok
        for idx, (rx, r) in enumerate(zip(compiled, rules["replacements"])):
            if r.get("files") and not matches_any(rel, r["files"]):
                continue
            text, n = rx.subn(r["replacement"], text)
            counts[idx] += n
        if text != original:
            path.write_text(text, encoding="utf-8", errors="surrogateescape")
    for r, n in zip(rules["replacements"], counts):
        flag = "" if n else "   <- no match, rule may be stale"
        print(f"  {n:4d}  {r['pattern'][:60]}{flag}")
    for rel, ok in overrides_done.items():
        print(f"  section override {'applied' if ok else 'NOT FOUND'}: {rel}")


def scan(rules: dict) -> list[tuple[str, int, str]]:
    hits = []
    patterns = [re.compile(p) for p in rules["blocklist"]]
    roots = [p for p in REPO.iterdir() if p.name != ".git"]
    files = list(iter_text_files([p for p in roots if p.is_dir()], rules))
    files += [(p, p.name) for p in roots if p.is_file() and is_text(p, rules)]
    for path, rel in files:
        for lineno, line in enumerate(path.read_text(encoding="utf-8", errors="surrogateescape").splitlines(), 1):
            for rx in patterns:
                m = rx.search(line)
                if m:
                    hits.append((rel, lineno, m.group(0)))
    return hits


def git(*args, check=True, capture=False):
    env = {k: v for k, v in os.environ.items() if k != "GITHUB_TOKEN"}
    return subprocess.run(["git", *args], cwd=REPO, env=env, check=check, text=True, capture_output=capture)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--rules", type=Path, default=DEFAULT_RULES)
    ap.add_argument("--push", action="store_true", help="commit and push when the scan is clean")
    ap.add_argument("-m", "--message", default="chore: publish sanitised skills")
    args = ap.parse_args()

    rules = load_rules(args.rules)
    produced = copy_sources(rules)
    reset_tree({p.relative_to(REPO).parts[0] for p in produced})
    print(f"copied {len(produced)} skill directories")
    print("replacements:")
    rewrite(produced, rules)
    hits = scan(rules)
    if hits:
        print(f"\nBLOCKED: {len(hits)} blocklist hit(s) remain, nothing committed", file=sys.stderr)
        for rel, lineno, match in hits[:80]:
            print(f"  {rel}:{lineno}: {match}", file=sys.stderr)
        return 2
    print("scan clean")
    if not args.push:
        print("dry run: review with git status / git diff, then rerun with --push")
        return 0
    git("add", "-A")
    if git("diff", "--cached", "--quiet", check=False).returncode == 0:
        print("nothing to commit")
        return 0
    git("commit", "-q", "-m", args.message)
    git("push")
    print(git("log", "--oneline", "-1", capture=True).stdout.strip())
    return 0


if __name__ == "__main__":
    sys.exit(main())
