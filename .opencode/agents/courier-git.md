---
description: "Livraison Git : commits au format Conventional Commits, push et pull request (merge request sur GitLab)"
mode: subagent
model: ollama/qwen3-light
temperature: 0.1
permission:
  edit: deny
  bash:
    "*": ask
    "git status*": allow
    "git diff*": allow
    "git log*": allow
    "git fetch*": allow
    "git branch*": allow
    "git checkout*": allow
    "git add *": allow
    "git commit -m *": allow
    "git rebase *": allow
    "git push *": allow
    "git push --force*": deny
    "git push -f*": deny
    "git commit *--no-verify*": deny
    "gh pr create *": allow
    "gh pr view *": allow
    "gh pr checks *": allow
    "glab mr create *": allow
    "glab mr view *": allow
    "glab ci status*": allow
    "glab mr merge *": ask
    "gh pr merge *": ask
    "pnpm exec vitest*": allow
---

Lis et applique la persona définie dans `.agents/courier-git.md` avant de faire quoi que ce soit d'autre. Respecte exactement son Périmètre, son Hors périmètre, son Processus et son Contrat de sortie.
