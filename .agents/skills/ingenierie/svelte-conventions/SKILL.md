---
name: svelte-conventions
description: "À utiliser pour écrire, relire ou valider du code Svelte 5 / SvelteKit : runes ($state, $derived, $effect, $props), interface Props, événements, absence de syntaxe Svelte 4, outils MCP Svelte. Complète project-structure et styling-conventions."
---

# Conventions Svelte 5

Ce skill couvre ce qui est propre à Svelte 5. L'organisation des dossiers et les barrel files sont dans `project-structure`, le style dans `styling-conventions`.

## Quand l'utiliser

- Création ou modification de composants `.svelte` ou de fichiers `.svelte.ts`
- Revue de code d'un projet Svelte
- Migration de code Svelte 4 vers Svelte 5

## Règles

### Runes

| Besoin | Svelte 5 | Interdit (Svelte 4 ou non réactif) |
|---|---|---|
| État | `let count = $state(0)` ; typé : `$state<User \| null>(null)` | `let count = 0` attendu réactif |
| Valeur dérivée | `let doubled = $derived(count * 2)` ; calcul long : `$derived.by(() => …)` | `$: doubled = count * 2` |
| Effet de bord | `$effect(() => { … })` | `$: console.log(count)` |
| Props | `let { title, count = 0 }: Props = $props()` | `export let title` |

- Préférer `$derived` à `$effect` : un `$effect` qui écrit dans un `$state` est presque toujours un `$derived` mal écrit.
- `$effect` sert à synchroniser avec l'extérieur (DOM, timer, abonnement) et renvoie une fonction de nettoyage si besoin.

### Props et événements

- Toujours une `interface Props` nommée, même pour une seule prop.
- Événements en attributs : `onclick={handleClick}`, jamais `on:click`. Les callbacks passés en props s'écrivent en minuscules (`onclick`, `onsubmit`).
- `bind:value` reste valide : vérifier son type.

### Structure d'un composant

- Ordre : `<script>`, puis le markup, puis `<style>`.
- Un composant par fichier, en PascalCase.

### Textes et accessibilité

- Si le projet a un système d'i18n (Paraglide par exemple), tout texte visible passe par lui.
- Labels ARIA et rôles sur les éléments interactifs qui n'ont pas de texte visible.

### Outils MCP Svelte

Si le serveur MCP Svelte est disponible :

1. `list-sections` d'abord, puis `get-documentation` sur toutes les sections utiles avant d'écrire du code dont l'API n'est pas certaine.
2. `svelte-autofixer` sur chaque composant écrit ou modifié, relancé jusqu'à ne plus remonter de problème. C'est obligatoire avant de rendre du code.
3. `playground-link` seulement si l'utilisateur le demande, et jamais pour du code déjà écrit dans des fichiers.

## Instructions

1. Lire le composant et ceux qui l'utilisent.
2. Passer les règles ci-dessus, puis `svelte-autofixer` si le MCP est disponible.
3. Appliquer `project-structure` et `styling-conventions`.
4. Vérifier avec les commandes du projet, en général `pnpm run format`, `pnpm run lint` et `pnpm run check` (svelte-check). Toutes doivent passer.

## Format de sortie

```markdown
### Constats
1. `chemin/Composant.svelte:ligne` : [règle] — [constat] → [correction]

### Vérifications
- svelte-autofixer : [aucun problème | liste]
- format / lint / check : [résultat de chaque commande]
```
