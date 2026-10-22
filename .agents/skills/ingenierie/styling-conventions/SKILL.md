---
name: styling-conventions
description: "À utiliser pour écrire ou relire le style d'une interface (Tailwind CSS, CSS, SCSS) : pas de style inline, tokens de thème, classes dynamiques, pièges de Tailwind 4, emplacement des feuilles de style."
---

# Conventions de style

La règle de base est la même partout : pas de style inline. Ce qui change, c'est où mettre le style selon que le projet utilise Tailwind ou non.

## Quand l'utiliser

- Écriture ou modification de composants qui portent du style
- Revue de code qui touche au CSS, aux classes Tailwind ou à des attributs `style`
- Plan de refactoring visant à supprimer du style inline

## Règles

### Pas de style inline

- Aucun attribut `style` avec des valeurs connues à la compilation.
- Exception : une valeur réellement inconnue au build (venue d'une API, d'une saisie, d'un calcul continu comme une position de souris). Elle passe par une variable CSS (`style="--x: 42px"`, en Svelte `style:--x={x}`) et la feuille de style ou la classe utilise `var(--x)`.
- Un état connu à l'avance (actif, rôle, variante) n'est pas une valeur dynamique : il sélectionne une classe.

### Projet avec Tailwind

- Tout le style en classes Tailwind. Les valeurs arbitraires (`top-[18%]`) sont acceptables pour une valeur ponctuelle.
- Valeurs répétées ou propres au projet (polices, couleurs, easing, images de fond) : tokens dans `@theme` (Tailwind 4) ou `theme.extend` (Tailwind 3), puis classes générées (`font-anton`, `ease-smooth`).
- Classes écrites en entier : Tailwind ne détecte que des chaînes littérales. Jamais `` `bg-[${color}]` `` ni `` `h-[${size}%]` ``. Pour une variation selon l'état, un `Record` de classes complètes :

  ```ts
  const ROLE_CLASSES: Record<Role, string> = {
    center: "left-1/2 h-[78%] opacity-100",
    side: "left-[30%] h-[28%] opacity-85",
  }
  ```

- Responsive avec les variantes (`sm:`, `md:`) plutôt qu'avec du JavaScript qui lit la largeur de la fenêtre.
- Tailwind 4 : les utilitaires `scale-*`, `rotate-*` et `translate-*` utilisent les propriétés CSS `scale`, `rotate` et `translate`, pas `transform`. Une transition sur `transform` ne les anime pas. Pour reprendre un `transform` existant à l'identique : `[transform:translateX(-50%)_scale(1.1)]`.
- Une classe `hover:` ou d'état ne peut pas battre un style inline : en supprimant l'inline, vérifier que ces classes ne changent pas le rendu par surprise.
- Le CSS global reste minimal (`@import "tailwindcss"`, `@theme`, quelques règles de base) dans `assets/css/` ou l'emplacement prévu par le framework.

### Projet sans Tailwind

- Style propre à un composant : CSS modules (`Composant.module.css`) en React, bloc `<style>` scopé en Svelte, ou fichier SCSS dédié si le projet en a la convention (par exemple `src/styles/Composant.scss`).
- Style global et variables : `assets/css/` (ou `styles/`), avec des variables CSS pour les couleurs, espacements et polices.
- Pas de `!important` sauf pour surcharger une bibliothèque tierce, avec un commentaire qui dit pourquoi.

## Instructions

1. Identifier l'outil de style du projet (Tailwind et sa version, CSS modules, SCSS) dans `package.json` et la configuration.
2. Chercher les attributs `style` et classer chaque cas : valeur connue au build (à convertir) ou réellement dynamique (variable CSS).
3. Chercher les classes construites par interpolation et les valeurs répétées qui devraient être des tokens.
4. Après modification : build, puis comparaison visuelle avant/après, car le type-check ne voit pas une régression de style.

## Format de sortie

```markdown
### Constats
1. `chemin/fichier:ligne` : [règle] — [constat] → [correction]

### Reste dynamique (justifié)
- `chemin/fichier:ligne` : [valeur] — [pourquoi elle est inconnue au build]
```
