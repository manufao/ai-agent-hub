---
name: refactoring-plan
description: "À utiliser pour transformer une dette technique en plan de refactoring par petits pas, avec filet de tests et critère d'arrêt."
---

# Plan de refactoring

Un refactoring change la structure sans changer le comportement. Le rendre sûr consiste à avancer par pas minuscules, chacun vérifiable.

## Quand l'utiliser

- Sentinel a rendu un verdict À REFACTORER
- Une zone bloque une fonctionnalité à venir et doit être remise en ordre d'abord

## Instructions

1. Décrire la dette en une phrase et le résultat visé : ce qui deviendra plus simple, et pour qui.
2. Lister les tests existants qui protègent la zone. S'il n'y en a pas assez, le premier pas est d'écrire des tests de caractérisation qui figent le comportement actuel.
3. Découper en pas dont chacun tient en un commit, laisse les tests au vert et peut être livré seul.
4. Ordonner les pas pour que les moins risqués passent en premier (renommer, extraire) avant les structurels (déplacer, remplacer).
5. Pour chaque pas : fichiers touchés, ce qui change, comment vérifier que le comportement est intact.
6. Écrire le critère d'arrêt : le point où la zone est assez saine et où continuer coûterait plus que ça ne rapporte.
7. Noter ce qu'on ne touche pas volontairement.

## Format de sortie

```markdown
### Objectif
[Ce qui sera plus simple, et pour qui]

### Filet de tests
- Existants : [chemins]
- À ajouter avant de commencer : [comportements à figer]

### Pas
1. **[Action courte]** — fichiers : `chemin` — vérification : [commande] — risque : faible | moyen | élevé

### Critère d'arrêt
[Quand s'arrêter]

### Hors plan
- [Ce qu'on ne touche pas]
```
