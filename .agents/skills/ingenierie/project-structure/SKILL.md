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

**Réutiliser avant de créer.** Avant d'ajouter un service, un helper, un composant ou un type, chercher dans le dépôt ce qui fait déjà la même chose ou presque. L'étendre ou le suivre plutôt que créer un doublon, et citer le fichier repris.

**Types qui portent un sens** (TypeScript). Un type dit ce qu'est la valeur, ancré sur les types du domaine, pas seulement quels champs elle a :

- Référencer une entité par sa clé avec `Pick` : `serviceProvider?: Pick<ServiceProvider, 'id'>`, jamais `{ id: string }`.
- Dériver avec `Pick`, `Omit` et `Partial` plutôt que recopier les champs à la main, pour que le type dérivé suive sa source.
- Pas de type objet en ligne dans une signature : extraire une interface nommée (`options: InstanceCreationOptionsInterface`, pas `options: { grantContributor: boolean }`).
- Un cast qui ment (`as Entity` sur un objet partiel) signale un type de paramètre faux : corriger le type plutôt que caster à chaque appel.

**Dépendances injectées.** Une unité reçoit ses dépendances de l'extérieur au lieu de les créer elle-même, pour qu'un test puisse les remplacer par un mock : par le constructeur pour une classe ou un service (`constructor(private readonly repo: UserRepository) {}`, jamais `private repo = new UserRepository()`), en paramètre ou en props pour une fonction ou un composant.

**Barrel files (`index.ts`).** Le `index.ts` à la racine d'un module ou d'une bibliothèque est son **seul** point d'entrée public : l'extérieur n'importe jamais un fichier interne directement. Chaque sous-dossier exposé (`dto/`, `interfaces/`, `services/`, `helpers/`) a son propre `index.ts` qui réexporte ses fichiers, et la racine réexporte les sous-dossiers :

```ts
// src/index.ts
export * from './dto'
export * from './interfaces'
export * from './services'
```

À l'intérieur du module, imports directs (`./my.service`), jamais via son propre `index` : c'est la source classique des cycles. Ce qui est interne reste hors des barrels. Avec `verbatimModuleSyntax`, les types se réexportent en `export type`.

**Nommage.**

- Composants en PascalCase. Hooks, stores et utilitaires en camelCase. Constantes en UPPER_SNAKE_CASE.
- Suffixe selon le rôle : interfaces en `…Interface` (`OtrsTicketInterface`, jamais `OtrsTicket`), DTO en `…Dto`, services en `…Service`, modules en `…Module` quand le framework a cette notion, commandes en `…Command`.
- Fichiers et dossiers en kebab-case, avec le rôle en suffixe : `otrs-ticket.interface.ts`, `http-otrs-client-config.dto.ts`, `user.service.ts`. Exception : un fichier de composant suit la casse imposée par le framework (`Carousel.tsx`, `Carousel.svelte`).
- Bibliothèques en kebab-case, sous l'espace de noms du projet quand il en a un (`@<projet>/<nom-de-lib>`).
- Tests : nom du fichier testé + `.test.ts` ou `.spec.ts`.

## Instructions

1. Lire l'arborescence et les instructions du projet (`CLAUDE.md`, `AGENTS.md`). Une convention déjà établie l'emporte : la signaler sans l'imposer.
2. Chercher le code existant qui fait déjà ce qui est ajouté, et le signaler comme à réutiliser.
3. Repérer les fichiers à plusieurs responsabilités et ceux qui dépassent nettement le repère de taille.
4. Repérer ce qui est mal rangé et les dépendances dans le mauvais sens.
5. Vérifier les barrels : un `index.ts` par sous-dossier exposé, la racine comme seul point d'entrée, aucun import interne via le barrel.
6. Vérifier le nommage : casse, suffixe de rôle, nom de fichier.
7. Repérer les dépendances créées en dur dans une unité au lieu d'être injectées, et les types anonymes ou les casts qui mentent.
8. Proposer l'arborescence cible et les imports à mettre à jour.

## Format de sortie

```markdown
### Constats
1. `chemin/fichier` : [règle] — [problème] → [correction]

### Arborescence cible
[arbre]
```
