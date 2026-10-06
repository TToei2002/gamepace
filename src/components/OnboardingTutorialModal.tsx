'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Gamepad2 } from 'lucide-react';

// Joyride must be rendered only on client-side
const Joyride = dynamic(() => import('react-joyride'), { ssr: false });

interface OnboardingTutorialModalProps {
  onComplete: () => void;
}

export function OnboardingTutorialModal({ onComplete }: OnboardingTutorialModalProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the tutorial
    const hasSeenTutorial = localStorage.getItem('gamepace_tour_completed');
    if (!hasSeenTutorial) {
      // Small delay to let the initial loading finish before popping up
      const timer = setTimeout(() => setRun(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses = ['finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('gamepace_tour_completed', 'true');
      onComplete();
    }
  };

  const steps = [
    {
      target: 'body',
      content: (
        <div className="flex flex-col items-center text-center space-y-3">
          <Gamepad2 className="w-12 h-12 text-[#6366f1] mb-2" />
          <h2 className="text-xl font-bold">ยินดีต้อนรับสู่ GamePace!</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            แอปจัดระเบียบเกมดองและคำนวณระยะเวลาจบเกมอัจฉริยะ เดี๋ยวเรามาดูวิธีใช้งานง่ายๆ ไปพร้อมกันเลยครับ!
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
      content: 'หรือถ้าไม่ได้เล่นบน Steam ก็สามารถกดเพิ่มเกมและค้นหาเกมทั่วโลกเพื่อใส่กระดานได้จากที่นี่เลย',
      placement: 'bottom' as const,
      disableBeacon: true,
    },
    {
      target: '#tour-kanban',
      title: '4. ลากวางกระดาน Kanban',
      content: 'ลากการ์ดเกมไปมาเพื่อจัดการสถานะ (Backlog -> Playing -> Completed) และติดตามสถิติได้แบบ Real-time! แค่นี้ก็พร้อมลุยแล้วครับ 🚀',
      placement: 'top' as const,
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
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#6366f1',
          zIndex: 10000,
        },
        tooltipContainer: {
          textAlign: 'left',
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
