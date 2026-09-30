---
name: definition-of-done
description: "À utiliser pour vérifier qu'une tâche ou une User Story est vraiment terminée : checklist Definition of Done avec une preuve par point."
---

# Definition of Done

« Terminé » veut dire prouvé, pas « je crois que ça marche ». Chaque ligne de la checklist appelle une preuve.

## Règle absolue

Aucune affirmation de fin sans preuve fraîche. Une preuve est fraîche quand la commande a été lancée dans ce tour de travail et que sa sortie complète a été lue. Un résultat antérieur, un résumé de quelqu'un d'autre ou un « ça devrait passer » ne comptent pas.

## Quand l'utiliser

- Avant de fusionner une pull request ou de fermer un ticket
- Pour trancher quand quelqu'un dit que c'est fini
- Avant d'écrire « c'est corrigé » ou « les tests passent »

## Instructions

1. Relire les critères d'acceptation de la story.
2. Pour chaque affirmation, identifier la commande qui la prouve, la lancer en entier, lire la sortie et le code de retour, puis compter les échecs.
3. Lancer les vérifications du dépôt (tests, lint, types, build) et noter le résultat de chacune.
4. Pour chaque critère d'acceptation, citer la preuve : test qui le couvre, sortie de commande ou comportement observé.
5. Passer les autres lignes de la checklist. Sans preuve, une ligne est non validée.
6. Rendre un verdict binaire. Un seul point non validé rend la tâche NON TERMINÉE.
7. Lister précisément ce qui reste à faire.

## Ce qui prouve, ce qui ne prouve pas

| Affirmation | Preuve exigée | Preuve insuffisante |
|---|---|---|
| Les tests passent | Sortie de la commande de test : 0 échec | Un lancement précédent, « ça devrait passer » |
| Le lint est propre | Sortie du linter : 0 erreur | Un contrôle partiel ou déduit d'un autre |
| Le build réussit | Commande de build : code de retour 0 | Le lint passe, les logs ont l'air bons |
| Le bug est corrigé | Le test du symptôme d'origine passe | Le code a changé, donc c'est réglé |
| Le test de non-régression est fiable | Il échoue sans le correctif, passe avec | Il passe une seule fois |
| Un agent a terminé | Le diff montre les changements | L'agent annonce un succès |
| Les exigences sont couvertes | Checklist ligne à ligne | Les tests passent |

## Signaux d'alerte

Arrêtez-vous et vérifiez si vous constatez l'un de ces signes :

- Les mots « devrait », « probablement » ou « semble »
- De la satisfaction exprimée avant la vérification (« Parfait ! », « C'est fini ! »)
- Un commit, un push ou une pull request sans avoir relancé les vérifications
- Un rapport de succès repris tel quel, sans regarder le diff
- Une vérification partielle présentée comme complète
- « Juste cette fois », ou la fatigue qui pousse à conclure

Si l'un de ces signes apparaît, la tâche n'est pas terminée tant que la preuve n'est pas là.

## Checklist

- Chaque critère d'acceptation est prouvé
- Les tests passent, dont ceux de non-régression
- Lint, types et build passent
- Aucun reste à faire caché (TODO, code commenté, contournement temporaire)
- La documentation concernée est à jour
- La revue de code est faite et ses points bloquants sont traités
- Aucun secret ni donnée sensible dans les modifications

## Format de sortie

| Point | Validé | Preuve |
|---|---|---|
| [Ligne de la checklist ou critère] | oui / non | [commande lancée et résultat, test, observation] |

Puis : **Verdict** — TERMINÉ ou NON TERMINÉ, suivi de la liste de ce qui reste.
