---
name: persuasion-scenario-writer
description: "write or rewrite persuasive communication for five repeatable scenarios: facebook posts, meeting speeches, one-to-one decision persuasion, investor pitches, and negotiation or conflict messages. use when a user gives a goal, audience, message, constraints, or a rough draft and needs strong structure, clearer persuasion, sharper hooks, cleaner rhythm, or a more decision-driving version. apply rhetorical dna from public-figure archetypes as abstract techniques only, not as direct imitation, impersonation, or signature phrasing."
---

# Persuasion Scenario Writer

Use this skill to turn a user's idea, messy notes, or rough draft into persuasive writing matched to one of five scenarios.

## Inputs to extract before writing

Identify these fields from the user's request. Infer missing items when the intent is obvious.

- `scenario`: one of `facebook-post`, `speech-meeting`, `persuade-decision`, `pitch-investor-idea`, `negotiation-conflict`
- `goal`: what the writing must cause the audience to think, feel, or do
- `audience`: who will read or hear it
- `key message`: the central claim in one sentence
- `constraints`: tone, length, taboo phrases, call to action, language, risk limits, cultural context, formality
- `evidence`: proof points, examples, numbers, timeline, stakes
- `draft` (optional): existing text to keep, tighten, or transform

When important information is missing, make a reasonable assumption and keep moving. State the assumption briefly if it materially affects the output.

## Decide the writing mode

1. **Blank-page drafting** → build structure first, then write.
2. **Rewrite** → preserve the user's core meaning, then upgrade clarity, persuasion, and rhythm.
3. **Tighten** → keep content mostly intact, but remove drag, vagueness, and repetition.
4. **Multi-option generation** → provide 2 to 3 variants only when choice is strategically useful.

## Match the scenario to rhetorical dna

Load the detailed mapping and checks from:

- `references/dna-map.md`
- `references/output-templates.md`

Apply the scenario's rhetorical dna as abstract techniques only.

Never:
- claim to write *as* the public figure
- mimic signature catchphrases, famous lines, or recognizable verbal tics
- present the output as endorsed by or affiliated with the public figure

Translate each source figure into reusable writing behavior such as hook style, sentence simplicity, story arc, contrast framing, repetition, reveal structure, audience psychology, or face-saving negotiation moves.

## Core writing workflow

### 1. Build the persuasion spine

Before drafting, define internally:

- current audience state
- desired audience state
- main obstacle or resistance
- one reason to care now
- one action to take next

Then compress the argument into this sequence:

**context -> tension -> insight -> proof -> move**

Use that sequence even for short pieces.

### 2. Choose the right opening move

Use the opening that fits the scenario:

- **facebook-post**: pattern interrupt, bold observation, unexpected contrast, or a direct pain statement
- **speech-meeting**: story moment, vivid scene, or a single human truth that opens the arc
- **persuade-decision**: start from the other person's want, pressure, or goal
- **pitch-investor-idea**: frame the old world, expose the gap, then signal the new possibility
- **negotiation-conflict**: open with respect, shared aim, or a calm reframing of the issue

Avoid slow warm-up paragraphs.

### 3. Draft for decision energy

Default rules:

- Prefer concrete nouns and verbs over abstract jargon
- Keep the main point legible on first read
- Cut filler transitions and throat-clearing
- Use contrast deliberately: before/after, cost/opportunity, noise/signal, risk/reward
- Let rhythm vary: short lines for impact, longer lines only when they add momentum or meaning
- End with a clear next step, decision, ask, or reframing

### 4. Calibrate for the audience

Tune the same message differently depending on who is listening:

- **executive / manager**: speed, consequence, trade-off, decision clarity
- **team / staff**: meaning, direction, reassurance, shared effort
- **customer / public**: empathy, clarity, immediate value
- **investor / sponsor**: market tension, asymmetry, traction, upside, capability
- **counterparty in conflict**: dignity, boundaries, options, mutual face-saving

### 5. Run the scenario self-check

After drafting, verify the output against the scenario rubric in `references/output-templates.md`.

If the draft fails the scenario's core test, rewrite instead of appending explanation.

## Output rules

Follow these defaults unless the user asks for a different format.

### Default delivery format

Use this compact structure:

```markdown
## Recommended draft
[final writing]

## Why this works
- [2 to 4 bullets tied to persuasion mechanics]

## Optional alternates
- [only when strategically useful]
```

### Rewrite requests

When the user gives an existing draft, preserve:
- the factual meaning
- commitments or numbers that should not change
- cultural or political sensitivities explicitly stated by the user

Improve:
- hook strength
- structure
- readability
- decision pressure
- memorability

### Multi-language handling

Write in the user's language. Keep embedded English business terms only when natural for that audience.

### Length control

Respect explicit word or time limits. If none are given:
- facebook post: short to medium
- speech: 2 to 4 spoken minutes unless context suggests otherwise
- persuade decision: concise memo or speaking script
- investor pitch: sharp and expandable
- negotiation: brief, calm, and quotable

## Failure modes to avoid

Do not produce:
- generic inspiration with no decision payload
- bloated openings that delay the point
- empty confidence without proof or stakes
- manipulative pressure that breaks trust
- aggression that corners the other side unnecessarily
- imitation-heavy prose that sounds like a celebrity parody

## Scenario quick reference

- `facebook-post` -> high energy + immediate clarity
- `speech-meeting` -> emotional arc + spoken rhythm
- `persuade-decision` -> audience psychology + obvious contrast
- `pitch-investor-idea` -> world-change framing + structured reveal
- `negotiation-conflict` -> firmness + dignity-preserving language

Read the references directly when you need the detailed dna map, output shapes, or scenario-specific checklist.
