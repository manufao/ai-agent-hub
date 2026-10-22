---
name: project-structure
description: "À utiliser pour organiser ou relire l'arborescence d'un projet (React, Svelte, NestJS ou autre) : un fichier par responsabilité, logique sortie des vues, ressources rangées, barrel files avec mesure, nommage des fichiers."
---

# Structure de projet

Une bonne structure permet de trouver un fichier sans chercher et de modifier une partie sans en ouvrir trois autres. Règles communes à tous les frameworks. Le spécifique est dans `react-conventions`, `svelte-conventions` et `styling-conventions`.

## Quand l'utiliser

- Création d'un projet ou d'un module, ajout dans un fichier déjà long
- Revue, audit ou plan de refactoring qui touche à l'organisation des fichiers

## Règles

**Un fichier, une responsabilité.** Un composant, un service ou un module par fichier, nommé d'après ce qu'il contient. Au-delà d'environ 150 lignes, chercher ce qui s'extrait (repère, pas plafond). Une vue assemble et affiche, sans logique métier ni données en dur.

**Où ranger quoi** (noms à adapter au framework) :

| Contenu | Dossier |
|---|---|
| Composants | `components/`, sous-dossiers par domaine au-delà d'une dizaine |
| Logique avec état | `hooks/` (React), `stores/` (Svelte), `services/` (NestJS) |
| Fonctions pures | `lib/` ou `utils/` |
| Données, constantes, config | `data/`, `constants/`, `config/` |
| Types partagés | `types/` |
| Images, feuilles de style | `assets/img/`, `assets/css/` (ou `styles/`) |
| Fichiers servis tels quels | `public/` ou `static/` |

Dépendances à sens unique : les composants importent `hooks`, `lib`, `data` et `types`, jamais l'inverse.

**Barrel files (`index.ts`).** Seulement à la racine d'un dossier consommé de l'extérieur (`components/`, `utils/`, un module NestJS), pas un par sous-dossier de composant. Exports nommés, jamais `export *`. À l'intérieur du dossier, imports directs (`./Figure`), jamais via `./index` : c'est la source classique des cycles. Ce qui est interne reste hors du barrel. Avec `verbatimModuleSyntax`, les types se réexportent en `export type`.

**Nommage.** Composants en PascalCase. Hooks, stores et utilitaires en camelCase. Constantes en UPPER_SNAKE_CASE. Tests : nom du fichier testé + `.test.ts` ou `.spec.ts`.

## Instructions

1. Lire l'arborescence et les instructions du projet (`CLAUDE.md`, `AGENTS.md`). Une convention déjà établie l'emporte : la signaler sans l'imposer.
2. Repérer les fichiers à plusieurs responsabilités et ceux qui dépassent nettement le repère de taille.
3. Repérer ce qui est mal rangé et les dépendances dans le mauvais sens.
4. Vérifier les barrels : emplacement, `export *`, imports internes via le barrel.
5. Proposer l'arborescence cible et les imports à mettre à jour.

## Format de sortie

```markdown
### Constats
1. `chemin/fichier` : [règle] — [problème] → [correction]

### Arborescence cible
[arbre]
```
