# Keysako Connect

A simple and customizable authentication button for Keysako identity provider.

## Installation

### Via NPM

```bash
npm install keysako-identity
```

```javascript
// ESM
import 'keysako-identity';

// CommonJS
require('keysako-identity');
```

### Via CDN

For UMD (Universal Module Definition):

Basic usage:
```html
<script src="https://cdn.keysako.com/v1/keysako-connect.min.js"></script>
```

Recommended secure usage:
```html
<script 
    src="https://cdn.keysako.com/v1/keysako-connect.min.js"
    integrity="sha384-${{ env.CDN_HASH }}"
    crossorigin="anonymous">
</script>
```

For ES Module:

Basic usage:
```html
<script type="module" src="https://cdn.keysako.com/v1/keysako-connect.esm.js"></script>
```

Recommended secure usage:
```html
<script 
    type="module" 
    src="https://cdn.keysako.com/v1/keysako-connect.esm.js"
    integrity="sha384-${{ env.CDN_HASH }}"
    crossorigin="anonymous">
</script>
```

### Security Best Practices

While the `integrity` and `crossorigin` attributes are optional, we strongly recommend using them:

- `integrity`: Ensures the file hasn't been tampered with by verifying its hash
- `crossorigin="anonymous"`: Ensures proper CORS handling when loading the script from our CDN

### Verifying Package Integrity

Each release includes a `checksums.txt` file containing SHA-384 hashes for all distributed files. You can find these files in:
- The npm package under `dist/v1/checksums.txt`
- The CDN at `https://cdn.keysako.com/v1/checksums.txt`
- The GitHub release assets

To verify a file's integrity:
1. Download the file you want to verify
2. Calculate its SHA-384 hash:
```bash
cat filename | openssl dgst -sha384 -binary | openssl base64 -A
```
3. Compare the result with the hash in `checksums.txt`

## Basic Usage

```html
<keysako-connect
    client-id="your-client-id"
    redirect-uri="your-redirect-uri">
</keysako-connect>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `client-id` | string | required | Your Keysako client ID |
| `redirect-uri` | string | required | The URI where users will be redirected after authentication |
| `theme` | string | 'default' | Button theme: 'default', 'light', or 'dark' |
| `age` | string | - | Display an age badge on the button (e.g., "18" for 18+) |
| `shape` | string | 'rounded' | Button shape: 'rounded' or 'sharp' |
| `logo-only` | boolean | false | Display only the logo without text |
| `popup` | boolean | false | Use popup mode for authentication |
| `callback` | string | - | Name of the callback function to handle authentication results |
| `lang` | string | - | Force a specific language (overrides browser language) |

## Events

The button emits the following custom events:

| Event Name | Description | Detail |
|------------|-------------|---------|
| `keysako:auth_complete` | Fired when authentication is complete | `{ success: boolean, token?: string, hasRequiredAge?: boolean, error?: string }` |
| `keysako:tokens_updated` | Fired when tokens are updated | `{ token: string }` |
| `keysako:tokens_cleared` | Fired when tokens are cleared | - |

### Handling Events

You can listen to these events in two ways:

1. Using the `callback` attribute:
```html
<keysako-connect
    client-id="your-client-id"
    redirect-uri="your-redirect-uri"
    callback="handleAuth">
</keysako-connect>

<script>
function handleAuth(response) {
    if (response.success) {
        console.log('Authentication successful:', response.data);
        if (response.hasRequiredAge) {
            console.log('Age requirement met');
        }
    } else {
        console.error('Authentication failed:', response.error);
    }
}
</script>
```

2. Using event listeners:
```html
<keysako-connect
    id="keysako-button"
    client-id="your-client-id"
    redirect-uri="your-redirect-uri">
</keysako-connect>

<script>
const button = document.getElementById('keysako-button');

button.addEventListener('keysako:auth_complete', (event) => {
    const { success, token, hasRequiredAge, error } = event.detail;
    if (success) {
        console.log('Authentication successful:', token);
    } else {
        console.error('Authentication failed:', error);
    }
});

button.addEventListener('keysako:tokens_updated', (event) => {
    console.log('Token updated:', event.detail.token);
});

button.addEventListener('keysako:tokens_cleared', () => {
    console.log('Tokens cleared');
});
</script>
```

## Examples

### Basic Authentication Button
```html
<keysako-connect
    client-id="your-client-id"
    redirect-uri="your-redirect-uri">
</keysako-connect>
```

### Customized Button
```html
<keysako-connect
    client-id="your-client-id"
    redirect-uri="your-redirect-uri"
    theme="light"
    age="18"
    shape="sharp"
    logo-only>
</keysako-connect>
```

### With Callback
```html
<keysako-connect
    client-id="your-client-id"
    redirect-uri="your-redirect-uri"
    callback="handleAuth">
</keysako-connect>

<script>
function handleAuth(response) {
    if (response.success) {
        console.log('Authentication successful:', response.data);
    } else {
        console.error('Authentication failed:', response.error);
    }
}
</script>
```

## Browser Support

The library is compatible with all modern browsers that support Web Components:
- Chrome
- Firefox
- Safari
- Edge

## Development

To build the library locally:

1. Clone the repository
```bash
git clone https://github.com/keysako/keysako-js.git
cd keysako-js
```

2. Install dependencies
```bash
npm install
```

3. Build the library
```bash
npm run build
```

## License

MIT License - see LICENSE file for details.
