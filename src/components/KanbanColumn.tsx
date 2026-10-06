'use client';

import React from 'react';
import { Gamepad2, Plus, Clock, CheckCircle2, Archive } from 'lucide-react';

interface KanbanColumnProps {
  id: 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'DROPPED';
  title: string;
  badgeBg: string;
  badgeText: string;
  dotBg: string;
  count: number;
  staggerClass?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  onAddGame?: () => void;
  isDragOver?: boolean;
  isDropTargetBottom?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function KanbanColumn({
  id,
  title,
  badgeBg,
  badgeText,
  dotBg,
  count,
  staggerClass = '',
  children,
  headerAction,
  onAddGame,
  isDragOver = false,
  isDropTargetBottom = false,
  onDragOver,
  onDragLeave,
  onDrop,
}: KanbanColumnProps) {
  // Channel accents and contextual icons based on column
  const columnConfig = {
    BACKLOG: {
      accent: 'border-l-2 border-l-slate-400',
      icon: Clock,
      iconColor: 'text-slate-400',
    },
    PLAYING: {
      accent: 'border-l-2 border-l-[var(--gp-brand)]',
      icon: Gamepad2,
      iconColor: 'text-[var(--gp-brand-light)]',
    },
    COMPLETED: {
      accent: 'border-l-2 border-l-emerald-500',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    DROPPED: {
      accent: 'border-l-2 border-l-rose-500',
      icon: Archive,
      iconColor: 'text-rose-400',
    },
  };

  const currentConfig = columnConfig[id] || columnConfig.BACKLOG;
  const ColumnIcon = currentConfig.icon;

  return (
    <div
      className={`border rounded-2xl p-3 sm:p-3.5 flex flex-col h-[560px] lg:h-[620px] transition-all duration-200 relative overflow-hidden shadow-xs w-full min-w-0 bg-[var(--gp-secondary)] border-[var(--gp-divider)] ${staggerClass} ${
        isDragOver ? 'border-[var(--gp-brand)] ring-2 ring-[var(--gp-brand)]/30 bg-[var(--gp-brand)]/5' : ''
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between mb-3 px-2 py-1.5 rounded-xl border border-[var(--gp-divider)] ${currentConfig.accent} bg-[var(--gp-rail)]/60 gap-1 shrink-0`}>
        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm tracking-wide truncate text-[var(--gp-text-strong)]">
          <ColumnIcon className={`w-3.5 h-3.5 ${currentConfig.iconColor} shrink-0`} />
          <h2 className="truncate">{title}</h2>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {headerAction}
          <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold bg-[var(--gp-rail)] border border-[var(--gp-divider)] text-[var(--gp-text-muted)] shadow-xs">
            {count}
          </span>
        </div>
      </div>

      {/* Drag Target Area & Card Container (Scrolls independently if overflowing) */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex-1 flex flex-col gap-2 rounded-xl p-0.5 transition-colors overflow-y-auto scrollbar-thin w-full min-w-0 pr-1 ${
          isDragOver ? 'border-2 border-dashed border-[var(--gp-brand)]/60 bg-[var(--gp-brand)]/5' : ''
        }`}
      >
        {count === 0 ? (
          <div
            className={`flex-grow flex flex-col items-center justify-center p-6 border border-dashed rounded-xl min-h-[200px] gap-2 text-center transition-all bg-[var(--gp-rail)]/30 border-[var(--gp-divider)] ${
              isDragOver ? 'border-[var(--gp-brand)] bg-[var(--gp-brand)]/10 ring-1 ring-[var(--gp-brand)]/30' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--gp-primary)] flex items-center justify-center text-[var(--gp-text-muted)] border border-[var(--gp-divider)]">
              <Gamepad2 className="w-4 h-4 opacity-80" />
            </div>
            <p className="text-xs font-semibold text-[var(--gp-text-strong)]">
              {isDragOver ? 'ปล่อยเพื่อวางเป็นเกมแรก' : 'ไม่มีเกมในหมวดนี้'}
            </p>
            <p className="text-[11px] text-[var(--gp-text-muted)]">
              {isDragOver ? 'พร้อมจัดลำดับ' : 'ลากการ์ดเกมมาวางที่นี่ได้'}
            </p>
            {onAddGame && !isDragOver && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddGame();
                }}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] bg-[var(--gp-rail)] hover:bg-[var(--gp-primary)] border border-[var(--gp-divider)] hover:border-[var(--gp-brand)]/40 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-[var(--gp-text-muted)] group-hover:text-[var(--gp-brand)]" />
                <span>เพิ่มเกม</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {children}
            {/* Bottom Drop Slot Indicator */}
            {isDropTargetBottom && (
              <div className="border border-dashed border-[var(--gp-brand)] bg-[var(--gp-brand)]/10 rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--gp-brand-light)] animate-pulse">
                <Plus className="w-3.5 h-3.5" />
                <span>วางที่ท้ายแถว</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
