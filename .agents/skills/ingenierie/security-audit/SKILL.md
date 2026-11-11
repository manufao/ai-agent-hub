---
name: security-audit
description: "À utiliser pour auditer la sécurité d'une base de code, d'une PR ou d'un composant : cartographie des frontières de confiance, détection de vulnérabilités source-to-sink, revue contradictoire et rapport rigoureux."
---

# Audit de sécurité du code

Audit de sécurité défensif axé sur le code source. Son principe fondamental : une anomalie sans démonstration concrète de rupture d'une frontière de confiance n'est pas une vulnérabilité.

## Quand l'utiliser

- Revue de sécurité d'un diff, d'une PR ou d'une fonction sensible (auth, paiements, intégration LLM).
- Audit de sécurité complet ou ciblé d'un dépôt ou sous-système.
- Évaluation et triage de vulnérabilités potentielles avant mise en production.

## Modes, périmètre et profils

- **Revue ciblée** (mode par défaut) : pour une PR, un diff ou une zone précise. Ne crée aucun fichier sur disque. Applique le traçage et l'avocat du diable, puis rend son verdict directement dans la conversation. C'est le seul mode utilisable depuis un sous-agent.
- **Audit complet** : sur demande explicite (« audit complet », « pentest du dépôt »), lancé à la main dans la session principale, jamais en sous-agent. Fige le périmètre (`scope_paths`), choisit un profil d'analyse et produit les livrables dans `.docs/security-audit/AAAA-MM-JJ/` (`references/04-schemas-and-reporting.md`). Si la demande peut viser l'un ou l'autre mode, poser une seule question avant de créer un fichier.

Les rôles de l'audit complet (reconnaissance, critique de couverture, vérificateur) sont confiés à des sous-agents quand l'outil le permet. Sinon, la session les enchaîne en passes successives et le rapport indique que la vérification n'était pas indépendante.

### Profils d'audit (mode complet)
- **`quick`** : passage rapide et borné (1 vague de chasse, 1 vérificateur par candidat). Idéal pour un premier état des lieux ou une petite cible.
- **`standard`** (par défaut) : workflow nominal avec vagues de chasse, critique de couverture et vérification contradictoire indépendante.
- **`deep`** : pour cibles critiques ou à fort enjeu. Vagues successives jusqu'au passage à blanc du critique de couverture et double validation.

*Règle du périmètre* : marquer les zones non inspectées comme `out_of_scope` (jamais comme "couvert" ou "sain"). Un audit `quick` ou délimité doit s'annoncer comme une couverture partielle.

## Instructions selon le mode

### A. En revue ciblée (PR, diff, composant)
1. Délimiter le périmètre : lire le diff ou les fichiers de la zone concernée.
2. Repérer les entrées modifiées et vérifier si elles atteignent un récepteur sensible (*sink*).
3. Confronter le code aux familles d'attaques pertinentes (`references/attack-classes/`).
4. Passer la checklist de l'avocat du diable (`references/03-adversarial-review.md`) pour éliminer les faux positifs.
5. Répondre directement avec le format de sortie synthétique ci-dessous.

### B. En audit complet (dépôt ou grand sous-système)
1. **Périmètre et profil** : figer le profil (`quick`, `standard`, `deep`) et le dossier de sortie :
   - racine du dépôt audité : `git rev-parse --show-toplevel`, jamais le dossier du skill ni le sous-dossier où tourne la session ;
   - sortie dans `<racine>/.docs/security-audit/AAAA-MM-JJ/` ;
   - vérifier `git check-ignore -q .docs/security-audit/` : si le dossier n'est pas ignoré, demander à l'utilisateur d'ajouter `.docs/security-audit/` au `.gitignore` du projet avant d'écrire, pour ne jamais publier une faille non corrigée ;
   - hors dépôt git, demander où écrire.
2. **Reconnaissance** (`references/01-reconnaissance.md`) : cartographier les acteurs, rôles et frontières de confiance ; initialiser `coverage-ledger.json`.
3. **Chasse méthodique** (`references/02-hunting.md`) : vagues de chasse par familles d'attaque selon le profil.
4. **Revue contradictoire** (`references/03-adversarial-review.md`) : réfuter chaque candidat.
5. **Livrables et remédiation** (`references/04-schemas-and-reporting.md`) : générer `REPORT.md`, `findings.json` et `coverage-ledger.json`.

## Règles et discipline de verdict

- **Preuve source-to-sink obligatoire** : identifier l'entrée non fiable, le chemin de propagation et le récepteur vulnérable (*sink*).
- **Séparation stricte des statuts** :
  - `confirmed` : vulnérabilité démontrée avec impact concret. Seul ce statut reçoit une sévérité (`critical`, `high`, `medium`, `low`, `informational`).
  - `needs_validation` : hypothèse crédible bloquée par un fait non visible dans le code (ex. : configuration d'infrastructure, WAF). **Aucune sévérité attribuée**.
  - `rejected` : candidat réfuté par la revue contradictoire.
- **Défense en profondeur ≠ Vulnérabilité** : si une couche amont bloque l'attaque, l'absence de protection aval est une note de durcissement, pas une faille.
- **Lecture seule** : l'audit lit le code et ses tests, il n'exécute ni build, ni test, ni code de la cible. Un fait qui demanderait une exécution reste en `needs_validation`.
- **Correctif minimal** : chaque `confirmed` propose le plus petit changement au dernier point de confiance, et le test de non-régression qui le prouve.

## Anti-patterns à proscrire

1. Présenter un écart de checklist ou un manque de durcissement comme une vulnérabilité.
2. Deviner le comportement d'un proxy, WAF ou cloud absent du code (utiliser `needs_validation`).
3. Qualifier une action légitime de l'acteur ou un auto-impact (*self-impact*) de faille de sécurité.
4. Assigner une sévérité à une découverte en attente de validation (`needs_validation`).
5. Proposer des correctifs invasifs plutôt que le changement minimal au dernier point de confiance.

## Format de sortie synthétique

```markdown
### Synthèse de sécurité
- **Périmètre et profil** : `[chemins analysés]` | Profil : [quick | standard | deep]
- **Verdict global** : [APPROUVÉ | RISQUE IDENTIFIÉ | EN ATTENTE DE VALIDATION]

### Découvertes confirmées (`confirmed`)
1. **[CRITICAL | HIGH | MEDIUM | LOW]** — `titre-vulnerabilite`
   - **Trace** : `entree.ts:L12` → `service.ts:L45` → `sink.ts:L88`
   - **Impact** : [qui peut faire quoi et quelle frontière est franchie]
   - **Remédiation** : [correctif minimal préconisé]

### En attente de validation (`needs_validation`)
1. `titre-hypothese` — Fait manquant hors code : [ex: règle WAF / variable d'env en prod]
```
