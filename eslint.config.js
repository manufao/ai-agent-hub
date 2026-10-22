import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tsdoc from 'eslint-plugin-tsdoc'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  // Skill references are config templates for other projects, not code of this repo.
  globalIgnores(['dist/**', 'coverage/**', '*.cjs', '*.d.ts', '.agents/skills/**/references/**']),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
    plugins: {
      tsdoc,
    },
    rules: {
      'no-console': 'error',
      'tsdoc/syntax': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },
)
