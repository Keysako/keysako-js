<template>
  <div 
    ref="buttonRef" 
    :class="props.class" 
    :style="props.style" 
    data-keysako-button="true"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue';
import { KeysakoButton as CoreButton, AuthEvents, AuthResult, AuthError } from '@keysako/core';
import { KeysakoButtonProps } from './types';

const props = defineProps<KeysakoButtonProps>();
const emit = defineEmits<{
  (e: 'success', result: AuthResult): void;
  (e: 'error', error: AuthError): void;
}>();

const buttonRef = ref<HTMLDivElement | null>(null);
let buttonInstance: CoreButton | null = null;

onMounted(() => {
  if (!buttonRef.value) return;

  // Create style element for the button
  const styleElement = document.createElement('style');
  
  // Create button instance
  buttonInstance = new CoreButton({
    clientId: props.clientId,
    redirectUri: props.redirectUri,
    theme: props.theme || 'default',
    shape: props.shape || 'rounded',
    logoOnly: props.logoOnly || false,
    usePopup: props.usePopup || false,
    age: props.age,
    locale: props.locale,
    onSuccess: (result) => {
      emit('success', result);
    },
    onError: (error) => {
      emit('error', error);
    }
  });

  // Add styles
  styleElement.textContent = buttonInstance.getStyles();
  buttonRef.value.appendChild(styleElement);

  // Create and add button element
  const buttonElement = buttonInstance.createButtonElement();
  buttonRef.value.appendChild(buttonElement);

  // Handle authentication events
  const handleAuthComplete = (event: CustomEvent) => {
    const result = event.detail;
    if (result.success) {
      emit('success', result);
    } else {
      emit('error', { error: result.error || 'Unknown error' });
    }
  };

  window.addEventListener(AuthEvents.AUTH_COMPLETE, handleAuthComplete as EventListener);

  // Clean up event listeners
  onUnmounted(() => {
    window.removeEventListener(AuthEvents.AUTH_COMPLETE, handleAuthComplete as EventListener);
    
    // Clean up button element
    if (buttonRef.value) {
      buttonRef.value.innerHTML = '';
    }
  });
});
</script>
