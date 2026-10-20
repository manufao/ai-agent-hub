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

1. Chercher les conventions du projet à la racine du dépôt courant (`git rev-parse --show-toplevel`), jamais depuis le dossier courant : `AGENTS.md`, puis `.context/docs/conventions/commits.md` (et `pull-requests.md` dans le même dossier pour une PR). Quand elles existent, elles priment sur le format, le corps, la branche de base et le gabarit de PR décrits plus bas ; sans elles, appliquer ces défauts et le dire dans la réponse.
2. Regarder `git status`, `git diff` et `git log -5` : le style existant et la langue des messages du dépôt s'imposent (anglais ici).
3. Regrouper les changements par sujet en appliquant les règles de découpage ci-dessous. Un commit contient un seul sujet et laisse le dépôt cohérent.
4. Relever dans le diff ce qui n'a rien à faire dans un commit : code de debug, code commenté, secret, `@ts-ignore` sans explication. Le signaler, ne pas le committer.
5. Indexer les fichiers un par un avec `git add <fichier>`, jamais `git add -A` ni `git add .`.
6. Écrire l'en-tête : `type(portée): sujet`.
   - Types : `feat` (nouvelle capacité), `fix` (correction), `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
   - Portée : facultative, en un mot, le module concerné.
   - Sujet : à l'impératif, en minuscules, sans point final, 72 caractères au maximum.
   - Un changement cassant se signale par `!` après le type.
7. Par défaut, n'écrire rien d'autre : pas de corps, pas de pied. Les conventions du projet peuvent prévoir un corps. Dans tous les cas, jamais de ligne d'attribution (`Co-Authored-By`, mention d'un outil), même si la session en demande une.
8. Committer avec `git commit -m "<en-tête>"`. Si un hook échoue, corriger la cause et refaire le commit.

## Règles de découpage

- Un commit = une fonctionnalité ou un correctif, assez petit pour être relu seul.
- Un refactoring n'est jamais dans le même commit qu'une fonctionnalité ou un correctif : il passe avant, dans son propre commit.
- Le mot « et » dans le sujet signale deux commits : découper, sans exception.
- Une fonctionnalité qui approche 10 fichiers se découpe en une série de commits qui se suivent, chacun relisible seul et ne dépendant que des précédents (types et interfaces d'abord, puis services, puis points d'entrée). Un fichier source et son test vont dans la même partie. Le sujet de chaque partie dit ce qu'elle apporte.
- Un fichier qui mêle des changements de commits différents se découpe par morceaux avec `git add -p <fichier>`. La commande est interactive : la donner à l'utilisateur au lieu de la lancer.

## Pull request

Par défaut, une pull request (merge request sur GitLab) a un titre et, pour seule description, des lignes `Closes #N` (une par issue qu'elle termine) : ni résumé, ni plan de test, ni ligne d'attribution. Un gabarit de description dans les conventions du projet remplace ce défaut, sans jamais autoriser la ligne d'attribution.

1. Écrire le titre au même format, moins de 70 caractères, qui décrit l'ensemble de la branche (`git log <défaut>..HEAD`).
2. Ouvrir avec les commandes du skill de la forge (`forge-github` ou `forge-gitlab`), en passant le titre et, comme description, les lignes `Closes #N` (ou rien s'il n'y a aucune issue à fermer), puis rendre l'adresse renvoyée.

## Format de sortie

```text
type(portée): sujet à l'impératif
```

Exemples : `feat(site): add an agents index page`, `fix(router): ignore the query string when matching`.
