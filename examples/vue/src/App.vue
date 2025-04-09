<template>
  <div class="container">
    <header>
      <h1>Keysako Identity - Vue Example</h1>
      <p>Server URI: {{ serverUri }}</p>
    </header>

    <div class="buttons-container">
      <div class="button-row">
        <h2>Standard Buttons</h2>
        <KeysakoButton 
          client-id="test-client-id" 
          :redirect-uri="redirectUri"
          theme="light" 
          @success="handleSuccess"
          @error="handleError"
        />
        <KeysakoButton 
          client-id="test-client-id" 
          :redirect-uri="redirectUri"
          theme="dark" 
          @success="handleSuccess"
          @error="handleError"
        />
      </div>

      <div class="button-row">
        <h2>Age Verified Buttons</h2>
        <KeysakoButton 
          client-id="test-client-id" 
          :redirect-uri="redirectUri"
          theme="light" 
          :age="18"
          @success="handleSuccess"
          @error="handleError"
        />
        <KeysakoButton 
          client-id="test-client-id" 
          :redirect-uri="redirectUri"
          theme="dark" 
          :age="18"
          @success="handleSuccess"
          @error="handleError"
        />
      </div>

      <div class="button-row">
        <h2>Popup Buttons</h2>
        <KeysakoButton 
          client-id="test-client-id" 
          :redirect-uri="redirectUri"
          theme="light" 
          :use-popup="true"
          @success="handleSuccess"
          @error="handleError"
        />
        <KeysakoButton 
          client-id="test-client-id" 
          :redirect-uri="redirectUri"
          theme="dark" 
          :use-popup="true"
          @success="handleSuccess"
          @error="handleError"
        />
      </div>

      <div class="button-row">
        <h2>Logo Only Buttons</h2>
        <KeysakoButton 
          client-id="test-client-id" 
          :redirect-uri="redirectUri"
          theme="light" 
          :logo-only="true"
          @success="handleSuccess"
          @error="handleError"
        />
        <KeysakoButton 
          client-id="test-client-id" 
          :redirect-uri="redirectUri"
          theme="dark" 
          :logo-only="true"
          @success="handleSuccess"
          @error="handleError"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KeysakoButton } from '@keysako-identity/vue';
import { ref, onMounted } from 'vue';

// Définir les variables réactives
const serverUri = ref('');
const redirectUri = ref('');

onMounted(() => {
  // Exposer les variables d'environnement à la fenêtre globale
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.ENV_KEYSAKO_IDENTITY_SERVER_URI = import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI;
  }

  // Définir l'URI de redirection
  redirectUri.value = window.location.origin;

  // Récupérer l'URI du serveur depuis les variables d'environnement
  serverUri.value = import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI || 'Not configured';
  console.log('Server URI:', serverUri.value);
});

function handleSuccess(result: any) {
  console.log('Authentication successful:', result);
  alert('Authentication successful: ' + JSON.stringify(result));
}

function handleError(error: any) {
  console.error('Authentication failed:', error);
  alert('Authentication failed: ' + JSON.stringify(error));
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

header {
  margin-bottom: 2rem;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.button-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #555;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}
</style>
