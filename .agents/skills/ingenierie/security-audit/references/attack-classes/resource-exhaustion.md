# Familles d'attaque épuisement de ressources et disponibilité

Ce guide traite des vulnérabilités permettant à un acteur externe de dégrader ou d'interrompre le service en consommant excessivement du CPU, de la mémoire, des connexions de base de données ou des quotas d'API payantes.

---

## 1. Déni de service par expression régulière (ReDoS)
- **Expressions régulières avec backtracking catastrophique** : expressions complexes contenant des groupes imbriqués avec quantificateurs de répétition (ex: `(a+)+$`, `(a|aa)+$`) appliquées sur des chaînes fournies par l'utilisateur sans limite de longueur.
- **Vérification de formats complexes (emails, URLs, slugs)** : utilisation de regex maison vulnérables au lieu de validateurs éprouvés ou de bibliothèques dédiées.

---

## 2. Consommation excessive de mémoire et CPU
- **Absence de limite de taille sur les payloads entrants** : middlewares de parsing (`express.json()`, `bodyParser`) configurés sans paramètre `limit` strict, acceptant des corps de requêtes de plusieurs dizaines de mégaoctets menant à un plantage Out-Of-Memory (OOM).
- **Opérations synchrones bloquantes sur la boucle d'événements** : parsing synchrone de fichiers JSON massifs (`JSON.parse()` sur de grands flux), calculs cryptographiques lourds ou manipulation d'images en bloquant le thread principal Node.js.
- **Décompression de bombes d'archives (*Zip Bomb / Decompression Bomb*)** : extraction ou parsing de fichiers compressés (ZIP, GZIP, XML avec entités récursives) générant plusieurs gigaoctets en mémoire à partir d'un petit fichier entrant.

---

## 3. Épuisement de la base de données et des connexions
- **Endpoints de listing non paginés** : routes API retournant des collections complètes sans clause `LIMIT` ou acceptant un paramètre `limit=999999999` non borné.
- **Requêtes N+1 et jointures cartésiennes non contrôlées** : requêtes complexes chargeant des milliers d'enregistrements en mémoire pour chaque élément d'une liste.
- **Non-libération des connexions de pool** : absence de bloc `try ... finally { client.release() }` lors de l'acquisition de connexions de base de données directes, menant à la saturation du pool de connexions lors des premières erreurs.

---

## 4. Épuisement de quotas et boucles de facturation
- **Appels d'API tierces payantes sans limitation de débit** : endpoints publics non authentifiés déclenchant des requêtes coûteuses vers des modèles LLM (OpenAI, Anthropic), des envois de SMS (Twilio) ou des calculs cartographiques (Google Maps), permettant à un attaquant de vider les quotas ou de générer des coûts financiers majeurs. *Une limitation peut exister hors du code (WAF, passerelle) : sans preuve dans le dépôt, `needs_validation`.*
- **Boucles infinies de retry sur webhooks ou files de messages** : jobs en échec renvoyés indéfiniment dans la file de messages sans backoff exponentiel ni Dead Letter Queue (DLQ).
