---
name: unit-testing-conventions
description: "À utiliser pour écrire ou relire des tests unitaires et de composants (Vitest, Testing Library, React ou Svelte) : structure Given/When/Then, sélecteurs, mocks, i18n, couverture et workflow de vérification."
---

# Conventions de tests unitaires

Comment écrire un test. Quoi tester et à quel niveau relève de `test-plan`.

## Quand l'utiliser

- Écriture ou revue de tests (composant, hook, store, service, utilitaire), amélioration de la couverture

## Règles

**Structure.** Deux niveaux de `describe` au plus : un pour l'unité (`describe('Carousel')`), un par méthode ou fonction testée (`describe('next')`). Jamais de troisième niveau : les sous-cas d'une méthode sont des `it()` à plat, au nom descriptif. Un `describe` nomme une vraie méthode ou fonction testée, jamais une constante ou une table de données : les tests d'une constante sont des `it()` directement sous le `describe` de l'unité, avec le nom de la constante dans le titre. Données partagées en haut du `describe` de l'unité. Un `beforeEach` local à un `describe` de méthode est permis quand plusieurs tests de cette méthode partagent la même mise en place.

**Nom des tests.** En anglais, au format `should <action> <condition>` : `'should return an error when the token is expired'`. Un `it()` vérifie un seul comportement.

**Corps des tests.** Chaque test porte les commentaires `// Given`, `// When`, `// Then`, dans cet ordre. `// Given` s'omet quand les défauts du `beforeEach` suffisent. `// When` contient un seul appel à l'unité testée. `// When / Then` remplace les deux quand l'appel et l'assertion forment une seule expression (`await expect(…).rejects.toThrow(…)`).

```ts
it('should show the next figurine when next is clicked', async () => {
  // Given
  const user = userEvent.setup()
  render(Carousel)

  // When
  await user.click(screen.getByRole('button', { name: /suivante/i }))

  // Then
  expect(screen.getByAltText(/n°2/)).toBeVisible()
})
```

**Sélecteurs**, par ordre de préférence : `getByRole` avec `name`, `getByLabelText`, `getByText`, puis `getByTestId` en dernier recours.

**i18n.** Ne pas mocker les traductions ni chercher par clé : utiliser le texte réellement rendu.

**Mocks.**

- Mocker les dépendances testées ailleurs (utilitaires, stores, API, services injectés), jamais l'unité testée. Chaque dépendance a son propre objet de mock, chaque méthode mockée est un `vi.fn()`, et le mock renvoie le type exact de la vraie fonction.
- Mocker la dépendance entière plutôt que l'espionner : pas de `vi.spyOn()` sur une dépendance.
- Réutiliser les fabriques de mocks du projet quand elles existent plutôt qu'écrire un mock à la main.
- Réinitialiser dans le `beforeEach` de premier niveau avec `vi.resetAllMocks()` puis `vi.restoreAllMocks()` : chaque test repart de mocks vides.
- Comportements par défaut (`mockReturnValue`, `mockResolvedValue`) uniquement dans le `beforeEach`. Surcharges dans un test uniquement en forme ponctuelle (`mockReturnValueOnce`, `mockResolvedValueOnce`, `mockRejectedValueOnce`), pour qu'elles ne fuient jamais vers le test suivant.
- Nommer les mocks `<nom>Mock` : `dataProviderServiceMock`, `tokenIntrospectionMock`.

**Assertions.**

- Un appel attendu exactement une fois : `toHaveBeenCalledExactlyOnceWith(…)`. Plusieurs appels : `toHaveBeenCalledTimes(n)` avec `toHaveBeenCalledWith(…)`. Aucun appel : `toHaveBeenCalledTimes(0)`.
- Une valeur transmise telle quelle : un `Symbol('xxxMock')` prouve qu'elle passe sans transformation, sans fabriquer de donnée.
- Un ordre d'appel : comparer `<nom>Mock.mock.invocationCallOrder[0]` des deux mocks (la propriété est sur `.mock`, pas sur la fonction mockée elle-même).
- Une méthode privée se teste par la notation crochet (`instance['privateMethod'](…)`), jamais en la rendant publique ou exportée pour le test.

**Couverture.** 100 % sur les quatre métriques (instructions, branches, fonctions, lignes) du fichier testé. Ne jamais déclarer un chemin impossible à tester pour s'arrêter avant, ne jamais baisser le seuil ni sauter un test : lire les lignes non couvertes et ajouter le test qui manque. Une branche vraiment inatteignable révèle du code mort, à signaler plutôt qu'à exclure.

**Cartographier les chemins avant d'écrire.** Pour chaque méthode, publique ou privée, lister :

- le cas nominal ;
- chaque `if` vrai et faux, chaque `else if` / `else` ;
- chaque `case` d'un `switch`, `default` compris ;
- chaque retour anticipé et chaque `throw` ;
- chaque valeur de repli (`??`, `||`, `&&`) et chaque paramètre par défaut ;
- les tableaux et objets vides ;
- pour une fonction asynchrone, la promesse résolue **et** rejetée.

**Interdits.** Tester le comportement par défaut du framework. Laisser `it.skip`, `describe.skip`, `it.only` ou un `console.log`. Augmenter un timeout sans nécessité démontrée. Faire un `import()` dynamique dans un test ou un `beforeEach` (imports statiques en haut, ou fonction utilitaire au niveau du module). Oublier le `await` d'une interaction utilisateur. Modifier le code source pour le rendre testable sans le signaler : un test n'écrit que dans les fichiers de test.

**Par framework.**

- Svelte 5 : `render` de `@testing-library/svelte`. Si les types ne correspondent pas, `Component as any` est accepté, avec `eslint-disable-next-line` et la raison au-dessus.
- React : `render` de `@testing-library/react`, `renderHook` pour un hook seul, `vi.useFakeTimers()` pour les délais et animations.

## Instructions

1. Lire l'unité à tester, les tests voisins pour en reprendre les motifs, et les fabriques de mocks du projet.
2. Cartographier les chemins de chaque méthode (voir plus haut).
3. Écrire un `it()` par chemin et par comportement, en suivant les règles ci-dessus.
4. Lancer dans l'ordre : formatage, lint, le fichier seul, sa couverture, puis toute la suite. Recommencer jusqu'à 100 % sur les quatre métriques.

## Format de sortie

```markdown
### Tests écrits
- `chemin/fichier.test.ts` : [nombre] tests (rendu X, interactions Y, cas limites Z)

### Vérifications
- Format / lint : [résultat]
- Fichier seul : [X passés, 0 échec] — Couverture : instr. X %, branches X %, fonctions X %, lignes X %
- Suite complète : [résultat]
```

Si une métrique reste sous 100 % : les lignes non couvertes et ce qui les bloque. Ne jamais annoncer un succès sans la sortie de couverture.
