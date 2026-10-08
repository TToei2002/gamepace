'use client';

import React, { useEffect, useState } from 'react';
import { Gamepad2 } from 'lucide-react';

interface LoadingScreenProps {
  isLoading: boolean;
  onFinish?: () => void;
}

export function LoadingScreen({ isLoading, onFinish }: LoadingScreenProps) {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('กำลังเริ่มต้นระบบ GamePace...');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      // Simulate steady progressive loading while waiting for actual data
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 40) {
            setStatusText('กำลังโหลดข้อมูลคลังเกมจากฐานข้อมูล...');
            return prev + Math.floor(Math.random() * 8) + 4;
          }
          if (prev < 75) {
            setStatusText('กำลังจัดเตรียมบอร์ด Kanban และประวัติการเล่น...');
            return prev + Math.floor(Math.random() * 5) + 3;
          }
          if (prev < 92) {
            setStatusText('กำลังคำนวณงบเวลาเล่น Pacing...');
            return prev + 1;
          }
          return prev;
        });
      }, 120);
    } else {
      // When actual loading completes, rapidly finish to 100% then fade out smoothly
      setProgress(100);
      setStatusText('พร้อมใช้งาน!');
      const timeout = setTimeout(() => {
        setIsVisible(false);
        onFinish?.();
      }, 350);
      return () => clearTimeout(timeout);
    }

    return () => clearInterval(interval);
  }, [isLoading, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--gp-floating)] transition-opacity duration-500 ease-out select-none ${
        !isLoading && progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Loading GamePace"
    >
      {/* Top Edge Slim Glow Progress Bar (YouTube/GitHub Style) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent overflow-hidden z-[110]">
        <div
          className="h-full bg-gradient-to-r from-[var(--gp-brand)] via-[#808df8] to-[#5865f2] shadow-[0_0_12px_rgba(88,101,242,0.8)] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Ambient Radial Background Glow */}
      <div className="absolute w-[360px] h-[360px] rounded-full bg-[var(--gp-brand)]/10 blur-[100px] pointer-events-none" />

      {/* Main Center Loading Content: Only Logo + Progress Bar with Subtext */}
      <div className="relative flex flex-col items-center text-center space-y-7 max-w-sm px-6">
        {/* Logo Badge (Clean & Borderless) */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--gp-brand)] to-[#808df8] flex items-center justify-center shadow-[0_0_35px_rgba(88,101,242,0.5)]">
          <Gamepad2 className="w-8 h-8 text-white" />
        </div>

        {/* Progress Bar Container */}
        <div className="w-64 space-y-2.5">
          {/* Track (Borderless & Clean) */}
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--gp-brand)] to-[#808df8] shadow-[0_0_12px_rgba(88,101,242,0.8)] transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Internal light sheen */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>

          {/* Subtext below Progress Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[var(--gp-text-muted)] truncate max-w-[190px] text-left">
              {statusText}
            </span>
            <span className="text-[var(--gp-brand-light)] font-bold shrink-0">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
