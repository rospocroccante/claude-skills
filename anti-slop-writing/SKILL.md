---
name: anti-slop-writing
description: Write prose that does not read as machine-generated, in English and Italian. Use this skill EVERY time you generate or edit text meant to be read as writing, including documents, reports, emails, posts, articles, presentations, UX copy, translations, rewrites, and chat answers the user will paste elsewhere. Trigger it also whenever the user mentions AI slop, robotic or artificial tone, em dashes, "sembra scritto da un'AI", "troppo AI", or asks for natural, human, or clean writing. If you are about to produce more than one paragraph of prose for any deliverable, consult this skill first.
---

# Anti-slop writing

Readers now recognize machine-generated prose from a handful of recurring tells: the em dash aside, the "not X, but Y" pivot, the motivational one-liner, the trailing "-ing" clause that claims a result. Once a reader spots one tell, the whole text loses credibility, whatever its content. The goal of this skill is text that reads like a competent person wrote it on purpose: concrete, direct, unadorned.

## Scope

Apply these rules to every piece of prose you produce or edit: documents, emails, posts, slide text, README prose, code comments, translations, rewrites. Direct quotations from sources are exempt. Code identifiers and technical strings are exempt. The rules apply in every language; the vocabulary lists below cover English and Italian, so extend the same logic by analogy when writing in other languages.

## Hard bans

These never appear in generated prose. No exceptions unless the user explicitly asks.

**Characters**
- Em dash and en dash as punctuation. Replace with a comma, a colon, parentheses, or two sentences. The hyphen inside compound words is fine.
- Middle dot as a separator. Use commas or "and".
- Arrows, sparkles, decorative symbols. Emoji only if the user uses them first or asks.

**Rhetorical templates**
- Antithesis pivots: "not X, but Y", "it's not about X, it's about Y", "less X, more Y", "X, not Y" as a dramatic close. Italian: "non è X, è Y", "non solo X, ma anche Y", "più X che Y" used as a flourish.
- Punchlines and mottos: one-line thesis statements, pull quotes, "Bottom line:", "The result:", "In one line:", "La verità è che". A short dramatic sentence closing a paragraph ("And that changes everything.") counts.
- Stock endings: "In conclusion", "Ultimately", "At the end of the day", "In conclusione", "In sintesi", and any recap paragraph that restates what the text just said. End on the last piece of content instead.
- Triumphant tricolons as closers ("faster, cheaper, and smarter").
- Participial result tails: a comma followed by "ensuring", "allowing", "enabling", "empowering", "helping", or in Italian "garantendo", "permettendo", "consentendo", "assicurando". State the outcome as its own sentence or cut it.

**Stock vocabulary**
English: delve, leverage (as a verb), seamless, seamlessly, robust (outside statistics), cutting-edge, game-changer, unlock (figurative), empower, elevate, supercharge, revolutionize, landscape (figurative), navigate (figurative), journey (figurative), tapestry, testament to, foster, harness, realm, pivotal, plays a crucial role, in today's fast-paced world, it's important to note, it's worth noting, when it comes to, a wide range of, dive into, deep dive.

Italian: anche se used as a reflexive connective (restructure with "ma", "però", or split the sentence), è importante notare, va sottolineato, in un mondo sempre più, senza soluzione di continuità, all'avanguardia, rivoluzionario, punto di svolta, un ventaglio di, sfruttare in senso figurato, navigare in senso figurato, panorama in senso figurato, viaggio in senso figurato, plasmare, cruciale, a 360 gradi, insomma as filler, inoltre chained with in aggiunta.

If one of these is genuinely the precise technical term in context (for example "robust statistics" or "sfruttamento di una vulnerabilità"), it may stay. The ban targets reflex usage, which is nearly all usage.

## Structural rules

Prose first. Use bullets only when the user asks for them or the content is a true enumeration such as a spec list or checklist. Never build lists of bold mini-title, colon, sentence. Do not add headers to texts under roughly 600 words, and never add Introduction or Conclusion scaffolding to short pieces. Bold serves headings and labels, never mid-sentence emphasis. Skip meta-commentary such as "Let's dive in", "Great question", "Here's the thing". Emphasis comes from specificity, meaning numbers, names, and examples, never from typography or superlatives. Vary sentence length naturally, and avoid the formulaic long, long, SHORT punch rhythm.

## How to replace what you removed

For an aside inside a sentence, use commas or parentheses, or split into two sentences. For emphasis, supply a concrete detail: "cuts deploy time from 20 minutes to 4" says more than "dramatically faster". For transitions, often none is needed, because consecutive sentences on the same topic connect themselves. For endings, stop at the last piece of content without summarizing, moralizing, or inviting the reader to act.

## Workflow

1. Before drafting anything longer than one paragraph, read `references/patterns.md` for the full catalog with before and after examples.
2. Draft following the rules above.
3. Self-scan the draft against the hard bans.
4. If the output is a file, extract plain text and run the checker:

```bash
pandoc -t plain out.docx -o /tmp/check.txt     # docx; use pdftotext for pdf, cat for md and txt
python3 scripts/slop_check.py /tmp/check.txt
```

5. Fix every HARD hit. Judge each REVIEW hit in context and rewrite it unless it is genuinely the best phrasing.
6. Re-run until HARD hits reach zero, then deliver.

## Calibration

Removing slop must not remove meaning, precision, or the user's voice. A clean text is still allowed personality, opinion, and humor. The opposite failure mode is beige mush, meaning short flat sentences that carry no information. Specificity cures both: when in doubt, add a fact, not an adjective.
