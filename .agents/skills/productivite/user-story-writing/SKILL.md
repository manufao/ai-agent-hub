---
name: user-story-writing
description: "À utiliser pour rédiger une User Story à partir d'une demande ou d'une idée : valeur, règles métier, hors périmètre et questions ouvertes."
---

# Rédiger une User Story

Une story bien écrite dit qui a besoin de quoi, pourquoi, et où elle s'arrête. Ce skill donne un format fixe pour que toutes les stories se lisent de la même façon.

## Quand l'utiliser

- Une demande client, une idée ou un besoin business doit devenir un ticket développable
- Une story existante est trop vague pour être relue par Verifier

## Instructions

1. Identifier l'utilisateur précis (un rôle, pas « les utilisateurs ») et le problème qu'il rencontre.
2. Écrire l'énoncé : **En tant que** [rôle], **je veux** [action observable], **afin de** [bénéfice mesurable].
3. Lister les règles métier connues, une par ligne, chacune vérifiable.
4. Écrire le hors périmètre : ce qu'on ne fait volontairement pas dans cette story.
5. Noter les hypothèses, puis les questions ouvertes qui bloquent ou modifient la story. Ne jamais combler un trou par une règle inventée.
6. Vérifier qu'une seule valeur est livrée ; sinon le signaler pour un découpage.

## Format de sortie

```markdown
## US — [titre court à l'infinitif]

**En tant que** [rôle], **je veux** [action], **afin de** [bénéfice].

### Contexte
[Deux ou trois phrases : déclencheur et situation actuelle]

### Règles métier
- [Règle vérifiable]

### Hors périmètre
- [Ce qui n'est pas traité ici]

### Hypothèses
- [Hypothèse à confirmer]

### Questions ouvertes
- [Question, et qui peut y répondre]
```
