# My Office — Project Knowledge & AI Handover

Baseline: v1.0 (intended release tag `v1.0.0`) | Compiled: 2026-11-29

## 1. Scope and evidence

This is a living handover, not a complete transcript or a database installer. Sources: owner-provided My-Office-Chat-01.txt (427 lines), My-Office-Chat-02.txt (846 lines), office-connect-main(4).zip, and the current conversation. Both text exports begin with a loading-previous-messages notice and contain only late portions of their chats. Earlier history is reconstructed from `RELEASE-HISTORY.md`, not from complete transcripts. The ZIP is the supplied main snapshot, not an independently verified live commit. Release tag and production database state have not been checked.

Evidence convention: **Requirement** = owner direction; **Source** = present in supplied frontend; **Historical contract** = documented behavior in archived release notes, to be confirmed against deployed backend; **Proposed** = not an approved or verified implementation.

## 2. Product direction and non-negotiables

- Virtual Social Office for GFE & GOE, not an employee productivity monitoring system. Brand: My Office; tagline: Your workspace. Your people. Your little virtual world.
- Owner cancelled the old roadmap in Chat 01 and redirected development toward optional daily quests, Coins and a seated-perspective personal desk scene. Do not revive the old seasonal/world expansion roadmap or treat proposed version schedules as commitments.
- Users may socialize without quests. No mandatory engagement, attendance streak penalties or pressure to send repeated messages. Historical design proposals: no real-money Coins, no expiry or inactivity penalty; prefer direct purchases over random rewards. Verify actual catalog and quest rules before changing them.
- Preserve existing workflows, graphical quality and user data. Avoid unnecessary infrastructure costs and background requests.
- Owner requires guest Login at bottom right instead of gear; hide message and idea launchers for guests; retain signed-in controls. Align bottom speech dock with map and personal controls, stacking on narrow screens. Theme management is Admin-only.
- Keep current repository name and URL unless owner approves a suitable free alternative.

## 3. Architecture and deployment

Repository: https://github.com/wchanon0909/office-connect
Production: https://wchanon0909.github.io/office-connect/
Frontend: static HTML/CSS/vanilla JS, Three.js orthographic scene with 2D fallback. Backend: Supabase Auth, PostgreSQL RPC, Realtime and fallback polling. Hosting: GitHub Pages, main/root per supplied documentation. No build step. Earlier proposal to publish `site/` via GitHub Actions was not adopted in this snapshot. Do not move root entry point without a separate deployment plan.

Classic scripts share globals; renderer uses modules. Existing loading order, cross-module wrappers and cache query strings matter. Read `index.html` before moving/combining modules. Version-numbered files are active layers, not obsolete backups. Dynamic SVG references mean assets cannot be judged unused merely by searching literal HTML.

| Path | Responsibility / key files |
|---|---|
| `index.html` | Entry point and resource order |
| `assets/`, `css/` | 17 assets; 20 stylesheets |
| `data/` | `layout.js` embedded default; `layout.json` backup copy, not a live layout export |
| `js/config/` | `online-config.js` public browser configuration only |
| `js/core/` | app, view, motion |
| `js/scene/` | renderer, living, world |
| `js/layout/` | floor-editor, floor-shapes, layout-studio, office671-core/ui |
| `js/services/` | cloud, chat, hall |
| `js/social/` | social, social-plus, office670/core, office100/core |
| `js/features/` | desk3d, deskstudio, ideas, productivity, quests, shop-admin, office673/674 |
| `js/ui/` | corners, office672-ui, theme |
| `docs/` | development, deployment, validation, historical release notes |

## 4. Functional contracts to preserve

The following details are historical release contracts unless explicitly identified as owner requirements. Verify current implementation and live settings before assuming exact limits.

### Accounts, presence and UI
- Account identity is independent of desk assignment. Preserve profile, nickname, avatar and saved outfits on desk moves.
- Guest login uses existing employee dialog; guest must not receive private member data through backend. UI hiding is not authorization. Free registration historically did not verify employment; review before broader rollout.
- Admin theme/layout/member/event operations require server-side authorization. MENU toggles HUD, not scene, character labels or editor save controls.
- Session loss/logout returns guest UI. Speech dock aligns when centered available width >=280px; otherwise stack. Public speech is ephemeral (historically 1–120 chars, 2s minimum send interval, 5s display), not private chat or saved status.

### Scene, movement and layouts
- Preserve shared production floor plan; embedded defaults are not a backup of live data. Export shared JSON before editing layouts or migrations.
- Fine-grid manual placement, grid-edge walls, room/stair geometry and coarse-grid route accessibility interact. Avoid changing collision logic merely to add a visual prop.
- Natural walking, turning and sitting are visual layers; sub-tile collision-free movement is not guaranteed. Multiple avatars can overlap near shared goals. Keep door, appliance and desk approach behavior.
- Shared seating uses reachable free seats (historically 6 round/4 long table), server revision/route checks and reservation lock; release on moving or returning to desk.
- Hall SQL 41: temporary groups reserve two-cell six-person zones in four marked areas; closest walkable free zone; existing groups retain location. Open chat only on arrival, with server arrival authorization. Do not hardcode estimated coordinates over current plan; close temporary groups before relevant migration/rollback.

