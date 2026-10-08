'use client';

import React, { useState } from 'react';
import {
  X,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  Trash2,
  Check,
  Flame,
  AlertTriangle,
  Sliders,
  Compass,
  Trophy,
  Infinity as InfinityIcon,
  Play,
  RotateCcw,
} from 'lucide-react';
import { UserGameItem } from './GameCard';
import { calculatePacing } from '@/lib/pacing';
import { GameCoverImage } from './GameCoverImage';

interface GameDetailModalProps {
  isOpen: boolean;
  userGame: UserGameItem | null;
  weekdayHours: number;
  weekendHours: number;
  onClose: () => void;
  onUpdateTargetHours: (id: string, newTargetHours: number, goalName?: string) => void;
  onMoveGameStatus?: (id: string, status: 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'DROPPED') => void;
  onRemoveGame: (id: string) => void;
}

export function GameDetailModal({
  isOpen,
  userGame,
  weekdayHours,
  weekendHours,
  onClose,
  onUpdateTargetHours,
  onMoveGameStatus,
  onRemoveGame,
}: GameDetailModalProps) {
  const [customHours, setCustomHours] = useState<string>('');
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !userGame) return null;

  const playedHrs = Number((userGame.currentPlayedMinutes / 60).toFixed(1));
  const isEndless = userGame.targetGoal === 'ENDLESS';
  const targetHrs = isEndless ? 0 : (userGame.targetHours || 40);
  const pacing = calculatePacing(userGame.targetHours || 40, playedHrs, weekdayHours, weekendHours, userGame.targetGoal);
  const isCompleted = userGame.status === 'COMPLETED';
  const isOvertime = playedHrs > targetHrs && !isCompleted && !isEndless && targetHrs > 0;
  const overtimeHours = Number((playedHrs - targetHrs).toFixed(1));

  const handleSelectGoal = (hours: number, name: string) => {
    onUpdateTargetHours(userGame.id, hours, name);
    setIsEditingCustom(false);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customHours);
    if (!isNaN(val) && val > 0) {
      onUpdateTargetHours(userGame.id, val, 'CUSTOM');
      setIsEditingCustom(false);
    }
  };

  const handleStatusChange = (status: 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'DROPPED') => {
    if (onMoveGameStatus) {
      onMoveGameStatus(userGame.id, status);
    }
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onRemoveGame(userGame.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[var(--gp-primary)] border border-[var(--gp-border)] rounded-2xl max-w-lg w-full shadow-2xl animate-scaleIn relative overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-[var(--gp-border-subtle)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl border border-[var(--gp-border-subtle)] overflow-hidden shrink-0 bg-[var(--gp-rail)]">
              <GameCoverImage
                src={userGame.game.coverUrl}
                appId={userGame.game.steamAppId}
                title={userGame.game.title}
                isEndless={isEndless}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate text-[var(--gp-text)]">
                {userGame.game.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-[var(--gp-rail)] border border-[var(--gp-border-subtle)] text-[var(--gp-text-muted)]">
                  สถานะ: {userGame.status === 'BACKLOG' ? 'รอเล่น' : userGame.status === 'PLAYING' ? 'กำลังเล่น' : userGame.status === 'COMPLETED' ? 'เล่นจบแล้ว' : 'เลิกเล่น'}
                </span>
                {isEndless && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-[var(--gp-brand)]/15 text-[var(--gp-brand-light)] border border-[var(--gp-brand)]/30">
                    โหมด Endless
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="ปิดหน้ารายละเอียดเกม"
            className="p-1 rounded-lg text-[var(--gp-text-muted)] hover:text-[var(--gp-text)] hover:bg-[var(--gp-elevated)] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Playtime Progress & Pacing Metrics */}
          <div className="p-3.5 rounded-xl border border-[var(--gp-border-subtle)] bg-[var(--gp-secondary)] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--gp-text-muted)]">ความคืบหน้าการเล่น</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  isEndless
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                    : isCompleted
                    ? 'bg-[var(--gp-green)]/15 text-[var(--gp-green)] border border-[var(--gp-green)]/30'
                    : isOvertime
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-[var(--gp-brand)]/15 text-[var(--gp-brand-light)] border border-[var(--gp-brand)]/30'
                }`}
              >
                {isEndless ? 'Endless (เล่นเรื่อยๆ)' : isCompleted ? '100% เล่นจบแล้ว' : `${pacing.completionPercentage}%`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--gp-rail)] border border-[var(--gp-border-subtle)]">
              {isEndless ? (
                <div className="h-full w-full endless-bar-glow rounded-full" />
              ) : (
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[var(--gp-green)]'
                      : isOvertime
                      ? 'bg-amber-400'
                      : 'bg-[var(--gp-brand)]'
                  }`}
                  style={{ width: `${Math.min(100, pacing.completionPercentage)}%` }}
                />
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-lg border border-[var(--gp-border-subtle)] bg-[var(--gp-rail)]">
                <span className="text-[10px] block text-[var(--gp-text-muted)]">เล่นไปแล้ว</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-[var(--gp-text-sub)]">
                  {playedHrs} ชม.
                </span>
              </div>
              <div className="p-2 rounded-lg border border-[var(--gp-border-subtle)] bg-[var(--gp-rail)]">
                <span className="text-[10px] block text-[var(--gp-text-muted)]">เป้าหมาย</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-[var(--gp-brand-light)]">
                  {isEndless ? 'ไม่จำกัด' : `${targetHrs} ชม.`}
                </span>
              </div>
              <div className="p-2 rounded-lg border border-[var(--gp-border-subtle)] bg-[var(--gp-rail)]">
                <span className="text-[10px] block text-[var(--gp-text-muted)]">เวลาคงเหลือ</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-[var(--gp-text)]">
                  {isEndless ? 'ไม่จำกัด' : `${pacing.remainingHours} ชม.`}
                </span>
              </div>
            </div>
          </div>

          {/* Overtime Suggestions Banner */}
          {isOvertime && (
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>เล่นเกินเป้าหมายเดิมไปแล้ว +{overtimeHours} ชม.</span>
              </div>
              <p className="text-[11px] text-[var(--gp-text-muted)] leading-relaxed">
                เกมนี้ยังเล่นต่อได้เรื่อยๆ คุณสามารถขยายเวลาเป้าหมาย หรือเปลี่ยนเป็นโหมด Endless ได้ทันที:
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSelectGoal(0, 'ENDLESS')}
                  className="px-2.5 py-1 rounded-lg bg-[var(--gp-brand)] hover:bg-[var(--gp-brand-hover)] text-white font-medium text-xs transition-colors"
                >
                  เปลี่ยนเป็น Endless
                </button>
                <button
                  onClick={() => handleSelectGoal(Math.ceil(playedHrs + 20), 'EXPANDED')}
                  className="px-2.5 py-1 rounded-lg bg-[var(--gp-rail)] hover:bg-[var(--gp-elevated)] border border-[var(--gp-border-subtle)] text-amber-400 font-medium text-xs transition-colors"
                >
                  ขยายเป้า (+20 ชม.)
                </button>
              </div>
            </div>
          )}

          {/* Playtime Goal Options (HLTB + Endless) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold block flex items-center justify-between text-[var(--gp-text)]">
              <span>เลือกเป้าหมายการเล่น (HowLongToBeat):</span>
              {userGame.targetGoal && (
                <span className="text-[11px] font-normal text-[var(--gp-text-muted)]">
                  ปัจจุบัน: <strong className="font-semibold text-[var(--gp-brand-light)]">{userGame.targetGoal}</strong>
                </span>
              )}
            </label>

            <div className="grid grid-cols-2 gap-2">
              {/* Main Story */}
              {userGame.game.hltbMainStory > 0 && (
                <button
                  type="button"
                  onClick={() => handleSelectGoal(userGame.game.hltbMainStory, 'Main Story')}
                  className={`p-2.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                    userGame.targetGoal === 'Main Story' || (!isEndless && targetHrs === userGame.game.hltbMainStory)
                      ? 'border-[var(--gp-brand)] bg-[var(--gp-brand)]/10 ring-1 ring-[var(--gp-brand)]'
                      : 'border-[var(--gp-border-subtle)] bg-[var(--gp-secondary)] hover:bg-[var(--gp-elevated)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-[var(--gp-text)]">Main Story</span>
                    {(userGame.targetGoal === 'Main Story' || (!isEndless && targetHrs === userGame.game.hltbMainStory)) && (
                      <Check className="w-3.5 h-3.5 text-[var(--gp-brand-light)]" />
                    )}
                  </div>
                  <div className="mt-1">
                    <span className="text-sm font-mono font-bold text-[var(--gp-brand-light)]">
                      {userGame.game.hltbMainStory} ชม.
                    </span>
                    <span className="text-[10px] block text-[var(--gp-text-muted)]">เนื้อเรื่องหลัก</span>
                  </div>
                </button>
              )}

              {/* Main + Extra */}
              {userGame.game.hltbExtra > 0 && (
                <button
                  type="button"
                  onClick={() => handleSelectGoal(userGame.game.hltbExtra, 'Main + Extra')}
                  className={`p-2.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                    userGame.targetGoal === 'Main + Extra' || (!isEndless && targetHrs === userGame.game.hltbExtra)
                      ? 'border-[var(--gp-brand)] bg-[var(--gp-brand)]/10 ring-1 ring-[var(--gp-brand)]'
                      : 'border-[var(--gp-border-subtle)] bg-[var(--gp-secondary)] hover:bg-[var(--gp-elevated)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-[var(--gp-text)]">Main + Extra</span>
                    {(userGame.targetGoal === 'Main + Extra' || (!isEndless && targetHrs === userGame.game.hltbExtra)) && (
                      <Check className="w-3.5 h-3.5 text-[var(--gp-brand-light)]" />
                    )}
                  </div>
                  <div className="mt-1">
                    <span className="text-sm font-mono font-bold text-[var(--gp-brand-light)]">
                      {userGame.game.hltbExtra} ชม.
                    </span>
                    <span className="text-[10px] block text-[var(--gp-text-muted)]">เนื้อเรื่อง + ภารกิจย่อย</span>
                  </div>
                </button>
              )}

              {/* 100% Completionist */}
              {userGame.game.hltbCompletionist > 0 && (
                <button
                  type="button"
                  onClick={() => handleSelectGoal(userGame.game.hltbCompletionist, '100% Completionist')}
                  className={`p-2.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                    userGame.targetGoal === '100% Completionist' || (!isEndless && targetHrs === userGame.game.hltbCompletionist)
                      ? 'border-[var(--gp-brand)] bg-[var(--gp-brand)]/10 ring-1 ring-[var(--gp-brand)]'
                      : 'border-[var(--gp-border-subtle)] bg-[var(--gp-secondary)] hover:bg-[var(--gp-elevated)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-[var(--gp-text)]">100% Completion</span>
                    {(userGame.targetGoal === '100% Completionist' || (!isEndless && targetHrs === userGame.game.hltbCompletionist)) && (
                      <Check className="w-3.5 h-3.5 text-[var(--gp-brand-light)]" />
                    )}
                  </div>
                  <div className="mt-1">
                    <span className="text-sm font-mono font-bold text-[var(--gp-brand-light)]">
                      {userGame.game.hltbCompletionist} ชม.
                    </span>
                    <span className="text-[10px] block text-[var(--gp-text-muted)]">เก็บครบทุกความสำเร็จ</span>
                  </div>
                </button>
              )}

              {/* Endless Mode */}
              <button
                type="button"
                onClick={() => handleSelectGoal(0, 'ENDLESS')}
                className={`p-2.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                  isEndless
                    ? 'border-[var(--gp-brand)] bg-[var(--gp-brand)]/10 ring-1 ring-[var(--gp-brand)]'
                    : 'border-[var(--gp-border-subtle)] bg-[var(--gp-secondary)] hover:bg-[var(--gp-elevated)]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-[var(--gp-text)]">Endless / Season</span>
                  {isEndless && <Check className="w-3.5 h-3.5 text-[var(--gp-brand-light)]" />}
                </div>
                <div className="mt-1">
                  <span className="text-sm font-mono font-bold text-[var(--gp-text-sub)]">
                    ไร้ขีดจำกัด
                  </span>
                  <span className="text-[10px] block text-[var(--gp-text-muted)]">เล่นเรื่อยๆ ไม่นับค้างสะสม</span>
                </div>
              </button>
            </div>

            {/* Custom Hours Input Toggle */}
            <div className="pt-0.5">
              {isEditingCustom ? (
                <form onSubmit={handleSaveCustom} className="flex items-center gap-2 animate-fadeIn">
                  <input
                    type="number"
                    placeholder="ระบุจำนวนชั่วโมง เช่น 50"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    className="flex-grow bg-[var(--gp-rail)] border border-[var(--gp-border-subtle)] focus:border-[var(--gp-brand)] rounded-lg px-3 py-1.5 text-xs font-mono text-[var(--gp-text)] focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[var(--gp-brand)] hover:bg-[var(--gp-brand-hover)] text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    บันทึก
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingCustom(false)}
                    className="px-2.5 py-1.5 border border-[var(--gp-border-subtle)] rounded-lg text-xs text-[var(--gp-text-muted)] hover:text-[var(--gp-text)]"
                  >
                    ยกเลิก
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCustomHours(targetHrs > 0 ? targetHrs.toString() : '');
                    setIsEditingCustom(true);
                  }}
                  className="text-xs font-medium text-[var(--gp-brand-light)] hover:underline flex items-center gap-1.5 py-0.5"
                >
                  <Sliders className="w-3 h-3" />
                  <span>กำหนดชั่วโมงเป้าหมายเอง (Custom Hours)...</span>
                </button>
              )}
            </div>
          </div>

          {/* Change Kanban Status Section */}
          {onMoveGameStatus && (
            <div className="space-y-1.5 pt-2 border-t border-[var(--gp-border-subtle)]">
              <label className="text-xs font-semibold block text-[var(--gp-text)]">
                ย้ายหมวดหมู่บนกระดาน (Status):
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: 'BACKLOG', label: 'รอเล่น' },
                    { id: 'PLAYING', label: 'กำลังเล่น' },
                    { id: 'COMPLETED', label: 'เล่นจบ' },
                    { id: 'DROPPED', label: 'เลิกเล่น' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStatusChange(st.id)}
                    className={`py-1.5 px-1 text-center rounded-lg text-xs font-medium border transition-colors ${
                      userGame.status === st.id
                        ? 'bg-[var(--gp-brand)] text-white border-[var(--gp-brand)] font-semibold shadow-xs'
                        : 'border-[var(--gp-border-subtle)] bg-[var(--gp-rail)] text-[var(--gp-text-muted)] hover:text-[var(--gp-text)]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[var(--gp-secondary)] border-t border-[var(--gp-border-subtle)] flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              confirmDelete
                ? 'bg-[var(--gp-red)] text-white animate-pulse'
                : 'text-[var(--gp-red)] hover:bg-[var(--gp-red)]/10'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmDelete ? 'กดยืนยันเพื่อลบ' : 'ลบออกจากกระดาน'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[var(--gp-brand)] hover:bg-[var(--gp-brand-hover)] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors active:scale-95"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
}
