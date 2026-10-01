---
name: session-handoff
description: "À utiliser pour condenser la session en cours dans un document de passation nommé et structuré, qu'un agent frais peut reprendre sans relire la conversation. Déclencheurs : « handoff », « passation », fin de session, changement d'agent. Accepte en argument un dossier de destination et l'objectif de la prochaine session."
---

# Session handoff

Rédiger un document de passation à partir de la conversation, pour qu'un agent sans contexte reprenne le travail là où il s'arrête. Le skill garantit un nom de fichier lisible, une structure identique à chaque fois et un emplacement prévisible.

## Quand l'utiliser

- La session touche à sa fin et le travail continuera plus tard ou avec un autre agent
- Le contexte devient trop long et il vaut mieux repartir d'une session propre
- Vous voulez retrouver ce qui a été fait, décidé et laissé de côté sans relire la conversation

## Arguments

Le texte passé au skill suit toujours cet ordre, sans guillemets ni séparateur :

```
/session-handoff <objectif de la prochaine session> [<dossier>]
```

- **L'objectif** vient en premier : du texte libre. Il oriente le contenu du document (ce qu'il faut détailler, ce qu'il faut résumer).
- **Le dossier** vient en dernier et il est facultatif. C'est le dernier mot, à condition qu'il ressemble à un chemin : il commence par `/`, `~`, `./` ou `../`. Un chemin contenant des espaces se met entre guillemets.

Exemples :

- `/session-handoff finir la PR du site ~/notes/handoffs` : objectif « finir la PR du site », dossier `~/notes/handoffs`
- `/session-handoff finir la PR du site` : même objectif, dossier par défaut
- `/session-handoff` : objectif déduit de ce qui reste à faire, dossier par défaut

Si le dernier mot ne ressemble pas à un chemin, tout le texte est l'objectif. Un chemin placé ailleurs qu'à la fin est traité comme une partie de l'objectif.

## Instructions

1. **Choisir le dossier.**
   - Si un chemin est fourni, l'utiliser tel quel (`~` désigne le dossier personnel).
   - Sinon, utiliser le dossier `context` du dossier de configuration global de Claude : `~/.claude/context`.
   - Créer le dossier s'il n'existe pas.
2. **Choisir le nom du fichier.**
   - 4 ou 5 mots en minuscules, sans accent, séparés par des tirets, qui résument le travail de la session, suivis de `.md`. Exemple : `renforcer-definition-of-done-gatekeeper.md`.
   - Décrire le travail réalisé ou en cours, jamais un mot générique (`handoff`, `session`, `notes`).
   - Si un fichier du même nom existe déjà, ne pas l'écraser : ajouter `-2`, `-3`, etc. avant `.md`.
3. **Rassembler les faits.** Relire la conversation et, si utile, l'état du dépôt (branche, `git status`, derniers commits) pour renseigner la section « État actuel ».
4. **Ne pas dupliquer.** Ce qui figure déjà dans un autre artefact (spécification, plan, ADR, ticket, commit, diff, PR) est référencé par son chemin ou son URL dans la section « Références », jamais recopié.
5. **Masquer les données sensibles.** Remplacer clés d'API, mots de passe, jetons et données personnelles par `[masqué]`.
6. **Écrire le fichier** avec la structure ci-dessous, sans section vide : si une section n'a rien à dire, écrire « Rien à signaler ».
7. **Vérifier** : relire le fichier comme le ferait un agent sans contexte. Chaque référence mène à quelque chose d'existant et la section « Prochaines étapes » permet de démarrer immédiatement.
8. **Rendre compte** : donner à l'utilisateur le chemin complet du fichier créé, et rien d'autre.

## Format de sortie

Le fichier a toujours cette structure :

```markdown
---
titre: <titre court du travail de la session>
date: <AAAA-MM-JJ>
projet: <nom du dépôt ou du dossier de travail>
branche: <branche git, ou « sans objet »>
prochaine-session: <objectif en une phrase>
---

# <titre court du travail de la session>

## Objectif de la prochaine session

<Une à trois phrases : ce que la prochaine session doit accomplir.>

## État actuel

<Où en est le travail : branche, fichiers modifiés non commités, tests et vérifications, ce qui marche et ce qui ne marche pas.>

## Ce qui a été fait

- <Fait 1>
- <Fait 2>

## Décisions prises

- **<Décision>** : <raison en une phrase>

## Prochaines étapes

1. <Première action concrète pour redémarrer>
2. <Action suivante>

## Points ouverts et pièges

- <Question sans réponse, hypothèse non vérifiée, piège rencontré, piste abandonnée et pourquoi>

## Références

- `<chemin ou URL>` — <ce qu'on y trouve>

## Skills suggérés

- `<nom-du-skill>` — <quand l'appeler>
```

Dans « Skills suggérés », nommer les skills que l'agent suivant doit appeler avec l'outil Skill, d'après l'objectif de la prochaine session.
