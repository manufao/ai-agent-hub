---
name: unit-testing-conventions
description: "À utiliser pour écrire ou relire des tests unitaires et de composants (Vitest, Testing Library, React ou Svelte) : structure Given/When/Then, sélecteurs, mocks, i18n, couverture et workflow de vérification."
---

# Conventions de tests unitaires

Ce skill dit comment écrire un test. Quoi tester et à quel niveau relève de `test-plan`.

## Quand l'utiliser

- Écriture de tests pour un composant, un hook, un store ou un utilitaire
- Revue d'un fichier de test
- Amélioration de la couverture d'une zone

## Règles

### Structure

- Un `describe` par unité testée, des `describe` imbriqués par thème (Rendu, Interactions, Cas limites).
- Chaque test suit Given / When / Then, en commentaires :

  ```ts
  it('passe à la figurine suivante au clic', async () => {
    // Given : le carrousel sur la première figurine
    const user = userEvent.setup()
    render(Carousel)

    // When : l'utilisateur clique sur « suivante »
    await user.click(screen.getByRole('button', { name: /suivante/i }))

    // Then : la deuxième figurine est au centre
    expect(screen.getByAltText(/n°2/)).toBeVisible()
  })
  ```

- Données de test partagées en haut du `describe`. Mocks créés ou réinitialisés dans `beforeEach` avec `vi.clearAllMocks()`.

### Sélecteurs, par ordre de préférence

1. `getByRole('button', { name: /envoyer/i })`
2. `getByLabelText(/nom/i)`
3. `getByText(/bienvenue/i)`
4. `getByTestId(...)`, en dernier recours

### i18n

Ne pas mocker les fonctions de traduction ni chercher par clé de traduction. Utiliser le texte réellement rendu : le test vérifie ce que voit l'utilisateur et couvre l'intégration i18n.

### Mocks

- Mocker les dépendances déjà testées ailleurs (utilitaires, stores, API), pas l'unité testée.
- Les valeurs renvoyées par un mock ont le type exact de la vraie fonction.

### Ce qu'on ne fait pas

- Pas de test du comportement par défaut du framework ou d'une prop qui ne fait rien.
- Pas de `it.skip`, `describe.skip`, `it.only` laissés dans le code.
- Pas de `console.log` de débogage.
- Pas d'augmentation de timeout sauf nécessité démontrée.
- Pas d'`import()` dynamique dans un test ou un `beforeEach`. Imports statiques en haut du fichier, ou une fonction utilitaire au niveau du module si un rechargement de module est indispensable.
- Les interactions utilisateur sont toujours attendues : `await user.click(...)`, `await user.type(...)`.

### Couverture

Respecter le seuil fixé par le projet (dans `vitest.config.ts`). Un test protège un comportement : une branche impossible à couvrir révèle souvent du code mort à supprimer, ou se documente comme exception.

### Spécificités par framework

- Svelte 5 : `render` de `@testing-library/svelte`. Si le typage du composant ne correspond pas à ce qu'attend la bibliothèque, le cast `Component as any` est accepté, avec le commentaire `eslint-disable-next-line` et la raison au-dessus.
- React : `render` de `@testing-library/react`. Un hook seul se teste avec `renderHook`. Les timers (animations, délais) avec `vi.useFakeTimers()`.

## Instructions

1. Lire l'unité à tester et les tests existants du projet pour en reprendre les motifs.
2. Lister les états de rendu, les interactions et les cas limites.
3. Écrire les tests selon les règles ci-dessus.
4. Lancer, dans l'ordre : le formatage, le lint, le fichier de test seul, la couverture de ce fichier, puis toute la suite pour vérifier qu'aucun autre test n'a cassé.

## Format de sortie

```markdown
### Tests écrits
- `chemin/fichier.test.ts` : [nombre] tests (rendu : X, interactions : Y, cas limites : Z)

### Vérifications
- Format / lint : [résultat]
- Fichier seul : [X passés, 0 échec]
- Couverture du fichier : instructions X %, branches X %, fonctions X %, lignes X %
- Suite complète : [résultat]
```
