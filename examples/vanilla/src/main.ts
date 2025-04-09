// Importer le module env en premier pour exposer les variables d'environnement
import './env';
import { KeysakoButton, TokenManager, logoSvg } from '@keysako-identity/core';
import { getIdentityServerUri } from './env';

// Afficher l'URI du serveur d'identité depuis les variables d'environnement
const serverUriElement = document.getElementById('server-uri');
if (serverUriElement) {
  // Utiliser la variable d'environnement pour l'URI du serveur d'identité
  const serverUri = getIdentityServerUri();
  serverUriElement.textContent = `Server URI: ${serverUri}`;
}

// Récupérer les éléments DOM
const authStatus = document.getElementById('auth-status') as HTMLDivElement;
const tokenInfo = document.getElementById('token-info') as HTMLPreElement;
const getTokenBtn = document.getElementById('get-token-btn') as HTMLButtonElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;

// Configuration commune pour tous les boutons
const clientId = 'demo';
const redirectUri = window.location.origin + window.location.pathname;
// L'URI du serveur est configuré via la variable d'environnement VITE_KEYSAKO_IDENTITY_SERVER_URI

// Créer les instances de boutons Keysako
createButton('standard-button-light', { theme: 'light' });
createButton('standard-button-dark', { theme: 'dark' });
createButton('age-button-light', { theme: 'light', age: 18 });
createButton('age-button-dark', { theme: 'dark', age: 18 });
createButton('popup-button-light', { theme: 'light', usePopup: true });
createButton('popup-button-dark', { theme: 'dark', usePopup: true });
createButton('logo-button-light', { theme: 'light', logoOnly: true });
createButton('logo-button-dark', { theme: 'dark', logoOnly: true });

// Obtenir l'instance du gestionnaire de tokens
const tokenManager = TokenManager.getInstance();

// Vérifier l'état initial de l'authentification
updateAuthStatus();

// Ajouter les écouteurs d'événements
window.addEventListener('keysako:tokens_updated', updateAuthStatus);
window.addEventListener('keysako:tokens_cleared', updateAuthStatus);
getTokenBtn.addEventListener('click', displayTokenInfo);
logoutBtn.addEventListener('click', logout);

/**
 * Crée un bouton Keysako et l'ajoute au conteneur spécifié
 */
function createButton(containerId: string, options: {
  theme?: 'light' | 'dark',
  logoOnly?: boolean,
  age?: number,
  usePopup?: boolean
}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Créer l'instance du bouton Keysako
  const keysakoButton = new KeysakoButton({
    clientId,
    redirectUri,
    theme: options.theme || 'light',
    logoOnly: options.logoOnly || false,
    age: options.age,
    usePopup: options.usePopup || false,
    onSuccess: handleAuthSuccess,
    onError: handleAuthError
  });

  // Ajouter les styles au document s'ils n'existent pas déjà
  if (!document.getElementById('keysako-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'keysako-styles';
    styleElement.textContent = keysakoButton.getStyles();
    document.head.appendChild(styleElement);
  }

  // Créer l'élément DOM du bouton
  const buttonElement = document.createElement('button');
  buttonElement.className = `keysako-button ${options.logoOnly ? 'logo-only' : ''}`;
  
  // Ajouter le logo
  const logoElement = document.createElement('span');
  logoElement.className = 'keysako-button-logo';
  logoElement.innerHTML = logoSvg;
  buttonElement.appendChild(logoElement);
  
  // Ajouter le texte si ce n'est pas un bouton logo-only
  if (!options.logoOnly) {
    const textElement = document.createElement('span');
    textElement.className = 'keysako-button-text';
    textElement.textContent = 'Se connecter avec Keysako';
    buttonElement.appendChild(textElement);
  }
  
  // Ajouter le badge d'âge si nécessaire
  if (options.age) {
    const badgeElement = document.createElement('span');
    badgeElement.className = 'keysako-button-age-badge';
    badgeElement.textContent = `${options.age}+`;
    buttonElement.appendChild(badgeElement);
  }
  
  // Ajouter l'écouteur de clic
  buttonElement.addEventListener('click', () => {
    if (tokenManager.hasValidAccessToken()) {
      tokenManager.clearTokens();
      updateAuthStatus();
    } else {
      // Utiliser le provider pour se connecter
      keysakoButton['provider']?.login();
    }
  });
  
  // Appliquer le thème au bouton
  if (options.theme === 'light') {
    buttonElement.style.setProperty('--keysako-btn-bg', '#ffffff');
    buttonElement.style.setProperty('--keysako-btn-color', '#000000');
    buttonElement.style.setProperty('--keysako-btn-border', '1px solid #e0e0e0');
    buttonElement.style.setProperty('--keysako-btn-shadow', '0 2px 4px rgba(0,0,0,0.05)');
    buttonElement.style.setProperty('--keysako-btn-hover-bg', '#f5f5f5');
    buttonElement.style.setProperty('--keysako-btn-radius', '8px');
  } else if (options.theme === 'dark') {
    buttonElement.style.setProperty('--keysako-btn-bg', '#333333');
    buttonElement.style.setProperty('--keysako-btn-color', '#ffffff');
    buttonElement.style.setProperty('--keysako-btn-border', 'none');
    buttonElement.style.setProperty('--keysako-btn-shadow', '0 2px 4px rgba(0,0,0,0.2)');
    buttonElement.style.setProperty('--keysako-btn-hover-bg', '#444444');
    buttonElement.style.setProperty('--keysako-btn-radius', '8px');
  }
  
  // Ajouter le bouton au conteneur
  container.appendChild(buttonElement);
}

/**
 * Gère le succès de l'authentification
 */
function handleAuthSuccess(result: any) {
  console.log('Authentication successful:', result);
  authStatus.textContent = 'Authentifié';
  authStatus.style.color = 'green';
  updateAuthStatus();
}

/**
 * Gère l'erreur d'authentification
 */
function handleAuthError(error: any) {
  console.error('Authentication failed:', error);
  authStatus.textContent = `Échec d'authentification: ${error.error}`;
  authStatus.style.color = 'red';
  updateAuthStatus();
}

/**
 * Met à jour l'état d'authentification dans l'interface
 */
function updateAuthStatus() {
  const isAuthenticated = tokenManager.hasValidAccessToken();
  
  if (isAuthenticated) {
    authStatus.textContent = 'Authentifié';
    authStatus.style.color = 'green';
    getTokenBtn.disabled = false;
    logoutBtn.disabled = false;
  } else {
    authStatus.textContent = 'Non authentifié';
    authStatus.style.color = 'gray';
    tokenInfo.textContent = 'Aucun token disponible';
    getTokenBtn.disabled = true;
    logoutBtn.disabled = true;
  }
}

/**
 * Affiche les informations du token
 */
function displayTokenInfo() {
  const accessToken = tokenManager.getAccessToken();
  const idToken = tokenManager.getIdToken();
  const claims = tokenManager.getTokenClaims();
  
  tokenInfo.textContent = JSON.stringify({
    accessToken: accessToken ? `${accessToken.substring(0, 10)}...` : null,
    idToken: idToken ? `${idToken.substring(0, 10)}...` : null,
    claims
  }, null, 2);
}

/**
 * Déconnexion
 */
function logout() {
  tokenManager.clearTokens();
  updateAuthStatus();
}
