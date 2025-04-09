# Workflows GitHub Actions pour Keysako Identity

Ce répertoire contient les workflows GitHub Actions pour le projet Keysako Identity. Ces workflows automatisent les processus de build, test, publication et déploiement.

## Workflows disponibles

### 1. Build and Test (`build-and-test.yml`)

Ce workflow compile et teste tous les packages du monorepo.

**Déclencheurs :**
- Push sur les branches `main`, `master`, `develop`
- Pull requests vers ces branches
- Appel depuis d'autres workflows

**Fonctionnalités :**
- Installation des dépendances
- Compilation des packages
- Préparation des fichiers CDN
- Exécution des tests
- Stockage des artefacts de build

### 2. Publish to NPM (`publish-npm.yml`)

Ce workflow publie les packages sur le registre npm.

**Déclencheurs :**
- Push de tags commençant par `v` (ex: `v1.0.0`)
- Déclenchement manuel

**Fonctionnalités :**
- Exécution du workflow de build et test
- Publication des packages core, react et vue sur npm

### 3. Create GitHub Release (`create-release.yml`)

Ce workflow crée une release GitHub avec les notes de version et les fichiers compilés.

**Déclencheurs :**
- Exécution réussie du workflow "Publish to NPM"
- Déclenchement manuel

**Fonctionnalités :**
- Génération des notes de version
- Calcul des hashes d'intégrité pour les fichiers CDN
- Création d'une release GitHub avec les fichiers compilés

### 4. Deploy to CDN (`deploy-cdn.yml`)

Ce workflow déploie les fichiers sur Azure Static Web Apps pour le CDN.

**Déclencheurs :**
- Exécution réussie du workflow "Publish to NPM"
- Déclenchement manuel

**Fonctionnalités :**
- Déploiement des fichiers compilés sur Azure Static Web Apps

## Utilisation

### Publication d'une nouvelle version

1. Mettez à jour les numéros de version dans tous les fichiers `package.json`
2. Créez et poussez un tag avec le numéro de version :
   ```bash
   git tag v1.0.6
   git push origin v1.0.6
   ```
3. Les workflows s'exécuteront automatiquement dans l'ordre suivant :
   - `publish-npm.yml`
   - `create-release.yml` et `deploy-cdn.yml` (en parallèle)

### Déclenchement manuel

Tous les workflows peuvent être déclenchés manuellement depuis l'interface GitHub Actions.
