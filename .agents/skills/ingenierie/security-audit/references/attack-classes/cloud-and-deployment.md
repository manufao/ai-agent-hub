# Familles d'attaque cloud, conteneurs et déploiement

Ce guide traite des risques liés aux infrastructures d'exécution : conteneurs Docker/Kubernetes, configurations IAM, variables d'environnement, secrets d'infrastructure et passerelles cloud.

---

## 1. Conteneurs et Dockerfiles
- **Exécution sous l'utilisateur `root`** : absence de directive `USER node` ou `USER appuser` dans le Dockerfile final, laissant le processus applicatif s'exécuter avec les privilèges `root` dans le conteneur. *Durcissement, sauf si une exécution de code est démontrée dans ce conteneur.*
- **Fuite de secrets dans les couches d'images** : inclusion de clés d'API, de fichiers `.env` ou de tokens de build via `ARG` ou `COPY` qui restent extractibles dans l'historique des layers Docker.
- **Exposition du socket Docker** : montage du socket Docker hôte (`/var/run/docker.sock`) dans un conteneur d'application, permettant une évasion immédiate du conteneur vers l'hôte physique.

---

## 2. Variables d'environnement et secrets à l'exécution
- **Fichiers `.env` versionnés dans Git** : vérification que `.gitignore` exclut rigoureusement `.env`, `.env.local`, `.env.production` et les fichiers de credentials cloud (`credentials.json`, `id_rsa`).
- **Affichage des variables d'environnement dans les erreurs** : endpoints de debug (`/debug/env`, `/api/health`) ou pages d'erreur en mode développement exposant l'intégralité de `process.env`.
- **Injection de variables sensibles dans des sous-processus** : passage de l'objet complet `process.env` à des scripts enfants non sécurisés via `child_process.spawn()`.

---

## 3. Politiques IAM et droits d'accès cloud
- **Rôles de service sur-privilégiés (Over-permissioned roles)** :
  - Rôle IAM d'un conteneur ECS/EKS ou d'une fonction Lambda disposant d'autorisations globales `AdministratorAccess` ou de wildcards `s3:*` au lieu d'être restreint à un bucket spécifique. *Durcissement, sauf si une SSRF ou une exécution de code permet d'utiliser ce rôle.*
- **Accès aux points de terminaison de métadonnées d'instance (IMDS)** :
  - Sur AWS EC2, persistance d'IMDSv1 sans exiger IMDSv2 (permettant à une simple faille SSRF de voler les credentials IAM temporaires de l'instance via `http://169.254.169.254/latest/meta-data/iam/security-credentials/`). *Durcissement, sauf si une SSRF atteignable est démontrée. La configuration de l'instance est souvent hors du dépôt : `needs_validation`.*
