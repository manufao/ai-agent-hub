---
name: technical-documentation
description: "À utiliser pour rédiger ou mettre à jour un README, un guide d'onboarding ou une documentation d'API, en vérifiant chaque affirmation dans le code."
---

# Documentation technique

Une bonne documentation permet à quelqu'un qui arrive de lancer le projet et de comprendre où intervenir, sans demander. Elle ne dit que ce qui est vrai aujourd'hui.

## Quand l'utiliser

- Un projet n'a pas de README ou son README ne correspond plus au code
- Une nouvelle personne doit pouvoir démarrer seule
- Une API change ou apparaît

## Instructions

1. Identifier le lecteur (nouvelle personne, utilisateur de l'API, mainteneur) et ce qu'il veut faire.
2. Lire le code et les fichiers de configuration pour établir les faits : prérequis, commandes, structure, variables d'environnement.
3. Exécuter ou vérifier chaque commande citée. Une commande non vérifiée ne s'écrit pas.
4. Écrire dans l'ordre où le lecteur en a besoin : à quoi ça sert, comment lancer, comment tester, comment contribuer, puis la référence.
5. Pour une API : chaque endpoint avec méthode, chemin, paramètres, exemple de requête et de réponse, erreurs possibles.
6. Ne documenter que ce qui est livré. Le reste va dans une section « À venir » clairement séparée, ou nulle part.
7. Supprimer ou corriger tout passage devenu faux plutôt que de l'ajouter à côté.

## Format de sortie

```markdown
# [Nom du projet]

[Une phrase : à quoi ça sert et pour qui]

## Démarrer
[Prérequis, puis les commandes exactes]

## Utiliser
[Le parcours principal]

## Structure du dépôt
[Les dossiers qui comptent, une ligne chacun]

## Contribuer
[Tests, conventions de commit, revue]
```
