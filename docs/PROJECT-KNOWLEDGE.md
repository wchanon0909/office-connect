# My Office — Project Knowledge & AI Handover

Baseline: v1.0 (release tag `v1.0.0`, not independently verified) | Knowledge revision 2 | Updated: 2026-11-29

## 1. Scope and evidence

This is a living handover, not a complete transcript or a database installer. Revision 2 incorporates `My-Office-Chat-01.pdf` (265 pages), `My-Office-Chat-02.pdf` (39 pages), the earlier TXT exports, `office-connect-main(4).zip`, and the current conversation. The PDFs restore the original project concept and many owner decisions omitted from the TXT exports. Some assistant replies and attachment contents are absent from the second PDF; referenced SQL, JSON and screenshots are not equivalent to their original machine-readable files. The supplied ZIP is the last available main snapshot, not a verified live commit. Production database state and release tag remain unverified. Page references below use the PDF page numbers. Do not publish the raw chat exports: they may contain employee information or credentials.

Evidence convention: **Requirement** = owner direction; **Source** = present in supplied frontend; **Historical contract** = documented behavior in archived release notes, to be confirmed against deployed backend; **Proposed** = not an approved or verified implementation.

## 2. Product direction and non-negotiables

- Virtual Social Office for GFE & GOE, not an employee productivity monitoring system. Brand: My Office; tagline: Your workspace. Your people. Your little virtual world.
- Owner cancelled the old roadmap in Chat 01 and redirected development toward optional daily quests, Coins and a seated-perspective personal desk scene. Do not revive the old seasonal/world expansion roadmap or treat proposed version schedules as commitments.
- Users may socialize without quests. No mandatory engagement, attendance streak penalties or pressure to send repeated messages. Historical design proposals: no real-money Coins, no expiry or inactivity penalty; prefer direct purchases over random rewards. Verify actual catalog and quest rules before changing them.
- Preserve existing workflows, graphical quality and user data. Avoid unnecessary infrastructure costs and background requests.
- Owner requires guest Login at bottom right instead of gear; hide message and idea launchers for guests; retain signed-in controls. Align bottom speech dock with map and personal controls, stacking on narrow screens. Theme management is Admin-only.
- Keep current repository name and URL unless owner approves a suitable free alternative.

### Product evolution and decisions recovered from the PDFs

| Stage | Decision and rationale | Evidence |
|---|---|---|
| Original Phase 1 | Interactive office for colleagues, initially around 40 desks; owner chose top-down and a self-editable grid. Static HTML/CSS/JS was delivered rather than the proposed React/Vite stack. | Chat 01 pp. 1–9 |
| V1.1–V2 | Improve realism first, retain owner layout; historical 10 × 20 grid with 72 desks after removing the first column. CSS then SVG sprites did not meet the desired depth. Phaser was proposed but SVG was delivered. These dimensions are historical, not a constraint on today's layout. | Chat 01 pp. 10–24 |
| V3 | Owner explicitly approved Three.js and orthographic camera. V3.0 could fall back to flat 2D when engine loading failed; owner rejected visual quality. V3.1 reported actual Chromium rendering. Keep 3D quality and verify real rendering rather than treating reference imagery as proof. | Chat 01 pp. 25–34 |
| V4–V5 | Shared online layout, employee account/desk assignment, presence, Thai UI, private communication, movement and hall groups. A hosted static page alone did not sync local storage. | Chat 01 pp. 34–166 |
| V6.0–6.3 | Productivity tools were added, but owner explicitly redirected emphasis toward casual social interaction; then manual 3D layout, appliances, social actions, theme and profile controls. | Chat 01 pp. 173–236 |
| V6.4 onward | Owner cancelled the earlier roadmap and introduced optional Coin quests and personal desks; subsequent releases refined 3D placement, performance, navigation and social boards. | Chat 01 pp. 237–255; Chat 02 pp. 1–35 |
| v1.0 | Personalization, friendship and achievements, hall-zone and guest UI fixes; reorganization retained frontend logic and existing URL. | Chat 02 pp. 35–39; current conversation and ZIP |

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
- Owner's original account flow: select an unoccupied desk, claim using employee identifier, nickname and an account password; one account cannot occupy several desks. Admin may manage nickname/assignment; the account follows the user when moved. Explain that the password is for the user's own account. Historical request to remove an eight-character UI rule is not permission to bypass current Supabase security requirements. Verify current Auth configuration. (Chat 01 pp. 38–39, 137, 158.)
- Keep the office scene central: no unnecessary left sidebar, desk IDs, vacant-desk count or technical camera hints in normal member UI. Thai, friendly readable labels; map controls compact at lower left, actions upper left, messages upper right, account gear lower right, speech/status controls grouped at bottom center. Version indicator near live connection status. Prefer compact icon menus and reachable top-right close buttons rather than requiring scrolling. (Chat 01 p. 66, pp. 229–236; Chat 02 pp. 27–29, 38.)
- Guests may see the populated scene but not member names/statuses or private controls; offline desks historically dimmed. Status bubbles default visible for members, user-toggleable. Main statuses: available, busy, do not disturb, meeting, break; away-from-desk is derived from movement, not a manually chosen main status. Break means sleeping at desk; meeting means walking to meeting location. Temporary destination/action text must restore the previous status on arrival; custom status text retains selected icon. (Chat 01 pp. 85, 113–127, 162; Chat 02 p. 26.)
- Account settings are for nickname, profile caption, password and logout, not duplicate character/status controls. Profile card shows actual avatar and caption; historical caption limit 160 characters. Header keeps online count and MENU; ADMIN only for admins. Shared theme changes are visible to everyone but editable only by admins. (Chat 01 pp. 206, 229–236; Chat 02 pp. 28–29.)
- Account identity is independent of desk assignment. Preserve profile, nickname, avatar and saved outfits on desk moves.
- Guest login uses existing employee dialog; guest must not receive private member data through backend. UI hiding is not authorization. Free registration historically did not verify employment; review before broader rollout.
- Admin theme/layout/member/event operations require server-side authorization. MENU toggles HUD, not scene, character labels or editor save controls.
- Session loss/logout returns guest UI. Speech dock aligns when centered available width >=280px; otherwise stack. Public speech is ephemeral (historically 1–120 chars, 2s minimum send interval, 5s display), not private chat or saved status.

