'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { GENERATORS, Problem, TOPIC_LABELS } from '@/lib/generators';
import { verifyAnswer } from '@/lib/check';
import {
  Progress,
  accuracy,
  emptyProgress,
  loadProgress,
  recordAttempt,
  saveProgress,
} from '@/lib/progress';
import type { AuthState } from '@/lib/auth';
import { MathText } from './MathText';
import AnswerPreview from './AnswerPreview';
import StatsPanel from './StatsPanel';

type Status = 'ok' | 'no' | null;

const pad = (n: number) => String(n).padStart(2, '0');

export default function PracticeApp({ auth }: { auth: AuthState }) {
  const { profile, userKey, isGuest, signOut } = auth;

  const [idx, setIdx] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [showFormula, setShowFormula] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [showStats, setShowStats] = useState(false);

  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [progressReady, setProgressReady] = useState(false);

  // สุ่มโจทย์ฝั่ง client เท่านั้น เพื่อไม่ให้ HTML จาก server ไม่ตรงกัน
  useEffect(() => {
    setProblem(GENERATORS[0]());
  }, []);

  // โหลดคะแนนของผู้ใช้คนนี้จาก localStorage
  useEffect(() => {
    setProgress(loadProgress(userKey));
    setProgressReady(true);
  }, [userKey]);

  const load = useCallback((i: number) => {
    setIdx(i);
    setProblem(GENERATORS[i]());
    setInput('');
    setOpen(false);
    setStatus(null);
  }, []);

  const check = useCallback(() => {
    if (!problem || !input.trim()) return;
    const ok = verifyAnswer(input, problem.check);
    setStatus(ok ? 'ok' : 'no');
    if (!ok) setOpen(true);

    setProgress((prev) => {
      const next = recordAttempt(prev, idx, ok);
      saveProgress(userKey, next);
      return next;
    });
  }, [problem, input, idx, userKey]);

  const resetProgress = useCallback(() => {
    if (!window.confirm('ล้างคะแนนและสถิติทั้งหมดในเครื่องนี้?')) return;
    const fresh = emptyProgress();
    setProgress(fresh);
    saveProgress(userKey, fresh);
  }, [userKey]);

  const total = progress.totals;

  return (
    <div className="page">
      <div className="container">
        <header className="masthead">
          <div>
            <div className="eyebrow">Basic Calculus · แบบทดสอบ 1</div>
            <h1>ฝึกแคลคูลัสเบื้องต้น</h1>
            <p className="lede">
              18 หัวข้อจากแบบทดสอบ สุ่มโจทย์ใหม่ได้ไม่จำกัด กรอกคำตอบเพื่อตรวจ
              หรือกดดูวิธีทำทีละขั้น
            </p>
          </div>

          <div className="masthead-right">
            <Link href="/reference" className="btn btn-dark btn-link">
              สรุปสูตรและนิยาม →
            </Link>
            {profile && (
              <div className="user-chip">
                {profile.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.picture}
                    alt=""
                    width={34}
                    height={34}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="avatar-fallback">
                    {profile.name.slice(0, 1)}
                  </span>
                )}
                <span className="user-meta">
                  <span className="user-name">{profile.name}</span>
                  <span className="user-email">{profile.email}</span>
                </span>
                <button type="button" className="link-button" onClick={signOut}>
                  ออก
                </button>
              </div>
            )}
            {isGuest && (
              <div className="user-chip">
                <span className="avatar-fallback">?</span>
                <span className="user-meta">
                  <span className="user-name">ผู้เยี่ยมชม</span>
                  <span className="user-email">โหมดทดลอง</span>
                </span>
              </div>
            )}

            <div className="scoreboard">
              <div className="score">
                <div className="score-label">ถูก</div>
                <div className="score-value">{progressReady ? total.correct : 0}</div>
              </div>
              <div className="score">
                <div className="score-label">ทำไปแล้ว</div>
                <div className="score-value">
                  {progressReady ? total.attempts : 0}
                </div>
              </div>
              <div className="score">
                <div className="score-label">สตรีค</div>
                <div className="score-value">
                  {progressReady ? progress.streak.current : 0}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="shell">
          <nav className="nav">
            <div className="nav-title">หัวข้อทั้งหมด</div>
            <div className="nav-list">
              {TOPIC_LABELS.map((label, i) => {
                const s = progress.topics[i];
                return (
                  <button
                    key={label}
                    type="button"
                    className="nav-item"
                    aria-current={i === idx}
                    onClick={() => load(i)}
                  >
                    <span className="nav-num">{pad(i + 1)}</span>
                    <span className="nav-label">{label}</span>
                    {s && s.attempts > 0 && (
                      <span className="nav-badge" title={`ตอบถูก ${s.correct} จาก ${s.attempts}`}>
                        {s.correct}/{s.attempts}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          <main className="main">
            <section className="card">
              <div className="card-head">
                <div>
                  <div className="card-kicker">
                    ข้อ {pad(idx + 1)} · {problem?.cat ?? '—'}
                  </div>
                  <h2>{problem?.title ?? TOPIC_LABELS[idx]}</h2>
                </div>
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={() => load(idx)}
                >
                  ↻ สุ่มโจทย์ใหม่
                </button>
              </div>

              {problem && showFormula && (
                <div className="formula-bar">
                  <span className="formula-tag">สูตร</span>
                  <MathText className="formula-body">{problem.formula}</MathText>
                </div>
              )}

              {problem ? (
                <MathText className="question">{problem.question}</MathText>
              ) : (
                <div className="question" style={{ opacity: 0.4 }}>
                  กำลังสุ่มโจทย์…
                </div>
              )}

              {problem && showHint && (
                <MathText className="hint">{`คำใบ้: ${problem.hint}`}</MathText>
              )}

              <div className="answer-row">
                <input
                  className="answer-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') check();
                  }}
                  placeholder="พิมพ์คำตอบ เช่น 6x^2-10x+7"
                  aria-label="คำตอบ"
                />
                <button type="button" className="btn btn-primary" onClick={check}>
                  ตรวจคำตอบ
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setOpen((v) => !v)}
                >
                  {open ? 'ซ่อนเฉลย' : 'ดูเฉลย'}
                </button>
              </div>

              <AnswerPreview value={input} />

              {status && (
                <div
                  className={`status ${status === 'ok' ? 'status-ok' : 'status-no'}`}
                >
                  {status === 'ok'
                    ? `✓ ถูกต้อง — สตรีค ${progress.streak.current}`
                    : 'ยังไม่ถูก — ลองดูวิธีทำด้านล่าง แล้วกดสุ่มโจทย์ใหม่'}
                </div>
              )}
            </section>

            {problem && open && (
              <section className="solution">
                <div className="solution-head">
                  <span className="solution-tag">วิธีทำ</span>
                  <MathText className="solution-answer">
                    {`คำตอบ: ${problem.answer}`}
                  </MathText>
                </div>
                <ol className="solution-steps">
                  {problem.steps.map((step, i) => (
                    <li key={i}>
                      <span className="step-num">{pad(i + 1)}</span>
                      <MathText className="step-body">{step}</MathText>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <div className="toolbar">
              <label>
                <input
                  type="checkbox"
                  checked={showFormula}
                  onChange={(e) => setShowFormula(e.target.checked)}
                />
                แสดงสูตร
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showHint}
                  onChange={(e) => setShowHint(e.target.checked)}
                />
                แสดงคำใบ้
              </label>
              <button
                type="button"
                className="link-button"
                onClick={() => setShowStats((v) => !v)}
              >
                {showStats ? 'ซ่อนสถิติ' : 'ดูสถิติของฉัน'}
                {total.attempts > 0 &&
                  ` (${accuracy(total.attempts, total.correct)}%)`}
              </button>
            </div>

            {showStats && (
              <StatsPanel
                progress={progress}
                onSelectTopic={(i) => {
                  load(i);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onReset={resetProgress}
              />
            )}

            <p className="footnote">
              พิมพ์เลขยกกำลังด้วย ^ (เช่น x^2) · รากที่สองใช้ sqrt( ) ·
              เศษส่วนพิมพ์ 5/3 ได้เลย · อินทิเกรตไม่ต้องใส่ +C ก็ได้ · กด Enter
              เพื่อตรวจคำตอบ
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
