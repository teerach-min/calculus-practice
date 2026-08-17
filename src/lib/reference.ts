/**
 * เนื้อหาหน้าสรุปสูตรและนิยาม (Pre-Calculus)
 *
 * ทุกสตริงใช้รูปแบบเดียวกับ MathText คือข้อความไทยผสมสูตร
 * ครอบด้วย $...$ (อินไลน์) หรือ $$...$$ (แสดงกลางบรรทัด)
 * และ \n คือขึ้นบรรทัดใหม่
 */

export interface TocItem {
  id: string;
  num: string;
  title: string;
}

export const TOC: TocItem[] = [
  { id: 's1', num: '01', title: 'ลิมิตของฟังก์ชัน' },
  { id: 's2', num: '02', title: 'การหาลิมิตและการจัดรูป' },
  { id: 's3', num: '03', title: 'ความต่อเนื่อง' },
  { id: 's4', num: '04', title: 'อนุพันธ์' },
  { id: 's5', num: '05', title: 'ความชันและเส้นสัมผัส' },
  { id: 's6', num: '06', title: 'ค่าวิกฤต เพิ่ม–ลด สูงสุด–ต่ำสุด' },
  { id: 's7', num: '07', title: 'การอินทิเกรต' },
  { id: 's8', num: '08', title: 'แคลคูลัสในงานวิศวกรรม' },
  { id: 's9', num: '09', title: 'เกณฑ์และขอบเขต' },
];

/* ---------- 01 ลิมิตของฟังก์ชัน ---------- */

export const DEFINITION =
  'เมื่อ $f$ เป็นฟังก์ชันที่มีโดเมนและเรนจ์เป็นสับเซตของจำนวนจริง ' +
  'ถ้าค่าของ $f(x)$ เข้าใกล้จำนวนจริง $L$ ทางด้านซ้าย และค่าของ $f(x)$ ' +
  'เข้าใกล้จำนวนจริง $L$ เมื่อ $x$ เข้าใกล้ $a$ ทางด้านขวา ' +
  'เรากล่าวว่า $L$ เป็นลิมิตของฟังก์ชัน $f$ ที่ $x$ เข้าใกล้ $a$ ' +
  'เขียนแทนด้วย $\\lim\\limits_{x\\to a}f(x)=L$';

export const THEOREM =
  '$\\lim\\limits_{x\\to a}f(x)=L$ ก็ต่อเมื่อ ' +
  '$\\lim\\limits_{x\\to a^-}f(x)=L=\\lim\\limits_{x\\to a^+}f(x)$';

export const THREE_CONDITIONS = {
  intro: 'การหา $\\lim\\limits_{x\\to a}f(x)$ ต้องครบสามข้อ',
  items: [
    '$\\lim\\limits_{x\\to a^-}f(x)$ หาค่าได้',
    '$\\lim\\limits_{x\\to a^+}f(x)$ หาค่าได้',
    'ลิมิตซ้ายเท่ากับลิมิตขวา',
  ],
};

export const SIDE_LIMITS = [
  '$\\lim\\limits_{x\\to a^-}f(x)$ คือค่าประมาณของ $f(x)$ เมื่อ $x$ น้อยกว่า $a$ นิด ๆ',
  '$\\lim\\limits_{x\\to a^+}f(x)$ คือค่าประมาณของ $f(x)$ เมื่อ $x$ มากกว่า $a$ นิด ๆ',
];

export const SIDE_LIMITS_RESULT = [
  'ถ้าลิมิตซ้าย $\\neq$ ลิมิตขวา จะเรียกว่า $\\lim\\limits_{x\\to a}f(x)$ หาค่าไม่ได้',
  'ถ้าลิมิตซ้าย $=$ ลิมิตขวา $= L$ จะได้ $\\lim\\limits_{x\\to a}f(x)=L$',
];

