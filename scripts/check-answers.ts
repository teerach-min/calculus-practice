/**
 * ทดสอบแบบวนกลับ (round-trip):
 * เอา "เฉลย" ที่แสดงบนหน้าจอ (เป็น LaTeX) แปลงกลับเป็นข้อความธรรมดา
 * แล้วป้อนเข้าเครื่องตรวจคำตอบ — ต้องผ่านทุกครั้ง
 *
 * ถ้าเทสต์นี้ผ่าน แปลว่าเฉลยที่นักเรียนเห็น ตรงกับสิ่งที่ระบบยอมรับจริง
 *
 * รัน: npx esbuild scripts/check-answers.ts --bundle --platform=node --format=esm --outfile=/tmp/t.mjs && node /tmp/t.mjs
 */
import { GENERATORS, TOPIC_LABELS } from '../src/lib/generators';
import { verifyAnswer } from '../src/lib/check';
import { toLatex } from '../src/lib/toLatex';

/** แปลง LaTeX (เฉพาะชุดคำสั่งที่โปรเจกต์นี้ใช้) กลับเป็นข้อความธรรมดา */
function latexToPlain(src: string): string {
  let s = src;

  // ตัดตัวครอบ $ / $$ และหัวเรื่องอย่าง dy/dx = , f'(x) =
  s = s.replace(/\$\$?/g, ' ');
  s = s.replace(/\\frac\{dy\}\{dx\}\s*=/g, '');
  s = s.replace(/f\s*\\,\s*'\s*\(x\)\s*=/g, '');
  s = s.replace(/^\s*y\s*=/, '');
  s = s.replace(/\bk\s*=/g, '').replace(/\bm\s*=/g, '');

  // \frac{a}{b} -> (a)/(b)  (วนซ้ำเผื่อซ้อนกัน)
  for (let i = 0; i < 8; i++) {
    const next = s.replace(
      /\\d?frac\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g,
      '(($1)/($2))',
    );
    if (next === s) break;
    s = next;
  }

  s = s
    .replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)')
    .replace(/\\left|\\right/g, '')
    .replace(/\\cdot/g, '*')
    .replace(/\\quad|\\qquad|\\,|\\;|\\ /g, ' ')
    .replace(/\\pm/g, ' ')
    .replace(/\^\{([^{}]*)\}/g, '^($1)')
    .replace(/[{}]/g, '');

  return s.trim();
}

let failures = 0;
let total = 0;
const ROUNDS = 40;

for (let i = 0; i < GENERATORS.length; i++) {
  const label = `${String(i + 1).padStart(2, '0')} ${TOPIC_LABELS[i]}`;
  const bad: string[] = [];

  for (let r = 0; r < ROUNDS; r++) {
    const p = GENERATORS[i]();
    total++;

    const plain = latexToPlain(p.answer);
    const ok = verifyAnswer(plain, p.check);
    if (!ok) bad.push(`answer="${p.answer}" -> plain="${plain}"`);

    // เฉลยทุกข้อต้องมีอย่างน้อย 3 ขั้น และไม่มีสตริง undefined/NaN หลุดมา
    const all = [p.question, p.formula, p.hint, p.answer, ...p.steps].join(' ');
    if (/undefined|NaN/.test(all)) bad.push(`พบ undefined/NaN ใน: ${all.slice(0, 120)}`);
    if (p.steps.length < 3) bad.push(`วิธีทำมีแค่ ${p.steps.length} ขั้น`);
  }

  if (bad.length) {
    failures += bad.length;
    console.log(`❌ ${label} — ล้มเหลว ${bad.length}/${ROUNDS}`);
    bad.slice(0, 3).forEach((b) => console.log(`     ${b}`));
  } else {
    console.log(`✅ ${label}`);
  }
}

// ทดสอบตัวแปลงพรีวิว
const previewCases: [string, boolean][] = [
  ['6x^2-10x+7', true],
  ['(x-1)/(x+2)', true],
  ['sqrt(x+9)', true],
  ['5/3', true],
  ['dy/dx = 3x^2+2x-8', true],
  ['-2x^3 + x/2', true],
  ['ไม่มีลิมิต', false],
  ['', false],
];
console.log('\n— พรีวิวสมการ —');
for (const [input, shouldParse] of previewCases) {
  const got = toLatex(input) !== null;
  const ok = got === shouldParse;
  if (!ok) failures++;
  console.log(`${ok ? '✅' : '❌'} "${input}" -> ${toLatex(input) ?? '(ข้อความธรรมดา)'}`);
}

// ทดสอบว่าคำตอบที่เขียนคนละรูปแต่ค่าเท่ากันต้องผ่าน
console.log('\n— รูปแบบคำตอบที่ยืดหยุ่น —');
const flexible: [string, string][] = [
  ['6x^2-10x+7', '7 - 10x + 6x^2'],
  ['6x^2-10x+7', 'f\'(x) = 6*x^2 - 10*x + 7'],
];
for (const [a, b] of flexible) {
  const ref = { t: 'expr' as const, f: (x: number) => 6 * x * x - 10 * x + 7 };
  const okA = verifyAnswer(a, ref);
  const okB = verifyAnswer(b, ref);
  if (!okA || !okB) failures++;
  console.log(`${okA && okB ? '✅' : '❌'} "${a}" ≡ "${b}"`);
}

console.log(`\nตรวจโจทย์ทั้งหมด ${total} ข้อ`);
if (failures) {
  console.log(`❌ ล้มเหลว ${failures} รายการ`);
  process.exit(1);
}
console.log('✅ ผ่านทั้งหมด');
