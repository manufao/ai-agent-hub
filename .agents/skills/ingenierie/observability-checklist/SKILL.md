---
name: observability-checklist
description: "À utiliser pour préparer l'observabilité d'une fonctionnalité : logs, métriques, alertes actionnables, gestion des erreurs et diagnostic en production."
---

# Checklist d'observabilité

Quand une fonctionnalité échoue en production, on doit pouvoir répondre à trois questions : est-ce que ça casse, où, et pourquoi. Cette checklist prépare ces réponses avant la mise en ligne.

## Quand l'utiliser

- Une fonctionnalité va partir en production
- Un incident a été difficile à diagnostiquer

## Instructions

1. Lister les scénarios d'échec : dépendance indisponible, entrée invalide, lenteur, résultat faux sans erreur, saturation.
2. Pour chaque scénario, décider du signal qui le rend visible : un log, une métrique ou une alerte.
3. Écrire les logs avec un niveau adapté (erreur pour ce qui demande une action, avertissement pour ce qui dégrade, information pour les jalons), un identifiant de corrélation et le contexte utile. Jamais de secret, de mot de passe ni de donnée personnelle.
4. Choisir peu de métriques, mais parlantes : volume, taux d'erreur, durée. Préférer ce qui reflète l'expérience de l'utilisateur.
5. N'écrire une alerte que si quelqu'un sait quoi faire en la recevant. Noter qui agit, quoi vérifier en premier, et comment revenir en arrière.
6. Vérifier que les messages d'erreur montrés à l'utilisateur ne révèlent rien d'interne et que les erreurs internes gardent leur cause complète dans les logs.
7. Écrire les premières hypothèses de diagnostic et la commande ou la requête qui permet de les vérifier.

## Format de sortie

| Scénario d'échec | Signal | Action attendue |
|---|---|---|
| [Ce qui peut casser] | log / métrique / alerte : [détail] | [Qui fait quoi] |

Puis la liste de ce qui manque aujourd'hui dans le code pour produire ces signaux.
