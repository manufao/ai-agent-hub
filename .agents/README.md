# Aperçu

Bienvenue sur le hub d'agents et de skills IA de ce projet — une collection de personas et d'expertises réutilisables, pensée pour fonctionner avec **Claude Code**, **Codex CLI**, **Cursor**, **Gemini CLI** et **opencode** sans dupliquer le contenu d'un outil à l'autre.

## Deux briques, deux formats

- **Agents** (menu de gauche) : des personas complets — un rôle, un périmètre clair, un processus, un format de sortie. Chacun raisonne, arbitre et rend une décision : valider une story, choisir une architecture, relire du code.
- **Skills** (menu de gauche, par catégorie) : des procédures répétables packagées au format ouvert [Agent Skills](https://agentskills.io), reconnu nativement par la plupart des outils agentiques du marché. Un agent s'appuie sur ses skills : par exemple Verifier applique `definition-of-ready` et `user-story-quality-check`.

Envie d'en créer un ? L'exemple [Créer un skill ou un agent](/examples/create-skill-or-agent) documente la marche à suivre, catégorie par catégorie.

## L'équipe

Quatorze agents couvrent le cycle de développement, de l'idée à la pull request. Ils sont regroupés par niveau dans le menu, et on ne les lance pas tous à chaque fois.

- **Produit** : Atlas (User Stories), Verifier (validation), Slice (découpe)
- **Architecture et implémentation** : Blueprint (décisions), Forge (plan d'implémentation), Specimen (plan de tests), Pulse (observabilité), Junior (implémentation des plans), Scribe (documentation)
- **Qualité et revue** : Inspector (revue de code et audit de maintenabilité), Refactor (plans de refactoring), Gatekeeper (Definition of Done)
- **Livraison** : Courier (commits, push et pull request), Styx (issues GitHub ou GitLab)

```text
Demande métier ou idée
  → Atlas       formalise une User Story
  → Verifier    valide clarté, risques et critères d'acceptation
  → Slice       découpe en tranches livrables
  → Blueprint   décide de l'architecture                            (si fonctionnalité sensible, en session principale)
  → Forge       prépare le plan d'implémentation
  → Specimen    prépare le plan de tests avant le code              (si fonctionnalité sensible)
  → Pulse       prévoit logs, métriques et alertes                  (si mise en production)
  → Junior      implémente à la lettre les plans de Forge, Pulse et Specimen
  → Inspector   relit le code
  → Gatekeeper  valide la Definition of Done
  → Scribe      met la documentation à jour
  → Courier     commite, pousse et ouvre la pull request
```

Styx n'apparaît pas dans le flux : la session principale l'appelle, après votre validation, pour publier la User Story (labels `us` et `brouillon`, puis `prete` après Verifier) et les tâches de Slice (label `tache`, puis `decoupee` sur la User Story), et pour relire ces issues au profit de Blueprint, Forge, Specimen et Gatekeeper.

Blueprint, Forge, Pulse et Specimen enregistrent chacun leur plan dans `docs/plans/<date>-<sujet>/` : c'est la trace de ce qui a été décidé avant de coder.

Refactor reste hors de ce flux : on l'appelle à la demande, sur une zone qu'Inspector juge à refactorer lors d'un audit.

Pour une petite évolution : Atlas, Verifier, Slice, Forge, Junior, Inspector, Gatekeeper, Courier. Pour une fonctionnalité sensible (paiement, authentification, donnée personnelle), ajoutez Blueprint, Specimen et Pulse.

## Lancer Blueprint

Blueprint dialogue avec vous : il se lance dans la session principale, jamais en sous-agent. Videz la session, puis :

- **Claude Code** : `claude --agent blueprint-architect --effort high`. L'effort est aussi fixé dans l'agent, mais la documentation ne dit pas s'il s'applique à une session lancée avec `--agent` : l'option `--effort` le garantit. Pour contrôler le niveau actif, tapez `/effort`.
- **opencode** : c'est un agent principal (`primary`). Choisissez-le dans l'interface (la touche Tab change d'agent principal, d'après la documentation), ou fixez-le par défaut avec `default_agent` dans `opencode.json`.

À la fin, Blueprint écrit son ADR dans `docs/plans/<date>-<sujet>/architecture.md` : relisez-la avant d'appeler Forge.

## Catégories de skills

- **Ingénierie** — architecture, plan d'implémentation, tests, revue de code, maintenabilité, refactoring, observabilité, Definition of Done, commits et pull requests
- **Productivité** — clarification des besoins, passation de session, User Stories, critères d'acceptation, Definition of Ready, découpage, documentation, changelog
- **Marketing** — communication, contenu, positionnement produit

## Lancer le projet en local

**Avec Docker (recommandé) :**

```bash
make up
```

Puis ouvrir [http://localhost:3000](http://localhost:3000). `make down` arrête l'environnement.

**Sans Docker (Node 24+, pnpm 12+) :**

```bash
pnpm install
pnpm run start:dev
```

Le serveur de développement compile le CSS et recharge automatiquement au changement de fichier.

**Avant de proposer une contribution :**

```bash
make check
```

Ce script formatte, lint, type-check, fait tourner les tests avec couverture (100 % exigé) et build le projet — c'est ce que la CI vérifie.

Le détail complet (prérequis, commandes Docker, structure du dépôt) reste dans le `README.md` à la racine du dépôt.
