# Familles d'attaque isolation des données et cycle de vie

Ce guide traite de la séparation des données en environnement mutualisé (multi-tenant), de l'isolation des caches et des moteurs de recherche, ainsi que des failles liées au cycle de vie de la donnée (archivage, suppression douce, exports et sauvegardes).

---

## 1. Étanchéité multi-tenant
Dans une architecture SaaS ou multi-organisations, chaque requête doit être strictement cantonnée au périmètre de l'organisation ou du compte de l'utilisateur authentifié.

### Ce qu'il faut chercher :
- **Oubli de filtre sur le tenant** :
  - Clauses `WHERE` dans les requêtes SQL/ORM oubliant de filtrer par `org_id` ou `tenant_id` lors de requêtes de mise à jour (`UPDATE`), de suppression (`DELETE`) ou de sélection d'enregistrements par ID.
  - Utilisation de clés primaires séquentielles entières (`1, 2, 3...`) facilitant le crawling inter-tenants en cas d'IDOR.
- **Opérations sur les relations et jointures** :
  - Une ressource parente est bien filtrée par `org_id`, mais l'association enfant (ex: `/api/orders/:orderId/items/:itemId`) est chargée directement par son ID propre sans vérifier qu'elle appartient bien à l'ordre du tenant courant.

---

## 2. Isolation des caches et des moteurs de recherche
- **Clés de cache non partitionnées** :
  - Mise en cache Redis/Memcached utilisant des clés globales du type `user:settings` ou `dashboard:stats` sans inclure l'identifiant du tenant ou de l'utilisateur dans le préfixe (`tenant:123:user:settings`), provoquant le renvoi des données d'un client à un autre.
- **Index de recherche partagés (Elasticsearch, Meilisearch, Algolia)** :
  - Exécution de requêtes textuelles sur un index mutualisé où le filtre de sécurité `filter: { tenant_id: currentTenant }` est omis ou facultatif.
  - Génération de clés d'API de recherche côté client ayant un scope trop large (accès à l'index complet sans restriction de tenant).

---

## 3. Suppression douce (*soft delete*) et fuites de cycle de vie
- **Contournement de la suppression douce** :
  - Les entités marquées avec `deleted_at IS NOT NULL` sont filtrées sur les endpoints principaux, mais restent accessibles via :
    - Des endpoints d'export global (CSV, JSON, PDF).
    - Des recherches globales ou des suggestions de saisie semi-automatique.
    - Des opérations de restauration d'entités parentes réactivant des entités liées qui devaient rester supprimées.
- **Non-respect du droit à l'effacement (RGPD / Données personnelles)** :
  - Une suppression de compte anonymise ou supprime les enregistrements dans la table principale, mais conserve les identifiants, adresses emails ou tokens dans des tables d'historique, d'audit ou de logs analytiques.

---

## 4. Exports, sauvegardes et migrations
- **Génération asynchrone d'exports** :
  - Un job d'export de données en arrière-plan génère un fichier sur un stockage cloud (S3, GCS) avec une URL pré-signée publique ou un nom de fichier prévisible sans contrôle d'accès ultérieur.
- **Failles lors des migrations de données** :
  - Scripts de migration associant par défaut des données orphelines à un tenant générique ou au premier tenant de la table.
