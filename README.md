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

### CDN Usage

You can also use Keysako Identity directly from our CDN:

```html
<script src="https://cdn.keysako.com/v1/keysako-connect.min.js" integrity="sha384-HbjF36XR1u6I0gJAqft5diuu5YR7wOEjFbSk841DhsQ47NRwb18iXDIdEssJYhSY" crossorigin="anonymous"></script>
```

## Examples

We provide several examples to help you get started quickly:

- **[Vue Example](./examples/vue/)**: A complete Vue.js application using Vite.js that demonstrates authentication flow
- **[React Example](./examples/react/)**: A React application showing how to integrate Keysako authentication
- **[Vanilla JS Example](./examples/vanilla/)**: A simple HTML/JS example without any framework

To run any example:

```bash
# Navigate to the example directory
cd examples/vue

# Install dependencies
npm install

# Start the development server
npm run dev
```

You can also try our [online configurator](https://cdn.keysako.com/configurator.html) to customize your button and get the code.

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
import { KeysakoButton } from '@keysako-identity/react';

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

// Example with application state management
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authResult, setAuthResult] = useState(null);
  
  // Handlers for authentication events
  const handleSuccess = (result) => {
    console.log('Authentication successful:', result);
    setAuthResult(result);
    setIsAuthenticated(result.success);
  };
  
  const handleError = (error) => {
    console.error('Authentication failed:', error);
    setIsAuthenticated(false);
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Welcome to your profile</h1>
          <button onClick={() => {
            // Use TokenManager to clear tokens and update state
            const tokenManager = TokenManager.getInstance();
            tokenManager.clearTokens();
            setIsAuthenticated(false);
          }}>Sign out</button>
        </div>
      ) : (
        <div>
          <h1>Please sign in</h1>
          <KeysakoButton
            clientId="your-client-id"
            redirectUri="your-redirect-uri"
            onSuccess={handleSuccess}
            onError={handleError}
          />
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
| `onSuccess` | function | - | Callback function for successful authentication |
| `onError` | function | - | Callback function for authentication errors |

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
  --keysako-btn-backdrop-filter: none;
  --keysako-btn-text-shadow: none;
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

## Development

### Project Structure

```
keysako-js/
├── packages/
│   ├── core/         # Core functionality
│   ├── react/        # React components
│   └── vue/          # Vue components
├── examples/
│   ├── vanilla/      # Vanilla JS example
│   ├── react/        # React example
│   └── vue/          # Vue example
├── templates/        # Templates for CDN files
├── scripts/          # Build and utility scripts
└── dist/             # Generated distribution files
```

### Building the Library

```bash
# Install dependencies
npm install

# Build all packages
npm run build
```

This will:
1. Compile TypeScript files
2. Bundle the packages
3. Generate CDN files with integrity hashes
4. Create example HTML files

### Versioning

When releasing a new version:

1. Update the version in the root `package.json` and all package-specific `package.json` files
2. Run `npm run build` to generate new files with updated version numbers
3. The CDN files will be available in the `dist/` directory

## License

MIT
