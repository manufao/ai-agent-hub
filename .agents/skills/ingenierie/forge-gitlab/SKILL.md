---
name: forge-gitlab
description: "À utiliser quand le remote du dépôt est GitLab, pour lire et écrire les issues, les labels et les merge requests avec `glab` : commandes, lien entre une tâche et sa US, fermeture par `Closes #N`, fusion en squash. Indique les commandes non vérifiées."
---

# Forge GitLab (`glab`)

Les commandes de GitLab pour Styx (issues) et Courier (merge requests). Son pendant pour GitHub est le skill `forge-github`. Ce qui n'a pas été confirmé dans la documentation est marqué « non vérifié » : le tester sur un projet GitLab de test avant de s'y fier.

## Quand l'utiliser

- Le remote `origin` pointe vers un GitLab (`gitlab.com` ou une instance auto-hébergée)
- Styx ou Courier doit lire ou écrire une issue ou une merge request

## Vocabulaire

- Une **pull request** GitHub est une **merge request** (MR) sur GitLab.
- Les **checks** d'une PR sont le **pipeline** de la MR.

## Prérequis

- `glab` installé et connecté : `glab auth login`. Pour une instance auto-hébergée : `glab auth login --hostname <hôte>`.
- `glab` déduit l'hôte et le projet du remote `origin` quand on est dans le dépôt.

## Issues (Styx)

- Lire une issue : `glab issue view <n> --comments`. La sortie JSON n'est pas vérifiée.
- Créer : `glab issue create -t "<titre>" --description-file <fichier> -l us -l brouillon --yes`
- Commenter : `glab issue note <n> --message "<texte>"`
- Changer l'état d'une US, un seul à la fois : `glab issue update <n> --label prete --unlabel brouillon`
- Fermer, seulement sur demande : `glab issue close <n>` (non vérifié)
- Labels : `glab label list`, puis `glab label create --name <nom> --color "#<hex>" --description "<texte>"` pour ceux qui manquent
- Relier une tâche à sa US :
  - **Repli sûr** : créer la tâche comme une issue reliée à la US, avec `--linked-issues <US> --link-type relates_to` ; la ligne `US : #N` en tête du corps garde le lien lisible.
  - **Hiérarchie** : GitLab sait placer une tâche comme enfant d'une issue (action rapide `/set_parent #<US>` dans la description de la tâche). Savoir si `glab` crée une tâche de ce type n'est pas vérifié, et la disponibilité selon l'offre GitLab non plus.

## Merge requests (Courier)

- Ouvrir : `glab mr create -t "<titre>" --description "Closes #N" --target-branch <défaut> --yes` (`--description ""` s'il n'y a aucune issue à fermer)
- Lire l'état : `glab mr view <n>`
- Lire la CI : `glab ci status` (`--wait` pour attendre la fin du pipeline)
- Fusionner, sur demande et pipeline vert : `glab mr merge <n> --squash --squash-message "<titre>" --remove-source-branch --yes`
- Mettre la branche à jour sur la branche par défaut : commande non vérifiée.

## À savoir

- `Closes #N` dans la description de la merge request ferme l'issue quand elle est fusionnée dans la branche par défaut.
- Le message de squash par défaut de GitLab est le seul titre, ce qui convient à la règle « un commit n'a qu'un titre ».
- Les labels « scoped » (`etat::prete`), qui s'excluent entre eux, n'existent que dans les offres Premium et Ultimate. Sans eux, le remplacement de l'état se fait avec `--label` puis `--unlabel`.