export const PLAIN_MEANING =
  '$\\lim\\limits_{x\\to a}f(x)$ หมายถึงค่าประมาณของ $f(x)$ เมื่อ $x$ ประมาณ $a$';

export const PLAIN_MEANING_EXAMPLES = [
  '$\\lim\\limits_{x\\to 2}(2x+1)=2(2)+1=5$',
  '$\\lim\\limits_{x\\to 2}\\dfrac{2x}{x+3}=\\dfrac{2(2)}{2+3}=\\dfrac{4}{5}$',
];

/* ---------- 02 การหาลิมิตและการจัดรูป ---------- */

export const FIRST_TRY =
  'ลองแทน $x=a$ ก่อนเป็นอันดับแรก เช่น $\\lim\\limits_{x\\to 3}(x+5)=3+5=8$\n' +
  'กรณีคำนวณ $f(a)$ ไม่ได้ จะมีกรอบคำตอบดังนี้';

export interface LimitCase {
  form: string;
  rule: string;
  example?: string;
}

export const LIMIT_CASES: LimitCase[] = [
  {
    form: '\\dfrac{n}{0}',
    rule: 'สรุปว่า $\\lim\\limits_{x\\to a} f(x)$ หาค่าไม่ได้ — ตัวส่วนเป็น 0 ไม่มีนิยาม',
    example: 'เช่น $\\lim\\limits_{x\\to 0}\\dfrac{5}{x}=\\dfrac{5}{0}$',
  },
  {
    form: '\\dfrac{0}{n}',
    rule: 'สรุปว่า $\\lim\\limits_{x\\to a} f(x)=0$',
    example: 'เช่น $\\lim\\limits_{x\\to 1}\\dfrac{x-1}{x+2}=\\dfrac{0}{3}=0$',
  },
  {
    form: '\\dfrac{0}{0}',
    rule: 'ยังสรุปไม่ได้ ต้องจัดรูปก่อน',
  },
];

export const FACTOR_FORMS = [
  '$(a+b)^2 = a^2+2ab+b^2$',
  '$(a-b)^2 = a^2-2ab+b^2$',
  '$a^3+b^3 = (a+b)(a^2-ab+b^2)$',
  '$a^3-b^3 = (a-b)(a^2+ab+b^2)$',
  '$(a+b)^3 = a^3+3a^2b+3ab^2+b^3$',
  '$(a-b)^3 = a^3-3a^2b+3ab^2-b^3$',
];

export const CONJUGATE = {
  note: 'จัดรูปให้อยู่ในรูปผลต่างกำลังสอง',
  formula: '$(a+b)(a-b)=a^2-b^2$',
  zeroOverZero:
    'รูปแบบ $\\tfrac{0}{0}$ จัดรูปได้สองทาง: จัดรูปพหุนามแล้วตัดทอน ' +
    'หรือใช้โลปีตาล (ดิฟบน / ดิฟล่าง)',
};

export interface LimitPattern {
  no: string;
  name: string;
  work: string[];
}

export const LIMIT_PATTERNS: LimitPattern[] = [
  {
    no: '1',
    name: 'แทนค่าปกติ',
    work: [
      '$\\lim\\limits_{x\\to -1}\\dfrac{x^2-x}{x-1}=\\dfrac{(-1)^2-(-1)}{(-1)-1}=-1$',
    ],
  },
  {
    no: '2',
    name: 'แทนค่าแล้วได้ 0 / ตัวเลข',
    work: ['$\\lim\\limits_{x\\to 5}\\dfrac{x-5}{x+1}=\\dfrac{5-5}{5+1}=\\dfrac{0}{6}=0$'],
  },
  {
    no: '3',
    name: 'แทนค่าแล้วได้ 0/0 → จัดรูป',
    work: [
      '$\\lim\\limits_{x\\to -2}\\dfrac{3x^2+5x-2}{x+2}=\\dfrac{0}{0}$',
      'จัดรูป: $\\lim\\limits_{x\\to -2}\\dfrac{(3x-1)(x+2)}{x+2}=\\lim\\limits_{x\\to -2}(3x-1)=3(-2)-1=-7$',
    ],
  },
  {
    no: '4',
    name: 'แทนค่าแล้วได้ 0/0 → โลปีตาล',
    work: [
      '$\\lim\\limits_{x\\to -2}\\dfrac{\\text{ดิฟบน}}{\\text{ดิฟล่าง}}=\\lim\\limits_{x\\to -2}\\dfrac{6x+5}{1}=6(-2)+5=-7$',
    ],
  },
];

