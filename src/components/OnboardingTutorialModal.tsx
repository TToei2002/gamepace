'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Gamepad2 } from 'lucide-react';

// Joyride must be rendered only on client-side
const Joyride = dynamic(
  async () => {
    const mod = await import('react-joyride');
    // Handle both default export and named export variations
    return mod.default || (mod as any).Joyride || mod;
  },
  { ssr: false }
) as any;

interface OnboardingTutorialModalProps {
  onComplete: () => void;
}

export function OnboardingTutorialModal({ onComplete }: OnboardingTutorialModalProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the tutorial (Fallback to cookie if localStorage fails)
    const hasSeenTutorialLocal = localStorage.getItem('gamepace_tour_completed');
    
    if (!hasSeenTutorialLocal) {
      // Small delay to let the initial loading finish before popping up
      const timer = setTimeout(() => {
        // บันทึกทันทีที่แสดงผลเลย จะได้ไม่โชว์อีกไม่ว่าจะปิดด้วยวิธีไหนหรือรีเฟรชหน้าเว็บ
        localStorage.setItem('gamepace_tour_completed', 'true');
        
        setRun(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status, action, type } = data;

    // ตรวจสอบทุกกรณีที่ทำให้ Tutorial จบ (กดปิด, ข้าม, ถึงหน้าสุดท้าย, หรือทัวร์จบเอง)
    if (
      status === 'finished' || 
      status === 'skipped' || 
      action === 'close' || 
      action === 'skip' ||
      action === 'last' ||
      type === 'tour:end'
    ) {
      localStorage.setItem('gamepace_tour_completed', 'true');
      setRun(false);
      onComplete();
    }
  };

  const steps = [
    {
      target: 'body',
      content: (
        <div className="flex flex-col items-center text-center space-y-3">
          <Gamepad2 className="w-12 h-12 text-[var(--gp-brand)] mb-2" />
          <h2 className="text-xl font-bold text-[var(--gp-text-strong)]">ยินดีต้อนรับสู่ GamePace!</h2>
          <p className="text-sm text-[var(--gp-text-muted)]">
            แอปจัดระเบียบเกมดองและคำนวณระยะเวลาจบเกม มาดูวิธีใช้งานง่ายๆ ไปพร้อมกันเลย!
          </p>
        </div>
      ),
      placement: 'center' as const,
      disableBeacon: true,
    },
    {
      target: '#tour-steam-connect',
      title: '1. ผูกบัญชี Steam',
      content: 'เริ่มต้นด้วยการเชื่อมต่อบัญชี Steam ของคุณ ระบบจะดึงเกมและเวลาเล่นทั้งหมดมาให้โดยอัตโนมัติ',
      placement: 'bottom' as const,
      disableBeacon: true,
    },
    {
      target: '#tour-pacing',
      title: '2. ตั้งค่าเวลาเล่นของคุณ',
      content: 'คลิกที่นี่เพื่อกำหนดว่า ในแต่ละสัปดาห์คุณมีเวลาเล่นเกมกี่ชั่วโมง เพื่อให้ระบบคำนวณวันจบเกมให้แม่นยำที่สุด',
      placement: 'right' as const,
      disableBeacon: true,
    },
    {
      target: '#tour-add-game',
      title: '3. เพิ่มเกมแบบ Manual',
      content: 'เพิ่มเกมจากคลัง Steam ของคุณ',
      placement: 'bottom' as const,
      disableBeacon: true,
    },
    {
      target: 'body',
      title: '4. ลากวางกระดาน Kanban',
      content: 'ลากการ์ดเกมไปมาเพื่อจัดการสถานะ (Backlog -> Playing -> Completed) และติดตามสถิติได้แบบ Real-time! แค่นี้ก็พร้อมลุยแล้ว',
      placement: 'center' as const,
      disableBeacon: true,
    }
  ];

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      disableOverlayClose={true}
      callback={handleJoyrideCallback}
      floaterProps={{
        hideArrow: true, // Hide arrow because var() CSS variables don't work well with react-joyride's internal arrow color parser
      }}
      styles={{
        options: {
          primaryColor: '#6366f1',
          zIndex: 10000,
        },
        tooltip: {
          backgroundColor: 'var(--gp-floating)',
          color: 'var(--gp-text-strong)',
          borderRadius: '12px',
          border: '1px solid var(--gp-divider)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          fontFamily: 'inherit',
          padding: '24px',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          margin: 0,
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--gp-text-strong)',
        },
        tooltipContent: {
          padding: '12px 0',
          fontSize: '13px',
          color: 'var(--gp-text)',
          lineHeight: '1.5',
        },
        buttonNext: {
          backgroundColor: 'var(--gp-brand)',
          color: 'white',
          borderRadius: '6px',
          padding: '8px 16px',
          fontWeight: 600,
          fontSize: '12px',
          outline: 'none',
        },
        buttonBack: {
          color: 'var(--gp-text-muted)',
          marginRight: '12px',
          fontSize: '12px',
          fontWeight: 500,
        },
        buttonSkip: {
          color: 'var(--gp-text-muted)',
          fontSize: '12px',
          fontWeight: 500,
        }
      }}
      locale={{
        back: 'ย้อนกลับ',
        close: 'ปิด',
        last: 'เสร็จสิ้น',
        next: 'ถัดไป',
        skip: 'ข้าม',
      }}
    />
  );
}
