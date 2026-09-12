# Base Image

A framework-agnostic starting point that ships engineering standards rather than an application.

It contains no UI framework, no build tool, and no test runner. What it does contain is the
quality bar those tools are expected to meet: TypeScript configuration, ESLint, Stylelint,
the Betterer quality ratchet, and the Cursor rules and stop hook that enforce them.

Clone it, install the framework and test runner you want, and point the existing pnpm scripts at
them. The scripts are the contract; the rules and gates stay the same regardless of what you
plug in underneath.

## Getting started

```bash
pnpm install
```

`.env.example` ships arbitrary placeholder URLs. The port is not a recommendation:

```text
START_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

When you add an application, set both values from that app once they are known. If a
scaffold was used, take them from the completed scaffold. Prompt only for values the app
does not already define. Placeholders are allowed until then. `APP_URL` may match
`START_URL` locally. Copy the file to `.env` if you need local overrides. `pnpm run start`
should serve `START_URL`.

Several quality gates fail on a fresh clone. That is expected and intentional: they stay red
until you wire up the tooling they depend on.

| Gate | State on a fresh clone |
| --- | --- |
| `pnpm run lint` | Passes |
| `pnpm run betterer:ci` | Passes |
| `pnpm run typecheck` | Fails until `src/` contains TypeScript |
| `pnpm run lint:styles` | Fails until `src/` contains stylesheets |
| `pnpm run test` / `pnpm run test:coverage` | Fails until a test runner is wired up |
| `pnpm run build` | Fails until a build tool is wired up |
| `pnpm exec axe "$APP_URL"` | Fails until `pnpm run start` is serving the configured URL |

## The script contract

Unimplemented scripts are stubs that exit non-zero and print what they need. Replace the stub
body with the real command; do not rename the script, because the Cursor stop hook and
`.cursor/rules/10-quality-gates.mdc` both invoke these names.

| Script | Wire it to |
| --- | --- |
| `dev` | Your dev server or framework CLI |
| `build` | Your production build |
| `start` | The server that serves `START_URL` |
| `preview` | A production-like local server, if your stack has one |
| `test` | Your test runner |
| `test:watch` | Your test runner in watch mode |
| `test:coverage` | Your test runner's coverage run |
| `typecheck` | Already implemented via `tsc --noEmit` |
| `lint` | Already implemented via ESLint |
| `lint:styles` | Already implemented via Stylelint |
| `betterer` / `betterer:ci` | Already implemented |

`check` runs the full sequence locally.

## Adding a test runner

Any runner works. Install it, replace the `test`, `test:watch`, and `test:coverage` stubs, and
have the coverage run emit `coverage/coverage-summary.json`.

That summary file is what re-enables the four coverage ratchets in `.betterer.ts`. They are
present but commented out, along with the imports they need. Uncomment them once coverage
output exists, then run `pnpm run betterer` to record the first baseline.

If your runner needs ESLint support, add its plugin to the config yourself. `eslint.config.js`
deliberately ships without runner-specific or framework-specific plugins.

## Adding a framework

A scaffold is optional.

If you use one, finish that process completely before wiring this repository's scripts,
URLs, styles, or compiler options. Inspect what it created and use those answers instead
of prompting for things already decided.

If you do not use a scaffold, or the scaffold left something unspecified, prompt for the
remaining unknowns. Placeholders are allowed until a real value exists.

Then:

1. Set `START_URL` and `APP_URL` from the application's host and port when those are known.
   `APP_URL` may match `START_URL` locally.
2. Point Stylelint, the `lint:styles` glob, and the Betterer style include at the stylesheet
   language actually in use.
3. Point `pnpm run start` at the command that serves `START_URL`.
4. Point the other script-contract names at the stack's commands. Do not rename the scripts.
5. Add whichever compiler options, type packages, and lint plugins the framework requires.
   `tsconfig.app.json` ships with no framework-specific compiler options and no ambient `types`.

`src/` is laid out per `.cursor/rules/14-file-organization.mdc`, except where the chosen
stack requires a different convention:

```text
src/
  assets/
  features/
  routes/
  styles/
  tests/
  types/
```

The directories are empty placeholders held by `.gitkeep` files.

## Accessibility

`.cursor/rules/12-wcag-2_2-AA.mdc` requires automated WCAG 2.2 AA validation against `APP_URL`:

```bash
pnpm exec axe "$APP_URL" --tags wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa --exit
```

The stop hook reads `APP_URL` from the environment, then `.env`, then the placeholders in
`.env.example`. If `APP_URL` is unset, it falls back to `START_URL`. This axe run is the only
automated accessibility coverage until you add more. It expects `pnpm run start` to be serving that
URL.

## Quality gates

`.cursor/rules/hooks/quality-gate.mjs` runs the full gate set whenever an agent tries to finish
a task, and blocks completion while anything is red. `.cursor/rules/10-quality-gates.mdc`
describes the rules in detail, including the prohibition on making a gate pass by weakening it.