### Scene, movement and layouts
- Owner controls production furniture positions; add available models/tools, never insert new rooms or rearrange the shared layout by assumption. Keep desk IDs and assignments stable. Historical layout dimensions changed during development; inspect current shared export rather than assuming old 10 × 20 or 10 × 19. (Chat 01 pp. 15–29, 70–75, 191–196.)
- Walls, doors and windows belong on grid edges, not cell centers; adjacent cells remain usable, wall corners join correctly and door openings affect routing. Support wall-flush furniture, double glass doors, round four-block tables, and stairs visual placeholder (no playable lower floor unless separately approved). Distinguish geometry/editor fixes from actual layout edits. (Chat 02 pp. 20–26.)
- Walk to reachable destinations from seated or standing states; use nearest reachable appliance per activity, not duplicate buttons. Bookshelves are decorative, not break activities. Printer, coffee machine, fridge and water dispenser require correct approach position, facing and animation. Arrow-key movement and camera zoom/pan/reset are historical owner requirements. (Chat 01 pp. 191–202, 225; Chat 02 pp. 23–28.)
- Action loops should stop on movement, return to desk or incompatible status; distinguish standing, seated and social actions, verify all four facing directions and smooth transitions. Action labels are temporary (5 seconds requested), even if animation continues. Do not reintroduce dancing while seated or stretching while walking. (Chat 02 pp. 4, 11–17, 27.)
- Preserve shared production floor plan; embedded defaults are not a backup of live data. Export shared JSON before editing layouts or migrations.
- Fine-grid manual placement, grid-edge walls, room/stair geometry and coarse-grid route accessibility interact. Avoid changing collision logic merely to add a visual prop.
- Natural walking, turning and sitting are visual layers; sub-tile collision-free movement is not guaranteed. Multiple avatars can overlap near shared goals. Keep door, appliance and desk approach behavior.
- Shared seating uses reachable free seats (historically 6 round/4 long table), server revision/route checks and reservation lock; release on moving or returning to desk.
- Hall SQL 41: temporary groups reserve two-cell six-person zones in four marked areas; closest walkable free zone; existing groups retain location. Open chat only on arrival, with server arrival authorization. Do not hardcode estimated coordinates over current plan; close temporary groups before relevant migration/rollback.

