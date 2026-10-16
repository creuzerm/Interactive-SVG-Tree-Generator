const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const scriptContent = scriptMatch[1];

const sandbox = {
    document: {
        getElementById: () => ({
            addEventListener: () => {},
            value: '100',
            checked: true
        }),
        addEventListener: () => {}
    },
    window: {
        addEventListener: () => {}
    },
    console: console,
    Math: Math
};

vm.createContext(sandbox);
vm.runInContext(scriptContent, sandbox);

console.log(typeof sandbox.toRadians);
