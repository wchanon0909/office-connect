# Deployment and migration guide

This is a frontend-only reorganization of source commit `56c1e4b1b27a80c4a7a6ecb1efa9fd865f48e10d`. Keep the existing repository, production branch, URL and Supabase project. The original README identifies GitHub Pages / main / root; verify Settings > Pages or your actual hosting dashboard before proceeding.

## ขั้นตอนสำหรับ GitHub Desktop

1. ดาวน์โหลด GitHub Desktop จาก https://desktop.github.com/ และ Sign in ด้วยบัญชี GitHub ของคุณ
2. File > Clone repository > เลือก office-connect > เลือก Local path > Clone หากมีอยู่แล้วให้เปิด Repository เดิม แล้ว Fetch origin / Pull origin ก่อนเริ่ม ตรวจว่าไม่มี Changes ค้างอยู่
3. Current Branch > main (หรือ production branch จริง) > New Branch > backup-before-v1.0-reorg > Create branch > Publish branch เพื่อเก็บต้นฉบับ
4. กลับ main > New Branch > release-v1.0-reorg > Create branch ตรวจชื่อ branch ด้านบนก่อนแก้ไฟล์
5. แตก ZIP ไว้ภายนอก Repository เปิด Repository > Show in Explorer เปิดโฟลเดอร์ My-Office-v1.0 จาก ZIP ซึ่งมี index.html อยู่ข้างใน ห้ามคัดลอกโฟลเดอร์ครอบทั้งก้อน
6. ลบเฉพาะไฟล์เดิมตามตารางด้านล่าง (ทุกไฟล์เป็นไฟล์ root) แล้วคัดลอกเนื้อหาทั้งหมดจาก My-Office-v1.0 เข้า root ของ Repository รวม index.html, README.md, CHANGELOG.md, assets/, css/, js/, data/, docs/, .gitignore ตามที่มีใน ZIP ห้ามลบ .git/ หรือไฟล์อื่นที่เพิ่มภายหลังโดยไม่ตรวจสอบ หาก main เปลี่ยนจาก commit ต้นฉบับ ให้หยุดและเทียบความแตกต่างก่อน
7. GitHub Desktop > Changes ตรวจว่ามีไฟล์ย้าย/ลบ/เพิ่มตามรายการ ไม่มีไฟล์ลับหรือไฟล์ซ้ำที่ root; Git อาจแสดง rename หรือ delete/add ทั้งสองแบบเป็นปกติ
8. Summary: `refactor: organize My Office v1.0 repository` > Commit to release-v1.0-reorg > Publish branch (หรือ Push origin)
9. ทดสอบจากเครื่องด้วย `python -m http.server 8000` ที่ root แล้วเปิด http://localhost:8000/ หรือใช้ Preview ของ hosting หากมี GitHub Pages แบบ main/root ไม่ได้สร้าง preview branch ให้อัตโนมัติ อย่าสลับ production source เพียงเพื่อทดสอบ
10. เปิด GitHub > Pull requests > New pull request > base: main, compare: release-v1.0-reorg > ตรวจ Files changed > Create pull request > Merge หลังทดสอบผ่าน
11. ตรวจ deployment ใน Actions / Settings > Pages (หรือ hosting dashboard เดิม) และเปิด URL เดิม https://wchanon0909.github.io/office-connect/ หากใช้ Pages ให้คง main / root ไม่ต้องเปลี่ยน domain หรือ DNS; หากใช้ Cloudflare จริง ให้คง project และค่าที่ใช้อยู่ เพราะ index.html ยังอยู่ root
12. Hard refresh (Ctrl+F5) แล้วทดสอบ guest/login, admin, chat สองบัญชีที่ยินยอม, hall arrival, avatar, quest, shop, layout และมือถือ ตรวจ Console และ Network ว่าไม่มีไฟล์ท้องถิ่น 404
13. หากพบปัญหา ให้ revert merge commit ผ่าน GitHub หรือสร้าง PR คืนไฟล์จาก backup branch ห้าม reset ฐานข้อมูล ไม่ต้องรัน SQL สำหรับการย้ายโครงสร้างนี้
14. เมื่อผ่าน acceptance test แล้วจึงสร้าง GitHub Release tag v1.0.0 หาก tag นี้ยังไม่มี หากมีแล้วให้ใช้ tag ใหม่ เช่น v1.0.1 โดยไม่ย้าย tag เดิม

