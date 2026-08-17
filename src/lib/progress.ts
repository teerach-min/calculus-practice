/**
 * เก็บคะแนนและสถิติการเล่นไว้ใน localStorage ของเครื่องผู้ใช้
 * แยกกุญแจตาม Google user id เพื่อให้หลายคนใช้เครื่องเดียวกันได้โดยไม่ปนกัน
 */

export interface TopicStat {
  attempts: number;
  correct: number;
  /** เวลาที่ตอบถูกล่าสุด (ISO) */
  lastCorrectAt?: string;
}

export interface Progress {
  version: 1;
  totals: { attempts: number; correct: number };
  streak: { current: number; best: number };
  /** สถิติรายหัวข้อ key = ลำดับหัวข้อ (0-based) */
  topics: Record<number, TopicStat>;
  startedAt: string;
  updatedAt: string;
}

const PREFIX = 'calcpractice:progress:';

export function emptyProgress(): Progress {
  const now = new Date().toISOString();
  return {
    version: 1,
    totals: { attempts: 0, correct: 0 },
    streak: { current: 0, best: 0 },
    topics: {},
    startedAt: now,
    updatedAt: now,
  };
}

function keyFor(userKey: string) {
  return PREFIX + userKey;
}

export function loadProgress(userKey: string): Progress {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const raw = window.localStorage.getItem(keyFor(userKey));
    if (!raw) return emptyProgress();
    const p = JSON.parse(raw) as Progress;
    if (p?.version !== 1 || !p.totals || !p.topics) return emptyProgress();
    // เติมฟิลด์ที่อาจหายไปจากเวอร์ชันเก่า
    p.streak = p.streak ?? { current: 0, best: 0 };
    return p;
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(userKey: string, p: Progress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(keyFor(userKey), JSON.stringify(p));
  } catch {
    /* พื้นที่เต็มหรือโหมดส่วนตัว — ข้ามไป */
  }
}

/** บันทึกผลการตอบหนึ่งครั้ง คืนค่า progress ชุดใหม่ (ไม่แก้ของเดิม) */
export function recordAttempt(
  prev: Progress,
  topicIndex: number,
  isCorrect: boolean,
): Progress {
  const topic = prev.topics[topicIndex] ?? { attempts: 0, correct: 0 };
  const current = isCorrect ? prev.streak.current + 1 : 0;

  return {
    ...prev,
    totals: {
      attempts: prev.totals.attempts + 1,
      correct: prev.totals.correct + (isCorrect ? 1 : 0),
    },
    streak: { current, best: Math.max(prev.streak.best, current) },
    topics: {
      ...prev.topics,
      [topicIndex]: {
        attempts: topic.attempts + 1,
        correct: topic.correct + (isCorrect ? 1 : 0),
        lastCorrectAt: isCorrect ? new Date().toISOString() : topic.lastCorrectAt,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}

export function clearProgress(userKey: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(keyFor(userKey));
  } catch {
    /* ไม่เป็นไร */
  }
}

/** ความแม่นยำเป็นเปอร์เซ็นต์ (ปัดเป็นจำนวนเต็ม) */
export function accuracy(attempts: number, correct: number): number {
  if (attempts === 0) return 0;
  return Math.round((correct / attempts) * 100);
}
