import { NxComponent } from '../../src/index.js';
import { Pipe } from '../../src/plugins/index.js';

export const pipes = {
  uppercase: (value) => (value || '').toString().toUpperCase(),
  currency: (value, currencySymbol = 'USD', showSymbol = false) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    const formatted = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return showSymbol ? `${currencySymbol} ${formatted}` : formatted;
  },
};

NxComponent({
  tagName: 'pipe-demo',
  initialState: {
    greeting: 'hello world',
    price: 1234.5,
    user: {
      name: 'John Doe',
      balance: 2500,
    },
  },
  template: `
    <div>
      <h3>{{ greeting | uppercase }}</h3>
      <p></p>
      <p>Price: {{ price | currency:'EUR':true }}</p>
      <p>User Name: {{ user.name | titleCase }}</p>
      <p>User Balance: {{ user.balance | currency:'USD' }}</p>
      {{user | json}}
      </div>
  `,
  style: `
    div {
      border: 1px solid #ccc;
      padding: 16px;
      display: inline-block;
      font-family: Arial, sans-serif;
    }
    h3 {
      color: #333;
    }
    p {
      font-size: 14px;
      margin: 4px 0;
    }
  `,
  plugins: [
    Pipe(pipes),
  ],
});