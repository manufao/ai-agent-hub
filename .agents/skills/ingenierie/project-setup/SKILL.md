---
name: project-setup
description: "À utiliser au démarrage d'un nouveau projet front ou Node (React, Svelte, NestJS…), ou pour remettre un projet existant aux standards : pnpm, structure, ESLint, Prettier, hooks Git, CI GitHub (qualité et sécurité)."
---

# Démarrage de projet

Un projet démarre avec ses garde-fous en place, pas après le premier incident. Ce skill installe le socle commun. Les fichiers prêts à copier sont dans `references/`.

## Quand l'utiliser

- Création d'un projet, ou projet existant sans lint, sans formatage ou sans CI
- Après une mise à jour majeure de l'outillage, pour réaligner un projet

## Instructions

1. **Gestionnaire et dépendances.** pnpm uniquement, `package-lock.json` supprimé. Dernières versions majeures, puis `pnpm audit` et `pnpm outdated` à zéro. Une dépendance bloquée sur une version plus ancienne est justifiée dans le README, avec le ticket à suivre.
2. **Structure.** Appliquer `project-structure`, `styling-conventions` et `react-conventions` ou `svelte-conventions`.
3. **Installation.** Paquets, scripts et hooks Git : `references/install.md`.
4. **Prettier.** Copier `references/lint/prettierrc.json` vers `.prettierrc` et `references/lint/prettierignore` vers `.prettierignore`. Ajouter le plugin du framework si besoin (`prettier-plugin-svelte`).
5. **ESLint.** Partir de `references/lint/eslint.config.example.js`. Socle commun : recommandés JS et TypeScript, tri des imports, `curly`, variables inutilisées préfixées `_`, règles de sécurité et détection de secrets. Règles de structure : sens des dépendances, nommage des fichiers, 150 lignes maximum, pas de style inline, classes Tailwind valides et non construites dynamiquement. Garder le bloc du framework concerné.
6. **dependency-cruiser.** Copier `references/lint/dependency-cruiser.example.cjs` vers `.dependency-cruiser.cjs` : cycles, fichiers orphelins, paquets non déclarés, dépendances de dev en production. Il remplace `import-x/no-cycle`, lent. À poser dès le départ, même sur un petit projet : il coûte quelques secondes et évite la dette.
7. **Scripts.** Garder les noms exacts de `references/install.md` : la CI les appelle.
8. **Hooks Git.** Copier `references/git-hooks/` dans `.husky/` : `pre-commit` (Gitleaks sur les fichiers indexés, puis lint-staged), `commit-msg` (commitlint), `pre-push` (types, lint, `lint:deps`, et les tests s'il y en a).
9. **CI GitHub.** Copier `references/ci/ci.yml` et `references/ci/security-scan.yml` dans `.github/workflows/`. Adapter la commande qui démarre l'application pour le scan ZAP. Sans tests, retirer l'étape `test:ci` et le signaler au lieu de la laisser échouer.
10. **Vérifier** en local : `pnpm format:check`, `pnpm lint`, `pnpm lint:deps`, `pnpm test:types`, `pnpm build`, `pnpm audit`, puis tester qu'un message de commit invalide et un secret indexé sont bien bloqués. Puis pousser une branche et vérifier que les deux workflows passent sur la pull request.

## Pièges connus

- typescript-eslint et dependency-cruiser n'acceptent pas encore TypeScript 7 : rester en TypeScript 6 tant que `npm view @typescript-eslint/parser peerDependencies.typescript` ne l'accepte pas.
- `eslint-plugin-boundaries` et `eslint-plugin-check-file` tirent `braces`, vulnérable sans correctif : préférer `import-x/no-restricted-paths` et `unicorn/filename-case`.
- `import-x` en flat config demande `import-x/resolver-next`, sinon `no-restricted-paths` ne voit aucun import.
- pnpm bloque les scripts d'installation inconnus : les autoriser ou les refuser explicitement avec `allowBuilds` dans `pnpm-workspace.yaml`, après avoir vérifié leur utilité.

## Format de sortie

```markdown
### Mis en place
- [élément] : [fichier créé ou modifié]

### Vérifications
- format:check / lint / test:types / build / audit : [résultat de chaque commande]
- CI : [lien de la pull request, état des deux workflows]

### Écarts
- [ce qui n'a pas pu être appliqué et pourquoi]
```
