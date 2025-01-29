export const defaultPipes = {
  uppercase: (value) => (value || '').toString().toUpperCase(),
  lowercase: (value)=> (value || '').toString().toLowerCase(),
  titleCase: titleCase,
  currency: (value, currencySymbol = 'USD', showSymbol = false) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    const formatted = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return showSymbol ? `${currencySymbol} ${formatted}` : formatted;
  },
  json: jsonFormatter
};


function titleCase(string){
  return string.toLowerCase()
  .split(' ')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');
}

function jsonFormatter(value, spacing = 4){
  try {
    const jsonString = JSON.stringify(value, null, spacing);
    return jsonString.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?\b)/g, (match) => {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  } catch (e) {
    console.log("catch error",value);
    return value;
  }
}