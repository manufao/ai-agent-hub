# Familles d'attaque côté client et navigateur

Ce guide s'applique aux applications web modernes côté client : Single Page Applications (React, Vue, Svelte, Angular), extensions de navigateur, intégrations WebViews et communications asynchrones.

---

## 1. Cross-Site Scripting basé sur le DOM (DOM XSS)
Tracer les données provenant de sources non fiables dans le navigateur jusqu'à des récepteurs d'exécution JavaScript.

### Sources non fiables dans le DOM :
- `window.location.search`, `window.location.hash`, `window.location.href`.
- `document.referrer`.
- Événements `message` reçus via `window.addEventListener('message', ...)`.
- Données extraites de `localStorage`, `sessionStorage` ou de cookies non `HttpOnly`.

### Récepteurs d'exécution (*sinks*) :
- Manipulation directe du HTML : `element.innerHTML`, `element.outerHTML`, `document.write()`.
- Rendu dynamique dans les frameworks :
  - React : `dangerouslySetInnerHTML={{ __html: ... }}`.
  - Svelte : `{@html ...}`.
  - Vue : `v-html="..."`.
- Exécution de code : `eval()`, `new Function()`, `setTimeout(string, ...)`, `setInterval(string, ...)`.
- Redirection de navigation : assignation directe à `location.href = userInput` sans vérifier que le protocole n'est pas `javascript:`.

---

## 2. Pollution de prototype
Modification non contrôlée des propriétés de `Object.prototype` permettant de modifier le comportement global de l'application JavaScript.

### Ce qu'il faut chercher :
- Fonctions de fusion récursive (*deep merge*) faites maison ou bibliothèques vulnérables.
- Assignation d'objets avec clés dynamiques sans vérification :
  - Traitement des clés `__proto__`, `constructor` ou `prototype`.
- Objets utilisés comme dictionnaires de configuration sans être créés avec `Object.create(null)` ou sans `Object.freeze()`.

---

## 3. Sécurité des messages inter-fenêtres (`postMessage`)
- **Absence de vérification de l'origine de l'expéditeur** : écoute d'événements `window.addEventListener('message', (event) => ...)` sans vérifier que `event.origin` correspond strictement au domaine attendu.
- **Envoi avec origine universelle** : utilisation de `targetWindow.postMessage(data, '*')` avec des données sensibles ou des jetons d'authentification au lieu de spécifier le domaine cible précis.

---

## 4. Configuration CORS (Cross-Origin Resource Sharing)
- **Réflexion aveugle de l'en-tête Origin** : le serveur lit le header `Origin` de la requête et le réinjecte dynamiquement dans `Access-Control-Allow-Origin` combiné avec `Access-Control-Allow-Credentials: true`.
- **Origine `null` autorisée** : configuration autorisant l'origine `null` (utilisée par les iframes sandboxées et les fichiers locaux).
- **Validation d'expression régulière trop lâche** : regex vérifiant si le domaine "contient" l'URL de confiance (ex: `/mon-site.com/` autorisant `mon-site.com.attacker.com`).

---

## 5. Stockage local et secrets dans le navigateur
- **Tokens sensibles dans le localStorage** : stockage de jetons de session ou de refresh tokens JWT de longue durée dans le `localStorage` (exposés à toute faille XSS sur le même domaine). *Durcissement, sauf si une XSS est démontrée sur le même domaine.*
- **Clés d'API secrètes embarquées dans le bundle frontend** : variables d'environnement préfixées par `VITE_`, `NEXT_PUBLIC_`, `REACT_APP_` contenant des clés avec des droits d'écriture ou d'administration backend.
