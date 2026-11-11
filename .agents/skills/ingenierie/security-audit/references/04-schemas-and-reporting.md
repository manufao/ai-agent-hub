# Phase 4 : formats des livrables et schémas de données

Ce document définit les formats et schémas standardisés utilisés lors d'un audit complet pour consigner les découvertes et assurer la traçabilité de la couverture.

---

## 1. Arborescence des livrables

En mode audit complet, tous les artéfacts sont écrits dans `<racine>/.docs/security-audit/AAAA-MM-JJ/`, où `<racine>` est la racine du dépôt audité (`git rev-parse --show-toplevel`). Ce dossier doit être ignoré par git (voir `SKILL.md`). L'utilisateur peut choisir un autre dossier, à la même condition.

```text
.docs/security-audit/2026-11-08/
├── REPORT.md               # Rapport de synthèse lisible (synthèse exécutive, découvertes confirmées, remédiations)
├── run-metadata.json       # Métadonnées du run (périmètre, profil, révision Git, date)
├── findings.json           # Découvertes exhaustives (format JSON structuré machine)
└── coverage-ledger.json    # Registre de couverture (composants couverts, bloqués, hors périmètre)
```

---

## 2. Schéma des métadonnées (`run-metadata.json`)

Consigne les conditions d'exécution de l'audit pour permettre des comparaisons temporelles :

```json
{
  "run_id": "audit-20261108-01",
  "audit_date": "2026-11-08T10:00:00Z",
  "target_repo": "mon-organisation/mon-projet",
  "source_ref": {
    "commit": "a1b2c3d4e5f67890",
    "branch": "main",
    "dirty_worktree": false
  },
  "profile": "standard",
  "scope_paths": [
    "src/api/",
    "src/services/",
    "src/auth/"
  ],
  "run_status": "completed",
  "summary": {
    "units_total": 24,
    "units_covered": 20,
    "units_out_of_scope": 4,
    "findings_confirmed": 2,
    "findings_needs_validation": 1,
    "findings_rejected": 5
  }
}
```

---

## 3. Schéma des découvertes (`findings.json`)

Centralise chaque vulnérabilité candidate ayant été examinée lors de l'audit :

```json
{
  "findings": [
    {
      "id": "SEC-001",
      "fingerprint": "fp_sql_search_customer_42a8b9",
      "title": "Injection SQL via concaténation de requête dans handleCustomerSearch",
      "verdict": "confirmed",
      "severity": "high",
      "attack_class": "injection-sql",
      "source": {
        "file": "src/api/search.ts",
        "line": 42,
        "symbol": "handleCustomerSearch",
        "input_parameter": "req.query.q"
      },
      "sink": {
        "file": "src/db/customers.ts",
        "line": 88,
        "symbol": "findRaw",
        "operation": "db.execute"
      },
      "trace": [
        { "file": "src/api/search.ts", "line": 42, "role": "entrypoint", "note": "Reçoit req.query.q sans validation Zod" },
        { "file": "src/services/customer.service.ts", "line": 65, "role": "propagation", "note": "Concatène la valeur dans un filtre SQL brut" },
        { "file": "src/db/customers.ts", "line": 88, "role": "sink", "note": "Exécute la chaîne directement via le driver de base" }
      ],
      "affected_principal": "Utilisateur authentifié standard",
      "breached_boundary": "Client -> Données sensibles d'autres organisations",
      "impact": "Un utilisateur peut extraire la base de clients complète d'un autre tenant en injectant des clauses UNION SELECT.",
      "refutation_attempts": "Tentative de réfutation : vérifié que le middleware de routage n'applique aucun filtre d'échappement et que l'ORM n'est pas utilisé sur cette méthode brute.",
      "remediation": "Remplacer la concaténation de chaînes par une requête paramétrée avec arguments positionnels ($1, $2)."
    },
    {
      "id": "SEC-002",
      "fingerprint": "fp_auth_ratelimit_login_10f3c2",
      "title": "Absence apparente de limitation de débit sur l'endpoint d'authentification",
      "verdict": "needs_validation",
      "severity": null,
      "attack_class": "resource-exhaustion",
      "source": {
        "file": "src/api/auth.ts",
        "line": 15,
        "symbol": "loginRoute",
        "input_parameter": "req.body"
      },
      "unresolved_blocker": "Le code source applicatif ne contient aucun middleware de limitation de débit (rate limiting). Une règle de protection externe (Cloudflare WAF ou AWS WAF) peut exister en production sans être visible dans ce dépôt.",
      "validation_plan": "Vérifier la configuration du WAF ou du reverse-proxy de production pour s'assurer qu'une règle limite les tentatives de connexion sur /api/auth/login à un seuil raisonnable (ex: 5 req/min par IP).",
      "remediation": "Si aucune règle WAF n'existe, intégrer un rate-limiter applicatif (ex: express-rate-limit ou Redis token bucket)."
    },
    {
      "id": "SEC-003",
      "fingerprint": "fp_xss_profile_name_77d1a4",
      "title": "Suspicion de XSS réfléchi dans l'affichage du nom de profil",
      "verdict": "rejected",
      "severity": null,
      "rejection_reason": "Le moteur de rendu React échappe nativement toutes les interpolations textuelles {user.name}. Aucun dangerouslySetInnerHTML n'est employé sur cette vue."
    }
  ]
}
```

