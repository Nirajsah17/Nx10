// src/createComponent.js
import { applyTemplate } from './templateEngine.js';

/**
 * createComponent - Define a custom element with minimal boilerplate
 * 
 * @param {Object} options - configuration for the component
 * @param {string} options.tagName - e.g. 'my-button'
 * @param {Object} [options.props={}] - define props to reflect as attributes, types, defaults
 * @param {Object} [options.initialState={}] - internal state
 * @param {string} [options.template=''] - HTML template with placeholders for props/state
 * @param {string} [options.style=''] - CSS for Shadow DOM or light DOM
 * @param {Function} [options.beforeRender]
 * @param {Function} [options.afterRender]
 * @param {Function} [options.onConnected]
 * @param {Function} [options.onDisconnected]
 * @param {boolean} [options.useShadow=true] - if true, attach Shadow DOM
 * @param {Object} [options.watch={}] - watchers { keyName: (newVal, oldVal) => {} }
 * @param {Array} [options.plugins=[]] - optional array of plugins, each is a function
 * @param {Object} [options.methods={}] - object with functions for @event bindings
 * @param {string} [options.bindingMode='onInput'] - 'onInput' or 'onBlur'
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
  methods = {},               // for declarative event methods
  bindingMode = 'onInput',    // NEW: controls how we handle data-model updates
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

      // 6) Binding mode
      this.bindingMode = bindingMode;

      // 7) Setup last known data
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
      // Update internal references or re-render
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
      beforeRender?.(this);
      this._plugins.forEach((p) => p.beforeRender?.(this));

      // Gather data from attributes (props) + internal state
      const dataForTemplate = { ...this._collectProps(), ...this._state };

      // Watchers
      for (const [key, watcherFn] of Object.entries(watch)) {
        const oldVal = this._prevData[key];
        const newVal = dataForTemplate[key];
        if (newVal !== oldVal) {
          watcherFn.call(this, newVal, oldVal);
        }
      }

      // Allow plugins to transform the template
      let transformedTemplate = template;
      this._plugins.forEach((p) => {
        if (typeof p.transformTemplate === 'function') {
          transformedTemplate = p.transformTemplate(transformedTemplate, dataForTemplate, this);
        }
      });

      // Apply template
      const finalHTML = `
        <style>${style}</style>
        ${applyTemplate(transformedTemplate, dataForTemplate)}
      `;
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = finalHTML;
      } else {
        this.innerHTML = finalHTML;
      }

      // Two-way data binding
      this._bindTwoWayData();

      // Declarative events
      this._bindTemplateEvents();

      afterRender?.(this);
      this._plugins.forEach((p) => p.afterRender?.(this));

      // Update previous data for watchers
      this._updatePrevData();
    }

    /**
     * Binds <input data-model="someKey"> for two-way data
     */
    _bindTwoWayData() {
      const root = this.shadowRoot ?? this;
      const bindableElems = root.querySelectorAll('[data-model]');

      bindableElems.forEach(elem => {
        const key = elem.getAttribute('data-model');

        // Initialize input value from state
        if (this._state[key] !== undefined) {
          elem.value = this._state[key];
        }

        if (this.bindingMode === 'onBlur') {
          // 1) Update internal state as user types (NO re-render)
          elem.addEventListener('input', (e) => {
            this._state[key] = e.target.value;
          });
          // 2) Actually re-render on blur
          elem.addEventListener('blur', (e) => {
            this.setState({ [key]: e.target.value });
          });
        } else {
          // Default: 'onInput' => re-render on every keystroke
          elem.addEventListener('input', (e) => {
            const val = e.target.value;
            this.setState({ [key]: val });
          });
        }
      });
    }

    /**
     * Finds @event="methodName" attributes in the DOM
     * and attaches event listeners calling methods[methodName].
     */
    _bindTemplateEvents() {
      const root = this.shadowRoot ?? this;
      const allElements = root.querySelectorAll('*');
      allElements.forEach(el => {
        el.getAttributeNames().forEach(attrName => {
          if (attrName.startsWith('@')) {
            const eventType = attrName.slice(1);
            const methodName = el.getAttribute(attrName);
            const handlerFn = this.methods[methodName];
            if (typeof handlerFn === 'function') {
              el.addEventListener(eventType, (evt) => {
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
        const attrVal = this.getAttribute(propName);
        if (attrVal === null) {
          if (def.type === 'boolean') {
            result[propName] = false;
          } else {
            result[propName] = undefined;
          }
        } else {
          if (def.type === 'number') {
            result[propName] = Number(attrVal);
          } else if (def.type === 'boolean') {
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
