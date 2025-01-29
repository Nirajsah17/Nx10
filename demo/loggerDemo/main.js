// usageExample.js
import { createComponent } from '../../src/createComponent.js';
import { Logger } from '../../src/plugins/index.js';

createComponent({
  tagName: 'logger-button',
  
  initialState: {
    clicks: 0,
  },
  template: `
    <div>
      <button @click="incrementClick">Click me</button>
      <p>Clicked {{ clicks }} times</p>
    </div>
  `,
  style: `
    button { margin-right: 8px; }
    div { border: 1px solid #ccc; padding: 8px; display: inline-block; }
  `,
  methods: {
    incrementClick(e, el) {
      el.setState({ clicks: el.getState('clicks') + 1 });
    },
  },

  // IMPORTANT: Add our plugin(s) here
  plugins: [
    Logger('[MyLogger]'), // pass optional prefix
  ],
});
