/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KEYSAKO_IDENTITY_SERVER_URI: string
  // plus d'env vars...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
