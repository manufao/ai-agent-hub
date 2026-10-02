---
name: docs-plans
description: "À utiliser pour enregistrer le plan d'un agent (architecture, implémentation, observabilité, tests) dans `docs/plans/<date>-<sujet>/` du projet courant : nommage, en-tête, section Décisions, langue. À appliquer à la fin de chaque plan, avant de rendre le chemin du fichier."
---

# Plans dans `docs/plans`

Les agents qui planifient avant de coder (Blueprint, Forge, Pulse, Specimen) enregistrent leur plan dans le dépôt, pour que les décisions restent dans git, à côté du code qu'elles ont produit, et ne vivent pas seulement dans une session de chat. Ce skill fixe où et comment, pour que les fichiers soient toujours les mêmes d'un projet à l'autre.

## Quand l'utiliser

- À la fin d'un plan d'architecture, d'implémentation, d'observabilité ou de tests
- Pour retrouver où un plan précédent a été enregistré

## Instructions

1. **Dossier.** Dans le projet courant (le dossier où tourne la session), créer si besoin `docs/plans/AAAA-MM-JJ-<sujet>/` : la date du jour, puis le sujet en quelques mots en minuscules, sans accent, séparés par des tirets. Si le dossier du sujet existe déjà, y ajouter le fichier au lieu d'en créer un autre.
2. **Fichier.** Un seul fichier par agent et par sujet :
   - `architecture.md` pour Blueprint (ADR et décisions de structure)
   - `implementation.md` pour Forge (plan d'implémentation ordonné)
   - `observability.md` pour Pulse (scénarios d'échec, signaux, actions)
   - `tests.md` pour Specimen (stratégie de tests)

   Un agent n'écrit que son fichier, et seulement quand on l'appelle : une petite évolution n'a souvent que `implementation.md`.
3. **En-tête.** Commencer par un titre, puis `> US : #N` (le numéro de l'issue de la User Story ; omettre la ligne s'il n'y en a pas), puis une ligne `> <Agent> · <date> · <branche ou PR si connue>`.
4. **Contenu.** Le contrat de sortie de l'agent, tel quel, en français.
5. **Décisions.** Quand l'utilisateur tranche quelque chose qui change le plan (une option retenue, un périmètre réduit), l'ajouter dans une section `## Décisions`. Un plan suivi et un plan modifié doivent rester lisibles après coup.
6. **Pas de doublon.** Renvoyer vers les ADR, issues et pull requests par leur numéro ou leur chemin au lieu de les recopier.
7. **Conserver.** Les plans restent dans git après la livraison : ils disent pourquoi, ils ne sont pas une liste de tâches.
8. **Terminer la réponse** par le chemin du fichier créé.

## Format de sortie

```text
docs/plans/2026-10-02-observabilite/
├── architecture.md     # Blueprint
├── implementation.md   # Forge
├── observability.md    # Pulse
└── tests.md            # Specimen
```

```markdown
# <Titre du plan>

> US : #12
> Forge · 2026-10-02 · feat/observability

<contenu du plan>

## Décisions

- <décision> : <raison en une phrase>
```

Limite : rien n'empêche techniquement un agent d'écrire ailleurs ; la règle « seulement sous `docs/plans/` » est dans sa persona. Relire le diff d'un commit de plan comme n'importe quel autre.
