// src/plugins/PipePlugin.js

import { defaultPipes } from "./PipePlugin.default.js";

/**
 * PipePlugin - Adds support for Angular-like pipes in your template strings.
 *
 * @param {Object} additionalPipes - A map of pipeName -> function(value, ...args)
 *   Example:
 *   {
 *     uppercase: (value) => (value || '').toString().toUpperCase(),
 *     currency: (value, currencySymbol='USD', showSymbol=false) => { ... },
 *     ...
 *   }
 */
export function PipePlugin(additionalPipes = {}) {
  // Correctly merge defaultPipes with additionalPipes
  const pipes = { ...defaultPipes, ...additionalPipes };

  return function initPipePlugin(component) {
    /**
     * transformTemplate - Processes pipe syntax in the template.
     *
     * @param {string} templateStr - The original template string.
     * @param {Object} data - The data object used for rendering.
     * @param {HTMLElement} componentInstance - The component instance.
     * @returns {string} - The transformed template string with pipes processed.
     */
    function transformTemplate(templateStr, data, componentInstance) {
      // Regex to find {{ variable | pipeName:arg1:arg2 }}
      const pipeRegex = /{{\s*([^{}\s|]+)\s*\|\s*([^\s:]+)(:[^}]+)?\s*}}/g;

      // Replace each pipe expression with the transformed value
      const transformedTemplate = templateStr.replace(pipeRegex, (match, variable, pipeName, args) => {
        // Get the value of the variable from data
        const value = getValueFromData(variable, data);

        // Get the pipe function
        const pipeFn = pipes[pipeName];
        if (typeof pipeFn !== 'function') {
          console.warn(`[PipePlugin] Pipe "${pipeName}" is not defined.`);
          return value; // Fallback to the original value
        }

        // Parse arguments, if any
        let pipeArgs = [];
        if (args) {
          // Remove leading ':' and split by ':'
          pipeArgs = args.slice(1).split(':').map(arg => {
            // Remove quotes if present
            return arg.replace(/^['"]|['"]$/g, '');
          });
        }

        // Apply the pipe function
        try {
          const transformedValue = pipeFn(value, ...pipeArgs);
          return transformedValue;
        } catch (error) {
          console.error(`[PipePlugin] Error applying pipe "${pipeName}" on "${variable}":`, error);
          return value; // Fallback to original value on error
        }
      });

      return transformedTemplate;
    }

    /**
     * Helper function to get nested values using dot-notation (e.g., 'user.name')
     *
     * @param {string} expr - The expression, possibly with dots.
     * @param {Object} dataObj - The data object.
     * @returns {*} - The value retrieved from dataObj.
     */
    function getValueFromData(expr, dataObj) {
      if (expr.includes('.')) {
        return expr.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), dataObj) ?? '';
      }
      return dataObj[expr] ?? '';
    }

    // Return the lifecycle hooks that the plugin implements
    return {
      transformTemplate,
    };
  };
}
