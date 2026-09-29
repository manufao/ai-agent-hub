# Utiliser un agent canonique avec Codex CLI

Comment transformer un persona canonique (`.agents/<nom>.md`) en agent personnalisé Codex CLI **sans en copier le contenu**.

## Pourquoi ne pas dupliquer

Le TOML n'a pas de syntaxe d'inclusion de fichier, mais Codex peut lire les fichiers du dépôt : `developer_instructions` peut se limiter à une consigne de lecture du fichier canonique, au lieu d'en maintenir une copie.

`name` et `description` restent écrits en clair : ils permettent d'invoquer l'agent par son nom et indiquent à Codex quand il est pertinent, avant toute lecture de fichier.

## Étapes

```toml
name = "atlas-product"
description = "Product Owner : transforme une idée ou une demande en User Stories exploitables"

developer_instructions = """
Lis et applique la persona définie dans .agents/atlas-product.md avant de faire quoi que ce soit d'autre. Respecte exactement son Périmètre, son Hors périmètre, son Processus et son Contrat de sortie.
"""
```

Emplacement : `.codex/agents/<nom>.toml` (projet) ou `~/.codex/agents/<nom>.toml` (global).

## Utilisation

Codex ne délègue pas automatiquement comme Claude Code. On invoque l'agent explicitement par son `name`, dans un prompt ou dans `AGENTS.md` : *« Demande à `atlas-product` de rédiger la User Story de cette demande »*.

Source — vérifier les noms de champs actuels avant de s'y fier : https://developers.openai.com/codex/subagents