/* ---------- 03 ความต่อเนื่อง ---------- */

export const CONTINUITY_RULE =
  '$f(x)$ ต่อเนื่องที่ $x=a$ เมื่อ ' +
  '$\\lim\\limits_{x\\to a^-}f(x)=\\lim\\limits_{x\\to a^+}f(x)=f(a)$';

export const CONTINUITY_EXAMPLE = [
  '$f(x)=\\begin{cases}\\dfrac{3x^2-5x+2}{x-1} & ,\\;x<1\\\\[6pt] 4 & ,\\;x=1\\\\[6pt] \\dfrac{5-3x}{2} & ,\\;x>1\\end{cases}$',
  '$f(x)$ ต่อเนื่องที่ $x=1$ หรือไม่',
];

export interface Step {
  n: string;
  text: string;
}

export const CONTINUITY_STEPS: Step[] = [
  {
    n: '01',
    text:
      'ลิมิตซ้าย แทนค่าได้ $\\tfrac{0}{0}$ จึงจัดรูป\n' +
      '$\\lim\\limits_{x\\to 1^-}\\dfrac{3x^2-5x+2}{x-1}=\\lim\\limits_{x\\to 1^-}\\dfrac{(3x-2)(x-1)}{x-1}=3(1)-2=1$',
  },
  {
    n: '02',
    text: 'ลิมิตขวา\n$\\lim\\limits_{x\\to 1^+}\\dfrac{5-3x}{2}=\\dfrac{5-3(1)}{2}=1$',
  },
  { n: '03', text: 'ค่าฟังก์ชันที่จุด\n$f(1)=4$' },
];

export const CONTINUITY_CONCLUSION =
  'ทั้งสามค่าไม่เท่ากัน ดังนั้น $f(x)$ ไม่ต่อเนื่องที่ $x=1$';

/* ---------- 04 อนุพันธ์ ---------- */

export const DERIV_NOTATION = "$\\dfrac{dy}{dx}\\;\\cdot\\;f'(x)\\;\\cdot\\;y'$";

export const DERIV_RULES = [
  "ถ้า $f(x)=c$ แล้ว $f'(x)=0$",
  "ถ้า $f(x)=x$ แล้ว $f'(x)=1$",
  "ถ้า $f(x)=x^n$ แล้ว $f'(x)=nx^{n-1}\\;;\\;n\\in\\mathbb{R}$",
  "ถ้า $y=c\\,f(x)$ แล้ว $\\dfrac{dy}{dx}=c\\,f'(x)$",
  "ถ้า $y=f(x)+g(x)$ แล้ว $\\dfrac{dy}{dx}=f'(x)+g'(x)$",
  "ถ้า $y=f(x)-g(x)$ แล้ว $\\dfrac{dy}{dx}=f'(x)-g'(x)$",
  "ถ้า $y=f(x)\\,g(x)$ แล้ว $\\dfrac{dy}{dx}=f(x)g'(x)+g(x)f'(x)$",
  "ถ้า $y=\\dfrac{f(x)}{g(x)},\\,g(x)\\neq 0$ แล้ว $\\dfrac{dy}{dx}=\\dfrac{g(x)f'(x)-f(x)g'(x)}{[g(x)]^2}$",
];

