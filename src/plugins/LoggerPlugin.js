// src/plugins/LoggerPlugin.js
export function LoggerPlugin(prefix = '[Logger]') {
  /**
   * The plugin function returns another function, 
   * which receives the component instance at creation time.
   */
  return function initLogger(componentInstance) {
    // We can do initialization here if needed
    console.log(prefix, `Plugin attached to <${componentInstance.tagName.toLowerCase()}>`);

    // Return an object of optional lifecycle hooks
    return {
      // Called each time the element connects to the DOM
      onConnected(el) {
        console.log(prefix, `<${el.tagName.toLowerCase()}> connected to DOM`);
      },
      // Called before each render
      beforeRender(el) {
        console.log(prefix, `<${el.tagName.toLowerCase()}> about to render...`);
      },
      // Called after each render
      afterRender(el) {
        console.log(prefix, `<${el.tagName.toLowerCase()}> just re-rendered`);
      },
      // Called when the element is disconnected from the DOM
      onDisconnected(el) {
        console.log(prefix, `<${el.tagName.toLowerCase()}> disconnected`);
      },
    };
  };
}
