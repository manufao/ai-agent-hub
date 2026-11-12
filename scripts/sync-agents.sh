#!/usr/bin/env bash
#
# Installe les agents et les skills de ce dépôt pour un outil, afin de les
# utiliser depuis n'importe quel autre dépôt de la machine.
#
# Les wrappers du dépôt disent « lis .agents/<nom>.md », une indirection qu'un
# agent peut sauter ou mal suivre. Le script installe donc chaque wrapper avec
# son en-tête (modèle, effort, outils…) suivi du contenu de la persona, sans
# son front-matter : l'agent démarre avec sa persona, sans fichier à lire. Les
# chemins .agents/ restants sont réécrits en chemins absolus vers ce dépôt, et
# les skills sont reliés par des liens symboliques. À relancer après chaque
# modification d'un agent ou d'une persona (git pull compris), ou si ce dépôt
# change d'emplacement.
#
# Ce fichier ne fait qu'orchestrer :
#   scripts/sync-agents/common.sh   fonctions partagées (persona, agents, skills)
#   scripts/sync-agents/<outil>.sh  emplacements et étapes propres à l'outil

set -euo pipefail

usage() {
  cat <<'EOF'
Usage : scripts/sync-agents.sh [--dry-run] [--force] <outil> [dossier-projet]

Outils :
  claude-code   agents dans ~/.claude/agents, skills dans ~/.claude/skills
  opencode      agents dans ~/.config/opencode/agents, skills dans ~/.agents/skills,
                fournisseurs de modèles fusionnés dans ~/.config/opencode/opencode.json
  codex         agents dans ~/.codex/agents, skills dans ~/.agents/skills
  antigravity   agents dans ~/.gemini/config/agents/<nom>/agent.md, skills dans ~/.gemini/config/skills
  cursor        pas d'emplacement global : indiquer le dossier du projet cible
                (règles dans <projet>/.cursor/rules, skills dans <projet>/.agents/skills)

Options :
  -n, --dry-run   affiche ce qui serait fait, sans rien écrire
  -f, --force     crée les dossiers même si le dossier racine de l'outil n'existe pas
  -h, --help      affiche cette aide
EOF
}

DRY_RUN=0
FORCE=0
while [ $# -gt 0 ]; do
  case "$1" in
    -h | --help)
      usage
      exit 0
      ;;
    -n | --dry-run)
      DRY_RUN=1
      shift
      ;;
    -f | --force)
      FORCE=1
      shift
      ;;
    *)
      break
      ;;
  esac
done

TOOL="${1:-}"
PROJECT="${2:-}"

if [ -z "$TOOL" ]; then
  usage >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS_DIR="$ROOT/scripts/sync-agents"

# Un nom d'outil sert de nom de fichier : on refuse tout ce qui n'est pas un outil connu
case "$TOOL" in
  */* | common | .*) TOOL_FILE="" ;;
  *) TOOL_FILE="$TOOLS_DIR/$TOOL.sh" ;;
esac
if [ -z "$TOOL_FILE" ] || [ ! -f "$TOOL_FILE" ]; then
  echo "Outil inconnu : $TOOL" >&2
  usage >&2
  exit 1
fi

# shellcheck source=sync-agents/common.sh
. "$TOOLS_DIR/common.sh"
# shellcheck source=/dev/null
. "$TOOL_FILE"

if [ ! -d "$SRC" ]; then
  echo "Dossier d'agents introuvable : $SRC" >&2
  exit 1
fi

if [ ! -d "$CHECK_DIR" ] && [ "$FORCE" = 0 ]; then
  echo "Dossier racine introuvable pour $TOOL : $CHECK_DIR" >&2
  echo "L'outil ne semble pas installé ou configuré sur cette machine. Utilisez --force (-f) pour forcer." >&2
  exit 1
fi

agents=0
skills=0
skipped=0

[ "$DRY_RUN" = 1 ] || mkdir -p "$AGENTS_DST"
install_agents

[ "$DRY_RUN" = 1 ] || mkdir -p "$SKILLS_DST"
install_skills

say "$agents agents et $skills skills pour $TOOL ($skipped ignorés)"

after_sync
