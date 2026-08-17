/**
 * ตรรกะการตรวจคำตอบ
 *
 * ผู้ใช้พิมพ์คำตอบเป็นข้อความธรรมดา (เช่น 6x^2-10x+7, sqrt(9), 5/3)
 * โมดูลนี้แปลงเป็นฟังก์ชันแล้วเทียบค่ากับเฉลยเชิงตัวเลข
 * จึงยอมรับคำตอบที่เขียนคนละรูปแต่มีค่าเท่ากัน
 */

export type Check =
  /** คำตอบเป็นตัวเลขค่าเดียว */
  | { t: 'num'; v: number }
  /** คำตอบเป็นข้อความ ตรวจโดยหาคำสำคัญ */
  | { t: 'text'; v: string[] }
  /** คำตอบเป็นชุดตัวเลข (ต้องมีครบทุกตัว) */
  | { t: 'set'; v: number[] }
  /** คำตอบเป็นนิพจน์ของ x เทียบค่าหลายจุด */
  | { t: 'expr'; f: (x: number) => number }
  /** เหมือน expr แต่ยอมให้ต่างกันได้ด้วยค่าคงที่ (สำหรับอินทิเกรตที่มี + C) */
  | { t: 'exprC'; f: (x: number) => number };

/** แปลงข้อความคำตอบเป็นตัวเลข โดยแทนค่า x ที่กำหนด */
export function evalExpr(src: string, x: number): number {
  let s = String(src).toLowerCase().trim();

  s = s
    .replace(/√/g, 'sqrt')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/−|–|—/g, '-')
    .replace(/×|·/g, '*')
    .replace(/÷/g, '/')
    // ตัดหัวเรื่องอย่าง y = , f'(x) = , dy/dx = ออกก่อน
    .replace(/^y\s*=\s*/, '')
    .replace(/^f\s*'?\s*\(x\)\s*=\s*/, '')
    .replace(/^dy\s*\/\s*dx\s*=\s*/, '')
    .replace(/^k\s*=\s*/, '')
    .replace(/^m\s*=\s*/, '')
    // + C ไม่บังคับ
    .replace(/\+?\s*c\b/g, '')
    .replace(/\s+/g, '');

  if (!s) throw new Error('empty');

  s = s.replace(/sqrt/g, 'S');
  // เติม * ให้การคูณแบบละไว้ เช่น 3x -> 3*x , 2(x+1) -> 2*(x+1)
  s = s.replace(/(\d|\)|x)(?=x|S|\()/g, '$1*').replace(/(\))(?=\d)/g, '$1*');
  s = s.replace(/\^/g, '**').replace(/S/g, 'Math.sqrt');

  if (/[a-wyz]/.test(s.replace(/math\.sqrt/g, ''))) throw new Error('bad');

  // eslint-disable-next-line no-new-func
  return Function('x', `return (${s});`)(x) as number;
}

/** ดึงตัวเลขทั้งหมดออกจากข้อความ รองรับเศษส่วนอย่าง 5/3 */
export function nums(s: string): number[] {
  return (String(s).replace(/−/g, '-').match(/-?\d+(\.\d+)?(\/\d+)?/g) || []).map(
    (t) => {
      if (t.includes('/')) {
        const [a, b] = t.split('/');
        return Number(a) / Number(b);
      }
      return Number(t);
    },
  );
}

/** ตรวจว่าคำตอบที่พิมพ์ถูกต้องหรือไม่ */
export function verifyAnswer(input: string, c: Check): boolean {
  try {
    switch (c.t) {
      case 'num':
        return Math.abs(evalExpr(input, 0) - c.v) < 1e-6;

      case 'text': {
        const s = input.toLowerCase().replace(/\s/g, '');
        return c.v.some((w) => s.includes(w.toLowerCase().replace(/\s/g, '')));
      }

      case 'set': {
        const got = nums(input);
        const want = c.v;
        return (
          got.length >= want.length &&
          want.every((w) => got.some((g) => Math.abs(g - w) < 1e-6))
        );
      }

      case 'expr':
        return [0.37, 1.3, 2.6, 4.1].every(
          (x) => Math.abs(evalExpr(input, x) - c.f(x)) < 1e-4,
        );

      case 'exprC': {
        // ยอมให้ต่างกันด้วยค่าคงที่ตัวเดียว (+ C)
        const d = evalExpr(input, 0.37) - c.f(0.37);
        return [1.3, 2.6, 4.1].every(
          (x) => Math.abs(evalExpr(input, x) - c.f(x) - d) < 1e-4,
        );
      }

      default:
        return false;
    }
  } catch {
    return false;
  }
}
