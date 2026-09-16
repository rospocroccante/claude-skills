---
name: model-roles
description: Use when spawning subagents or splitting work across models, when an adversarial verdict on code or candidates is needed, or when the user names the setup (Fable as judge, Opus as executor, "model roles", "fable giudice", "opus esecutore", "solo opus", "senza fable"). Encodes the standing division of labour in both variants, with and without a Fable-capable account.
---

# Model roles: Opus executes, Fable judges

Standing division of labour. Do not re-negotiate it in session.

## Pick the variant

Read the environment line "You are powered by the model named ...". If the account has
Fable (the main session runs Fable, or an Agent spawn with model "fable" is accepted),
use variant A. An account with no Fable anywhere uses variant B. If a fable
spawn errors out, fall back to B without ceremony.

An explicit user request beats detection: "solo opus", "senza fable" or "variante B"
forces B even where Fable exists; "con fable" or "variante A" forces A, and if Fable
is genuinely unavailable say so instead of silently downgrading. The variant does not
depend on which model runs the main session, only on what the Agent tool can spawn.

## Variant A (Fable account)

| Role | Agent model | Does |
|---|---|---|
| Orchestrator | fable (main session) | Splits the work, spawns workers, integrates results, calls the verdicts. Cost cap: terse prompts, never bulk-reads or bulk-writes files itself, delegates every heavy task. |
| Heavy worker / code | opus | All heavy or quality-critical work: production code, refactoring, architecture calls. Quality and a coherent logical thread come before cost. |
| Judge | fable | Adversarial verification. Reviews diffs and candidate solutions, returns a verdict. Never fixes code. Gets artifacts stripped of authorship info. |
| Scout | sonnet | Recon only: codebase mapping, parallel research, doc lookups. No production code. |
| Grunt | haiku | Trivial mechanical bulk: scans, renames, log triage. Never production code. |

Extra rule for A: Fable stays cheap. It plans and judges on summaries and diffs handed
to it, not on raw trees; one orchestration pass in, one integration pass out. A Fable
prompt growing past a screen of text means the split is wrong: push the material down
to the workers.

## Variant B (account without Fable)

| Role | Agent model | Does |
|---|---|---|
| Orchestrator + heavy worker | opus (main session) | Merged: a cheap coordinator does not exist here, and paying Opus tokens twice buys nothing. One coherent thread plans, splits, spawns workers, and writes the production code itself. |
| Judge | opus subagent | Fresh context. Diffs only, no conversation history, no authorship info, no chat about intent. The same model class wrote the code, so blindness carries the entire anti-bias load. Never fixes, only judges. |
| Scout | sonnet | Recon, plus promoted on this account: test-covered medium implementation (test scaffolding, mechanical refactors, boilerplate) that Opus then reviews. |
| Grunt | haiku | Same as variant A. |

Extra rules for B: the writer never judges in its own context; every verdict comes from
a subagent that starts clean. The cost lever sits on delegation depth, not on the
coordinator: recon and bulk go down to Sonnet and Haiku aggressively, and the main
session never burns Opus tokens on work a scout could have summarized first. Work whose
failure needs judgment to detect stays with Opus; Sonnet keeps only work whose failure
a test catches. `/fast` covers long mechanical stretches in the main session.

## Ground rules (both variants)

- Heavy lifting goes to Opus, always. Sonnet and Haiku never deliver production code:
  the saving is on recon and mechanics, not on the code that ships.
- Independent subagents run in parallel, never serially.
- Tests first, verdict second: the judge is called only after the suite is green.
- When quality matters: N independent candidates, one judge picks blind, without
  knowing which agent produced which.

## Spawning (Agent tool)

Builder:

    Agent { model: "opus", description: "<short>", prompt:
      task + concrete file paths + the bar it must meet +
      "Do not grade your own work. Report what changed and where." }

Judge (model "fable" in variant A, "opus" in variant B):

    Agent { model: "<judge model>", prompt:
      "You are a judge. Inspect the artifacts at <paths> (or the diff below).
       Authorship is hidden and irrelevant. Run the checks yourself; do not trust
       any summary. Never fix anything. Return: verdict accept|reject, the single
       biggest remaining gap, evidence as file:line or command output." }

Hand the judge the artifact, never the builder's report. For an N-candidate pick, spawn
N builders in parallel with the same prompt writing to neutral paths (candidate-1,
candidate-2, ...), then one judge ranks them blind. Scouts and grunts: model "sonnet"
or "haiku", `run_in_background` for long recon, collect with TaskOutput.

## Relation to gauntlet-loop

Same principle, different scope: gauntlet-loop supplies the loop and the external bar;
this skill decides which model sits in which seat. When both apply, gauntlet's critic
runs on this skill's judge model.
