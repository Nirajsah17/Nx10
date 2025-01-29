// src/templateEngine.js

/**
 * A templating function supporting conditionals and loops with nested properties.
 *
 * @param {string} templateStr 
 * @param {Object} data 
 * @returns {string}
 */
export function applyTemplate(templateStr, data = {}) {
  /**
   * Helper function to get nested values using dot notation.
   * @param {Object} obj - The data object.
   * @param {string} path - The path string (e.g., "routeParams.id").
   * @returns {*} - The value at the specified path or undefined.
   */
  function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  // Handle conditionals: {{#if key}} ... {{/if}}
  templateStr = templateStr.replace(
    /{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g,
    (match, key, content) => {
      const condition = getNestedValue(data, key);
      return condition ? content : '';
    }
  );

  // Handle loops: {{#each items}} ... {{/each}}
  templateStr = templateStr.replace(
    /{{#each\s+([\w.]+)}}([\s\S]*?){{\/each}}/g,
    (match, key, content) => {
      const arr = getNestedValue(data, key);
      if (!Array.isArray(arr)) return '';
      
      return arr.map(item => {
        let itemContent = content;

        if (typeof item === 'object' && item !== null) {
          // Replace {{ this.property }} with item.property
          itemContent = itemContent.replace(/{{\s*this\.([\w.]+)\s*}}/g, (_, prop) => {
            const value = getNestedValue(item, prop);
            return value !== undefined ? value : '';
          });
        } else {
          // For primitive types, replace {{ this }} with the item itself
          itemContent = itemContent.replace(/{{\s*this\s*}}/g, item);
        }

        return itemContent;
      }).join('');
    }
  );

  // Handle placeholders: {{ key }}
  templateStr = templateStr.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
    const value = getNestedValue(data, key);
    return value !== undefined ? value : '';
  });

  return templateStr;
}
