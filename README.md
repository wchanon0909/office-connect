# Office Connect V3 — Orthographic 3D

Static site for GitHub Pages. Upload the contents of this directory to the repository root, commit, and enable Pages from main / root. Use HTTPS or local HTTP (not file://). Local preview: `python -m http.server 8000`, open http://localhost:8000. Requires an internet connection to load pinned Three.js 0.170.0 from jsDelivr and a WebGL2-capable browser. If unavailable, the existing 2D map remains accessible with an explicit warning.

- First visit: exact supplied 10 x 20 layout (72 desks); no changes to desk IDs, cell positions or rotations in JSON.
- RPG view (55 degrees), top view (85 degrees), elevation, rotation, drag to pan, wheel or buttons to zoom, Fit, click workstation to inspect details.
- Edit floor plan switches to the prior 2D editor; Save & exit rebuilds the 3D scene. Import/export JSON remains supported. Load office layout restores the supplied plan (with confirmation).
- Model geometry is procedural, not third-party 3D assets. Wall direction is inferred from adjacency; perimeter has low decorative trim. Desk occupancy/status is simulated. Chat and poke are local previews only. No backend, real-time presence, shared layout or authentication yet. Local storage has a V3-specific key.
- Keep layout.js and layout.json synchronized if replacing the default map. The application reads layout.js on startup; layout.json is also provided for manual import.
