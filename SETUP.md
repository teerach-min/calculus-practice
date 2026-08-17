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
เป็นไฟล์ static ล้วน

### กรณีที่ 1 — user site (`teerach-min.github.io`)

ถ้าเว็บอยู่ที่ root ของโดเมน ไม่ต้องตั้ง base path

```bash
npm run build          # ได้ out/
```

เอาไฟล์ใน `out/` ไปวางใน repo `teerach-min.github.io`

### กรณีที่ 2 — project site (`teerach-min.github.io/calculus-practice`)

ต้องบอก Next.js ว่าเว็บอยู่ใต้โฟลเดอร์ย่อย

```bash
NEXT_PUBLIC_BASE_PATH=/calculus-practice npm run build
```

แล้วเอา `out/` ไปวางที่ branch `gh-pages` ของ repo นั้น
อย่าลืมสร้างไฟล์ว่างชื่อ `.nojekyll` ไว้ใน `out/` ด้วย ไม่งั้น GitHub Pages
จะมองข้ามโฟลเดอร์ `_next/`

```bash
touch out/.nojekyll
```

### ตัวอย่าง GitHub Actions

```yaml
name: Deploy
on:
  push: { branches: [main] }
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_GOOGLE_CLIENT_ID: ${{ vars.GOOGLE_CLIENT_ID }}
          NEXT_PUBLIC_SHEET_ENDPOINT: ${{ vars.SHEET_ENDPOINT }}
          NEXT_PUBLIC_BASE_PATH: ${{ vars.BASE_PATH }}
      - run: touch out/.nojekyll
      - uses: actions/upload-pages-artifact@v3
        with: { path: out }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

ตั้งค่า `GOOGLE_CLIENT_ID`, `SHEET_ENDPOINT`, `BASE_PATH` ที่
**Settings → Secrets and variables → Actions → Variables**

> ค่าเหล่านี้ใช้ `vars` ไม่ใช่ `secrets` เพราะยังไงก็ถูกฝังลงไฟล์ static
> และเปิดเผยได้อยู่แล้ว — ดูหัวข้อความปลอดภัยด้านล่าง

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
