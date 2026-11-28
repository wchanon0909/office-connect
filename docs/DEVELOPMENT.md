# Development guide

- Keep `index.html` at repository root. Scripts are classic scripts sharing globals except the module renderer; their existing load order is significant. Do not convert to ES modules or combine scripts without regression testing.
- Version-numbered filenames are intentionally retained to avoid changing internal compatibility contracts. See README for directory responsibilities.
- `data/layout.js` is the embedded default layout. `data/layout.json` is the supplied JSON copy. Neither is a live database export; preserve shared production layout separately.
- `js/config/online-config.js` contains only public browser configuration. Never add privileged keys.
- Run a local HTTP server, not file://. Use staging backend for writes. Test guest, login, admin, layout, messaging, friendship, quests, desk studio, and mobile layouts before production merge.
- Historical SQL, QA and rollback directories mentioned in archived notes were not supplied. Retrieve original migration packages if a fresh backend is needed.
