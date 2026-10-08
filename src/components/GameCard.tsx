'use client';

import React from 'react';
import { Calendar, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import { calculatePacing } from '@/lib/pacing';
import { GameCoverImage } from './GameCoverImage';

export interface UserGameItem {
  id: string;
  userId: string;
  gameId: string;
  status: 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'DROPPED' | string;
  targetGoal: string;
  targetHours: number;
  currentPlayedMinutes: number;
  order: number;
  game: {
    id: string;
    steamAppId?: number | null;
    title: string;
    coverUrl?: string | null;
    hltbMainStory: number;
    hltbExtra: number;
    hltbCompletionist: number;
  };
  createdAt?: string;
  syncHistories?: Array<{
    id: string;
    previousMinutes: number;
    newMinutes: number;
    syncedAt: string;
  }>;
}

interface GameCardProps {
  userGame: UserGameItem;
  weekdayHours: number;
  weekendHours: number;
  isCompact?: boolean;
  isDragging?: boolean;
  dropPosition?: 'before' | 'after' | null;
  onOpenDetail?: (game: UserGameItem) => void;
  onAddManualTime?: (id: string, mins: number) => void;
  onUpdateTargetHours?: (id: string, newTargetHours: number, goalName?: string) => void;
  onRemoveGame?: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onCardDragOver?: (e: React.DragEvent, id: string) => void;
  onCardDragLeave?: (e: React.DragEvent, id: string) => void;
  onCardDrop?: (e: React.DragEvent, id: string) => void;
}

export function GameCard({
  userGame,
  weekdayHours,
  weekendHours,
  isCompact = false,
  isDragging,
  dropPosition,
  onOpenDetail,
  onDragStart,
  onDragEnd,
  onCardDragOver,
  onCardDragLeave,
  onCardDrop,
}: GameCardProps) {
  const playedHrs = Number((userGame.currentPlayedMinutes / 60).toFixed(1));
  const isEndless = userGame.targetGoal === 'ENDLESS';
  const targetHrs = isEndless ? 0 : (userGame.targetHours || 40);
  const pacing = calculatePacing(userGame.targetHours || 40, playedHrs, weekdayHours, weekendHours, userGame.targetGoal);

  const isCompleted = userGame.status === 'COMPLETED';
  const isOvertime = playedHrs > targetHrs && !isCompleted && !isEndless && targetHrs > 0;
  const overtimeHours = Number((playedHrs - targetHrs).toFixed(1));

  // Determine Goal Badge Label & Style (Discreet, seamless pill design)
  const goalBadge = isEndless
    ? { label: 'Endless', dot: 'bg-slate-400' }
    : userGame.targetGoal === '100% Completionist'
    ? { label: '100%', dot: 'bg-purple-400' }
    : userGame.targetGoal === 'Main + Extra'
    ? { label: 'Extra', dot: 'bg-indigo-400' }
    : { label: 'Main', dot: 'bg-sky-400' };

  if (isCompact) {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart(e, userGame.id)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => onCardDragOver?.(e, userGame.id)}
        onDragLeave={(e) => onCardDragLeave?.(e, userGame.id)}
        onDrop={(e) => onCardDrop?.(e, userGame.id)}
        onClick={() => onOpenDetail?.(userGame)}
        className={`bg-[var(--gp-primary)] hover:bg-[var(--gp-elevated)] border border-[var(--gp-divider)] rounded-xl p-2.5 flex items-center justify-between gap-2.5 cursor-pointer active:cursor-grabbing transition-all duration-150 select-none group relative shadow-xs w-full max-w-full ${
          isDragging ? 'opacity-40 scale-[0.98] ring-2 ring-[var(--gp-brand)]/50' : ''
        }`}
      >
        {/* Drop Indicator Lines */}
        {dropPosition === 'before' && (
          <div className="absolute -top-1 left-1 right-1 h-0.5 bg-[var(--gp-brand)] rounded-full z-30 pointer-events-none" />
        )}
        {dropPosition === 'after' && (
          <div className="absolute -bottom-1 left-1 right-1 h-0.5 bg-[var(--gp-brand)] rounded-full z-30 pointer-events-none" />
        )}

        <div className="flex items-center gap-2.5 min-w-0 flex-grow">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-[var(--gp-divider)] shrink-0 bg-[var(--gp-rail)]">
            <GameCoverImage
              src={userGame.game.coverUrl}
              appId={userGame.game.steamAppId}
              title={userGame.game.title}
              isEndless={isEndless}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 flex-grow">
            <h3
              className="font-medium text-xs truncate transition-colors text-[var(--gp-text)] group-hover:text-[var(--gp-text-strong)]"
              title={userGame.game.title}
            >
              {userGame.game.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--gp-rail)]/60 border border-[var(--gp-divider)] text-[9.5px] font-medium text-[var(--gp-text-muted)] tracking-tight">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${goalBadge.dot}`} />
                <span>{goalBadge.label}</span>
              </span>
              <span className="text-[10px] font-mono text-[var(--gp-text-muted)]">
                {playedHrs} ชม.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--gp-rail)]/60 border border-[var(--gp-divider)] text-[10px] font-medium text-[var(--gp-text-muted)] tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>จบแล้ว</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, userGame.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onCardDragOver?.(e, userGame.id)}
      onDragLeave={(e) => onCardDragLeave?.(e, userGame.id)}
      onDrop={(e) => onCardDrop?.(e, userGame.id)}
      onClick={() => onOpenDetail?.(userGame)}
      className={`bg-[var(--gp-primary)] hover:bg-[var(--gp-elevated)] border border-[var(--gp-divider)] rounded-xl p-3 flex flex-col gap-2.5 cursor-pointer active:cursor-grabbing transition-all duration-150 select-none group relative shadow-xs w-full max-w-full hover:translate-y-[-1px] ${
        isDragging ? 'opacity-40 scale-[0.98] ring-2 ring-[var(--gp-brand)]/50' : ''
      }`}
    >
      {/* Drop Indicator Lines */}
      {dropPosition === 'before' && (
        <div className="absolute -top-1 left-1.5 right-1.5 h-0.5 bg-[var(--gp-brand)] rounded-full z-30 pointer-events-none" />
      )}
      {dropPosition === 'after' && (
        <div className="absolute -bottom-1 left-1.5 right-1.5 h-0.5 bg-[var(--gp-brand)] rounded-full z-30 pointer-events-none" />
      )}

      {/* Top Row: Game Cover + Title + Goal Badge */}
      <div className="flex items-center justify-between gap-2.5 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-grow">
          <div className="overflow-hidden rounded-lg border border-[var(--gp-divider)] shrink-0 w-10 h-10 bg-[var(--gp-rail)]">
            <GameCoverImage
              src={userGame.game.coverUrl}
              appId={userGame.game.steamAppId}
              title={userGame.game.title}
              isEndless={isEndless}
              className="w-10 h-10 object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 flex-grow">
            <h3
              className="font-semibold text-xs sm:text-sm truncate transition-colors text-[var(--gp-text)] group-hover:text-[var(--gp-text-strong)]"
              title={userGame.game.title}
            >
              {userGame.game.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--gp-rail)]/60 border border-[var(--gp-divider)] text-[10px] font-medium text-[var(--gp-text-muted)] tracking-tight">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${goalBadge.dot}`} />
                <span>{goalBadge.label}</span>
              </span>
              {isOvertime && (
                <span className="text-[10px] font-mono text-[var(--gp-brand-light)] font-medium">
                  (+{overtimeHours} ชม.)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Progress Bar & Hours */}
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-xs text-[var(--gp-text-sub)]">
              {playedHrs}
            </span>
            <span className="text-[11px] text-[var(--gp-text-muted)]">
              {isEndless ? 'ชม. (เรื่อยๆ)' : `/ ${targetHrs} ชม.`}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--gp-rail)]/70 border border-[var(--gp-divider)] text-[var(--gp-text-muted)]">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isEndless
                  ? 'bg-purple-400'
                  : isCompleted
                  ? 'bg-emerald-400'
                  : 'bg-indigo-400'
              }`}
            />
            <span>{isEndless ? 'Endless' : isCompleted ? '100%' : `${pacing.completionPercentage}%`}</span>
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--gp-rail)] border border-[var(--gp-divider)]">
          {isEndless ? (
            <div className="h-full w-full endless-bar-glow rounded-full" />
          ) : (
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-[var(--gp-green)]'
                  : 'bg-[var(--gp-brand)]'
              }`}
              style={{ width: `${Math.min(100, pacing.completionPercentage)}%` }}
            />
          )}
        </div>
      </div>

      {/* Bottom Row: Remaining Pacing Info */}
      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[var(--gp-divider)] text-[var(--gp-text-muted)]">
        <div className="flex items-center gap-1 truncate">
          {isEndless ? (
            <span className="text-[var(--gp-text-muted)] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--gp-text-muted)]" /> เล่นเรื่อยๆ
            </span>
          ) : isCompleted ? (
            <span className="text-[var(--gp-green)] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[var(--gp-green)]" /> จบแล้ว
            </span>
          ) : isOvertime ? (
            <span className="text-[var(--gp-text)] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--gp-brand-light)]" /> บรรลุเป้าหมายแล้ว ({playedHrs} ชม.)
            </span>
          ) : (
            <div className="flex items-center gap-1 truncate">
              <Calendar className="w-3 h-3 text-[var(--gp-brand-light)] shrink-0" />
              <span className="truncate">
                เหลือ <strong className="text-[var(--gp-text)] font-mono font-semibold">{pacing.remainingHours} ชม.</strong> (~{pacing.daysRemaining} วัน)
              </span>
            </div>
          )}
        </div>

        <span className="text-[10px] opacity-75 group-hover:text-[var(--gp-brand-light)] font-medium shrink-0">
          แก้ไข
        </span>
      </div>
    </div>
  );
}
