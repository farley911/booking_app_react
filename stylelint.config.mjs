/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],

  ignoreFiles: [
    'node_modules/**',
    'dist/**',
    'coverage/**',
    '.output/**',
  ],

  rules: {
    // Keep selectors maintainable
    'selector-max-id': 0,
    'max-nesting-depth': 3,

    // Avoid specificity escalation
    'declaration-no-important': true,

    // Keep project naming predictable
    'selector-class-pattern': [
      '^[a-z][a-zA-Z0-9-]*$',
      {
        message:
          'Class selectors should use kebab-case or lower camel-style names',
      },
    ],
  },
}
