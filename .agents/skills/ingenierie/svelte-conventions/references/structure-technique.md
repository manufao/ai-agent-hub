# Structure technique

Le découpage se fait par type de fichier, les composants étant rangés par page. Plus légère : adaptée aux petites applications, aux prototypes et à celles qui ont peu d'entités métier.

## Arborescence

```
src/
├── lib/
│   ├── components/
│   │   ├── <page>/                  # un dossier par page, un sous-dossier par composant d'écran
│   │   ├── layout/                  # structure commune (en-tête, pied de page)
│   │   ├── ui/                      # composants génériques
│   │   └── icons/
│   ├── actions/                     # actions Svelte (use:…)
│   ├── constants/
│   ├── server/                      # code réservé au serveur
│   ├── types/
│   └── utils/                       # fonctions pures
├── routes/
└── styles/
```

## Règles

- **Dépendances à sens unique** : les composants importent `utils`, `types` et `constants`, jamais l'inverse.
- **Un composant d'écran par dossier** quand il a des sous-composants ou ses propres fichiers, pour retrouver ce qui lui appartient sans chercher.
- **Pas de `stores/` en Svelte 5** : l'état partagé vit dans un fichier `.svelte.ts` (runes `$state`, `$derived`) placé dans le dossier de la route ou du composant qui l'utilise.
- **Le code serveur reste dans `$lib/server/`** ou dans un fichier `*.server.ts`, protégés à la compilation contre un import depuis un composant.
- **Quand la structure devient lourde** (beaucoup d'entités, composants d'une même entité dispersés dans plusieurs dossiers), passer à la structure par fonctionnalité.
