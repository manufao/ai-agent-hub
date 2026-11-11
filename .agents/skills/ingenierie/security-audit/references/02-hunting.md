# Phase 2 : chasse méthodique, invariants et vagues d'investigation

La chasse de vulnérabilités consiste à confronter chaque unité de couverture aux familles d'attaques pertinentes. Elle repose sur la vérification systématique des **invariants de sécurité** et s'organise en vagues successives pilotées par un critique de couverture.

---

## 1. Organisation par vagues selon le profil

L'audit progresse par vagues d'assignation d'unités du registre (`coverage-ledger.json`) :

- **Profil `quick`** :
  - **Vague 1 unique** : assignation des unités prioritaires (surfaces non authentifiées, auth, composants critiques).
  - **1 seul passage du critique de couverture** : relit les résultats, note les découvertes acceptées et consigne les zones restantes en `deferred` (différées). Pas de seconde vague de chasse.
- **Profil `standard`** :
  - **Vagues successives** : chaque vague traite un lot d'unités prioritaires.
  - **Critique de couverture après chaque vague** : détecte les zones mal couvertes ou les nouvelles frontières découvertes, et planifie la vague suivante.
  - S'arrête quand toutes les unités planifiées sont couvertes ou que le critique ne génère plus de nouvelles unités.
- **Profil `deep`** :
  - Vagues itératives poussées jusqu'à ce que le critique de couverture rende un verdict de passage **parfaitement propre** sans aucun angle mort résiduel.
  - Ré-assignation d'une seconde passe indépendante pour les composants à très haut risque (moteurs de permissions, multi-tenancy).

### Ordre de priorité des unités
Lorsque le temps ou le budget est compté, prioriser dans cet ordre strict :
1. Surfaces d'entrée non authentifiées ou à confiance minimale avant les surfaces authentifiées.
2. Frontières protégeant les ressources les plus précieuses (identifiants, données cross-tenant, exécution de commandes, autorité de release).
3. Zones de code modifiées récemment ou lacunes des audits précédents.
4. Familles d'attaque historiquement fécondes pour cette typologie d'application (ex: BOLA pour une API REST, prompt injection pour un système LLM).

---

## 2. La méthode d'investigation par invariants

Pour chaque unité analysée, l'agent ne cherche pas au hasard mais travaille à partir d'un **invariant de sécurité concret** :

### Les 6 étapes du traçage d'invariant
1. **Nommer l'acteur** et ses prérogatives de départ (ex: *Utilisateur authentifié de l'organisation A*).
2. **Identifier l'entrée acceptée** : valeur, action, transition d'état, sélecteur de ressource (ex: `orgId` dans l'URL ou dans le corps JSON).
3. **Localiser le contrôle attendu** : la fonction ou le middleware qui devrait rejeter, contraindre, isoler ou révoquer cette entrée (ex: `assertUserBelongsToOrg()`).
4. **Tracer le chemin exact** après ce point de contrôle : vérifier si le code utilise réellement l'entité validée ou s'il recharge une ressource brute sans filtre.
5. **Vérifier l'impact minimal** : s'arrêter au premier effet concret observable (lecture d'une donnée tierce, exécution non autorisée, modification de statut).
6. **Énoncer le correctif minimal** : localiser l'invariant manquant au dernier point de confiance.

### Tester les cas d'erreur et les divergences d'interprétation
Les failles résident presque toujours dans la gestion des cas d'erreur ou des cas limites :
- **Valeurs limites** : chaînes vides, tableaux vides `[]`, objets imbriqués `{}`, nombres négatifs, `0`, valeurs maximales, caractères nuls (`\0`), encodages mixtes (double URL-encoding, UTF-8 non canonique).
- **Divergences de parseurs** : différence entre ce qu'un routeur/proxy extrait et ce que le contrôleur applicatif interprète (ex: barres obliques doubles `//`, insensible à la casse, espaces blancs en fin de chaîne).
- **États concurrents et asynchrones** : opérations de vérification puis d'action non atomiques (TOCTOU), absence de verrouillage pessimiste ou de transaction en base de données.
- **Gestion des erreurs et annulations** : que se passe-t-il si un appel externe échoue en plein milieu d'une opération ? L'état partiel est-il rollbacké ou l'application reste-t-elle dans un état incohérent à privilèges ouverts ?

### Recherche de variantes
Dès qu'une vulnérabilité candidate (critique ou haute) est identifiée sur un composant :
- Rechercher immédiatement les **variantes lexicales et structurelles** dans les fichiers voisins du même sous-système (ex: un oubli de contrôle de tenant sur `GET /api/documents/:id` existe très souvent aussi sur `DELETE`, `PUT` ou `PATCH`).
- Consolider les découvertes issues de la même cause racine sous un même candidat avec les différentes traces associées.

---

## 3. Le rôle du critique de couverture

À la fin de chaque vague de chasse, un examen critique est mené pour challenger le travail accompli.

### Prompt du critique de couverture
```text
Tu es le critique de couverture de sécurité. Tu n'as pas chassé ces unités.
Examine le registre de couverture et les conclusions de la vague précédente.
Ton rôle est de trouver les lacunes, les fausses suppositions et les angles morts.

Pour chaque unité déclarée "couverte" :
1. Les chemins audités représentent-ils réellement l'intégralité du sous-système ou seulement un sous-ensemble superficiel ?
2. Le chasseur a-t-il suivi les chemins secondaires (batch, exports, webhooks, crons, routes dépréciées) menant au même effet ?
3. Le chasseur a-t-il supposé l'existence d'une protection sans en apporter la preuve dans le code source ?

Pour chaque zone ou frontière non couverte apparue pendant la chasse :
1. Crée une nouvelle unité de couverture avec son point d'entrée et sa frontière.
2. Détermine si elle doit être planifiée pour la prochaine vague ou marquée comme deferred selon le profil.
```

---

## 4. Formalisation et déduplication des candidats

Chaque vulnérabilité candidate produite lors d'une vague doit être formatée de manière univoque :
- **Empreinte stable (*Fingerprint*)** : hash ou identifiant pérenne dérivé du point d'entrée, de la cause racine et du récepteur (permet de dédupliquer les découvertes entre les vagues et de les comparer avec les audits passés).
- **Statut proposé** :
  - `proposed_confirmed` : trace complète vérifiée de l'entrée au sink avec démonstration d'impact.
  - `proposed_needs_validation` : chaîne d'appel complète mais dépendance envers une hypothèse d'infrastructure non source-vérifiable.
- **Détails de preuve** : fichiers et lignes exacts de chaque saut de la trace.

Toute unité dont l'examen est terminé sans découverte de faille est passée au statut `covered`.
Toute unité dont l'analyse a été empêchée est marquée `blocked` avec le motif précis du blocage.
