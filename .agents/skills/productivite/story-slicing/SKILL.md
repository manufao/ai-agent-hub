---
name: story-slicing
description: "À utiliser pour découper une User Story validée en tranches verticales livrables et en tâches ordonnées."
---

# Découper une story en tranches verticales

Une tranche verticale traverse toutes les couches (interface, logique, données) pour livrer un comportement complet, même minimal. C'est l'inverse d'une découpe par couche (« d'abord la base, puis l'API, puis l'écran »).

## Quand l'utiliser

- Une story validée est trop grosse pour être livrée d'un seul tenant
- On veut une première version démontrable rapidement

## Instructions

1. Lister les critères d'acceptation de la story.
2. Trouver le parcours le plus simple qui apporte déjà de la valeur : ce sera la première tranche.
3. Ajouter les tranches suivantes en enrichissant ce parcours (cas limites, variantes, confort), une capacité par tranche.
4. Vérifier chaque tranche : démontrable seule, testable seule, livrable sans casser l'existant.
5. Décomposer chaque tranche en tâches ordonnées, chacune terminable en une session de travail.
6. Rattacher chaque critère d'acceptation à une tranche ; un critère sans tranche signale un oubli.
7. Noter les dépendances entre tranches et ce qui peut se faire en parallèle.

## Format de sortie

```markdown
### Tranche 1 — [objectif visible par l'utilisateur]
- Valeur livrée : [ce qui devient possible]
- Tâches :
  1. [Tâche]
- Critères couverts : [liste]
- Dépend de : [aucune | tranche N]
```
