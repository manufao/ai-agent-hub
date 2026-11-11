# Phase 1 : reconnaissance, périmètre et frontières de confiance

L'objectif de cette phase est de cartographier méthodiquement le système, ses acteurs et ses flux de données avant toute recherche de vulnérabilité. Un auditeur qui commence à chasser sans cartographie passe à côté des failles d'architecture et des ruptures d'isolation.

---

## 1. Définition du périmètre et des profils

### Délimitation du périmètre
Avant d'inspecter le code, figer la portée de l'audit :
- **Audit global** : l'ensemble du dépôt ou de l'application (`src/`, `packages/`, etc.).
- **Audit délimité (*Scoped run*)** :
  - Liste de chemins explicites (`scope_paths`, ex: `src/auth/`, `src/billing/`).
  - Un sous-système précis ou une famille d'attaque ciblée.
  - Le diff entre deux révisions Git (ex: `git diff origin/main...HEAD`).

> **Règle absolue du Scope** : Seules les surfaces incluses dans le périmètre font l'objet d'unités d'audit. Tout le reste doit être explicitement répertorié comme `out_of_scope` dans le registre de couverture (`coverage-ledger.json`). Ne jamais marquer une zone non inspectée comme "saine" ou "couverte". Tout audit délimité doit s'annoncer dès l'en-tête comme une **couverture partielle**.

### Profils d'audit
Le profil ajuste la granularité et la profondeur d'investigation sans jamais faire de compromis sur la rigueur de preuve :
- **`quick`** : passage rapide et borné. Agrège les unités de couverture par surface × frontière. Exécute **une seule vague de chasse** suivie d'un passage unique du critique de couverture. Un seul vérificateur contradictoire par candidat. Idéal pour un premier diagnostic ou une re-validation rapide.
- **`standard`** : le mode par défaut. Découpage nominal par sous-système, plusieurs vagues de chasse itératives, critique de couverture, et vérificateurs contradictoires indépendants.
- **`deep`** : pour les bases de code hautement critiques, multi-tenants ou exposées publiquement. Découpage très fin par composant et mode de cycle de vie. Les vagues de chasse continuent jusqu'à ce que le critique de couverture valide un passage entièrement propre. Double vérification contradictoire pour chaque découverte confirmée.

### Traitement des audits antérieurs (audits incrémentaux)
Si un audit précédent existe (`coverage-ledger.json` antérieur) :
1. Comparer les commits : une unité couverte par le passé dont le code n'a pas bougé conserve son statut.
2. Tout fichier modifié depuis le dernier audit génère une nouvelle unité de revalidation planifiée.
3. Les constats `needs_validation` antérieurs non résolus restent actifs et doivent être réévalués.
4. Les rejets antérieurs (`rejected`) évitent de reposer les mêmes faux positifs, sauf si le code sous-jacent a changé.

---

## 2. Cartographie des acteurs et des privilèges

Identifier formellement chaque catégorie d'acteur interagissant avec le système :
- **Acteur anonyme / non authentifié** : internaute, scraper, webhook entrant public, client d'API publique.
- **Utilisateur authentifié standard** : client, membre d'organisation, collaborateur.
- **Utilisateur privilégié** : administrateur, support technique, opérateur système, auditeur.
- **Système externe ou worker** : tâche planifiée (cron), microservice interne, queue de messages, pipeline CI/CD.

Pour chaque acteur, consigner ses droits légitimes (*intended capabilities*) pour distinguer un comportement normal d'une violation de frontière.

---

## 3. Cartographie des frontières de confiance

Une frontière de confiance sépare deux zones opérant avec des niveaux de privilège ou de confiance distincts :
- **Frontière client → serveur** : toute donnée issue du navigateur ou d'une application mobile est par définition non fiable.
- **Frontière tenant A → tenant B** : étanchéité stricte des données et des caches entre organisations ou comptes clients distincts.
- **Frontière utilisateur → système / OS** : interactions avec le système de fichiers, l'exécution de processus, le réseau local ou les variables d'environnement.
- **Frontière modèle LLM → outils / base de données** : instructions ou données issues d'un prompt non fiable pouvant piloter des fonctions à privilèges (Tool Calling, MCP).

---

## 4. Les 4 prompts d'investigation spécialisés

En audit complet ou approfondi, l'analyse de reconnaissance peut s'articuler autour de 4 rôles spécialisés (exécutables en lecture seule) :

### Agent 1a : produit, stack technique et points d'entrée
```text
Explore la base de code en lecture seule. Retourne :
1. Type de produit, typologie d'utilisateurs et actions sensibles courantes.
2. Langages, frameworks, gestionnaires de paquets, runtimes et modèles de déploiement visibles.
3. Points d'entrée principaux relatifs au dépôt et frontières entre sous-systèmes.
4. Tests existants qui documentent le comportement attendu des zones sensibles (à lire, jamais à lancer).
Citer systématiquement les chemins relatifs fichier:ligne pour chaque affirmation.
```

### Agent 1b : acteurs, autorisations et contrôles d'accès
```text
Analyse tout le code établissant l'identité, l'authentification et l'autorisation :
1. Chaque catégorie d'acteur à faible privilège et ses prérogatives normales.
2. Mécanismes d'authentification sur chaque surface d'entrée (JWT, cookies, tokens API, mTLS).
3. Règles d'autorisation par ressource et périmètre d'isolation tenant/organisation.
4. Gestion des transitions de privilèges, confirmations sensibles, révocation de session.
5. Quels contrôles sont vérifiables dans le code source vs ceux dépendant de l'infrastructure de déploiement.
Fournir les emplacements exacts des contrôles avec références fichier:ligne.
```

### Agent 1c : recensement exhaustif des surfaces d'entrée et des récepteurs
```text
Dresse l'inventaire de tous les points où des données externes ou non fiables pénètrent dans le système :
- Endpoints HTTP/REST/GraphQL, connexions WebSocket, webhooks tiers.
- Paramètres d'URL, en-têtes (headers/cookies), corps de requêtes JSON ou multipart.
- Fichiers téléversés, documents parsés (XML, PDF, CSV), arguments CLI, files de messages.
Pour chaque surface, identifie les récepteurs sensibles (sinks) qu'elle peut atteindre :
- Exécution de commandes/code (eval, exec, spawn).
- Requêtes base de données brutes ou filtres ORM dynamiques.
- Rendu HTML/DOM dynamique, désérialisation, requêtes réseau sortantes (fetch, axios).
Ne pas exécuter de code, fournir l'inventaire avec chemins relatifs fichier:ligne.
```

### Agent 1d : visibilité du déploiement et des configurations
```text
Examine les manifests, configurations, Dockerfiles, middlewares et scripts de packaging :
1. Quelles défenses reposent sur l'infrastructure (WAF, reverse proxy, terminaison TLS, API Gateway) ?
2. Quels fichiers ou variables d'environnement sont injectés au runtime sans être présents dans le dépôt ?
3. Quels tests existants décrivent les frontières logiques (à lire comme documentation, sans les lancer) ?
4. Détecter les zones où l'absence de configuration dans le dépôt impose d'utiliser le statut needs_validation.
```

---

## 5. Initialisation du registre de couverture (`coverage-ledger.json`)

À la fin de la reconnaissance, le parent initialise `coverage-ledger.json` :
- Chaque sous-système x frontière forme une unité de couverture stable (`coverage_id`).
- Chaque unité est initialement marquée :
  - `planned` : prévue pour la chasse.
  - `out_of_scope` : exclue du périmètre d'audit demandé, avec justification.
  - `prior_covered_same_source` : issue d'un audit précédent dont le code est strictement identique.
