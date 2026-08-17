import { Check } from './check';
import { coefTerm, frac, joinTerms, pick, poly, ri, signed } from './latex';

/**
 * โจทย์หนึ่งข้อ
 *
 * ทุกฟิลด์ที่เป็นข้อความใช้รูปแบบ "MathText" คือข้อความไทยผสมคณิตศาสตร์
 * โดยครอบสูตรด้วย $ ... $ (อินไลน์) หรือ $$ ... $$ (แสดงกลางบรรทัด)
 */
export interface Problem {
  /** หมวดหมู่ เช่น "อนุพันธ์" */
  cat: string;
  /** ชื่อหัวข้อย่อย */
  title: string;
  /** สูตรที่ต้องใช้ */
  formula: string;
  /** ตัวโจทย์ */
  question: string;
  /** คำใบ้ */
  hint: string;
  /** เฉลยแบบสั้น */
  answer: string;
  /** วิธีทำทีละขั้น */
  steps: string[];
  /** วิธีตรวจคำตอบ */
  check: Check;
}

export type Generator = () => Problem;

/** ชื่อหัวข้อในแถบด้านซ้าย เรียงตรงกับ GENERATORS */
export const TOPIC_LABELS = [
  'ลิมิตพื้นฐาน',
  'ลิมิตเศษส่วน',
  'ลิมิตซ้าย–ขวา',
  '0/0 แยกตัวประกอบ',
  '0/0 พหุนามดีกรี 2',
  '0/0 ติดราก',
  'ความต่อเนื่อง',
  'อนุพันธ์พหุนาม',
  'อนุพันธ์ผลคูณ',
  'อนุพันธ์ผลหาร',
  'กฎลูกโซ่',
  'ความชันเส้นโค้ง',
  'เส้นสัมผัสโค้ง',
  'ค่าวิกฤต',
  'สูงสุด–ต่ำสุด',
  'อินทิเกรตพื้นฐาน',
  'อินทิเกรตจัดรูป',
  'อินทิเกรตจำกัดเขต',
] as const;

