/**
 * สคริปต์ตรวจสอบ: เปิดเว็บจริงด้วย Chromium แล้ววนดูทั้ง 18 หัวข้อ
 * แต่ละหัวข้อสุ่มโจทย์ซ้ำหลายรอบ เปิดเฉลย และตรวจว่า KaTeX ไม่มี error
 *
 * รัน: node scripts/verify.mjs  (ต้อง next start ไว้ที่ port 3100 ก่อน)
 */
import { chromium } from 'playwright';

const URL = process.env.URL || 'http://localhost:3100';
const ROUNDS = Number(process.env.ROUNDS || 6);

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

await page.goto(URL, { waitUntil: 'networkidle' });

const topics = await page.locator('.nav-item').count();
console.log(`พบหัวข้อ ${topics} หัวข้อ`);

let checked = 0;
const problems = [];

for (let i = 0; i < topics; i++) {
  await page.locator('.nav-item').nth(i).click();
  for (let r = 0; r < ROUNDS; r++) {
    if (r > 0) await page.getByRole('button', { name: /สุ่มโจทย์ใหม่/ }).click();
    await page.waitForTimeout(30);

    // เปิดเฉลยเพื่อให้ steps ถูกเรนเดอร์ด้วย
    const toggle = page.getByRole('button', { name: /ดูเฉลย|ซ่อนเฉลย/ });
    if ((await toggle.textContent())?.includes('ดูเฉลย')) await toggle.click();
    await page.waitForTimeout(30);

    const errs = await page.locator('.katex-error').count();
    if (errs > 0) {
      const texts = await page.locator('.katex-error').allTextContents();
      problems.push(`หัวข้อ ${i + 1} รอบ ${r + 1}: KaTeX error → ${texts.join(' | ')}`);
    }

    // ต้องมีสมการเรนเดอร์อยู่จริงในโจทย์
    const katexInQuestion = await page.locator('.question .katex').count();
    if (katexInQuestion === 0) {
      problems.push(`หัวข้อ ${i + 1} รอบ ${r + 1}: โจทย์ไม่มีสมการเรนเดอร์เลย`);
    }

    const steps = await page.locator('.solution-steps li').count();
    if (steps < 3) {
      problems.push(`หัวข้อ ${i + 1} รอบ ${r + 1}: วิธีทำมีแค่ ${steps} ขั้น`);
    }

    checked++;
  }
}

// ทดสอบพรีวิวสมการในช่องกรอก
const previewCases = [
  '6x^2-10x+7',
  '(x-1)/(x+2)',
  'sqrt(x+9)',
  '5/3',
  'dy/dx = 3x^2 + 2x - 8',
  '-2x^3 + x/2',
];
for (const c of previewCases) {
  await page.fill('.answer-input', c);
  await page.waitForTimeout(60);
  const hasMath = await page.locator('.preview .katex').count();
  const errs = await page.locator('.preview .katex-error').count();
  if (hasMath === 0) problems.push(`พรีวิวไม่ขึ้นสมการสำหรับ "${c}"`);
  if (errs > 0) problems.push(`พรีวิว KaTeX error สำหรับ "${c}"`);
}
// ภาษาไทยต้อง fallback เป็นข้อความดิบ ไม่พัง
await page.fill('.answer-input', 'ไม่มีลิมิต');
await page.waitForTimeout(60);
if ((await page.locator('.preview-raw').count()) === 0) {
  problems.push('พรีวิวไม่ fallback เป็นข้อความเมื่อพิมพ์ภาษาไทย');
}

/* ---------- โหมดทดลอง (ยังไม่ตั้ง client id) ต้องเข้าเล่นได้ ---------- */
if ((await page.locator('.guest-banner').count()) === 0) {
  problems.push('ไม่พบแบนเนอร์โหมดทดลองทั้งที่ยังไม่ได้ตั้ง client id');
}

