# Familles d'attaque chaîne d'approvisionnement et de livraison

Ce guide traite des risques introduits par les dépendances tierces, les processus d'intégration continue (CI/CD) et la distribution logicielle.

---

## 1. Dépendances et gestionnaires de paquets
- **Scripts d'installation suspects (`postinstall`)** : packages tiers exécutant des scripts arbitraires lors du `pnpm install` ou `npm install`. Vérifier si le projet restreint l'exécution de scripts tiers non audités (ex: option `ignore-scripts` ou flags stricts pnpm).
- **Confusion de dépendances (*Dependency Confusion*)** : paquets internes privés dont le nom n'est pas protégé par un scope (`@mon-organisation/package`) et pouvant être substitués par un paquet public malveillant sur le registre public npm.
- **Lockfile manquant ou désynchronisé** : absence de `pnpm-lock.yaml` ou `package-lock.json` engagé dans le dépôt, permettant à un build ultérieur d'embarquer une version mineure compromise. *Durcissement.*

---

## 2. Sécurité des pipelines CI/CD
- **Déclenchement non protégé sur Pull Requests externes** : workflows GitHub Actions ou GitLab CI s'exécutant sur des événements `pull_request_target` ou des forks avec accès aux secrets du dépôt.
- **Injection de commandes dans les étapes de build** : scripts de CI interpolant directement des variables non fiables (titre de PR, nom de branche, message de commit) dans des blocs de script Bash :
  ```yaml
  # VULNÉRABLE :
  run: echo "Testing PR: ${{ github.event.pull_request.title }}"
  ```
- **Actions tierces non épinglées par hash** : utilisation d'actions GitHub avec des tags mutables (`uses: actions/checkout@v4`) au lieu d'épingler le hash SHA de commit immuable. *Durcissement, sauf si l'action reçoit des secrets du dépôt et vient d'un tiers non maîtrisé.*
