---
name: project-structure
description: "À utiliser pour organiser ou relire l'arborescence d'un projet (React, Svelte, NestJS ou autre) : un fichier par responsabilité, logique sortie des vues, ressources rangées, barrel files avec mesure, nommage des fichiers."
---

# Structure de projet

Une bonne structure permet de trouver un fichier sans chercher et de modifier une partie sans en ouvrir trois autres. Ces règles valent pour tous les frameworks. Les règles propres à un framework sont dans `react-conventions` ou `svelte-conventions`, celles qui concernent le style dans `styling-conventions`.

## Quand l'utiliser

- À la création d'un projet ou d'un nouveau module
- Avant d'ajouter une fonctionnalité dans un fichier déjà long
- Pour une revue de code ou un audit de maintenabilité qui touche à l'organisation des fichiers
- Pour préparer un plan de refactoring de structure

## Règles

### Un fichier, une responsabilité

- Un composant, un service ou un module par fichier. Le nom du fichier dit ce qu'il contient.
- Repère de taille : au-delà d'environ 150 lignes, se demander ce qui peut être extrait. Ce n'est pas un plafond strict : un fichier long qui ne fait qu'une chose reste acceptable.
- Une vue (composant, page, contrôleur) assemble et affiche. Elle ne contient pas la logique métier ni les données en dur.

### Où ranger quoi

Adapter les noms au framework, garder la séparation :

| Contenu | Dossier type |
|---|---|
| Composants d'interface | `components/` (sous-dossiers par domaine quand ils dépassent une dizaine) |
| Logique avec état réutilisable | `hooks/` (React), `stores/` (Svelte), `services/` (NestJS) |
| Fonctions pures, calculs | `lib/` ou `utils/` |
| Données statiques et configuration | `data/`, `constants/`, `config/` |
| Types partagés | `types/` |
| Images | `assets/img/` |
| Feuilles de style | `assets/css/` (ou `styles/`, selon la convention du framework) |
| Fichiers servis tels quels (favicon, robots.txt) | `public/` ou `static/` |

Dépendances à sens unique : les composants peuvent importer `hooks`, `lib`, `data` et `types`. L'inverse est interdit, car il crée des cycles et couple la logique à l'affichage.

### Barrel files (`index.ts`)

Un barrel expose l'API publique d'un dossier. Utile à une frontière de module, nuisible partout ailleurs.

- Placer un barrel à la racine d'un dossier consommé depuis l'extérieur (`components/`, `components/ui/`, `utils/`, un module NestJS). Pas un barrel par sous-dossier de composant.
- Exports nommés et explicites. Pas de `export *`, qui masque ce qui est public et peut exporter deux fois le même nom.
- À l'intérieur du dossier, les fichiers s'importent entre eux directement (`./Figure`), jamais via `./index` ou `.`. C'est la cause classique des imports circulaires.
- Ne pas exporter ce qui est interne : un sous-composant utilisé par un seul composant reste hors du barrel.
- Avec `verbatimModuleSyntax`, les types se réexportent avec `export type`.

### Nommage des fichiers

- Composants : PascalCase (`VotingDeck.svelte`, `NavButtons.tsx`).
- Fonctions, hooks, stores, utilitaires : camelCase (`useCarousel.ts`, `calculateAverage.ts`).
- Constantes exportées : UPPER_SNAKE_CASE dans le code, fichier en camelCase.
- Tests : même nom que le fichier testé, suffixe `.test.ts` ou `.spec.ts` selon le projet.

## Instructions

1. Lire l'arborescence existante et le fichier d'instructions du projet (`CLAUDE.md`, `AGENTS.md`). Une convention déjà établie dans le projet l'emporte sur ce skill : la signaler si elle s'en écarte, sans l'imposer.
2. Repérer les fichiers qui mélangent plusieurs responsabilités ou dépassent nettement le repère de taille.
3. Repérer les données, la logique et les ressources rangées au mauvais endroit, et les dépendances dans le mauvais sens.
4. Vérifier les barrels : emplacement, `export *`, imports internes qui passent par le barrel.
5. Proposer l'arborescence cible et, pour chaque déplacement, ce qui change dans les imports.

## Format de sortie

```markdown
### Constats
1. `chemin/fichier` : [règle concernée] — [ce qui ne va pas] → [correction proposée]

### Arborescence cible
[arbre des dossiers et fichiers]
```
