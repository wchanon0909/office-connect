# Office Connect — V5.4

Virtual Office สำหรับเพื่อนร่วมงาน: ผังออฟฟิศ 3D แบบ Orthographic, ตัวละคร, สถานะออนไลน์ และแชทแบบส่วนตัว พร้อมกลุ่มยืนคุยกลางโถงที่เชื่อมกับการเคลื่อนไหวของตัวละคร

[เปิด Office Connect](https://wchanon0909.github.io/office-connect/)

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
| กลุ่มงาน | สร้างกลุ่มถาวรและเชิญเพื่อน ไม่บังคับให้ตัวละครเดิน |
| กลุ่มยืนคุย | สร้างกลุ่ม / ตอบรับคำเชิญแล้วเดินมารวมกลุ่มกลางโถง |
| ขอร่วมฟัง | คลิกไอคอนแชทเหนือกลุ่ม รอสมาชิกอนุญาต |
| ย่อหน้าต่าง | `−` ย่อ, `▢` ขยาย; ยังอยู่ในกลุ่มและยังรับข้อความ |
| ปิด / กลับโต๊ะ | `×` ปิดหน้าต่างกลุ่มยืนคุยแล้วออกจากกลุ่ม; กลับโต๊ะก็ออกจากกลุ่ม |
| ลบแชท | `×` ในรายการแชท ล้างเฉพาะประวัติที่ตัวเองเห็น; กลุ่มยืนคุยจะออกและคืนตำแหน่ง |
| ตั้งค่า / Admin | รูปเฟือง → เข้าหลังบ้านเมื่อมีสิทธิ์ Admin |

ผังกลางปัจจุบัน: 10 คอลัมน์ × 19 แถว, โต๊ะทำงาน 72 ตัว, ห้องประชุมมี 9 ที่นั่งที่เข้าถึงได้และ 5 จุดยืน; โถงกลางรองรับ 5 กลุ่ม กลุ่มละ 6 คน ตาม Layout ปัจจุบัน

## Technology

- Frontend: HTML, CSS, JavaScript, Three.js (Orthographic camera)
- Hosting: GitHub Pages (branch `main`, root)
- Backend: Supabase Auth, PostgreSQL, RPC, Realtime signals และ polling สำรอง
- Chat: private account-based conversations; database membership checks and history cutoff
- Presence: heartbeat; แยกสถานะออนไลน์จากการจองโต๊ะ

## Deployment / Upgrade

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
| **V5.4** | Articulated walking, rounded turns, local clearance-aware passing, sitting transitions |

## Roadmap

- V5.3.x: stabilize live hall chat, invitations, notifications, real-world UI testing
- V5.4: natural motion and local clearance-aware steering; validate on the actual WebGL site
- V5.4.x (optional): full chair-to-aisle paths and coordinated crowd navigation, if needed
- V6.0 (planned): office productivity features (scope to be agreed)

## Current limitations

- Requires a WebGL-capable browser and internet access for CDN modules; 2D fallback exists.
- Chat notifications are in-app only. Inbox polling is approximately every 4 seconds when the page is active; browser throttling or offline devices may delay delivery.
- Chat history is not end-to-end encrypted. Guest cannot read private conversations or member identities from the intended member-only snapshot.
- Standing places are reserved by the backend. V5.4 reduces overlap in open corridors but does not guarantee collision-free walking, especially near doors, crowded groups, and shared goals. The original backend route and desk anchor are preserved; the full seat-to-aisle route is not simulated. Visual offsets may differ temporarily across clients with delayed snapshots. 2D fallback uses the original discrete markers.
- Test the deployed app against your own Supabase project before broad rollout. No live database connection or WebGL screenshot was verified for this patch.
