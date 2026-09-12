import { regexp } from '@betterer/regexp'

// The coverage ratchets below are disabled because this template ships
// without a test runner. Once `npm run test:coverage` is pointed at a
// runner that writes `coverage/coverage-summary.json`, restore the
// imports and the four entries in the exported object.
//
// import { readFileSync } from 'node:fs'
// import { BettererTest } from '@betterer/betterer'
// import { bigger } from '@betterer/constraints'
//
// type CoverageMetric =
//   | 'branches'
//   | 'functions'
//   | 'lines'
//   | 'statements'
//
// function coverage(metric: CoverageMetric) {
//   return new BettererTest({
//     test: () => {
//       const summary = JSON.parse(
//         readFileSync(
//           './coverage/coverage-summary.json',
//           'utf8',
//         ),
//       )
//
//       return summary.total[metric].pct
//     },
//     constraint: bigger,
//   })
// }

export default {
  // 'coverage: branches never decreases': () =>
  //   coverage('branches'),
  //
  // 'coverage: functions never decreases': () =>
  //   coverage('functions'),
  //
  // 'coverage: lines never decreases': () =>
  //   coverage('lines'),
  //
  // 'coverage: statements never decreases': () =>
  //   coverage('statements'),

  'no new TypeScript suppressions': () =>
    regexp(
      /@ts-(?:ignore|nocheck)/g,
      'Do not introduce TypeScript suppressions',
    ).include('src/**/*.ts'),

  'no new ESLint suppressions': () =>
    regexp(
      /eslint-disable(?:-next-line|-line)?/g,
      'Do not introduce ESLint suppressions',
    ).include('src/**/*.{ts,js}'),

  'no new Stylelint suppressions': () =>
    regexp(
      /stylelint-disable(?:-next-line|-line)?/g,
      'Do not introduce Stylelint suppressions',
    ).include('src/**/*.css'),
}
