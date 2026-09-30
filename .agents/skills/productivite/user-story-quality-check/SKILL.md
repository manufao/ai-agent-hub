---
name: user-story-quality-check
description: "À utiliser pour évaluer la qualité d'une User Story avec la grille INVEST et repérer ambiguïtés, jargon et risques cachés."
---

# Contrôle qualité d'une User Story

Complète la Definition of Ready : celle-ci vérifie la présence des éléments, ce contrôle juge leur qualité.

## Quand l'utiliser

- Après `definition-of-ready`, pour une story à enjeu ou jugée floue
- Pour relire une story écrite par quelqu'un d'autre

## Instructions

1. Passer la story dans la grille INVEST : indépendante, négociable, apportant de la valeur, estimable, petite, testable. Une phrase de justification par lettre.
2. Chercher les ambiguïtés : adjectifs sans mesure (« rapide », « simple »), pronoms sans référent, « etc. », « éventuellement ».
3. Chercher les termes métier utilisés sans définition ou avec deux sens possibles.
4. Chercher les risques cachés : donnée personnelle, paiement, migration de données, comportement différent selon le rôle.
5. Pour chaque problème, citer la phrase exacte et proposer la question à poser ou la reformulation.
6. Classer les problèmes : bloquant, important, mineur.

## Format de sortie

```markdown
### Grille INVEST
- I : [OK / à revoir — justification]
- N : …

### Problèmes
1. **[Bloquant | Important | Mineur]** — « [phrase citée] » : [pourquoi] → [question ou reformulation]

### Risques à confirmer
- [Risque, et avec qui le confirmer]
```
