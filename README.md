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

```html
<script 
    type="module" 
    src="https://cdn.keysako.com/connect.js"
    integrity="sha384-S14zw64FMypZWlE/Ds/mmF1Whd3n8O4gY/AoZIyePn0DbD2lgMyGtp7HlDGFRbjW"
    crossorigin="anonymous">
</script>

### Verifying Package Integrity

To ensure the code you receive from the CDN is identical to the npm package:

1. The CDN script includes an `integrity` attribute containing a SHA-384 hash of the file
2. You can verify this hash against the npm package locally using:

```bash
# For npm package
cat node_modules/keysako-identity/dist/keysako-connect.min.js | openssl dgst -sha384 -binary | openssl base64 -A

# For CDN file
curl -s https://cdn.keysako.com/connect.js | openssl dgst -sha384 -binary | openssl base64 -A
```

The hashes should match. Additionally, each release on npm includes a `checksums.txt` file containing the hashes of all distributed files.

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
| `age` | string | - | Display an age badge on the button |
| `shape` | string | 'rounded' | Button shape: 'rounded' or 'sharp' |
| `logo-only` | boolean | false | Display only the logo without text |
| `popup` | boolean | false | Use popup mode for authentication |
| `callback` | string | - | Name of the callback function to handle authentication results |
| `lang` | string | - | Force a specific language (overrides browser language) |

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
function handleAuth(result) {
    if (result.success) {
        console.log('User authenticated:', result.tokens);
    } else {
        console.error('Authentication failed:', result.error);
    }
}
</script>
```

## Internationalization

The button automatically adapts to the user's browser language. Text and age format are translated into the following languages:

| Language Code | Language | Example Age Format |
|--------------|----------|-------------------|
| `en` | English | 18+ |
| `fr` | Français | 18 ans+ |
| `es` | Español | +18 años |
| `de` | Deutsch | ab 18 |
| `it` | Italiano | 18+ |
| `pt` | Português | 18+ |
| `zh` | 中文 | 18岁+ |
| `ja` | 日本語 | 18歳以上 |
| `ko` | 한국어 | 18세+ |
| `ar` | العربية | +18 |
| `he` | עברית | 18+ |
| `hi` | हिन्दी | 18+ |
| `ru` | Русский | 18+ |
| `tr` | Türkçe | 18+ |
| `th` | ไทย | 18+ |
| `vi` | Tiếng Việt | 18+ |

### Language Selection

By default, the button uses the user's browser language. You can override this by using the `lang` attribute:

```html
<!-- Auto-detect browser language (default) -->
<keysako-connect
    client-id="your-client-id"
    redirect-uri="your-redirect-uri">
</keysako-connect>

<!-- Force French language -->
<keysako-connect
    client-id="your-client-id"
    redirect-uri="your-redirect-uri"
    lang="fr">
</keysako-connect>
```

#### Right-to-Left (RTL) Support

Arabic (ar) and Hebrew (he) are automatically displayed in RTL mode, with the logo position adjusted accordingly.

## Events

The button emits the following custom events:

| Event Name | Description |
|------------|-------------|
| `keysako:auth_complete` | Fired when authentication is complete |
| `keysako:tokens_updated` | Fired when tokens are updated |
| `keysako:tokens_cleared` | Fired when tokens are cleared |

## License

MIT License
