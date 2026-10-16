const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

// Extract the script contents from index.html
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    throw new Error('Could not find script tag in index.html');
}
const scriptContent = scriptMatch[1];

// Create a sandbox environment to evaluate the code
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

// Evaluate the script inside the sandbox
vm.createContext(sandbox);
vm.runInContext(scriptContent, sandbox);

// Retrieve functions to test
const toRadians = sandbox.toRadians;
const calculateEndpoint = sandbox.calculateEndpoint;
const clampDepth = sandbox.clampDepth;
const clampWindSway = sandbox.clampWindSway;
const calculateTrunkTaper = sandbox.calculateTrunkTaper;

test('Procedural tree generation geometry utilities', async (t) => {

    await t.test('calculateEndpoint returns accurate polar to cartesian projection', () => {
        const result1 = calculateEndpoint(0, 0, 10, 0); // 0 degrees is facing right (along positive X)
        assert.ok(Math.abs(result1.x - 10) < 0.0001, 'X should be roughly 10');
        assert.ok(Math.abs(result1.y - 0) < 0.0001, 'Y should be roughly 0');

        const result2 = calculateEndpoint(0, 0, 10, 90); // 90 degrees is facing down (along positive Y in SVG space)
        assert.ok(Math.abs(result2.x - 0) < 0.0001, 'X should be roughly 0');
        assert.ok(Math.abs(result2.y - 10) < 0.0001, 'Y should be roughly 10');

        const result3 = calculateEndpoint(5, 5, 20, 180);
        assert.ok(Math.abs(result3.x - (-15)) < 0.0001, 'X should be roughly -15');
        assert.ok(Math.abs(result3.y - 5) < 0.0001, 'Y should be roughly 5');
    });

    await t.test('clampDepth correctly limits the depth', () => {
        assert.strictEqual(clampDepth(5, 12), 5);
        assert.strictEqual(clampDepth(12, 12), 12);
        assert.strictEqual(clampDepth(15, 12), 12);

        // Test default
        assert.strictEqual(clampDepth(13), 12);
    });

    await t.test('clampWindSway restricts angle boundaries', () => {
        assert.strictEqual(clampWindSway(45, -30, 30), 30);
        assert.strictEqual(clampWindSway(-45, -30, 30), -30);
        assert.strictEqual(clampWindSway(10, -30, 30), 10);
    });

    await t.test('calculateTrunkTaper mathematically calculates taper ratio correctly', () => {
        assert.strictEqual(calculateTrunkTaper(10, 0.8), 8);
        assert.strictEqual(calculateTrunkTaper(5, 0.6), 3);
        assert.strictEqual(calculateTrunkTaper(20, 1), 20);
    });
});
