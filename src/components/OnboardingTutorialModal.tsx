'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Gamepad2, Compass, Clock, Trophy, CheckCircle2, Search } from 'lucide-react';

interface OnboardingTutorialModalProps {
  onComplete: () => void;
}

export function OnboardingTutorialModal({ onComplete }: OnboardingTutorialModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if the user has already seen the tutorial
    const hasSeenTutorial = localStorage.getItem('gamepace_tutorial_completed');
    if (!hasSeenTutorial) {
      // Small delay to let the initial loading finish before popping up
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('gamepace_tutorial_completed', 'true');
    setIsOpen(false);
    onComplete();
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const tutorialSteps = [
    {
      title: "ยินดีต้อนรับสู่ GamePace",
      subtitle: "จัดระเบียบเกมดอง บริหารเวลาเล่นอย่างชาญฉลาด",
      icon: <Gamepad2 className="w-12 h-12 text-[var(--gp-brand-light)]" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-sm text-[var(--gp-text-muted)] leading-relaxed">
            บอกลาความรู้สึกผิดจากการซื้อเกมมาดอง! <strong className="text-[var(--gp-text)]">GamePace</strong> คือผู้ช่วยส่วนตัวที่จะคอยคำนวณว่า 
            คุณจะเล่นเกมในคลังจบเมื่อไหร่ และช่วยป้องกันอาการ Burnout จากการเล่นเกมมากเกินไป
          </p>
        </div>
      ),
      color: "bg-indigo-500",
    },
    {
      title: "1. เชื่อมต่อ Steam ID",
      subtitle: "ดึงข้อมูลเกมและเวลาเล่นโดยอัตโนมัติ",
      icon: <Search className="w-12 h-12 text-sky-400" />,
      content: (
        <div className="space-y-4 text-center">
          <div className="bg-[var(--gp-rail)] p-3 rounded-xl border border-[var(--gp-border-subtle)] text-xs text-[var(--gp-text)] shadow-inner">
            กดปุ่ม <strong className="text-[var(--gp-brand-light)]">"ผูกบัญชี Steam"</strong> ที่แถบเมนูด้านซ้าย
          </div>
          <p className="text-sm text-[var(--gp-text-muted)] leading-relaxed">
            กรอก Steam ID ของคุณเพื่อนำเข้าคลังเกม ระบบจะทำการดึง <strong>ชั่วโมงที่เล่นไปแล้ว</strong> และสามารถกด <strong>Sync</strong> เพื่ออัปเดตเวลาเล่นล่าสุดได้ตลอดเวลา
          </p>
        </div>
      ),
      color: "bg-sky-500",
    },
    {
      title: "2. ตั้งเป้าหมายเวลา (Pacing Budget)",
      subtitle: "คุณมีเวลาเล่นเกมอาทิตย์ละกี่ชั่วโมง?",
      icon: <Clock className="w-12 h-12 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-center">
          <div className="flex justify-center gap-4 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-[var(--gp-rail)] border border-[var(--gp-divider)]">จันทร์-ศุกร์: 2 ชม.</div>
            <div className="px-3 py-1.5 rounded-lg bg-[var(--gp-rail)] border border-[var(--gp-divider)]">เสาร์-อาทิตย์: 5 ชม.</div>
          </div>
          <p className="text-sm text-[var(--gp-text-muted)] leading-relaxed">
            กดที่ไอคอน <strong className="text-[var(--gp-text)]">เข็มทิศ (Pacing Config)</strong> เพื่อกำหนดโควตาเวลาเล่นของคุณ 
            ระบบจะนำไปคำนวณว่าแต่ละเกมต้องใช้เวลาอีกกี่ <strong>"วัน"</strong> ถึงจะเคลียร์จบ!
          </p>
        </div>
      ),
      color: "bg-emerald-500",
    },
    {
      title: "3. ลากวางกระดาน Kanban",
      subtitle: "ติดตามความคืบหน้าแบบ Real-time",
      icon: <Compass className="w-12 h-12 text-amber-400" />,
      content: (
        <div className="space-y-4 text-center">
          <div className="bg-[var(--gp-rail)] p-3 rounded-xl border border-[var(--gp-border-subtle)] flex items-center justify-center gap-2">
            <span className="text-xs px-2 py-1 bg-[var(--gp-secondary)] rounded-md border border-[var(--gp-divider)]">Backlog</span>
            <ChevronRight className="w-4 h-4 text-[var(--gp-text-muted)]" />
            <span className="text-xs px-2 py-1 bg-[var(--gp-secondary)] rounded-md border border-[var(--gp-brand)] shadow-[0_0_8px_var(--gp-brand)]">Playing</span>
          </div>
          <p className="text-sm text-[var(--gp-text-muted)] leading-relaxed">
            เลือกเกมที่อยากเล่น กดเพิ่มลง Backlog และ <strong>ลากการ์ดเกม</strong> ไปที่ช่อง <strong>PLAYING</strong> เมื่อเริ่มเล่น 
            ระบบใช้ข้อมูลจาก <em className="text-amber-400">HowLongToBeat</em> เพื่อประเมินเวลาจบให้คุณ!
          </p>
        </div>
      ),
      color: "bg-amber-500",
    },
    {
      title: "4. สรุปผล Gaming Wrapped",
      subtitle: "ดูสถิติความภาคภูมิใจของคุณ",
      icon: <Trophy className="w-12 h-12 text-purple-400" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-sm text-[var(--gp-text-muted)] leading-relaxed">
            กดที่ไอคอน <strong className="text-[var(--gp-text)]">ถ้วยรางวัล</strong> เพื่อดูสรุปผลประจำเดือน และประจำปี 
            ดูว่าคุณเคลียร์เกมไปกี่เกม เล่นไปกี่ชั่วโมง และเกมไหนคืออันดับ 1 ในดวงใจของคุณในรอบนี้!
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--gp-brand)]/10 text-[var(--gp-brand-light)] font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" /> พร้อมลุยกันเลย!
          </div>
        </div>
      ),
      color: "bg-purple-500",
    }
  ];

  const current = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[var(--gp-primary)] border border-[var(--gp-border)] rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Progress Bar Top */}
        <div className="w-full h-1 bg-[var(--gp-rail)] flex">
          {tutorialSteps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-full flex-1 transition-colors duration-300 ${idx <= currentStep ? 'bg-[var(--gp-brand)]' : 'bg-transparent'}`}
            />
          ))}
        </div>

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--gp-text-muted)] hover:text-[var(--gp-text)] hover:bg-[var(--gp-elevated)] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 flex flex-col items-center">
          {/* Animated Icon Container */}
          <div className="w-24 h-24 rounded-full bg-[var(--gp-secondary)] border border-[var(--gp-border-subtle)] flex items-center justify-center mb-6 shadow-inner relative">
            <div className={`absolute inset-0 rounded-full opacity-20 blur-xl ${current.color}`} />
            <div className="animate-bounce-slight relative z-10">
              {current.icon}
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[var(--gp-text)] mb-2 text-center">
            {current.title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--gp-brand-light)] font-medium mb-6 text-center bg-[var(--gp-brand)]/10 px-3 py-1 rounded-full">
            {current.subtitle}
          </p>

          <div className="min-h-[100px] w-full flex items-center justify-center animate-slideInRight" key={currentStep}>
            {current.content}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-6 bg-[var(--gp-secondary)] border-t border-[var(--gp-border-subtle)] flex items-center justify-between">
          <button 
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-1 transition-colors ${
              currentStep === 0 
                ? 'opacity-0 cursor-default' 
                : 'text-[var(--gp-text-muted)] hover:text-[var(--gp-text)] hover:bg-[var(--gp-elevated)]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> ก่อนหน้า
          </button>
          
          <div className="flex items-center gap-1.5">
            {tutorialSteps.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'bg-[var(--gp-brand)] w-4' : 'bg-[var(--gp-divider)]'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={nextStep}
            className="px-5 py-2 bg-[var(--gp-brand)] hover:bg-[var(--gp-brand-hover)] text-white text-sm font-bold rounded-lg shadow-md flex items-center gap-1 transition-transform active:scale-95"
          >
            {currentStep === tutorialSteps.length - 1 ? 'เริ่มต้นใช้งาน' : 'ถัดไป'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
