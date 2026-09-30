# Utiliser un agent canonique avec Cursor

Cursor n'a pas d'équivalent direct à un « fichier de subagent » comme Claude Code ou Codex. Le mécanisme le plus proche pour packager un persona réutilisable est une règle à portée définie (`.mdc`).

## Pourquoi ne pas dupliquer

Les règles `.mdc` de Cursor supportent la mention `@fichier` : Cursor attache automatiquement le contenu de ce fichier au contexte de la règle quand elle se charge. C'est une fonctionnalité native, pas un contournement : la règle ne peut donc jamais diverger de sa source.

`description` doit rester écrite en clair : c'est ce que l'agent de Cursor lit pour décider si la règle est pertinente, avant d'attacher quoi que ce soit.

## Étapes

1. Frontmatter :

   ```yaml
   ---
   description: "Product Owner : transforme une idée ou une demande en User Stories exploitables"
   alwaysApply: false
   ---
   ```

   Ne pas renseigner `globs` sauf si le persona ne doit s'appliquer qu'à certains fichiers.

2. Corps : référencer le fichier canonique plutôt que de le coller :

   ```markdown
   @../../.agents/atlas-product.md

   Applique la persona ci-dessus telle quelle : son Périmètre, son Hors périmètre, son Processus et son Contrat de sortie.
   ```

3. Emplacement : `.cursor/rules/<nom>.mdc`

## Utilisation

- **Agent-Requested** : Cursor lit `description` et décide seul de charger la règle
- **Manuel** : mention explicite `@<nom>` dans le chat

## Différence avec Claude Code et Codex

Une règle Cursor injecte du contenu dans le contexte de l'agent *courant* : elle ne s'exécute pas dans une fenêtre de contexte isolée comme un subagent Claude Code ou un agent Codex.

La syntaxe `@fichier` dans les règles s'est comportée de façon incohérente selon les versions de Cursor — à vérifier avant de s'y fier : https://cursor.com/docs/context/skills
