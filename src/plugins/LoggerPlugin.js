// src/plugins/LoggerPlugin.js
export function LoggerPlugin() {
  return function setup(instance) {
    console.log(`Plugin attached to <${instance.tagName.toLowerCase()}>`);
    return {
      afterRender(el) {
        console.log('<'+el.tagName.toLowerCase()+'> rendered with data:', {
          ...el._collectProps(),
          ...el._state
        });
      }
    };
  };
}
