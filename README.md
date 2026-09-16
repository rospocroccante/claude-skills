# Claude Code skills

Sanitised copies of the custom skills used with Claude Code. The live skills stay in `~/.claude/skills` on the authoring machine and keep their project-specific wording. `tools/publish.py` copies them here, replaces names of companies, people, internal notes and local paths with role words (the identity vendor, the product team, `<project-root>`), and refuses to commit while any blocklisted term survives. The rules file that names those terms lives outside the repository.

## Skills

| Skill | Use when | Files |
|---|---|---|
| `anti-slop-writing` | Any prose, English or Italian. Ships `references/patterns.md` and `scripts/slop_check.py` | 3 |
| `futurismo-writing-skill` | Meeting talking points, standup notes, anything the user reads aloud | 1 |
| `gauntlet-loop` | Work that has to beat an external bar: builder plus fresh-context critic, repeated. Adapted from somethingbig.ai/gauntlet-loop | 2 |
| `model-roles` | Spawning subagents across models: Fable as judge, Opus as executor, with a variant for accounts without Fable | 1 |
| `simpler` | Explaining a concept to a confused reader with one sustained metaphor. Also published at github.com/rospocroccante/simpler-skill | 1 |
| `project-skills/functional-and-technical-design` | Functional or technical design documents with PlantUML diagrams and a fixed section template. Copied from a project's `.claude/skills`; its project context section is replaced by a generic one that points at a context file inside the project | 1 |

## Install on another machine

```bash
git clone git@github.com:rospocroccante/claude-skills.git ~/.claude/skills
```

If `~/.claude/skills` already exists, clone elsewhere and symlink each skill directory into it. Skills load at session start, so restart Claude Code afterwards. `project-skills/` is not picked up as a skill from there; copy the directory you need into a project's `.claude/skills/`.

## Publishing from the authoring machine

```bash
~/claude-skills/tools/publish.py          # copy, rewrite, scan; review with git diff
~/claude-skills/tools/publish.py --push   # same, then commit and push if the scan is clean
```

The rules file defaults to `~/.config/claude-skills-publish/rules.json` (override with `CLAUDE_SKILLS_PUBLISH_RULES`). It lists the skills to exclude, extra project skills to copy, ordered regex replacements, section overrides, and the blocklist. A replacement with zero matches is reported, so a stale rule shows up after a skill is edited. A blocklist hit leaves the rewritten tree in place for inspection and exits with status 2.

