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
            if (id === 'seedInput') mockElements[id].value = '12345';
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

test('Color gradient interpolation', () => {
    const algorithms = [
        { name: 'Fractal Tree', func: sandbox.generateFractalTreeSVG },
        { name: 'Recursive Branching', func: sandbox.generateRecursiveBranchingTreeSVG },
        { name: 'L-system', func: sandbox.generateLSystemTreeSVG }
    ];

    for (const algo of algorithms) {
        const svg = algo.func({ ...maxParams, algorithm: algo.name });

        // Extract all stroke values from the SVG paths
        const strokeRegex = /stroke="([^"]+)"/g;
        const strokes = [];
        let match;
        while ((match = strokeRegex.exec(svg)) !== null) {
            if (match[1] !== 'brown') {
                strokes.push(match[1].toLowerCase());
            }
        }

        // Verify we have multiple stroke colors
        assert.ok(strokes.length > 0, `[${algo.name}] Should have stroke colors`);
        const uniqueStrokes = new Set(strokes);
        assert.ok(uniqueStrokes.size > 1, `[${algo.name}] Should have multiple different stroke colors indicating interpolation`);

        // Verify trunk base color
        assert.ok(strokes.includes('#8b4513'), `[${algo.name}] Should include trunk base color (#8B4513)`);

        // Verify canopy tip color
        assert.ok(strokes.includes('#228b22'), `[${algo.name}] Should include canopy tip color (#228B22)`);
    }
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

test('Color gradient interpolation - unit test', () => {
    const c1 = '#8B4513';
    const c2 = '#228B22';

    assert.strictEqual(sandbox.interpolateColor(c1, c2, 0).toLowerCase(), c1.toLowerCase(), 'Factor 0 should return start color');
    assert.strictEqual(sandbox.interpolateColor(c1, c2, 1).toLowerCase(), c2.toLowerCase(), 'Factor 1 should return end color');

    const midColor = sandbox.interpolateColor(c1, c2, 0.5).toLowerCase();
    assert.ok(midColor !== c1.toLowerCase() && midColor !== c2.toLowerCase(), 'Factor 0.5 should return an intermediate color');
});

test('Color gradient interpolation - precise hex values', () => {
    const c1 = '#8B4513';
    const c2 = '#228B22';

    assert.strictEqual(sandbox.interpolateColor(c1, c2, 0.25).toUpperCase(), '#715717', 'Factor 0.25 interpolation');
    assert.strictEqual(sandbox.interpolateColor(c1, c2, 0.5).toUpperCase(), '#57681B', 'Factor 0.5 interpolation');
    assert.strictEqual(sandbox.interpolateColor(c1, c2, 0.75).toUpperCase(), '#3D7A1F', 'Factor 0.75 interpolation');
});

test('Seeded pseudorandom number generation', () => {
    sandbox.seedPRNG(123);
    const val1 = sandbox.random();
    const val2 = sandbox.random();

    sandbox.seedPRNG(123);
    const val3 = sandbox.random();
    const val4 = sandbox.random();

    assert.strictEqual(val1, val3, 'Random sequence should match with the same seed');
    assert.strictEqual(val2, val4, 'Random sequence should match with the same seed');

    const algorithms = [
        { name: 'Fractal Tree', func: sandbox.generateFractalTreeSVG },
        { name: 'Recursive Branching', func: sandbox.generateRecursiveBranchingTreeSVG },
        { name: 'L-system', func: sandbox.generateLSystemTreeSVG }
    ];

    for (const algo of algorithms) {
        sandbox.seedPRNG(123);
        const svg1 = algo.func({ ...maxParams, algorithm: algo.name });

        sandbox.seedPRNG(123);
        const svg2 = algo.func({ ...maxParams, algorithm: algo.name });

        assert.strictEqual(svg1, svg2, `[${algo.name}] SVGs should be strictly equal when generated with the same seed`);

        sandbox.seedPRNG(456);
        const svg3 = algo.func({ ...maxParams, algorithm: algo.name });

        assert.notStrictEqual(svg1, svg3, `[${algo.name}] SVGs should be different when generated with different seeds`);
    }
});

test('Seeded pseudorandom number generation - deterministic byte equality', () => {
    const algorithms = [
        { name: 'Fractal Tree', func: sandbox.generateFractalTreeSVG },
        { name: 'Recursive Branching', func: sandbox.generateRecursiveBranchingTreeSVG },
        { name: 'L-system', func: sandbox.generateLSystemTreeSVG }
    ];

    for (const algo of algorithms) {
        sandbox.seedPRNG(999);
        const svg1 = algo.func({ ...maxParams, algorithm: algo.name });

        sandbox.seedPRNG(999);
        const svg2 = algo.func({ ...maxParams, algorithm: algo.name });

        const buf1 = Buffer.from(svg1);
        const buf2 = Buffer.from(svg2);

        assert.ok(buf1.equals(buf2), `[${algo.name}] SVGs should be byte-for-byte identical with the same seed`);
    }
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

test('Schema.org JSON-LD metadata', () => {
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(jsonLdMatch, 'Should find JSON-LD script tag');

    assert.doesNotThrow(() => {
        JSON.parse(jsonLdMatch[1]);
    }, 'JSON-LD structured data should be valid JSON');

    const metadata = JSON.parse(jsonLdMatch[1]);
    assert.strictEqual(metadata['@context'], 'https://schema.org', 'Context should be https://schema.org');
    assert.strictEqual(metadata['@type'], 'WebApplication', 'Type should be WebApplication');
});
