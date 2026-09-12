import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import jestPlugin from 'eslint-plugin-jest'
import playwright from 'eslint-plugin-playwright'

export default defineConfig([
  globalIgnores([
    'dist/**',
    'coverage/**',
    'node_modules/**',
    '.output/**',
    'playwright-report/**',
    'test-results/**',
    'src/routeTree.gen.ts',
  ]),

  // Node/config/tooling files
  {
    files: ['**/*.{js,mjs,cjs}'],

    extends: [
      js.configs.recommended,
    ],

    languageOptions: {
      globals: globals.node,
    },

    rules: {
      'no-debugger': 'error',
    },
  },

  // Application TypeScript
  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      'no-debugger': 'error',
      'eqeqeq': ['error', 'always'],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
  },

  {
    files: ['**/*.test.{ts,tsx}'],
    ...jestPlugin.configs['flat/recommended'],
  },

  {
    files: ['**/*.spec.ts'],
    ...playwright.configs['flat/recommended'],
  },
])
