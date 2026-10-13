# Utiliser un agent canonique avec Antigravity

Comment transformer un persona canonique (`.agents/<nom>.md`) en agent Antigravity **sans en copier le contenu**.

## Pourquoi ne pas dupliquer

Antigravity supporte les sous-agents déclarés en Markdown avec un frontmatter YAML dans un sous-dossier par agent (`<nom>/agent.md`). Tout comme pour Claude Code ou Codex, l'agent dispose des outils nécessaires pour lire les fichiers du dépôt : le wrapper se limite donc à lui donner l'ordre de lire le fichier canonique avant d'agir, évitant toute divergence entre la source et le wrapper.

Dans le frontmatter, `name` et `description` sont obligatoires : c'est ce qu'Antigravity évalue pour la découverte et la délégation des sous-agents.

## Format d'un wrapper

1. **Emplacement** : `.agents/agents/<nom>/agent.md` (dans ce dépôt).

2. **Frontmatter YAML** : `name` et `description` :

   ```yaml
   ---
   name: atlas-product
   description: "Product Owner : transforme une idée ou une demande en User Stories exploitables"
   ---
   ```

   Mettre `description` entre guillemets dès qu'elle contient un deux-points pour garantir un YAML valide. Le modèle n'a pas besoin d'être spécifié : Antigravity hérite par défaut du modèle actif dans votre session CLI ou IDE.

3. **Corps** : un titre H1 suivi de la consigne pointant vers le persona canonique :

   ```markdown
   # Atlas Product

   Lis et applique la persona définie dans `.agents/atlas-product.md` avant de faire quoi que ce soit d'autre. Respecte exactement son Périmètre, son Hors périmètre, son Processus et son Contrat de sortie.
   ```

## Utilisation

- **Lister les agents** : la commande `agy agents` affiche la liste des agents disponibles (découverts dans le workspace et dans la configuration globale).
- **Session avec un agent spécifique** : `agy --agent <nom>` démarre une session directement configurée avec cet agent.
- **Délégation** : l'agent principal peut invoquer les sous-agents déclarés selon les besoins de la tâche.

## Utiliser ces agents dans un autre dépôt

Les wrappers locaux contiennent des chemins relatifs (`.agents/<nom>.md`) valables uniquement dans ce dépôt. Pour les rendre accessibles depuis n'importe quel autre projet sur votre machine sans y ajouter de fichiers :

```bash
scripts/sync-agents.sh antigravity              # installe les agents dans ~/.gemini/config/agents et lie les skills dans ~/.gemini/config/skills
scripts/sync-agents.sh --dry-run antigravity    # prévisualiser sans rien modifier
```

Le script installe chaque agent dans son dossier utilisateur dédié (`~/.gemini/config/agents/<nom>/agent.md`) en remplaçant les chemins relatifs par les chemins absolus vers ce clone, et référence les skills par des liens symboliques dans `~/.gemini/config/skills/`. Aucun fichier n'est donc écrit ni committé dans vos autres projets.
