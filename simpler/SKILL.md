---
name: simpler
description: Use when explaining an abstract or technical concept to someone who is confused, asks to "explain it simpler / more simply / clearly", asks for an analogy or "explain like I'm five", says they keep losing the thread, or when the audience is neurodivergent (ADHD, autistic, dyslexic). Any time a concept must land concretely instead of as a wall of jargon.
---

# simpler — explain anything accessibly

## Overview

A confused learner needs *fewer words, in order, anchored to a concrete image*. They fail by switching metaphors, skipping "obvious" steps, or giving nothing to grip.

Core principle: **one sustained metaphor, atomic ordered steps, a picture, one rule, a self-check.**

## When to Use

- "explain simply", "I don't get it", "ELI5", "give me an analogy", "I keep losing the thread".
- Audience is neurodivergent (ADHD / autistic / dyslexic), or asked to be accessible.
- An abstract concept (pointers, recursion, async, DNS…) a plain definition isn't landing.
- **Not for:** quick facts, lookups, or terse/expert audiences.

## The Method — all 6, in order

1. **One sentence.** No jargon. What it *is*, plainly.
2. **One metaphor — never switch it.** Match the concept's *structure* to a family (table below); map every part onto that one world.
3. **Atomic ordered steps.** One idea each; map each piece to the metaphor. If one "follows obviously", write it anyway.
4. **A before/after picture.** A small ASCII diagram of the state changing — inline, not offered.
5. **THE one rule — then where the metaphor breaks.** Bold single sentence: what to remember + *why*. Then one line where the metaphor stops being true — every metaphor leaks; say where.
6. **A self-check.** 2–3 recall questions confirming it landed.

**Scale to size — slots, not minimums.** A one-line idea ("what a boolean is") gets one short line *each*, ~80 words total, not 300. Don't pad a slot to look thorough. Big concepts keep all 6, drop none.

## Picking the Metaphor

| The concept has… | Metaphor family |
|---|---|
| state that persists | container / backpack |
| ownership | keys |
| sequence / order | assembly line |
| one at a time | single worker |
| nesting / self-similar | nesting dolls |
| waiting / non-blocking | restaurant buzzer |
| indirection ("points to") | label / address |

Match *structure*, not topic. No fit? Pick the closest and name where it breaks.

## Worked Example

A C++ move constructor `Buffer(Buffer&& other)`:

> **One sentence:** it doesn't *copy* the data, it *moves* it — hands ownership to a new object.
>
> **Metaphor (house + keys — *keys* family):** the data = a house; `data_` = the **keys**.
>
> **Steps:** (1) `data_(other.data_)` copies the address — keys, not house. (2) `other.data_ = nullptr` — old owner drops the keys.
>
> ```
> BEFORE:  old ─► [10|20|30]   new: —
> AFTER:   new ─► [10|20|30]   old ─► nullptr
> ```
>
> **THE one rule:** **after taking the keys, empty the old object** — else two owners demolish one house → double free.
> *Where it breaks:* real keys copy freely; here exactly **one** owner may hold them.
>
> **Self-check:** (1) What does move copy? (2) Why empty the old? (3) What does `&&` signal?

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Switching metaphors mid-explanation | One world up front; force every part in. |
| Over-extending the metaphor | Name its boundary — where it stops being true. |
| Offering the diagram, not including it | Paste the picture inline. |
| Padding a tiny concept to look thorough | Slots, not minimums — one-liner ≈ 80 words, all 6. |
| "This step is obvious" | Write it. Implicit jumps lose readers. |

## Quick Reference

`1 sentence → 1 metaphor (match structure, never switch) → atomic steps → before/after picture → 1 rule + why + where it breaks → self-check → scale to size`