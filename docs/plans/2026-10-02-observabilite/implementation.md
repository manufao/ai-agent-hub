# Plan d'implémentation : observabilité minimale du site

> Agent : Forge · 2026-10-02 · PR #26 (`feat/observability`)
>
> Plan retranscrit après coup depuis le rapport de Forge, qui n'avait pas été enregistré à l'origine. Les décisions de l'utilisateur et l'écart avec le plan figurent à la fin.

Périmètre : les scénarios 1 à 5 du tableau d'observabilité (fichier illisible ou en-tête invalide, page qui plante, 404, dossier `.agents/` absent, port occupé). Hors périmètre : métrique de durée par route et alertes.

## Écarts entre le tableau de départ et le code

1. Le tableau disait « aucun `try/catch` » et « un seul message écrit » : faux. Les contrôleurs `home`, `agent`, `skills`, `examples` et `license` avaient chacun un `try/catch` avec un `console.error` (objet erreur brut, sans URL) et un 500 en texte brut anglais.
2. Les 404 existaient déjà en français dans les contrôleurs, mais n'étaient jamais logués. Le 404 par défaut du routeur et ceux de `static` et `license` étaient en texte brut anglais.
3. Contradiction interne de la ligne 3 : « méthode + chemin, sans valeur saisie » est impossible, le chemin est la valeur saisie. Retenu : loguer la **famille de route** (`agents`, `skills`, `examples`, `static`, `license`, `unmatched`).
4. `parseFrontmatter` ne lève jamais d'erreur : un `---` jamais refermé était pris pour « pas d'en-tête ». Le signal « en-tête invalide » était à créer.
5. `renderPage` relit agents, skills et exemples à chaque page, sans cache : un seul fichier illisible donnait un 500 sur tout le site, et un log « par lecture » se serait répété à chaque requête (déduplication nécessaire).
6. Au démarrage, rien n'était vérifié. `server.listen` n'avait pas de handler `error` : `EADDRINUSE` plantait avec une pile brute, et `PORT=abc` donnait `NaN`.
7. Trouvaille hors périmètre, `static.controller.ts` : `join(rootDir, 'public', req.url)` avec l'URL brute. `/css/../../package.json` sortait de `public/` (traversée de chemin), et `/css/` provoquait un `EISDIR` non attrapé.

Contraintes d'outillage : ESLint interdit `console.*` ; `vitest.config.ts` exclut `src/**/index.ts` de la couverture, donc aucune logique de démarrage dans un `index.ts` ; 100 % de couverture exigés.

## Plan

Chaque étape laisse le dépôt vert avec `make check`.

1. **Logger** : un module de log, une ligne JSON par événement, sans valeur saisie ni contenu de fichier. Un helper pour l'URL loguée (chemin sans query string, `[redacted]` si un segment n'est pas sûr ou si le chemin dépasse 200 caractères) et un pour la famille de route.
2. **500 centralisé dans le routeur** : `try/catch` autour du handler, log `http.unhandled` avec la pile, page 500 statique en français écrite en dur (la panne peut venir de la lecture de `.agents/`). Si les en-têtes sont déjà partis, seulement `res.end()`. Suppression des `try/catch` dupliqués des contrôleurs. 404 par défaut en page française.
3. **Log des 404** en un seul point, dans `main.ts`, sur l'événement `finish` de la réponse.
4. **Fichiers de contenu** : un helper de lecture qui signale un en-tête non refermé (`content.frontmatter_invalid`) et un helper de listage qui logue un fichier illisible (`content.unreadable`), avec déduplication par fichier. Décision à trancher : échec rapide ou mode dégradé.
5. **Démarrage** : vérification du port et des dossiers de contenu, handler `error` du serveur (`startup.port_in_use`, `startup.listen_failed`), code de sortie 1, logique hors de `index.ts`.
6. **Route `/health`** (optionnelle) : 200 si `.agents/` est lisible, 503 sinon, sans passer par la mise en page.
7. **Documentation** (en anglais) : tableau des événements dans le README, règle de log dans `AGENTS.md`.

Risques relevés : les specs de contrôleurs vérifiaient le 500 et le `console.error`, à migrer vers des tests de routeur ; la pile peut contenir des chemins locaux (voulu pour le diagnostic, jamais dans la réponse) ; le scénario 4 ne peut se valider que par test unitaire, il n'y a pas de Dockerfile dans `docker/` (le dev compose monte tout le dépôt).

## Décisions

- **Fichier de contenu illisible** : mode dégradé. Le fichier est ignoré et logué une fois, le site continue sans lui.
- **Logger** : une librairie plutôt qu'un module maison. Retenu : `pino`.
- **404** : famille de route, comme proposé.
- **Vérification au démarrage** : le dossier `examples/` est contrôlé en plus de `.agents/` et `.agents/skills/`.
- **`/health`** : inclus.
- **Faille de `static.controller.ts`** : corrigée dans la même PR, pas dans un ticket séparé.

## Écart entre le plan et ce qui a été fait

- Étape 1 : `pino` remplace le module de log maison ; il n'y a donc plus de sérialisation à écrire, seulement la configuration et les helpers d'URL.
- Étape 4 : l'avertissement pour un skill sans `name` ni `description` n'a pas été fait.
- Ajout après coup : un lien « État du site » vers `/health` dans le pied de page du site.