### Communication and social
- Preserve DM, group invitations, read receipts, poke, private desk notes, hall join/leave events and notification routing. Chat is not end-to-end encrypted.
- High Five is mutually accepted; do not force the peer's avatar to move. Guest cannot read private member conversations under intended policies.
- Friendship v1.0: unordered account pair, hearts at 10/40/100/180/300 EXP; reciprocal DM +2 at most every 60s, validated directed action +2, accepted High Five +3, shared 20s social cooldown, cap 12 EXP/pair/Bangkok day. No decay, no backfill from private chat, no public ranking. Opt-out preserves previous XP and badges. Pair XP visible only to participants. New heart-gated actions sender-only animation with recipient notification; server grants XP only from committed events.
- Tutorial 12 scenes, skip persisted per account, reopen allowed; completion rewards only for actual completion. Historical v1.0 catalog: 17 clothing styles, 7 bottoms, 14 hair styles, 14 accessories incl. none, 10 presets, 5 saved outfits; free outfits, preserve IDs and legacy presets. Preview on demand, dispose when closed.

### Economy, quests and Desk Studio
- Owner requirement: optional quests and Coin-funded personal decoration; normal office access not conditional on rewards.
- Historical design: Bangkok daily reset, account wallet/ledger, quest progress, catalog, inventory, placed items. Server-side accounting, atomic purchase and inventory updates, avoid multi-tab double counting; not client-authoritative. Exact quest rewards shown in Chat 01 were prototypes, not the current catalog.
- v1.0 notes: 61 existing quests + 8 new (3 daily, 2 weekly, 3 explorer), 13 badge definitions, 40 new paid decor items (20–95 Coin); prices preliminary. Preserve prior claims, balances, inventory, free items and purchase history. Achievement counts can start at different release dates; no anonymous-note badge.
- Desk Studio separate seated perspective, shop/inventory/placement, peer viewing without editing peer desk. Main office simplified previews only for online owners, historically cap six items. Preserve ordinary furniture for offline owners. Avoid continuously rendering every item preview.
- Admin online grant: historically 1–100,000 Coin per eligible online desk-assigned account, presence within 90s; atomic ledger per recipient, stable request ID, retry idempotently. Never submit new grant after uncertain result without checking previous request.

### Community boards
- Photo Album (SQL 37): suitable wall near Personality poster; no arbitrary placement if wall missing. Latest 10 photos, 24h visibility, re-encoded JPEG <=960px/160,000 bytes, input <=20MB, caption <=160 chars; private storage; one image read at a time; upload cooldown 30s. Owner deletes own, Admin any. Expired rows physically cleaned on later upload/deletion, not guaranteed instant deletion.
- Post-it (SQL 38/39): persistent anonymous-to-readers notes, author ID retained privately for rate limit/administration; 200 chars, 20s/account; Admin moderation/reset with confirmation. No profanity filter; render as text. SQL 39 safe-update fix uses qualified DELETE with `WHERE id IS NOT NULL`; never disable safety guard.
- Food Wheel: server chooses equal-probability item, 2–15 unique menu choices, no Coin cost, 5s cooldown, stable request ID, latest five results; refresh on open/manual/spin, not idle polling. Board placement follows saved grid-edge layout, absent if suitable wall missing; Admin menus remain accessible.

## 5. Backend integration map (frontend evidence)

Selected literal RPC names observed in supplied JS; not exhaustive and not proof of deployed function definitions.

| File | RPC examples |
|---|---|
| `cloud.js` | oc41_snapshot, oc412_presence, oc41_claim, oc41_save_layout, oc41_admin_member, oc42_leave, oc54_set_status, oc633_set_profile, oc63_set_theme, oc665_ready, ocq_action |
| `chat.js` | oc43_inbox, oc43_messages, oc43_open_dm, oc43_send, oc43_read, oc43_invite, oc43_respond, oc43_poke, oc55_answer_join, oc55_leave_huddle, oc56_clear_chat |
| `deskstudio.js`, `quests.js` | oc64_buy, oc66_place, ocq_explore |
| `office100.js`, `office670.js` | oc100_friendship, oc100_outfit, oc100_peer, oc100_profile, oc100_tour, oc670_emit, oc670_personality |
| `office673.js` | oc673_album, oc673_photo, oc673_upload, oc673_delete, oc673_grant |
| `office674.js` | oc674_notes, oc674_post, oc674_note_delete, oc674_note_reset, oc674_wheel, oc674_spin, oc674_food_save |
| `ideas.js`, `productivity.js` | oc61_ideas, oc61_post_idea, oc61_delete_idea, oc60_workspace |

Full tables, columns, RLS, grants, triggers, function bodies and production migration state are **unknown** from frontend alone. Obtain sanitized schema/definitions and current audit before DB work. Never publish credentials, private exports, account IDs or employee data. Public client key does not replace RLS and authorization.

