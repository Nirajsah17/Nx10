// usageExample.js
import { NxComponent } from "../../src/index.js";
import { Router } from "../../src/plugins/index.js";

const routes = [
  { pattern: "/", view: "<button>Click me</button>" },
  { pattern: "/about", view: "About View" },
  { pattern: "/contact", view: "Contact View" },
  { pattern: "*", view: "404 - Not Found" },
];

// Create a <router-demo> custom element
NxComponent({
  tagName: "router-demo",
  initialState: {
    currentPath: "/",
    currentView: "Home View",
  },
  template: `
    <nav>
      <!-- We'll use the 'navigateTo' method from the plugin -->
      <a href="#" @click="goHome">Home</a> |
      <a href="#" @click="goAbout">About</a> |
      <a href="#" @click="goContact">Contact</a>
    </nav>
    <div>
      <p>Current Path: {{ currentPath }}</p>
      <p>View: {{ currentView }}</p>
    </div>
  `,
  style: `
    nav a { cursor: pointer; color: blue; text-decoration: underline; margin-right: 8px; }
    nav a:hover { color: red; }
  `,
  methods: {
    goHome(e, el) {
      e.preventDefault();
      el.navigateTo("/"); // from plugin
    },
    goAbout(e, el) {
      e.preventDefault();
      el.navigateTo("/about");
    },
    goContact(e, el) {
      e.preventDefault();
      el.navigateTo("/contact");
    },
  },
  plugins: [
    Router(routes, true), // false => path-based routing
  ],
});
