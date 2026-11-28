# My Office

**Your workspace. Your people. Your little virtual world.**

**พื้นที่ของคุณ เพื่อนร่วมงานของคุณ และโลกใบเล็ก ๆ ที่เราได้ใช้ร่วมกัน**

My Office is a browser-based virtual social workspace for GFE & GOE. It brings colleagues together in a shared 3D office where everyday communication, presence and optional playful interactions feel more personal.

My Office คือออฟฟิศเสมือนสำหรับ GFE & GOE ที่ใช้งานผ่านเว็บเบราว์เซอร์ ให้เพื่อนร่วมงานได้พบปะ พูดคุย สร้างตัวตน และสนุกกับกิจกรรมเล็ก ๆ ในพื้นที่ 3 มิติร่วมกัน เพื่อให้การติดต่อกันในแต่ละวันเป็นธรรมชาติและใกล้ชิดยิ่งขึ้น

[Open My Office](https://wchanon0909.github.io/office-connect/) · [Changelog](CHANGELOG.md) · [Development](docs/DEVELOPMENT.md) · [Deployment](docs/DEPLOYMENT.md) · [Project Knowledge & AI Handover](docs/PROJECT-KNOWLEDGE.md)

![Release](https://img.shields.io/badge/release-v1.0-2563eb) ![Frontend](https://img.shields.io/badge/frontend-HTML%20%2F%20CSS%20%2F%20JS-475569) ![Hosting](https://img.shields.io/badge/hosting-GitHub%20Pages-24292f)

## Features

- Shared 3D office, customizable avatars, desk assignments, movement and online presence.
- Account-based direct and group chat, temporary hall conversations and social gestures.
- Admin-managed layouts, office themes, announcements and community boards.
- Optional daily and weekly quests, Coins, desk decoration and a personal Desk Studio.
- Friendship progression, achievements, saved outfits and a first-use tutorial.
- Shared moments, Post-it board, food wheel and guest-friendly login controls.
- Responsive controls and a 2D scene fallback.

## Design principles

### Connection — การเชื่อมโยงกัน

Make everyday conversations and social interactions natural and accessible. My Office is a social space, not an employee productivity monitoring tool.

สร้างพื้นที่ให้เพื่อนร่วมงานได้พบปะ พูดคุย และมีปฏิสัมพันธ์กันอย่างเป็นธรรมชาติ ไม่ใช่เครื่องมือสำหรับติดตามหรือประเมินการทำงานของพนักงาน

### Personalization — การสร้างตัวตน

Give users the freedom to express themselves through their avatars, desks and collections while keeping the shared office at the centre of the experience.

เปิดโอกาสให้ทุกคนสร้างตัวตนผ่านตัวละคร โต๊ะทำงาน และของสะสมในแบบของตัวเอง โดยยังคงให้ออฟฟิศส่วนกลางเป็นหัวใจของประสบการณ์

### Play at your own pace — สนุกได้ตามความสมัครใจ

Quests, Coins, achievements and social activities are optional. Participation is never a requirement for ordinary office use.

เควส เหรียญ ความสำเร็จ และกิจกรรมต่าง ๆ เป็นทางเลือกสำหรับคนที่สนใจ ทุกคนยังสามารถใช้งานออฟฟิศและพูดคุยกับเพื่อนได้ตามปกติ แม้ไม่เข้าร่วมกิจกรรมเหล่านี้

### Performance and continuity — ประสิทธิภาพและความต่อเนื่อง

Improve responsiveness without unnecessarily sacrificing visual quality. Develop incrementally, preserve existing workflows and user data, and validate changes before release.

พัฒนาให้เว็บไซต์ตอบสนองได้ดีขึ้นโดยไม่ลดคุณภาพกราฟิกโดยไม่จำเป็น ต่อยอดระบบทีละส่วน รักษารูปแบบการใช้งานและข้อมูลเดิม พร้อมตรวจสอบการเปลี่ยนแปลงก่อนเผยแพร่


## Technology

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript |
| Scene | Three.js, orthographic camera |
| Backend | Supabase Auth, PostgreSQL RPC, Realtime and fallback polling |
| Hosting | GitHub Pages, main branch / root (as documented in the source snapshot) |

## Repository structure

```text
index.html          Application entry point
assets/             Original SVGs and brand images
css/                Stylesheets
js/core/            Application, view and movement
js/scene/           Rendering and world interactions
js/layout/          Layout editing and room geometry
js/services/        Backend, messaging and hall coordination
js/social/          Social actions, friendship and personalization
js/features/        Quests, desk studio, boards and other features
js/ui/              Theme and interface controls
js/config/          Public browser configuration
data/               Default layout in JS and JSON formats
docs/               Development, deployment and archived release notes
```

## Run locally

No package installation or build step is required. From the repository root, run `python -m http.server 8000` and open `http://localhost:8000/`. External CDN modules and Supabase require internet access. The included public configuration points at the existing backend; use a staging project for tests involving writes.

## Release v1.0

This repository organization update preserves the supplied v1.0 frontend, including the hall-zone and login/chat-dock hotfixes. No database migration, data reset or domain change is introduced by this refactor. The existing backend must already support the deployed frontend (historical notes reference SQL 40 FIX2 and SQL 41). SQL migration files are not included in the supplied snapshot; this is not a standalone backend installer.

See [CHANGELOG.md](CHANGELOG.md) for development milestones, [archived release notes](docs/RELEASE-HISTORY.md) for historical instructions, and [Project Knowledge & AI Handover](docs/PROJECT-KNOWLEDGE.md) for requirements, architectural decisions, lessons learned and development continuity. Do not rerun historical SQL just to reorganize this repository.

## Limitations and privacy

Chat is not end-to-end encrypted. Online features depend on the configured backend and network availability. Browser throttling may delay updates. Guest access and member permissions depend on deployed backend policies. Do not commit service-role keys, passwords or private exports. No new license is asserted by this release.
