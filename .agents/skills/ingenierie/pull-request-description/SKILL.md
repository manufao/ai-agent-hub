---
name: pull-request-description
description: "À utiliser pour rédiger le titre et la description d'une pull request GitHub, puis l'ouvrir avec `gh` après avoir poussé la branche."
---

# Description de pull request

Une pull request se relit sans le contexte de celui qui l'a écrite. Le titre dit quoi, la description dit pourquoi et comment vérifier.

## Quand l'utiliser

- Une branche de travail est prête à être relue
- Il faut mettre à jour la description d'une pull request existante

## Instructions

1. Lire tous les commits de la branche depuis la branche par défaut (`git log <défaut>..HEAD`) et le diff complet, pas seulement le dernier commit.
2. Écrire le titre : format Conventional Commits, moins de 70 caractères, qui décrit l'ensemble de la branche.
3. Rédiger le résumé en une à trois puces : ce qui change et pourquoi.
4. Signaler tout changement cassant (URL, format, configuration) dans une section dédiée avec la marche à suivre.
5. Écrire le plan de test sous forme de cases : ce qui a été vérifié, et ce qu'il reste à vérifier à la main. Ne jamais cocher ce qui n'a pas été fait.
6. Lier les tickets concernés si le contexte en fournit.
7. Terminer par la ligne d'attribution que la session ou le projet demande, s'il y en a une.
8. Vérifier qu'on n'est pas sur la branche par défaut, puis pousser avec `git push -u origin <branche>`. Ne jamais utiliser `--force` ; si une réécriture d'historique demandée par l'utilisateur impose de forcer, utiliser seulement `--force-with-lease`, après avoir vérifié qu'aucun commit distant n'est absent de la branche locale.
9. Ouvrir la pull request : `gh pr create --base <défaut> --title "<titre>" --body-file <fichier>` (ou `--body` avec un heredoc). Rendre l'adresse renvoyée.
10. Sur demande, lire l'état des vérifications avec `gh pr checks <numéro>`. Ne pas fusionner sans demande explicite et sans vérifications au vert.

## Format de sortie

```markdown
## Résumé
- [Ce qui change et pourquoi]

## Changement cassant
[Facultatif : ce qui casse et comment migrer]

## Plan de test
- [x] [Ce qui a été vérifié]
- [ ] [Ce qui reste à vérifier à la main]

[Ligne d'attribution, si demandée]
```
