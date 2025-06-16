import { KeysakoButton as CoreButton, AuthEvents } from '@keysako/core';
import React, { useEffect, useRef } from 'react';

import { KeysakoButtonProps } from './types';

/**
 * React component for Keysako Sign-in Button
 * @param props KeysakoButtonProps
 * @returns React component
 */
export const KeysakoButton: React.FC<KeysakoButtonProps> = ({
  clientId,
  redirectUri,
  theme = 'default',
  shape = 'rounded',
  logoOnly = false,
  usePopup = false,
  age,
  locale,
  className,
  style,
  onSuccess,
  onError,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const initButton = async () => {
      if (!buttonRef.current || isInitializedRef.current) return;

      try {
        // Clear existing content first
        buttonRef.current.innerHTML = '';

        // Mark as initialized before starting to prevent double initialization
        isInitializedRef.current = true;

        // Create style element for the button
        const styleElement = document.createElement('style');

        // Create button instance
        const button = new CoreButton({
          clientId,
          redirectUri,
          theme,
          shape,
          logoOnly,
          usePopup,
          age,
          locale,
          onSuccess,
          onError,
        });

        // Add styles
        styleElement.textContent = button.getStyles();
        buttonRef.current.appendChild(styleElement);

        // Create and add button element
        const buttonElement = await button.createButtonElement();
        buttonRef.current.appendChild(buttonElement);
      } catch (error) {
        console.error('Error initializing Keysako button:', error);
        // Reset flag on error
        isInitializedRef.current = false;
        if (onError) {
          onError({ error: 'Failed to initialize button' });
        }
      }
    };

    initButton();

    // Clean up
    return () => {
      if (buttonRef.current) {
        buttonRef.current.innerHTML = '';
      }
      // Reset initialization flag on cleanup
      isInitializedRef.current = false;
    };
  }, [clientId, redirectUri, theme, shape, logoOnly, usePopup, age, locale, onSuccess, onError]);

  // Handle authentication events
  useEffect(() => {
    const handleAuthComplete = (event: CustomEvent) => {
      const result = event.detail;
      if (result.success && onSuccess) {
        onSuccess(result);
      } else if (!result.success && onError) {
        onError({ error: result.error || 'Unknown error' });
      }
    };

    window.addEventListener(AuthEvents.AUTH_COMPLETE, handleAuthComplete as EventListener);

    return () => {
      window.removeEventListener(AuthEvents.AUTH_COMPLETE, handleAuthComplete as EventListener);
    };
  }, [onSuccess, onError]);

  return <div ref={buttonRef} className={className} style={style} data-keysako-button="true" />;
};
