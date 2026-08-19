# ตั้งค่า Google Login + บันทึกลง Google Sheet

ระบบนี้ **ไม่มีหลังบ้านของเราเอง** เว็บเป็นไฟล์ static ล้วน ๆ
งานที่ปกติต้องมีเซิร์ฟเวอร์ ถูกยกไปให้บริการฟรีของ Google แทน

```
เบราว์เซอร์ ──(1) ขอ ID token──▶ Google Identity Services
     │
     └──(2) POST token──▶ Apps Script Web App ──(3) ตรวจ token กับ Google
                                    │
                                    └──(4) เขียนแถวลง Google Sheet

คะแนน/สถิติ ──▶ localStorage ในเครื่องผู้เล่น (ไม่ออกไปไหน)
```

ทำตาม 4 ขั้นนี้ ใช้เวลาราว 15 นาที

---

## ขั้นที่ 1 — สร้าง Google Sheet

1. เปิด [sheets.new](https://sheets.new) สร้างชีตใหม่ ตั้งชื่ออะไรก็ได้
2. คัดลอก **Sheet ID** จาก URL — คือส่วนที่อยู่ระหว่าง `/d/` กับ `/edit`

   ```
   https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit
                                          └────── Sheet ID ──────┘
   ```

ไม่ต้องสร้างหัวตารางเอง สคริปต์จะสร้างชีตชื่อ `Users` พร้อมหัวตารางให้อัตโนมัติ

---

## ขั้นที่ 2 — สร้าง OAuth Client ID

1. เข้า [Google Cloud Console](https://console.cloud.google.com/) แล้วสร้างโปรเจกต์ใหม่
2. ไปที่ **APIs & Services → OAuth consent screen**
   - User type เลือก **External** แล้วกด Create
   - กรอกชื่อแอป อีเมลผู้ติดต่อ อีเมลนักพัฒนา — ที่เหลือข้ามได้
   - ในหน้า **Scopes** ไม่ต้องเพิ่มอะไร (แค่ชื่อ/อีเมล/รูป ได้มาโดยอัตโนมัติ)
   - ถ้าปล่อยสถานะเป็น *Testing* จะล็อกอินได้เฉพาะอีเมลที่ใส่ไว้ใน **Test users**
     ถ้าจะให้ใครก็เข้าได้ ให้กด **Publish app**
3. ไปที่ **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins** — ใส่ทุก origin ที่จะเปิดเว็บนี้

     | ใช้ตอนไหน | ใส่ค่า |
     |-----------|--------|
     | พัฒนาในเครื่อง | `http://localhost:3000` |
     | GitHub Pages (user site) | `https://teerach-min.github.io` |

     > ใส่แค่ scheme + host + port เท่านั้น **ห้ามมี path ต่อท้าย**
     > เช่น `https://teerach-min.github.io` ถูก แต่
     > `https://teerach-min.github.io/calculus-practice` ผิด

   - **Authorized redirect URIs** ไม่ต้องใส่ (ระบบนี้ไม่ใช้ redirect)
4. คัดลอก **Client ID** ที่ลงท้ายด้วย `.apps.googleusercontent.com`

---

## ขั้นที่ 3 — Deploy Apps Script

1. เปิด [script.new](https://script.new) จะได้โปรเจกต์ Apps Script ใหม่
2. ลบโค้ดเดิมทิ้ง แล้ววางเนื้อหาจากไฟล์ [`apps-script/Code.gs`](apps-script/Code.gs) ลงไปทั้งหมด
3. แก้ 2 บรรทัดบนสุด

   ```js
   const SHEET_ID  = 'Sheet ID จากขั้นที่ 1';
   const CLIENT_ID = 'Client ID จากขั้นที่ 2';
   ```

4. กด **Deploy → New deployment**
   - ไอคอนเฟือง เลือก **Web app**
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` ← สำคัญมาก ถ้าเลือกผิดจะเขียนชีตไม่ได้
   - กด Deploy แล้วอนุญาตสิทธิ์ (จะมีหน้าเตือน "ยังไม่ได้ตรวจสอบ" ให้กด
     *Advanced → Go to … (unsafe)* เพราะเป็นสคริปต์ของเราเอง)
5. คัดลอก **Web app URL** ที่ลงท้ายด้วย `/exec`

ทดสอบว่าใช้ได้: เปิด URL นั้นในเบราว์เซอร์ ควรได้

```json
{"ok":true,"service":"calculus-practice user log"}
```

> **แก้โค้ดทีหลังต้อง deploy ใหม่ทุกครั้ง** — ใช้ *Deploy → Manage deployments →*
> ไอคอนดินสอ → Version: *New version* → Deploy เพื่อให้ URL เดิมยังใช้ได้

---

## ขั้นที่ 4 — ใส่ค่าลงโปรเจกต์

สร้างไฟล์ `.env.local` (คัดลอกจาก `.env.example`)

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com
NEXT_PUBLIC_SHEET_ENDPOINT=https://script.google.com/macros/s/AKfy.../exec
```

แล้วรัน

```bash
npm run dev
```

เปิด http://localhost:3000 จะเจอหน้าเข้าสู่ระบบ ล็อกอินแล้วกลับไปดูชีต
ควรมีแถวใหม่โผล่มา

> ถ้ายังไม่ได้ตั้ง `NEXT_PUBLIC_GOOGLE_CLIENT_ID` เว็บจะเข้า **โหมดทดลอง** —
> เล่นได้ทันทีโดยไม่ต้องล็อกอิน มีแถบสีเหลืองเตือนไว้ด้านบน สะดวกตอนพัฒนา

---

## Deploy ขึ้น GitHub Pages

โปรเจกต์ตั้ง `output: 'export'` ไว้แล้ว `npm run build` จะได้โฟลเดอร์ `out/`
เป็นไฟล์ static ล้วน และมี workflow `.github/workflows/deploy.yml` ที่ build
แล้วส่งขึ้น Pages ให้อัตโนมัติทุกครั้งที่ push เข้า `main`

### สิ่งที่ต้องตั้งบน GitHub (ทำครั้งเดียว)

1. **Settings -> Pages -> Build and deployment -> Source** เลือก **GitHub Actions**
   (ไม่ใช่ "Deploy from a branch")
2. **Settings -> Secrets and variables -> Actions -> Variables** กด *New repository variable*

   | ชื่อ | ค่า | จำเป็นไหม |
   |------|-----|-----------|
   | `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` | ถ้าไม่ตั้ง เว็บจะขึ้นโหมดทดลอง (ข้ามล็อกอิน) |
   | `SHEET_ENDPOINT` | `https://script.google.com/macros/s/.../exec` | ถ้าไม่ตั้ง จะไม่บันทึกลงชีต |
   | `BASE_PATH` | เช่น `/calculus-practice` | **ไม่ต้องตั้ง** — workflow อ่านจากชื่อ repo ให้เอง |

   > ใช้ **Variables** ไม่ใช่ **Secrets** เพราะค่า `NEXT_PUBLIC_*` ถูกฝังลงไฟล์
   > JavaScript ตอน build อยู่แล้ว ใครก็เปิดดูได้ ไม่ใช่ความลับ
   > (ดูหัวข้อความปลอดภัยด้านล่าง)

3. **Google Cloud Console -> Credentials -> OAuth client -> Authorized JavaScript origins**
   เพิ่ม `https://<user>.github.io`

   ใส่แค่ scheme + host **ห้ามมี path ต่อท้าย** — ถึงเว็บจะอยู่ที่
   `https://<user>.github.io/calculus-practice/` ก็ใส่แค่ `https://<user>.github.io`

### base path ตั้งให้อัตโนมัติแล้ว

จุดที่พังบ่อยที่สุดของ Next.js บน GitHub Pages คือ base path ไม่ตรงกับชื่อ repo
ทำให้ไฟล์ใน `_next/` โหลดไม่ขึ้น เว็บออกมาเป็นหน้าขาว workflow จึงคำนวณให้เอง

| repo | URL ที่ได้ | base path |
|------|-----------|-----------|
| `calculus-practice` | `https://<user>.github.io/calculus-practice/` | `/calculus-practice` |
| `calculus-practice-web` | `https://<user>.github.io/calculus-practice-web/` | `/calculus-practice-web` |
| `<user>.github.io` | `https://<user>.github.io/` | ว่าง (อยู่ที่ราก) |

ย้าย repo หรือเปลี่ยนชื่อ ก็ไม่ต้องแก้อะไร ถ้าอยากกำหนดเองให้ตั้ง variable
`BASE_PATH` (ใส่ `/` ถ้าต้องการให้อยู่ที่ราก)

### ขั้นตอน deploy

```bash
git add -A
git commit -m "deploy"
git push origin main
```

แล้วไปดูที่แท็บ **Actions** ของ repo — job `build` จะ typecheck, รันเทสต์เฉลย 720 โจทย์,
build แล้ว job `deploy` จะปล่อยขึ้น Pages ใช้เวลาราว 2 นาที
URL จริงจะโชว์อยู่ในผลลัพธ์ของ job `deploy`

ถ้าเทสต์ไม่ผ่าน workflow จะหยุดก่อน ไม่ปล่อยของเสียขึ้นเว็บ

### build เองในเครื่อง (ถ้าอยากลองก่อน push)

```bash
NEXT_PUBLIC_BASE_PATH=/calculus-practice npm run build
touch out/.nojekyll

# ต้องเสิร์ฟใต้โฟลเดอร์ชื่อเดียวกับ base path ถึงจะเหมือนของจริง
mkdir -p /tmp/pages && cp -r out /tmp/pages/calculus-practice
cd /tmp/pages && python3 -m http.server 3200
# เปิด http://localhost:3200/calculus-practice/
```

---

## ความปลอดภัย — สิ่งที่ควรรู้

**Client ID กับ Apps Script URL เปิดเผยได้** ทั้งคู่ถูกฝังในไฟล์ JavaScript
ที่ทุกคนโหลดไปอ่านได้ ความปลอดภัยจริง ๆ มาจาก 2 ชั้นนี้

1. **Authorized JavaScript origins** — Google จะออก token ให้เฉพาะหน้าเว็บ
   ที่รันอยู่บน origin ที่คุณอนุญาตไว้เท่านั้น คนอื่นเอา Client ID ไปใช้บนโดเมน
   ตัวเองไม่ได้
2. **Apps Script ตรวจ token ทุกครั้ง** — ฟังก์ชัน `verifyIdToken()` ยิงไปถาม
   Google ว่า token นี้จริงไหม ออกให้แอปเราไหม (`aud`) ออกโดย Google ไหม (`iss`)
   และหมดอายุหรือยัง (`exp`) ถ้าไม่ผ่านข้อใดข้อหนึ่งจะไม่เขียนลงชีตเลย

ที่ระบบนี้ **ไม่ได้** ให้คือการยืนยันตัวตนระดับที่วางใจได้เต็มร้อย —
เพราะ session เก็บใน localStorage ผู้ใช้แก้เองได้ ถ้าจะทำระบบให้คะแนน
ที่มีผลจริง (เช่น ตัดเกรด) ต้องมีหลังบ้านจริงมาตรวจซ้ำ
สำหรับการฝึกทำโจทย์และดูว่ามีใครเข้ามาใช้บ้าง เท่านี้เพียงพอ

**ข้อจำกัดโควตา Apps Script** — บัญชีฟรีเขียนได้ราว 20,000 ครั้ง/วัน
เว็บนี้บันทึกแค่วันละครั้งต่อผู้ใช้ (มี `alreadyLoggedToday` กันไว้) จึงเหลือเฟือ

---

## แก้ปัญหาที่เจอบ่อย

| อาการ | สาเหตุที่พบบ่อย |
|-------|-----------------|
| ปุ่ม Google ไม่ขึ้นเลย | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` ว่าง หรือ build ก่อนใส่ค่า — ค่า `NEXT_PUBLIC_*` ฝังตอน build ต้อง build ใหม่ |
| ขึ้น `origin_mismatch` / `idpiframe_initialization_failed` | origin ที่เปิดอยู่ไม่ตรงกับ Authorized JavaScript origins (ระวัง `http` กับ `https` และเลข port) |
| ล็อกอินผ่านแต่ชีตไม่มีข้อมูล | Apps Script deploy เป็น *Who has access: Anyone* หรือยัง / `CLIENT_ID` ในสคริปต์ตรงกับของจริงไหม / แก้โค้ดแล้ว deploy version ใหม่หรือยัง |
| Console ขึ้น CORS error | ปกติของ Apps Script — โค้ดจะ fallback เป็น `no-cors` ให้เอง ข้อมูลยังเข้าชีตอยู่ ลองรีเฟรชชีตดู |
| เข้าได้แค่บางอีเมล | OAuth consent screen ยังเป็น *Testing* — เพิ่ม Test users หรือกด Publish app |
| เว็บขึ้นหน้าขาว / `_next/...` 404 | base path ไม่ตรงกับชื่อ repo — workflow คำนวณให้อัตโนมัติแล้ว ถ้าเคยตั้ง variable `BASE_PATH` ไว้ผิด ให้ลบทิ้ง |
| Actions ผ่านแต่เว็บ 404 ทั้งหน้า | Settings → Pages → Source ยังเป็น *Deploy from a branch* ต้องเปลี่ยนเป็น *GitHub Actions* |
| Actions ล้มที่ขั้น `configure-pages` | repo เป็น private บนแพ็กเกจฟรี — Pages ใช้ได้เฉพาะ repo public |
| คะแนนหาย | ล้างข้อมูลเบราว์เซอร์ / เปิดโหมดไม่ระบุตัวตน / เปลี่ยนเครื่อง — คะแนนอยู่ใน localStorage เท่านั้น |

---

## ถ้าอยากเก็บคะแนนขึ้นชีตด้วย

ตอนนี้ชีตเก็บแค่ตัวผู้ใช้ ถ้าอยากให้คะแนนขึ้นไปด้วย

1. เพิ่มคอลัมน์ใน `HEADERS` ของ `Code.gs` เช่น `'total_correct', 'total_attempts'`
2. รับค่าจาก `body` ใน `upsertUser()` แล้วเขียนลงคอลัมน์ใหม่
3. ฝั่งเว็บ ส่ง `progress.totals` เพิ่มไปใน `logVisit()` (`src/lib/sheet.ts`)
   และเรียก `logVisit` อีกครั้งตอนผู้ใช้ปิดหน้า หรือทุก ๆ N ข้อ

ข้อควรระวัง: ค่านี้ผู้ใช้แก้ใน localStorage ได้ จึงใช้ดูภาพรวมได้
แต่ไม่ควรใช้ตัดสินคะแนนจริง
