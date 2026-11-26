---
name: svelte-conventions
description: "À utiliser pour écrire, relire ou valider du code Svelte 5 / SvelteKit : runes ($state, $derived, $effect, $props), interface Props, événements, absence de syntaxe Svelte 4, vérification par svelte-check et ESLint, choix de la structure d'un projet SvelteKit. Complète project-structure et styling-conventions."
---

# Conventions Svelte 5

Ce qui est propre à Svelte 5. Dossiers et barrels : `project-structure`. Style : `styling-conventions`.

## Quand l'utiliser

- Création ou modification de fichiers `.svelte` ou `.svelte.ts`
- Revue de code Svelte, migration de Svelte 4 vers Svelte 5

## Règles

| Besoin | Svelte 5 | Interdit |
|---|---|---|
| État | `let count = $state(0)`, typé `$state<User \| null>(null)` | `let count = 0` attendu réactif |
| Valeur dérivée | `$derived(count * 2)`, calcul long `$derived.by(() => …)` | `$: doubled = count * 2` |
| Effet de bord | `$effect(() => { … })` | `$: console.log(count)` |
| Props | `let { title, count = 0 }: Props = $props()` | `export let title` |
| Événements | `onclick={handleClick}` | `on:click={handleClick}` |

- Préférer `$derived` à `$effect` : un `$effect` qui écrit dans un `$state` est presque toujours un `$derived` mal écrit. `$effect` sert à synchroniser avec l'extérieur (DOM, timer, abonnement), avec nettoyage si besoin.
- Toujours une `interface Props` nommée. Les callbacks en props s'écrivent en minuscules (`onclick`, `onsubmit`). `bind:value` reste valide, en vérifiant son type.
- Ordre du fichier : `<script>`, markup, `<style>`. Un composant par fichier, en PascalCase.
- Si le projet a un système d'i18n (Paraglide par exemple), tout texte visible passe par lui.
- Labels ARIA sur les éléments interactifs sans texte visible.

### Vérification sans serveur MCP

Aucun serveur MCP n'est requis : le compilateur et l'outillage du projet suffisent.

- **Mode runes forcé** : `compilerOptions: { runes: true }` dans `svelte.config.js`. La syntaxe Svelte 4 (`$:`, `export let`, `on:click`) ne compile alors plus, ce qui vaut mieux qu'une consigne à respecter.
- **`svelte-check`** (via `pnpm run check`) : erreurs de types et avertissements d'accessibilité.
- **`eslint-plugin-svelte`** (via `pnpm run lint`) : mauvais usages des runes et règles propres à Svelte.
- **Doc officielle en cas de doute sur une API** : lire `https://svelte.dev/llms-small.txt` (version condensée) ou `https://svelte.dev/llms.txt` (index des sections), avec un simple fetch HTTP. Ne pas deviner une API.

## Choisir la structure

Deux structures d'exemple, à lire seulement quand on organise un projet SvelteKit :

- `references/structure-par-fonctionnalite.md` : un dossier par entité métier
- `references/structure-technique.md` : un dossier par type de fichier, plus légère

Pour choisir :

1. **L'existant gagne** : un projet déjà structuré garde sa structure.
2. **Chercher les faits** : une User Story, un plan dans `.docs/plans/` ou une issue qui donne le nombre d'entités, la part de logique serveur et la durée de vie prévue.
3. **Sinon, poser les questions** à l'utilisateur, avec une réponse recommandée : combien d'entités métier, et un écran en croise-t-il plusieurs ? Y a-t-il une logique serveur importante (base de données, API tierces) ? Prototype ou produit durable ?
4. **Recommandation par défaut** : par fonctionnalité dès que les entités sont nombreuses ou la logique serveur importante, technique sinon.

## Instructions

1. Lire le composant et ceux qui l'utilisent.
2. Passer les règles, en consultant la doc officielle si une API n'est pas certaine.
3. Appliquer aussi `project-structure` et `styling-conventions`.
4. Lancer les commandes du projet, en général `pnpm run format`, `pnpm run lint` et `pnpm run check`. Toutes doivent passer.

## Format de sortie

```markdown
### Constats
1. `chemin/Composant.svelte:ligne` : [règle] — [constat] → [correction]

### Vérifications
- format / lint / check : [résultat de chaque commande]
```