---

## 4. Schéma du suivi de couverture (`coverage-ledger.json`)

Assure que chaque zone du périmètre a fait l'objet d'un examen tracé :

```json
{
  "units": [
    {
      "id": "unit-auth-api",
      "subsystem": "Authentification & Sessions",
      "surface": "HTTP API (/api/auth)",
      "boundary": "Anonyme -> Authentifié",
      "attack_classes": ["web-and-auth", "resource-exhaustion"],
      "paths": ["src/api/auth/", "src/services/token.ts"],
      "status": "covered",
      "reviewed_at": "2026-11-08T10:15:00Z",
      "findings_ids": ["SEC-002"]
    },
    {
      "id": "unit-customer-search",
      "subsystem": "Gestion Clients",
      "surface": "HTTP API (/api/customers/search)",
      "boundary": "Tenant A -> Tenant B",
      "attack_classes": ["injection-sql", "data-isolation"],
      "paths": ["src/api/search.ts", "src/services/customer.service.ts", "src/db/customers.ts"],
      "status": "covered",
      "reviewed_at": "2026-11-08T10:30:00Z",
      "findings_ids": ["SEC-001"]
    },
    {
      "id": "unit-admin-backoffice",
      "subsystem": "Backoffice Administrateur",
      "surface": "HTTP API (/api/admin)",
      "boundary": "Utilisateur standard -> Administrateur",
      "paths": ["src/admin/"],
      "status": "out_of_scope",
      "reason": "Exclu explicitement par la configuration de scope (audit limité à l'espace client public)."
    }
  ]
}
```

---

## 5. Gabarit du rapport d'audit (`REPORT.md`)

```markdown
# Rapport d'audit de sécurité

- **Dépôt** : `mon-organisation/mon-projet`
- **Date** : 2026-11-08
- **Révision Git** : `a1b2c3d` (branche: `main`)
- **Périmètre** : `src/api/`, `src/services/`, `src/auth/`
- **Profil appliqué** : `standard`
- **Synthèse** : 20 unités couvertes | 0 critique | 1 haut | 0 moyen | 1 en attente de validation

---

## 1. Synthèse exécutive
[Résumé en 2-3 paragraphes de l'état général de la sécurité de la base de code, des points forts identifiés et des risques prioritaires à traiter.]

---

## 2. Découvertes confirmées (`confirmed`)

### [HIGH] SEC-001 : Injection SQL dans handleCustomerSearch
- **Localisation** : `src/api/search.ts:42`
- **Acteur et frontière** : utilisateur authentifié → données des autres tenants
- **Démonstration de la trace source-to-sink** :
  1. *Entrée* : `src/api/search.ts:L42` — paramètre `req.query.q` non assaini.
  2. *Propagation* : `src/services/customer.service.ts:L65` — injection dans une chaîne SQL composite.
  3. *Récepteur (Sink)* : `src/db/customers.ts:L88` — méthode `db.execute()` exécutant le texte brut.
- **Impact concret** : Extraction de données d'autres comptes clients via injection `UNION SELECT`.
- **Réfutation contradictoire (Avocat du diable)** : aucun middleware n'échappe la valeur et cette fonction appelle le driver brut au lieu de l'ORM utilisé ailleurs.
- **Correctif minimal préconisé** :
  ```typescript
  // Utiliser les paramètres positionnels au lieu de l'interpolation
  await db.execute('SELECT * FROM customers WHERE org_id = $1 AND name ILIKE $2', [currentOrgId, `%${query}%`]);
  ```

---

## 3. Points en attente de validation (`needs_validation`)

### SEC-002 : Absence de rate limiting sur /api/auth/login
- **Localisation** : `src/api/auth.ts:15`
- **Fait manquant hors code** : Présence ou absence d'une règle de limitation au niveau du WAF Cloudflare ou du reverse proxy en production.
- **Plan de levée de doute** : Vérifier sur la console d'administration réseau si une règle limite les requêtes POST sur cet endpoint.

---

## 4. Recommandations de durcissement (hors vulnérabilités)
- Poser les drapeaux `HttpOnly`, `Secure` et `SameSite=Lax` sur le cookie de session, même si aucune faille XSS n'a été trouvée.
- Ajouter des en-têtes de sécurité HTTP (Content-Security-Policy, X-Frame-Options) dans les middlewares globaux.
```
