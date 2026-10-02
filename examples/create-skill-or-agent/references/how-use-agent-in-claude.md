# Utiliser un agent canonique avec Claude Code

Comment transformer un persona canonique (`.agents/<nom>.md`) en subagent Claude Code **sans en copier le contenu**.

## Pourquoi ne pas dupliquer

Claude Code n'a pas de syntaxe d'inclusion pour le corps d'un subagent. Mais l'agent dispose de l'outil `Read` : le wrapper peut donc simplement lui demander de lire lui-même le fichier canonique, au lieu d'en maintenir une copie.

Seuls `description` (et `name`) doivent être écrits en clair dans le wrapper : c'est le seul signal que Claude utilise pour décider de déléguer automatiquement à cet agent, avant d'avoir lu le moindre fichier.

## Étapes

1. Frontmatter YAML, avec une `description` explicite :

   ```yaml
   ---
   name: atlas-product
   description: "Product Owner : transforme une idée ou une demande en User Stories exploitables."
   tools: Read, Grep, Glob
   model: inherit
   ---
   ```

   Mettre `description` entre guillemets dès qu'elle contient un deux-points, sinon le YAML est invalide.

2. Corps : une seule ligne qui pointe vers le fichier canonique, rien de plus :

   ```markdown
   Lis et applique la persona définie dans `.agents/atlas-product.md`. Respecte exactement son Périmètre, son Hors périmètre, son Processus et son Contrat de sortie.
   ```

3. Emplacement : `.claude/agents/<nom>.md` (partagé avec l'équipe via git) ou `~/.claude/agents/<nom>.md` (personnel).

## Utilisation

- Claude peut déléguer automatiquement en lisant `description`
- Ou invocation explicite : « Utilise l'agent `atlas-product` pour… »
- Au démarrage, l'agent lit d'abord le fichier canonique, puis l'applique : un appel d'outil de plus, mais le persona ne diverge jamais entre le wrapper et la source

## Modèle et effort par agent

Le frontmatter accepte `model` (alias `sonnet`, `opus`, `haiku`, `fable`, identifiant complet comme `claude-opus-5-5`, ou `inherit`) et `effort` (`low`, `medium`, `high`, `xhigh`, `max`). Les niveaux d'effort dépendent du modèle : Haiku n'en a pas, donc le champ est omis pour lui. Ordre de priorité du modèle : le paramètre passé à l'appel, puis le frontmatter, puis `CLAUDE_CODE_SUBAGENT_MODEL`, puis le modèle de la conversation.

| Agents | Modèle | Effort | Raison |
|---|---|---|---|
| Blueprint, Forge, Inspector | `opus` | `high` | Arbitrer une structure, produire un plan que Junior exécutera sans l'interpréter, trouver des bugs |
| Atlas | `sonnet` | `high` | Le grilling du besoin demande du raisonnement |
| Verifier, Slice, Specimen, Pulse, Refactor, Gatekeeper | `sonnet` | `medium` | Jugement sur des critères définis |
| Scribe, Junior | `sonnet` | `low` | Rédiger à partir du code, exécuter un plan précis |
| Styx, Courier | `haiku` | (aucun) | Tâches mécaniques |

Pour vérifier ce qui tourne : `/tasks` affiche le modèle et l'effort de chaque sous-agent, `/effort` celui de la session. Un sous-agent reprend la réflexion étendue de la conversation : il n'existe pas de réglage de réflexion par agent. Blueprint tourne en session principale : on fixe aussi son effort au lancement (`claude --agent blueprint-architect --effort high`), car la documentation ne dit pas que celui du frontmatter s'y applique.

Source — vérifier les noms de champs actuels avant de s'y fier : https://code.claude.com/docs/en/sub-agents
