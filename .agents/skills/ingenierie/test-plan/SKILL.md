---
name: test-plan
description: "À utiliser pour produire un plan de tests : niveau de chaque test, cas nominaux, cas limites, erreurs et risques de régression."
---

# Plan de tests

Décide ce qu'il faut tester avant d'écrire les tests, pour éviter à la fois les trous et les tests redondants.

## Quand l'utiliser

- Avant ou pendant le développement d'une tranche
- Pour évaluer si les tests existants protègent une modification

## Instructions

1. Partir des critères d'acceptation : chacun doit être couvert par au moins un test.
2. Choisir le niveau le plus bas qui prouve le comportement : unitaire pour la logique, intégration pour les échanges entre modules, de bout en bout pour un parcours utilisateur critique.
3. Ajouter les cas limites : valeurs vides, bornes, doublons, très grandes entrées, ordre inhabituel, concurrence si elle existe.
4. Ajouter les cas d'erreur : entrée invalide, dépendance indisponible, droits insuffisants.
5. Chercher les tests existants concernés : lesquels réutiliser, lesquels risquent de casser, lesquels mettre à jour.
6. Identifier les régressions possibles : comportements voisins que la modification pourrait altérer.
7. Signaler ce qui ne se teste pas automatiquement, et comment le vérifier autrement.

## Format de sortie

| Critère ou risque | Niveau | Cas testés | Test existant |
|---|---|---|---|
| [Critère d'acceptation] | unitaire / intégration / E2E | [nominal, limites, erreurs] | [aucun | chemin du test] |

Terminer par la liste des données de test nécessaires et des points non testables automatiquement.
