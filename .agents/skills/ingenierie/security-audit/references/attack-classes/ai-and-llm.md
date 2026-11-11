# Familles d'attaque IA et composants LLM

Ce guide s'applique dès qu'une application intègre des modèles de langage (LLM), des agents autonomes, des serveurs/clients MCP (*Model Context Protocol*), du RAG (*Retrieval-Augmented Generation*) ou de l'appel d'outils (*Tool Calling*).

---

## 1. Injection de prompt indirecte
Le modèle ingère des données externes non fiables (emails reçus, pages web scrapées, PDF téléversés, profils d'utilisateurs tiers) qui contiennent des consignes malveillantes dissimulées visant à détourner le comportement du modèle.

### Ce qu'il faut chercher :
- Concaténation de données utilisateur ou de résultats de recherche directement dans le prompt sans délimitation stricte (absence de balises XML distinctives ou de messages système isolés).
- Données non fiables intégrées dans le contexte système d'un agent capable d'effectuer des actions (envoi d'emails, écriture en base, exécution d'outils).

---

## 2. Détournement d'outils et exécution d'actions
Les agents autonomes et systèmes d'outils (Function Calling / MCP) traduisent des prédictions textuelles du modèle en actions réelles dans le système.

### Ce qu'il faut chercher :
- **Absence de barrière de confirmation humaine (*Human-in-the-loop*)** sur les opérations destructives (suppression de compte, virement bancaire, déploiement de code, modification de droits).
- **Validation insuffisante des arguments d'outils** : le code de l'outil suppose que le LLM respecte scrupuleusement les contraintes de types. Par exemple, un outil `executeDatabaseQuery(sql)` ou `readFile(path)` appelé directement sans sanitization des paramètres générés par le LLM.
- **Confusion d'identité MCP** : un client MCP accorde des privilèges larges à un serveur MCP local ou distant sans vérifier l'origine ni isoler l'espace de travail.

---

## 3. Empoisonnement du RAG et de la mémoire persistante
- **Empoisonnement de base de connaissances** : un utilisateur peut téléverser un document dans un corpus partagé pour biaiser les réponses futures fournies aux autres utilisateurs.
- **Pollution de la mémoire conversationnelle** : persistance d'instructions malveillantes dans l'historique ou le profil utilisateur qui continueront d'influencer les sessions futures.

---

## 4. Fuite d'informations par le modèle
- **Extraction de prompt système (*System Prompt Extraction*)** : le prompt contient des clés secrètes, des tokens d'API, des règles métier confidentielles ou des données personnelles d'autres utilisateurs pouvant être révélées suite à un jailbreak.
- **Fuite cross-tenant dans le contexte** : injection de fragments de documents appartenant à d'autres organisations dans le même contexte de prompt en raison d'un mauvais filtrage des embeddings vectoriels.

---

## 5. Rendu non sécurisé des sorties du modèle
- **XSS via Markdown/HTML généré par le LLM** : l'application affiche la réponse du LLM dans le navigateur via un parser Markdown sans désactiver le HTML brut ni assainir les balises `<script>`, `<iframe>` ou les attributs `javascript:`.
- **Désérialisation aveugle** : parsing JSON ou exécution de code généré par le LLM sans validation de schéma Zod en aval.
