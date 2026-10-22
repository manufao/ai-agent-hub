---
name: svelte-conventions
description: "À utiliser pour écrire, relire ou valider du code Svelte 5 / SvelteKit : runes ($state, $derived, $effect, $props), interface Props, événements, absence de syntaxe Svelte 4, outils MCP Svelte. Complète project-structure et styling-conventions."
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

### Outils MCP Svelte (si disponibles)

1. `list-sections`, puis `get-documentation` sur toutes les sections utiles quand une API n'est pas certaine.
2. `svelte-autofixer` sur chaque composant écrit ou modifié, jusqu'à zéro problème. Obligatoire avant de rendre du code.
3. `playground-link` seulement sur demande, jamais pour du code déjà écrit dans des fichiers.

## Instructions

1. Lire le composant et ceux qui l'utilisent.
2. Passer les règles, puis `svelte-autofixer` si le MCP est disponible.
3. Appliquer aussi `project-structure` et `styling-conventions`.
4. Lancer les commandes du projet, en général `pnpm run format`, `pnpm run lint` et `pnpm run check`. Toutes doivent passer.

## Format de sortie

```markdown
### Constats
1. `chemin/Composant.svelte:ligne` : [règle] — [constat] → [correction]

### Vérifications
- svelte-autofixer : [aucun problème | liste]
- format / lint / check : [résultat de chaque commande]
```