### Communication and social
- Poke must be available regardless of recipient status; walk to peer when appropriate, use direct notification when movement would disrupt activity, never force recipient to change state. Invite/poke notifications should be prominent and responsive. (Chat 01 pp. 102, 126, 153, 173–174, 191.)
- Temporary hall groups cluster closely with one shared chat icon. Joining requires acceptance from an existing member; new participants must not see pre-join messages. Show system join/leave messages. Minimizing preserves membership; closing temporary chat or returning to desk exits it, unlike persistent DM/group chat. Last member leaving frees the area. (Chat 01 pp. 121–162.)
- Public speech bubble includes sender nickname in smaller text at top left and disappears after five seconds. Keep speech composer separate from action menu. Message inbox lists retained conversations rather than a redundant friend directory. (Chat 01 pp. 153–160; Chat 02 pp. 27–28.)
- Friendship progression is independent of character gender; owner envisioned Harvest Moon-style heart milestones and unlocked social actions, plus profile achievements. Use documented v1.0 values below rather than prototype thresholds. (Chat 02 p. 35.)
- Preserve DM, group invitations, read receipts, poke, private desk notes, hall join/leave events and notification routing. Chat is not end-to-end encrypted.
- High Five is mutually accepted; do not force the peer's avatar to move. Guest cannot read private member conversations under intended policies.
- Friendship v1.0: unordered account pair, hearts at 10/40/100/180/300 EXP; reciprocal DM +2 at most every 60s, validated directed action +2, accepted High Five +3, shared 20s social cooldown, cap 12 EXP/pair/Bangkok day. No decay, no backfill from private chat, no public ranking. Opt-out preserves previous XP and badges. Pair XP visible only to participants. New heart-gated actions sender-only animation with recipient notification; server grants XP only from committed events.
- Tutorial 12 scenes, skip persisted per account, reopen allowed; completion rewards only for actual completion. Historical v1.0 catalog: 17 clothing styles, 7 bottoms, 14 hair styles, 14 accessories incl. none, 10 presets, 5 saved outfits; free outfits, preserve IDs and legacy presets. Preview on demand, dispose when closed.

### Economy, quests and Desk Studio
- Daily and weekly quests plus Explorer quests (one completion per account; teach application features). Avoid spam incentives and compulsory participation. (Chat 01 pp. 237–245; Chat 02 p. 1.)
- Desk Studio should resemble a real, initially empty office workstation, not a decorated room with shelves/background. Owner wants SketchUp-like click-to-place/rotate, close placement with modest overlap acceptable, office equipment (notebooks, monitors, chairs) free and cute/animated decor paid with Coins. Preserve legacy item aliases; historical examples: lamp → desk_lamp, plant → mini_plant, books → pastel_books, clock → cute_clock, fan → desk_fan. Old shelf placements were migrated to desk surface in historical V6.6.2. (Chat 02 pp. 6–10.)
- Admin must be able to enable/disable shop access for members. The old request to reset all inventories, refund Coins, grant a large admin test balance and restrict shop to admin was a one-time development operation, NOT a standing instruction or authorization to repeat. Verify current shop flag and ledger. (Chat 02 pp. 9–10.)
- For office previews map local desk coordinates to office geometry; avoid floating/sunken objects and seat collisions. Use simplified bounded models and verify reload, multiple users, mobile and offline state. Owner explicitly requires previews hidden for offline owners. (Chat 02 pp. 11–17, 28.)
- Owner requirement: optional quests and Coin-funded personal decoration; normal office access not conditional on rewards.
- Historical design: Bangkok daily reset, account wallet/ledger, quest progress, catalog, inventory, placed items. Server-side accounting, atomic purchase and inventory updates, avoid multi-tab double counting; not client-authoritative. Exact quest rewards shown in Chat 01 were prototypes, not the current catalog.
- v1.0 notes: 61 existing quests + 8 new (3 daily, 2 weekly, 3 explorer), 13 badge definitions, 40 new paid decor items (20–95 Coin); prices preliminary. Preserve prior claims, balances, inventory, free items and purchase history. Achievement counts can start at different release dates; no anonymous-note badge.
- Desk Studio separate seated perspective, shop/inventory/placement, peer viewing without editing peer desk. Main office simplified previews only for online owners, historically cap six items. Preserve ordinary furniture for offline owners. Avoid continuously rendering every item preview.
- Admin online grant: historically 1–100,000 Coin per eligible online desk-assigned account, presence within 90s; atomic ledger per recipient, stable request ID, retry idempotently. Never submit new grant after uncertain result without checking previous request.

### Community boards
- Personality test is a wall poster interaction; walk to it, then open questionnaire; result appears on character card. First-use onboarding is skippable and may be reopened. Photo Album, Post-it and Food Wheel must likewise require arrival at the object before opening, not remote activation. (Chat 02 pp. 27–35.)
- Keep the persistent shared idea/feedback board distinct from anonymous Post-it notes. Owner requested a bottom-right idea launcher for collective visible feedback (Chat 01 p. 184); later guest UI hides it (Chat 02 p. 38).
- Admin announcements and online Coin grants display temporary notices beneath upper-left action area. Photo board shows caption/uploader; Post-it uses overlapping colored notes with full-note selection; Food Wheel is individual spin with shared last-five history. (Chat 02 pp. 29–34.)
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