## Exact file migration map

Delete the old root copies; the ZIP contains identical files at the new paths.

| Old root file | New path |
|---|---|
| `app.js` | `js/core/app.js` |
| `chat.css` | `css/chat.css` |
| `chat.js` | `js/services/chat.js` |
| `cloud.css` | `css/cloud.css` |
| `cloud.js` | `js/services/cloud.js` |
| `corners.css` | `css/corners.css` |
| `corners.js` | `js/ui/corners.js` |
| `desk3d.js` | `js/features/desk3d.js` |
| `deskstudio.css` | `css/deskstudio.css` |
| `deskstudio.js` | `js/features/deskstudio.js` |
| `floor-editor.js` | `js/layout/floor-editor.js` |
| `floor-shapes.js` | `js/layout/floor-shapes.js` |
| `hall.js` | `js/services/hall.js` |
| `ideas.js` | `js/features/ideas.js` |
| `interface.css` | `css/interface.css` |
| `layout-studio.css` | `css/layout-studio.css` |
| `layout-studio.js` | `js/layout/layout-studio.js` |
| `layout.js` | `data/layout.js` |
| `layout.json` | `data/layout.json` |
| `living.css` | `css/living.css` |
| `living.js` | `js/scene/living.js` |
| `motion.js` | `js/core/motion.js` |
| `office100-core.js` | `js/social/office100-core.js` |
| `office100.css` | `css/office100.css` |
| `office100.js` | `js/social/office100.js` |
| `office670-core.js` | `js/social/office670-core.js` |
| `office670.css` | `css/office670.css` |
| `office670.js` | `js/social/office670.js` |
| `office671-core.js` | `js/layout/office671-core.js` |
| `office671-ui.js` | `js/layout/office671-ui.js` |
| `office671.css` | `css/office671.css` |
| `office672-ui.js` | `js/ui/office672-ui.js` |
| `office672.css` | `css/office672.css` |
| `office673.css` | `css/office673.css` |
| `office673.js` | `js/features/office673.js` |
| `office674.css` | `css/office674.css` |
| `office674.js` | `js/features/office674.js` |
| `online-config.js` | `js/config/online-config.js` |
| `polish.css` | `css/polish.css` |
| `presence.css` | `css/presence.css` |
| `productivity.css` | `css/productivity.css` |
| `productivity.js` | `js/features/productivity.js` |
| `quests.css` | `css/quests.css` |
| `quests.js` | `js/features/quests.js` |
| `renderer.js` | `js/scene/renderer.js` |
| `shop-admin.js` | `js/features/shop-admin.js` |
| `social-plus.js` | `js/social/social-plus.js` |
| `social.js` | `js/social/social.js` |
| `style.css` | `css/style.css` |
| `theme.css` | `css/theme.css` |
| `theme.js` | `js/ui/theme.js` |
| `view.js` | `js/core/view.js` |
| `world.css` | `css/world.css` |
| `world.js` | `js/scene/world.js` |

## Keep / replace / add

- Keep `assets/` unchanged (copying the identical files is safe), `.git/` untouched, and any existing hosting settings outside this snapshot.
- Replace root `index.html` and `README.md`; keep `.gitignore` unchanged.
- Add `CHANGELOG.md`, `docs/`, `css/`, `js/` and `data/`.
- Do not create a new repository or upload the outer ZIP folder itself. No SQL migration is required for this reorganization.
