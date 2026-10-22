# Installation

## ESLint et Prettier

```bash
pnpm add -D eslint @eslint/js @eslint/compat typescript-eslint globals prettier \
  eslint-plugin-import-x eslint-import-resolver-typescript eslint-plugin-unicorn \
  eslint-plugin-simple-import-sort eslint-plugin-security eslint-plugin-no-secrets \
  dependency-cruiser
# React
pnpm add -D eslint-plugin-react-hooks eslint-plugin-react-refresh
# Svelte
pnpm add -D eslint-plugin-svelte prettier-plugin-svelte
# Tailwind
pnpm add -D eslint-plugin-better-tailwindcss
```

## Scripts

```json
{
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "lint": "eslint . --max-warnings 0",
  "lint:fix": "eslint . --fix",
  "lint:deps": "depcruise src",
  "test:types": "tsc -b",
  "test": "vitest",
  "test:ci": "vitest run --coverage",
  "security:audit": "pnpm audit --prod",
  "security:scan": "gitleaks detect --source . -v",
  "prepare": "husky"
}
```

Svelte : `"test:types": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"`. Déclarer aussi `"packageManager": "pnpm@<version>"`, exigé par `pnpm/action-setup` en CI.

## Hooks Git

```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
pnpm exec husky init
```

Puis remplacer le contenu de `.husky/` par les trois hooks de `git-hooks/`. Gitleaks se lance s'il est installé (`brew install gitleaks`). Le hook l'ignore sinon, et la CI le rattrape.

`package.json` :

```json
{
  "lint-staged": {
    "*.{js,ts,tsx,svelte}": ["prettier --write", "eslint --fix"],
    "*.{css,scss,json,md,yaml,yml,html}": ["prettier --write"]
  },
  "commitlint": { "extends": ["@commitlint/config-conventional"] }
}
```
