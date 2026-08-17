'use client';

import { useMemo } from 'react';
import { Math } from './MathText';
import { toLatex } from '@/lib/toLatex';

/**
 * พรีวิวสมการใต้ช่องกรอกคำตอบ
 * แปลงข้อความที่พิมพ์เป็น LaTeX แบบเรียลไทม์
 * ถ้าแปลงไม่ได้ (เช่น พิมพ์ภาษาไทย) จะโชว์ข้อความดิบแทน
 */
export default function AnswerPreview({ value }: { value: string }) {
  const latex = useMemo(() => toLatex(value), [value]);
  const empty = !value.trim();

  return (
    <div className="preview">
      <span className="preview-tag">พรีวิว</span>
      <div className="preview-body">
        {empty ? (
          <span className="preview-raw" style={{ opacity: 0.55 }}>
            พิมพ์คำตอบแล้วสมการจะขึ้นตรงนี้
          </span>
        ) : latex ? (
          <Math latex={latex} />
        ) : (
          <span className="preview-raw">{value}</span>
        )}
      </div>
    </div>
  );
}
