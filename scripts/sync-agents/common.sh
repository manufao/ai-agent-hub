# Fonctions communes à tous les outils, chargées par scripts/sync-agents.sh.
#
# Chaque fichier d'outil (scripts/sync-agents/<outil>.sh) est chargé après
# celui-ci. Il définit les variables SRC, EXT, AGENTS_DST, SKILLS_DST et
# CHECK_DIR, et peut redéfinir install_agents et after_sync.

say() {
  if [ "$DRY_RUN" = 1 ]; then
    echo "[dry-run] $*"
  else
    echo "$*"
  fi
}

# Remplace les chemins relatifs .agents/ par des chemins absolus vers ce dépôt
rewrite_paths() {
  ROOT="$ROOT" perl -pe 's#(?:\.\./\.\./|(?<=[`\s]))\.agents/#$ENV{ROOT}/.agents/#g' "$@"
}

# Remplace le corps du wrapper par la persona qu'il référence, sans son
# front-matter. Pour codex (EXT=toml), la persona devient la valeur de
# developer_instructions.
inline_persona() {
  ROOT="$ROOT" EXT="$EXT" perl -e '
    my $file = $ARGV[0];
    open my $wh, "<", $file or die "$file : $!\n";
    my $wrapper = do { local $/; <$wh> };
    $wrapper =~ m{\.agents/([A-Za-z0-9_-]+)\.md} or die "Aucune persona référencée dans $file\n";
    my $path = "$ENV{ROOT}/.agents/$1.md";
    open my $ph, "<", $path or die "Persona introuvable : $path\n";
    my $persona = do { local $/; <$ph> };
    $persona =~ s/\A---\n.*?\n---\n//s;
    $persona =~ s/\A\s+//;
    $persona =~ s/\s+\z/\n/;
    if ($ENV{EXT} eq "toml") {
      die "La persona $path contient des triples apostrophes\n" if $persona =~ /\x27\x27\x27/;
      $wrapper =~ s/^developer_instructions\s*=\s*""".*?"""/developer_instructions = \x27\x27\x27\n${persona}\x27\x27\x27/ms
        or die "developer_instructions introuvable dans $file\n";
      print $wrapper;
    } else {
      $wrapper =~ m{\A(---\n.*?\n---\n)(.*)\z}s or die "Front-matter introuvable dans $file\n";
      my ($front, $body) = ($1, $2);
      my @extra = grep {
        !/\A# / && !/persona (définie dans|ci-dessus)/ && !/\A@\S*\.agents\/[A-Za-z0-9_-]+\.md\z/
      } grep { /\S/ } map { s/\A\s+|\s+\z//gr } split /\n\s*\n/, $body;
      print "$front\n$persona";
      print "\n", join("\n\n", @extra), "\n" if @extra;
    }
  ' "$1"
}

# Écrit dans $2 le wrapper $1 suivi de sa persona
install_agent() {
  local content
  content="$(inline_persona "$1")"
  printf '%s\n' "$content" | rewrite_paths >"$2"
}

# Agents : un fichier <nom>.<EXT> par agent, copié à plat dans AGENTS_DST.
# Redéfinie par les outils qui rangent leurs agents autrement.
install_agents() {
  local file name
  for file in "$SRC"/*."$EXT"; do
    [ -f "$file" ] || continue
    name="$(basename "$file")"
    say "agent  $AGENTS_DST/$name"
    [ "$DRY_RUN" = 1 ] || install_agent "$file" "$AGENTS_DST/$name"
    agents=$((agents + 1))
  done
}

# Skills : un lien symbolique par skill, vers ce dépôt. Un dossier existant
# qui n'est pas un lien n'est jamais remplacé.
install_skills() {
  local dir name target
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
    [ "$DRY_RUN" = 1 ] || ln -sfn "$dir" "$target"
    skills=$((skills + 1))
  done
}

# Étape propre à l'outil, après les agents et les skills. Rien par défaut.
after_sync() {
  :
}
