# Office Connect V2 — RPG Studio
Open index.html directly or serve this directory with `python -m http.server 8000`. For GitHub Pages upload the contents to the repository root; enable Pages on main / root. No build or dependencies.

The initial 10 x 20 layout is the supplied office-floor-plan-10x20.json, copied unchanged to layout.json and embedded in layout.js for offline use. Existing V1 browser data is not overwritten; V2 has a separate local storage key. Load office layout restores the supplied plan. Export before resetting. Desk IDs and rotations are preserved. Wall sprites infer horizontal/vertical orientation from neighbors; this affects rendering only.

Assets are original vector illustrations in assets/*.svg. The interactive renderer uses DOM grid cells with independent SVG sprites, not Phaser or a 3D engine. Edit, import/export, search, demo status/chat/poke remain local only. No authentication or shared backend.
