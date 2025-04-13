<template>
  <div class="container">
    <header>
      <h1>Keysako Identity - Vue Example</h1>
      <p>Server URI: {{ serverUri }}</p>
      <p>Redirect URI: {{ redirectUri }}</p>
    </header>

    <!-- Authentication results display section -->
    <div class="auth-result-container" v-if="authResult || authError">
      <div class="auth-result" v-if="authResult">
        <h2>Authentication Result</h2>
        <div class="result-details">
          <p><strong>Success:</strong> {{ authResult.success ? 'Yes' : 'No' }}</p>
          <p v-if="authResult.hasRequiredAge !== undefined">
            <strong>Age Verification:</strong> {{ authResult.hasRequiredAge ? 'Passed' : 'Failed' }}
          </p>
          <div v-if="authResult.token">
            <p><strong>Token:</strong></p>
            <div class="token-display">
              {{ authResult.token.substring(0, 20) }}...
            </div>
          </div>
          <p v-if="authResult.error"><strong>Error:</strong> {{ authResult.error }}</p>
        </div>
      </div>

      <div class="auth-error" v-if="authError">
        <h2>Authentication Error</h2>
        <div class="error-details">
          <p><strong>Message:</strong> {{ authError.error }}</p>
          <p v-if="authError.details"><strong>Details:</strong> {{ JSON.stringify(authError.details) }}</p>
        </div>
      </div>
    </div>

    <div class="buttons-container">
      <div class="button-row">
        <h2>Standard Buttons</h2>
        <KeysakoButton 
          client-id="demo" 
          :redirect-uri="redirectUri"
          theme="light" 
          @success="handleSuccess"
          @error="handleError"
        />
        <KeysakoButton 
          client-id="demo" 
          :redirect-uri="redirectUri"
          theme="dark" 
          @success="handleSuccess"
          @error="handleError"
        />
      </div>

      <div class="button-row">
        <h2>Age Verified Buttons</h2>
        <KeysakoButton 
          client-id="demo" 
          :redirect-uri="redirectUri"
          theme="light" 
          :age="18"
          @success="handleSuccess"
          @error="handleError"
        />
        <KeysakoButton 
          client-id="demo" 
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
          client-id="demo" 
          :redirect-uri="redirectUri"
          theme="light" 
          :use-popup="true"
          @success="handleSuccess"
          @error="handleError"
        />
        <KeysakoButton 
          client-id="demo" 
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
          client-id="demo" 
          :redirect-uri="redirectUri"
          theme="light" 
          :logo-only="true"
          @success="handleSuccess"
          @error="handleError"
        />
        <KeysakoButton 
          client-id="demo" 
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
import { AuthResult, AuthError } from '@keysako-identity/core';

// Define reactive variables
const serverUri = ref('');
const redirectUri = ref(window.location.origin + '/auth/callback');
const authResult = ref<AuthResult | null>(null);
const authError = ref<AuthError | null>(null);

onMounted(() => {
  // Expose environment variables to the global window
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.ENV_KEYSAKO_IDENTITY_SERVER_URI = import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI;
  }

  // Ensure redirect URI is set correctly
  redirectUri.value = window.location.origin + '/auth/callback';
  console.log('Redirect URI:', redirectUri.value);

  // Get the server URI from environment variables
  serverUri.value = import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI || 'Not configured';
  console.log('Server URI:', serverUri.value);
});

function handleSuccess(result: AuthResult) {
  console.log('Authentication successful:', result);
  authResult.value = result;
  authError.value = null;
}

function handleError(error: AuthError) {
  console.error('Authentication failed:', error);
  authError.value = error;
  authResult.value = null;
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

.auth-result-container {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #4285f4;
}

.auth-result h2, .auth-error h2 {
  margin-top: 0;
  color: #333;
}

.result-details, .error-details {
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.token-display {
  background-color: #f1f3f4;
  padding: 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  overflow-wrap: break-word;
  margin-top: 0.5rem;
}

.auth-error {
  border-left: 4px solid #ea4335;
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
