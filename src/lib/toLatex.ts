/**
 * แปลงคำตอบที่ผู้ใช้พิมพ์แบบข้อความธรรมดา (เช่น 6x^2-10x+7, (x-1)/(x+2), sqrt(x+9))
 * ให้เป็น LaTeX เพื่อใช้แสดงพรีวิวสมการใต้ช่องกรอก
 *
 * ถ้าแปลงไม่ได้ (เช่น ผู้ใช้พิมพ์ภาษาไทย) จะคืนค่า null
 * ให้ผู้เรียกไปแสดงเป็นข้อความธรรมดาแทน
 */

type Node =
  | { k: 'num'; v: string }
  | { k: 'ident'; v: string }
  | { k: 'add'; op: '+' | '-'; l: Node; r: Node }
  | { k: 'mul'; explicit: boolean; l: Node; r: Node }
  | { k: 'div'; l: Node; r: Node }
  | { k: 'pow'; l: Node; r: Node }
  | { k: 'neg'; e: Node }
  | { k: 'sqrt'; e: Node }
  | { k: 'eq'; l: Node; r: Node };

type Token = { t: 'num' | 'ident' | 'op'; v: string };

const GREEK: Record<string, string> = {
  pi: '\\pi',
  theta: '\\theta',
  alpha: '\\alpha',
  beta: '\\beta',
};

function tokenize(src: string): Token[] | null {
  const s = src
    .replace(/√/g, 'sqrt')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/−|–|—/g, '-')
    .replace(/×|·/g, '*')
    .replace(/÷/g, '/')
    .replace(/\*\*/g, '^');

  const out: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      out.push({ t: 'num', v: s.slice(i, j) });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      out.push({ t: 'ident', v: s.slice(i, j) });
      i = j;
      continue;
    }
    if ('+-*/^()='.includes(c)) {
      out.push({ t: 'op', v: c });
      i++;
      continue;
    }
    // อักขระที่ไม่รู้จัก (เช่น ภาษาไทย) — แปลงไม่ได้
    return null;
  }
  return out;
}

function parse(tokens: Token[]): Node | null {
  let p = 0;
  const peek = () => tokens[p];
  const eat = (v: string) => {
    if (peek() && peek().t === 'op' && peek().v === v) {
      p++;
      return true;
    }
    return false;
  };

  function parseEquation(): Node | null {
    let left = parseExpr();
    if (!left) return null;
    while (eat('=')) {
      const right = parseExpr();
      if (!right) return null;
      left = { k: 'eq', l: left, r: right };
    }
    return left;
  }

  function parseExpr(): Node | null {
    let left = parseTerm();
    if (!left) return null;
    for (;;) {
      const t = peek();
      if (t && t.t === 'op' && (t.v === '+' || t.v === '-')) {
        p++;
        const right = parseTerm();
        if (!right) return null;
        left = { k: 'add', op: t.v as '+' | '-', l: left, r: right };
      } else break;
    }
    return left;
  }

  function startsAtom(): boolean {
    const t = peek();
    if (!t) return false;
    if (t.t === 'num' || t.t === 'ident') return true;
    return t.t === 'op' && t.v === '(';
  }

  function parseTerm(): Node | null {
    let left = parseUnary();
    if (!left) return null;
    for (;;) {
      const t = peek();
      if (t && t.t === 'op' && (t.v === '*' || t.v === '/')) {
        p++;
        const right = parseUnary();
        if (!right) return null;
        left =
          t.v === '*'
            ? { k: 'mul', explicit: true, l: left, r: right }
            : { k: 'div', l: left, r: right };
      } else if (startsAtom()) {
        // การคูณแบบละเครื่องหมาย เช่น 3x , 2(x+1)
        const right = parseUnary();
        if (!right) return null;
        left = { k: 'mul', explicit: false, l: left, r: right };
      } else break;
    }
    return left;
  }

  function parseUnary(): Node | null {
    const t = peek();
    if (t && t.t === 'op' && (t.v === '-' || t.v === '+')) {
      p++;
      const e = parseUnary();
      if (!e) return null;
      return t.v === '-' ? { k: 'neg', e } : e;
    }
    return parsePower();
  }

  function parsePower(): Node | null {
    const base = parseAtom();
    if (!base) return null;
    if (eat('^')) {
      const exp = parseUnary();
      if (!exp) return null;
      return { k: 'pow', l: base, r: exp };
    }
    return base;
  }

  function parseAtom(): Node | null {
    const t = peek();
    if (!t) return null;
    if (t.t === 'num') {
      p++;
      return { k: 'num', v: t.v };
    }
    if (t.t === 'ident') {
      p++;
      if (t.v.toLowerCase() === 'sqrt') {
        if (!eat('(')) return null;
        const e = parseExpr();
        if (!e || !eat(')')) return null;
        return { k: 'sqrt', e };
      }
      return { k: 'ident', v: t.v };
    }
    if (t.t === 'op' && t.v === '(') {
      p++;
      const e = parseExpr();
      if (!e || !eat(')')) return null;
      return e;
    }
    return null;
  }

  const node = parseEquation();
  if (!node || p !== tokens.length) return null;
  return node;
}

const PREC: Record<Node['k'], number> = {
  eq: 0,
  add: 1,
  neg: 1.5,
  mul: 2,
  div: 4,
  pow: 3,
  num: 4,
  ident: 4,
  sqrt: 4,
};

function render(n: Node, min: number): string {
  const body = raw(n);
  return PREC[n.k] < min ? `\\left(${body}\\right)` : body;
}

function raw(n: Node): string {
  switch (n.k) {
    case 'num':
      return n.v;
    case 'ident': {
      const low = n.v.toLowerCase();
      if (GREEK[low]) return GREEK[low];
      // ตัวอักษรหลายตัวติดกัน (เช่น dy, dx) ปล่อยเป็นตัวเอียงตามธรรมเนียมคณิตศาสตร์
      return n.v;
    }
    case 'eq':
      return `${render(n.l, 0)} = ${render(n.r, 0)}`;
    case 'add':
      return `${render(n.l, 1)} ${n.op} ${render(n.r, 2)}`;
    case 'neg':
      return `-${render(n.e, 2)}`;
    case 'mul':
      // ดึงเครื่องหมายลบออกมาข้างหน้า เพื่อไม่ให้ได้ (-2)x
      if (n.l.k === 'neg') {
        return `-${raw({ k: 'mul', explicit: n.explicit, l: n.l.e, r: n.r })}`;
      }
      return `${render(n.l, 2)}${n.explicit ? ' \\cdot ' : ''}${render(n.r, 3)}`;
    case 'div':
      return `\\frac{${render(n.l, 0)}}{${render(n.r, 0)}}`;
    case 'pow':
      return `${render(n.l, 4)}^{${render(n.r, 0)}}`;
    case 'sqrt':
      return `\\sqrt{${render(n.e, 0)}}`;
  }
}

/** แปลงข้อความเป็น LaTeX — คืน null เมื่อแปลงไม่ได้ */
export function toLatex(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const tokens = tokenize(trimmed);
  if (!tokens || tokens.length === 0) return null;
  const ast = parse(tokens);
  if (!ast) return null;
  return render(ast, 0);
}
