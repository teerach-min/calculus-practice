/**
 * ตรวจหน้าสรุปสูตร /reference
 *  - ทุกสมการต้องเรนเดอร์ผ่าน KaTeX ไม่มี error
 *  - ครบทั้ง 9 หัวข้อ และลิงก์สารบัญเลื่อนไปถูกที่
 *  - สลับไปมาระหว่างหน้าแบบฝึกหัดกับหน้าสรุปได้
 *
 * รัน: node scripts/verify-reference.mjs   (ต้อง serve out/ ที่ port 3100 ก่อน)
 */
import { chromium } from 'playwright';

const BASE = process.env.URL || 'http://localhost:3100';

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e.message)));

const problems = [];

await page.goto(`${BASE}/reference/`, { waitUntil: 'networkidle' });

/* ---------- โครงหน้า ---------- */
const sections = await page.locator('.ref-section').count();
if (sections !== 9) problems.push(`ควรมี 9 หัวข้อ แต่พบ ${sections}`);

const tocLinks = await page.locator('.nav-item').count();
if (tocLinks !== 9) problems.push(`สารบัญควรมี 9 รายการ แต่พบ ${tocLinks}`);

for (let i = 1; i <= 9; i++) {
  if ((await page.locator(`#s${i}`).count()) === 0) {
    problems.push(`ไม่พบ section #s${i}`);
  }
}

/* ---------- สมการ ---------- */
const katexCount = await page.locator('.katex').count();
if (katexCount < 150) {
  problems.push(`สมการน้อยผิดปกติ (พบ ${katexCount} ตัว)`);
}

const errCount = await page.locator('.katex-error').count();
if (errCount > 0) {
  const texts = await page.locator('.katex-error').allTextContents();
  problems.push(`KaTeX error ${errCount} จุด → ${texts.slice(0, 5).join(' | ')}`);
}

// ต้องไม่มี $ หลุดออกมาเป็นข้อความดิบ (แปลว่าแยกสูตรพลาด)
const body = await page.locator('.ref-main').innerText();
const strayDollars = (body.match(/\$/g) || []).length;
if (strayDollars > 0) {
  const around = body.slice(Math.max(0, body.indexOf('$') - 60), body.indexOf('$') + 60);
  problems.push(`พบ $ หลุดเป็นข้อความ ${strayDollars} ตัว รอบ ๆ: "${around}"`);
}

// สมการที่ควรมีอยู่จริง (สุ่มเช็คเนื้อหาสำคัญ)
const mustHave = [
  'ลิมิตของฟังก์ชัน',
  'สี่แบบของการหาค่าลิมิต',
  'สูตรอนุพันธ์ สรุป',
  'สูตรการอินทิเกรต',
  'Gradient Descent',
  'ขอบเขตเนื้อหา',
];
for (const t of mustHave) {
  if (!body.includes(t)) problems.push(`ไม่พบเนื้อหา "${t}"`);
}

/* ---------- \n ระหว่างสูตรสองอันต้องขึ้นบรรทัดใหม่จริง ---------- */
const stepLines = await page
  .locator('#s6 .ref-steps-dark .step-body')
  .first()
  .innerText();
if (!stepLines.includes('\n')) {
  problems.push(`ขั้นตอนไม่ขึ้นบรรทัดใหม่ระหว่างสมการ: "${stepLines}"`);
}
const brCount = await page.locator('#s6 .ref-steps-dark .step-body br').count();
if (brCount < 4) {
  problems.push(`ขั้นตอนในตัวอย่างควรมีการขึ้นบรรทัดหลายจุด แต่พบ <br> แค่ ${brCount}`);
}

/* ---------- สารบัญ ---------- */
await page.locator('.nav-item').nth(6).click();
await page.waitForTimeout(700);
const activeAfterClick = await page
  .locator('.nav-item[aria-current="true"]')
  .textContent();
if (!activeAfterClick?.includes('อินทิเกรต')) {
  problems.push(`สารบัญไม่ไฮไลต์หัวข้อที่เลื่อนไป (ได้ "${activeAfterClick}")`);
}

/* ---------- ลิงก์ข้ามหน้า ---------- */
await page.locator('.ref-cta').click();
await page.waitForURL(/\/(index\.html)?$|\/$/, { timeout: 10000 }).catch(() => {});
await page.waitForTimeout(500);
if ((await page.locator('.nav-list').count()) === 0) {
  problems.push('กดปุ่มท้ายหน้าแล้วไม่ไปหน้าแบบฝึกหัด');
}

await page.waitForTimeout(600); // ให้ React hydrate ก่อน ไม่งั้นคลิกจะถูก replay ทีหลัง
await page.getByRole('link', { name: /สรุปสูตรและนิยาม/ }).click();
await page.waitForTimeout(700);
if ((await page.locator('.ref-section').count()) !== 9) {
  problems.push('กดปุ่มจากหน้าแบบฝึกหัดแล้วไม่กลับมาหน้าสรุปสูตร');
}

await page.screenshot({ path: 'shot-reference.png', fullPage: true });

/* ---------- จอเล็ก ---------- */
await page.setViewportSize({ width: 390, height: 900 });
await page.waitForTimeout(300);
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
if (overflow > 2) problems.push(`หน้าล้นแนวนอนบนจอเล็ก ${overflow}px`);
await page.screenshot({ path: 'shot-reference-mobile.png', fullPage: true });

await browser.close();

console.log(`สมการที่เรนเดอร์: ${katexCount} ตัว`);
if (pageErrors.length) {
  console.log('page errors:');
  pageErrors.slice(0, 5).forEach((e) => console.log('  -', e));
}
if (problems.length) {
  console.log(`\n❌ พบปัญหา ${problems.length} รายการ:`);
  problems.forEach((p) => console.log('  -', p));
  process.exit(1);
}
console.log('\n✅ หน้าสรุปสูตรผ่านทั้งหมด');
