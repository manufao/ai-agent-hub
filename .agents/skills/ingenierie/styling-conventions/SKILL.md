---
name: styling-conventions
description: "À utiliser pour écrire ou relire le style d'une interface (Tailwind CSS, CSS, SCSS) : pas de style inline, tokens de thème, classes dynamiques, pièges de Tailwind 4, emplacement des feuilles de style."
---

# Conventions de style

Règle commune : pas de style inline. Seul l'endroit où mettre le style change, selon que le projet utilise Tailwind ou non.

## Quand l'utiliser

- Écriture ou revue de composants qui portent du style
- Plan de refactoring visant à supprimer du style inline

## Règles

### Pas de style inline

- Aucun attribut `style` pour une valeur connue à la compilation.
- Exception : une valeur inconnue au build (API, saisie, position de souris). Elle passe par une variable CSS (`style="--x: 42px"`, en Svelte `style:--x={x}`) que le CSS lit avec `var(--x)`.
- Un état connu à l'avance (actif, rôle, variante) n'est pas dynamique : il sélectionne une classe.

### Avec Tailwind

- Tout en classes. Valeurs arbitraires (`top-[18%]`) acceptées pour une valeur ponctuelle.
- Valeurs répétées ou propres au projet (polices, couleurs, easing) : tokens dans `@theme` (v4) ou `theme.extend` (v3).
- Classes écrites en entier, jamais `` `bg-[${color}]` `` : Tailwind ne détecte que des chaînes littérales. Selon l'état, un `Record` de classes complètes : `const ROLE_CLASSES: Record<Role, string> = { center: "left-1/2 opacity-100", … }`.
- Responsive avec `sm:`, `md:`, pas avec du JavaScript qui lit la largeur de la fenêtre.
- Tailwind 4 : `scale-*`, `rotate-*` et `translate-*` utilisent les propriétés `scale`, `rotate` et `translate`, qu'une transition sur `transform` n'anime pas. Pour reprendre un `transform` à l'identique : `[transform:translateX(-50%)_scale(1.1)]`.
- Un `hover:` ne bat pas un style inline : en supprimant l'inline, vérifier que ces classes ne changent pas le rendu.
- CSS global minimal (`@import "tailwindcss"`, `@theme`, règles de base) dans `assets/css/`.

### Sans Tailwind

- Style d'un composant : CSS modules en React, `<style>` scopé en Svelte, ou SCSS dédié selon la convention du projet (par exemple `src/styles/Composant.scss`).
- Global et variables (couleurs, espacements, polices) : `assets/css/` ou `styles/`.
- Pas de `!important`, sauf pour surcharger une bibliothèque tierce, avec un commentaire.

## Instructions

1. Identifier l'outil de style et sa version (`package.json`, configuration).
2. Classer chaque attribut `style` : connu au build (à convertir) ou réellement dynamique (variable CSS).
3. Chercher les classes interpolées et les valeurs répétées qui devraient être des tokens.
4. Après modification : build, puis comparaison visuelle avant/après, car le type-check ne voit pas une régression de style.

## Format de sortie

```markdown
### Constats
1. `chemin/fichier:ligne` : [règle] — [constat] → [correction]

### Reste dynamique (justifié)
- `chemin/fichier:ligne` : [valeur] — [pourquoi elle est inconnue au build]
```
