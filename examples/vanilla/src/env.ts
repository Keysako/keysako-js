// Fichier de configuration des variables d'environnement
interface EnvVars {
  KEYSAKO_IDENTITY_SERVER_URI: string;
}

// Valeurs par défaut pour le développement
const defaultEnv: EnvVars = {
  KEYSAKO_IDENTITY_SERVER_URI: 'https://auth.keysako.com'
};

// Récupérer les variables d'environnement de Vite
export const env: EnvVars = {
  KEYSAKO_IDENTITY_SERVER_URI: import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI || defaultEnv.KEYSAKO_IDENTITY_SERVER_URI
};

// Fonction pour obtenir l'URI du serveur d'identité
export function getIdentityServerUri(): string {
  return env.KEYSAKO_IDENTITY_SERVER_URI;
}

// Exposer la variable d'environnement globalement pour que IdentityProvider puisse y accéder
if (typeof window !== 'undefined') {
  // @ts-ignore - Ajouter la variable d'environnement à window
  window.ENV_KEYSAKO_IDENTITY_SERVER_URI = env.KEYSAKO_IDENTITY_SERVER_URI;
}
