---
name: maintainability-review
description: "À utiliser pour évaluer la maintenabilité d'une zone du code : responsabilités, couplage, duplication, complexité, lisibilité et coût de changement."
---

# Revue de maintenabilité

Une zone maintenable se lit sans effort, se modifie sans surprise et se teste sans montage compliqué. Cette revue cherche ce qui rendra le prochain changement plus cher que nécessaire.

## Quand l'utiliser

- Avant d'ajouter une fonctionnalité dans une zone qui semble fragile
- Pour décider si une zone mérite un refactoring
- Après plusieurs corrections successives au même endroit

## Instructions

1. Délimiter la zone et repérer ce qui change souvent (`git log --stat` sur les fichiers concernés).
2. Passer la grille ci-dessous, en citant à chaque fois le fichier et la zone concernés.
3. Ne retenir que les constats qui ont un effet réel : un principe violé sans conséquence ne compte pas.
4. Estimer pour chaque constat le coût de changement : ce qu'il faudra toucher pour faire évoluer la zone.
5. Classer : **critique** (bloque ou multiplie les bugs), **important** (ralentit chaque changement), **mineur** (gêne de lecture).
6. Conclure : SAIN, À SURVEILLER ou À REFACTORER.

## Grille

- Une responsabilité par module et par fonction ; le nom dit ce qu'elle fait
- Couplage faible : on peut changer une partie sans en ouvrir trois autres
- Pas de duplication qui obligerait à corriger le même bug à plusieurs endroits
- Complexité justifiée : profondeur d'imbrication, longueur des fonctions, nombre de paramètres
- Dépendances explicites et remplaçables dans les tests
- Erreurs traitées au bon niveau, sans avaler les exceptions
- Tests qui décrivent le comportement et survivent à un changement interne

## Format de sortie

```markdown
### Constats
1. **[Critique | Important | Mineur]** — `chemin/fichier.ts` (zone) : [constat] → coût de changement : [ce qu'il faut toucher]

### Verdict
SAIN | À SURVEILLER | À REFACTORER — [une phrase de justification]
```
