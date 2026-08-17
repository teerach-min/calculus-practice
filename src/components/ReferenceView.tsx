'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MathText } from './MathText';
import {
  APPS,
  CASE_ANSWER,
  CASE_INTRO,
  CASE_STEPS,
  CONJUGATE,
  CONTINUITY_CONCLUSION,
  CONTINUITY_EXAMPLE,
  CONTINUITY_RULE,
  CONTINUITY_STEPS,
  CRITICAL_INTRO,
  CURVE_SLOPE,
  DEFINITION,
  DERIV_EXTRA,
  DERIV_NOTATION,
  DERIV_RULES,
  DERIV_TRICKS,
  FACTOR_FORMS,
  FIRST_TRY,
  INT_EXAMPLE,
  INT_NOTATION,
  INT_RULES,
  INT_TRICKS,
  LIMIT_CASES,
  LIMIT_PATTERNS,
  LINE_BUILD,
  LINE_SLOPE,
  MAXMIN_ANSWER,
  MAXMIN_FN,
  MAXMIN_METHOD,
  MAXMIN_STEPS,
  MONOTONIC,
  PAGE_RANGES,
  PLAIN_MEANING,
  PLAIN_MEANING_EXAMPLES,
  SCORING,
  SIDE_LIMITS,
  SIDE_LIMITS_RESULT,
  SLOPE_FACTS,
  THEOREM,
  THREE_CONDITIONS,
  TOC,
  type Step,
  type TrickCard,
} from '@/lib/reference';

/* ---------- ชิ้นส่วนที่ใช้ซ้ำ ---------- */

function SectionHead({
  num,
  title,
  aside,
}: {
  num: string;
  title: string;
  aside?: string;
}) {
  return (
    <div className="ref-sechead">
      <span className="ref-secnum">{num}</span>
      <h2>{title}</h2>
      <span className="ref-rule" />
      {aside && <MathText className="ref-aside">{aside}</MathText>}
    </div>
  );
}

/** รายการสูตรเรียงลงมา แต่ละบรรทัดเรนเดอร์เป็นสมการ */
function MathList({ items, gap = 10 }: { items: string[]; gap?: number }) {
  return (
    <div className="ref-mathlist" style={{ gap }}>
      {items.map((s, i) => (
        <MathText key={i}>{s}</MathText>
      ))}
    </div>
  );
}

function StepRow({ step, dark = false }: { step: Step; dark?: boolean }) {
  return (
    <div className={`ref-step${dark ? ' ref-step-dark' : ''}`}>
      <span className="step-num">{step.n}</span>
      <MathText className="step-body">{step.text}</MathText>
    </div>
  );
}

function TrickArticle({ card }: { card: TrickCard }) {
  return (
    <article className="ref-card">
      <h3>{card.name}</h3>
      <div className="ref-card-body">
        <MathList items={card.body} gap={12} />
      </div>
    </article>
  );
}

/* ---------- หน้าเต็ม ---------- */