export const DERIV_EXTRA = [
  '$\\dfrac{d}{dx}e^x=e^x$',
  '$\\dfrac{d}{dx}\\sin u=\\cos u\\cdot\\dfrac{du}{dx}$',
  '$\\dfrac{d}{dx}\\cos u=-\\sin u\\cdot\\dfrac{du}{dx}$',
  '$\\dfrac{d}{dx}\\tan u=\\sec^2 u\\cdot\\dfrac{du}{dx}$',
  '$\\dfrac{dy}{du}\\cdot\\dfrac{du}{dx}=\\dfrac{dy}{dx}$',
  "$\\dfrac{d}{dx}\\big[(g\\circ f)(x)\\big]=g'\\big(f(x)\\big)f'(x)$",
];

export interface TrickCard {
  name: string;
  body: string[];
}

export const DERIV_TRICKS: TrickCard[] = [
  {
    name: 'ดิฟ xⁿ — ตบเลขยกกำลังลงมาแล้วลดกำลังไป 1',
    body: [
      "$y=x^{12}\\;\\Rightarrow\\;y'=12x^{11}$",
      "$y=x^{6}\\;\\Rightarrow\\;y'=6x^{5}$",
      "$y=3x^{10}\\;\\Rightarrow\\;y'=30x^{9}$",
      "$y=2x^{-5}\\;\\Rightarrow\\;y'=-10x^{-6}$",
      "$y=\\sqrt{x}=x^{1/2}\\;\\Rightarrow\\;y'=\\tfrac{1}{2}x^{-1/2}$",
    ],
  },
  {
    name: 'ดิฟแยกการบวกลบได้',
    body: [
      "$y=4x^2-3x+5\\;\\Rightarrow\\;y'=8x-3$",
      "$y=4x^5-5x^3+x-10\\;\\Rightarrow\\;y'=20x^4-15x^2+1$",
    ],
  },
  {
    name: 'ดิฟก้อน อย่าลืมดิฟไส้',
    body: [
      '$y=(3x^2-2x+5)^4$',
      "$y'=4(3x^2-2x+5)^3\\cdot\\underbrace{(6x-2)}_{\\text{ดิฟไส้}}$",
    ],
  },
  {
    name: 'ดิฟผลคูณ / ผลหาร',
    body: [
      "$(uv)'=uv'+vu'\\qquad\\left(\\dfrac{u}{v}\\right)'=\\dfrac{vu'-uv'}{v^2}$",
      '$y=(2x-5)(5x^2-3x)$',
      "$y'=(2x-5)(10x-3)+(5x^2-3x)(2)$",
      '$y=\\dfrac{4x^2-1}{3x+4}$',
      "$y'=\\dfrac{(3x+4)(8x)-(4x^2-1)(3)}{(3x+4)^2}$",
    ],
  },
];

/* ---------- 05 ความชันและเส้นสัมผัส ---------- */

export const CURVE_SLOPE = [
  'อยู่ในรูปที่ดีกรีของ $x$ สูงสุดมากกว่า 1',
  "ความชันเส้นโค้งที่จุด $x=c$ คือ $m_{\\text{โค้ง}}=f'(c)$",
];

export const LINE_SLOPE = [
  'รูป 1 : $Ax+By+C=0\\;\\Rightarrow\\;m=-\\dfrac{A}{B}$',
  'รูป 2 : $y=mx+c\\;\\Rightarrow$ ความชัน $=m$',
];

export const SLOPE_FACTS = [
  'เส้นตรงสัมผัสกับเส้นโค้งที่จุด $x=1$ $\\Rightarrow$ ความชันเส้นโค้ง = ความชันเส้นตรง ที่จุด $x=1$',
  'เส้นตรงสองเส้นขนานกัน $\\Rightarrow$ ความชันเท่ากัน $(m_1=m_2)$',
  'เส้นตรงสองเส้นตั้งฉากกัน $\\Rightarrow$ ความชันคูณกันได้ $-1$ $(m_1\\cdot m_2=-1)$',
];

