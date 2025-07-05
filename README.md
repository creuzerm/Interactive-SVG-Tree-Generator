# Interactive SVG Tree Generator

This tool is a single-page web application designed for procedurally generating diverse tree images using various algorithms and rendering them as Scalable Vector Graphics (SVG). Users can dynamically adjust numerous parameters to customize the appearance of the trees and download the final output as an SVG file.

---

## Algorithms Used

The generator employs three distinct procedural algorithms, each offering unique characteristics for tree generation:

1.  **L-systems (Lindenmayer Systems):**
    * **Principle:** A formal grammar-based system that uses an axiom (starting string) and production rules to iteratively expand a string. This string is then interpreted by "turtle graphics" (move, turn, push/pop state) to draw the tree.
    * **Characteristics:** Excellent for generating fractal-like, biologically plausible patterns. Rules can be complex but yield highly structured results.
    * **Implementation Note:** Branches are drawn using **quadratic Bezier curves** for organic smoothing.

2.  **Fractal Trees:**
    * **Principle:** Based on recursive self-similarity. A main branch splits into smaller, similar sub-branches, with properties like length and angle often scaling down with each recursion level.
    * **Characteristics:** Simple to implement and produces aesthetically pleasing, naturally self-similar tree structures.
    * **Implementation Note:** Branches are drawn using **quadratic Bezier curves**, and randomness is introduced to angles and lengths for a more natural look.

3.  **Recursive Branching:**
    * **Principle:** A more generalized recursive approach where a function draws a segment and then recursively calls itself to draw multiple sub-branches from the endpoint, often with significant random variations.
    * **Characteristics:** Offers high flexibility and is excellent for generating a wide variety of organic, asymmetrical tree shapes.
    * **Implementation Note:** Branches are drawn using **quadratic Bezier curves**, with extensive use of randomness for branch count, angles, and lengths.

---

## Features

The tool provides a comprehensive set of controls to customize tree generation:

* **Algorithm Selection:** A dropdown to choose between "L-system", "Fractal Tree", and "Recursive Branching".
* **Tree Type:** A dropdown offering presets like "Default", "Evergreen", "Deciduous", "Leafy", "Branchy", and "Weeping". These types influence the underlying algorithm's parameters (e.g., branch angles, leaf density, length reduction) to achieve a characteristic look.
* **Size:** A slider controlling the overall scale of the tree relative to the canvas height.
* **Branchiness:** A slider influencing the density and complexity of the branching structure (e.g., recursion depth or L-system iterations).
* **Shape (Columnar to Circular):** A slider that adjusts the tree's overall spread, from narrow and upright (columnar) to wide and sprawling (circular). This is achieved by modifying branch angles.
* **Irregularity:** A slider that introduces randomness to branch lengths, angles, and curvature, making the tree look more natural and less perfectly symmetrical. This also controls the intensity of the Bezier curve smoothing.
* **Trunk Thickness:** A slider to control the initial thickness of the tree's main trunk, scaled proportionally to the canvas height.
* **Leaf Size:** A slider to adjust the radius of individual leaf elements.
* **Leafiness:** A slider to control the density and presence of leaves on the tree, affecting the threshold length at which leaves appear on branches.
* **Canvas Width (inches) & Canvas Height (inches):** Sliders to explicitly define the dimensions of the SVG output area in inches. The tree generation logic dynamically scales the tree to fit within these user-defined dimensions, ensuring it always remains visible on the canvas.
* **Show Background (Sky & Ground):** A checkbox to toggle the visibility of the blue sky and brown ground rectangles in the SVG output.
* **Download SVG:** A button to download the currently displayed tree as a `.svg` file.

---

## AI Editor Reference for Future Updates

To maintain consistency and intent for future updates, please consider the following:

* **Core Intent:** The primary goal of this project is to provide a highly interactive, client-side tool for **procedural SVG tree generation**.
* **Technical Constraints:**
    * **Single HTML File:** All code (HTML, CSS, JavaScript) must remain within a single `.html` file.
    * **Inline JavaScript:** All JavaScript should be embedded directly within `<script>` tags. No external `.js` files.
    * **Tailwind CSS:** All styling should primarily use Tailwind CSS classes, loaded via CDN.
    * **No Browser Alerts:** Avoid `alert()`, `confirm()`, `prompt()`.
* **Tree Fitting Logic:** The tree's `initialLength` and `trunkThickness` are **dynamically scaled based on the `svgHeight` and `svgWidth` (derived from the Canvas Width/Height sliders)**. This is crucial for ensuring the tree always fits the user-defined canvas dimensions. When adjusting tree size or thickness, ensure these calculations remain proportional to the canvas.
* **Organic Smoothing:** The use of **Quadratic Bezier Curves (`Q` command in SVG paths)** is fundamental to the organic appearance of the branches. The `Irregularity` slider directly influences the curvature of these Bezier segments. Maintain this approach for branch rendering.
* **Parameter Mapping:** The "Tree Type" dropdown modifies the base parameters of the selected algorithm. When adding new tree types or modifying existing ones, ensure these mappings are logical and produce the intended visual characteristics (e.g., "Evergreen" should still result in a more conical shape, "Weeping" in downward-curving branches).
* **Leaf Generation:** Leaves are currently simple circles. If more complex leaf shapes are desired, they should also be generated as SVG elements (e.g., polygons, or more complex paths). The `Leaf Size` and `Leafiness` sliders should continue to control their respective properties effectively.
* **Responsiveness:** The UI layout is designed to be responsive using Tailwind's utility classes. Any new UI elements should adhere to this responsive design principle.
* **SVG Download:** The download functionality relies on `XMLSerializer` and `URL.createObjectURL`. Ensure this mechanism remains functional for SVG export.

