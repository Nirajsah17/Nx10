// src/index.js
export { createComponent as NxComponent } from "./createComponent.js";

// Optionally export extra utilities
export { applyTemplate as html } from "./templateEngine.js";

// Or watchers, plugins, etc.

export { LoggerPlugin as logger } from "./plugins/LoggerPlugin.js";