export const LINE_BUILD = {
  note: 'สร้างสมการเส้นตรง ต้องรู้ความชัน $m$ และจุดที่ผ่าน $(x_1,y_1)$',
  formula: '$$y-y_1=m(x-x_1)$$',
};

/* ---------- 06 ค่าวิกฤต เพิ่ม–ลด สูงสุด–ต่ำสุด ---------- */

export const CRITICAL_INTRO =
  'ค่าวิกฤต คือค่า $x$ ที่ทำให้ฟังก์ชันเปลี่ยนจากฟังก์ชันเพิ่มเป็นลด หรือลดเป็นเพิ่ม';

export const MONOTONIC = [
  {
    label: "ฟังก์ชันเพิ่ม $\\;(f'(x)>0)$",
    detail: 'x เพิ่ม y เพิ่ม หรือ x ลด y ลด',
  },
  {
    label: "ฟังก์ชันลด $\\;(f'(x)<0)$",
    detail: 'x เพิ่ม y ลด หรือ x ลด y เพิ่ม',
  },
];

export const MAXMIN_METHOD = [
  "ขั้นที่ 1 หาค่าวิกฤตจาก $f'(x)=0$",
  "ขั้นที่ 2 เช็กด้วย $f''(x)$ — ถ้า $f''(x_c)<0$ ให้ค่าสูงสุด , ถ้า $f''(x_c)>0$ ให้ค่าต่ำสุด",
  'ขั้นที่ 3 แทนค่าวิกฤตกลับใน $f(x)$ เพื่อหาค่าสูงสุด/ต่ำสุด',
];

export const MAXMIN_FN = '$f(x)=2x^3+3x^2-12x+5$';

export const MAXMIN_STEPS: Step[] = [
  {
    n: '01',
    text:
      "ขั้นที่ 1 หาค่าวิกฤต\n$f'(x)=6x^2+6x-12=0$\n" +
      '$x^2+x-2=(x+2)(x-1)=0\\;\\Rightarrow\\;x_c=-2,\\,1$',
  },
  {
    n: '02',
    text:
      "ขั้นที่ 2 เช็กด้วยอนุพันธ์อันดับสอง $f''(x)=12x+6$\n" +
      "$f''(-2)=-18<0\\;\\Rightarrow\\;x=-2$ ให้ค่าสูงสุด\n" +
      "$f''(1)=18>0\\;\\Rightarrow\\;x=1$ ให้ค่าต่ำสุด",
  },
  {
    n: '03',
    text:
      'ขั้นที่ 3 หาค่าสูงสุด/ต่ำสุด\n' +
      '$f(-2)=2(-2)^3+3(-2)^2-12(-2)+5=25$\n' +
      '$f(1)=2(1)^3+3(1)^2-12(1)+5=-2$',
  },
  {
    n: '04',
    text:
      'ช่วงเพิ่ม–ลด\n' +
      '$x^2+x-2>0\\;\\Rightarrow$ เพิ่มบน $(-\\infty,-2)\\cup(1,\\infty)$\n' +
      '$x^2+x-2<0\\;\\Rightarrow$ ลดบน $(-2,1)$',
  },
];

export const MAXMIN_ANSWER =
  'จุดสูงสุด $(-2,25)$ · จุดต่ำสุด $(1,-2)$\n' +
  'เพิ่มบนช่วง $(-\\infty,-2)\\cup(1,\\infty)$ · ลดบนช่วง $(-2,1)$';

/* ---------- 07 การอินทิเกรต ---------- */

export const INT_NOTATION = '$\\displaystyle\\int f(x)\\,dx=F(x)+c$';

