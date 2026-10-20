# Comparaison : agents et skills globaux (`~/.claude/`) et ai-agent-hub

Objectif : remplacer les agents et skills globaux (spécifiques FranceConnect, FC) par ceux du hub (généralistes), sans perdre la base de connaissance actuelle.

## À savoir d'abord

- **Les agents globaux ne contiennent pas la connaissance.** Ce sont des wrappers de quelques lignes. Le contenu réel est dans `workspace/fc/.agents/` : persona, `references/`, règles de commit, de test, de logs.
- **Deux wrappers cassent hors du repo FC.** `commit-agent` et `ticket-generator-agent` ont des chemins absolus vers `/home/emaravilha/Public/france/connect/workspace/fc/…`. Les autres ont des chemins relatifs, qui ne fonctionnent que dans le repo FC.
- **Rien n'est perdu tant que le workspace FC existe.** Remplacer les globaux par ceux du hub retire seulement l'accès global à ces règles. La connaissance se déplace donc en deux morceaux : le générique va dans le hub, le spécifique FC reste dans le repo FC.

## Agents

| Global (FC) | Équivalent hub | Proximité | Subtilités qui se perdraient | À créer ou modifier |
|---|---|---|---|---|
| `commit-agent` | Courier + skill `conventional-commit` | Forte (même rôle) | **Format** : `[FC-XXX] <emoji> sujet`, contre Conventional Commits `type(portée):`. **Validation** : FC propose un plan de commits et attend l'accord avant de committer, alors que Courier committe et pousse directement. **Push et PR** : FC ne pousse jamais et n'ouvre jamais de PR, alors que Courier fait les deux. **Corps du message** : FC l'autorise, Courier l'interdit. **Règles de découpage** : mot « et » dans le sujet = split obligatoire, refactor toujours avant la feature, série `i/n` près de 10 fichiers, `git add -p`. **Autres** : checklist d'hygiène du diff, template de description de PR (le hub n'accepte que `Closes #N`), branche de base `staging` (le hub utilise `master`). | Ajouter à `conventional-commit` les règles de découpage, qui sont génériques. Ajouter à Courier un mode « plan puis validation » et un mode « commit seul, sans push ». Garder le format `[FC-XXX] emoji` et le template de PR comme convention du projet FC, par exemple dans un skill `fc-commit-convention` ou dans l'`AGENTS.md` du repo FC. |
| `architecture-agent` | Blueprint (+ `adr-writing`, `implementation-plan`) | Faible, ils se complètent | Blueprint **décide** une architecture avec ses compromis, de façon interactive, et écrit une ADR. `architecture-agent` **place** du code : matrice app/lib/instance, suffixes `Interface`/`Dto`/`Service`, barrels `index.ts`, types sémantiques (`Pick<Entity,'id'>`), recherche de code similaire et checklist de validation. | Créer un agent ou skill générique `code-placement` : chercher du code similaire, appliquer les conventions du projet lues à l'exécution, interroger Context7, répondre dans le format emplacement/structure/nommage/config/références. Les règles FC (matrice, suffixes) vont dans les références du repo FC. |
| `nestjs-architecture-agent` | Aucun | Nulle | Spécifique au backend NestJS FC (224 lignes) : arbre de décision `libs/@fc`, structure des modules, DTO. | Ne pas le généraliser. Le garder dans le repo FC, ou en faire un skill de stack `nestjs-conventions`, hors du hub si celui-ci doit rester neutre. |
| `unit-test-agent` | Specimen (+ `test-plan`) et Junior | Faible, étapes différentes | Specimen **planifie** les tests et n'écrit pas de code. `unit-test-agent` **écrit** les specs Jest et boucle jusqu'à 100 % de couverture. Règles FC : pas de `spyOn`, mocks complets, `overrideProvider`, `// Given/When/Then`, `...Once` dans les tests, méthodes privées par notation crochet, rapport des lignes non couvertes. | Créer un agent générique `test-writer` : découvrir les conventions du projet, écrire les tests, boucler sur la couverture, rapporter ce qui bloque. Garder les règles Jest/NestJS de FC en références. |
| `cypress-agent` | Aucun (Specimen évoque l'E2E au niveau plan seulement) | Nulle | Features Gherkin en français, steps génériques et réutilisés, règles de régression visuelle (pages stables, petits jeux de résultats), jamais écraser un snapshot, README mis à jour. | À migrer presque tel quel : l'agent découvre déjà les conventions du projet testé. Créer `e2e-bdd` (agent + skill) dans le hub. Retirer les mentions FC. |
| `logger-agent` | Pulse + skill `observability-checklist` | Moyenne | Pulse **prépare** logs, métriques et alertes pour une fonctionnalité, et écrit un plan. `logger-agent` **relit** les logs existants (fichier ou instruction) : philosophie « le strict minimum », table de niveaux (business, emerg, … info), vérification du format, détection des logs inutiles. | Ajouter au hub un skill `log-review` générique : nécessité du log, niveaux, aucune donnée personnelle. Ou le brancher sur Inspector en mode revue. La table de niveaux FC reste dans les références FC. |
| `template-agent` | `examples/create-skill-or-agent` | Moyenne | Le hub n'a pas d'**agent** de création, seulement un exemple volontairement non découvert par les outils. Le `template-agent` FC crée en plus le wrapper dans `~/.claude/agents/`, alors que le hub utilise `.agents/` plus des symlinks dans `.claude/`. | Choisir entre trois options : garder l'exemple et pointer dessus, créer un agent `scaffolder` dans le hub, ou abandonner le `template-agent` FC. Dans tous les cas, sa convention « wrapper dans `~/.claude/agents` » devient obsolète. |
| `ticket-generator-agent` | Atlas (`user-story-writing`), Slice, Styx (`forge-gitlab`) | Faible | Le hub produit des **US et des tâches** publiées sur la forge après validation. FC produit un **ticket technique** : gabarit fixe (Titre, Contexte, Documentation, Pré-requis, Architecture avec « Air Code™ », Actions, Conditions d'acceptance), limites de 3 à 5 éléments, exploration du code, chemins vérifiés, sauvegarde dans un fichier sans publication. | Ajouter un skill `technical-ticket` (gabarit générique et exploration du code). Garder le gabarit « Air Code™ » et ses limites comme variante FC dans les références FC. |

## Skills

| Global | Équivalent hub | Proximité | Subtilités | À faire |
|---|---|---|---|---|
| `grilling` + `grill-me` (alias) | `requirements-grilling` | **Doublon quasi exact** | Même arbre de décisions, mêmes tours, même format ❓/➡️. Le hub ajoute la synthèse finale, la confirmation et la précision « ne rien produire avant confirmation ». | Rien à créer. Supprimer `grilling` et `grill-me` du global. Si vous tapez `/grill-me`, ajouter l'alias côté hub. |
| `handoff-skill` | `session-handoff` | Forte | Le global impose le ticket tiré de la branche (`FC-2799`), un chemin FC fixe et cinq sections. Le hub prend un objectif et un dossier en argument, utilise `~/.claude/context` par défaut et ajoute des sections et une vérification. | Aucune règle FC perdue à part le dossier. Remplacer `handoff-skill` par `session-handoff`. Si le suivi par ticket manque, l'ajouter comme option du nom de fichier. |
| `review` | `code-review-checklist` + Inspector | Moyenne | `review` compare à `staging` en français et cible FC : suffixes NestJS, `data-testid`, commit `[FC-XXX]`, migrations avec `down`, barrels, tests `*.spec.ts`. Le hub est générique avec trois niveaux de gravité et une décision finale. Le hub compare à `master`. | Détecter la branche de base au lieu de coder `staging`. Placer les critères FC dans les références du repo FC, chargées seulement dans ce projet. |
| `commit-skill` | `conventional-commit` | Forte | Mêmes différences que `commit-agent` (format, validation, push). | Même action que pour `commit-agent`. |
| `architecture-skill`, `nestjs-architecture-skill` | Aucun | Nulle | Mêmes enjeux que les agents correspondants. | Même action. |
| `cypress-skill`, `unit-test-skill`, `ticket-generator-skill`, `template-skill` | Aucun | Nulle | Mêmes enjeux que les agents correspondants. | Même action. |
| `example-skill` | `examples/create-skill-or-agent` | Moyenne | Gabarit commenté, avec les champs spécifiques à Claude Code. | Garder comme modèle, ou l'intégrer à l'exemple du hub. |
| `log-review` (commande dans `~/.claude/commands`) | Aucun | Nulle | Commande qui appelle `logger-agent`. | Même action que `logger-agent`. |

## Ce que le hub a en plus

Rien dans le global pour ces rôles : Atlas, Verifier, Slice, Forge, Junior, Gatekeeper, Refactor, Scribe, Styx, et les skills `definition-of-done`, `definition-of-ready`, `acceptance-criteria`, `changelog-entry`, `docs-plans`.

## Plan proposé

1. **Récupérer tout de suite** : supprimer `grilling`, `grill-me` et `handoff-skill` du global, car le hub les couvre.
2. **Généraliser dans le hub** (rien n'est perdu côté FC) : règles de découpage des commits, mode « plan puis validation » de Courier, `e2e-bdd`, `test-writer`, `code-placement`, `log-review`, `technical-ticket`.
3. **Garder dans le repo FC** les conventions spécifiques, en `references/` : format `[FC-XXX] emoji`, template de PR, table de niveaux de logs, règles Jest, structure NestJS, gabarit « Air Code™ ». Les skills génériques du hub les liront quand ils tournent dans FC.
4. **Ne retirer les globaux FC qu'après l'étape 3.** D'ici là, leur support vit dans le repo FC, pas dans `~/.claude`.
