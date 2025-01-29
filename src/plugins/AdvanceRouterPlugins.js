/**
 * AdvancedRouterPlugin - handles dynamic routes ("/user/:id") 
 * and updates a special attribute (e.g., "active-route") on the component.
 *
 * @param {Array} routeDefs - an array of route definitions:
 *  [
 *    { pattern: "/users/:id", view: "UserView" },
 *    { pattern: "/about", view: "AboutView" },
 *    { pattern: "/", view: "HomeView" },
 *    { pattern: "*", view: "NotFound" }
 *  ]
 *
 * @param {boolean} [useHash=false] - if true, use hash-based routing (#/...)
 */
export function AdvancedRouterPlugin(routeDefs = [], useHash = false) {
  // 1. A helper to parse the route definitions and extract placeholders
  // e.g. "/users/:id" => { regex: /^\/users\/([^\/]+)$/, keys: ['id'] }
  console.log(routeDefs)
  const compiledRoutes = routeDefs.map((rd) => {
    const { pattern, view } = rd;
    console.log({pattern, view})
    if (pattern === '*') {
      return { regex: /.*/, keys: [], pattern, view };
    }

    // Convert the pattern into a regex 
    // (very naive approach for demo; not covering all edge cases).
    // e.g. /users/:id => /users/([^/]+)
    const keys = [];
    const regexPattern = pattern
      .replace(/\//g, '\\/') // escape slashes
      .replace(/:([^/]+)/g, (_, key) => {
        keys.push(key);
        return '([^\\/]+)';
      });
    const regex = new RegExp(`^${regexPattern}$`);
    return { regex, keys, pattern, view };
  });

  // This function attempts to match a path string to one of the compiled routes
  function matchRoute(path) {
    for (const route of compiledRoutes) {
      const match = route.regex.exec(path);
      if (match) {
        // Build a params object from captured groups
        const params = {};
        route.keys.forEach((key, index) => {
          params[key] = match[index + 1]; 
        });
        return { view: route.view, params };
      }
    }
    // If no route matched, fallback to null or your 404 route
    return null;
  }

  // The plugin init function:
  return function initAdvancedRouter(component) {
    // A function to handle route changes (either popstate or hashchange)
    function handleRouteChange() {
      // 1) Determine the current path
      let path;
      if (useHash) {
        const hash = window.location.hash.replace(/^#/, '');
        path = hash || '/'; // default to "/" if no hash
      } else {
        path = window.location.pathname || '/';
      }

      // 2) Attempt to match the path
      const matched = matchRoute(path);

      if (!matched) {
        // If truly unmatched, fallback to an explicit routeDef with pattern="*" or do a 404
        component.setState({
          currentPath: path,
          currentView: 'NotFound',
          routeParams: {},
        });
        // Also reflect path as an attribute
        component.setAttribute('active-route', path);
        return;
      }

      // matched => { view, params }
      const { view, params } = matched;

      // 3) Update state with matched route info
      component.setState({
        currentPath: path,
        currentView: view,
        routeParams: params,    // e.g. { id: "123" }
      });

      // 4) Also reflect the path as a special attribute on the element
      component.setAttribute('active-route', path);
    }

    // A convenience for programmatic navigation
    function navigateTo(newPath) {
      if (useHash) {
        window.location.hash = newPath;
      } else {
        history.pushState({}, '', newPath);
        // Fire popstate manually so handleRouteChange gets called
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }

    // Attach navigateTo onto the component so we can call el.navigateTo(...)
    component.navigateTo = navigateTo;

    return {
      onConnected(el) {
        // Listen for route changes
        if (useHash) {
          window.addEventListener('hashchange', handleRouteChange);
        } else {
          window.addEventListener('popstate', handleRouteChange);
        }
        // Do an initial route check
        handleRouteChange();
      },
      onDisconnected(el) {
        if (useHash) {
          window.removeEventListener('hashchange', handleRouteChange);
        } else {
          window.removeEventListener('popstate', handleRouteChange);
        }
      },
    };
  };
}
