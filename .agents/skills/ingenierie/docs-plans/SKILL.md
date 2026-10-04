---
name: docs-plans
description: "À utiliser pour enregistrer un plan (architecture, implémentation, observabilité ou tests) dans `docs/plans/<date>-<sujet>/` du projet courant : nommage, en-tête, section Décisions. À appliquer à la fin de chaque plan, avant d'en indiquer le chemin."
---

# Plans dans `docs/plans`

Les plans rédigés avant de coder (architecture, implémentation, observabilité, tests) sont enregistrés dans le dépôt, pour que les décisions restent dans git, à côté du code qu'elles ont produit, et ne vivent pas seulement dans une session de chat. Ce skill fixe où et comment, pour que les fichiers soient toujours les mêmes d'un projet à l'autre.

## Quand l'utiliser

- À la fin d'un plan d'architecture, d'implémentation, d'observabilité ou de tests
- Pour retrouver où un plan précédent a été enregistré

## Instructions

1. **Dossier.** Dans le projet courant (le dossier où tourne la session), créer si besoin `docs/plans/AAAA-MM-JJ-<sujet>/` : la date du jour, puis le sujet en quelques mots en minuscules, sans accent, séparés par des tirets. Si le dossier du sujet existe déjà, y ajouter le fichier au lieu d'en créer un autre.
2. **Fichier.** Un seul fichier par type de plan et par sujet :
   - `architecture.md` pour les décisions de structure (ADR)
   - `implementation.md` pour le plan d'implémentation ordonné
   - `observability.md` pour les scénarios d'échec, les signaux et les actions
   - `tests.md` pour la stratégie de tests

   On n'écrit que les plans dont on a besoin : une petite évolution n'a souvent que `implementation.md`.
3. **En-tête.** Commencer par un titre, puis `> US : #N` (le numéro de l'issue de la User Story ; omettre la ligne s'il n'y en a pas), puis une ligne `> <Auteur> · <date> · <branche ou PR si connue>`.
4. **Contenu.** Le plan lui-même, dans la langue du projet.
5. **Décisions.** Quand une décision change le plan (une option retenue, un périmètre réduit), l'ajouter dans une section `## Décisions`. Un plan suivi et un plan modifié doivent rester lisibles après coup.
6. **Pas de doublon.** Renvoyer vers les ADR, issues et pull requests par leur numéro ou leur chemin au lieu de les recopier.
7. **Conserver.** Les plans restent dans git après la livraison : ils disent pourquoi, ils ne sont pas une liste de tâches.
8. **Indiquer le chemin** du fichier créé à la fin.

## Format de sortie

```text
docs/plans/2026-10-02-observabilite/
├── architecture.md
├── implementation.md
├── observability.md
└── tests.md
```

```markdown
# <Titre du plan>

> US : #12
> <Auteur> · 2026-10-02 · feat/observability

<contenu du plan>

## Décisions

- <décision> : <raison en une phrase>
```

Rien ne protège ce dossier : relire le diff d'un commit de plan comme n'importe quel autre.
