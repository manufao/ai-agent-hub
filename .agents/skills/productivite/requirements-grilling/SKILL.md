---
name: requirements-grilling
description: "À utiliser pour éprouver une demande, un plan ou une décision floue en interrogeant l'utilisateur méthodiquement jusqu'à une compréhension partagée, avant de rédiger une User Story, un plan ou une ADR. Déclencheurs : « grille-moi », « challenge mon idée », demande incomplète."
---

# Requirements grilling

Interroger l'utilisateur sans relâche sur une idée, un plan ou une décision, jusqu'à ce qu'il ne reste plus aucune zone d'ombre. Le skill évite d'écrire une story, un plan ou une ADR à partir d'hypothèses non dites.

## Quand l'utiliser

- Une demande tient en une phrase et cache plusieurs décisions
- L'utilisateur veut éprouver son idée, son plan ou un choix technique avant de s'engager
- Avant `user-story-writing`, `implementation-plan` ou `adr-writing`, quand le besoin n'est pas clair
- L'utilisateur emploie un déclencheur du type « grille-moi » ou « challenge mon plan »

## Principe : l'arbre de décisions

Chaque décision ouvre les décisions qui en dépendent. Cartographier cet arbre, puis le parcourir par **tours**.

La **frontière** est l'ensemble des décisions dont les prérequis sont déjà tranchés : ce sont les questions qu'on peut poser maintenant sans deviner des réponses qu'on n'a pas encore entendues.

## Instructions

1. Reformuler la demande en une phrase, puis dresser la liste des décisions à prendre et leurs dépendances.
2. Chercher soi-même les faits (fichiers, code, configuration, documentation) avant de poser une question. Ne jamais demander à l'utilisateur ce qu'on peut lire dans le dépôt. Si un sous-agent est disponible, lui confier la recherche.
3. Poser toute la frontière en un seul tour : numéroter les questions et donner pour chacune la réponse recommandée. Une question qui dépend d'une autre question encore ouverte dans le même tour attend le tour suivant.
4. Attendre les réponses. Ne pas enchaîner avec des suppositions.
5. Recalculer la frontière : les décisions tranchées débloquent celles qui en dépendaient. Poser le tour suivant.
6. S'arrêter quand la frontière est vide : chaque branche est visitée, rien n'est resté supposé en silence.
7. Résumer les décisions prises et les points laissés ouverts, puis demander confirmation. Ne rien produire ni modifier avant que l'utilisateur confirme la compréhension partagée.

Les faits sont l'affaire de l'agent. Les décisions restent à l'utilisateur : les lui poser, attendre sa réponse, ne jamais trancher à sa place.

## Format de sortie

À chaque tour :

```
❓ **Q1** - **<titre de la question>** : <énoncé, éventuellement plusieurs paragraphes ou un choix multiple>

➡️ <réponse recommandée, avec la raison en une phrase>

---

❓ **Q2** - **<titre de la question>** : <énoncé>

➡️ <réponse recommandée>
```

En fin de session :

- **Décisions prises** : liste courte, une ligne par décision
- **Points ouverts** : ce qui reste à trancher, avec qui
- **Confirmation** : « Est-ce bien notre compréhension partagée ? »
