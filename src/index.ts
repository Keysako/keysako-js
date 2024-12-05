import { IdentityButton } from './identity-button.js';

// Register the custom element if it hasn't been registered yet
if (!customElements.get('keysako-connect')) {
    customElements.define('keysako-connect', IdentityButton);
}

// Only export the custom element class
export { IdentityButton as KeysakoConnect };