### Owner decisions and incident history recovered from PDFs

| Incident / decision | Handover rule | Evidence |
|---|---|---|
| 3D appeared flat | Distinguish real WebGL rendering from SVG fallback; verify CDN/engine loading and actual screenshots. | Chat 01 pp. 23–34 |
| Registration failed; avatar/status saves failed | Check Auth/RPC compatibility and migration prerequisites. PGRST202 `oc54_set_avatar` was reported historically; do not assume it is still missing. | Chat 01 pp. 64–66, 133–137 |
| Hall exit failed | Historical schema-cache error for `oc55_leave_huddle(p_room)`; distinguish check-only rollback from installed migration, verify API schema after installation. | Chat 01 pp. 148–150 |
| SQL repeatedly failed | Provide separate check-only, install and verify steps; successful checks should show concise PASS; failures should show actionable error, not noisy output. Never treat a successful dry run as deployment. | Chat 01 pp. 133–146; Chat 02 pp. 3–6, 11, 29, 36 |
| Lag with 19 users | Owner reported sluggish actions; prioritize backend/transport optimization without sacrificing frontend visual quality. Measure requests, latency, render performance and concurrent users before claiming improvements. | Chat 02 pp. 18–20 |
| NAS considered | Owner chose continued Supabase optimization rather than migration to Synology NAS. Do not reopen infrastructure migration as an active task without approval. | Chat 02 pp. 24–25 |
| Walls/door route bugs and broken scene | Test room exits, usable edge-adjacent cells, stair placement, appliance approach and rendering after geometry changes. | Chat 02 pp. 20–26 |
| Post-it reset / wheel location | Test admin reset, actual board placement and proximity-triggered opening. | Chat 02 p. 35 |


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

- New PDFs cover 304 pages and restore much of the missing early context. Some replies and attachments are absent (especially Chat 02); recover original SQL/JSON or relevant missing messages only when needed. Do not claim every decision was captured.
- Recover original SQL/QA/rollback packages and sanitized current schema; confirm SQL 40 FIX2/41 installed and live authorization. No backend reset.
- Confirm production acceptance, release tag and exact commit; add test evidence and date when verified.
- Automated deployment, deeper code cleanup, domain change and earlier roadmap ideas are proposals, not active tasks unless owner explicitly approves.
- Keep old chats or private exports until the owner accepts remaining gaps. Do not publish original chat PDFs or TXT exports. Keep this document updated in GitHub and attach its current copy to the ChatGPT project. Public copy must remain free of confidential information.

## 10. Source navigation

| Source | Pages / location | Use |
|---|---|---|
| Chat 01 PDF | 1–34 | Original concept, grid, visual iterations, Three.js decision and rendering issue |
| Chat 01 PDF | 35–101 | Online setup, account/desk flow, Thai interface, chat |
| Chat 01 PDF | 102–176 | Movement, status, hall chat, notification and SQL recovery history |
| Chat 01 PDF | 177–236 | Social-first direction, manual layout, interactions, theme, profile |
| Chat 01 PDF | 237–255 | Cancelled roadmap, optional quests, Coin and My Desk |
| Chat 01 PDF | 256–265 | Historical branch/staging proposal, superseded by Chat 02 |
| Chat 02 PDF | 1–17 | Explorer quests, GitHub Pages decision, desk/shop, action loops |
| Chat 02 PDF | 18–26 | Performance, SQL diagnostics, grid edges, NAS decision |
| Chat 02 PDF | 27–36 | UI, onboarding, personality, boards, friendship and achievements |
| Chat 02 PDF | 37–39 | Hall zones, guest/login dock, cleanup, domain decision |
| Earlier TXT exports | Chat 01 lines 3–315; Chat 02 lines 10–840 | Supplement details omitted from PDF assistant replies, including guest UI mock tests and proposed reorganization |
| Supplied ZIP | README, CHANGELOG, docs/DEVELOPMENT.md, docs/DEPLOYMENT.md, docs/VALIDATION.md, docs/RELEASE-HISTORY.md, index.html, JS | Last available implementation snapshot and historical technical contracts |

For future AI work: consult the current main and relevant source files before treating any historical limit as current. The PDF references identify private owner archives, not files that must be committed to this repository.
