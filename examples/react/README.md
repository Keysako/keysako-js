# Keysako Identity - React Example

This example shows how to integrate the Keysako Identity library into a React application built with Vite.js.

## Features

- Authentication with Keysako Identity Provider
- Different variants of the authentication button
- Light and dark themes
- Configuration via environment variables

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Create an `.env` file at the root of the project to configure the identity server URI:

```
# .env
VITE_KEYSAKO_IDENTITY_SERVER_URI=https://auth.keysako.com
```

## Development

```bash
# Start the development server
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

## Usage Examples

### Standard Authentication Button

```jsx
<KeysakoButton 
  clientId="your-client-id" 
  redirectUri={window.location.origin}
  theme="light" 
/>
```

### Button with Age Verification

```jsx
<KeysakoButton 
  clientId="your-client-id" 
  redirectUri={window.location.origin}
  theme="light" 
  age={18} 
/>
```

### Button with Popup

```jsx
<KeysakoButton 
  clientId="your-client-id" 
  redirectUri={window.location.origin}
  theme="light" 
  usePopup 
/>
```

### Logo-Only Button

```jsx
<KeysakoButton 
  clientId="your-client-id" 
  redirectUri={window.location.origin}
  theme="light" 
  logoOnly 
/>
```

## Production Build

```bash
# Create a production build
npm run build
```

The production files will be generated in the `dist` folder.