export const INT_RULES = [
  '$\\displaystyle\\int k\\,dx=kx+c\\;;\\;k,c$ เป็นค่าคงตัว',
  '$\\displaystyle\\int k\\,f(x)\\,dx=k\\int f(x)\\,dx$',
  '$\\displaystyle\\int\\big[f(x)\\pm g(x)\\big]dx=\\int f(x)\\,dx\\pm\\int g(x)\\,dx$',
  '$\\displaystyle\\int x^n\\,dx=\\dfrac{x^{n+1}}{n+1}+c\\;;\\;n\\neq -1$',
  '$\\displaystyle\\int u^n\\,du=\\dfrac{u^{n+1}}{n+1}+c\\;;\\;n\\neq -1$',
  '$\\displaystyle\\int\\dfrac{1}{x}\\,dx=\\ln|x|+c$',
];

export const INT_EXAMPLE =
  '$\\displaystyle\\int(9x^2-4x+3)\\,dx=\\dfrac{9x^3}{3}-\\dfrac{4x^2}{2}+3x+c=3x^3-2x^2+3x+c$';

export const INT_TRICKS: TrickCard[] = [
  {
    name: 'อินทิเกรตค่าคงที่ เติม x',
    body: ["$y'=5\\;\\Rightarrow\\;y=5x+c$", "$y'=-3\\;\\Rightarrow\\;y=-3x+c$"],
  },
  {
    name: 'เพิ่มเลขยกกำลังไป 1 แล้วหารด้วยเลขยกกำลังนั้น',
    body: [
      "$y'=x^{12}\\;\\Rightarrow\\;y=\\dfrac{x^{13}}{13}+c$",
      "$y'=x^{2}\\;\\Rightarrow\\;y=\\dfrac{x^{3}}{3}+c$",
      "$y'=x^{40}\\;\\Rightarrow\\;y=\\dfrac{x^{41}}{41}+c$",
      "$y'=\\sqrt{x}=x^{1/2}\\;\\Rightarrow\\;y=\\dfrac{x^{3/2}}{3/2}+c$",
    ],
  },
  {
    name: 'ดึงค่าคงที่ไปไว้ข้างหน้า',
    body: [
      "$y'=12x^5\\;\\Rightarrow\\;y=12\\cdot\\dfrac{x^6}{6}+c=2x^6+c$",
      "$y'=2x^{-5}\\;\\Rightarrow\\;y=2\\cdot\\dfrac{x^{-4}}{-4}+c=-\\dfrac{x^{-4}}{2}+c$",
    ],
  },
  {
    name: 'แยกการบวกลบได้ / คูณกระจายก่อน',
    body: [
      "$y'=4x^2-3x+5\\;\\Rightarrow\\;y=\\dfrac{4x^3}{3}-\\dfrac{3x^2}{2}+5x+c$",
      "$y'=(2x-3)(x+1)^2\\;\\Rightarrow$ คูณกระจายก่อน",
      "$y'=\\dfrac{2x-3x^3+4}{x^3}=2x^{-2}-3+4x^{-3}\\;\\Rightarrow$ จัดรูปก่อน",
    ],
  },
];

/* ---------- 08 แคลคูลัสในงานวิศวกรรม ---------- */

export interface AppGroup {
  head: string;
  sub: string;
  items: { k: string; v: string }[];
}

