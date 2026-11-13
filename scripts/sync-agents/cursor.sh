# Cursor : pas d'emplacement global, un projet à la fois. Règles dans
# <projet>/.cursor/rules, skills dans <projet>/.agents/skills.

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
CHECK_DIR="$PROJECT"

after_sync() {
  echo "Ces fichiers sont dans $PROJECT : pensez à les exclure de git (.git/info/exclude)." >&2
}
