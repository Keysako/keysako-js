# Keysako Identity

A multi-framework authentication library for integrating with Keysako identity provider. This library provides authentication buttons and utilities for various JavaScript frameworks.

## Packages

This monorepo contains the following packages:

- `@keysako-identity/core`: Core functionality that powers all framework implementations
- `@keysako-identity/react`: React components for Keysako authentication
- `@keysako-identity/vue`: Vue components for Keysako authentication

## Installation

### Core Package (Vanilla JS)

```bash
npm install @keysako-identity/core
```

### React

```bash
npm install @keysako-identity/react
```

### Vue

```bash
npm install @keysako-identity/vue
```

## Usage

### Core Package (Vanilla JS / Web Components)

```html
<script type="module">
  import { KeysakoButton } from '@keysako-identity/core';
  
  // Register the custom element if it hasn't been registered yet
  if (!customElements.get('keysako-connect')) {
    customElements.define('keysako-connect', KeysakoButton);
  }
</script>

<keysako-connect
  client-id="your-client-id"
  redirect-uri="your-redirect-uri">
</keysako-connect>
```

### React

```jsx
import { KeysakoButton, KeysakoProvider } from '@keysako-identity/react';

// Using the button directly
function LoginPage() {
  return (
    <KeysakoButton
      clientId="your-client-id"
      redirectUri="your-redirect-uri"
      theme="default"
      onSuccess={(result) => console.log('Success:', result)}
      onError={(error) => console.error('Error:', error)}
    />
  );
}

// Using the provider for app-wide authentication
function App() {
  return (
    <KeysakoProvider
      clientId="your-client-id"
      redirectUri="your-redirect-uri"
    >
      <YourApp />
    </KeysakoProvider>
  );
}

// Using the hook in components
import { useKeysako } from '@keysako-identity/react';

function Profile() {
  const { isAuthenticated, login, logout } = useKeysako();
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Welcome to your profile</h1>
          <button onClick={logout}>Sign out</button>
        </div>
      ) : (
        <div>
          <h1>Please sign in</h1>
          <button onClick={login}>Sign in</button>
        </div>
      )}
    </div>
  );
}
```

### Vue

```vue
<template>
  <div>
    <!-- Using the button directly -->
    <KeysakoButton
      client-id="your-client-id"
      redirect-uri="your-redirect-uri"
      theme="default"
      @success="handleSuccess"
      @error="handleError"
    />
  </div>
</template>

<script setup>
import { KeysakoButton, createKeysako } from '@keysako-identity/vue';

// Using the composable for authentication
const keysako = createKeysako({
  clientId: 'your-client-id',
  redirectUri: 'your-redirect-uri'
});

// Access authentication state and methods
const { isAuthenticated, login, logout } = keysako;

// Set up callbacks
keysako.onSuccess((result) => {
  console.log('Authentication successful:', result);
});

keysako.onError((error) => {
  console.error('Authentication failed:', error);
});

// Event handlers for the button
function handleSuccess(result) {
  console.log('Button success:', result);
}

function handleError(error) {
  console.error('Button error:', error);
}
</script>
```

## Configuration Options

### Button Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `clientId` | string | required | Your Keysako client ID |
| `redirectUri` | string | window.location.origin | The URI where users will be redirected after authentication |
| `theme` | string | 'default' | Button theme: 'default', 'light', or 'dark' |
| `shape` | string | 'rounded' | Button shape: 'rounded' or 'sharp' |
| `logoOnly` | boolean | false | Display only the logo without text |
| `usePopup` | boolean | false | Use popup mode for authentication |
| `age` | number | - | Age verification requirement |
| `locale` | string | - | Force a specific language (overrides browser language) |

### Events

The button emits the following events:

| Event | Description | Data |
|-------|-------------|------|
| `success` | Fired when authentication is successful | `{ success: true, token?: string, hasRequiredAge?: boolean }` |
| `error` | Fired when authentication fails | `{ error: string, details?: any }` |

### Environment Variables

You can configure the identity server URI using environment variables:

#### Vite.js
```
# .env file
VITE_KEYSAKO_IDENTITY_SERVER_URI=https://auth.keysako.com
```

#### Create React App
```
# .env file
REACT_APP_KEYSAKO_IDENTITY_SERVER_URI=https://auth.keysako.com
```

#### Direct Browser Access
```javascript
// Set before loading the library
window.ENV_KEYSAKO_IDENTITY_SERVER_URI = 'https://auth.keysako.com';
```

This allows you to use different server endpoints for development, staging, and production environments without modifying the code.

## Advanced Usage

### Custom Styling

You can customize the button appearance using CSS variables:

```css
keysako-connect, .keysako-button {
  --keysako-btn-bg: #4285f4;
  --keysako-btn-color: white;
  --keysako-btn-border: none;
  --keysako-btn-hover-bg: #3367d6;
  --keysako-btn-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  --keysako-btn-radius: 4px;
  --keysako-badge-bg: #202124;
  --keysako-badge-color: white;
}
```

### Token Management

The library provides utilities for token management:

```javascript
import { TokenManager } from '@keysako-identity/core';

const tokenManager = TokenManager.getInstance();

// Check if user is authenticated
const isAuthenticated = tokenManager.isAuthenticated();

// Get access token
const accessToken = tokenManager.getAccessToken();

// Get ID token
const idToken = tokenManager.getIdToken();

// Get token claims
const claims = tokenManager.getTokenClaims();

// Clear tokens (logout)
tokenManager.clearTokens();
```

## Browser Support

This library supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
