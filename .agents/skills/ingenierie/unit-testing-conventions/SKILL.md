---
name: unit-testing-conventions
description: "À utiliser pour écrire ou relire des tests unitaires et de composants (Vitest, Testing Library, React ou Svelte) : structure Given/When/Then, sélecteurs, mocks, i18n, couverture et workflow de vérification."
---

# Conventions de tests unitaires

Comment écrire un test. Quoi tester et à quel niveau relève de `test-plan`.

## Quand l'utiliser

- Écriture ou revue de tests (composant, hook, store, utilitaire), amélioration de la couverture

## Règles

**Structure.** Un `describe` par unité, des `describe` imbriqués par thème (Rendu, Interactions, Cas limites). Chaque test en Given / When / Then, en commentaires. Données partagées en haut du `describe`. Mocks créés ou réinitialisés dans `beforeEach` avec `vi.clearAllMocks()`.

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

**Sélecteurs**, par ordre de préférence : `getByRole` avec `name`, `getByLabelText`, `getByText`, puis `getByTestId` en dernier recours.

**i18n.** Ne pas mocker les traductions ni chercher par clé : utiliser le texte réellement rendu.

**Mocks.** Mocker les dépendances testées ailleurs (utilitaires, stores, API), jamais l'unité testée. Le mock renvoie le type exact de la vraie fonction.

**Interdits.** Tester le comportement par défaut du framework. Laisser `it.skip`, `describe.skip`, `it.only` ou un `console.log`. Augmenter un timeout sans nécessité démontrée. Faire un `import()` dynamique dans un test ou un `beforeEach` (imports statiques en haut, ou fonction utilitaire au niveau du module). Oublier le `await` d'une interaction utilisateur.

**Couverture.** Respecter le seuil du projet (`vitest.config.ts`). Une branche impossible à couvrir révèle souvent du code mort, sinon elle se documente comme exception.

**Par framework.**
- Svelte 5 : `render` de `@testing-library/svelte`. Si les types ne correspondent pas, `Component as any` est accepté, avec `eslint-disable-next-line` et la raison au-dessus.
- React : `render` de `@testing-library/react`, `renderHook` pour un hook seul, `vi.useFakeTimers()` pour les délais et animations.

## Instructions

1. Lire l'unité à tester et les tests existants pour en reprendre les motifs.
2. Lister les états de rendu, les interactions et les cas limites, puis écrire les tests.
3. Lancer dans l'ordre : formatage, lint, le fichier seul, sa couverture, puis toute la suite.

## Format de sortie

```markdown
### Tests écrits
- `chemin/fichier.test.ts` : [nombre] tests (rendu X, interactions Y, cas limites Z)

### Vérifications
- Format / lint : [résultat]
- Fichier seul : [X passés, 0 échec] — Couverture : instr. X %, branches X %, fonctions X %, lignes X %
- Suite complète : [résultat]
```
