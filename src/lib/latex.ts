/**
 * ตัวช่วยสร้างสตริง LaTeX สำหรับโจทย์แคลคูลัส
 *
 * ทุกฟังก์ชันคืนค่าเป็น LaTeX ล้วน (ไม่มี $ ครอบ) ผู้เรียกเป็นคนใส่ $ ... $
 * หรือ $$ ... $$ เองตามต้องการ
 */

/** สุ่มจำนวนเต็มในช่วง [a, b] */
export const ri = (a: number, b: number): number =>
  a + Math.floor(Math.random() * (b - a + 1));

/** สุ่มสมาชิกหนึ่งตัวจากอาร์เรย์ */
export const pick = <T,>(a: readonly T[]): T =>
  a[Math.floor(Math.random() * a.length)];

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));

/** ทำเศษส่วนให้เป็นรูปอย่างต่ำ คืนค่าเป็น [เศษ, ส่วน] โดยส่วนเป็นบวกเสมอ */
export function reduce(n: number, d: number): [number, number] {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
}

/** เศษส่วนในรูป LaTeX เช่น frac(4, 6) -> "\\frac{2}{3}" , frac(6, 3) -> "2" */
export function frac(n: number, d: number): string {
  const [a, b] = reduce(n, d);
  if (b === 1) return String(a);
  return a < 0 ? `-\\frac{${-a}}{${b}}` : `\\frac{${a}}{${b}}`;
}

/** เศษส่วนแบบข้อความธรรมดา ใช้ตอนเทียบคำตอบ เช่น "2/3" */
export function fracText(n: number, d: number): string {
  const [a, b] = reduce(n, d);
  return b === 1 ? String(a) : `${a}/${b}`;
}

export type Pair = [coefficient: number, power: number];

function term(c: number, p: number, first: boolean): string {
  if (c === 0) return '';
  const sign = c < 0 ? (first ? '-' : ' - ') : first ? '' : ' + ';
  const a = Math.abs(c);
  let body: string;
  if (p === 0) body = String(a);
  else body = `${a === 1 ? '' : a}x${p > 1 ? `^{${p}}` : ''}`;
  return sign + body;
}

/** พหุนามในรูป LaTeX — poly([[3,2],[-5,1],[7,0]]) -> "3x^{2} - 5x + 7" */
export function poly(pairs: Pair[]): string {
  let out = '';
  let first = true;
  for (const [c, p] of pairs) {
    const t = term(c, p, first);
    if (t) {
      out += t;
      first = false;
    }
  }
  return out || '0';
}

/**
 * พจน์ที่สัมประสิทธิ์เป็นเศษส่วน เช่น coefTerm(2, 3, "x^{3}") -> "\\frac{2}{3}x^{3}"
 * ถ้าสัมประสิทธิ์เป็น 1 หรือ -1 จะละตัวเลขให้อัตโนมัติ
 */
export function coefTerm(n: number, d: number, variable: string): string {
  const [a, b] = reduce(n, d);
  if (a === 0) return '0';
  if (b === 1) {
    if (a === 1) return variable;
    if (a === -1) return `-${variable}`;
    return `${a}${variable}`;
  }
  const body = `\\frac{${Math.abs(a)}}{${b}}${variable}`;
  return a < 0 ? `-${body}` : body;
}

/** เครื่องหมายนำหน้าสำหรับต่อท้ายนิพจน์ เช่น signed(-4) -> " - 4" , signed(4) -> " + 4" */
export function signed(n: number): string {
  return n < 0 ? ` - ${-n}` : ` + ${n}`;
}

/** เชื่อมพจน์เศษส่วนเข้าด้วยกันโดยจัดเครื่องหมายให้ถูก */
export function joinTerms(terms: string[]): string {
  return terms
    .filter((t) => t && t !== '0')
    .reduce((acc, t) => {
      if (!acc) return t;
      return t.startsWith('-') ? `${acc} - ${t.slice(1)}` : `${acc} + ${t}`;
    }, '');
}
