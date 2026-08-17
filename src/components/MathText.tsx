import katex from 'katex';
import React from 'react';

/**
 * เรนเดอร์ข้อความไทยที่มีสูตรคณิตศาสตร์ปนอยู่
 *
 * รูปแบบที่รองรับ
 *   $ ... $    สูตรอินไลน์ (แทรกกลางประโยค)
 *   $$ ... $$  สูตรแบบแสดงกลางบรรทัด (ตัวใหญ่ ขึ้นบรรทัดใหม่)
 *   \n         ขึ้นบรรทัดใหม่
 */

type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'inline'; value: string }
  | { kind: 'display'; value: string };

const PATTERN = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;

export function parseMathText(src: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  PATTERN.lastIndex = 0;
  while ((m = PATTERN.exec(src)) !== null) {
    if (m.index > last) {
      out.push({ kind: 'text', value: src.slice(last, m.index) });
    }
    if (m[1] !== undefined) out.push({ kind: 'display', value: m[1] });
    else out.push({ kind: 'inline', value: m[2] });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ kind: 'text', value: src.slice(last) });
  return out;
}

function tex(value: string, displayMode: boolean): string {
  return katex.renderToString(value.trim(), {
    displayMode,
    throwOnError: false,
    strict: false,
    trust: false,
    output: 'html',
  });
}

function TextRun({ value }: { value: string }) {
  const lines = value.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ))}
    </>
  );
}

export function MathText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const segments = parseMathText(children);

  return (
    <div className={className}>
      {segments.map((s, i) => {
        if (s.kind === 'text') {
          // สูตรแบบ display เป็นบล็อกอยู่แล้ว จึงตัดบรรทัดใหม่ที่ติดกับมันออก
          // ไม่งั้นจะเว้นช่องว่างซ้ำซ้อน
          let value = s.value;
          if (segments[i - 1]?.kind === 'display') value = value.replace(/^\n+/, '');
          if (segments[i + 1]?.kind === 'display') value = value.replace(/\n+$/, '');
          // ตัดทิ้งเฉพาะตอนที่ไม่เหลืออะไรเลย — ห้ามตัดช่องว่างหรือ \n ที่คั่น
          // ระหว่างสูตรอินไลน์สองอัน ไม่งั้นสองบรรทัดจะมาต่อกันเป็นบรรทัดเดียว
          if (value === '') return null;
          return <TextRun key={i} value={value} />;
        }
        if (s.kind === 'inline') {
          return (
            <span
              key={i}
              className="math-inline"
              dangerouslySetInnerHTML={{ __html: tex(s.value, false) }}
            />
          );
        }
        return (
          <span
            key={i}
            className="math-display"
            dangerouslySetInnerHTML={{ __html: tex(s.value, true) }}
          />
        );
      })}
    </div>
  );
}

/** เรนเดอร์ LaTeX ล้วน ๆ (ไม่ต้องมี $ ครอบ) */
export function Math({
  latex,
  display = false,
  className,
}: {
  latex: string;
  display?: boolean;
  className?: string;
}) {
  return (
    <span
      className={[display ? 'math-display' : 'math-inline', className]
        .filter(Boolean)
        .join(' ')}
      dangerouslySetInnerHTML={{ __html: tex(latex, display) }}
    />
  );
}
