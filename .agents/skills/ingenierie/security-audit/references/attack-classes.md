# Référentiel des familles d'attaque

Ce référentiel organise les classes d'attaque à sélectionner lors des phases de reconnaissance et de chasse en fonction de la typologie de l'application auditée.

> **Une piste n'est pas une faille.** Chaque point des fiches est une piste à vérifier. Il ne devient candidat qu'avec un acteur de moindre confiance, une frontière franchie et un impact concret (`SKILL.md`). Sinon, c'est une note de durcissement. Les points marqués *Durcissement* le sont par nature : ils ne deviennent une faille que dans le cas indiqué.

---

## Guide d'orientation par domaine

Pour chaque cible, activer les fiches spécialisées correspondantes :

1. **Socle universel (toutes cibles)** :
   Consulter [`00-core-classes.md`](attack-classes/00-core-classes.md) : injections directes/indirectes, contrôle d'accès, traversée de chemins, gestion des secrets.

2. **Cibles Web, API et Identité** :
   Consulter [`web-and-auth.md`](attack-classes/web-and-auth.md) : routage HTTP, contournements proxy, sessions, cookies, JWT, OAuth2, OIDC, CSRF, SSRF, empoisonnement de cache.

3. **Cibles Côté Client et Navigateur (SPA, Extensions, WebViews)** :
   Consulter [`client-side.md`](attack-classes/client-side.md) : DOM XSS, prototype pollution, `postMessage`, CORS, WebSockets, stockage local.

4. **Cibles IA, Modèles LLM et Agents** :
   Consulter [`ai-and-llm.md`](attack-classes/ai-and-llm.md) : injection indirecte de prompt, détournement d'outils / protocoles MCP, empoisonnement RAG, fuites de prompt système.

5. **Cibles Multi-tenant et Cycle de vie des données** :
   Consulter [`data-isolation.md`](attack-classes/data-isolation.md) : étanchéité des organisations, isolation de caches Redis et index de recherche, soft delete, failles d'exports et sauvegardes.

6. **Cibles Cloud, Conteneurs et Déploiement** :
   Consulter [`cloud-and-deployment.md`](attack-classes/cloud-and-deployment.md) : Dockerfile, exécution root, socket Docker, variables d'environnement, métadonnées d'instance (IMDS), rôles IAM.

7. **Cibles Chaîne d'approvisionnement (Supply Chain) et CI/CD** :
   Consulter [`supply-chain.md`](attack-classes/supply-chain.md) : dépendances npm/pnpm, scripts `postinstall`, confusion de dépendances, injection dans les workflows GitHub Actions / GitLab CI.

8. **Cibles Disponibilité et Épuisement de ressources** :
   Consulter [`resource-exhaustion.md`](attack-classes/resource-exhaustion.md) : ReDoS, payloads non bornés, requêtes non paginées, fuites de connexions de pool, épuisement de quotas d'API tierces.
