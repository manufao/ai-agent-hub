# Aperçu

Bienvenue sur le hub d'agents et de skills IA de ce projet — une collection de personas et d'expertises réutilisables, pensée pour fonctionner avec **Claude Code**, **Codex CLI**, **Cursor** et **Gemini CLI** sans dupliquer le contenu d'un outil à l'autre.

## Deux briques, deux formats

- **Agents** (menu de gauche) : des personas complets — un rôle, un périmètre clair, un processus, un format de sortie. Chacun raisonne, arbitre et rend une décision : valider une story, choisir une architecture, relire du code.
- **Skills** (menu de gauche, par catégorie) : des procédures répétables packagées au format ouvert [Agent Skills](https://agentskills.io), reconnu nativement par la plupart des outils agentiques du marché. Un agent s'appuie sur ses skills : par exemple Verifier applique `definition-of-ready` et `user-story-quality-check`.

Envie d'en créer un ? L'exemple [Créer un skill ou un agent](/examples/create-skill-or-agent) documente la marche à suivre, catégorie par catégorie.

## L'équipe

Treize agents couvrent le cycle de développement, de l'idée à la pull request. Ils sont regroupés par niveau dans le menu, et on ne les lance pas tous à chaque fois.

- **Produit** : Atlas (User Stories), Verifier (validation), Slice (découpe)
- **Architecture et implémentation** : Blueprint (décisions), Forge (plan d'implémentation), Pulse (observabilité), Scribe (documentation)
- **Qualité et revue** : Specimen (tests), Inspector (revue de code), Sentinel (maintenabilité), Refactor (plans de refactoring), Gatekeeper (Definition of Done)
- **Livraison** : Courier (commits, push et pull request)

```text
Demande métier ou idée
  → Atlas       formalise une User Story
  → Verifier    valide clarté, risques et critères d'acceptation
  → Slice       découpe en tranches livrables
  → Blueprint   décide de l'architecture si nécessaire
  → Forge       prépare le plan d'implémentation
  → Pulse       prévoit logs, métriques et alertes si la fonctionnalité part en production
  → Specimen    définit la stratégie de tests
  → Développement
  → Inspector   relit le code
  → Sentinel    contrôle la maintenabilité
  → Gatekeeper  valide la Definition of Done
  → Scribe      met la documentation à jour
  → Courier     commite, pousse et ouvre la pull request
```

Refactor reste hors de ce flux : on l'appelle à la demande, sur une zone que Sentinel juge à refactorer.

Pour une petite évolution : Atlas, Verifier, Slice, Forge, Inspector, Gatekeeper, Courier. Pour une fonctionnalité sensible (paiement, authentification, donnée personnelle), ajoutez Blueprint, Specimen et Pulse.

## Catégories de skills

- **Ingénierie** — architecture, plan d'implémentation, tests, revue de code, maintenabilité, refactoring, observabilité, Definition of Done, commits et pull requests
- **Productivité** — clarification des besoins, User Stories, critères d'acceptation, Definition of Ready, découpage, documentation, changelog
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
