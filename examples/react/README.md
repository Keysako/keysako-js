# Keysako Identity - React Example

Cet exemple montre comment intégrer la bibliothèque Keysako Identity dans une application React construite avec Vite.js.

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

```jsx
<KeysakoButton 
  clientId="your-client-id" 
  redirectUri={window.location.origin}
  theme="light" 
/>
```

### Bouton avec vérification d'âge

```jsx
<KeysakoButton 
  clientId="your-client-id" 
  redirectUri={window.location.origin}
  theme="light" 
  age={18} 
/>
```

### Bouton avec popup

```jsx
<KeysakoButton 
  clientId="your-client-id" 
  redirectUri={window.location.origin}
  theme="light" 
  usePopup 
/>
```

### Bouton avec logo uniquement

```jsx
<KeysakoButton 
  clientId="your-client-id" 
  redirectUri={window.location.origin}
  theme="light" 
  logoOnly 
/>
```

## Utilisation du Provider

Le `KeysakoProvider` permet de gérer l'état d'authentification au niveau de l'application :

```jsx
<KeysakoProvider
  clientId="your-client-id"
  redirectUri={window.location.origin}
>
  <App />
</KeysakoProvider>
```

## Build de production

```bash
# Créer un build de production
npm run build
```

Les fichiers de production seront générés dans le dossier `dist`.
