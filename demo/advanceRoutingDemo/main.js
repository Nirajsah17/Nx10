// usageAdvancedRouterExample.js
import { NxComponent } from "../../src/index.js";
import { Router } from "../../src/plugins/index.js";

const routeDefs = [
  { pattern: '/', view: 'Home' },
  { pattern: '/about', view: 'About Page' },
  { pattern: '/users/:id', view: 'User Profile' },
  { pattern: '*', view: 'Not Found' },
];

NxComponent({
  tagName: 'app-router-demo',
  initialState: {
    currentPath: '/',
    currentView: 'Home',
    routeParams: {},
  },
  template: `
    <nav>
      <a href="#" @click="navHome">Home</a> |
      <a href="#" @click="navAbout">About</a> |
      <a href="#" @click="navUser">User 123</a>
    </nav>

    <div>
      <p>Path: {{ currentPath }}</p>
      <p>View: {{ currentView }}</p>
      <div>
        {{#if routeParams.id}}
          <p>User ID: {{ routeParams.id }}</p>
        {{/if}}
      </div>
    </div>
    <p>(Check 'active-route' attribute on the element in devtools!)</p>
  `,
  style: `
    nav a { cursor: pointer; color: #007acc; text-decoration: none; margin: 0 6px; }
    nav a:hover { text-decoration: underline; }
    p { margin: 6px 0; }
    div { margin: 6px 0; }
  `,
  methods: {
    navHome(e, el) {
      e.preventDefault();
      el.navigateTo('/');
    },
    navAbout(e, el) {
      e.preventDefault();
      el.navigateTo('/about');
    },
    navUser(e, el) {
      e.preventDefault();
      el.navigateTo('/users/123');
    },
  },
  plugins: [
    Router(routeDefs, false), // false => path-based (not hash)
  ],
});
