---
name: forge-github
description: "À utiliser quand le remote du dépôt est GitHub, pour lire et écrire les issues, les labels et les pull requests avec `gh` : commandes exactes, lien entre une tâche et sa US, fermeture par `Closes #N`, mise à jour de branche et fusion."
---

# Forge GitHub (`gh`)

Les commandes de GitHub pour Styx (issues) et Courier (pull requests). Son pendant pour GitLab est le skill `forge-gitlab`.

## Quand l'utiliser

- Le remote `origin` pointe vers github.com (`git remote get-url origin`)
- Styx ou Courier doit lire ou écrire une issue ou une pull request

## Issues (Styx)

- Lire une issue : `gh issue view <n> --json number,title,body,labels,state`
- Lister les tâches d'une US : `gh api repos/{owner}/{repo}/issues/<n>/sub_issues`
- Créer : `gh issue create --title "<titre>" --body-file <fichier> --label us --label brouillon`
- Commenter : `gh issue comment <n> --body "<texte>"`
- Changer l'état d'une US, un seul à la fois : `gh issue edit <n> --remove-label brouillon --add-label prete`
- Fermer, seulement sur demande : `gh issue close <n>`
- Labels : `gh label list`, puis `gh label create <nom> --color <hex> --description "<texte>"` pour ceux qui manquent
- Relier une tâche à sa US comme sous-issue : `gh api repos/{owner}/{repo}/issues/<US>/sub_issues -F sub_issue_id=<id>`, où `<id>` est l'identifiant numérique de la tâche (`gh api repos/{owner}/{repo}/issues/<n> --jq .id`), pas son numéro

## Pull requests (Courier)

- Ouvrir : `gh pr create --base <défaut> --title "<titre>" --body "Closes #N"` (`--body ""` s'il n'y a aucune issue à fermer)
- Lire l'état : `gh pr view <n> --json state,mergeable,mergeStateStatus,baseRefName`
- Lire la CI : `gh pr checks <n> --json name,state`
- Mettre la branche à jour sur la branche par défaut, sans réécrire l'historique : `gh pr update-branch <n>`
- Fusionner, sur demande et CI verte : `gh pr merge <n> --squash --delete-branch --subject "<titre> (#<n>)" --body ""`. Le corps vide est obligatoire : sans lui, GitHub reprend les messages des commits.

## À savoir

- `Closes #N` dans la description de la pull request ferme l'issue à la fusion dans la branche par défaut.
- Une issue GitHub n'a pas de label « exclusif » : le remplacement de l'état se fait avec `--remove-label` puis `--add-label`.
