# Familles d'attaque fondamentales

Ces classes d'attaque s'appliquent de manière universelle à toute application, API, bibliothèque ou service backend.

---

## 1. Injections (SQL, NoSQL, commandes, templates)
Tracer toute entrée non fiable depuis son point de collecte jusqu'à un récepteur (*sink*) d'exécution ou d'interprétation.

### Ce qu'il faut chercher :
- **Requêtes SQL brutes** : concaténation de chaînes, interpolation de variables dans `db.query()`, `db.execute()`, `$queryRawUnsafe`.
- **Injections NoSQL (MongoDB, CouchDB)** : passage d'objets non validés permettant d'injecter des opérateurs de requête (ex: `{"username": "admin", "password": {"$gt": ""}}`).
- **Injections de commandes OS** : utilisation de `child_process.exec()`, `execSync()`, `spawn(..., { shell: true })` où des arguments d'entrée utilisateur sont concaténés sans échappement rigoureux.
- **Injections de templates (SSTI)** : rendu de chaînes dynamiques non compilées via des moteurs de template (EJS, Pug, Handlebars, Jinja).
- **Injections indirectes** : données stockées légitimement en base lors d'une première étape, puis réutilisées plus tard dans un contexte dangereux sans assainissement par un worker d'arrière-plan ou un job cron.

---

## 2. Contrôle d'accès et gestion des autorisations
Vérifier qu'un acteur ne peut pas accomplir une action excédant son niveau de privilège ou affectant des ressources ne lui appartenant pas.

### Ce qu'il faut chercher :
- **BOLA / IDOR (Broken Object Level Authorization)** :
  - L'application charge une entité via son identifiant (`/api/documents/:id`) sans valider que le document appartient bien à l'utilisateur ou à l'organisation de la session courante.
  - Vérifier systématiquement les opérations par lot (*bulk actions*, import, export) : le contrôle est-il appliqué sur chaque élément individuel ?
- **Escalade de privilèges** :
  - *Verticale* : appel direct d'une route réservée aux administrateurs ou présence de champs injectables dans le corps de requête (`role: "admin"`, `is_superuser: true`).
  - *Horizontale* : modification du profil ou des réglages d'un utilisateur du même niveau d'accès.
- **Divergence de permissions** : existence de plusieurs chemins de code pour modifier le même état (ex: endpoint REST vs endpoint GraphQL vs webhook) dont l'un applique un contrôle plus faible que les autres.

---

## 3. Manipulation de fichiers et de ressources
- **Traversée de répertoires (*Path Traversal*)** : inclusion de séquences `../`, liens symboliques, encodages URL (`%2e%2e%2f`) ou caractères nuls (`\0`) dans les chemins de fichiers permettant de lire ou écrire en dehors du dossier prévu.
- **Téléversement de fichiers non sécurisé (*Unrestricted File Upload*)** : absence de validation du type MIME réel (sniffing de magic bytes), exécution possible du fichier téléversé, écrasement de fichiers critiques via le nom de fichier original.
- **Extraction d'archives vulnérable (*Zip Slip*)** : extraction d'un fichier ZIP ou TAR contenant des chemins relatifs qui s'extraient en dehors du dossier de destination cible.
- **Condition de concurrence sur fichier (TOCTOU)** : vérification de l'existence ou des droits d'un fichier puis ouverture ultérieure sans verrou atomique.

---

## 4. Cryptographie et gestion des secrets
- **Génération aléatoire non cryptographique** : utilisation de `Math.random()` au lieu de `crypto.randomBytes()` ou `crypto.getRandomValues()` pour générer des jetons d'accès, des réinitialisations de mot de passe ou des identifiants de session.
- **Secrets codés en dur** : clés d'API (OpenAI, Stripe, AWS), mots de passe, clés privées ou secrets JWT commités dans le code source ou exposés dans les bundles JavaScript clients.
- **Comparaison non constante de secrets (Timing Attack)** : utilisation de l'opérateur d'égalité standard `===` au lieu de `crypto.timingSafeEqual()` pour comparer des hashs de mots de passe, des signatures HMAC ou des tokens de webhook.
