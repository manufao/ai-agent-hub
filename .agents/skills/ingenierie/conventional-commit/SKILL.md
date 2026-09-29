---
name: conventional-commit
description: "À utiliser pour rédiger un message de commit au format Conventional Commits et découper les changements en commits atomiques, avant chaque `git commit`."
---

# Commit au format Conventional Commits

Un historique lisible se relit comme un journal : un commit, un sujet, un message qui dit pourquoi. Ce format est aussi vérifié automatiquement par `commitlint` dans ce dépôt.

## Quand l'utiliser

- Avant chaque `git commit`
- Pour découper un gros lot de changements en plusieurs commits

## Instructions

1. Regarder `git status`, `git diff` et `git log -5` : le style existant et la langue des messages du dépôt s'imposent (anglais ici).
2. Regrouper les changements par sujet. Un commit contient un seul sujet et laisse le dépôt cohérent.
3. Indexer les fichiers un par un avec `git add <fichier>`. Ne jamais utiliser `git add -A` ni `git add .`, qui peuvent embarquer un fichier sensible.
4. Écrire l'en-tête : `type(portée): sujet`.
   - Types : `feat` (nouvelle capacité), `fix` (correction), `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
   - Portée : facultative, en un mot, le module concerné.
   - Sujet : à l'impératif, en minuscules, sans point final, 72 caractères au maximum.
5. Ajouter un corps si le pourquoi n'est pas évident : ligne vide, puis le motif et le contexte, pas la liste des fichiers.
6. Signaler un changement cassant par `!` après le type ou un pied `BREAKING CHANGE: <effet et marche à suivre>`.
7. Ajouter en dernier pied de message la ligne d'attribution que la session ou le projet demande, s'il y en a une.
8. Committer avec un message passé par un heredoc pour conserver le formatage. Ne jamais contourner les hooks avec `--no-verify`. Si un hook échoue, corriger la cause et créer un nouveau commit ; ne jamais modifier un commit déjà créé ou poussé.

## Format de sortie

```text
type(portée): sujet à l'impératif

Corps facultatif : pourquoi ce changement, en phrases courtes.

BREAKING CHANGE: facultatif
[Ligne d'attribution, si demandée]
```

Exemples : `feat(site): add an agents index page`, `fix(router): ignore the query string when matching`.
