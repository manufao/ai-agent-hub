# Utiliser un agent canonique avec opencode

Comment transformer un persona canonique (`.agents/<nom>.md`) en agent opencode **sans en copier le contenu**, avec son propre modèle et ses propres permissions.

## Pourquoi un wrapper

opencode lit ses agents dans `.opencode/agents/<nom>.md` (projet) ou `~/.config/opencode/agents/` (global). Il ne lit ni `.agents/<nom>.md` ni `.claude/agents/`. Comme pour les autres outils, le wrapper se limite à une consigne de lecture du fichier canonique ; le frontmatter porte ce qui est propre à opencode : `description`, `mode`, `model`, `temperature` et `permission`.

Les skills n'ont pas besoin de wrapper : opencode lit `.agents/skills/` nativement.

## Étapes

1. Créer `.opencode/agents/<nom>.md` :

   ```markdown
   ---
   description: "Même description que les autres wrappers"
   mode: subagent
   model: <fournisseur>/<modèle>
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

## Choisir le modèle de chaque agent

Chaque agent peut avoir son propre modèle, au format `<fournisseur>/<modèle>` : le fournisseur est la clé déclarée dans la section `provider` de `opencode.json`, le modèle une clé de ses `models`. Sans `model`, un agent principal utilise le modèle global et un sous-agent celui de l'agent principal qui l'invoque.

Ce dépôt n'impose aucun modèle : le choix revient à celui qui l'utilise, selon sa machine, son budget et ses fournisseurs. Les fournisseurs se configurent comme l'explique la [documentation d'opencode](https://opencode.ai/docs/providers). Quelques critères pour répartir les rôles :

| Rôle | Agents | Ce qu'il faut |
|---|---|---|
| Recueillir un besoin, rédiger et relire des tickets | Atlas, Verifier, Slice | Un modèle généraliste, sans connaissance de code particulière |
| Lire du code, arbitrer, planifier, relire | Blueprint, Forge, Specimen, Pulse, Inspector, Refactor, Gatekeeper, Scribe | Un modèle solide en code et en raisonnement |
| Exécuter un plan précis | Junior | Un modèle de code plus léger, fiable sur les appels d'outils |
| Enchaîner des commandes `gh` et `git` | Styx, Courier | Un petit modèle suffit |

Dans tous les cas, le modèle doit gérer les appels d'outils : les agents s'en servent pour lire et modifier des fichiers et lancer des commandes. Avec un modèle local, vérifier aussi que la fenêtre de contexte est assez longue pour une persona et ses skills.

Les wrappers et le `opencode.json` de ce dépôt contiennent une configuration d'exemple à remplacer par la vôtre.

### La configuration d'exemple : Ollama en local

Les clés de `models` dans `opencode.json` sont les tags Ollama eux-mêmes (`qwen3:14b`, pas un alias). Il suffit donc de télécharger les modèles, sans créer de Modelfile :

```bash
ollama pull qwen3-coder:30b   # Forge, Specimen, Inspector, Refactor, Junior, Pulse
ollama pull qwen3:30b         # Blueprint (mode thinking)
ollama pull qwen3:14b         # Atlas, Verifier, Slice, Scribe, Styx, Courier
ollama pull qwen3:8b          # Gatekeeper
```

La fenêtre de contexte se règle côté Ollama, pas dans `opencode.json` : opencode passe par l'API compatible OpenAI (`/v1`), qui ignore `num_ctx`. Par défaut elle vaut 4096 jetons, trop peu pour une persona et ses skills : les appels d'outils échouent. Réglez-la à 32k une fois par machine :

- **Avec l'application Ollama** (recommandé) : dans ses réglages, placer « Context length » sur 32k. Le réglage est conservé après un redémarrage.
- **Sans l'application** : quitter d'abord l'application Ollama, qui occupe déjà le port 11434, puis lancer le serveur dans un terminal à garder ouvert :

  ```bash
  OLLAMA_CONTEXT_LENGTH=32768 ollama serve
  ```

Pour vérifier, lancer un modèle puis `ollama ps` : la colonne `CONTEXT` doit afficher 32768.

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
