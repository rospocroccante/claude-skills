// A gauntlet loop as a Workflow script. Adapt the three marked sections; the machinery below
// them is what you keep.
//
// Shape: build, critique, one rework if the critique found something material, critique again.
// Bounded on purpose. An unbounded loop is closer to the original method and spends real money,
// so raise the bound deliberately rather than by default.

export const meta = {
  name: 'gauntlet',
  description: 'Build each unit, then judge it against a concrete bar with a fresh critic',
  phases: [{ title: 'Build' }, { title: 'Critique' }],
}

// --- 1. ADAPT: where things are -----------------------------------------------------------

const REPO = '/absolute/path/to/repo'
const BAR = '/absolute/path/to/the/reference' // an image, a golden file, an exemplary source file

// --- 2. ADAPT: the rules every agent gets -------------------------------------------------

const HOUSE = `
- Do NOT run any git command. Do not commit. Leave the working tree dirty.
- Comments argue why a choice was made, they do not narrate what the line does.
- Touch only the files your unit lists. Another builder is in the others.
`

const GATES = `
GREEN GATES. Run them yourself and paste the real output in your report:
  cd ${REPO} && <typecheck> && <lint> && <test> && <build>
Never report done with a red gate. If a test's EXPECTATION is what your change moved, update it
and say which expectations moved and why.
`

// --- the machinery ------------------------------------------------------------------------

const VERDICT = {
  type: 'object',
  additionalProperties: false,
  required: ['gatesGreen', 'materialGap', 'biggestGap', 'evidence', 'whatToChange'],
  properties: {
    gatesGreen: { type: 'boolean', description: 'true only if you ran every gate and all passed' },
    materialGap: { type: 'boolean', description: 'true if the work still loses against the bar in a way that matters' },
    biggestGap: { type: 'string', description: 'one sentence naming the single largest remaining gap' },
    evidence: { type: 'string', description: 'what you inspected and saw, with file:line or command output' },
    whatToChange: { type: 'string', description: 'concrete instruction for the builder, at most six lines' },
  },
}

async function gauntlet(unit) {
  await agent(unit.build, { phase: 'Build', label: `build:${unit.key}` })

  const first = await agent(unit.critic, {
    phase: 'Critique',
    label: `critic:${unit.key}:1`,
    // A different model from the builder, where one is available. Same model, correlated blind
    // spots, and the critique agrees with the thing it would have written itself.
    model: 'fable',
    schema: VERDICT,
  })
  if (!first) return { unit: unit.key, note: 'critic returned nothing' }
  log(`${unit.key}: gatesGreen=${first.gatesGreen} materialGap=${first.materialGap} - ${first.biggestGap}`)
  if (!first.materialGap && first.gatesGreen) return { unit: unit.key, verdicts: [first], rounds: 1 }

  // Only the named gap. "Improve it generally" is how a rework undoes what the last round fixed.
  await agent(
    `${unit.reworkPreamble}

A critic with fresh eyes judged this against the bar and found:

BIGGEST GAP: ${first.biggestGap}

EVIDENCE: ${first.evidence}

WHAT TO CHANGE:
${first.whatToChange}

Fix exactly that, plus any gate it left red. Do not redesign what the critic did not fault.
${GATES}
${HOUSE}`,
    { phase: 'Build', label: `rework:${unit.key}` },
  )

  const second = await agent(unit.critic, {
    phase: 'Critique',
    label: `critic:${unit.key}:2`,
    model: 'fable',
    schema: VERDICT,
  })
  log(`${unit.key} round 2: materialGap=${second?.materialGap} - ${second?.biggestGap}`)
  return { unit: unit.key, verdicts: [first, second], rounds: 2 }
}

// --- 3. ADAPT: the units ------------------------------------------------------------------

const UNIT = {
  key: 'example',
  build: `Build ONE unit. Files you may touch, and no others:
  ${REPO}/path/to/file
  ${REPO}/path/to/its/test

WHAT TO BUILD: <the goal, not the implementation>

THE BAR you are measured against: ${BAR}. Read it before writing a line.
${GATES}
${HOUSE}
Report: what you wrote, the gate output, and anything you could not honour and why.`,

  reworkPreamble: `You are reworking the example unit in ${REPO}. Same files as before.`,

  critic: `You are a harsh, independent critic. You did not write this and you owe its author nothing.

THE WORK: ${REPO}/path/to/file. READ THE FILES. Do not read any summary of them, and accept no
claim you have not checked yourself.

THE BAR: ${BAR}. Open it. Compare, concretely rather than impressionistically, and say which side
wins on each point you check.

Prove the tests are real rather than decorative: delete the behaviour under test, confirm something
goes red, then restore it and confirm the suite is green again. A test that passes with the
behaviour deleted is not a test.

Run every gate yourself and paste the output.

Name the single biggest gap. Being agreeable is failing at this job; inventing a gap is equally a
failure.`,
}

// Units with disjoint file sets run together. Units whose output feeds another are sequenced.
phase('Build')
const results = await parallel([() => gauntlet(UNIT)])

return { results }
