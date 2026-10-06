'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Trophy,
  Clock,
  Flame,
  Gamepad2,
  Calendar,
  TrendingUp,
  Award,
  Medal,
} from 'lucide-react';
import { UserGameItem } from './GameCard';

interface GamingWrappedModalProps {
  isOpen: boolean;
  userGames: UserGameItem[];
  weekdayHours: number;
  weekendHours: number;
  userName?: string;
  onClose: () => void;
}

export function GamingWrappedModal({
  isOpen,
  userGames,
  weekdayHours,
  weekendHours,
  userName = 'Gamer',
  onClose,
}: GamingWrappedModalProps) {
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  // Time boundaries
  const now = new Date();
  const currentYear = now.getFullYear();
  const startOfMonth = new Date(currentYear, now.getMonth(), 1).getTime();
  const startOfYear = new Date(currentYear, 0, 1).getTime();

  const monthNameTh = now.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
  const yearNameTh = `ปี ${currentYear + 543}`;

  // Calculate playtime deltas for each game
  const gamesWithDeltas = userGames.map((game) => {
    let monthMinutes = 0;
    let yearMinutes = 0;

    if (game.syncHistories && game.syncHistories.length > 0) {
      for (const sh of game.syncHistories) {
        const syncTime = new Date(sh.syncedAt).getTime();
        let diff = Math.max(0, sh.newMinutes - sh.previousMinutes);

        // --- BUG FIX: Initial Sync Anomaly Guard ---
        // If the database was recently wiped/created and it synced hundreds of hours at once,
        // it ruins the monthly stats. If a game jumps from 0 to > 100 hours in a single sync,
        // it's an initial library import, not actual playtime for this month.
        if (sh.previousMinutes === 0 && diff > 100 * 60) {
          diff = 0; 
        }

        if (syncTime >= startOfMonth) {
          monthMinutes += diff;
        }
        if (syncTime >= startOfYear) {
          yearMinutes += diff;
        }
      }
    }

    return {
      ...game,
      monthMinutes,
      monthHours: Number((monthMinutes / 60).toFixed(1)),
      yearMinutes,
      yearHours: Number((yearMinutes / 60).toFixed(1)),
    };
  });

  // Target metrics based on current viewMode
  const isMonthly = viewMode === 'monthly';
  const totalPeriodMinutes = gamesWithDeltas.reduce(
    (acc, g) => acc + (isMonthly ? g.monthMinutes : g.yearMinutes),
    0
  );
  const totalPeriodHours = Number((totalPeriodMinutes / 60).toFixed(1));

  // Sort by period playtime to find Top 1, 2, 3 games
  // BUG FIX: Filter out games that have 0 playtime in this period so they don't pollute the podium
  const sortedGames = [...gamesWithDeltas]
    .filter((g) => (isMonthly ? g.monthMinutes > 0 : g.yearMinutes > 0))
    .sort((a, b) => {
      return isMonthly
        ? b.monthMinutes - a.monthMinutes
        : b.yearMinutes - a.yearMinutes;
    });

  const topGame = sortedGames[0] || null;
  const runnerUp2 = sortedGames[1] || null;
  const runnerUp3 = sortedGames[2] || null;

  const getGamePeriodHours = (g: typeof sortedGames[0] | null) => {
    if (!g) return 0;
    return isMonthly ? g.monthHours : g.yearHours;
  };

  const topGameHours = getGamePeriodHours(topGame);

  // General counts
  const totalGames = userGames.length;
  const completedGames = userGames.filter((g) => g.status === 'COMPLETED');
  const endlessGames = userGames.filter((g) => g.targetGoal === 'ENDLESS');
  const weeklyHours = Number((weekdayHours * 5 + weekendHours * 2).toFixed(1));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[var(--gp-primary)] border border-[var(--gp-border)] rounded-2xl max-w-xl w-full shadow-2xl animate-scaleIn relative overflow-hidden my-auto flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[var(--gp-divider)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--gp-rail)] border border-[var(--gp-divider)] text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--gp-rail)]/80 text-[var(--gp-text-muted)] border border-[var(--gp-divider)] text-[10px] font-medium uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span>{isMonthly ? 'Monthly Wrapped' : 'Year in Review'}</span>
                </span>
                <span className="text-xs text-[var(--gp-text-muted)] font-mono">
                  {isMonthly ? monthNameTh : yearNameTh}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--gp-text)] mt-0.5">
                Gaming Wrapped
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--gp-text-muted)] hover:text-[var(--gp-text)] hover:bg-[var(--gp-elevated)] transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Period Switcher Toggle: Monthly vs Yearly */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--gp-rail)] border border-[var(--gp-border-subtle)] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                isMonthly
                  ? 'bg-[var(--gp-brand)] text-white shadow-xs'
                  : 'text-[var(--gp-text-muted)] hover:text-[var(--gp-text)]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>สรุปประจำเดือน ({monthNameTh})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('yearly')}
              className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                !isMonthly
                  ? 'bg-[var(--gp-brand)] text-white shadow-xs'
                  : 'text-[var(--gp-text-muted)] hover:text-[var(--gp-text)]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>สรุปสิ้นปี ({yearNameTh})</span>
            </button>
          </div>

          {/* Top Hero: Champion Game of the Period */}
          {topGame ? (
            <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--gp-border)] bg-[var(--gp-secondary)] relative overflow-hidden">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="flex items-center gap-1.5 font-bold text-amber-400">
                  <CrownIcon className="w-3.5 h-3.5" />
                  {isMonthly ? 'เกมที่คุณเล่นมากที่สุดในเดือนนี้' : 'Game of the Year'}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--gp-rail)] text-amber-400 border border-[var(--gp-border-subtle)] font-semibold">
                  +{topGameHours} ชม. ในรอบนี้
                </span>
              </div>

              <div className="flex items-center gap-3">
                {topGame.game.coverUrl ? (
                  <div className="overflow-hidden rounded-lg border border-[var(--gp-border-subtle)] shrink-0 w-14 h-14 bg-[var(--gp-rail)]">
                    <img
                      src={topGame.game.coverUrl}
                      alt={topGame.game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-[var(--gp-rail)] border border-[var(--gp-border-subtle)] text-[var(--gp-text-muted)] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    #1
                  </div>
                )}

                <div className="min-w-0 flex-grow">
                  <h3 className="font-bold text-sm sm:text-base truncate text-[var(--gp-text)]">
                    {topGame.game.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-[var(--gp-rail)] border border-[var(--gp-border-subtle)] text-[var(--gp-text-muted)]">
                      {topGame.targetGoal === 'ENDLESS' ? 'Endless' : `เป้า: ${topGame.targetGoal || 'Main Story'}`}
                    </span>
                    <span className="text-xs text-[var(--gp-text-muted)]">
                      สถานะ: <strong className="text-[var(--gp-text-sub)]">{topGame.status}</strong>
                    </span>
                  </div>

                  <div className="mt-2 w-full">
                    <div className="w-full h-1.5 rounded-full bg-[var(--gp-rail)] overflow-hidden border border-[var(--gp-border-subtle)]">
                      <div
                        className={`h-full rounded-full ${
                          topGame.targetGoal === 'ENDLESS'
                            ? 'bg-[var(--gp-text-muted)]/50'
                            : 'bg-[var(--gp-brand)]'
                        }`}
                        style={{
                          width:
                            topGame.targetGoal === 'ENDLESS'
                              ? '100%'
                              : `${Math.min(100, ((topGame.currentPlayedMinutes / 60) / (topGame.targetHours || 40)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-[var(--gp-border-subtle)] bg-[var(--gp-secondary)] text-center space-y-1.5">
              <div className="w-8 h-8 mx-auto rounded-lg bg-[var(--gp-rail)] flex items-center justify-center text-[var(--gp-text-muted)]">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[var(--gp-text)]">
                ยังไม่มีบันทึกเวลาเล่นใหม่ใน{isMonthly ? 'เดือนนี้' : 'ปีนี้'}
              </p>
              <p className="text-[11px] text-[var(--gp-text-muted)]">
                เมื่อคุณบันทึกเวลาเล่นหรือซิงค์จาก Steam ตัวเลขจะเริ่มนับเป็นสถิติของรอบนี้
              </p>
            </div>
          )}

          {/* 4 Stats Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Stat 1: Period Playtime */}
            <div className="p-3 rounded-xl border border-[var(--gp-border-subtle)] bg-[var(--gp-secondary)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--gp-text-muted)] font-medium">
                  {isMonthly ? 'เวลาเล่นเดือนนี้' : 'เวลาเล่นทั้งปี'}
                </span>
                <Clock className="w-3.5 h-3.5 text-[var(--gp-brand-light)]" />
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold font-mono text-[var(--gp-text)]">
                  {totalPeriodHours}
                </span>
                <span className="text-xs text-[var(--gp-text-muted)] ml-1">ชม.</span>
              </div>
            </div>

            {/* Stat 2: Finished Games */}
            <div className="p-3 rounded-xl border border-[var(--gp-border-subtle)] bg-[var(--gp-secondary)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--gp-text-muted)] font-medium">เคลียร์จบ</span>
                <Trophy className="w-3.5 h-3.5 text-[var(--gp-green)]" />
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold font-mono text-[var(--gp-green)]">
                  {completedGames.length}
                </span>
                <span className="text-xs text-[var(--gp-text-muted)] ml-1">เกม</span>
              </div>
            </div>

            {/* Stat 3: Endless Active */}
            <div className="p-3 rounded-xl border border-[var(--gp-border-subtle)] bg-[var(--gp-secondary)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--gp-text-muted)] font-medium">เกมไร้จุดจบ</span>
                <Flame className="w-3.5 h-3.5 text-[var(--gp-text-sub)]" />
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold font-mono text-[var(--gp-text)]">
                  {endlessGames.length}
                </span>
                <span className="text-xs text-[var(--gp-text-muted)] ml-1">เกม</span>
              </div>
            </div>

            {/* Stat 4: Weekly Pace */}
            <div className="p-3 rounded-xl border border-[var(--gp-border-subtle)] bg-[var(--gp-secondary)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--gp-text-muted)] font-medium">สปีดที่จัดสรร</span>
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold font-mono text-amber-400">
                  {weeklyHours}
                </span>
                <span className="text-xs text-[var(--gp-text-muted)] ml-1">ชม./สัปดาห์</span>
              </div>
            </div>
          </div>

          {/* Top 2 & Top 3 Runner-Ups Podium */}
          {(runnerUp2 || runnerUp3) && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold flex items-center gap-1.5 text-[var(--gp-text)]">
                <Medal className="w-3.5 h-3.5 text-[var(--gp-text-muted)]" />
                <span>{runnerUp2 && runnerUp3 ? 'อันดับ 2 และ 3 ของรอบนี้' : 'อันดับ 2 ของรอบนี้'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Rank 2 */}
                {runnerUp2 && (
                  <div className="p-2.5 rounded-xl border border-[var(--gp-border-subtle)] bg-[var(--gp-secondary)] flex items-center gap-2.5">
                    {runnerUp2.game.coverUrl ? (
                      <img
                        src={runnerUp2.game.coverUrl}
                        alt={runnerUp2.game.title}
                        className="w-10 h-10 rounded-lg object-cover border border-[var(--gp-border-subtle)] shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[var(--gp-rail)] border border-[var(--gp-border-subtle)] flex items-center justify-center font-mono font-bold text-xs text-[var(--gp-text-muted)] shrink-0">
                        #2
                      </div>
                    )}

                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-[var(--gp-rail)] text-[var(--gp-text-sub)] border border-[var(--gp-border-subtle)] font-mono">
                          อันดับ 2
                        </span>
                        <span className="text-[10px] text-[var(--gp-text-muted)] truncate">
                          {runnerUp2.targetGoal === 'ENDLESS' ? 'Endless' : runnerUp2.status}
                        </span>
                      </div>
                      <h5 className="font-semibold text-xs truncate mt-0.5 text-[var(--gp-text)]">
                        {runnerUp2.game.title}
                      </h5>
                      <p className="text-[11px] font-mono font-semibold text-[var(--gp-text-muted)]">
                        +{getGamePeriodHours(runnerUp2)} ชม.
                      </p>
                    </div>
                  </div>
                )}

                {/* Rank 3 */}
                {runnerUp3 && (
                  <div className="p-2.5 rounded-xl border border-[var(--gp-border-subtle)] bg-[var(--gp-secondary)] flex items-center gap-2.5">
                    {runnerUp3.game.coverUrl ? (
                      <img
                        src={runnerUp3.game.coverUrl}
                        alt={runnerUp3.game.title}
                        className="w-10 h-10 rounded-lg object-cover border border-[var(--gp-border-subtle)] shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[var(--gp-rail)] border border-[var(--gp-border-subtle)] flex items-center justify-center font-mono font-bold text-xs text-[var(--gp-text-muted)] shrink-0">
                        #3
                      </div>
                    )}

                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-[var(--gp-rail)] text-[var(--gp-text-sub)] border border-[var(--gp-border-subtle)] font-mono">
                          อันดับ 3
                        </span>
                        <span className="text-[10px] text-[var(--gp-text-muted)] truncate">
                          {runnerUp3.targetGoal === 'ENDLESS' ? 'Endless' : runnerUp3.status}
                        </span>
                      </div>
                      <h5 className="font-semibold text-xs truncate mt-0.5 text-[var(--gp-text)]">
                        {runnerUp3.game.title}
                      </h5>
                      <p className="text-[11px] font-mono font-semibold text-[var(--gp-text-muted)]">
                        +{getGamePeriodHours(runnerUp3)} ชม.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[var(--gp-secondary)] border-t border-[var(--gp-border-subtle)] flex items-center justify-between">
          <span className="text-xs text-[var(--gp-text-muted)] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[var(--gp-brand-light)]" />
            สรุปข้อมูลสถิติจากคลังเกม GamePace ของคุณ
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--gp-primary)] hover:bg-[var(--gp-elevated)] border border-[var(--gp-border)] text-[var(--gp-text-strong)] text-xs font-semibold rounded-lg shadow-xs transition-colors active:scale-95"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
    </svg>
  );
}
