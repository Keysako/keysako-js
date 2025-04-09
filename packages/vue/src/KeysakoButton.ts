import { h, defineComponent, ref, onMounted, onUnmounted, PropType } from 'vue';
import { KeysakoButton as CoreButton, AuthEvents, AuthResult, AuthError, ButtonTheme, ButtonShape } from '@keysako-identity/core';
import { KeysakoButtonProps } from './types';

/**
 * Vue component for Keysako Sign-in Button
 */
export const KeysakoButton = defineComponent({
  name: 'KeysakoButton',
  
  props: {
    clientId: {
      type: String,
      required: true
    },
    redirectUri: {
      type: String,
      default: undefined
    },
    theme: {
      type: String as PropType<ButtonTheme>,
      default: 'default'
    },
    shape: {
      type: String as PropType<ButtonShape>,
      default: 'rounded'
    },
    logoOnly: {
      type: Boolean,
      default: false
    },
    usePopup: {
      type: Boolean,
      default: false
    },
    age: {
      type: Number,
      default: undefined
    },
    locale: {
      type: String,
      default: undefined
    },
    class: {
      type: String,
      default: ''
    },
    style: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({})
    }
  },
  
  emits: ['success', 'error'],
  
  setup(props, { emit }) {
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
        theme: props.theme as ButtonTheme,
        shape: props.shape as ButtonShape,
        logoOnly: props.logoOnly,
        usePopup: props.usePopup,
        age: props.age,
        locale: props.locale,
        onSuccess: (result: AuthResult) => {
          emit('success', result);
        },
        onError: (error: AuthError) => {
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
    
    return () => h('div', {
      ref: buttonRef,
      class: props.class,
      style: props.style,
      'data-keysako-button': 'true'
    });
  }
});
