/**
 * Google Sign-In ฝั่ง client ล้วน (Google Identity Services)
 *
 * ไม่มีหลังบ้าน: หน้าเว็บขอ ID token (JWT) จาก Google โดยตรง
 * แล้วส่ง token ดิบไปให้ Apps Script ตรวจสอบอีกที (ดู src/lib/sheet.ts)
 * ส่วนหน้าเว็บถอด payload ออกมาแค่เพื่อแสดงชื่อ/รูปเท่านั้น
 */

export interface GoogleProfile {
  /** รหัสผู้ใช้ถาวรของ Google — ใช้เป็น key หลัก */
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export interface Session {
  profile: GoogleProfile;
  /** เวลาที่ล็อกอิน (ISO string) */
  signedInAt: string;
}

/** สถานะการล็อกอินที่ส่งต่อให้หน้าเล่นโจทย์ */
export interface AuthState {
  profile: GoogleProfile | null;
  /** กุญแจสำหรับแยกข้อมูลใน localStorage */
  userKey: string;
  isGuest: boolean;
  signOut: () => void;
}

export const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

/** ยังไม่ได้ตั้งค่า client id → เข้าโหมดทดลอง (guest) แทนที่จะพังทั้งหน้า */
export const AUTH_CONFIGURED = CLIENT_ID.length > 0;

const SESSION_KEY = 'calcpractice:session';
const SESSION_MAX_AGE_DAYS = 30;

/* ---------- โหลดสคริปต์ของ Google ---------- */

const GIS_SRC = 'https://accounts.google.com/gsi/client';
let gisPromise: Promise<void> | null = null;

export function loadGis(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisPromise) return gisPromise;

  gisPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gis load failed')));
      return;
    }
    const el = document.createElement('script');
    el.src = GIS_SRC;
    el.async = true;
    el.defer = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('gis load failed'));
    document.head.appendChild(el);
  });

  return gisPromise;
}

/* ---------- ถอด JWT ---------- */

interface IdTokenPayload extends GoogleProfile {
  aud: string;
  exp: number;
  iss: string;
}

/** ถอด payload ของ ID token — ไม่ได้ตรวจลายเซ็น (Apps Script เป็นคนตรวจ) */
export function decodeIdToken(jwt: string): IdTokenPayload | null {
  try {
    const part = jwt.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const bytes = atob(padded);
    const json = decodeURIComponent(
      Array.from(bytes)
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    const p = JSON.parse(json) as Partial<IdTokenPayload>;
    if (!p.sub || !p.email) return null;
    return {
      sub: p.sub,
      email: p.email,
      name: p.name || p.email,
      picture: p.picture || '',
      aud: p.aud || '',
      exp: Number(p.exp) || 0,
      iss: p.iss || '',
    };
  } catch {
    return null;
  }
}

/* ---------- เก็บ session ไว้ในเครื่อง ---------- */

export function loadSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s?.profile?.sub) return null;
    const age = Date.now() - new Date(s.signedInAt).getTime();
    if (age > SESSION_MAX_AGE_DAYS * 864e5) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function saveSession(profile: GoogleProfile): Session {
  const session: Session = { profile, signedInAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* โหมดส่วนตัวบางเบราว์เซอร์เขียนไม่ได้ — ปล่อยผ่าน */
  }
  return session;
}

export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ไม่เป็นไร */
  }
  try {
    window.google?.accounts?.id?.disableAutoSelect();
  } catch {
    /* ไม่เป็นไร */
  }
}

/* ---------- ชนิดข้อมูลของ GIS ---------- */

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize(config: {
            client_id: string;
            callback: (res: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }): void;
          renderButton(
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'small' | 'medium' | 'large';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
              locale?: string;
            },
          ): void;
          prompt(): void;
          disableAutoSelect(): void;
        };
      };
    };
  }
}
