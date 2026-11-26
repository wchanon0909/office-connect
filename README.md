# Office Connect V4.0 — Interface Studio

Phase V4.0 (interface only). Based on the V3 Three.js office release. The 3D furniture, wall geometry, layout data and desk IDs are unchanged. No database, authentication, actual occupancy, actual presence or live chat has been connected yet.

## Update the existing GitHub Pages site
1. In V3, export the current layout JSON as a backup.
2. Upload these four files from the interface update archive to the repository root: `index.html`, `interface.css` (new), `app.js`, `renderer.js`.
3. Keep the current `layout.js`, `layout.json`, `style.css` and `assets/` in your repository. Do not replace them with older copies.
4. Commit, wait for GitHub Pages deployment to complete, then reload using Ctrl+F5.

The complete project archive is intended for a clean installation. It includes the last supplied 10 x 20 plan with 72 desks. Do not use it to overwrite a newer layout. The localStorage key remains `office-connect-v3`, preserving the plan already saved on the same website and browser. Export a backup before updating.

## Controls
- Main office: full-width 3D workspace, no permanent sidebar.
- Hover a desk to see its nickname/desk ID and demo status; click to open a floating desk card. Touch users can tap a desk.
- Drag to pan, scroll to zoom; use the bottom dock for zoom, Fit (show the entire plan), or Reset (initial angle and enlarged view). View menu: change elevation, rotate, or switch RPG/Top presets. Reset uses 55-degree elevation, 15-degree azimuth, and 150% desktop / 102% narrow-screen zoom. The desktop view is intentionally larger than Fit and can crop the bottom; use pan or Fit to see the rest.
- Manage opens `#admin` in the same app. Edit floor plan, search desks, change local demo desk profiles, import/export JSON. Back to office returns to the main view. Changes are local only. Manage is a UI preview, NOT a security boundary or a password-protected admin area.
- My desk, Sit here, Messages and Invite are explicitly labelled interface previews. No credentials are collected, no account created, and no message sent. These functions will be connected to the backend in subsequent roadmap phases.

## Rendering
Requires internet and a WebGL2-capable browser, served over HTTPS or HTTP. Three.js remains pinned at 0.170.0; jsDelivr is the primary CDN, unpkg is an alternate CDN on import failure. An explicit fallback warning appears if 3D initialization fails. The 2D map/editor remains accessible. A full 3D test still needs to run on the deployed site: the build environment blocked external JS download and browser navigation to the local server.

## Verification
- JavaScript syntax and DOM ID references checked.
- Base layout JSON preserved exactly; 10 columns, 20 rows, 72 desks. Base model construction code and assets preserved.
- Chromium UI test with inline app/CSS/assets and simulated local storage (2D fallback; not WebGL): full-width workspace, hover/click, preview dialogs, Manage route, add desk/undo, export equals original JSON, local save, mobile layout. No page JS errors in this test.
- Production GitHub Pages, actual WebGL camera/raycast and online backend not tested in this environment.

## Next roadmap step
V4.1: Supabase shared layout, free registration using employee ID and password, persistent desk assignment, admin authentication and permissions. V4.2: live presence and personal status. V4.3: private messaging, group chat and invitation. V5: characters and movement.
