const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

// Extract the script content from index.html
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const scriptContent = scriptMatch[1];

// Create a mock DOM environment
const mockElements = {};
const sandbox = {
    document: {
        getElementById: (id) => {
            if (!mockElements[id]) {
                mockElements[id] = {
                    addEventListener: () => {},
                    value: '100', // Default value for sliders
                    checked: true,
                    textContent: '',
                    innerHTML: '',
                    querySelector: () => ({ innerHTML: '' }) // For svgContainer.querySelector('svg')
                };
            }
            return mockElements[id];
        },
        addEventListener: () => {},
        createElement: () => ({ href: '', download: '', click: () => {} }),
        body: { appendChild: () => {}, removeChild: () => {} }
    },
    window: {
        addEventListener: () => {}
    },
    console: console,
    Math: Math,
    parseInt: parseInt,
    XMLSerializer: class { serializeToString() { return ''; } },
    Blob: class {},
    URL: { createObjectURL: () => '', revokeObjectURL: () => '' }
};

// Create a VM context and evaluate the script
vm.createContext(sandbox);
vm.runInContext(scriptContent, sandbox);

const maxParams = {
    algorithm: 'Fractal Tree',
    treeType: 'Default',
    size: 200,
    branchiness: 10,
    shape: 100,
    irregularity: 100,
    trunkThickness: 100,
    leafSize: 100,
    leafiness: 100,
    showBackground: true,
    svgWidth: 800,
    svgHeight: 800
};

test('Recursion depth limits - Fractal Tree', () => {
    // Should not throw RangeError: Maximum call stack size exceeded
    const svg = sandbox.generateFractalTreeSVG(maxParams);
    assert.ok(svg.length > 0);
});

test('Recursion depth limits - Recursive Branching', () => {
    const svg = sandbox.generateRecursiveBranchingTreeSVG({ ...maxParams, algorithm: 'Recursive Branching' });
    assert.ok(svg.length > 0);
});

test('Recursion depth limits - L-system', () => {
    const svg = sandbox.generateLSystemTreeSVG({ ...maxParams, algorithm: 'L-system' });
    assert.ok(svg.length > 0);
});

test('Random branch angle variance', () => {
    // With irregularity, repeated calls with same params should produce different SVG
    const params = {
        algorithm: 'Recursive Branching',
        treeType: 'Default',
        size: 100,
        branchiness: 5,
        shape: 50,
        irregularity: 50,
        trunkThickness: 50,
        leafSize: 50,
        leafiness: 50,
        showBackground: true,
        svgWidth: 800,
        svgHeight: 800
    };

    const svg1 = sandbox.generateRecursiveBranchingTreeSVG(params);
    const svg2 = sandbox.generateRecursiveBranchingTreeSVG(params);

    assert.notStrictEqual(svg1, svg2, 'SVGs should be different due to random angle variance');
});

test('Branch thickness tapering', () => {
    const params = {
        algorithm: 'Recursive Branching',
        treeType: 'Default',
        size: 100,
        branchiness: 5,
        shape: 50,
        irregularity: 0,
        trunkThickness: 50,
        leafSize: 50,
        leafiness: 50,
        showBackground: true,
        svgWidth: 800,
        svgHeight: 800
    };

    const svg = sandbox.generateRecursiveBranchingTreeSVG(params);

    // Extract all stroke-width values from the SVG paths
    const strokeWidthRegex = /stroke-width="([^"]+)"/g;
    const strokeWidths = [];
    let match;
    while ((match = strokeWidthRegex.exec(svg)) !== null) {
        strokeWidths.push(parseFloat(match[1]));
    }

    // Verify we have multiple stroke widths
    assert.ok(strokeWidths.length > 0, 'Should have stroke-widths');

    const uniqueWidths = new Set(strokeWidths);
    assert.ok(uniqueWidths.size > 1, 'Should have multiple different stroke widths indicating tapering');

    const initialThickness = (params.svgHeight / 100) * (params.trunkThickness / 20);
    const minWidth = Math.min(...strokeWidths);

    assert.ok(minWidth < initialThickness, 'Branch thickness should taper to a value smaller than the initial trunk thickness');
});

test('SVG serialization structure', () => {
    // We already evaluated the script, and an event listener calls renderTree()
    // However, since we mock addEventListener, it might not run automatically.
    // Let's call renderTree directly using our mock sandbox.
    sandbox.renderTree();

    const svgContainer = sandbox.document.getElementById('svgContainer');
    const innerHTML = svgContainer.innerHTML;

    assert.ok(innerHTML.includes('<svg'), 'Should contain <svg> tag');
    assert.ok(innerHTML.includes('width="'), 'Should contain width attribute');
    assert.ok(innerHTML.includes('height="'), 'Should contain height attribute');
    assert.ok(innerHTML.includes('viewBox="'), 'Should contain viewBox attribute');
    assert.ok(innerHTML.includes('xmlns="http://www.w3.org/2000/svg"'), 'Should contain correct xmlns');
    assert.ok(innerHTML.includes('</svg>'), 'Should close </svg> tag');
});
