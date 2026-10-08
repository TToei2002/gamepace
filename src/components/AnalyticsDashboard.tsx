'use client';

import React from 'react';
import { UserGameItem } from './GameCard';
import { calculatePacing } from '@/lib/pacing';
import { BarChart3, Trophy, Clock, CheckCircle, Download, Sparkles, Gift } from 'lucide-react';

interface AnalyticsDashboardProps {
  userGames: UserGameItem[];
  weekdayHours: number;
  weekendHours: number;
  onExportCSV: () => void;
  onOpenGamingWrapped?: () => void;
}

export function AnalyticsDashboard({
  userGames,
  weekdayHours,
  weekendHours,
  onExportCSV,
  onOpenGamingWrapped,
}: AnalyticsDashboardProps) {
  const totalGames = userGames.length;
  const completedGames = userGames.filter((g) => g.status === 'COMPLETED');
  const playingGames = userGames.filter((g) => g.status === 'PLAYING');
  const backlogGames = userGames.filter((g) => g.status === 'BACKLOG');
  const droppedGames = userGames.filter((g) => g.status === 'DROPPED');

  // Exclude endless games from completion calculation (story/campaign games only)
  const storyGames = userGames.filter((g) => g.targetGoal !== 'ENDLESS');
  const totalStoryGames = storyGames.length;
  const completionRate = totalStoryGames > 0 ? Math.round((completedGames.length / totalStoryGames) * 100) : 0;

  const totalPlayedHours = Number(
    userGames.reduce((acc, g) => acc + g.currentPlayedMinutes / 60, 0).toFixed(1)
  );

  const activeGames = userGames.filter((g) => g.status !== 'COMPLETED' && g.status !== 'DROPPED');
  const endlessGames = userGames.filter((g) => g.targetGoal === 'ENDLESS');
  const totalRemainingHours = Number(
    activeGames
      .filter((g) => g.targetGoal !== 'ENDLESS')
      .reduce((acc, g) => acc + Math.max(0, g.targetHours - g.currentPlayedMinutes / 60), 0)
      .toFixed(1)
  );

  const weeklyHours = weekdayHours * 5 + weekendHours * 2;
  const dailyHours = weeklyHours / 7;
  const totalDaysToClear = Math.ceil(totalRemainingHours / (dailyHours || 1));

  const clearDate = new Date();
  clearDate.setDate(clearDate.getDate() + totalDaysToClear);
  const formattedClearDate = clearDate.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* Gaming Wrapped Banner */}
      {onOpenGamingWrapped && (
        <div
          onClick={onOpenGamingWrapped}
          className="cursor-pointer p-4 rounded-xl border border-[var(--gp-border)] bg-[var(--gp-secondary)] hover:bg-[var(--gp-elevated)] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-150 group shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--gp-brand)]/15 text-[var(--gp-brand-light)] flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--gp-brand)]/20 text-[var(--gp-brand-light)] border border-[var(--gp-brand)]/30 uppercase tracking-wider">
                  Highlight
                </span>
                <span className="text-xs text-[var(--gp-text-muted)] font-mono">สรุปผลงานประจำเดือน</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--gp-text)] mt-0.5">
                Gaming Wrapped ประจำเดือนพร้อมให้คุณรับชมแล้ว
              </h3>
            </div>
          </div>

          <button
            type="button"
            className="px-3.5 py-1.5 bg-[var(--gp-brand)] hover:bg-[var(--gp-brand-hover)] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
          >
            <span>เปิดดูสรุป Wrapped</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Backlog Games */}
        <div className="bg-[var(--gp-secondary)] p-4 rounded-xl border border-[var(--gp-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--gp-text-muted)]">
              เกมทั้งหมดในระบบ
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--gp-rail)] text-[var(--gp-brand-light)] flex items-center justify-center border border-[var(--gp-border-subtle)]">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-[var(--gp-text)]">
              {totalGames} <span className="text-xs font-sans text-[var(--gp-text-muted)]">เกม</span>
            </div>
            <div className="text-[11px] mt-1 font-medium text-[var(--gp-text-muted)]">
              เล่นอยู่ <strong className="text-[var(--gp-brand-light)]">{playingGames.length}</strong> · ไร้จุดจบ <strong className="text-[var(--gp-text-sub)]">{endlessGames.length}</strong> · รอเล่น <strong className="text-[var(--gp-text-sub)]">{backlogGames.length}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Completion Rate */}
        <div className="bg-[var(--gp-secondary)] p-4 rounded-xl border border-[var(--gp-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--gp-text-muted)]">
              อัตราเคลียร์จบ (Completion)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--gp-rail)] text-[var(--gp-green)] flex items-center justify-center border border-[var(--gp-border-subtle)]">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-[var(--gp-green)] flex items-center gap-1.5">
              {completionRate}%
              {completionRate >= 50 && <Sparkles className="w-4 h-4 text-[var(--gp-green)]" />}
            </div>
            <div className="text-[11px] mt-1 font-medium text-[var(--gp-text-muted)]">
              เคลียร์แล้ว <strong className="text-[var(--gp-green)]">{completedGames.length}</strong> จาก {totalStoryGames} เกม (ไม่รวม Endless)
            </div>
          </div>
        </div>

        {/* Card 3: Total Played Hours */}
        <div className="bg-[var(--gp-secondary)] p-4 rounded-xl border border-[var(--gp-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--gp-text-muted)]">
              ชั่วโมงเล่นสะสมรวม
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--gp-rail)] text-amber-400 flex items-center justify-center border border-[var(--gp-border-subtle)]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-[var(--gp-text)]">
              {totalPlayedHours} <span className="text-xs font-sans text-[var(--gp-text-muted)]">ชม.</span>
            </div>
            <div className="text-[11px] mt-1 font-medium text-amber-400">
              เหลือสะสมที่ต้องเล่น ~{totalRemainingHours} ชม.
            </div>
          </div>
        </div>

        {/* Card 4: Estimated Clearance Date */}
        <div className="bg-[var(--gp-secondary)] p-4 rounded-xl border border-[var(--gp-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--gp-text-muted)]">
              ประเมินวันเคลียร์ Backlog ครบ
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--gp-rail)] text-[var(--gp-brand-light)] flex items-center justify-center border border-[var(--gp-border-subtle)]">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-[var(--gp-text)]">
              {formattedClearDate}
            </div>
            <div className="text-[11px] mt-1 font-medium text-[var(--gp-text-muted)]">
              อีกประมาณ ~{totalDaysToClear} วัน ({weeklyHours} ชม./สัปดาห์)
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution Visual Bar & Detailed Table */}
      <div className="bg-[var(--gp-secondary)] p-4 sm:p-5 rounded-xl border border-[var(--gp-border)] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--gp-border-subtle)] pb-3.5 gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--gp-text)]">
              สัดส่วนเกมแบ่งตามสถานะ (Status Distribution)
            </h3>
            <p className="text-xs text-[var(--gp-text-muted)] mt-0.5">
              เปรียบเทียบสัดส่วนเกมในคลังทั้งหมด
            </p>
          </div>

          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 bg-[var(--gp-primary)] hover:bg-[var(--gp-elevated)] border border-[var(--gp-border)] text-[var(--gp-text)] text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-xs shrink-0 active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[var(--gp-text-muted)]" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="space-y-2.5">
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[var(--gp-rail)] border border-[var(--gp-border-subtle)]">
            {totalGames > 0 ? (
              <>
                <div
                  className="bg-[var(--gp-green)] h-full transition-all duration-300"
                  style={{ width: `${(completedGames.length / totalGames) * 100}%` }}
                  title={`Completed: ${completedGames.length}`}
                />
                <div
                  className="bg-[var(--gp-brand)] h-full transition-all duration-300"
                  style={{ width: `${(playingGames.length / totalGames) * 100}%` }}
                  title={`Playing: ${playingGames.length}`}
                />
                <div
                  className="bg-slate-500 h-full transition-all duration-300"
                  style={{ width: `${(backlogGames.length / totalGames) * 100}%` }}
                  title={`Backlog: ${backlogGames.length}`}
                />
                <div
                  className="bg-[var(--gp-red)] h-full transition-all duration-300"
                  style={{ width: `${(droppedGames.length / totalGames) * 100}%` }}
                  title={`Dropped: ${droppedGames.length}`}
                />
              </>
            ) : (
              <div className="w-full h-full bg-[var(--gp-rail)]" />
            )}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--gp-green)]"></span>
              <span className="text-[var(--gp-text-sub)]">เคลียร์แล้ว ({completedGames.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--gp-brand)]"></span>
              <span className="text-[var(--gp-text-sub)]">กำลังเล่น ({playingGames.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              <span className="text-[var(--gp-text-sub)]">รอเล่น ({backlogGames.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--gp-red)]"></span>
              <span className="text-[var(--gp-text-sub)]">เลิกเล่น ({droppedGames.length})</span>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto pt-1">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[var(--gp-border-subtle)] text-[11px] uppercase tracking-wider font-semibold text-[var(--gp-text-muted)]">
                <th className="py-2.5 px-3">ชื่อเกม</th>
                <th className="py-2.5 px-3">สถานะ</th>
                <th className="py-2.5 px-3">เป้าหมาย HLTB</th>
                <th className="py-2.5 px-3">ชั่วโมงเล่น / เป้าหมาย</th>
                <th className="py-2.5 px-3">เวลาคงเหลือ</th>
                <th className="py-2.5 px-3">ประเมินวันจบ (ECD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gp-border-subtle)]">
              {userGames.map((ug) => {
                const playedHrs = Number((ug.currentPlayedMinutes / 60).toFixed(1));
                const isEndless = ug.targetGoal === 'ENDLESS';
                const pacing = calculatePacing(ug.targetHours, playedHrs, weekdayHours, weekendHours, ug.targetGoal);

                return (
                  <tr key={ug.id} className="hover:bg-[var(--gp-elevated)] transition-colors">
                    <td className="py-3 px-3 font-medium text-[var(--gp-text)]">
                      {ug.game.title}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold bg-[var(--gp-rail)] border border-[var(--gp-border-subtle)] text-[var(--gp-text-muted)]">
                        {ug.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--gp-text-muted)]">
                      {isEndless ? 'Endless / Season' : ug.targetGoal || 'Main Story'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--gp-text-sub)]">
                      {isEndless ? `${playedHrs} ชม. (ไม่จำกัด)` : `${playedHrs} / ${ug.targetHours} ชม.`}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold">
                      {isEndless ? (
                        <span className="text-[var(--gp-text-muted)]">ไม่จำกัด</span>
                      ) : (
                        <span className="text-amber-400">{pacing.remainingHours} ชม.</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {isEndless ? (
                        <span className="text-[var(--gp-text-muted)]">เล่นเรื่อยๆ</span>
                      ) : ug.status === 'COMPLETED' ? (
                        <span className="text-[var(--gp-green)]">จบแล้ว</span>
                      ) : (
                        <span className="text-[var(--gp-brand-light)]">{pacing.estimatedCompletionDate}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
