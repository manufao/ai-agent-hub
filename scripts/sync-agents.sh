#!/usr/bin/env bash
#
# Installe les agents et les skills de ce dépôt pour un outil, afin de les
# utiliser depuis n'importe quel autre dépôt de la machine.
#
# Les wrappers du dépôt disent « lis .agents/<nom>.md », un chemin relatif qui
# n'existe pas ailleurs. Le script copie donc chaque wrapper en remplaçant ce
# chemin par le chemin absolu de ce dépôt, et relie les skills par des liens
# symboliques. À relancer après chaque modification d'un agent, ou si ce dépôt
# change d'emplacement.

set -euo pipefail

usage() {
  cat <<'EOF'
Usage : scripts/sync-agents.sh [--dry-run] <outil> [dossier-projet]

Outils :
  claude-code   agents dans ~/.claude/agents, skills dans ~/.claude/skills
  opencode      agents dans ~/.config/opencode/agents, skills dans ~/.agents/skills
  codex         agents dans ~/.codex/agents, skills dans ~/.agents/skills
  cursor        pas d'emplacement global : indiquer le dossier du projet cible
                (règles dans <projet>/.cursor/rules, skills dans <projet>/.agents/skills)

Options :
  -n, --dry-run   affiche ce qui serait fait, sans rien écrire
  -h, --help      affiche cette aide
EOF
}

DRY_RUN=0
case "${1:-}" in
  -h | --help)
    usage
    exit 0
    ;;
  -n | --dry-run)
    DRY_RUN=1
    shift
    ;;
esac

TOOL="${1:-}"
PROJECT="${2:-}"

if [ -z "$TOOL" ]; then
  usage >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

case "$TOOL" in
  claude-code)
    SRC="$ROOT/.claude/agents"
    EXT="md"
    AGENTS_DST="$HOME/.claude/agents"
    SKILLS_DST="$HOME/.claude/skills"
    ;;
  opencode)
    SRC="$ROOT/.opencode/agents"
    EXT="md"
    AGENTS_DST="$HOME/.config/opencode/agents"
    SKILLS_DST="$HOME/.agents/skills"
    ;;
  codex)
    SRC="$ROOT/.codex/agents"
    EXT="toml"
    AGENTS_DST="$HOME/.codex/agents"
    SKILLS_DST="$HOME/.agents/skills"
    ;;
  cursor)
    if [ -z "$PROJECT" ]; then
      echo "cursor n'a pas d'emplacement global : indiquer le dossier du projet cible." >&2
      usage >&2
      exit 1
    fi
    if [ ! -d "$PROJECT" ]; then
      echo "Dossier introuvable : $PROJECT" >&2
      exit 1
    fi
    PROJECT="$(cd "$PROJECT" && pwd)"
    SRC="$ROOT/.cursor/rules"
    EXT="mdc"
    AGENTS_DST="$PROJECT/.cursor/rules"
    SKILLS_DST="$PROJECT/.agents/skills"
    ;;
  *)
    echo "Outil inconnu : $TOOL" >&2
    usage >&2
    exit 1
    ;;
esac

if [ ! -d "$SRC" ]; then
  echo "Dossier d'agents introuvable : $SRC" >&2
  exit 1
fi

say() {
  if [ "$DRY_RUN" = 1 ]; then
    echo "[dry-run] $*"
  else
    echo "$*"
  fi
}

# --- Agents : on remplace le chemin relatif de la persona par un chemin absolu
[ "$DRY_RUN" = 1 ] || mkdir -p "$AGENTS_DST"
agents=0
for file in "$SRC"/*."$EXT"; do
  [ -f "$file" ] || continue
  name="$(basename "$file")"
  say "agent  $AGENTS_DST/$name"
  if [ "$DRY_RUN" = 0 ]; then
    ROOT="$ROOT" perl -pe 's#(?:\.\./\.\./|(?<=[`\s]))\.agents/#$ENV{ROOT}/.agents/#g' "$file" >"$AGENTS_DST/$name"
  fi
  agents=$((agents + 1))
done

# --- Skills : un lien symbolique par skill, vers ce dépôt
[ "$DRY_RUN" = 1 ] || mkdir -p "$SKILLS_DST"
skills=0
skipped=0
for dir in "$ROOT"/.agents/skills/*/*/; do
  dir="${dir%/}"
  [ -f "$dir/SKILL.md" ] || continue
  name="$(basename "$dir")"
  target="$SKILLS_DST/$name"
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    echo "skill  $target existe déjà et n'est pas un lien : ignoré" >&2
    skipped=$((skipped + 1))
    continue
  fi
  say "skill  $target -> $dir"
  if [ "$DRY_RUN" = 0 ]; then
    ln -sfn "$dir" "$target"
  fi
  skills=$((skills + 1))
done

say "$agents agents et $skills skills pour $TOOL ($skipped ignorés)"

if [ "$TOOL" = "cursor" ]; then
  echo "Ces fichiers sont dans $PROJECT : pensez à les exclure de git (.git/info/exclude)." >&2
fi
