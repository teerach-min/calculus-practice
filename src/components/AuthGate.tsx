'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AUTH_CONFIGURED,
  CLIENT_ID,
  GoogleProfile,
  clearSession,
  decodeIdToken,
  loadGis,
  loadSession,
  saveSession,
} from '@/lib/auth';
import { SHEET_CONFIGURED, logVisit } from '@/lib/sheet';
import PracticeApp from './PracticeApp';

type Phase = 'loading' | 'signed-out' | 'signed-in';

export default function AuthGate() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gisReady, setGisReady] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const initialised = useRef(false);

  /** จัดการ credential ที่ Google ส่งกลับมา */
  const onCredential = useCallback((credential: string) => {
    const payload = decodeIdToken(credential);
    if (!payload) {
      setError('อ่านข้อมูลผู้ใช้จาก Google ไม่สำเร็จ ลองใหม่อีกครั้ง');
      return;
    }
    if (payload.aud && CLIENT_ID && payload.aud !== CLIENT_ID) {
      setError('Client ID ไม่ตรงกับที่ตั้งค่าไว้');
      return;
    }

    const p: GoogleProfile = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
    saveSession(p);
    setProfile(p);
    setPhase('signed-in');
    setError(null);

    // บันทึกลงชีตแบบเบื้องหลัง ล้มเหลวก็ไม่กระทบการเล่น
    if (SHEET_CONFIGURED) {
      void logVisit(credential, { sub: p.sub });
    }
  }, []);

  /* กู้ session เดิมก่อน เพื่อไม่ให้หน้าจอกระพริบ */
  useEffect(() => {
    if (!AUTH_CONFIGURED) {
      setPhase('signed-in');
      return;
    }
    const s = loadSession();
    if (s) {
      setProfile(s.profile);
      setPhase('signed-in');
    } else {
      setPhase('signed-out');
    }
  }, []);

  /* ตั้งค่า Google Identity Services */
  useEffect(() => {
    if (!AUTH_CONFIGURED || initialised.current) return;
    let cancelled = false;

    loadGis()
      .then(() => {
        if (cancelled) return;
        const id = window.google?.accounts?.id;
        if (!id) throw new Error('gis missing');
        id.initialize({
          client_id: CLIENT_ID,
          callback: (res) => {
            if (res.credential) onCredential(res.credential);
          },
          auto_select: true,
          cancel_on_tap_outside: false,
        });
        initialised.current = true;
        setGisReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            'โหลดสคริปต์ของ Google ไม่สำเร็จ — ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onCredential]);

  /* วาดปุ่ม Sign in with Google */
  useEffect(() => {
    if (!gisReady || phase !== 'signed-out' || !buttonRef.current) return;
    const id = window.google?.accounts?.id;
    if (!id) return;
    buttonRef.current.innerHTML = '';
    id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 280,
      locale: 'th',
    });
    // One Tap สำหรับคนที่เคยล็อกอินไว้แล้ว
    try {
      id.prompt();
    } catch {
      /* บล็อกไว้ก็ไม่เป็นไร ยังกดปุ่มได้ */
    }
  }, [gisReady, phase]);

  /* คนที่มี session อยู่แล้ว ขอ token ใหม่เงียบ ๆ เพื่ออัปเดตชีตว่าเข้ามาอีกครั้ง */
  useEffect(() => {
    if (phase !== 'signed-in' || !gisReady || !SHEET_CONFIGURED) return;
    try {
      window.google?.accounts?.id?.prompt();
    } catch {
      /* ไม่เป็นไร */
    }
  }, [phase, gisReady]);

  const signOut = useCallback(() => {
    clearSession();
    setProfile(null);
    setPhase(AUTH_CONFIGURED ? 'signed-out' : 'signed-in');
  }, []);

  if (phase === 'loading') {
    return (
      <div className="gate">
        <div className="gate-card">
          <div className="eyebrow">Basic Calculus</div>
          <p className="gate-loading">กำลังโหลด…</p>
        </div>
      </div>
    );
  }

  if (phase === 'signed-out') {
    return (
      <div className="gate">
        <div className="gate-card">
          <div className="eyebrow">Basic Calculus · แบบทดสอบ 1</div>
          <h1>ฝึกแคลคูลัสเบื้องต้น</h1>
          <p className="gate-lede">
            เข้าสู่ระบบด้วยบัญชี Google เพื่อเริ่มทำโจทย์
            คะแนนของคุณจะถูกเก็บไว้ในเครื่องนี้
          </p>

          <div className="gate-button" ref={buttonRef} />

          {!gisReady && !error && (
            <p className="gate-note">กำลังเตรียมปุ่มเข้าสู่ระบบ…</p>
          )}
          {error && <p className="gate-error">{error}</p>}

          <ul className="gate-facts">
            <li>เว็บนี้ขอแค่ชื่อ อีเมล และรูปโปรไฟล์ ไม่ขอสิทธิ์อย่างอื่น</li>
            <li>คะแนนและสถิติเก็บอยู่ในเบราว์เซอร์ของคุณ ไม่ได้ส่งขึ้นที่ไหน</li>
            <li>ชื่อกับอีเมลถูกบันทึกไว้เพื่อดูว่ามีใครเข้ามาใช้งานบ้าง</li>
          </ul>
        </div>
      </div>
    );
  }

  const isGuest = !AUTH_CONFIGURED || !profile;

  return (
    <PracticeApp
      auth={{
        profile,
        userKey: profile?.sub ?? 'guest',
        isGuest,
        signOut,
      }}
    />
  );
}
