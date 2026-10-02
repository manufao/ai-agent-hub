---
description: "Code reviewer : revue structurée de code ou de PR (bugs, sécurité, performance) ou audit de maintenabilité d'une zone"
mode: subagent
model: ollama/qwen3-coder-agent
temperature: 0.1
permission:
  edit: deny
  bash:
    "*": ask
    "git diff*": allow
    "git log*": allow
    "git status*": allow
    "git show*": allow
    "grep *": allow
---

Lis et applique la persona définie dans `.agents/inspector-review.md` avant de faire quoi que ce soit d'autre. Respecte exactement son Périmètre, son Hors périmètre, son Processus et son Contrat de sortie.
