# GitHub Actions Workflows for Keysako Identity

This repository contains GitHub Actions workflows for the Keysako Identity project. These workflows automate the build, test, publish, and deployment processes.

## Available Workflows

### 1. Build and Test (`build-and-test.yml`)

This workflow compiles and tests all packages in the monorepo.

**Triggers:**
- Push to `main`, `master`, `develop` branches
- Pull requests to these branches
- Calls from other workflows

**Features:**
- Dependencies installation
- Packages compilation
- CDN files preparation
- Tests execution
- Build artifacts storage

### 2. Publish to NPM (`publish-npm.yml`)

This workflow publishes packages to the npm registry.

**Triggers:**
- Push of tags starting with `v` (e.g., `v1.0.0`)
- Manual trigger

**Features:**
- Execution of the build and test workflow
- Publication of core, react, and vue packages on npm

### 3. Create GitHub Release (`create-release.yml`)

This workflow creates a GitHub release with version notes and compiled files.

**Triggers:**
- Successful execution of the "Publish to NPM" workflow
- Manual trigger

**Features:**
- Generation of release notes
- Calculation of integrity hashes for CDN files
- Creation of a GitHub release with compiled files

### 4. Deploy to CDN (`deploy-cdn.yml`)

This workflow deploys files to Azure Static Web Apps for the CDN.

**Triggers:**
- Successful execution of the "Publish to NPM" workflow
- Manual trigger

**Features:**
- Deployment of compiled files to Azure Static Web Apps

## Usage

### Publishing a New Version

1. Update version numbers in all `package.json` files
2. Create and push a tag with the version number:
   ```bash
   git tag v1.0.6
   git push origin v1.0.6
   ```
3. Workflows will run automatically in the following order:
   - `publish-npm.yml`
   - `create-release.yml` and `deploy-cdn.yml` (in parallel)

### Manual Trigger

All workflows can be manually triggered from the GitHub Actions interface.
