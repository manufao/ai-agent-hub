---
name: react-conventions
description: "À utiliser pour écrire, relire ou refactorer du code React (avec TypeScript) : découpage en composants, hooks, état, effets, props et compatibilité avec le Fast Refresh de Vite. Complète project-structure et styling-conventions."
---

# Conventions React

Ce skill couvre ce qui est propre à React. L'organisation des dossiers et les barrel files sont dans `project-structure`, le style dans `styling-conventions`.

## Quand l'utiliser

- Création ou modification de composants React
- Revue de code d'un projet React
- Plan de refactoring d'un fichier `.tsx` devenu trop gros

## Règles

### Composants

- Un composant par fichier, en export nommé (`export function NavButtons()`). Le fichier `App.tsx` peut garder un export par défaut si le point d'entrée l'attend.
- Un fichier de composant n'exporte que des composants. Une constante, un hook ou une fonction exportés à côté forcent Vite à recharger toute la page au lieu du rafraîchissement à chaud : les sortir dans `hooks/`, `lib/` ou `data/`.
- Un composant qui dépasse un écran de JSX ou qui répète un bloc se découpe. Un composant utilisé par un seul parent peut vivre à côté de lui sans être exporté par le barrel.
- Props typées avec un `interface` ou un `type` nommé. Les callbacks s'appellent `onX` (`onPrev`, `onSubmit`).

### État et effets

- Garder l'état minimal. Ce qui se calcule à partir de l'état ou des props se calcule pendant le rendu, pas dans un `useEffect` avec un second `useState`.
- `useEffect` sert uniquement à synchroniser avec l'extérieur (timer, abonnement, API du navigateur), avec un nettoyage dans la fonction de retour.
- Une logique avec état réutilisable ou qui alourdit le composant devient un hook `useX` dans `hooks/`.
- Préférer le CSS (variantes `sm:`, media queries) à un hook qui lit la taille de la fenêtre quand seul l'affichage change.

### Listes et rendu

- `key` stable et unique tirée des données, jamais l'index du tableau quand la liste peut changer d'ordre.
- Pas de composant défini à l'intérieur d'un autre composant : il est recréé à chaque rendu et perd son état.

### Accessibilité

- Un élément cliquable est un `<button>` ou un `<a>`, pas un `<div onClick>`.
- Désactiver un bouton pendant une animation avec `aria-disabled` plutôt que `disabled`, qui fait perdre le focus clavier.
- Les images ont un `alt` qui décrit le contenu, vide (`alt=""`) si elles sont décoratives.

## Instructions

1. Lire le composant et ceux qui l'utilisent avant de le modifier.
2. Passer les règles ci-dessus et noter chaque écart avec le fichier et la ligne.
3. Appliquer aussi `project-structure` pour l'emplacement des fichiers et `styling-conventions` pour le style.
4. Vérifier avec le build du projet (type-check compris) et le lint s'il existe.

## Format de sortie

```markdown
### Constats
1. `chemin/Composant.tsx:ligne` : [règle] — [constat] → [correction]
```
