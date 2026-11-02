# Installation

## pnpm

```bash
# Installer pnpm s'il manque (corepack est fourni avec Node)
corepack enable pnpm || npm install -g pnpm
# Projet existant sous npm : convertir le lockfile en gardant les versions, puis repartir de zéro
pnpm import && rm -rf package-lock.json node_modules && pnpm install
```

Dans `package.json`, déclarer `"packageManager": "pnpm@<version>"` (voir `pnpm -v`), exigé par `pnpm/action-setup` en CI, et le script `"preinstall": "npx only-allow pnpm"`, qui fait échouer `npm install` et `yarn` dans le projet. Ajouter `package-lock.json` et `yarn.lock` au `.gitignore`.

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

Svelte : `"test:types": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"`.

## Tests

```bash
pnpm add -D vitest @vitest/coverage-v8
```

`vitest.config.ts` :

```ts
coverage: {
  provider: 'v8',
  include: ['src/**/*.ts'],
  exclude: ['src/**/*.{test,spec}.ts', 'src/**/*.d.ts'],
  thresholds: {
    perFile: true,
    statements: 100,
    branches: 100,
    functions: 100,
    lines: 100,
  },
},
```

- `include` est obligatoire : sans lui, Vitest ne mesure que les fichiers importés par un test, et un fichier sans aucun test échappe au seuil.
- `perFile` applique le seuil à chaque fichier : une bonne moyenne ne cache plus un fichier non testé.
- Les composants (`.svelte`, `.tsx`) restent hors de la couverture : les tests e2e vérifient les parcours et les captures visuelles la structure des pages. Toute la logique vit donc dans des fichiers `.ts` (stores, utilitaires, services), comme le demande `project-structure`.
- Exclure en plus le code généré (Paraglide…) et les barrels `index.ts` qui ne font que réexporter.

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
