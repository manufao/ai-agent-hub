---
name: changelog-entry
description: "À utiliser pour rédiger une entrée de changelog lisible par les utilisateurs à partir des changements livrés, au format Keep a Changelog."
---

# Entrée de changelog

Un changelog s'adresse à celles et ceux qui utilisent le projet, pas à ceux qui l'ont écrit. Il dit ce qui change pour eux.

## Quand l'utiliser

- Avant une livraison ou une release
- Quand une pull request modifie un comportement visible

## Instructions

1. Lister les changements livrés depuis la dernière entrée (`git log` ou pull requests fusionnées).
2. Écarter ce qui n'a aucun effet pour l'utilisateur (outillage interne, refactoring sans effet visible).
3. Classer chaque changement : **Ajouté**, **Modifié**, **Corrigé**, **Supprimé**, **Sécurité**.
4. Écrire chaque ligne du point de vue de l'utilisateur, au présent, avec ce qu'il peut faire ou constater de nouveau. Un changement cassant est signalé en tête de section, avec la marche à suivre.
5. Ne jamais copier tels quels les messages de commit : ils décrivent le travail, pas l'effet.
6. Placer l'entrée sous « Non publié » ou sous le numéro de version, avec la date au format AAAA-MM-JJ.

## Format de sortie

```markdown
## [Version ou Non publié] — AAAA-MM-JJ

### Ajouté
- [Ce que l'utilisateur peut faire de nouveau]

### Modifié
- [Ce qui se comporte différemment]

### Corrigé
- [Ce qui ne fonctionnait pas et fonctionne maintenant]
```
