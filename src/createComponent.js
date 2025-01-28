// src/createComponent.js
import { applyTemplate } from './templateEngine.js';

/**
 * createComponent - Define a custom element with minimal boilerplate
 * 
 * @param {Object} options - configuration for the component
 * @param {string} options.tagName - e.g. 'my-button'
 * @param {Object} options.props - define props to reflect as attributes, types, defaults
 * @param {Object} options.initialState - internal state
 * @param {string} options.template - HTML template with placeholders for props/state
 * @param {string} options.style - CSS for Shadow DOM or light DOM
 * @param {Function} options.beforeRender - lifecycle hook
 * @param {Function} options.afterRender - lifecycle hook
 * @param {Function} options.onConnected - lifecycle hook
 * @param {Function} options.onDisconnected - lifecycle hook
 * @param {boolean} options.useShadow - if true, attach Shadow DOM
 * @param {Object} options.watch - watchers { keyName: (newVal, oldVal) => {} }
 * @param {Array} options.plugins - optional array of plugins, each is a function
 * @param {Object} options.methods - object with functions for @event bindings
 */
export function createComponent({
  tagName,
  props = {},
  initialState = {},
  template = '',
  style = '',
  beforeRender,
  afterRender,
  onConnected,
  onDisconnected,
  useShadow = true,
  watch = {},
  plugins = [],
  methods = {},             // <-- NEW: for @click, @input, etc.
}) {
  // Generate observedAttributes from props that want reflection
  const observedAttributes = Object.entries(props)
    .filter(([_, def]) => def.reflect)
    .map(([name]) => name);

  class GeneratedElement extends HTMLElement {
    static get observedAttributes() {
      return observedAttributes;
    }

    constructor() {
      super();

      // 1) Attach Shadow DOM if desired
      if (useShadow) {
        this.attachShadow({ mode: 'open' });
      }

      // 2) Internal state
      this._state = { ...initialState };
      this._prevData = {}; // Keep old data for watchers

      // 3) Ensure default props (attributes) if not present
      for (const [propName, def] of Object.entries(props)) {
        if (def.default !== undefined && !this.hasAttribute(propName)) {
          // set default as an attribute
          if (typeof def.default === 'boolean') {
            if (def.default) this.setAttribute(propName, '');
          } else {
            this.setAttribute(propName, def.default);
          }
        }
      }

      // 4) Initialize plugins
      // Each plugin can return an object with optional lifecycle hooks
      this._plugins = plugins.map(pluginFn => pluginFn(this) || {});

      // 5) Methods for @event directives
      this.methods = methods;

      // 6) Setup last known data
      this._updatePrevData();
    }

    // LIFECYCLE
    connectedCallback() {
      this._render();
      onConnected?.(this);
      this._plugins.forEach((p) => p.onConnected?.(this));
    }

    disconnectedCallback() {
      onDisconnected?.(this);
      this._plugins.forEach((p) => p.onDisconnected?.(this));
    }

    attributeChangedCallback(name, oldVal, newVal) {
      // Update or re-render if attributes that reflect changed
      this._render();
    }

    // STATE
    getState(key) {
      return key ? this._state[key] : this._state;
    }

    setState(newState) {
      this._state = { ...this._state, ...newState };
      this._render();
    }

    // MAIN RENDER
    _render() {
      // 1) Save the currently focused element and cursor position
      const activeEl = document.activeElement;
      let selectionStart, selectionEnd, wasInput = false;

      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        wasInput = true;
        selectionStart = activeEl.selectionStart;
        selectionEnd = activeEl.selectionEnd;
      }

      // 2) Proceed with your normal re-render logic
      const dataForTemplate = { ...this._collectProps(), ...this._state };
      const finalHTML = `
        <style>${style}</style>
        ${applyTemplate(template, dataForTemplate)}
      `;
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = finalHTML;
      } else {
        this.innerHTML = finalHTML;
      }

      // 3) Re-bind your two-way data, events, watchers, etc.
      this._bindTwoWayData();
      this._bindTemplateEvents();

      // 4) Restore focus/cursor if the same kind of element still exists
      if (wasInput) {
        // Find the new input that replaced the old one
        // e.g., an input with data-model="username" if that's what user typed in
        const root = this.shadowRoot ?? this;
        const newInput = root.querySelector(`[data-model="username"]`);
        if (newInput) {
          newInput.focus();
          // Restore the cursor selection
          newInput.setSelectionRange(selectionStart, selectionEnd);
        }
      }
    }

    /**
     * Binds <input data-model="stateKey"> for two-way data
     */
    _bindTwoWayData() {
      const root = this.shadowRoot ?? this;
      const bindableElems = root.querySelectorAll('[data-model]');
      bindableElems.forEach(elem => {
        const key = elem.getAttribute('data-model');
        if (this._state[key] !== undefined) {
          elem.value = this._state[key];
        }
        // Instead of 'input' event, do 'blur'
        elem.addEventListener('blur', (e) => {
          const val = e.target.value;
          this.setState({ [key]: val });
          // Now re-render once the user leaves the input
        });
      });
    }


    /**
     * Finds attributes like @click="someMethod" or @input="someMethod"
     * and attaches event listeners that call methods[someMethod].
     */
    _bindTemplateEvents() {
      const root = this.shadowRoot ?? this;
      const allElements = root.querySelectorAll('*');

      allElements.forEach(el => {
        const attrNames = el.getAttributeNames();
        attrNames.forEach(attrName => {
          if (attrName.startsWith('@')) {
            const eventType = attrName.slice(1); // e.g. "click"
            const methodName = el.getAttribute(attrName); // e.g. "incrementCount"

            const handlerFn = this.methods[methodName];
            if (typeof handlerFn === 'function') {
              el.addEventListener(eventType, evt => {
                // Call the method in the context of the component
                handlerFn.call(this, evt, this);
              });
            } else {
              console.warn(
                `Method "${methodName}" not found in "methods" for <${this.tagName.toLowerCase()}>.`
              );
            }
          }
        });
      });
    }

    /**
     * Collect current prop values from attributes
     */
    _collectProps() {
      const result = {};
      for (const [propName, def] of Object.entries(props)) {
        // read from attribute
        const attrVal = this.getAttribute(propName);
        if (attrVal === null) {
          // boolean might be false if attribute not set
          if (def.type === 'boolean') {
            result[propName] = false;
          } else {
            result[propName] = undefined;
          }
        } else {
          // type conversion
          if (def.type === 'number') {
            result[propName] = Number(attrVal);
          } else if (def.type === 'boolean') {
            // boolean attribute => present means true, unless explicitly "false"
            result[propName] = (attrVal !== 'false');
          } else {
            result[propName] = attrVal;
          }
        }
      }
      return result;
    }

    _updatePrevData() {
      this._prevData = { ...this._collectProps(), ...this._state };
    }
  }

  // Dynamically define property getters/setters for each prop
  Object.entries(props).forEach(([propName, def]) => {
    Object.defineProperty(GeneratedElement.prototype, propName, {
      get() {
        const val = this.getAttribute(propName);
        if (def.type === 'number') return Number(val);
        if (def.type === 'boolean') return val !== null && val !== 'false';
        return val;
      },
      set(newVal) {
        if (def.reflect) {
          // reflect to attribute
          if (def.type === 'boolean') {
            if (newVal) this.setAttribute(propName, '');
            else this.removeAttribute(propName);
          } else {
            this.setAttribute(propName, newVal);
          }
        }
      }
    });
  });

  // Finally define the custom element if not already defined
  if (!customElements.get(tagName)) {
    customElements.define(tagName, GeneratedElement);
  }
}
