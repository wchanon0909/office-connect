# Office Connect — V6.1.1

Virtual Social Office สำหรับนั่งเล่น เม้าท์มอย และเจอเพื่อนร่วมงาน: ผังออฟฟิศ 3D แบบ Orthographic, ตัวละคร, สถานะออนไลน์ และแชทแบบส่วนตัว พร้อมกลุ่มยืนคุยกลางโถงที่เชื่อมกับการเคลื่อนไหวของตัวละคร

[เปิด Office Connect](https://wchanon0909.github.io/office-connect/)

## What's new — V6.1.1: Free Grid & Manual Layout

- ไม่มีการวางเฟอร์นิเจอร์หรือหน้าต่างอัตโนมัติอีกต่อไป ผังจริงยังเป็นผังที่ Admin บันทึกไว้เดิม; ไม่ต้อง Import หรือ Reset Layout
- Admin → Edit floor plan: เลือก Coffee machine, Water dispenser, Printer, Fridge, Cabinet, Sofa, Plant corner, Bookshelf หรือ Glass window แล้วคลิกช่องที่ต้องการ ใช้ Rotate R และ Save Online ตามเดิม; ไม่สามารถวางเฟอร์นิเจอร์ใหม่ทับโต๊ะโดยตรง ควรรักษาทางเดินและตำแหน่งกลุ่มกลางโถง
- เดินเล่น: คลิกช่องกระเบื้องย่อย (3 × 3 ต่อหนึ่งช่อง Layout) ที่ว่างและเข้าถึงได้ ไม่บังคับนั่งประชุมจากการคลิกพื้น; ปุ่มห้องประชุมยังจองที่นั่งแบบเดิม ยืนค้างได้โดยไม่หมดอายุหลัง 10 นาทีขณะที่เชื่อมต่อ
- ปุ่มหันซ้าย/หันขวา 90° ขณะยืน ส่งทิศทางจากฐานข้อมูลให้ทุก Browser เห็นตรงกัน ไม่ใช่การหมุนกล้อง; ไม่หมุนขณะเดินหรือนั่งโต๊ะ/นั่งประชุม
- สะกิดเพื่อนที่ออนไลน์และอยู่โต๊ะจริงได้โดยเดินไปหาทุกสถานะ รวมถึงพักและห้ามรบกวน; หากเพื่อนไม่อยู่โต๊ะ ออฟไลน์ หรือผู้ส่งอยู่ในกิจกรรมที่ขัดกัน ใช้แจ้งเตือนตรงตามเดิม; กรณีผู้ส่งพักแล้วเลือกสะกิดแบบเดิน จะตื่นและเปลี่ยนเป็นว่างเมื่อเริ่มเดิน
- การคลิกวัตถุที่ Admin วางแล้วจะเดินไปช่องว่างข้างวัตถุเมื่อมีทางไป แสงตามเวลา, เพลง และกระดานไอเดียจาก V6.1 ยังอยู่ครบ
- ต้อง Run `20-free-grid-layout-check-only.txt` และ `20-free-grid-layout-install.txt` หลัง Migration 19 (Install) ก่อนอัปโหลดไฟล์เว็บ; ไม่แก้ข้อมูล Layout เดิม

## What's new — V6.1: Living Environment & Idea Board (historical; fixed placement superseded by V6.1.1)

- เพิ่มหน้าต่างกระจกและวิวเมืองแบบ low-poly ที่ขอบฉาก พร้อมแสงยามเช้า/กลางวัน/เย็น/กลางคืนตามเวลา Asia/Bangkok (ตรวจทุก 60 วินาทีและเมื่อกลับมาเปิดแท็บ)
- เพิ่ม 8 จุดที่ริมผังเดิม: เครื่องชงกาแฟ ตู้น้ำ เครื่องปริ้น ตู้เย็น/ขนม ตู้เอกสาร มุมโซฟา มุมต้นไม้ และชั้นหนังสือ ไม่เปลี่ยนโต๊ะ 72 ตัว พื้นที่เดิน หรือฐานข้อมูล Layout; วัตถุอยู่นอกขอบ Grid และมีจุดยืนด้านในที่เข้าถึงได้ หากผังไม่ตรงหรือเส้นทางถูกแก้จะไม่วางจุดที่ใช้ไม่ได้
- คลิกวัตถุในฉากหรือใช้ปุ่มมุมพัก & เพลง เพื่อเดินไปหาโดยใช้ RPC เดินเดิม เมื่อถึงจุดกาแฟ/น้ำ/ขนม/เครื่องปริ้นมีท่าถือแก้วหรือกระดาษจากตำแหน่งปลายทางร่วมกัน มุมโซฟายังเป็นจุดยืนพัก ไม่ใช่ระบบจองที่นั่ง; ยังไม่รองรับเดินไปพร้อมกันโดยไม่ซ้อนกันที่จุดเดียว
- เพลง ambient สร้างจาก Web Audio API เป็นทำนองต้นฉบับ ไม่ดึงเสียงจากภายนอก เปิดเองเมื่อกดปุ่ม ปิดเมื่อสลับออกจากแท็บ ไม่เล่นอัตโนมัติ
- กระดานเสนอไอเดียมุมขวาล่าง: สมาชิกที่มีบัญชีและโต๊ะโพสต์และอ่านได้ทุกคน แสดงชื่อ เวลา และข้อความ (สูงสุด 1,000 ตัวอักษร) เรียงจากใหม่ไปเก่า เก็บใน Supabase ไม่หมดอายุ โหลดครั้งละ 50 รายการและโหลดเก่ากว่าได้ ผู้โพสต์ลบของตัวเองได้ Admin ลบได้ทุกโพสต์; Guest ต้องเข้าสู่ระบบก่อนอ่าน เพื่อรักษาความเป็นส่วนตัวของสมาชิก
- Auto refresh กระดานทุกประมาณ 15 วินาทีขณะเปิดหน้าล่าสุด (เมื่อโหลดหน้าประวัติย้อนไปหลายหน้าให้กดรีเฟรชเอง) ปุ่มรีเฟรชไม่ล้างร่างข้อความ
- มีทะเบียน Scene เริ่มต้น `OC61_WORLD.scenes` สำหรับ `main-office` เท่านั้น เป็นฐานเตรียมโซนใหม่ ยังไม่มีการเดินทางข้ามฉากหรือ Theme Manager
- Migration 19 เพิ่มเฉพาะกระดานไอเดียและ RPC ใหม่ ไม่แก้ข้อมูลบัญชี โต๊ะ แชท หรือระบบ V6.0; ต้องติดตั้ง SQL 18 แบบ Install ก่อน

## What's new — V6.0: Office Productivity

- สะกิดได้ทุกสถานะและฝากสะกิดให้คนออฟไลน์ได้ (เห็นเมื่อกลับมาออนไลน์) ไม่เปลี่ยนสถานะผู้รับและคง cooldown 30 วินาทีต่อคน / 10 ครั้งต่อนาที เมื่อผู้รับว่างหรือติดงานอยู่ที่โต๊ะและผู้ส่งเดินได้ จะเดินไปสะกิดเหมือนเดิม; กรณีอื่นแจ้งเตือนโดยตรง ไม่ดึงคนออกจากห้องประชุมหรือกลุ่มยืนคุย
- กระดานประกาศ: สมาชิกที่เข้าสู่ระบบอ่านได้ ผู้ดูแลเผยแพร่และลบประกาศได้เท่านั้น
- ฝากข้อความที่โต๊ะ: คลิกโต๊ะเพื่อน หรือเลือกผู้รับจากเมนูงานและประกาศ ส่งได้แม้เพื่อนไม่ออนไลน์ ข้อมูลผูกกับบัญชีผู้รับไม่ใช่โต๊ะ ผู้รับกดอ่านแล้วหรือเก็บออกจากกล่องได้ ผู้ส่งตรวจสถานะอ่านได้
- แยกจากแชทเดิม; ไม่ส่งข้อความส่วนตัวผ่าน public snapshot หรือ Realtime signal; แสดงรายการประกาศล่าสุด 50 รายการ กล่องรับสูงสุด 100 รายการ (เลือกข้อความยังไม่อ่านก่อน) และกล่องส่งล่าสุด 50 รายการ
- Run migration 18 check-only แล้ว install หลัง migration 16 และ 17 ที่ commit แล้ว; ไม่แก้ไขผัง บัญชี รหัสผ่าน หรือข้อมูลแชทเดิม

## What's new — V5.4: Natural Movement

- ปรับท่าเดินให้ขยับข้อเข่า ข้อศอก สลับแขนขา และลดจังหวะก้าวก่อนหยุด; เพิ่มการเอนตัวลงนั่งเมื่อถึงเก้าอี้ประชุมและกลับโต๊ะ
- เลี้ยวแบบโค้งและหันตัวแบบค่อยเป็นค่อยไป ตรวจระยะจากเฟอร์นิเจอร์ ผนัง ต้นไม้ และขอบฉากก่อนปรับเส้นทางภาพ
- เมื่อเดินสวนกันบนทางเดินที่มีพื้นที่เพียงพอ ตัวละครเบี่ยงหลบกันเล็กน้อย; งดเบี่ยงบริเวณประตู จุดหมายและพื้นที่แคบ (best effort, not a full collision engine)
- การหลบเป็นการปรับภาพเฉพาะฝั่ง client ไม่เปลี่ยนเส้นทาง/เวลาถึง/การจองตำแหน่งจาก Supabase และไม่เขียนข้อมูลทุกเฟรม
- ขณะเคลื่อนไหว Renderer พยายามอัปเดตสูงสุดประมาณ 30 FPS; เมื่อฉากนิ่งใช้รอบเดิม และเคารพการตั้งค่า reduced motion ของระบบ
- ไม่ต้อง Run SQL ใหม่; ต้องติดตั้ง Migration 16 และ 17 จริงแล้วตามรุ่นก่อนหน้า

## What's new — V5.3.4: Status & Live Sync

- เปิดสถานะเหนือหัวเป็นค่าเริ่มต้น (เปิดให้ผู้ใช้เดิมครั้งแรกด้วย); ปิด/เปิดเองได้ที่มุมขวาล่าง และจำค่าหลังจากนั้น หากไม่มีข้อความจะแสดงเฉพาะไอคอน หากมีจะแสดงไอคอนและข้อความที่พิมพ์เอง Guest ไม่เห็นสถานะ
- Realtime และ polling เดิมยังทำงาน เพิ่มการตรวจข้อมูลกลางและ Inbox ทุก 60 วินาทีโดยไม่ reload หน้าเว็บ; เมื่อกลับมาเปิดแท็บหรือออนไลน์ใหม่จะ sync ทันที
- คลิกไอคอนกลุ่มจากโต๊ะเพื่อขอร่วมฟังได้โดยไม่ต้องเปิดแชทก่อน เมื่อสมาชิกอนุมัติจึงเข้ากลุ่ม เดินไปหา และเปิดแชท; ไม่เห็นข้อความเก่าก่อนเข้าร่วม
- ไม่ต้องเพิ่ม SQL migration หากติดตั้ง Migration 17 (Install) สำเร็จแล้ว

## What's new - V5.3.3: Hall activity messages

- Hall chat displays centered system messages on successful join (including the creator) and leave, stored in the same ordered, private message stream. New members still see only events/messages after their join cutoff.
- Minimize does not leave and does not produce an event. Failed/declined requests and repeated syncs do not produce events. No backfill.
- Run migration 17 check-only and install after committed migration 16; see release instructions.

## What's new — V5.3.2: Chat Dock & Notifications

- ย่อหน้าต่างข้อความด้วยปุ่ม `−` และขยายกลับได้โดยไม่ออกจากกลุ่ม ไม่เปลี่ยนตำแหน่งตัวละคร และไม่ลบร่างข้อความ
- คำเชิญเข้ากลุ่ม คำขอร่วมฟัง และการสะกิด แสดงเป็นการแจ้งเตือนกลางหน้าจอแบบคิว ไม่ซ้อนกัน และตอบรับ/ปฏิเสธได้จาก Pop-up
- ตรวจเส้นทางการขอร่วมฟังกลุ่มกลางโถง: คลิกไอคอนกลุ่ม → ขอเข้าร่วม → สมาชิกคนใดคนหนึ่งอนุมัติ → เดินมารวมกลุ่มและเปิดแชท โดยไม่เห็นข้อความก่อนอนุมัติ
- รายการข้อความแสดงเฉพาะบทสนทนา ไม่เติมรายชื่อพนักงานที่ยังไม่เคยเปิดแชทหรือนำแชทที่ลบกลับมาเป็นรายชื่อเพื่อน
- ใช้ฐานข้อมูล Migration 16 ของ V5.3.1 ต่อได้ ไม่ต้องเพิ่ม Migration ใหม่

## การใช้งาน

| ฟังก์ชัน | วิธีใช้ |
|---|---|
| เข้าระบบ / จองโต๊ะ | เลือกโต๊ะว่าง ลงทะเบียนด้วย Employee ID และรหัสผ่าน |
| กล้อง 3D | ลากเพื่อเลื่อน, Scroll เพื่อซูม, รีเซ็ตหรือเปลี่ยนมุมกล้อง |
| สถานะ | ว่าง, ติดงาน, ห้ามรบกวน, ประชุม, พัก; ไม่อยู่ที่โต๊ะเป็นสถานะอัตโนมัติ |
| ตัวละคร | แต่งตัว เปลี่ยนเพศ ทรงผมและชุด เดินกลับโต๊ะ ทักทายและพูดข้อความสั้น ๆ |
| Private Message | คลิกโต๊ะของเพื่อน → ส่งข้อความ |
| สะกิด | คลิกโต๊ะ → สะกิด ทุกสถานะ; ถ้าออฟไลน์จะได้รับเมื่อเข้าสู่ระบบ |
| ประกาศ | งานและประกาศ → ประกาศ (Admin เผยแพร่/ลบได้) |
| ฝากข้อความ | คลิกโต๊ะเพื่อน → ฝากข้อความที่โต๊ะ; ตรวจกล่องรับ/ที่ส่งไปในเมนูงานและประกาศ |
| กลุ่มงาน | สร้างกลุ่มถาวรและเชิญเพื่อน ไม่บังคับให้ตัวละครเดิน |
| กลุ่มยืนคุย | สร้างกลุ่ม / ตอบรับคำเชิญแล้วเดินมารวมกลุ่มกลางโถง |
| ขอร่วมฟัง | คลิกไอคอนแชทเหนือกลุ่ม รอสมาชิกอนุญาต |
| ย่อหน้าต่าง | `−` ย่อ, `▢` ขยาย; ยังอยู่ในกลุ่มและยังรับข้อความ |
| ปิด / กลับโต๊ะ | `×` ปิดหน้าต่างกลุ่มยืนคุยแล้วออกจากกลุ่ม; กลับโต๊ะก็ออกจากกลุ่ม |
| ลบแชท | `×` ในรายการแชท ล้างเฉพาะประวัติที่ตัวเองเห็น; กลุ่มยืนคุยจะออกและคืนตำแหน่ง |
| มุมพัก & เพลง | คลิกวัตถุในฉากหรือปุ่มขวาล่างเพื่อเดินไปหา; เปิด/ปิดเพลง ambient ได้เอง |
| เสนอไอเดีย | ปุ่มขวาล่าง → โพสต์และอ่านไอเดียของสมาชิก; โหลดข้อความเก่าได้ |
| ตั้งค่า / Admin | รูปเฟือง → เข้าหลังบ้านเมื่อมีสิทธิ์ Admin |

ผังกลางปัจจุบัน: 10 คอลัมน์ × 19 แถว, โต๊ะทำงาน 72 ตัว, ห้องประชุมมี 9 ที่นั่งที่เข้าถึงได้และ 5 จุดยืน; โถงกลางรองรับ 5 กลุ่ม กลุ่มละ 6 คน ตาม Layout ปัจจุบัน

## Technology

- Frontend: HTML, CSS, JavaScript, Three.js (Orthographic camera)
- Hosting: GitHub Pages (branch `main`, root)
- Backend: Supabase Auth, PostgreSQL, RPC, Realtime signals และ polling สำรอง
- Chat: private account-based conversations; database membership checks and history cutoff
- Presence: heartbeat; แยกสถานะออนไลน์จากการจองโต๊ะ

## Deployment / Upgrade

**V6.1.1:** Install SQL 19 first. Run `setup/20-free-grid-layout-check-only.txt` and verify `V6.1.1 CHECK PASSED - ROLLED BACK`; then run `setup/20-free-grid-layout-install.txt` and verify `V6.1.1 READY`, `walk_ready=true`, `rotate_ready=true`. Upload the patch files and the nine new SVGs under `assets/`. Keep existing `layout.js`, `layout.json` and `online-config.js`. No reset. Have all users refresh to V6.1.1 before publishing a layout containing new furniture types (older clients cannot validate them).

**V6.1 (historical):** Run `setup/19-idea-board-check-only.txt` and verify `V6.1 CHECK PASSED - ROLLED BACK`, then `setup/19-idea-board-install.txt` and verify `V6.1 READY`. The dry run validates grants/RLS and, when enabled desk owners are available, posting, shared visibility, unauthorized deletion, idempotent retry and owner/admin deletion in a rolled-back transaction. Then upload the 8 files inside `site/` to repository root. Keep all V6.0 files including `productivity.js`, `productivity.css`, `motion.js`, `online-config.js`, `layout.js`, and `layout.json`. Hard refresh after deploy. Do not upload `setup/` or `qa/`.

**V6.0:** Run `setup/18-productivity-check-only.txt` and verify `V6.0 CHECK PASSED - ROLLED BACK`, then `setup/18-productivity-install.txt` and verify `V6.0 READY`. Dry run includes RPC/privacy smoke tests when two enabled desk owners are available; if only one exists the RLS and permission checks still run. Then upload `site/` to repository root, retaining all earlier files (including `motion.js`). Do not replace `online-config.js`, `layout.js`, or `layout.json`. Hard refresh after GitHub Pages deploys.

**V5.4:** Frontend only. Upload the files in `site/` (including the new `motion.js`); no new SQL. Existing layouts, config, chat, and permissions stay unchanged. Requires V5.3.4 and its previously committed migrations.

**V5.3.4:** Frontend only. Requires committed migration 17 for hall activity messages and migration 16 for hall requests. Upload the files in this release `site/`; no new SQL. If an earlier migration was only dry-run, install that migration before upgrading.

**V5.3.3:** From V5.3.2 (including the password hotfix), run `17-hall-events-check-only.txt` then `17-hall-events-install.txt` from `setup/`. The SQL self-test requires two registered profiles and one free hall zone. It does not retain synthetic test rows; identity sequence gaps can occur. Upload the files in `site/` after install.

**อัปเดตจาก V5.3.1:** ต้องติดตั้ง Migration 16 แบบ Install สำเร็จก่อน (Dry Run ไม่บันทึกฐานข้อมูล) ตรวจด้วยไฟล์ `setup/check-v532-database.txt` ที่มากับชุดอัปเดต หากได้ `V5.3.2 DATABASE READY` และ `database_ready = true` ไม่ต้อง Run SQL อีก หากไม่พร้อมให้ใช้ไฟล์ Migration 16 check-only และ install ตามคู่มือใน ZIP ก่อนอัปโหลดเว็บไซต์

1. สำรอง Layout และ Source เดิมก่อนอัปเดต
2. อัปโหลดไฟล์ในโฟลเดอร์ `site/` จาก ZIP ไปยัง root ของ repository ไม่ต้องอัปโหลดทั้งโฟลเดอร์
3. Commit และรอ GitHub Pages deploy จาก `main / root`
4. เปิดเว็บและกด Ctrl+F5 จากนั้นทดสอบอย่างน้อยสองบัญชี

เก็บ `online-config.js`, `layout.js`, `layout.json`, assets และ CSS/JS อื่นที่ไม่ได้อยู่ในแพตช์เดิมไว้ ไม่อัปโหลดไฟล์ `setup/` หรือ `qa/` ขึ้น GitHub ไม่ต้องสร้างบัญชีใหม่

**Fresh install:** ต้องมีไฟล์ Full Project และ SQL migrations ตามลำดับของรุ่นก่อนหน้า ไม่สามารถติดตั้งจากแพตช์นี้เพียงชุดเดียวได้ ตั้งค่า Supabase Project URL และ publishable key ใน `online-config.js` เท่านั้น ห้ามใส่ service_role key, secret key หรือ database password ใน repo. การลงทะเบียนเปิดแบบ Free Registration จึงไม่ยืนยันตัวตนพนักงานโดยบริษัท เหมาะกับกลุ่มที่ไว้ใจกันก่อน

ตอนลงทะเบียน ให้ตั้งรหัสผ่านสำหรับบัญชีของคุณเองและจำไว้สำหรับเข้าสู่ระบบครั้งถัดไป ไม่ใช่รหัสกลางของออฟฟิศ

รหัสผ่านขั้นต่ำขึ้นกับ Supabase Auth (อย่างน้อย 6 ตัวตามการตั้งค่าที่รองรับ) ไม่บังคับ 8 ตัวจากเว็บไซต์

## Development history

| Version | Feature |
|---|---|
| V3.0 | Three.js office, orthographic camera, layout editor |
| V4.0 | Modern office interface |
| V4.1 | Shared layout, employee accounts, desk assignment and Admin |
| V4.2 | Online presence and personal status |
| V4.3 | Direct messages, group chat, invitations, poke |
| V5.0 | Avatars, customization, walking animation |
| V5.1 | Walk-to-poke, door interaction, meeting seating |
| V5.1.1 | Personal camera angle and optional status bubble |
| V5.2 | Expanded avatar customization, emotes and speech bubbles |
| V5.2.1 | Hall huddles |
| V5.2.2 | Status actions, guest privacy and avatar save fix |
| V5.3 | Hall chat requests and return-to-desk behavior |
| V5.3.1 | Compact hall positions, chat deletion, SQL migration 16 |
| V5.3.2 | Minimized chat dock, central notifications, room-only chat list, password wording hotfix |
| V5.3.3 | Hall join/leave system messages (migration 17) |
| V5.3.4 | Default head status, minute reconciliation, direct hall join request |
| V5.4 | Articulated walking, rounded turns, local clearance-aware passing, sitting transitions |
| V6.0 | All-status pokes, announcement board, private desk notes, read receipts |
| V6.1 | Living Environment, interactive props, Bangkok lighting, ambient audio, persistent idea board (migration 19) |
| **V6.1.1** | Manual placement, persistent fine-grid standing, facing, physical desk visits (migration 20) |

## Roadmap — Virtual Social Office

- V6.1.1 (current): Living Environment + Idea Board + Manual Layout — ให้ Admin เลือกวางเอง; ปรับการเดินและสะกิด
- V6.2: World Expansion — Café & Pantry, Rooftop Garden, Game Room และการเชื่อมต่อโซนพร้อมจำนวนคนออนไลน์
- V6.3: Seasonal World — ธีมเทศกาล Christmas, Songkran, Halloween, Loy Krathong และ Theme Manager
- V6.4: Social Experience — emotes เพิ่ม, interactive actions, ถ่ายภาพหมู่, สัตว์เลี้ยง
- V6.5: Play Together — มินิเกม กิจกรรม Easter eggs
- V6.6: Personalization — แต่งโต๊ะและของสะสม
- V7.0 (exploratory): Virtual Social World / opt-in proximity voice chat

## Current limitations

- Requires a WebGL-capable browser and internet access for CDN modules; 2D fallback exists.
- Chat notifications are in-app only. Inbox polling is approximately every 4 seconds when the page is active; browser throttling or offline devices may delay delivery.
- Chat history is not end-to-end encrypted. Guest cannot read private conversations or member identities from the intended member-only snapshot.
- Standing places are reserved by the backend. V5.4 reduces overlap in open corridors but does not guarantee collision-free walking, especially near doors, crowded groups, and shared goals. The original backend route and desk anchor are preserved; the full seat-to-aisle route is not simulated. Visual offsets may differ temporarily across clients with delayed snapshots. 2D fallback uses the original discrete markers.
- V6.1.1 manually placed props have no dedicated seat/queue reservation; visiting the same point can overlap avatars. The sofa is a standing lounge stop. Glass windows are placeable panels, not automatic city scenery. Fine-grid movement requires a reachable clear coarse-cell center and a clear final segment, not every physically empty sliver around furniture. Manual placement does not automatically guarantee every desk or meeting path remains reachable; avoid blocking aisles.
- Test the deployed app against your own Supabase project before broad rollout. V6.1 was tested with Chromium, mock Supabase and Three.js API double; migration 19 needs the Supabase dry run and live install. Actual WebGL appearance and audio audibility have not been verified on the deployed site.
