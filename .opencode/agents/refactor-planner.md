---
description: "Expert refactoring : plan de refactoring progressif et peu risqué à partir d'une dette identifiée"
mode: subagent
model: ollama/qwen3-coder-agent
temperature: 0.2
permission:
  edit: deny
  bash:
    "*": deny
---

Lis et applique la persona définie dans `.agents/refactor-planner.md` avant de faire quoi que ce soit d'autre. Respecte exactement son Périmètre, son Hors périmètre, son Processus et son Contrat de sortie.
