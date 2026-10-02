# Utiliser un agent canonique avec opencode

Comment transformer un persona canonique (`.agents/<nom>.md`) en agent opencode **sans en copier le contenu**, et choisir un modèle différent par agent.

## Pourquoi un wrapper

opencode lit ses agents dans `.opencode/agents/<nom>.md` (projet) ou `~/.config/opencode/agents/` (global). Il ne lit ni `.agents/<nom>.md` ni `.claude/agents/`. Comme pour les autres outils, le wrapper se limite à une consigne de lecture du fichier canonique ; le frontmatter porte ce qui est propre à opencode : `description`, `mode`, `model`, `temperature` et `permission`.

Les skills n'ont pas besoin de wrapper : opencode lit `.agents/skills/` nativement.

## Étapes

1. Créer `.opencode/agents/<nom>.md` :

   ```markdown
   ---
   description: "Même description que les autres wrappers"
   mode: subagent
   model: ollama/qwen3-coder-agent
   temperature: 0.2
   permission:
     edit: deny
     bash:
       "*": deny
   ---

   Lis et applique la persona définie dans `.agents/<nom>.md` avant de faire quoi que ce soit d'autre. Respecte exactement son Périmètre, son Hors périmètre, son Processus et son Contrat de sortie.
   ```

2. `mode: primary` pour un agent avec lequel on dialogue directement (Atlas, Blueprint : ils posent leurs questions à l'utilisateur), `mode: subagent` pour les autres, que l'agent principal invoque ou qu'on appelle par `@nom`.
3. Les `permission.bash` se lisent de haut en bas : la règle générale `"*"` d'abord, les exceptions ensuite. Elles sont **appliquées par l'outil**, contrairement aux limites écrites dans une persona.

## Modèles par agent

La configuration de départ vise un Mac Intel (i9, 32 Go de RAM, sans puce Apple) : les modèles tournent sur le processeur seul, donc on garde quelques modèles, adaptés au rôle de chaque agent plutôt qu'un gros modèle partout.

| Alias Ollama | Modèle de base | Agents | Pourquoi |
|---|---|---|---|
| `qwen3-general` | `qwen3:14b` (9 Go) | Atlas, Verifier, Slice | Rédiger et relire des tickets, recueillir un besoin : pas de connaissance de code nécessaire |
| `qwen3-coder-agent` | `qwen3-coder:30b` (MoE, environ 3 milliards de paramètres actifs, 19 Go) | Blueprint, Forge, Specimen, Pulse, Inspector, Refactor, Gatekeeper, Scribe | Lire du code, arbitrer une structure, planifier, relire |
| `qwen-coder-light` | `qwen2.5-coder:7b` (5 Go) | Junior | Il exécute un plan déjà précis : un petit modèle spécialisé code suffit, et ménage les ressources |
| `qwen3-light` | `qwen3:8b` (5 Go) | Styx, Courier | Enchaîner des commandes `gh` et `git` : tâches mécaniques, un petit modèle suffit pour commencer |

Pour changer le modèle d'un agent, modifier la ligne `model:` de son fichier.

```bash
ollama pull qwen3:14b
ollama pull qwen3-coder:30b
ollama pull qwen2.5-coder:7b
ollama pull qwen3:8b

printf 'FROM qwen3:14b\nPARAMETER num_ctx 32768\n' > /tmp/Modelfile.general
printf 'FROM qwen3-coder:30b\nPARAMETER num_ctx 32768\n' > /tmp/Modelfile.coder
printf 'FROM qwen2.5-coder:7b\nPARAMETER num_ctx 32768\n' > /tmp/Modelfile.light
printf 'FROM qwen3:8b\nPARAMETER num_ctx 32768\n' > /tmp/Modelfile.small
ollama create qwen3-general -f /tmp/Modelfile.general
ollama create qwen3-coder-agent -f /tmp/Modelfile.coder
ollama create qwen-coder-light -f /tmp/Modelfile.light
ollama create qwen3-light -f /tmp/Modelfile.small
```

Les alias existent pour porter un contexte de 32 000 jetons : celui d'Ollama par défaut est trop court pour une persona et ses skills. Le fournisseur `ollama` est déclaré dans `opencode.json` à la racine.

À vérifier à l'installation, car ces points n'ont pas été testés :
- les noms de tags des modèles et leur prise en charge des outils (`ollama show <modèle>`), surtout pour `qwen2.5-coder:7b` : un modèle sans appel d'outils ne peut pas modifier de fichiers, et Junior devrait alors passer sur `qwen3-coder-agent` ;
- la vitesse réelle sur ce processeur, et la mémoire quand deux modèles sont chargés ;
- le format `ollama/<alias>` dans `model:`.

Pour un agent qui doit raisonner vite, un modèle hébergé reste possible : remplacer `model:` par `<fournisseur>/<modèle>` après avoir configuré ce fournisseur.

## Utiliser ces agents dans un autre dépôt

Les wrappers disent « lis `.agents/<nom>.md` », un chemin relatif : dans un autre dépôt, ce fichier n'existe pas. Le script `scripts/sync-agents.sh` règle cela une fois par machine :

```bash
scripts/sync-agents.sh opencode            # agents dans ~/.config/opencode/agents, skills dans ~/.agents/skills
scripts/sync-agents.sh claude-code         # agents dans ~/.claude/agents, skills dans ~/.claude/skills
scripts/sync-agents.sh codex               # agents dans ~/.codex/agents, skills dans ~/.agents/skills
scripts/sync-agents.sh cursor ~/mon-projet # Cursor n'a pas d'emplacement global : un projet à la fois
scripts/sync-agents.sh --dry-run opencode  # voir ce qui serait fait, sans rien écrire
```

Il copie chaque wrapper en remplaçant le chemin relatif par le chemin absolu de ce dépôt, et relie chaque skill par un lien symbolique. Il ne remplace jamais un dossier de skill existant qui n'est pas un lien. À relancer après chaque modification d'un agent ou si ce dépôt change d'emplacement.