Historical dependency chain: migrations 16–25 for earlier features; 31 performance; 33 floor shapes; 34–36 room/navigation; 37 shared moments; 38 boards; 39 board fix; 40 v1.0 (FIX2 prerequisite per hall notes); 41 hall zones. See archived notes for exact prerequisites. SQL files and QA fixtures are not included in current ZIP. Do not reconstruct or rerun historical migrations from prose. Fresh backend requires original full packages. For new migration: backup, staging, complete check-only (rollback), install, verify; stop on error, deploy compatible frontend only after success. Frontend rollback does not undo committed DB writes; preserve financial and user records.

## 6. Performance and lessons learned

- V6.6.5 transport optimization and private notifications are important; inspect actual timers rather than applying older documented polling intervals. Do not add background polling/channel for every feature.
- Fetch pair/badge/outfits and board/photo data on demand. Keep relationship graph and photo bytes out of snapshots. Bound thumbnail rendering and dispose resources on rebuild/close.
- Realtime is not guaranteed in inactive tabs; preserve fallback reconciliation. Refresh old tabs after deployment to avoid mixed-client behavior.
- Do not claim actual FPS, API p95 or database load improvements without comparable production measurements.
- QA and SQL packages removed from public frontend were not obsolete engineering evidence. Retrieve and preserve separately; old `floor-shapes.test.cjs` reportedly passed 21 groups. Old version filenames still active; do not delete by age.
- Historical `site/` patch instructions refer to old root layout. Translate paths to current folders. Reorganization moved 54 files without content changes, retained 33 JS and 20 CSS, and updated 55 resource references.
- Previous validation: syntax/path/byte checks passed; browser runtime blocked by environment policy; live Supabase, WebGL, concurrent accounts unverified. Earlier mock Chromium tests are not production proof.

## 7. Development and release workflow

1. Pull current main, inspect relevant docs and source, confirm owner intent and affected contracts.
2. Feature/fix branch for substantial changes. Prefer narrowly scoped patches; no framework rewrite or paid service by default.
3. Check file references, JS syntax, dependency/load order and regression tests; run local HTTP server (`python -m http.server 8000`) rather than file://. Current config points at existing backend: use staging for writes.
4. Acceptance: guest/login/logout/expiry, member/admin, movement/scene/2D fallback, layouts, hall arrival, two-account DM and social, friendship opt-out, quests/coin purchases/placement, boards, mobile HUD, network/console. Test permissions on backend, not just hidden buttons. For economy use small test amounts and verify ledger.
5. Document affected paths, migrations and rollback. Deploy after review; confirm actual Pages deployment and hard refresh. Merge verified changes to main.
6. Maintain README overview, CHANGELOG milestones and this handover for significant decisions. Semantic Versioning: patch fixes, minor compatible features, major breaking changes. Tag tested release commit; do not silently move published tags. Owner reports reorg merged; backup-before-v1.0-reorg retained by intention; branch/tag status not independently verified.

## 8. AI handover instructions

Read current main plus README, DEVELOPMENT, DEPLOYMENT, CHANGELOG, VALIDATION and this file. Use RELEASE-HISTORY for detailed historical contracts; resolve conflicts in favor of latest explicit owner requirements and verified current behavior, not old roadmap. Explain conflicts rather than silently changing behavior. Ask only for essential missing information. Communicate in clear Thai; maintain English public documentation and existing Thai UI labels. Verify source and run tests where possible; clearly state untested behavior. Deliver exact paths and migration/rollback steps. Never expose secrets or perform destructive DB actions by default.

## 9. Open items and archival policy

- Obtain complete chat history if possible; provided TXT files omit earlier exchanges. Do not claim every decision was captured.
- Recover original SQL/QA/rollback packages and sanitized current schema; confirm SQL 40 FIX2/41 installed and live authorization. No backend reset.
- Confirm production acceptance, release tag and exact commit; add test evidence and date when verified.
- Automated deployment, deeper code cleanup, domain change and earlier roadmap ideas are proposals, not active tasks unless owner explicitly approves.
- Keep old chats until their missing context is recovered or owner accepts loss. Keep this document updated in GitHub and attach its current copy to the ChatGPT project. Public copy must remain free of confidential information.

## 10. Source navigation

- Chat 01 lines 3–9: owner cancels roadmap and defines optional quests / desk concept; 103–165 and 283–315: historical economy proposals.
- Chat 02 lines 10–153: file cleanup and active legacy modules; 160–283: owner UI requirements and mock tests; 285–840: proposed reorganization, branding, domain and release workflow.
- Supplied ZIP: `README.md`, `CHANGELOG.md`, `docs/DEVELOPMENT.md`, `docs/DEPLOYMENT.md`, `docs/VALIDATION.md`, `docs/RELEASE-HISTORY.md` (detailed V3–v1.0 history; use section headings to locate exact historical behavior), `index.html` and JS modules.
