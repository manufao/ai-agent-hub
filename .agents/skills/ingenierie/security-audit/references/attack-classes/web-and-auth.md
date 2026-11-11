# Familles d'attaque web, HTTP et authentification

Ce guide détaille les vulnérabilités liées aux protocoles HTTP, aux mécanismes d'authentification, à la gestion de sessions et aux passerelles API.

---

## 1. Jetons JWT et authentification par token
- **Algorithme `none` ou substitution d'algorithme** : le vérificateur accepte un header `alg: "none"` ou confond les algorithmes (un jeton signé en HMAC-SHA256 avec la clé publique RSA/ECDSA comme secret est accepté).
- **Vérification de signature absente ou partielle** : décodage du payload via `jwt.decode()` au lieu d'une vérification cryptographique via `jwt.verify()`.
- **Expiration et révocation ignorées** : absence de vérification du claim `exp` ou absence de liste noire/invalidation côté serveur lors de la déconnexion ou du changement de mot de passe.
- **Clé secrète faible ou exposée** : secret HMAC prévisible, codé en dur ou partagé entre différents environnements (staging et production).

---

## 2. Gestion de sessions et cookies
- **Drapeaux de sécurité manquants sur les cookies** (*Durcissement, sauf si une XSS ou une interception est démontrée sur le même cookie*) :
  - Absence de `HttpOnly` (rend le cookie de session accessible aux scripts JS en cas de faille XSS).
  - Absence de `Secure` (permet la transmission du cookie en clair sur HTTP).
  - Mauvaise configuration de `SameSite` (`None` sans protection CSRF adéquate).
- **Fixation de session** : conservation du même identifiant de session avant et après l'authentification de l'utilisateur.
- **Fuite d'identifiants de session** : passage de tokens de session dans les paramètres d'URL (visibles dans l'historique du navigateur, les logs de reverse proxy et le header `Referer`).

---

## 3. Protocoles OAuth2, OIDC et SAML
- **Absence de paramètre `state` (CSRF OAuth)** : l'application n'associe pas un paramètre `state` aléatoire et lié à la session avant de rediriger l'utilisateur vers le fournisseur d'identité, permettant d'attacher le compte d'un attaquant à la victime.
- **Validation lâche de `redirect_uri`** : acceptation de sous-domaines arbitraires, de chemins ouverts ou de caractères joker permettant de rediriger le code d'autorisation vers un serveur malveillant.
- **Échange de code non protégé (PKCE manquant)** : absence de `code_challenge` / `code_verifier` sur les clients publics (SPAs, apps mobiles).
- **Confusion d'identité par email** : fusion automatique de comptes basée sur l'adresse email sans vérifier au préalable si l'adresse est vérifiée par le fournisseur OAuth.

---

## 4. Routage HTTP, proxies et divergences de parseurs
- **Normalisation d'URL divergente** : différences d'interprétation entre un reverse proxy (ex: Nginx, Cloudflare) et le framework d'application (ex: Express, Fastify, Next.js) :
  - Barres obliques doubles (`//api/admin` vs `/api/admin`).
  - Barres obliques finales (`/admin/` vs `/admin`).
  - Encodage d'URL non canonique (`%2e%2e/` ou caractères UTF-8 non standards).
- **Server-Side Request Forgery (SSRF)** :
  - L'application effectue des requêtes réseau sortantes vers une URL fournie par l'utilisateur.
  - Absence de blocage des plages d'adresses IP privées et réservées : `127.0.0.1`, `localhost`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, et surtout `169.254.169.254` (point de terminaison des métadonnées cloud AWS/GCP/Azure).
  - Contournements DNS rebinding : validation de l'adresse IP au moment du check puis ré-interrogation DNS menant à une IP privée lors du fetch réel.

---

## 5. Empoisonnement et tromperie de cache
- **En-têtes non pris en compte dans la clé de cache** : utilisation d'en-têtes HTTP non répertoriés dans la clé de cache (ex: `X-Forwarded-Host`, `X-Original-URL`) qui influencent le rendu HTML mis en cache et servi aux visiteurs ultérieurs.
- **Cache Deception** : manipulation de l'extension d'URL (ex: `/profile/settings.css`) pour amener un CDN à mettre en cache publiquement une page contenant des données privées de profil utilisateur.
