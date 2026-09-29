# Aperçu

Bienvenue sur le hub d'agents et de skills IA de ce projet — une collection de personas et d'expertises réutilisables, pensée pour fonctionner avec **Claude Code**, **Codex CLI**, **Cursor** et **Gemini CLI** sans dupliquer le contenu d'un outil à l'autre.

## Deux briques, deux formats

- **Agents** (menu de gauche) : des personas complets — un rôle, un périmètre clair, un processus, un format de sortie. Utile pour un rôle autonome qu'on invoque comme un collaborateur dédié (planification, tests...).
- **Skills** (menu de gauche, par catégorie) : des expertises et procédures packagées au format ouvert [Agent Skills](https://agentskills.io), reconnu nativement par la plupart des outils agentiques du marché.

Envie d'en créer un ? L'exemple [Create a skill or an agent](/examples/create-skill-or-agent) documente la marche à suivre, catégorie par catégorie.

## Catégories de skills

- **Ingénierie** — tests, revue de code, architecture, outillage du dépôt
- **Productivité** — organisation, rédaction, automatisation de tâches répétitives
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
