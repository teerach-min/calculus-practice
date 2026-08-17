'use client';

import { Progress, accuracy } from '@/lib/progress';
import { TOPIC_LABELS } from '@/lib/generators';

const pad = (n: number) => String(n).padStart(2, '0');

/** แถบแสดงสัดส่วนตอบถูก */
function Bar({ correct, attempts }: { correct: number; attempts: number }) {
  const pct = attempts === 0 ? 0 : (correct / attempts) * 100;
  return (
    <div className="bar" aria-hidden="true">
      <div className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function StatsPanel({
  progress,
  onSelectTopic,
  onReset,
}: {
  progress: Progress;
  onSelectTopic: (index: number) => void;
  onReset: () => void;
}) {
  const played = TOPIC_LABELS.map((label, i) => ({
    i,
    label,
    stat: progress.topics[i] ?? { attempts: 0, correct: 0 },
  })).filter((t) => t.stat.attempts > 0);

  return (
    <section className="card stats">
      <div className="card-head">
        <div>
          <div className="card-kicker">สถิติของคุณ</div>
          <h2>ความคืบหน้ารายหัวข้อ</h2>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={onReset}
        >
          ล้างคะแนน
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-tile">
          <div className="score-label">ตอบถูก</div>
          <div className="score-value">{progress.totals.correct}</div>
        </div>
        <div className="stat-tile">
          <div className="score-label">ทำไปแล้ว</div>
          <div className="score-value">{progress.totals.attempts}</div>
        </div>
        <div className="stat-tile">
          <div className="score-label">ความแม่นยำ</div>
          <div className="score-value">
            {accuracy(progress.totals.attempts, progress.totals.correct)}%
          </div>
        </div>
        <div className="stat-tile">
          <div className="score-label">สตรีคดีสุด</div>
          <div className="score-value">{progress.streak.best}</div>
        </div>
      </div>

      {played.length === 0 ? (
        <p className="stats-empty">
          ยังไม่มีสถิติ — ลองตรวจคำตอบสักข้อแล้วกลับมาดูใหม่
        </p>
      ) : (
        <table className="stats-table">
          <thead>
            <tr>
              <th>หัวข้อ</th>
              <th>ถูก / ทำ</th>
              <th>ความแม่นยำ</th>
              <th aria-label="สัดส่วน" />
            </tr>
          </thead>
          <tbody>
            {played.map(({ i, label, stat }) => (
              <tr key={i}>
                <td>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => onSelectTopic(i)}
                  >
                    <span className="nav-num">{pad(i + 1)}</span> {label}
                  </button>
                </td>
                <td className="num">
                  {stat.correct} / {stat.attempts}
                </td>
                <td className="num">{accuracy(stat.attempts, stat.correct)}%</td>
                <td className="bar-cell">
                  <Bar correct={stat.correct} attempts={stat.attempts} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="stats-note">
        คะแนนทั้งหมดเก็บอยู่ในเบราว์เซอร์เครื่องนี้ (localStorage)
        ถ้าล้างข้อมูลเบราว์เซอร์หรือเปลี่ยนเครื่อง สถิติจะไม่ตามไปด้วย
      </p>
    </section>
  );
}
