'use client';

import React, { useState, useEffect } from 'react';
import { X, Sliders, Clock, Sparkles } from 'lucide-react';

interface UserPacingModalProps {
  isOpen: boolean;
  weekdayCapHours: number;
  weekendCapHours: number;
  onClose: () => void;
  onSavePacing: (weekday: number, weekend: number) => Promise<void>;
}

export function UserPacingModal({
  isOpen,
  weekdayCapHours,
  weekendCapHours,
  onClose,
  onSavePacing,
}: UserPacingModalProps) {
  const [weekday, setWeekday] = useState(weekdayCapHours);
  const [weekend, setWeekend] = useState(weekendCapHours);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setWeekday(weekdayCapHours);
    setWeekend(weekendCapHours);
  }, [weekdayCapHours, weekendCapHours]);

  if (!isOpen) return null;

  const weeklyTotal = Number((weekday * 5 + weekend * 2).toFixed(1));
  const dailyAverage = Number((weeklyTotal / 7).toFixed(1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSavePacing(weekday, weekend);
      onClose();
    } catch (err) {
      console.error('Error saving pacing config:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[var(--gp-primary)] border border-[var(--gp-border)] rounded-2xl max-w-md w-full shadow-2xl animate-scaleIn relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[var(--gp-border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--gp-brand)]/15 text-[var(--gp-brand-light)] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--gp-text)]">
              ตั้งค่าสปีดการเล่นเกม (Pacing Budget)
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่างตั้งค่า Pacing"
            className="p-1 rounded-lg text-[var(--gp-text-muted)] hover:text-[var(--gp-text)] hover:bg-[var(--gp-elevated)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-5 space-y-5">
            {/* Weekday Hours Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-semibold text-[var(--gp-text)]">
                <span>วันธรรมดา (จันทร์ - ศุกร์):</span>
                <span className="text-[var(--gp-brand-light)] font-mono font-bold bg-[var(--gp-rail)] px-2 py-0.5 rounded-md border border-[var(--gp-border-subtle)]">
                  {weekday} ชม. / วัน
                </span>
              </div>

              <div className="relative pt-1 pb-2">
                <input
                  type="range"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={weekday}
                  onChange={(e) => setWeekday(parseFloat(e.target.value))}
                  className="w-full accent-[var(--gp-brand)] cursor-pointer h-2 bg-[var(--gp-rail)] rounded-lg appearance-none transition-all"
                />

                {/* Slider Ruler / Tick Marks */}
                <div className="relative w-full h-3 mt-1 flex justify-between items-center text-[10px] font-mono px-0.5 select-none text-[var(--gp-text-muted)]">
                  {[0, 4, 8, 12, 16, 20, 24].map((tick) => {
                    const percent = (tick / 24) * 100;
                    return (
                      <div
                        key={tick}
                        className="absolute -translate-x-1/2 flex flex-col items-center cursor-pointer group"
                        style={{ left: `${percent}%` }}
                        onClick={() => setWeekday(tick === 0 ? 0.5 : tick)}
                      >
                        <div className={`w-0.5 ${tick % 8 === 0 ? 'h-2 bg-slate-500' : 'h-1.5 bg-slate-600'} group-hover:bg-[var(--gp-brand)] transition-colors`} />
                        <span className="mt-0.5 group-hover:text-[var(--gp-brand-light)] transition-colors">{tick}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Presets for Weekday */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs pb-1">
                <span className="text-[11px] shrink-0 text-[var(--gp-text-muted)]">แนะนำ:</span>
                {[1, 2, 3, 5, 8, 12, 24].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setWeekday(hrs)}
                    className={`px-2 py-0.5 rounded-md border text-[11px] font-mono transition-all ${
                      weekday === hrs
                        ? 'bg-[var(--gp-brand)] text-white border-[var(--gp-brand)] font-semibold'
                        : 'border-[var(--gp-border-subtle)] bg-[var(--gp-rail)] hover:border-[var(--gp-brand)] text-[var(--gp-text-muted)] hover:text-[var(--gp-text)]'
                    }`}
                  >
                    {hrs} ชม.
                  </button>
                ))}
              </div>
            </div>

            {/* Weekend Hours Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-semibold text-[var(--gp-text)]">
                <span>วันหยุด (เสาร์ - อาทิตย์):</span>
                <span className="text-[var(--gp-brand-light)] font-mono font-bold bg-[var(--gp-rail)] px-2 py-0.5 rounded-md border border-[var(--gp-border-subtle)]">
                  {weekend} ชม. / วัน
                </span>
              </div>

              <div className="relative pt-1 pb-2">
                <input
                  type="range"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={weekend}
                  onChange={(e) => setWeekend(parseFloat(e.target.value))}
                  className="w-full accent-[var(--gp-brand)] cursor-pointer h-2 bg-[var(--gp-rail)] rounded-lg appearance-none transition-all"
                />

                {/* Slider Ruler / Tick Marks */}
                <div className="relative w-full h-3 mt-1 flex justify-between items-center text-[10px] font-mono px-0.5 select-none text-[var(--gp-text-muted)]">
                  {[0, 4, 8, 12, 16, 20, 24].map((tick) => {
                    const percent = (tick / 24) * 100;
                    return (
                      <div
                        key={tick}
                        className="absolute -translate-x-1/2 flex flex-col items-center cursor-pointer group"
                        style={{ left: `${percent}%` }}
                        onClick={() => setWeekend(tick === 0 ? 0.5 : tick)}
                      >
                        <div className={`w-0.5 ${tick % 8 === 0 ? 'h-2 bg-slate-500' : 'h-1.5 bg-slate-600'} group-hover:bg-[var(--gp-brand)] transition-colors`} />
                        <span className="mt-0.5 group-hover:text-[var(--gp-brand-light)] transition-colors">{tick}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Presets for Weekend */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs pb-1">
                <span className="text-[11px] shrink-0 text-[var(--gp-text-muted)]">แนะนำ:</span>
                {[2, 4, 6, 8, 12, 16, 24].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setWeekend(hrs)}
                    className={`px-2 py-0.5 rounded-md border text-[11px] font-mono transition-all ${
                      weekend === hrs
                        ? 'bg-[var(--gp-brand)] text-white border-[var(--gp-brand)] font-semibold'
                        : 'border-[var(--gp-border-subtle)] bg-[var(--gp-rail)] hover:border-[var(--gp-brand)] text-[var(--gp-text-muted)] hover:text-[var(--gp-text)]'
                    }`}
                  >
                    {hrs} ชม.
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-3.5 rounded-xl border border-[var(--gp-border-subtle)] bg-[var(--gp-rail)] text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-[var(--gp-text-sub)]">
                <Clock className="w-3.5 h-3.5 text-[var(--gp-green)]" />
                <span>สรุปเวลาจัดสรร</span>
              </div>
              <div className="flex justify-between font-bold items-center text-[var(--gp-text)]">
                <span>รวมสัปดาห์ละ:</span>
                <span className="text-[var(--gp-green)] font-mono text-base">{weeklyTotal} ชม.</span>
              </div>
              <div className="flex justify-between text-[11px] items-center text-[var(--gp-text-muted)]">
                <span>คำนวณวันเฉลี่ย:</span>
                <span className="font-mono">~{dailyAverage} ชม. / วัน</span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-[var(--gp-secondary)] border-t border-[var(--gp-border-subtle)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-[var(--gp-text-sub)] hover:underline"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[var(--gp-brand)] hover:bg-[var(--gp-brand-hover)] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'ปรับใช้การตั้งค่า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
