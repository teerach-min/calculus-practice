/**
 * Google Apps Script Web App — ตัวรับข้อมูลผู้ใช้เขียนลง Google Sheet
 *
 * ใช้แทน "หลังบ้าน" ของเราเอง: ฟรี ไม่ต้องดูแลเซิร์ฟเวอร์
 * และซ่อน Sheet ID ไว้ในสคริปต์ ไม่หลุดไปอยู่ในโค้ดหน้าเว็บ
 *
 * ขั้นตอนติดตั้งอยู่ใน SETUP.md — สรุปสั้น ๆ
 *   1. สร้าง Google Sheet ใหม่ คัดลอก ID จาก URL มาใส่ SHEET_ID
 *   2. เอา OAuth Client ID ที่สร้างไว้มาใส่ CLIENT_ID
 *   3. Deploy > New deployment > Web app
 *      Execute as: Me   |   Who has access: Anyone
 *   4. คัดลอก URL ที่ลงท้ายด้วย /exec ไปใส่ NEXT_PUBLIC_SHEET_ENDPOINT
 *
 * โครงสร้างชีต Users — 1 แถวต่อ 1 ผู้ใช้ เข้าซ้ำจะอัปเดตทับแถวเดิม
 *   A user_id | B email | C name | D picture
 *   E first_seen | F last_seen | G visits | H time_zone | I language
 */

const SHEET_ID = 'ใส่ Google Sheet ID ตรงนี้';
const CLIENT_ID = 'ใส่ OAuth Client ID ตรงนี้.apps.googleusercontent.com';
const SHEET_NAME = 'Users';

const HEADERS = [
  'user_id',
  'email',
  'name',
  'picture',
  'first_seen',
  'last_seen',
  'visits',
  'time_zone',
  'language',
];

/** เรียกดูสถานะได้จากเบราว์เซอร์เพื่อเช็กว่า deploy สำเร็จ */
function doGet() {
  return json({ ok: true, service: 'calculus-practice user log' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, error: 'empty_body' });
    }

    const body = JSON.parse(e.postData.contents);
    const payload = verifyIdToken(body.credential);
    if (!payload) return json({ ok: false, error: 'invalid_token' });

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      upsertUser(payload, body);
    } finally {
      lock.releaseLock();
    }

    return json({ ok: true, user: payload.email });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/**
 * ตรวจ ID token กับ Google โดยตรง
 * ป้องกันคนยิง endpoint มั่ว ๆ เพื่อใส่ข้อมูลปลอมลงชีต
 */
function verifyIdToken(idToken) {
  if (!idToken) return null;

  const res = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
    { muteHttpExceptions: true },
  );
  if (res.getResponseCode() !== 200) return null;

  const p = JSON.parse(res.getContentText());

  // token ต้องออกให้แอปของเราเท่านั้น
  if (p.aud !== CLIENT_ID) return null;
  // ต้องออกโดย Google จริง
  if (p.iss !== 'accounts.google.com' && p.iss !== 'https://accounts.google.com') {
    return null;
  }
  // ต้องยังไม่หมดอายุ
  if (Number(p.exp) * 1000 < Date.now()) return null;
  if (!p.sub) return null;

  return p;
}

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function upsertUser(payload, body) {
  const sheet = getSheet();
  const now = new Date();
  const lastRow = sheet.getLastRow();

  // หาแถวเดิมจาก user_id (คอลัมน์ A)
  let target = 0;
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(payload.sub)) {
        target = i + 2;
        break;
      }
    }
  }

  const timeZone = body.timeZone || '';
  const language = body.language || '';

  if (target === 0) {
    sheet.appendRow([
      payload.sub,
      payload.email || '',
      payload.name || '',
      payload.picture || '',
      now,
      now,
      1,
      timeZone,
      language,
    ]);
    return;
  }

  const visits = Number(sheet.getRange(target, 7).getValue()) || 0;
  // อัปเดตทับ: ชื่อ/รูปอาจเปลี่ยน, last_seen และจำนวนครั้งเพิ่มขึ้น
  sheet
    .getRange(target, 2, 1, 3)
    .setValues([[payload.email || '', payload.name || '', payload.picture || '']]);
  sheet.getRange(target, 6).setValue(now);
  sheet.getRange(target, 7).setValue(visits + 1);
  sheet.getRange(target, 8, 1, 2).setValues([[timeZone, language]]);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
