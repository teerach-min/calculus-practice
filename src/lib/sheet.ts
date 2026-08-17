/**
 * ส่งข้อมูลผู้ใช้ไปเก็บใน Google Sheet ผ่าน Apps Script Web App
 *
 * ไม่มีหลังบ้านของเราเอง — Apps Script ทำหน้าที่เป็น endpoint ฟรี
 * ที่ตรวจสอบ ID token กับ Google แล้วเขียนลงชีต (ดู apps-script/Code.gs)
 *
 * ข้อควรรู้เรื่อง CORS: เราส่งเป็น Content-Type: text/plain เพื่อให้เป็น
 * "simple request" เบราว์เซอร์จะได้ไม่ยิง preflight (OPTIONS) ซึ่ง Apps Script
 * ตอบไม่ได้ ถ้ายังติดอยู่ดี จะ fallback เป็น no-cors แบบยิงแล้วไม่อ่านผล
 */

export const SHEET_ENDPOINT = process.env.NEXT_PUBLIC_SHEET_ENDPOINT ?? '';
export const SHEET_CONFIGURED = SHEET_ENDPOINT.length > 0;

export type LogResult = 'ok' | 'skipped' | 'sent-blind' | 'failed';

/** คีย์กันยิงซ้ำในวันเดียวกัน (ลดจำนวนครั้งที่เขียนชีต) */
const LAST_LOG_KEY = 'calcpractice:lastSheetLog';

function alreadyLoggedToday(sub: string): boolean {
  try {
    const raw = window.localStorage.getItem(LAST_LOG_KEY);
    if (!raw) return false;
    const { sub: prev, day } = JSON.parse(raw) as { sub: string; day: string };
    return prev === sub && day === new Date().toISOString().slice(0, 10);
  } catch {
    return false;
  }
}

function markLoggedToday(sub: string) {
  try {
    window.localStorage.setItem(
      LAST_LOG_KEY,
      JSON.stringify({ sub, day: new Date().toISOString().slice(0, 10) }),
    );
  } catch {
    /* ไม่เป็นไร */
  }
}

/**
 * บันทึกการเข้าใช้งานลงชีต — 1 แถวต่อ 1 ผู้ใช้ เข้าซ้ำจะอัปเดตทับ
 *
 * @param credential ID token ดิบจาก Google (ต้องสดใหม่ Apps Script จะตรวจอายุ)
 * @param force ยิงทุกครั้งแม้จะเคยยิงไปแล้ววันนี้
 */
export async function logVisit(
  credential: string,
  options: { force?: boolean; sub?: string } = {},
): Promise<LogResult> {
  if (!SHEET_CONFIGURED) return 'skipped';
  if (options.sub && !options.force && alreadyLoggedToday(options.sub)) {
    return 'skipped';
  }

  const body = JSON.stringify({
    credential,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
  });

  try {
    const res = await fetch(SHEET_ENDPOINT, {
      method: 'POST',
      // text/plain ทำให้เป็น simple request → ไม่มี preflight
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      redirect: 'follow',
    });
    if (res.ok) {
      if (options.sub) markLoggedToday(options.sub);
      return 'ok';
    }
  } catch {
    /* ตกลงมาลอง no-cors ข้างล่าง */
  }

  try {
    await fetch(SHEET_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    });
    if (options.sub) markLoggedToday(options.sub);
    return 'sent-blind';
  } catch {
    return 'failed';
  }
}
