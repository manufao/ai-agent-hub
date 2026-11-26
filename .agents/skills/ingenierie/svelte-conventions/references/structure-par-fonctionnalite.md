# Structure par fonctionnalité

Tout ce qui touche à une entité métier tient dans un seul dossier. Adaptée aux applications riches en entités (gestion, finance, SaaS) et à celles qui ont beaucoup de logique serveur.

## Arborescence

```
src/
├── lib/
│   ├── features/
│   │   ├── <entité>/
│   │   │   ├── <Entité>Card.svelte
│   │   │   ├── <entité>.schema.ts       # validation des formulaires
│   │   │   ├── <entité>.format.ts       # formatage propre à l'entité
│   │   │   ├── <entité>.server.ts       # requêtes et appels aux fournisseurs
│   │   │   └── <entité>.state.svelte.ts # état réactif (runes)
│   │   └── <autre-entité>/
│   ├── ui/                              # composants génériques (Button, Modal, Input)
│   └── server/                          # infrastructure : base de données, authentification, cache, clients externes
└── routes/
```

## Règles de circulation

- **L'infrastructure descend dans `$lib/server/`** : connexion à la base, authentification, cache, clients d'API externes. Les features y puisent, jamais l'inverse.
- **Les features ne s'appellent pas entre elles.** Un écran qui croise deux entités les assemble dans le `+page.server.ts` de sa route, qui appelle chaque feature indépendamment.
- **Le code serveur est protégé à la compilation** : un fichier de `$lib/server/` ou nommé `*.server.ts` ne peut pas être importé depuis un composant `.svelte`.
- **`ui/` ne connaît aucune entité** : il n'importe rien de `features/`.
- **Pas de `stores/`** : l'état réactif vit dans un fichier `.svelte.ts` à côté de l'entité ou de la route concernée.
