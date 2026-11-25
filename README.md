# Office Connect — Phase 1

Top-down office floor plan editor. Pure HTML/CSS/JavaScript, no build step or dependencies.

## Run locally
Open `index.html` in a browser, or run `python -m http.server 8000` in this folder and visit http://localhost:8000.

## Publish to GitHub Pages
1. Create a repository named `office-connect` on GitHub.
2. Upload the contents of this folder (index.html, style.css, app.js, README.md, .nojekyll) to its root and commit to main.
3. Settings > Pages > Build and deployment > Deploy from a branch > main > /(root) > Save.
4. Open the Pages URL shown in Settings > Pages.

## Usage
- Edit floor plan: resize the grid, select a tool and click or drag cells. Select tool opens desk details. Rotate R changes the orientation of desks; painting an existing desk with Desk changes its orientation without losing its identity.
- Undo/Redo, Clear, and Sample 40 desks are available. Save & exit returns to viewing mode. Edits are automatically saved locally as well.
- Click a desk to edit its label, occupant name and simulated status. Search focuses the chosen desk.
- Export JSON backs up the entire map; Import JSON restores it. Each browser has its own local map. Share the JSON manually for now.
- Chat and poke are explicitly local previews, not messages sent to others. No login, shared database, group chat, or live presence in this phase. Do not enter confidential data.

## Data model and next phase
Map v1: `{version, cols, rows, nextId, cells}`; cells keyed by `x,y`. Desks have stable IDs, labels, names, demo status and rotation. IDs are unique within one map only. Future backend should namespace IDs by office and replace names/status with authenticated user assignments and connection presence. Suggested tables: offices, layouts, desks, profiles, desk_assignments, conversations, conversation_members, messages, pokes. Use Supabase Auth and row-level security; add private realtime channels. The current phase has no authentication or server-side authorization.
