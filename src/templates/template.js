// src/templateEngine.js

/**
 * A super basic templating function with optional conditionals and loops.
 * You can remove loops/conditionals if you don't need them.
 *
 * @param {string} templateStr 
 * @param {Object} data 
 * @returns {string}
 */
export function applyTemplate(templateStr, data = {}) {
  // Handle conditionals: {{#if key}} ... {{/if}}
  templateStr = templateStr.replace(
    /{{#if\s+([\w]+)}}([\s\S]*?){{\/if}}/g,
    (match, key, content) => {
      return data[key] ? content : '';
    }
  );

  // Handle loops: {{#each items}} ... {{/each}}
  templateStr = templateStr.replace(
    /{{#each\s+([\w]+)}}([\s\S]*?){{\/each}}/g,
    (match, key, content) => {
      const arr = data[key];
      if (!Array.isArray(arr)) return '';
      return arr.map(item => {
        // For simplicity, replace {{this}} with the item itself
        // If item is object, you'd need a more complex approach
        return content.replace(/{{\s*this\s*}}/g, item);
      }).join('');
    }
  );

  // Handle placeholders: {{ key }}
  templateStr = templateStr.replace(/{{\s*([\w]+)\s*}}/g, (match, key) => {
    return key in data ? data[key] : '';
  });

  return templateStr;
}
