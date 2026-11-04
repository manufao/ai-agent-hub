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
2. Découper les changements en appliquant les règles de découpage ci-dessous, dans leur ordre de priorité.
3. Relever dans le diff ce qui n'a rien à faire dans un commit : code de debug, code commenté, secret, `@ts-ignore` sans explication. Le signaler, ne pas le committer.
4. Indexer les fichiers un par un avec `git add <fichier>`, jamais `git add -A` ni `git add .`.
5. Écrire l'en-tête : `type(portée): sujet`.
   - Types : `feat` (nouvelle capacité), `fix` (correction), `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. `fix` corrige un comportement incorrect du code existant, même antérieur à la branche ; `feat` ajoute une capacité qui n'existait pas.
   - Portée : facultative, en un seul mot, le module concerné, jamais une liste (`api,web`).
   - Sujet : à l'impératif, en minuscules, sans point final, 72 caractères au maximum.
   - Le sujet se suffit sans la portée : deux commits qui ne diffèrent que par leur portée nomment le module dans le sujet (`use the shared login form in admin`, `use the shared login form in shop`).
   - Un changement cassant se signale par `!` après le type.
6. N'écrire rien d'autre : pas de corps, pas de pied, pas de ligne d'attribution (`Co-Authored-By`, mention d'un outil), même si la session en demande une. Le message est l'en-tête seul.
7. Committer avec `git commit -m "<en-tête>"`. Si un hook échoue, corriger la cause et refaire le commit.

## Règles de découpage

Les règles complètes sont dans `references/splitting-rules.md`, à lire avant de découper. Elles forment cinq blocs classés par priorité : en cas de conflit, la règle du bloc le plus haut l'emporte.

1. **Cohérence** : chaque commit laisse le dépôt cohérent, sans dépendre d'un commit suivant.
2. **Un sujet** : un changement qu'une phrase décrit sans « et ».
3. **Une nature** : un seul genre de changement par commit (refactoring, suppression, style, validation, infrastructure d'erreur).
4. **Taille et série** : au-delà d'environ 10 fichiers de code, une série `i/n`.
5. **Ordre** : chaque commit ne dépend que des précédents.

## Corrections pendant la relecture

Une branche dont la pull request est ouverte ne reçoit pas de nouveau commit de correction ni d'`--amend` : le relecteur ne verrait plus le delta et perdrait l'ancrage de ses commentaires.

1. Committer chaque correction avec `git commit --fixup=<empreinte>`, l'empreinte étant le commit qui a introduit le code corrigé, un fixup par commit visé. Le fixup vise le commit dont le changement rend la correction nécessaire, pas celui qui touche le même dossier : un snapshot qui change à cause d'un bouton va avec le commit du bouton.
2. Pousser normalement : les `fixup!` restent visibles pendant la relecture.
3. Juste avant la fusion, et seulement sur demande : `git rebase --autosquash <défaut>` (avec `GIT_SEQUENCE_EDITOR=:` pour ne pas ouvrir d'éditeur), vérifier que le contenu final est inchangé, puis `git push --force-with-lease`.

## Pull request

Une pull request (merge request sur GitLab) a un titre et, pour seule description, des lignes `Closes #N` (une par issue qu'elle termine) : ni résumé, ni plan de test, ni ligne d'attribution.

1. Écrire le titre au même format, moins de 70 caractères, qui décrit l'ensemble de la branche (`git log <défaut>..HEAD`).
2. Ouvrir avec les commandes du skill de la forge (`forge-github` ou `forge-gitlab`), en passant le titre et, comme description, les lignes `Closes #N` (ou rien s'il n'y a aucune issue à fermer), puis rendre l'adresse renvoyée.

## Format de sortie

```text
type(portée): sujet à l'impératif
```

Exemples : `feat(site): add an agents index page`, `fix(router): ignore the query string when matching`.