export const APPS: AppGroup[] = [
  {
    head: 'พื้นฐานแคลคูลัสในงานวิศวกรรม',
    sub: 'Calculus Foundations in Engineering',
    items: [
      {
        k: 'อนุพันธ์ (Derivative)',
        v: 'การหาอัตราการเปลี่ยนแปลง ความเร็ว การปรับแต่งค่าให้เหมาะสมที่สุด (Optimization)',
      },
      {
        k: 'การอินทิเกรต (Integration)',
        v: 'การคำนวณพื้นที่ การสะสมของผลลัพธ์ ปริมาตร ปริมาณรวม',
      },
      {
        k: 'สมการเชิงอนุพันธ์ (Differential Equations)',
        v: 'การจำลองพฤติกรรมของระบบที่มีการเปลี่ยนแปลงตามเวลา',
      },
    ],
  },
  {
    head: 'Machine Learning & AI',
    sub: 'แคลคูลัสเบื้องหลังการเทรนโมเดล',
    items: [
      {
        k: 'Gradient Descent',
        v: 'หัวใจของการเทรน AI / Deep Learning ใช้ Partial Derivatives ในการหาจุดที่ความผิดพลาด (Loss Function) ต่ำที่สุด',
      },
      {
        k: 'Backpropagation',
        v: 'การปรับ Weight ใน Neural Network ผ่าน Chain Rule',
      },
      {
        k: 'Optimization',
        v: 'การปรับแต่งพารามิเตอร์ให้แบบจำลองทำนายได้แม่นยำที่สุด',
      },
    ],
  },
  {
    head: 'บทสรุป',
    sub: 'Conclusion',
    items: [
      {
        k: 'แคลคูลัสไม่ใช่แค่สูตรบนกระดาษ',
        v: 'แต่เป็น "ภาษาที่ใช้อธิบายการเปลี่ยนแปลง"',
      },
      {
        k: 'Computer Engineering',
        v: 'แคลคูลัสคือเครื่องมือขับเคลื่อน AI, กราฟิก และการประมวลผลข้อมูลขนาดใหญ่',
      },
      {
        k: 'Logistics Engineering',
        v: 'แคลคูลัสคือเครื่องมือตัดสินใจเพื่อประสิทธิภาพสูงสุดและต้นทุนต่ำสุด',
      },
    ],
  },
];

export const CASE_INTRO =
  'ในการเทรนโมเดล Machine Learning อย่างง่าย สมมติให้ฟังก์ชันความผิดพลาด ' +
  '(Loss Function: $L$) ขึ้นอยู่กับค่า Weight ($w$) ดังสมการ $L(w)=3w^2-12w+15$\n' +
  'จงหาค่า Weight ($w$) ที่ทำให้ค่า Loss ($L$) มีค่าน้อยที่สุด และหาค่า Loss ที่ต่ำที่สุดนั้น';

export const CASE_STEPS: Step[] = [
  {
    n: '01',
    text:
      'หาอนุพันธ์อันดับที่ 1 เพื่อหาจุดวิกฤต\n' +
      "$L'(w)=\\dfrac{d}{dw}\\big(3w^2-12w+15\\big)=6w-12$",
  },
  {
    n: '02',
    text: 'จับอนุพันธ์เท่ากับ 0 เพื่อหาค่า $w$\n$6w-12=0\\;\\Rightarrow\\;6w=12\\;\\Rightarrow\\;w=2$',
  },
  {
    n: '03',
    text:
      'ตรวจสอบด้วยอนุพันธ์อันดับที่ 2 (Second Derivative Test)\n' +
      "$L''(w)=6>0\\;\\Rightarrow$ ที่ $w=2$ ให้ค่าต่ำสุดสัมพัทธ์",
  },
  {
    n: '04',
    text: 'คำนวณค่า Loss ที่ต่ำที่สุด\n$L(2)=3(2)^2-12(2)+15=12-24+15=3$',
  },
];

export const CASE_ANSWER = 'คำตอบ: $w=2$ ให้ค่า Loss ต่ำที่สุดเท่ากับ $3$';

/* ---------- 09 เกณฑ์และขอบเขต ---------- */

export const SCORING = [
  { n: '1', v: 'คะแนนสอบ' },
  { n: '2', v: 'งานที่ได้รับมอบหมายในห้องเรียน' },
  { n: '3', v: 'งานที่ได้รับมอบหมายนอกห้องเรียน' },
  { n: '4', v: 'การมีส่วนร่วมในชั้นเรียน' },
];

export const PAGE_RANGES = [
  { n: '1', v: '1–29' },
  { n: '2', v: '30–66' },
  { n: '3', v: '67–103' },
  { n: '4', v: '104–134' },
];
