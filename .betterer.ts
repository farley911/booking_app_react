import { regexp } from '@betterer/regexp'
import { readFileSync } from 'node:fs'
import { BettererTest } from '@betterer/betterer'
import { bigger } from '@betterer/constraints'

type CoverageMetric =
  | 'branches'
  | 'functions'
  | 'lines'
  | 'statements'

function coverage(metric: CoverageMetric) {
  return new BettererTest({
    test: () => {
      const summary = JSON.parse(
        readFileSync(
          './coverage/coverage-summary.json',
          'utf8',
        ),
      ) as {
        total: Record<CoverageMetric, { pct: number }>
      }

      return summary.total[metric].pct
    },
    constraint: bigger,
    goal: 100,
  })
}

export default {
  'coverage: branches never decreases': () =>
    coverage('branches'),

  'coverage: functions never decreases': () =>
    coverage('functions'),

  'coverage: lines never decreases': () =>
    coverage('lines'),

  'coverage: statements never decreases': () =>
    coverage('statements'),

  'no new TypeScript suppressions': () =>
    regexp(
      /@ts-(?:ignore|nocheck)/g,
      'Do not introduce TypeScript suppressions',
    ).include('src/**/*.{ts,tsx}').exclude('**/routeTree.gen.ts'),

  'no new ESLint suppressions': () =>
    regexp(
      /eslint-disable(?:-next-line|-line)?/g,
      'Do not introduce ESLint suppressions',
    ).include('src/**/*.{ts,tsx,js}').exclude('**/routeTree.gen.ts'),

  'no new Stylelint suppressions': () =>
    regexp(
      /stylelint-disable(?:-next-line|-line)?/g,
      'Do not introduce Stylelint suppressions',
    ).include('src/**/*.{scss,css}'),
}
