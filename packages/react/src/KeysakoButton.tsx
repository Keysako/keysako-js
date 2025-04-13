import { KeysakoButton as CoreButton, AuthEvents } from '@keysako-identity/core';
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

  // If used within KeysakoProvider, use the context values
  const finalClientId = clientId || '';
  const finalRedirectUri = redirectUri;
  const finalUsePopup = usePopup;

  useEffect(() => {
    if (!buttonRef.current) return;

    // Create style element for the button
    const styleElement = document.createElement('style');

    // Create button instance
    const button = new CoreButton({
      clientId: finalClientId,
      redirectUri: finalRedirectUri,
      theme,
      shape,
      logoOnly,
      usePopup: finalUsePopup,
      age,
      locale,
      onSuccess,
      onError,
    });

    // Add styles
    styleElement.textContent = button.getStyles();
    buttonRef.current.appendChild(styleElement);

    // Create and add button element
    const buttonElement = button.createButtonElement();
    buttonRef.current.appendChild(buttonElement);

    // Clean up
    return () => {
      if (buttonRef.current) {
        buttonRef.current.innerHTML = '';
      }
    };
  }, [finalClientId, finalRedirectUri, theme, shape, logoOnly, finalUsePopup, age, locale]);

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
