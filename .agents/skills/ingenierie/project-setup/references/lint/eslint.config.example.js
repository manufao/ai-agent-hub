import { fileURLToPath } from 'node:url'

import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import { importX } from 'eslint-plugin-import-x'
import noSecrets from 'eslint-plugin-no-secrets'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import security from 'eslint-plugin-security'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import ts from 'typescript-eslint'

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url))

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  security.configs.recommended,
  {
    plugins: {
      'no-secrets': noSecrets,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Node.js built-in modules
            ['^node:'],
            // Packages (things that start with a letter, digit, or @)
            ['^@?\\w'],
            // Parent imports (../)
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Other relative imports (same folder ./)
            ['^\\./'],
            // Style imports
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      // typescript-eslint recommends not using no-undef on TypeScript projects
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      curly: ['error', 'all'],

      // Security Rules (SAST)
      'security/detect-unsafe-regex': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-child-process': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-buffer-noassert': 'error',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',
      'security/detect-object-injection': 'off',
      'no-secrets/no-secrets': ['error', { tolerance: 4.5 }],
    },
  },
  {
    // Project structure and React rules
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      importX.flatConfigs.typescript,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      betterTailwindcss.configs['correctness-error'],
    ],
    plugins: { unicorn },
    settings: {
      'better-tailwindcss': { entryPoint: 'src/assets/css/index.css' },
      'import-x/resolver-next': [createTypeScriptImportResolver({ project: './tsconfig.app.json' })],
    },
    rules: {
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='style']",
          message: 'No inline styles: use Tailwind classes.',
        },
      ],
      'better-tailwindcss/no-concatenated-classes': 'error',
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: ['./src/hooks', './src/lib', './src/data'],
              from: './src/components',
              message: 'Logic and data must not depend on components.',
            },
            {
              target: ['./src/lib', './src/data'],
              from: './src/hooks',
              message: 'lib and data must not depend on hooks.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/**/*.tsx'],
    rules: {
      'unicorn/filename-case': ['error', { case: 'pascalCase', checkDirectories: false }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^\\.(/index)?$',
              message: 'Import sibling components directly, not through the barrel.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/hooks/**/*.ts', 'src/lib/**/*.ts', 'src/data/**/*.ts'],
    rules: {
      'unicorn/filename-case': ['error', { case: 'camelCase', checkDirectories: false }],
    },
  },
)
