---
name: acceptance-criteria
description: "À utiliser pour écrire les critères d'acceptation d'une User Story au format Gherkin (Given/When/Then), en couvrant cas nominal, limites et erreurs."
---

# Écrire des critères d'acceptation

Un critère d'acceptation décrit un comportement observable, pas une intention. Le format Gherkin force cette précision et se traduit directement en test.

## Quand l'utiliser

- Une User Story vient d'être rédigée et n'a pas encore de critères
- Verifier a jugé des critères vagues ou non testables

## Instructions

1. Partir des règles métier de la story : chacune donne au moins un scénario.
2. Écrire un scénario par comportement, dans l'ordre : nominal, cas limites, cas d'erreur.
3. Chaque scénario suit **Given** (état de départ), **When** (une seule action), **Then** (résultat observable).
4. Nommer des valeurs concrètes (« 3 articles », « mot de passe de 7 caractères ») plutôt que des adjectifs (« beaucoup », « trop court »).
5. Relire chaque **Then** : quelqu'un peut-il le constater sans interpréter ? Sinon, le reformuler.
6. Vérifier qu'aucun scénario ne décrit de détail d'implémentation.

## Format de sortie

```gherkin
Scénario : [comportement en une phrase]
  Étant donné [état de départ précis]
  Quand [une seule action]
  Alors [résultat observable]
  Et [résultat observable supplémentaire, si nécessaire]
```

Terminer par la liste des règles métier de la story qui restent sans scénario.