/* ---------- คะแนนต้องถูกบันทึกและอยู่รอดหลังรีโหลด ---------- */
await page.evaluate(() => window.localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
// รอให้ React hydrate ให้เสร็จก่อน ไม่งั้นคลิกแรกจะถูก replay ทีหลัง
// แล้วโจทย์จะถูกสุ่มใหม่หลังจากที่เราอ่านเฉลยไปแล้ว
await page.waitForSelector('.question .katex');
await page.waitForTimeout(600);

// ข้อ 01 เฉลยเป็นตัวเลขล้วน อ่านจากแผงเฉลยแล้วพิมพ์ตอบ
await page.locator('.nav-item').nth(0).click();
await page.waitForTimeout(200);
await page.getByRole('button', { name: /ดูเฉลย/ }).click();
await page.waitForTimeout(200);
const shown = await page.locator('.solution-answer').textContent();
const answer = (shown || '').replace(/[^\d.-]/g, '');
if (!answer) problems.push('อ่านเฉลยข้อ 01 ไม่ได้');

await page.fill('.answer-input', answer);
await page.getByRole('button', { name: 'ตรวจคำตอบ' }).click();
await page.waitForTimeout(120);

const statusText = (await page.locator('.status').textContent()) || '';
if (!statusText.includes('ถูกต้อง')) {
  problems.push(`ตอบถูกแล้วแต่ระบบบอกว่าผิด (เฉลย="${answer}", สถานะ="${statusText}")`);
}

const scores = await page.locator('.score-value').allTextContents();
if (scores[0] !== '1' || scores[1] !== '1') {
  problems.push(`คะแนนไม่อัปเดต: ${JSON.stringify(scores)}`);
}

// ป้ายคะแนนในแถบหัวข้อ
const badge = await page.locator('.nav-item').nth(0).locator('.nav-badge').textContent();
if (badge?.trim() !== '1/1') problems.push(`ป้ายคะแนนผิด: "${badge}"`);

// รีโหลดแล้วคะแนนต้องยังอยู่
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(200);
const after = await page.locator('.score-value').allTextContents();
if (after[0] !== '1' || after[1] !== '1') {
  problems.push(`คะแนนหายหลังรีโหลด: ${JSON.stringify(after)}`);
}

const stored = await page.evaluate(() =>
  window.localStorage.getItem('calcpractice:progress:guest'),
);
if (!stored || !JSON.parse(stored).totals) {
  problems.push('ไม่พบ progress ใน localStorage');
}

// แผงสถิติต้องเปิดได้และมีแถวของหัวข้อที่เล่นไป
await page.getByRole('button', { name: /ดูสถิติของฉัน/ }).click();
await page.waitForTimeout(120);
if ((await page.locator('.stats-table tbody tr').count()) !== 1) {
  problems.push('แผงสถิติไม่แสดงหัวข้อที่เล่นไปแล้ว');
}
await page.screenshot({ path: 'shot-stats.png', fullPage: true });

await page.fill('.answer-input', '');
await page.locator('.nav-item').nth(9).click();
await page.waitForTimeout(100);
const toggle = page.getByRole('button', { name: /ดูเฉลย|ซ่อนเฉลย/ });
if ((await toggle.textContent())?.includes('ดูเฉลย')) await toggle.click();
await page.waitForTimeout(150);
await page.screenshot({ path: 'shot-quotient.png', fullPage: true });

await page.locator('.nav-item').nth(2).click();
await page.waitForTimeout(150);
await page.screenshot({ path: 'shot-piecewise.png', fullPage: true });

await browser.close();

console.log(`ตรวจไปทั้งหมด ${checked} โจทย์`);
if (consoleErrors.length) {
  console.log('console errors:');
  consoleErrors.slice(0, 10).forEach((e) => console.log('  -', e));
}
if (problems.length) {
  console.log(`\n❌ พบปัญหา ${problems.length} รายการ:`);
  problems.slice(0, 40).forEach((p) => console.log('  -', p));
  process.exit(1);
}
console.log('\n✅ ผ่านทั้งหมด');
