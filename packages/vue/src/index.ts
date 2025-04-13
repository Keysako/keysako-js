import { App } from 'vue';

import { createKeysako } from './createKeysako';
import { KeysakoButton } from './KeysakoButton';

// Export components and composables
export { KeysakoButton };
export { createKeysako };
export * from './types';

// Vue plugin
export default {
  install: (app: App, _ = {}) => {
    app.component('KeysakoButton', KeysakoButton);
  },
};
