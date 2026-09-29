---
name: implementation-plan
description: "À utiliser pour préparer un plan d'implémentation ordonné : étapes, fichiers à modifier, vérification de chaque étape et risques."
---

# Plan d'implémentation

Un bon plan permet de commencer à coder sans avoir à réfléchir à l'ordre. Chaque étape laisse le dépôt dans un état sain.

## Quand l'utiliser

- Une tranche est prête à être développée
- Le changement touche plusieurs fichiers ou plusieurs couches

## Instructions

1. Lire la tranche, ses critères d'acceptation et le code qu'elle touche, y compris les tests voisins.
2. Repérer les conventions du dépôt à suivre : structure des dossiers, nommage, style de test.
3. Ordonner les étapes du plus fondamental au plus visible, de façon que chacune compile et passe les tests.
4. Pour chaque étape : les fichiers créés ou modifiés, ce qui change, et comment vérifier (test à lancer, comportement à observer).
5. Prévoir les tests dans les étapes elles-mêmes, pas en fin de plan.
6. Lister les risques : migration, comportement existant modifié, dépendance externe.
7. Écarter tout ce qui n'est pas dans la tranche ; le noter comme suite possible.

## Format de sortie

```markdown
### Étape 1 — [ce qui est fait]
- Fichiers : `chemin/fichier.ts` (créé | modifié)
- Changement : [description courte]
- Vérification : [commande ou comportement observable]

### Risques
- [Risque] — [mitigation]

### Hors plan
- [Idée notée mais non traitée]
```
