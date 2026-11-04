# Règles de découpage

Les blocs sont classés par priorité : en cas de conflit, la règle du bloc le plus haut l'emporte.

## 1. Cohérence

- Chaque commit laisse le dépôt cohérent : il se construit, ses tests passent et il ne dépend d'aucun commit suivant.
- Un changement de dépendance ou de branchement (service attendu, configuration qui pointe vers le nouveau composant) va dans le commit qui rend ce branchement fonctionnel, pas avant.
- La CI qui attend un composant suit immédiatement le commit qui introduit ce composant.
- Un artefact généré (snapshot, documentation générée) va dans le commit dont le changement le régénère.
- Quand un découpage des blocs suivants casserait la cohérence (chaque morceau seul rend le dépôt non fonctionnel), garder ensemble et le signaler dans le compte rendu à l'utilisateur, jamais dans le message de commit.

## 2. Un sujet

Un sujet est un changement qu'une phrase décrit sans « et ».

- Le mot « et » dans le sujet signale deux commits : découper.
- Un changement sur deux modules se découpe en un commit par module.
- Une capacité ajoutée à une bibliothèque partagée et son utilisation par une application sont deux commits : la bibliothèque d'abord, puis un commit par application consommatrice.

## 3. Une nature

La nature est le genre de changement, à l'intérieur d'un même sujet. Un commit n'en a qu'une. Se découpent à part :

- un refactoring, jamais mêlé à une fonctionnalité ou à un correctif : quand la fonctionnalité en a besoin, il passe avant elle, hors numérotation de la série ;
- une suppression pure (code mort, fichier retiré, configuration retirée) ;
- un changement de style ou d'interface sans effet sur le comportement ;
- l'ajout d'une validation, d'un garde ou d'un typage plus strict ;
- l'ajout de l'infrastructure d'erreur (exception, code d'erreur, documentation générée), avant le code qui l'utilise.

Si le type d'un commit hésite entre deux valeurs (`feat` ou `fix`, `refactor` ou `feat`), c'est qu'il contient deux natures : le découper.

Un fichier qui mêle des changements de commits différents se découpe par morceaux avec `git add -p <fichier>`. La commande est interactive : la donner à l'utilisateur au lieu de la lancer.

## 4. Taille et série

- Un commit est assez petit pour être relu seul.
- Une fonctionnalité ou un correctif qui approche 10 fichiers se découpe en série de commits (10 fichiers deviennent par exemple 5 commits de 2 fichiers). Le seuil compte les fichiers de code et leurs tests : les barrels, snapshots et fichiers générés n'en font pas partie, mais restent dans la partie qui les produit.
- Chaque commit de la série porte sa position `i/n` en tête du sujet, `n` étant le nombre de commits de la série : `feat(billing): 1/4 add invoice entity`. Les parties se suivent, sans autre commit entre elles.
- Chaque partie est relisible seule. Un fichier source et son test vont dans la même partie. Le sujet de chaque partie dit ce qu'elle apporte, jamais le même d'une partie à l'autre.

## 5. Ordre

- Dans une série, chaque partie ne dépend que des précédentes : types, interfaces et entités d'abord, puis services, puis points d'entrée et branchement.
