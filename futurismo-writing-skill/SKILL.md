---
name: futurismo-writing-skill
description: Use when the user asks for meeting talking points, dev-meeting bullets, standup notes, or any brief they will read aloud (Italian or English), and when they push back that a draft sounds robotic, like an NPC, or like a changelog.
---

# Futurismo writing

## Overview

Talking points are lines a person says to colleagues, not a changelog read into the record. Each bullet is a fact from the notes plus the reason it is on the agenda today, in the words the speaker would use. The name nods to the Futurist manifesto: nouns and verbs, no ornament.

**REQUIRED SUB-SKILL:** anti-slop-writing governs word choice. This skill governs shape.

## When to use

- "punti per il meeting", "dammi i bullet", "cosa dico alla riunione", "standup", "brief for the call"
- The user pushes back: "sii piu umano", "roba da NPC", "sembra un changelog", "too robotic"

Not for written status reports, release notes, or docs. Those keep identifiers and dates.

## The output

1. **Index first.** At most 5 topics. Merge until it fits. Each title is how the speaker would name the topic ("Cosa abbiamo chiuso", "Buchi che sappiamo di avere").
2. **At most 5 bullets per topic.** One sentence of 25 words or fewer. A second sentence, same cap, only when it is the ask or the catch.
3. **A bullet has two slots and nothing else.** The fact, taken from the notes. The handle, which is why it is on the agenda today: closed, blocked on someone, decision for someone, nobody owns it.
4. **Every claim traces to a line in the notes.** Consequences, lessons and predictions the notes do not contain are the speaker's to add live, not the draft's.
5. **Decisions are questions, addressed to whoever decides.** "Il record porta il batch id della banca o l'abbinamento resta al cliente?"
6. **Blockers name who we wait on and what runs meanwhile.**
7. **Gaps name the owner, or say that nobody owns it.**
8. **An honesty line wherever the notes carry one:** what is real and what is mocked, what is ours and what is theirs.
9. **Handles.** A ticket id stays only when the team calls the thing by that id. Commit hashes, ports, routes, paths and dates go. A number stays when the number is the point (p95 from 820 ms to 140 ms).
10. **Language follows the user's message.** Italian request, Italian bullets.

## Before and after

Before (changelog):

> LF-41: il matcher del ledger fa una passata sola invece di tre. p95 da 820 ms a 140 ms sulla fixture da 50k righe, commit 9f1c2ab.
> Immagine container per il matcher, compose sulla :5050, healthcheck GET /health. Il runtime e tsx, nel workspace non esiste uno step di build.

After (spoken):

> Il matcher fa una passata sola invece di tre: p95 da 820 a 140 ms sulla fixture grossa.
> Il matcher gira in container con il suo healthcheck. Nota: non c'e uno step di build, gira direttamente con tsx.

## Self-check before delivering

- Read each bullet aloud. If you would not say it that way to a colleague, rewrite it.
- Count the words. Over 25 in a sentence? Cut to the fact and the handle.
- The bullet says something the notes do not? Remove that part.
- Bullet opens with a ticket id, or carries a hash, port, route, path or date? Cut it unless it is the point.
- More than 5 topics, or more than 5 bullets in a topic? Merge.

## Common mistakes

- Inventory bullets: "Consegnato: pagine di architettura, formato test plan, test plan per modulo, piano e2e con 9 scenari." Say what it is and where it stands: "Il pacchetto di fase 1 e consegnato e gia riscritto una volta dopo il suo feedback."
- A moral or a lesson tacked on ("la lezione la terrei", "il segnale e che"). The notes decide whether a bullet has a second half.
- A date on every bullet. One date at most, when the timing is the point.
- The same shape for every bullet (noun, colon, list). Vary: statement, question, "aspettiamo X".