export default function ReferenceView() {
  const [active, setActive] = useState(TOC[0].id);

  // ไฮไลต์หัวข้อในสารบัญตามตำแหน่งที่เลื่อนอยู่
  useEffect(() => {
    const sections = TOC.map((t) => document.getElementById(t.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <header className="masthead">
          <div>
            <div className="eyebrow">Pre-Calculus · สรุปเนื้อหาบทเรียน</div>
            <h1>สรุปสูตรและนิยาม</h1>
            <p className="lede" style={{ maxWidth: '58ch' }}>
              ลิมิต ความต่อเนื่อง อนุพันธ์ การประยุกต์ และการอินทิเกรต —
              เรียบเรียงจากสไลด์ Pre-Calculus พร้อมตัวอย่างตามต้นฉบับ
            </p>
          </div>
          <Link href="/" className="btn btn-dark btn-link">
            ไปหน้าแบบฝึกหัด →
          </Link>
        </header>

        <div className="shell ref-shell">
          <nav className="nav">
            <div className="nav-title">หัวข้อ</div>
            <div className="nav-list">
              {TOC.map((t) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className="nav-item"
                  aria-current={active === t.id}
                >
                  <span className="nav-num">{t.num}</span>
                  <span className="nav-label">{t.title}</span>
                </a>
              ))}
            </div>
          </nav>

          <main className="main ref-main">
            {/* ---------- 01 ---------- */}
            <section id="s1" className="ref-section">
              <SectionHead num="01" title="ลิมิตของฟังก์ชัน" />

              <article className="ref-card">
                <div className="ref-tag">บทนิยาม</div>
                <MathText className="ref-prose">{DEFINITION}</MathText>

                <div className="ref-callout">
                  <div className="ref-callout-tag">ทฤษฎีบท</div>
                  <MathText className="ref-callout-body">{THEOREM}</MathText>
                </div>

                <div className="ref-conds">
                  <MathText>{THREE_CONDITIONS.intro}</MathText>
                  <ol>
                    {THREE_CONDITIONS.items.map((c, i) => (
                      <li key={i}>
                        <MathText>{c}</MathText>
                      </li>
                    ))}
                  </ol>
                </div>
              </article>

              <div className="ref-two">
                <article className="ref-card">
                  <h3>ลิมิตซ้าย – ลิมิตขวา</h3>
                  <div className="ref-card-body">
                    <MathList items={SIDE_LIMITS} />
                  </div>
                  <div className="ref-divider">
                    <MathList items={SIDE_LIMITS_RESULT} />
                  </div>
                </article>

                <article className="ref-card">
                  <h3>ความหมายอย่างง่าย</h3>
                  <div className="ref-card-body">
                    <MathText>{PLAIN_MEANING}</MathText>
                    <div style={{ marginTop: 12 }}>
                      <MathList items={PLAIN_MEANING_EXAMPLES} />
                    </div>
                  </div>
                </article>
              </div>
            </section>

            {/* ---------- 02 ---------- */}
            <section id="s2" className="ref-section">
              <SectionHead num="02" title="การหาลิมิตและการจัดรูป" />

              <article className="ref-card">
                <MathText className="ref-prose">{FIRST_TRY}</MathText>
                <div className="ref-cases">
                  {LIMIT_CASES.map((c, i) => (
                    <div key={i} className="ref-case">
                      <MathText className="ref-case-form">{`$${c.form}$`}</MathText>
                      <div className="ref-case-rule">
                        <MathText>{c.rule}</MathText>
                        {c.example && (
                          <MathText className="ref-case-ex">{c.example}</MathText>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <div className="ref-two">
                <article className="ref-card">
                  <h3>แยกตัวประกอบ</h3>
                  <div className="ref-card-body">
                    <MathList items={FACTOR_FORMS} />
                  </div>
                </article>

                <article className="ref-card">
                  <h3>คูณคอนจูเกต</h3>
                  <div className="ref-card-body">
                    <MathText>{CONJUGATE.note}</MathText>
                    <div style={{ marginTop: 8 }}>
                      <MathText>{CONJUGATE.formula}</MathText>
                    </div>
                  </div>
                  <div className="ref-divider">
                    <MathText>{CONJUGATE.zeroOverZero}</MathText>
                  </div>
                </article>
              </div>

              <article className="ref-card ref-card-flush">
                <div className="ref-card-head">
                  <h3>สี่แบบของการหาค่าลิมิต</h3>
                </div>
                <div className="ref-patterns">
                  {LIMIT_PATTERNS.map((p) => (
                    <div key={p.no} className="ref-pattern">
                      <div className="ref-pattern-head">
                        <span className="ref-chip">{p.no}</span>
                        <span className="ref-pattern-name">{p.name}</span>
                      </div>
                      <div className="ref-pattern-work">
                        <MathList items={p.work} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            {/* ---------- 03 ---------- */}
            <section id="s3" className="ref-section">
              <SectionHead num="03" title="ความต่อเนื่องของฟังก์ชัน" />

              <article className="ref-card">
                <div className="ref-callout ref-callout-top">
                  <MathText className="ref-callout-body">{CONTINUITY_RULE}</MathText>
                </div>

                <div className="ref-tag" style={{ marginTop: 16 }}>
                  ตัวอย่าง
                </div>
                <div style={{ marginTop: 10 }}>
                  <MathList items={CONTINUITY_EXAMPLE} gap={14} />
                </div>

                <div className="ref-steps">
                  {CONTINUITY_STEPS.map((s) => (
                    <StepRow key={s.n} step={s} />
                  ))}
                </div>

                <MathText className="ref-conclusion">
                  {CONTINUITY_CONCLUSION}
                </MathText>
              </article>
            </section>

            {/* ---------- 04 ---------- */}
            <section id="s4" className="ref-section">
              <SectionHead num="04" title="อนุพันธ์" aside={DERIV_NOTATION} />

              <article className="ref-card ref-card-flush">
                <div className="ref-card-head">
                  <h3>สูตรอนุพันธ์ สรุป</h3>
                </div>
                <div className="ref-rules ref-rules-two">
                  {DERIV_RULES.map((t, i) => (
                    <div key={i} className="ref-rule-row">
                      <span className="ref-rule-num">{i + 1}</span>
                      <MathText>{t}</MathText>
                    </div>
                  ))}
                </div>
                <div className="ref-card-foot">
                  <div className="ref-tag">สูตรเพิ่มเติมจากตารางสรุป</div>
                  <div style={{ marginTop: 12 }}>
                    <MathList items={DERIV_EXTRA} gap={12} />
                  </div>
                </div>
              </article>

              <div className="ref-two">
                {DERIV_TRICKS.map((t) => (
                  <TrickArticle key={t.name} card={t} />
                ))}
              </div>
            </section>

            {/* ---------- 05 ---------- */}
            <section id="s5" className="ref-section">
              <SectionHead num="05" title="ความชันและเส้นสัมผัส" />

              <div className="ref-two">
                <article className="ref-card">
                  <h3>เส้นโค้ง</h3>
                  <div className="ref-card-body">
                    <MathList items={CURVE_SLOPE} />
                  </div>
                </article>
                <article className="ref-card">
                  <h3>เส้นตรง</h3>
                  <div className="ref-card-body">
                    <MathList items={LINE_SLOPE} gap={12} />
                  </div>
                </article>
              </div>

              <article className="ref-card">
                <div className="ref-facts">
                  {SLOPE_FACTS.map((f, i) => (
                    <MathText key={i}>{f}</MathText>
                  ))}
                </div>
                <div className="ref-callout">
                  <MathText>{LINE_BUILD.note}</MathText>
                  <MathText>{LINE_BUILD.formula}</MathText>
                </div>
              </article>
            </section>

            {/* ---------- 06 ---------- */}
            <section id="s6" className="ref-section">
              <SectionHead num="06" title="ค่าวิกฤต เพิ่ม–ลด สูงสุด–ต่ำสุด" />

              <article className="ref-card">
                <MathText className="ref-prose">{CRITICAL_INTRO}</MathText>

                <div className="ref-two" style={{ marginTop: 14 }}>
                  {MONOTONIC.map((m, i) => (
                    <div key={i} className="ref-tile">
                      <MathText className="ref-tile-label">{m.label}</MathText>
                      <div className="ref-tile-detail">{m.detail}</div>
                    </div>
                  ))}
                </div>

                <div className="ref-facts" style={{ marginTop: 16 }}>
                  {MAXMIN_METHOD.map((m, i) => (
                    <MathText key={i}>{m}</MathText>
                  ))}
                </div>
              </article>

              <article className="solution ref-dark">
                <div className="solution-head">
                  <h3>ตัวอย่างจากสไลด์</h3>
                  <MathText className="solution-answer">{MAXMIN_FN}</MathText>
                </div>
                <div className="ref-steps ref-steps-dark">
                  {MAXMIN_STEPS.map((s) => (
                    <StepRow key={s.n} step={s} dark />
                  ))}
                </div>
                <MathText className="ref-dark-foot">{MAXMIN_ANSWER}</MathText>
              </article>
            </section>

            {/* ---------- 07 ---------- */}
            <section id="s7" className="ref-section">
              <SectionHead num="07" title="การอินทิเกรต" aside={INT_NOTATION} />

              <article className="ref-card ref-card-flush">
                <div className="ref-card-head">
                  <h3>สูตรการอินทิเกรต</h3>
                </div>
                <div className="ref-rules">
                  {INT_RULES.map((t, i) => (
                    <div key={i} className="ref-rule-row">
                      <span className="ref-rule-num">{i + 1}</span>
                      <MathText>{t}</MathText>
                    </div>
                  ))}
                </div>
                <div className="ref-card-foot">
                  <div className="ref-tag">ตัวอย่าง</div>
                  <div style={{ marginTop: 12 }}>
                    <MathText>{INT_EXAMPLE}</MathText>
                  </div>
                </div>
              </article>

              <div className="ref-two">
                {INT_TRICKS.map((t) => (
                  <TrickArticle key={t.name} card={t} />
                ))}
              </div>
            </section>

            {/* ---------- 08 ---------- */}
            <section id="s8" className="ref-section">
              <SectionHead num="08" title="แคลคูลัสในงานวิศวกรรม" />

              {APPS.map((a) => (
                <article key={a.head} className="ref-card">
                  <h3>{a.head}</h3>
                  <div className="ref-sub">{a.sub}</div>
                  <div className="ref-kv">
                    {a.items.map((it) => (
                      <div key={it.k} className="ref-kv-row">
                        <span className="ref-kv-key">{it.k}</span>
                        <span className="ref-kv-val">{it.v}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}

              <article className="solution ref-dark">
                <div className="solution-head ref-case-head">
                  <div>
                    <h3>กรณีศึกษา: หาค่าพารามิเตอร์ที่ทำให้ Loss ต่ำที่สุด</h3>
                    <div className="ref-case-sub">Gradient Descent Basis</div>
                  </div>
                </div>
                <MathText className="ref-case-intro">{CASE_INTRO}</MathText>
                <div className="ref-steps ref-steps-dark">
                  {CASE_STEPS.map((s) => (
                    <StepRow key={s.n} step={s} dark />
                  ))}
                </div>
                <MathText className="ref-dark-foot">{CASE_ANSWER}</MathText>
              </article>
            </section>

            {/* ---------- 09 ---------- */}
            <section id="s9" className="ref-section">
              <SectionHead num="09" title="เกณฑ์และขอบเขต" />

              <div className="ref-two">
                <article className="ref-card">
                  <div className="ref-tag">การให้คะแนน</div>
                  <div className="ref-list">
                    {SCORING.map((s) => (
                      <div key={s.n} className="ref-list-row">
                        <span className="ref-list-num">{s.n}</span>
                        <span>{s.v}</span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="ref-card">
                  <div className="ref-tag">ขอบเขตเนื้อหา (หน้า)</div>
                  <div className="ref-list">
                    {PAGE_RANGES.map((r) => (
                      <div key={r.n} className="ref-list-row">
                        <span className="ref-list-num">{r.n}</span>
                        <span className="ref-mono">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </section>

            <Link href="/" className="btn btn-dark btn-link ref-cta">
              ฝึกทำโจทย์สุ่ม 18 หัวข้อ →
            </Link>
          </main>
        </div>
      </div>
    </div>
  );
}
