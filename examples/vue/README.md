# Keysako Identity - Vue Example

Cet exemple montre comment intégrer la bibliothèque Keysako Identity dans une application Vue 3 construite avec Vite.js.

## Fonctionnalités

- Authentification avec Keysako Identity Provider
- Différentes variantes du bouton d'authentification
- Thèmes clair et sombre
- Configuration via variables d'environnement

## Installation

```bash
# Installer les dépendances
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet pour configurer l'URI du serveur d'identité :

```
# .env
VITE_KEYSAKO_IDENTITY_SERVER_URI=https://auth.keysako.com
```

## Développement

```bash
# Lancer le serveur de développement
npm run dev
```

L'application sera disponible à l'adresse [http://localhost:5173](http://localhost:5173).

## Exemples d'utilisation

### Bouton d'authentification standard

```vue
<KeysakoButton 
  client-id="your-client-id" 
  :redirect-uri="redirectUri"
  theme="light" 
  @success="handleSuccess"
  @error="handleError"
/>
```

### Bouton avec vérification d'âge

```vue
<KeysakoButton 
  client-id="your-client-id" 
  :redirect-uri="redirectUri"
  theme="light" 
  :age="18" 
  @success="handleSuccess"
  @error="handleError"
/>
```

### Bouton avec popup

```vue
<KeysakoButton 
  client-id="your-client-id" 
  :redirect-uri="redirectUri"
  theme="light" 
  :use-popup="true" 
  @success="handleSuccess"
  @error="handleError"
/>
```

### Bouton avec logo uniquement

```vue
<KeysakoButton 
  client-id="your-client-id" 
  :redirect-uri="redirectUri"
  theme="light" 
  :logo-only="true" 
  @success="handleSuccess"
  @error="handleError"
/>
```

## Utilisation du composable

Le composable `createKeysako` permet de gérer l'état d'authentification au niveau de l'application :

```vue
<script setup>
import { createKeysako } from '@keysako-identity/vue';

const keysako = createKeysako({
  clientId: 'your-client-id',
  redirectUri: window.location.origin
});

// Accéder à l'état d'authentification et aux méthodes
const { isAuthenticated, login, logout } = keysako;

// Configurer les callbacks
keysako.onSuccess((result) => {
  console.log('Authentication successful:', result);
});

keysako.onError((error) => {
  console.error('Authentication failed:', error);
});
</script>
```

## Build de production

```bash
# Créer un build de production
npm run build
```

Les fichiers de production seront générés dans le dossier `dist`.
