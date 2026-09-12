import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const MAX_REPAIR_ATTEMPTS = 3
const GATE_TIMEOUT_MS = 600_000

loadEnvironmentFiles()

if (!process.env.APP_URL && process.env.START_URL) {
  process.env.APP_URL = process.env.START_URL
}

// After three failed repair attempts, Cursor gets one final turn
// whose only purpose is to report the failure debrief.
const ALLOW_DEBRIEF_EXIT_AT_LOOP = MAX_REPAIR_ATTEMPTS + 1

let rawInput = ''

for await (const chunk of process.stdin) {
  rawInput += chunk
}

let input

try {
  input = JSON.parse(rawInput)
} catch {
  // Invalid hook input should fail closed via the non-zero exit.
  process.exit(1)
}

// Don't interfere with aborted/error agent sessions.
if (input.status !== 'completed') {
  respond({})
}

// After the final failure we ask the agent for a debrief.
// That debrief itself triggers the stop hook again.
//
// At that point allow the response through without rerunning
// the gates or starting another repair loop.
if (input.loop_count >= ALLOW_DEBRIEF_EXIT_AT_LOOP) {
  respond({})
}

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

const gates = [
  {
    name: 'Typecheck',
    command: pnpm,
    args: ['run', 'typecheck'],
    displayCommand: 'pnpm run typecheck',
  },
  {
    name: 'ESLint',
    command: pnpm,
    args: ['run', 'lint'],
    displayCommand: 'pnpm run lint',
  },
  {
    name: 'Stylelint',
    command: pnpm,
    args: ['run', 'lint:styles'],
    displayCommand: 'pnpm run lint:styles',
  },
  {
    name: 'Tests',
    command: pnpm,
    args: ['run', 'test:coverage'],
    displayCommand: 'pnpm run test:coverage',
  },
  {
    name: 'End-to-end tests',
    command: pnpm,
    args: ['run', 'test:e2e'],
    displayCommand: 'pnpm run test:e2e',
  },
  {
    name: 'Quality Ratchet',
    command: pnpm,
    args: ['run', 'betterer:ci'],
    displayCommand: 'pnpm run betterer:ci',
  },
  {
    name: 'Build',
    command: pnpm,
    args: ['run', 'build'],
    displayCommand: 'pnpm run build',
  },
  {
    name: 'WCAG Tier 1',
    command: pnpm,
    args: process.env.APP_URL
      ? [
          'exec',
          'axe',
          process.env.APP_URL,
          '--tags',
          'wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa',
          '--exit',
        ]
      : null,
    displayCommand:
      'pnpm exec axe "$APP_URL" --tags wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa --exit',
    configurationError: process.env.APP_URL
      ? null
      : 'APP_URL is not configured for the active environment.',
  },
]

const results = gates.map(runGate)

const failures = results.filter((result) => !result.passed)

if (failures.length === 0) {
  respond({})
}

const summary = results
  .map((result) => {
    const status = result.passed ? 'PASS' : 'FAIL'
    return `- ${result.displayCommand} — ${status} (${result.durationMs}ms)`
  })
  .join('\n')

const failureDetails = failures
  .map((failure) => {
    const output = tail(failure.output, 6000)

    return [
      `## ${failure.name} failure`,
      `Command: ${failure.displayCommand}`,
      `Exit code: ${failure.exitCode ?? 'unknown'}`,
      '',
      '```text',
      output || '(no output)',
      '```',
    ].join('\n')
  })
  .join('\n\n')

const repairNumber = input.loop_count + 1

if (repairNumber <= MAX_REPAIR_ATTEMPTS) {
  respond({
    followup_message: [
      `QUALITY GATE FAILURE — repair attempt ${repairNumber}/${MAX_REPAIR_ATTEMPTS}.`,
      '',
      'You attempted to mark the task complete, but the required quality gates are not green.',
      '',
      summary,
      '',
      failureDetails,
      '',
      'Requirements:',
      '1. Investigate the failures above.',
      '2. Fix the underlying problem.',
      '3. Do not weaken, skip, disable, or remove tests, lint rules, type checks, accessibility checks, or build checks merely to obtain a green run.',
      '4. Do not claim the task is complete yet.',
      '5. After making the fixes, attempt completion again. The stop hook will rerun all quality gates.',
    ].join('\n'),
  })
}

// Three repair attempts have already occurred.
// Give the agent one final turn whose sole purpose is explaining
// what remains broken to the user.
respond({
  followup_message: [
    'QUALITY GATE FAILURE — repair limit reached.',
    '',
    `The task has failed its quality gates after ${MAX_REPAIR_ATTEMPTS} repair attempts.`,
    '',
    summary,
    '',
    failureDetails,
    '',
    'Do NOT make additional code changes during this turn.',
    'Do NOT claim that the task is complete.',
    '',
    'Give the user a concise debrief containing:',
    '- which quality gates are still failing,',
    '- the specific errors or symptoms,',
    '- what you attempted to fix,',
    '- your best assessment of the root cause,',
    '- what remains unresolved,',
    '- the next action you recommend.',
    '',
    'Clearly state that the task is not verified complete.',
  ].join('\n'),
})

function runGate(gate) {
  const start = Date.now()

  if (gate.configurationError) {
    return {
      name: gate.name,
      displayCommand: gate.displayCommand,
      passed: false,
      exitCode: null,
      durationMs: Date.now() - start,
      output: gate.configurationError,
    }
  }

  const result = spawnSync(gate.command, gate.args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: {
      ...process.env,
      CI: 'true',
      FORCE_COLOR: '0',
    },
    timeout: GATE_TIMEOUT_MS,
    maxBuffer: 10 * 1024 * 1024,
  })

  const durationMs = Date.now() - start

  const output = [
    result.stdout,
    result.stderr,
    result.error?.message,
    result.signal ? `Process terminated by signal: ${result.signal}` : '',
  ]
    .filter(Boolean)
    .join('\n')
    .trim()

  return {
    name: gate.name,
    displayCommand: gate.displayCommand,
    passed: result.status === 0,
    exitCode: result.status,
    durationMs,
    output,
  }
}

function loadEnvironmentFiles() {
  const lockedKeys = new Set(
    Object.entries(process.env)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key]) => key),
  )

  applyEnvFile(resolve(process.cwd(), '.env.example'), lockedKeys)
  applyEnvFile(resolve(process.cwd(), '.env'), lockedKeys)
}

function applyEnvFile(filePath, lockedKeys) {
  if (!existsSync(filePath)) {
    return
  }

  const text = readFileSync(filePath, 'utf8')

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const assignment = trimmed.startsWith('export ')
      ? trimmed.slice('export '.length).trim()
      : trimmed
    const separatorIndex = assignment.indexOf('=')

    if (separatorIndex <= 0) {
      continue
    }

    const key = assignment.slice(0, separatorIndex).trim()
    let value = assignment.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (lockedKeys.has(key)) {
      continue
    }

    process.env[key] = value
  }
}

function tail(value, maxLength) {
  if (!value) {
    return ''
  }

  if (value.length <= maxLength) {
    return value
  }

  return `[output truncated — showing final ${maxLength} characters]\n${value.slice(
    -maxLength,
  )}`
}

function respond(payload) {
  process.stdout.write(JSON.stringify(payload))
  process.exit(0)
}