import { App } from 'vue';
import { KeysakoButton } from './KeysakoButton';
import { createKeysako } from './createKeysako';

// Export components and composables
export { KeysakoButton };
export { createKeysako };
export * from './types';

// Vue plugin
export default {
  install: (app: App, options = {}) => {
    app.component('KeysakoButton', KeysakoButton);
  }
};
