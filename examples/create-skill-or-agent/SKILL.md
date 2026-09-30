---
name: create-skill-or-agent
description: "Explique comment ajouter un nouveau skill (format Agent Skills) ou un nouvel agent (persona canonique) à ce dépôt, compatible avec Claude Code, Codex CLI, Cursor et Gemini CLI. À utiliser pour packager une nouvelle expertise ou un nouveau persona réutilisable."
---

# Créer un skill ou un agent dans ce dépôt

> Ceci est un **exemple** d'implémentation, pas un skill actif : il vit dans `examples/`, en dehors de `.agents/skills/`, donc aucun outil ne le détecte et il n'a ni wrapper ni lien symbolique.

Ce dépôt suit deux conventions distinctes, volontairement séparées :

- **Un agent** (`.agents/<nom>.md`) : un persona complet (rôle, périmètre, processus), invoqué explicitement ou sollicité automatiquement. Il n'existe pas de standard commun entre les outils : chaque agent a donc un fichier canonique, plus un petit wrapper par outil qui le référence.
- **Un skill** (`.agents/skills/<catégorie>/<nom>/SKILL.md`) : une expertise ou une procédure packagée au format ouvert [Agent Skills](https://agentskills.io). Un seul fichier suffit, lisible tel quel par Claude Code, Codex, Cursor et Gemini CLI (tous scannent `.agents/skills/`, sauf Claude Code, voir plus bas).

## Quand créer un skill plutôt qu'un agent

- Une procédure qu'on répète (« relire ce type de PR », « générer ce type de rapport ») → **skill**
- Un rôle complet, avec ses propres limites et son format de sortie, invoqué comme un collaborateur dédié → **agent**

## Créer un skill

1. Choisir une catégorie existante (`ingenierie`, `productivite`, `marketing`) ou en proposer une nouvelle
2. Créer `.agents/skills/<catégorie>/<nom-en-kebab-case>/SKILL.md` :

   ```yaml
   ---
   name: mon-skill
   description: "Ce que fait le skill, ET quand l'utiliser, cas principal en premier (c'est le seul signal de déclenchement). À mettre entre guillemets s'il contient un deux-points."
   ---

   # Titre du skill

   [Un paragraphe : ce que fait le skill et pourquoi le packager plutôt que retaper les instructions à chaque fois.]

   ## Quand l'utiliser

   - [Déclencheur concret 1]
   - [Déclencheur concret 2]

   ## Instructions

   1. [Étape]
   2. [Étape]
   3. [Étape qui vérifie le résultat]

   ## Format de sortie

   [Forme exacte de ce qui doit être renvoyé.]
   ```

3. Fichiers annexes facultatifs : `scripts/`, `references/`, `assets/` à côté de `SKILL.md`, référencés par leur nom dans le corps (jamais chargés automatiquement)
4. **Pour Claude Code uniquement** : Claude Code ne scanne pas `.agents/skills/`, seulement `.claude/skills/`. Créer un lien symbolique (une fois par skill) :

   ```bash
   ln -s ../../.agents/skills/<catégorie>/<nom> .claude/skills/<nom>
   ```

   Codex CLI, Cursor et Gemini CLI découvrent `.agents/skills/` nativement : aucune étape supplémentaire pour eux.

## Créer un agent

1. Créer `.agents/<nom>.md` avec cette structure : Rôle (une phrase, sans « et » qui cacherait un second rôle) → Périmètre → Hors périmètre → Processus → Contrat de sortie
2. Rester court et de haut niveau : un persona qui tente de couvrir tous les cas devient fragile et coûteux à maintenir. Voir [`.agents/atlas-product.md`](../../.agents/atlas-product.md) ou [`.agents/inspector-review.md`](../../.agents/inspector-review.md) comme exemples
3. Créer un wrapper pour chaque outil utilisé, qui référence le fichier canonique au lieu de le dupliquer :
   - Claude Code : `.claude/agents/<nom>.md` — voir [`references/how-use-agent-in-claude.md`](references/how-use-agent-in-claude.md)
   - Codex CLI : `.codex/agents/<nom>.toml` — voir [`references/how-use-agent-in-codex.md`](references/how-use-agent-in-codex.md)
   - Cursor : `.cursor/rules/<nom>.mdc` — voir [`references/how-use-agent-in-cursor.md`](references/how-use-agent-in-cursor.md)

## Avant de créer quoi que ce soit : est-ce vraiment nécessaire ?

| Besoin | Solution |
|---|---|
| Une règle à appliquer toujours, sans exception | Un hook ou une règle de permission |
| Une connaissance contextuelle appliquée avec jugement | Un **skill** |
| Une tâche autonome qui mérite sa propre fenêtre de contexte | Un **agent** |
| Une consigne valable pour toute session dans ce dépôt | `AGENTS.md` à la racine, court |

## Checklist avant livraison

- [ ] `name` et `description` renseignés (skill), ou Rôle / Périmètre / Hors périmètre / Processus / Contrat de sortie remplis (agent)
- [ ] `description` dit clairement QUAND l'utiliser, cas principal en premier
- [ ] Contenu volumineux déplacé dans un fichier annexe plutôt que d'alourdir le fichier principal
- [ ] Wrapper créé pour chaque outil visé (agent), ou lien symbolique créé pour Claude Code (skill)
