import { createComponent } from '../src/index.js';

createComponent({
  tagName: 'todo-list',
  initialState: {
    items: [],
    newItem: '',
  },
  template: `
    <div>
      <h3>My Todo List</h3>
      <ul>
        {{#each items}}
          <li>{{this}}</li>
        {{/each}}
      </ul>
      <input data-model="newItem" placeholder="Add item..." />
      <button @click="addItem">Add</button>
    </div>
  `,
  style: `
    div { border: 1px solid #ccc; padding: 8px; margin: 8px; }
    ul { padding-left: 16px; }
  `,
  methods: {
    addItem(e, el) {
      // We can read the latest typed text from state right away:
      const typedVal = el.getState('newItem').trim();
      if (typedVal) {
        const oldItems = el.getState('items') || [];
        el.setState({
          items: [...oldItems, typedVal],
          newItem: '',
        });
      }
    },
  },
  // The magic: 'onBlur' means we do not re-render on every keystroke,
  // but the state is still kept up to date for button clicks.
  bindingMode: 'onBlur',
});

// Then in your HTML or script:
document.body.innerHTML = `<todo-list></todo-list>`;
