'use client';

import React from 'react';
import { Clock, Calendar, Sliders, Flame } from 'lucide-react';
import { BurnoutStatus } from '@/lib/pacing';

interface PacingOverviewBannerProps {
  weekdayHours: number;
  weekendHours: number;
  totalRemainingHours: number;
  totalRemainingDays: number;
  burnoutStatus?: BurnoutStatus;
  onOpenPacingModal: () => void;
}

export function PacingOverviewBanner({
  weekdayHours,
  weekendHours,
  totalRemainingHours,
  totalRemainingDays,
  onOpenPacingModal,
}: PacingOverviewBannerProps) {
  const weeklyHours = Number((weekdayHours * 5 + weekendHours * 2).toFixed(1));
  const dailyHours = Number((weeklyHours / 7).toFixed(1));

  return (
    <section className="bg-[var(--gp-secondary)] border border-[var(--gp-border)] rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-4 shadow-sm animate-fadeIn relative">
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 w-full">
        {/* Stat Pill 1: Weekly Capacity */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--gp-rail)] border border-[var(--gp-border-subtle)] transition-colors hover:border-[var(--gp-border)]">
          <div className="w-7 h-7 rounded-md bg-[var(--gp-brand)]/15 text-[var(--gp-brand-light)] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] block font-medium text-[var(--gp-text-muted)] leading-tight">
              เวลาเล่นที่ตั้งไว้
            </span>
            <span className="text-sm font-bold font-mono text-[var(--gp-text)]">
              {weeklyHours} ชม./สัปดาห์
            </span>
          </div>
        </div>

        {/* Stat Pill 2: Daily Capacity */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--gp-rail)] border border-[var(--gp-border-subtle)] transition-colors hover:border-[var(--gp-border)]">
          <div className="w-7 h-7 rounded-md bg-[var(--gp-brand)]/15 text-[var(--gp-brand-light)] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] block font-medium text-[var(--gp-text-muted)] leading-tight">
              เฉลี่ยต่อวัน
            </span>
            <span className="text-sm font-semibold font-mono text-[var(--gp-text-sub)]">
              ~{dailyHours} ชม./วัน
            </span>
          </div>
        </div>

        {/* Stat Pill 3: Backlog Burn Accumulation */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--gp-rail)] border border-[var(--gp-border-subtle)] transition-colors hover:border-[var(--gp-border)]">
          <div className="w-7 h-7 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] block font-medium text-[var(--gp-text-muted)] leading-tight">
              Backlog สะสมที่เหลือ
            </span>
            <span className="text-sm font-bold font-mono text-amber-400">
              ~{totalRemainingHours.toFixed(1)} ชม. ({totalRemainingDays} วัน)
            </span>
          </div>
        </div>

        {/* Budget Config Trigger Button */}
        <button
          onClick={onOpenPacingModal}
          className="ml-auto px-3.5 py-2 text-xs rounded-lg font-medium transition-all duration-150 flex items-center gap-2 bg-[var(--gp-primary)] hover:bg-[var(--gp-elevated)] border border-[var(--gp-border)] text-[var(--gp-text)] active:scale-95 shadow-sm"
          title="ปรับเปลี่ยนชั่วโมงเล่นต่อวัน"
        >
          <Sliders className="w-3.5 h-3.5 text-[var(--gp-brand-light)]" />
          <span>ตั้งค่าเวลาเล่น</span>
        </button>
      </div>
    </section>
  );
}
