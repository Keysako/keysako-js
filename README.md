# Keysako Identity

A secure, multi-framework authentication library for JavaScript applications with pluggable token storage strategies.

[![npm version](https://badge.fury.io/js/@keysako/core.svg)](https://badge.fury.io/js/@keysako/core)
[![Build Status](https://github.com/Keysako/keysako-js/actions/workflows/build-and-test.yml/badge.svg?branch=main)](https://github.com/Keysako/keysako-js/actions/workflows/build-and-test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **🔐 Secure by Design**: Multiple token storage strategies (memory, session, encrypted, custom)
- **🎯 Framework Agnostic**: Support for React, Vue, and vanilla JavaScript
- **🛡️ Security First**: Built-in XSS protection, automatic token expiration, and secure defaults
- **🔌 Pluggable Storage**: Implement custom storage for enterprise needs
- **📱 Universal**: Works in browsers, PWAs, mobile apps, and Node.js environments
- **🎨 Customizable**: Flexible theming and configuration options
- **🚪 Easy Integration**: Drop-in authentication buttons and components

## 📦 Packages

This monorepo contains the following packages:

- [`@keysako/core`](packages/core/): Core functionality and vanilla JS support
- [`@keysako/react`](packages/react/): React components and hooks
- [`@keysako/vue`](packages/vue/): Vue components and composables

## 🏃‍♂️ Quick Start

### Installation

```bash
# Choose your framework
npm install @keysako/core      # Vanilla JS
npm install @keysako/react     # React
npm install @keysako/vue       # Vue
```

### Basic Usage

#### Vanilla JavaScript / Web Components

```html
<script type="module">
  import { KeysakoButton } from '@keysako/core';

  customElements.define('keysako-connect', KeysakoButton);
</script>

<keysako-connect client-id="your-client-id" redirect-uri="your-redirect-uri"> </keysako-connect>
```

#### React

```jsx
import { KeysakoButton } from '@keysako/react';
import { useCallback } from 'react';

function LoginPage() {
  // ✅ Use useCallback to prevent unnecessary re-renders
  const handleSuccess = useCallback(result => {
    console.log('Success:', result);
  }, []);

  const handleError = useCallback(error => {
    console.error('Error:', error);
  }, []);

  return (
    <KeysakoButton
      clientId="your-client-id"
      redirectUri="your-redirect-uri"
      theme="default"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

#### Vue

```vue
<template>
  <KeysakoButton
    client-id="your-client-id"
    redirect-uri="your-redirect-uri"
    theme="default"
    @success="handleSuccess"
    @error="handleError"
  />
</template>

<script setup>
import { KeysakoButton } from '@keysako/vue';

function handleSuccess(result) {
  console.log('Authentication successful:', result);
}

function handleError(error) {
  console.error('Authentication failed:', error);
}
</script>
```

## 🔍 Understanding Authentication Results

The `AuthResult` interface provides comprehensive information about the authentication outcome, enabling you to make informed decisions about user access and UX flows.

### AuthResult Properties

```typescript
interface AuthResult {
  success: boolean;
  isAuthorized: boolean;
  token?: string;
  hasIdentity: boolean;
  hasRequiredAge: boolean;
  requiredAge?: string;
  isCountryAllowed: boolean;
  countryCode?: string;
  expiresAt?: string; // Unix timestamp as string (e.g., "1750081485")
  error?: string;
}
```

> **📝 Note about `expiresAt`**: This field contains the JWT `exp` claim value, which is a Unix timestamp in seconds. In your application, you'll need to convert it to a JavaScript Date: `new Date(parseInt(expiresAt) * 1000)`.

| Property           | Type    | Description                                                                                                   |
| ------------------ | ------- | ------------------------------------------------------------------------------------------------------------- |
| `success`          | boolean | Whether the authentication was successful                                                                     |
| `isAuthorized`     | boolean | Whether the user is authorized to access the service (meets age requirements and is allowed in their country) |
| `token`            | string? | Access token (only present if success is true)                                                                |
| `hasIdentity`      | boolean | Whether the user has an identity (if identity verification was requested)                                     |
| `hasRequiredAge`   | boolean | Whether the age requirement was met (if age verification was requested)                                       |
| `requiredAge`      | string? | The required age for the user (e.g., "18", "16", "-13")                                                       |
| `isCountryAllowed` | boolean | Whether the user is allowed to access the service in their country                                            |
| `countryCode`      | string? | The country of the user (ISO 3166-1 alpha-2, e.g., "FR", "US", "CA")                                          |
| `expiresAt`        | string? | The expiration time of the token (Unix timestamp as string, e.g., "1750081485")                               |
| `error`            | string? | Error message (only present if success is false)                                                              |

### Making Decisions with AuthResult

Use the `AuthResult` properties to implement proper access control and user experience:

#### ✅ Full Access

```typescript
function handleAuthSuccess(result: AuthResult) {
  if (result.success && result.isAuthorized) {
    // User is fully authenticated and authorized
    redirectToApp();
    showWelcomeMessage();
  }
}
```

#### 🚫 Age Restriction

```typescript
function handleAuthSuccess(result: AuthResult) {
  if (result.success && !result.hasRequiredAge) {
    // User authenticated but doesn't meet age requirements
    showAgeRestrictionMessage(result.requiredAge);
    redirectToAgeVerification();
  }
}
```

#### 🌍 Geographic Restriction

```typescript
function handleAuthSuccess(result: AuthResult) {
  if (result.success && !result.isCountryAllowed) {
    // User authenticated but service not available in their country
    showGeographicRestrictionMessage(result.countryCode);
    redirectToUnavailablePage();
  }
}
```

#### 🔄 Identity Verification Required

```typescript
function handleAuthSuccess(result: AuthResult) {
  if (result.success && !result.hasIdentity) {
    // User authenticated but needs identity verification
    redirectToIdentityVerification();
  }
}
```

#### 📱 Comprehensive UX Flow

```typescript
function handleAuthSuccess(result: AuthResult) {
  if (!result.success) {
    showErrorMessage(result.error);
    return;
  }

  // Check authorization status
  if (result.isAuthorized) {
    // Full access granted
    storeToken(result.token);

    // Handle token expiration if provided
    if (result.expiresAt) {
      const expirationDate = new Date(parseInt(result.expiresAt) * 1000);
      scheduleTokenRefresh(expirationDate);
    }

    redirectToApp();
  } else {
    // Handle specific authorization issues
    if (!result.hasRequiredAge) {
      showAgeRestrictionDialog(result.requiredAge);
    } else if (!result.isCountryAllowed) {
      showGeographicRestrictionDialog(result.countryCode);
    } else if (!result.hasIdentity) {
      redirectToIdentityVerification();
    }
  }

  // Log analytics
  trackAuthentication({
    success: result.success,
    authorized: result.isAuthorized,
    country: result.countryCode,
    hasIdentity: result.hasIdentity,
    expiresAt: result.expiresAt ? new Date(parseInt(result.expiresAt) * 1000) : null,
  });
}
```

#### ⏰ Working with Token Expiration

```typescript
function checkTokenExpiration(result: AuthResult) {
  if (result.expiresAt) {
    const expirationDate = new Date(parseInt(result.expiresAt) * 1000);
    const now = new Date();

    if (expirationDate > now) {
      const timeUntilExpiry = expirationDate.getTime() - now.getTime();
      console.log(`Token expires in ${Math.round(timeUntilExpiry / 1000)} seconds`);
      console.log(`Token expires at: ${expirationDate.toLocaleString()}`);
    } else {
      console.log('Token has expired');
    }
  }
}
```

## 🛡️ Secure Token Storage

Keysako Identity provides multiple storage strategies to meet different security requirements:

### Built-in Strategies

```typescript
import { TokenManager } from '@keysako/core';

// Default: Session storage (secure, cleared when tab closes)
const tokenManager = TokenManager.getInstance();

// Memory storage (most secure, doesn't persist)
const tokenManager = TokenManager.getInstance({
  storageStrategy: 'memory',
});

// Encrypted localStorage
const tokenManager = TokenManager.getInstance({
  storageStrategy: 'encrypted',
  encryptionKey: 'your-encryption-key',
});

// Legacy localStorage (for backward compatibility)
const tokenManager = TokenManager.getInstance({
  storageStrategy: 'localStorage',
});
```

### Custom Storage

Implement your own storage for enterprise needs:

```typescript
import { BaseTokenStorage, TokenData } from '@keysako/core';

class MyCustomStorage extends BaseTokenStorage {
  constructor() {
    super('my-storage');
  }

  isAvailable(): boolean {
    return true;
  }

  setItem(key: string, tokens: TokenData): void {
    // Your storage logic
  }

  getItem(key: string): TokenData | null {
    // Your retrieval logic
  }

  removeItem(key: string): void {
    // Your removal logic
  }
}

const tokenManager = TokenManager.getInstance({
  customStorage: new MyCustomStorage(),
});
```

## 📚 Examples

We provide comprehensive examples for different use cases:

- **[Vue Example](./examples/vue/)**: Complete Vue.js application with Vite
- **[React Example](./examples/react/)**: React application with TypeScript
- **[Vanilla JS Example](./examples/vanilla/)**: Pure HTML/JS implementation
- **[Custom Storage Examples](./examples/custom-storage/)**: Advanced storage implementations

## ⚙️ Configuration

### Button Options

| Option        | Type    | Default                | Description                              |
| ------------- | ------- | ---------------------- | ---------------------------------------- |
| `clientId`    | string  | required               | Your Keysako client ID                   |
| `redirectUri` | string  | window.location.origin | OAuth redirect URI                       |
| `theme`       | string  | 'default'              | Button theme: 'default', 'light', 'dark' |
| `shape`       | string  | 'rounded'              | Button shape: 'rounded', 'sharp'         |
| `logoOnly`    | boolean | false                  | Display only logo without text           |
| `usePopup`    | boolean | false                  | Use popup instead of redirect            |
| `age`         | number  | -                      | Age verification requirement             |
| `locale`      | string  | -                      | Force specific language                  |

### Storage Options

| Strategy         | Security   | Persistence  | Use Case              | Default |
| ---------------- | ---------- | ------------ | --------------------- | ------- |
| `sessionStorage` | ⭐⭐⭐⭐   | Session      | Most web apps         | ✅      |
| `memory`         | ⭐⭐⭐⭐⭐ | None         | High-security, kiosks |         |
| `encrypted`      | ⭐⭐⭐⭐   | Configurable | Enhanced security     |         |
| `localStorage`   | ⭐⭐       | Permanent    | Legacy compatibility  |         |
| `custom`         | ⭐⭐⭐⭐⭐ | Configurable | Enterprise needs      |         |

## 🔧 Development

### Setup

```bash
git clone https://github.com/keysako/keysako-js.git
cd keysako-js
npm install
```

### Build

```bash
npm run build        # Build all packages
npm run build:core   # Build core package only
npm run build:react  # Build React package only
npm run build:vue    # Build Vue package only
```

### Testing

```bash
npm test             # Run all tests
npm run test:unit    # Unit tests only
npm run test:e2e     # End-to-end tests
```

### Examples

```bash
cd examples/vue
npm install
npm run dev
```

## 🏷️ Release Management

This project follows semantic versioning (SemVer) and uses a structured release process.

### Version Numbering

We follow [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backwards compatible manner
- **PATCH** version when you make backwards compatible bug fixes

Example: `1.2.3` where `1` is major, `2` is minor, `3` is patch.

### Release Process

#### 1. Update Version Numbers

Use the new JavaScript-based release script for cross-platform compatibility:

```bash
# Update versions and create release
node scripts/update-version.js 1.2.2

# The script will:
# - Update all package.json files
# - Update cross-package dependencies
# - Build and test all packages
# - Provide push instructions
```

#### 2. Commit Changes

Create a comprehensive commit message:

```bash
git add .
git commit -m "Release v1.2.0: Brief description of major changes

✨ New Features:
- Feature 1 description
- Feature 2 description

🐛 Bug Fixes:
- Bug fix 1
- Bug fix 2

🔄 Changes:
- Breaking change 1 (if any)
- Other notable changes

📚 Documentation:
- Documentation updates

🧪 Testing:
- Test improvements"
```

#### 3. Create Git Tag

**Option A: Tag after PR merge (Recommended)**

```bash
# 1. Push your feature branch
git push origin your-feature-branch

# 2. Create Pull Request on GitHub/GitLab

# 3. After PR is merged, switch to main and create tag
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

**Option B: Tag on feature branch (if you merge yourself)**

```bash
# Create annotated tag with release notes
git tag -a v1.2.0 -m "Release v1.2.0

Major improvements:
- Feature highlights
- Important bug fixes
- Breaking changes (if any)

Full changelog: See commit history for detailed changes."

# Push commits and tags
git push origin your-feature-branch
git push origin v1.2.0
```

#### 5. Verify Release

```bash
# Check tags
git tag -l
git show v1.2.0

# Verify build artifacts
ls -la packages/*/dist/
```

### Release Types

#### 🔧 Patch Release (1.2.3 → 1.2.4)

- Bug fixes
- Security patches
- Documentation updates
- No breaking changes

#### ✨ Minor Release (1.2.3 → 1.3.0)

- New features
- New language support
- Framework version updates (React 19 support)
- Backwards compatible changes

#### 💥 Major Release (1.2.3 → 2.0.0)

- Breaking API changes
- Major architecture changes
- Removal of deprecated features
- Requires migration guide

### Release Checklist

Before creating a release:

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Version numbers updated in all packages
- [ ] Dependencies updated between packages
- [ ] CHANGELOG.md updated (if exists)
- [ ] Breaking changes documented
- [ ] Migration guide updated (for major/minor with breaking changes)
- [ ] Examples tested with new version

### Post-Release

After pushing the tag:

- [ ] Verify packages build correctly
- [ ] Update documentation website (if applicable)
- [ ] Publish to npm registry (if public packages)
- [ ] Create GitHub release with release notes
- [ ] Announce release (Discord, Twitter, etc.)

## 🐛 Known Issues & Solutions

### React StrictMode Double Mounting

In development mode with React 18's StrictMode, you might notice components mount twice. This is expected behavior for detecting side effects. Our components handle this gracefully:

- **Issue**: Authentication buttons may appear to initialize twice in development
- **Solution**: Use `useCallback` for event handlers to prevent unnecessary re-renders
- **Note**: This only happens in development (`npm run dev`), not in production builds

### Preventing Re-render Issues

Always memoize callback functions in React:

```jsx
// ❌ Don't: Creates new functions on each render
<KeysakoButton onSuccess={result => handleLogin(result)} />;

// ✅ Do: Use useCallback for stable references
const handleSuccess = useCallback(result => handleLogin(result), []);
<KeysakoButton onSuccess={handleSuccess} />;
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Add** tests for new functionality
5. **Ensure** all tests pass
6. **Submit** a pull request

### Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## 📋 Migration Guide

### From v1.1.x to v1.2.x

The main breaking change is that TokenManager methods are now async:

```typescript
// Before (v1.1.x)
const isAuth = tokenManager.isAuthenticated();
const token = tokenManager.getAccessToken();

// After (v1.2.x)
const isAuth = await tokenManager.isAuthenticated();
const token = await tokenManager.getAccessToken();
```

See the [Migration Guide](MIGRATION.md) for detailed instructions.

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🏗️ Architecture

```
keysako-js/
├── packages/
│   ├── core/         # Framework-agnostic core
│   ├── react/        # React bindings
│   └── vue/          # Vue bindings
├── examples/
│   ├── vanilla/      # Pure JS examples
│   ├── react/        # React examples
│   ├── vue/          # Vue examples
│   └── custom-storage/ # Storage implementations
└── scripts/          # Build and utility scripts
```

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern security best practices
- Inspired by OAuth 2.0 and OpenID Connect standards
- Community-driven development

## 🔗 Links

- **Documentation**: [https://keysako.com/developers](https://keysako.com/developers)
- **Issues**: [GitHub Issues](https://github.com/keysako/keysako-js/issues)
- **Discussions**: [GitHub Discussions](https://github.com/keysako/keysako-js/discussions)

---

**Made with ❤️ by the Keysako team and contributors**
