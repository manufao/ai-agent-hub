# opencode : agents dans ~/.config/opencode/agents, skills dans ~/.agents/skills,
# fournisseurs de modèles fusionnés dans ~/.config/opencode/opencode.json.

SRC="$ROOT/.opencode/agents"
EXT="md"
AGENTS_DST="$HOME/.config/opencode/agents"
SKILLS_DST="$HOME/.agents/skills"
CHECK_DIR="$HOME/.config/opencode"

PROVIDERS_SRC="$ROOT/opencode.json"
CONFIG_DST="$HOME/.config/opencode/opencode.json"

after_sync() {
  merge_providers
  warn_missing_ollama_models
}

# Les wrappers référencent des modèles « <fournisseur>/<modèle> » déclarés dans
# le opencode.json de ce dépôt. Hors de ce dépôt, opencode ne lit que sa
# configuration globale : sans ces fournisseurs, les agents échouent. On y
# fusionne donc la section provider de ce dépôt, sans toucher au reste. Un
# fichier avec commentaires (JSONC) n'est pas modifié.
merge_providers() {
  say "config $CONFIG_DST (fournisseurs de $PROVIDERS_SRC)"
  [ "$DRY_RUN" = 0 ] || return 0
  SRC_JSON="$PROVIDERS_SRC" DST_JSON="$CONFIG_DST" perl -MJSON::PP -e '
    sub slurp { open my $h, "<", $_[0] or die "$_[0] : $!\n"; local $/; <$h> }
    my $src = eval { decode_json(slurp($ENV{SRC_JSON})) } or die "JSON invalide : $ENV{SRC_JSON}\n";
    my $dst = { "\$schema" => "https://opencode.ai/config.json" };
    if (-e $ENV{DST_JSON}) {
      $dst = eval { decode_json(slurp($ENV{DST_JSON})) }
        or die "$ENV{DST_JSON} n\x27est pas du JSON strict (commentaires ?) : ajoutez-y à la main la section provider de $ENV{SRC_JSON}\n";
    }
    $dst->{provider}{$_} = $src->{provider}{$_} for keys %{ $src->{provider} || {} };
    open my $out, ">", $ENV{DST_JSON} or die "$ENV{DST_JSON} : $!\n";
    print $out JSON::PP->new->utf8->pretty->canonical->encode($dst);
  '
}

# Signale les modèles Ollama référencés par un agent mais pas installés
warn_missing_ollama_models() {
  command -v ollama >/dev/null 2>&1 || return 0
  local installed model missing=0
  installed="$(ollama list 2>/dev/null | awk 'NR > 1 { print $1 }')" || return 0
  for model in $(sed -n 's#^model: ollama/##p' "$SRC"/*.md | sort -u); do
    if ! printf '%s\n' "$installed" | grep -qxF "$model"; then
      echo "modèle Ollama absent : $model (voir examples/create-skill-or-agent/references/how-use-agent-in-opencode.md)" >&2
      missing=$((missing + 1))
    fi
  done
  [ "$missing" = 0 ] || echo "$missing modèle(s) à installer avant d'utiliser les agents concernés" >&2
}
