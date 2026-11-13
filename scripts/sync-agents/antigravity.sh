# Antigravity : un dossier par agent (~/.gemini/config/agents/<nom>/agent.md),
# skills dans ~/.gemini/config/skills. Le modèle est celui de la session.

SRC="$ROOT/.agents/agents"
EXT="md"
AGENTS_DST="$HOME/.gemini/config/agents"
SKILLS_DST="$HOME/.gemini/config/skills"
CHECK_DIR="$HOME/.gemini"

# Les wrappers sont rangés en <nom>/agent.md, pas à plat
install_agents() {
  local dir name target_dir
  for dir in "$SRC"/*/; do
    [ -f "$dir/agent.md" ] || continue
    name="$(basename "$dir")"
    target_dir="$AGENTS_DST/$name"
    say "agent  $target_dir/agent.md"
    if [ "$DRY_RUN" = 0 ]; then
      mkdir -p "$target_dir"
      install_agent "$dir/agent.md" "$target_dir/agent.md"
    fi
    agents=$((agents + 1))
  done
}
