---
name: adr-writing
description: "À utiliser pour consigner une décision d'architecture dans une ADR : contexte, options comparées, décision et conséquences."
---

# Écrire une ADR

Une Architecture Decision Record garde la trace d'un choix structurant et de ses raisons, pour que personne ne le rediscute sans connaître le contexte.

## Quand l'utiliser

- Une décision change la structure du code, un contrat d'API ou le modèle de données
- Deux options raisonnables existaient et on en a écarté une
- Blueprint vient de recommander une option

## Instructions

1. Nommer la décision par son résultat : « Utiliser X pour Y », pas « Réflexion sur Y ».
2. Écrire le contexte : contraintes, forces en présence, ce qui rend le choix nécessaire maintenant.
3. Lister deux ou trois options réelles, chacune avec ses avantages et ses inconvénients concrets.
4. Énoncer la décision et la raison principale, en une ou deux phrases.
5. Écrire les conséquences, y compris négatives, et ce qu'il faudra surveiller.
6. Enregistrer le fichier sous `docs/adr/NNNN-titre-en-kebab-case.md`, avec un numéro qui suit le dernier existant. Ne jamais modifier une ADR acceptée : en écrire une nouvelle qui la remplace.

## Format de sortie

```markdown
# ADR NNNN — [Décision]

- Statut : proposée | acceptée | remplacée par ADR NNNN
- Date : AAAA-MM-JJ

## Contexte
## Options envisagées
### Option A — [nom]
Avantages : … Inconvénients : …
## Décision
## Conséquences
```