export const GENERATORS: Generator[] = [
  // 01 — ลิมิตพื้นฐาน
  () => {
    const a = ri(2, 4);
    const p = ri(2, 5);
    const q = ri(2, 6);
    const r = ri(1, 9);
    const v = p * a * a - q * a + r;
    const f = poly([
      [p, 2],
      [-q, 1],
      [r, 0],
    ]);
    return {
      cat: 'ลิมิต',
      title: 'ลิมิตพื้นฐาน',
      formula: 'ถ้า $f$ เป็นพหุนาม แล้ว $\\lim\\limits_{x \\to a} f(x) = f(a)$',
      question: `จงหาค่าของ\n$$\\lim_{x \\to ${a}}\\left(${f}\\right)$$`,
      hint: `แทนค่า $x = ${a}$ ลงในฟังก์ชันได้โดยตรง`,
      answer: `$${v}$`,
      check: { t: 'num', v },
      steps: [
        `ฟังก์ชันพหุนามต่อเนื่องทุกจุด จึงแทนค่า $x = ${a}$ ได้เลย`,
        `$$= ${p}(${a})^{2} - ${q}(${a}) + ${r}$$`,
        `$$= ${p * a * a} - ${q * a} + ${r}$$`,
        `$$= ${v}$$`,
      ],
    };
  },

  // 02 — ลิมิตของเศษส่วน
  () => {
    const a = pick([-2, -1, 1, 2]);
    const p = ri(2, 5);
    const q = ri(1, 6);
    const r = ri(1, 5);
    const n = p * a + q;
    const d = a * a + r;
    const v = n / d;
    const top = poly([
      [p, 1],
      [q, 0],
    ]);
    return {
      cat: 'ลิมิต',
      title: 'ลิมิตของเศษส่วน',
      formula:
        '$$\\lim \\frac{f}{g} = \\frac{\\lim f}{\\lim g} \\quad \\text{เมื่อ } \\lim g \\neq 0$$',
      question: `จงหาค่าของ\n$$\\lim_{x \\to ${a}} \\frac{${top}}{x^{2} + ${r}}$$`,
      hint: `แทนค่า $x = ${a}$ ทั้งเศษและส่วน`,
      answer: `$${frac(n, d)}$`,
      check: { t: 'num', v },
      steps: [
        `ส่วนที่ $x = ${a}$ มีค่า $(${a})^{2} + ${r} = ${d} \\neq 0$ จึงแทนค่าได้ตรง ๆ`,
        `เศษ: $${p}(${a}) + ${q} = ${n}$`,
        `ส่วน: $${d}$`,
        `ค่าลิมิต $= \\dfrac{${n}}{${d}} = ${frac(n, d)}$`,
      ],
    };
  },

  // 03 — ลิมิตซ้าย–ขวา
  () => {
    const c = ri(2, 4);
    const m = ri(2, 4);
    const d0 = ri(1, 6);
    const same = Math.random() < 0.5;
    const left = m * c + d0;
    const d = same ? left - c * c : left - c * c + pick([-3, -2, 2, 3]);
    const right = c * c + d;
    const eq = left === right;
    const fL = poly([
      [m, 1],
      [d0, 0],
    ]);
    const fR = poly([
      [1, 2],
      [d, 0],
    ]);
    return {
      cat: 'ลิมิต',
      title: 'ลิมิตซ้าย–ขวา',
      formula:
        '$\\lim\\limits_{x \\to c} f(x)$ หาค่าได้ ก็ต่อเมื่อ $\\lim\\limits_{x \\to c^{-}} f = \\lim\\limits_{x \\to c^{+}} f$',
      question:
        `กำหนดให้\n` +
        `$$f(x) = \\begin{cases} ${fL} & ,\\ x < ${c} \\\\ ${fR} & ,\\ x \\ge ${c} \\end{cases}$$\n` +
        `จงหาค่าของ $\\lim\\limits_{x \\to ${c}} f(x)$`,
      hint: `หา $\\lim\\limits_{x \\to ${c}^{-}} f$ และ $\\lim\\limits_{x \\to ${c}^{+}} f$ แล้วเทียบกัน`,
      answer: eq ? `$${left}$` : 'ไม่มีลิมิต (หาค่าไม่ได้)',
      check: eq
        ? { t: 'num', v: left }
        : {
            t: 'text',
            v: ['ไม่มี', 'หาค่าไม่ได้', 'dne', 'ไม่มีลิมิต', 'ไม่นิยาม'],
          },
      steps: [
        `ลิมิตซ้าย: $\\lim\\limits_{x \\to ${c}^{-}} \\left(${fL}\\right) = ${m}(${c}) + ${d0} = ${left}$`,
        `ลิมิตขวา: $\\lim\\limits_{x \\to ${c}^{+}} \\left(${fR}\\right) = (${c})^{2}${signed(d)} = ${right}$`,
        eq
          ? `ลิมิตซ้าย $=$ ลิมิตขวา $= ${left}$`
          : `ลิมิตซ้าย $(${left}) \\neq$ ลิมิตขวา $(${right})$`,
        eq
          ? `ดังนั้น $\\lim\\limits_{x \\to ${c}} f(x) = ${left}$`
          : `ดังนั้น $\\lim\\limits_{x \\to ${c}} f(x)$ หาค่าไม่ได้`,
      ],
    };
  },

  // 04 — 0/0 ผลต่างกำลังสอง
  () => {
    const a = ri(2, 7);
    const v = 2 * a;
    return {
      cat: 'รูปแบบ 0/0',
      title: 'แยกตัวประกอบผลต่างกำลังสอง',
      formula: '$$x^{2} - a^{2} = (x - a)(x + a)$$',
      question: `จงหาค่าของ\n$$\\lim_{x \\to ${a}} \\frac{x^{2} - ${a * a}}{x - ${a}}$$`,
      hint: `แยกตัวประกอบผลต่างกำลังสองที่เศษ แล้วตัด $(x - ${a})$`,
      answer: `$${v}$`,
      check: { t: 'num', v },
      steps: [
        'แทนค่าตรง ๆ ได้ $\\frac{0}{0}$ จึงต้องแยกตัวประกอบก่อน',
        `$$x^{2} - ${a * a} = (x - ${a})(x + ${a})$$`,
        `ตัด $(x - ${a})$ ทิ้ง เหลือ $\\lim\\limits_{x \\to ${a}} (x + ${a})$`,
        `$$= ${a} + ${a} = ${v}$$`,
      ],
    };
  },

  // 05 — 0/0 พหุนามดีกรีสอง
  () => {
    const a = ri(2, 5);
    let b = ri(1, 6);
    if (b === a) b = a + 1;
    const s = a + b;
    const pdt = a * b;
    const v = (a - b) / (2 * a);
    const top = poly([
      [1, 2],
      [-s, 1],
      [pdt, 0],
    ]);
    return {
      cat: 'รูปแบบ 0/0',
      title: 'พหุนามดีกรีสองทั้งเศษและส่วน',
      formula: 'แยกตัวประกอบทั้งเศษและส่วน แล้วตัดตัวประกอบร่วม $(x - a)$',
      question: `จงหาค่าของ\n$$\\lim_{x \\to ${a}} \\frac{${top}}{x^{2} - ${a * a}}$$`,
      hint: `แยกตัวประกอบทั้งเศษและส่วนแล้วตัดทอน $(x - ${a})$`,
      answer: `$${frac(a - b, 2 * a)}$`,
      check: { t: 'num', v },
      steps: [
        `เศษ: $${top} = (x - ${a})(x - ${b})$`,
        `ส่วน: $x^{2} - ${a * a} = (x - ${a})(x + ${a})$`,
        `ตัด $(x - ${a})$ เหลือ $\\lim\\limits_{x \\to ${a}} \\dfrac{x - ${b}}{x + ${a}}$`,
        `$$= \\frac{${a} - ${b}}{${a} + ${a}} = \\frac{${a - b}}{${2 * a}} = ${frac(a - b, 2 * a)}$$`,
      ],
    };
  },

  // 06 — 0/0 ติดราก
  () => {
    const a = ri(2, 6);
    const v = 1 / (2 * a);
    return {
      cat: 'รูปแบบ 0/0',
      title: 'ลิมิตติดราก (คูณสังยุค)',
      formula: '$$\\left(\\sqrt{A} - B\\right)\\left(\\sqrt{A} + B\\right) = A - B^{2}$$',
      question: `จงหาค่าของ\n$$\\lim_{x \\to 0} \\frac{\\sqrt{x + ${a * a}} - ${a}}{x}$$`,
      hint: `คูณด้วยสังยุค $\\left(\\sqrt{x + ${a * a}} + ${a}\\right)$ ทั้งเศษและส่วน`,
      answer: `$${frac(1, 2 * a)}$`,
      check: { t: 'num', v },
      steps: [
        `คูณสังยุค: $\\left(\\sqrt{x + ${a * a}} - ${a}\\right)\\left(\\sqrt{x + ${a * a}} + ${a}\\right) = (x + ${a * a}) - ${a * a} = x$`,
        `ได้ $$\\frac{x}{x\\left(\\sqrt{x + ${a * a}} + ${a}\\right)}$$`,
        `ตัด $x$ ทิ้ง เหลือ $\\dfrac{1}{\\sqrt{x + ${a * a}} + ${a}}$`,
        `แทน $x = 0$ : $\\dfrac{1}{${a} + ${a}} = ${frac(1, 2 * a)}$`,
      ],
    };
  },

  // 07 — ความต่อเนื่อง
  () => {
    const a = ri(2, 6);
    const v = 2 * a;
    return {
      cat: 'ความต่อเนื่อง',
      title: 'ทำให้ฟังก์ชันต่อเนื่อง',
      formula: '$f$ ต่อเนื่องที่ $x = a$ เมื่อ $f(a) = \\lim\\limits_{x \\to a} f(x)$',
      question:
        `กำหนดให้\n` +
        `$$f(x) = \\begin{cases} \\dfrac{x^{2} - ${a * a}}{x - ${a}} & ,\\ x \\neq ${a} \\\\[2ex] k & ,\\ x = ${a} \\end{cases}$$\n` +
        `จงหาค่า $k$ ที่ทำให้ $f$ ต่อเนื่องที่ $x = ${a}$`,
      hint: `$f$ ต่อเนื่องที่ $x = ${a}$ เมื่อ $f(${a}) = \\lim\\limits_{x \\to ${a}} f(x)$`,
      answer: `$k = ${v}$`,
      check: { t: 'num', v },
      steps: [
        `หาลิมิตก่อน: $\\dfrac{x^{2} - ${a * a}}{x - ${a}} = \\dfrac{(x - ${a})(x + ${a})}{x - ${a}} = x + ${a}$`,
        `$$\\lim_{x \\to ${a}} f(x) = ${a} + ${a} = ${v}$$`,
        `เงื่อนไขความต่อเนื่อง: $f(${a}) = \\lim\\limits_{x \\to ${a}} f(x)$`,
        `ดังนั้น $k = ${v}$`,
      ],
    };
  },

  // 08 — อนุพันธ์พหุนาม
  () => {
    const A = ri(2, 6);
    const B = ri(2, 7);
    const C = ri(2, 9);
    const D = ri(1, 9);
    const f = poly([
      [A, 3],
      [-B, 2],
      [C, 1],
      [-D, 0],
    ]);
    const d = poly([
      [3 * A, 2],
      [-2 * B, 1],
      [C, 0],
    ]);
    return {
      cat: 'อนุพันธ์',
      title: 'อนุพันธ์พหุนาม',
      formula:
        '$$\\frac{d}{dx}\\left(x^{n}\\right) = n\\,x^{n-1} \\qquad \\frac{d}{dx}(c) = 0$$',
      question: `กำหนดให้\n$$f(x) = ${f}$$\nจงหา $f\\,'(x)$`,
      hint: 'ใช้สูตร $\\frac{d}{dx}(x^{n}) = n x^{n-1}$ กับทุกพจน์',
      answer: `$$f\\,'(x) = ${d}$$`,
      check: { t: 'expr', f: (x) => 3 * A * x * x - 2 * B * x + C },
      steps: [
        `$\\dfrac{d}{dx}\\left(${A}x^{3}\\right) = ${3 * A}x^{2}$`,
        `$\\dfrac{d}{dx}\\left(-${B}x^{2}\\right) = -${2 * B}x$`,
        `$\\dfrac{d}{dx}\\left(${C}x\\right) = ${C}$`,
        `$\\dfrac{d}{dx}\\left(-${D}\\right) = 0$`,
        `$$f\\,'(x) = ${d}$$`,
      ],
    };
  },

  // 09 — อนุพันธ์ผลคูณ
  () => {
    const A = ri(2, 5);
    const B = ri(1, 6);
    const C = ri(2, 8);
    const u = poly([
      [A, 1],
      [B, 0],
    ]);
    const res = poly([
      [3 * A, 2],
      [2 * B, 1],
      [-A * C, 0],
    ]);
    return {
      cat: 'อนุพันธ์',
      title: 'อนุพันธ์ผลคูณ',
      formula: "$$(uv)' = u'v + uv'$$",
      question: `กำหนดให้\n$$y = \\left(${u}\\right)\\left(x^{2} - ${C}\\right)$$\nจงหา $\\dfrac{dy}{dx}$`,
      hint: 'ใช้กฎผลคูณ หรือคูณกระจายก่อนแล้วค่อยดิฟ',
      answer: `$$\\frac{dy}{dx} = ${res}$$`,
      check: { t: 'expr', f: (x) => 3 * A * x * x + 2 * B * x - A * C },
      steps: [
        `ให้ $u = ${u} \\;\\Rightarrow\\; u' = ${A}$`,
        `ให้ $v = x^{2} - ${C} \\;\\Rightarrow\\; v' = 2x$`,
        `$$\\frac{dy}{dx} = u'v + uv' = ${A}\\left(x^{2} - ${C}\\right) + \\left(${u}\\right)(2x)$$`,
        `$$= ${A}x^{2} - ${A * C} + ${2 * A}x^{2} + ${2 * B}x$$`,
        `$$= ${res}$$`,
      ],
    };
  },

  // 10 — อนุพันธ์ผลหาร
  () => {
    const A = ri(2, 5);
    const B = ri(1, 5);
    const C = ri(2, 4);
    const D = ri(1, 5);
    const n = A * D + B * C;
    const u = poly([
      [A, 1],
      [-B, 0],
    ]);
    const v = poly([
      [C, 1],
      [D, 0],
    ]);
    return {
      cat: 'อนุพันธ์',
      title: 'อนุพันธ์ผลหาร',
      formula: "$$\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^{2}}$$",
      question: `กำหนดให้\n$$y = \\frac{${u}}{${v}}$$\nจงหา $\\dfrac{dy}{dx}$`,
      hint: 'ใช้สูตร $\\dfrac{(\\text{ล่าง})(\\text{บน})\' - (\\text{บน})(\\text{ล่าง})\'}{(\\text{ล่าง})^{2}}$',
      answer: `$$\\frac{dy}{dx} = \\frac{${n}}{\\left(${v}\\right)^{2}}$$`,
      check: { t: 'expr', f: (x) => n / Math.pow(C * x + D, 2) },
      steps: [
        `$u = ${u} \\;\\Rightarrow\\; u' = ${A}$ และ $v = ${v} \\;\\Rightarrow\\; v' = ${C}$`,
        `$$\\frac{dy}{dx} = \\frac{${A}\\left(${v}\\right) - \\left(${u}\\right)(${C})}{\\left(${v}\\right)^{2}}$$`,
        `$$\\frac{dy}{dx} = \\frac{(${A * C}x + ${A * D}) - (${A * C}x - ${B * C})}{\\left(${v}\\right)^{2}}$$`,
        `เศษ $= ${A * D} + ${B * C} = ${n}$`,
        `$$\\frac{dy}{dx} = \\frac{${n}}{\\left(${v}\\right)^{2}}$$`,
      ],
    };
  },

  // 11 — กฎลูกโซ่
  () => {
    const A = ri(2, 4);
    const B = ri(1, 5);
    const C = ri(1, 4);
    const n = ri(3, 5);
    const inner = poly([
      [A, 2],
      [-B, 1],
      [C, 0],
    ]);
    const dInner = poly([
      [2 * A, 1],
      [-B, 0],
    ]);
    return {
      cat: 'อนุพันธ์',
      title: 'กฎลูกโซ่ (ดิฟก้อน)',
      formula:
        "$$\\frac{d}{dx}\\left[g(x)\\right]^{n} = n\\left[g(x)\\right]^{n-1} \\cdot g'(x)$$",
      question: `กำหนดให้\n$$y = \\left(${inner}\\right)^{${n}}$$\nจงหา $\\dfrac{dy}{dx}$`,
      hint: 'ตบเลขยกกำลังลงมา ลดกำลังลง 1 แล้วคูณด้วยอนุพันธ์ของไส้ใน',
      answer: `$$\\frac{dy}{dx} = ${n}\\left(${inner}\\right)^{${n - 1}}\\left(${dInner}\\right)$$`,
      check: {
        t: 'expr',
        f: (x) => n * Math.pow(A * x * x - B * x + C, n - 1) * (2 * A * x - B),
      },
      steps: [
        `ให้ไส้ใน $g(x) = ${inner}$`,
        `$g'(x) = ${dInner}$`,
        `$$\\frac{dy}{dx} = ${n}\\left(${inner}\\right)^{${n - 1}} \\cdot g'(x)$$`,
        `$$= ${n}\\left(${inner}\\right)^{${n - 1}}\\left(${dInner}\\right)$$`,
      ],
    };
  },

  // 12 — ความชันของเส้นโค้ง
  () => {
    const B = ri(2, 5);
    const C = ri(1, 6);
    const p = ri(1, 4);
    const y = p * p * p - B * p * p + C;
    const m = 3 * p * p - 2 * B * p;
    const f = poly([
      [1, 3],
      [-B, 2],
      [C, 0],
    ]);
    const df = poly([
      [3, 2],
      [-2 * B, 1],
    ]);
    return {
      cat: 'การประยุกต์',
      title: 'ความชันของเส้นโค้ง',
      formula: "ความชันที่จุด $x = p$ คือ $m = f\\,'(p)$",
      question: `จงหาความชันของเส้นโค้ง\n$$y = ${f}$$\nที่จุด $(${p},\\ ${y})$`,
      hint: `หา $f\\,'(x)$ แล้วแทน $x = ${p}$`,
      answer: `$m = ${m}$`,
      check: { t: 'num', v: m },
      steps: [
        `$$f\\,'(x) = ${df}$$`,
        `$$m = f\\,'(${p}) = 3(${p})^{2} - ${2 * B}(${p})$$`,
        `$$= ${3 * p * p} - ${2 * B * p}$$`,
        `$$m = ${m}$$`,
      ],
    };
  },

  // 13 — สมการเส้นสัมผัส
  () => {
    const A = ri(1, 4);
    const B = ri(2, 6);
    const C = ri(1, 5);
    const p = ri(1, 3);
    const y1 = A * p * p - B * p + C;
    const m = 2 * A * p - B;
    const k = y1 - m * p;
    const f = poly([
      [A, 2],
      [-B, 1],
      [C, 0],
    ]);
    const df = poly([
      [2 * A, 1],
      [-B, 0],
    ]);
    const line = poly([
      [m, 1],
      [k, 0],
    ]);
    return {
      cat: 'การประยุกต์',
      title: 'สมการเส้นสัมผัสเส้นโค้ง',
      formula: "$$y - y_{1} = m(x - x_{1}) \\qquad m = f\\,'(x_{1})$$",
      question: `จงหาสมการเส้นสัมผัสเส้นโค้ง\n$$y = ${f}$$\nที่จุด $(${p},\\ ${y1})$`,
      hint: `หา $m = f\\,'(${p})$ แล้วใช้สูตร $y - y_{1} = m(x - x_{1})$`,
      answer: `$$y = ${line}$$`,
      check: { t: 'expr', f: (x) => m * x + k },
      steps: [
        `$$f\\,'(x) = ${df}$$`,
        `$$m = f\\,'(${p}) = ${2 * A}(${p}) - ${B} = ${m}$$`,
        `แทนในสูตร: $y - ${y1} = ${m}(x - ${p})$`,
        `$$y = ${line}$$`,
      ],
    };
  },

  // 14 — ค่าวิกฤต
  () => {
    const a = ri(1, 5);
    const c = 3 * a * a;
    const f = poly([
      [1, 3],
      [-c, 1],
    ]);
    const df = poly([
      [3, 2],
      [-c, 0],
    ]);
    return {
      cat: 'การประยุกต์',
      title: 'ค่าวิกฤต',
      formula: "ค่าวิกฤตเกิดที่ $f\\,'(x) = 0$ หรือ $f\\,'(x)$ หาค่าไม่ได้",
      question: `กำหนดให้\n$$f(x) = ${f}$$\nจงหาค่าวิกฤตของ $f(x)$`,
      hint: "แก้สมการ $f\\,'(x) = 0$",
      answer: `$x = ${a}$ และ $x = -${a}$`,
      check: { t: 'set', v: [a, -a] },
      steps: [
        `$$f\\,'(x) = ${df}$$`,
        `ให้ $f\\,'(x) = 0$ : $\\;3x^{2} = ${c}$`,
        `$$x^{2} = ${a * a}$$`,
        `$$x = ${a},\\quad x = -${a}$$`,
      ],
    };
  },

  // 15 — ค่าสูงสุด–ต่ำสุดสัมพัทธ์
  () => {
    const a = ri(1, 4);
    const c = 3 * a * a;
    const hi = 2 * a * a * a;
    const lo = -hi;
    const f = poly([
      [1, 3],
      [-c, 1],
    ]);
    const df = poly([
      [3, 2],
      [-c, 0],
    ]);
    return {
      cat: 'การประยุกต์',
      title: 'ค่าสูงสุด–ต่ำสุดสัมพัทธ์',
      formula:
        "$f\\,''(x) < 0 \\Rightarrow$ สูงสุดสัมพัทธ์ , $f\\,''(x) > 0 \\Rightarrow$ ต่ำสุดสัมพัทธ์",
      question: `กำหนดให้\n$$f(x) = ${f}$$\nจงหาจุดสูงสุดสัมพัทธ์และจุดต่ำสุดสัมพัทธ์`,
      hint: "หาค่าวิกฤตจาก $f\\,'(x) = 0$ แล้วทดสอบด้วย $f\\,''(x)$",
      answer: `สูงสุดสัมพัทธ์ $(-${a},\\ ${hi})$ , ต่ำสุดสัมพัทธ์ $(${a},\\ ${lo})$`,
      check: { t: 'set', v: [-a, hi, a, lo] },
      steps: [
        `$f\\,'(x) = ${df} = 0 \\;\\Rightarrow\\; x = \\pm ${a}$`,
        `$$f\\,''(x) = 6x$$`,
        `ที่ $x = -${a}$ : $f\\,'' = ${-6 * a} < 0$ → สูงสุดสัมพัทธ์ , $f(-${a}) = ${hi}$`,
        `ที่ $x = ${a}$ : $f\\,'' = ${6 * a} > 0$ → ต่ำสุดสัมพัทธ์ , $f(${a}) = ${lo}$`,
        `จุดสูงสุดสัมพัทธ์ $(-${a},\\ ${hi})$ , จุดต่ำสุดสัมพัทธ์ $(${a},\\ ${lo})$`,
      ],
    };
  },

  // 16 — อินทิเกรตไม่จำกัดเขต
  () => {
    const A = ri(1, 4);
    const B = ri(1, 5);
    const C = ri(2, 9);
    const integrand = poly([
      [3 * A, 2],
      [-2 * B, 1],
      [C, 0],
    ]);
    const F = poly([
      [A, 3],
      [-B, 2],
      [C, 1],
    ]);
    return {
      cat: 'อินทิเกรต',
      title: 'อินทิเกรตไม่จำกัดเขต',
      formula:
        '$$\\int x^{n}\\,dx = \\frac{x^{n+1}}{n+1} + C \\qquad (n \\neq -1)$$',
      question: `จงหาค่าของ\n$$\\int \\left(${integrand}\\right) dx$$`,
      hint: 'เพิ่มเลขยกกำลังไป 1 แล้วหารด้วยเลขยกกำลังใหม่ อย่าลืม $+\\,C$',
      answer: `$$${F} + C$$`,
      check: { t: 'exprC', f: (x) => A * x * x * x - B * x * x + C * x },
      steps: [
        `$$\\int ${3 * A}x^{2}\\,dx = ${3 * A} \\cdot \\frac{x^{3}}{3} = ${A}x^{3}$$`,
        `$$\\int -${2 * B}x\\,dx = -${2 * B} \\cdot \\frac{x^{2}}{2} = -${B}x^{2}$$`,
        `$$\\int ${C}\\,dx = ${C}x$$`,
        `รวม: $$${F} + C$$`,
      ],
    };
  },

  // 17 — อินทิเกรตแบบจัดรูปก่อน
  () => {
    const A = ri(1, 3);
    const B = ri(1, 5);
    const C = ri(1, 5);
    const b2 = A * C - B;
    const c1 = -B * C;
    const u = poly([
      [A, 1],
      [-B, 0],
    ]);
    const expanded = poly([
      [A, 2],
      [b2, 1],
      [c1, 0],
    ]);
    const F = joinTerms([
      coefTerm(A, 3, 'x^{3}'),
      coefTerm(b2, 2, 'x^{2}'),
      coefTerm(c1, 1, 'x'),
    ]);
    return {
      cat: 'อินทิเกรต',
      title: 'อินทิเกรตแบบจัดรูปก่อน',
      formula: 'คูณกระจายให้เป็นพหุนามก่อน แล้วจึงอินทิเกรตทีละพจน์',
      question: `จงหาค่าของ\n$$\\int \\left(${u}\\right)\\left(x + ${C}\\right) dx$$`,
      hint: 'คูณกระจายให้อยู่ในรูปพหุนามก่อนอินทิเกรต',
      answer: `$$${F} + C$$`,
      check: {
        t: 'exprC',
        f: (x) => (A / 3) * x * x * x + (b2 / 2) * x * x + c1 * x,
      },
      steps: [
        `คูณกระจาย: $$\\left(${u}\\right)\\left(x + ${C}\\right) = ${expanded}$$`,
        `$$\\int ${A}x^{2}\\,dx = ${coefTerm(A, 3, 'x^{3}')}$$`,
        `$$\\int ${b2}x\\,dx = ${coefTerm(b2, 2, 'x^{2}')}$$`,
        `$$\\int ${c1}\\,dx = ${coefTerm(c1, 1, 'x')}$$`,
        `ผลลัพธ์: $$${F} + C$$`,
      ],
    };
  },

  // 18 — อินทิเกรตจำกัดเขต
  () => {
    const A = ri(1, 3);
    const B = ri(1, 4);
    const p = ri(0, 2);
    const q = p + ri(1, 3);
    const F = (x: number) => A * x * x * x - B * x * x;
    const v = F(q) - F(p);
    const integrand = poly([
      [3 * A, 2],
      [-2 * B, 1],
    ]);
    const anti = poly([
      [A, 3],
      [-B, 2],
    ]);
    return {
      cat: 'อินทิเกรต',
      title: 'อินทิเกรตจำกัดเขต',
      formula: '$$\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)$$',
      question: `จงหาค่าของ\n$$\\int_{${p}}^{${q}} \\left(${integrand}\\right) dx$$`,
      hint: `หา $F(x)$ ก่อน แล้วคำนวณ $F(${q}) - F(${p})$`,
      answer: `$${v}$`,
      check: { t: 'num', v },
      steps: [
        `$$F(x) = ${anti}$$`,
        `$$F(${q}) = ${A}(${q})^{3} - ${B}(${q})^{2} = ${F(q)}$$`,
        `$$F(${p}) = ${A}(${p})^{3} - ${B}(${p})^{2} = ${F(p)}$$`,
        `ค่าอินทิกรัล $= ${F(q)} - (${F(p)}) = ${v}$`,
      ],
    };
  },
];
