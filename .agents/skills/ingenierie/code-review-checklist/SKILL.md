---
name: code-review-checklist
description: "À utiliser pour relire une modification ou une pull request : checklist de revue, gravité des remarques et décision finale."
---

# Checklist de revue de code

Une revue utile trouve les problèmes qui coûteront cher plus tard, et ignore les préférences personnelles.

## Quand l'utiliser

- Avant de fusionner une pull request
- Pour relire un diff produit par un agent ou une autre personne

## Instructions

1. Lire d'abord l'intention de la modification (description, story), puis le diff complet, puis le code autour des zones modifiées.
2. Passer la checklist ci-dessous. Ne signaler que ce qui s'appuie sur un élément concret du code.
3. Pour chaque remarque : fichier, zone, raison, et correction réalisable.
4. Classer : **bloquant** (bug, faille, perte de données), **important** (risque réel, test manquant, dette qui coûtera), **amélioration** (lisibilité, simplification).
5. Ne pas commenter un choix de style qui ne nuit ni à la lisibilité ni au projet.
6. Conclure par une décision.

## Checklist

- Le comportement correspond aux critères d'acceptation et n'en ajoute pas d'autres
- Les cas limites et d'erreur sont gérés
- Aucune entrée utilisateur n'est utilisée sans validation ; aucun secret dans le code
- Pas de régression sur les comportements voisins
- Les tests couvrent le nouveau comportement et échoueraient s'il cassait
- Les responsabilités sont séparées ; pas de duplication évitable
- Les noms disent ce que font les fonctions ; la complexité est justifiée
- Le coût de performance est raisonnable sur les volumes réels

## Format de sortie

```markdown
### Remarques
1. **[Bloquant | Important | Amélioration]** — `chemin/fichier.ts` (zone) : [problème] → [correction proposée]

### Décision
APPROUVER | APPROUVER AVEC RÉSERVES | DEMANDER DES MODIFICATIONS — [une phrase de justification]
```
