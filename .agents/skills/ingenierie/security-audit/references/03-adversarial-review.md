# Phase 3 : validation contradictoire et calibration des sévérités

L'évaluation de vulnérabilités par une IA souffre d'un biais cognitif majeur : le **biais de confirmation**. Dès qu'un scénario d'attaque est envisagé, le modèle a tendance à ignorer les défenses environnantes, à inventer une portée d'impact démesurée et à gonfler le score de sévérité.

Pour éliminer les faux positifs avant de publier le rapport, **chaque vulnérabilité candidate est confiée à un rôle d'avocat du diable dont la mission exclusive est de réfuter l'exploitabilité**.

---

## 1. Le rôle et le prompt de l'avocat du diable

L'agent qui vérifie une découverte ne doit pas être celui qui l'a formulée. Il ne cherche pas à justifier la découverte, mais à **prouver qu'elle ne fonctionne pas**.

### Prompt du vérificateur contradictoire
```text
Tu n'as pas rédigé cette vulnérabilité candidate. Ton unique objectif est de tenter de la RÉFUTER
à partir du code source du dépôt et de la logique applicative.
Tu opères en lecture seule sur la base de code.

Pour le candidat fourni :
1. Vérifie chaque étape de la trace citée : fichier, ligne, contexte.
   Confirme que la première ligne est bien un point d'entrée accessible à l'acteur prétendu
   et que la dernière est bien un récepteur (sink) sensible non sécurisé.
2. Reconstitue les contrôles les plus stricts existant sur le chemin :
   - Un middleware en amont filtre-t-il ou assainit-il déjà la donnée ?
   - Le schéma de validation (Zod, Joi, type runtime) rejette-t-il la charge utile ?
   - Le framework neutralise-t-il automatiquement la menace (ex: requêtes préparées, échappement JSX) ?
   - L'acteur ciblé dispose-t-il déjà légitimement de ce droit par conception ?
3. Si la faille résiste à la réfutation :
   - Calibre la sévérité au niveau du dommage RÉELLEMENT démontré (ne pas extrapoler).
   - Décision : "confirmed".
4. Si la faille dépend d'une configuration externe non vérifiable dans le code (WAF, DNS, reverse-proxy) :
   - Ne pas attribuer de sévérité.
   - Formuler le fait manquant précis et le plan de vérification non destructif.
   - Décision : "needs_validation".
5. Si un mécanisme de défense neutralise l'attaque :
   - Expliquer précisément pourquoi le scénario est invalidé.
   - Décision : "rejected".

Retourne ta décision motivée avec la trace corrigée et la formulation exacte de la cause racine.
```

---

## 2. Les repères de calibration de la sévérité

Une règle fondamentale : **la sévérité globale ne peut jamais dépasser l'impact directement démontré**.
Seules les découvertes au statut `confirmed` reçoivent une sévérité.

### Les 5 niveaux de sévérité
- **`critical`** (Critique) :
  - Exécution de code arbitraire à distance (RCE).
  - Accès complet et direct au magasin de données sans authentification.
  - Prise de contrôle totale de n'importe quel compte utilisateur sans interaction.
- **`high`** (Élevé) :
  - L'acteur neutralise complètement un contrôle de sécurité explicite avec des conséquences majeures :
    - Contournement complet d'authentification.
    - Lecture ou écriture arbitraire entre tenants distincts (IDOR sévère).
    - Exécution de script stocké (XSS Stored) affectant d'autres utilisateurs.
    - Exécution de code authentifiée ou arrêt à distance non authentifié d'un service partagé.
- **`medium`** (Moyen) :
  - Violation réelle d'une frontière de confiance mais avec un **rayon d'impact limité**, des prérequis rares ou des conséquences confinées à un sous-ensemble restreint de ressources (ex: IDOR sur une ressource non sensible, XSS Reflected nécessitant une interaction complexe, déni de service temporaire sur un thread isolé).
- **`low`** (Faible) :
  - Divulgation d'informations internes non secrètes (arborescence interne, versions logicielles précises, stack traces sans données sensibles).
  - Effet nécessitant un effort disproportionné pour un gain minime.
- **`informational`** (Informatif) :
  - Constat de sécurité avéré mais sans impact direct démontrable. Utile principalement comme brique préliminaire pour un durcissement de défense en profondeur.

### La question qui tranche : haute ou moyenne
> *« Est-ce que le résultat démontré annule complètement un contrôle de sécurité explicite pour une action aux conséquences graves, ou est-ce qu'il ne fait que l'affaiblir ? »*  
> Si vous ne pouvez pas nommer précisément le dommage concret causé au propriétaire de la ressource, **la sévérité est plus basse que ce que vous ressentez**.

---

## 3. Discipline stricte des statuts

### Statut `needs_validation`
- Indique qu'une hypothèse de vulnérabilité est crédible dans le code source, mais qu'un fait décisif extérieur au dépôt empêche de la confirmer ou de l'infirmer (ex: comportement du WAF Cloudflare en production, injection d'un secret d'infrastructure, configuration d'un load balancer tiers).
- **Règle absolue : aucune sévérité ne doit être attribuée** (la sévérité reste `null`). Assigner une sévérité à une supposition non prouvée produit du bruit et des alertes injustifiées.
- Formuler systématiquement un plan d'action précis et non destructif pour que le propriétaire de l'application puisse lever le doute.

### Statut `rejected`
- Indique qu'un candidat a été investigué mais réfuté (ex: protection native du framework, absence de surface d'exposition réelle, action autorisée par conception).
- Consigner explicitement la raison de rejet dans les métadonnées pour éviter que de futures sessions d'audit ne reprennent la même fausse piste.
