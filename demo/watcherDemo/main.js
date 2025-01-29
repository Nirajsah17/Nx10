import { NxComponent } from '../../src/index.js';

NxComponent({
  tagName: 'counter-component',
  initialState: {
    count: 0,
    status: 'Idle',
  },
  template: `
    <div>
      <h2>Counter: {{ count }}</h2>
      <p>Status: {{ status }}</p>
      <button @click="increment">Increment</button>
      <button @click="decrement">Decrement</button>
    </div>
  `,
  style: `
    div {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 20px;
      border: 2px solid #00796b;
      border-radius: 8px;
      width: 200px;
      margin: 50px auto;
      background-color: #e0f2f1;
    }
    h2 {
      color: #004d40;
    }
    p {
      color: #00695c;
    }
    button {
      padding: 10px 15px;
      margin: 5px;
      font-size: 14px;
      cursor: pointer;
      border: none;
      border-radius: 4px;
      background-color: #00796b;
      color: white;
    }
    button:hover {
      background-color: #004d40;
    }
  `,
  methods: {
    increment() {
      const currentCount = this.getState('count');
      // console.log(`Incrementing count from ${currentCount} to ${currentCount + 1}`);
      this.setState({ count: currentCount + 1 });
    },
    decrement() {
      const currentCount = this.getState('count');
      // console.log(`Decrementing count from ${currentCount} to ${currentCount - 1}`);
      this.setState({ count: currentCount - 1 });
    },
  },
  watch: {
    // Watcher for the 'count' property
    count(newVal, oldVal) {
      console.log("hello")
      // Prevent unnecessary state updates
      if (newVal > oldVal && this.getState('status') !== 'Incremented') {
        console.log(`Updating status to 'Incremented'`);
        this.setState({ status: 'Incremented' });
      } else if (newVal < oldVal && this.getState('status') !== 'Decremented') {
        console.log(`Updating status to 'Decremented'`);
        this.setState({ status: 'Decremented' });
      } else if (newVal === oldVal && this.getState('status') !== 'No Change') {
        console.log(`Updating status to 'No Change'`);
        this.setState({ status: 'No Change' });
      }
    },
  },
});
