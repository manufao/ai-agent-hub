---
name: definition-of-done
description: "À utiliser pour vérifier qu'une tâche ou une User Story est vraiment terminée : checklist Definition of Done avec une preuve par point."
---

# Definition of Done

« Terminé » veut dire prouvé, pas « je crois que ça marche ». Chaque ligne de la checklist appelle une preuve.

## Quand l'utiliser

- Avant de fusionner une pull request ou de fermer un ticket
- Pour trancher quand quelqu'un dit que c'est fini

## Instructions

1. Relire les critères d'acceptation de la story.
2. Lancer les vérifications du dépôt (tests, lint, types, build) et noter le résultat de chacune.
3. Pour chaque critère d'acceptation, citer la preuve : test qui le couvre, sortie de commande ou comportement observé.
4. Passer les autres lignes de la checklist. Sans preuve, une ligne est non validée.
5. Rendre un verdict binaire. Un seul point non validé rend la tâche NON TERMINÉE.
6. Lister précisément ce qui reste à faire.

## Checklist

- Chaque critère d'acceptation est prouvé
- Les tests passent, dont ceux de non-régression
- Lint, types et build passent
- Aucun reste à faire caché (TODO, code commenté, contournement temporaire)
- La documentation concernée est à jour
- La revue de code est faite et ses points bloquants sont traités
- Aucun secret ni donnée sensible dans les modifications

## Format de sortie

| Point | Validé | Preuve |
|---|---|---|
| [Ligne de la checklist ou critère] | oui / non | [test, commande, observation] |

Puis : **Verdict** — TERMINÉ ou NON TERMINÉ, suivi de la liste de ce qui reste.
