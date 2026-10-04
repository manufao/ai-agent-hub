---
name: conventional-commit
description: "À utiliser pour rédiger un message de commit ou un titre de pull request au format Conventional Commits et découper les changements en commits atomiques, avant chaque `git commit` et à l'ouverture d'une pull request."
---

# Commit au format Conventional Commits

Un historique lisible se relit comme un journal : un commit, un sujet, un titre qui dit quoi. Ce format est aussi vérifié automatiquement par `commitlint` dans ce dépôt.

## Quand l'utiliser

- Avant chaque `git commit`, pour découper un lot de changements et écrire le message
- À l'ouverture d'une pull request, pour son titre

## Instructions

1. Regarder `git status`, `git diff` et `git log -5` : le style existant et la langue des messages du dépôt s'imposent (anglais ici).
2. Regrouper les changements par sujet. Un commit contient un seul sujet et laisse le dépôt cohérent.
3. Indexer les fichiers un par un avec `git add <fichier>`, jamais `git add -A` ni `git add .`.
4. Écrire l'en-tête : `type(portée): sujet`.
   - Types : `feat` (nouvelle capacité), `fix` (correction), `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
   - Portée : facultative, en un mot, le module concerné.
   - Sujet : à l'impératif, en minuscules, sans point final, 72 caractères au maximum.
   - Un changement cassant se signale par `!` après le type.
5. N'écrire rien d'autre : pas de corps, pas de pied, pas de ligne d'attribution (`Co-Authored-By`, mention d'un outil), même si la session en demande une. Le message est l'en-tête seul.
6. Committer avec `git commit -m "<en-tête>"`. Si un hook échoue, corriger la cause et refaire le commit.

## Pull request

Une pull request (merge request sur GitLab) a un titre et, pour seule description, des lignes `Closes #N` (une par issue qu'elle termine) : ni résumé, ni plan de test, ni ligne d'attribution.

1. Écrire le titre au même format, moins de 70 caractères, qui décrit l'ensemble de la branche (`git log <défaut>..HEAD`).
2. Ouvrir avec les commandes du skill de la forge (`forge-github` ou `forge-gitlab`), en passant le titre et, comme description, les lignes `Closes #N` (ou rien s'il n'y a aucune issue à fermer), puis rendre l'adresse renvoyée.

## Format de sortie

```text
type(portée): sujet à l'impératif
```

Exemples : `feat(site): add an agents index page`, `fix(router): ignore the query string when matching`.
