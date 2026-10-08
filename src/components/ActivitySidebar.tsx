'use client';

import React from 'react';
import {
  Clock,
  Flame,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Layers,
  Download,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  BarChart2,
  Gamepad2
} from 'lucide-react';
import { BurnoutStatus } from '@/lib/pacing';
import { UserGameItem } from './GameCard';
import { SteamIcon } from './SteamIcon';

interface ActivitySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  weekdayHours: number;
  weekendHours: number;
  totalRemainingHours: number;
  totalRemainingDays: number;
  burnoutStatus?: BurnoutStatus;
  userGames: UserGameItem[];
  userSteamId?: string | null;
  userName?: string;
  isSyncing: boolean;
  onTriggerSteamSync: () => void;
  onOpenPacingModal: () => void;
  onExportCSV: () => void;
  onOpenSteamConnect: () => void;
}

export function ActivitySidebar({
  isOpen,
  onToggle,
  weekdayHours,
  weekendHours,
  totalRemainingHours,
  totalRemainingDays,
  burnoutStatus,
  userGames,
  userSteamId,
  userName = 'Gamer',
  isSyncing,
  onTriggerSteamSync,
  onOpenPacingModal,
  onExportCSV,
  onOpenSteamConnect,
}: ActivitySidebarProps) {
  const weeklyHours = Number((weekdayHours * 5 + weekendHours * 2).toFixed(1));
  const dailyHours = Number((weeklyHours / 7).toFixed(1));

  // Game statistics - cleanly separated between Story & Endless
  const totalGames = userGames.length;
  const storyGames = userGames.filter((g) => g.targetGoal !== 'ENDLESS');
  const playingStoryGames = userGames.filter((g) => g.status === 'PLAYING' && g.targetGoal !== 'ENDLESS');
  const completedStoryGames = userGames.filter((g) => g.status === 'COMPLETED' && g.targetGoal !== 'ENDLESS');
  const endlessGames = userGames.filter((g) => g.targetGoal === 'ENDLESS');
  const completedAllGames = userGames.filter((g) => g.status === 'COMPLETED');

  // Completion rate strictly based on story games (0-100%)
  const completionRate = storyGames.length > 0
    ? Math.round((completedStoryGames.length / storyGames.length) * 100)
    : 0;

  // Burnout risk styling
  const riskLevel = burnoutStatus?.level ?? (burnoutStatus?.isBurnoutRisk ? 'HIGH' : 'LOW');
  const riskColor =
    riskLevel === 'CRITICAL' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
      riskLevel === 'HIGH' ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' :
        riskLevel === 'MEDIUM' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' :
          'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  const riskLabel =
    riskLevel === 'CRITICAL' ? 'เสี่ยงดองขั้นวิกฤติ' :
      riskLevel === 'HIGH' ? 'ดองเกมเริ่มสะสมสูง' :
        riskLevel === 'MEDIUM' ? 'พอดีๆ กำลังดี' :
          'Pacing ยอดเยี่ยม สบายๆ';

  // -------------------------------------------------------------
  // Weekly & Daily Playtime Calculation (Gaming Wrapped Methodology)
  // -------------------------------------------------------------
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000;
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const endOfYesterday = startOfToday;

  // Monday 00:00:00 of the current week (ISO: Mon = 0 ... Sun = 6)
  const currentDayOfWeek = (now.getDay() + 6) % 7;
  const yesterdayDayOfWeek = (currentDayOfWeek + 6) % 7;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDayOfWeek, 0, 0, 0, 0).getTime();
  const endOfWeek = startOfWeek + 7 * 24 * 60 * 60 * 1000;

  const dayNames = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];

  // Calculate playtime deltas for each game within time boundaries (same as Gaming Wrapped)
  const {
    totalWeekMinutes,
    totalTodayMinutes,
    totalYesterdayMinutes,
    dayMinutesMap,
    gamesWithWeekDeltas,
  } = React.useMemo(() => {
    let weekMins = 0;
    let todayMins = 0;
    let yesterdayMins = 0;
    const dailyMins = [0, 0, 0, 0, 0, 0, 0];

    const withDeltas = userGames.map((game) => {
      let gWeekMinutes = 0;
      let gTodayMinutes = 0;

      if (game.syncHistories && game.syncHistories.length > 0) {
        for (const sh of game.syncHistories) {
          const syncDate = new Date(sh.syncedAt);
          const syncTime = syncDate.getTime();
          const diff = Math.max(0, sh.newMinutes - sh.previousMinutes);

          // Check if this sync happened during this week
          if (syncTime >= startOfWeek && syncTime < endOfWeek) {
            gWeekMinutes += diff;
            weekMins += diff;

            // Determine which day of the week this sync occurred on (0 = Mon ... 6 = Sun) using user's local timezone
            const syncDayIdx = (syncDate.getDay() + 6) % 7;
            if (syncDayIdx >= 0 && syncDayIdx < 7) {
              dailyMins[syncDayIdx] += diff;
            }
          }

          // Check if this sync happened today
          if (syncTime >= startOfToday && syncTime < endOfToday) {
            gTodayMinutes += diff;
            todayMins += diff;
          }

          // Check if this sync happened yesterday
          if (syncTime >= startOfYesterday && syncTime < endOfYesterday) {
            yesterdayMins += diff;
          }
        }
      }

      return {
        ...game,
        weekMinutes: gWeekMinutes,
        weekHours: Number((gWeekMinutes / 60).toFixed(1)),
        todayMinutes: gTodayMinutes,
        todayHours: Number((gTodayMinutes / 60).toFixed(1)),
      };
    });

    return {
      totalWeekMinutes: weekMins,
      totalTodayMinutes: todayMins,
      totalYesterdayMinutes: yesterdayMins,
      dayMinutesMap: dailyMins,
      gamesWithWeekDeltas: withDeltas,
    };
  }, [userGames, startOfWeek, endOfWeek, startOfToday, endOfToday, startOfYesterday, endOfYesterday]);

  const totalWeekHours = Number((totalWeekMinutes / 60).toFixed(1));
  const totalTodayHours = Number((totalTodayMinutes / 60).toFixed(1));
  const totalYesterdayHours = Number((totalYesterdayMinutes / 60).toFixed(1));

  // 7-Day bar data based on actual recorded playtime
  const weekDaysData = React.useMemo(() => {
    return dayNames.map((label, idx) => {
      const hours = Number((dayMinutesMap[idx] / 60).toFixed(1));
      return {
        label,
        hours,
        isToday: idx === currentDayOfWeek,
        isYesterday: idx === yesterdayDayOfWeek,
        isPast: idx < currentDayOfWeek,
        isFuture: idx > currentDayOfWeek,
      };
    });
  }, [dayMinutesMap, currentDayOfWeek, yesterdayDayOfWeek]);

  const maxDailyVal = Math.max(
    dailyHours * 1.3,
    weekdayHours,
    weekendHours,
    ...weekDaysData.map((d) => d.hours),
    1
  );

  const targetLinePercent = maxDailyVal > 0 && dailyHours > 0
    ? Math.min(88, Math.max(12, (dailyHours / maxDailyVal) * 100))
    : 0;

  const weeklyPercent = weeklyHours > 0
    ? Math.min(100, Math.round((totalWeekHours / weeklyHours) * 100))
    : 0;

  // Games played this week: sorted by week delta (games with actual sync delta this week)
  const playedThisWeekGames = React.useMemo(() => {
    return gamesWithWeekDeltas
      .filter((g) => g.weekMinutes > 0)
      .sort((a, b) => b.weekMinutes - a.weekMinutes);
  }, [gamesWithWeekDeltas]);

  return (

      <aside
        className={`bg-[var(--gp-secondary)] border-l border-[var(--gp-divider)] flex flex-col shrink-0 transition-all duration-300 ease-in-out select-none z-20 h-screen overflow-hidden ${isOpen ? 'w-[300px]' : 'w-0 border-l-0 opacity-0 pointer-events-none'
          }`}
        aria-label="Activity & Pacing Sidebar"
      >
        {/* Sidebar Header */}
        <div className="h-14 px-4 border-b border-[var(--gp-divider)] flex items-center justify-between shrink-0 bg-[var(--gp-floating)]/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--gp-brand)] animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--gp-text-strong)]">
              Activity & Pacing
            </h2>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-lg text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] hover:bg-[var(--gp-hover)] transition-colors"
            title="พับแถบข้าง"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* Pacing Budget Card */}
          <div className="rounded-xl bg-[var(--gp-primary)] border border-[var(--gp-divider)] p-3.5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gp-text-muted)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--gp-brand-light)]" />
                งบเวลาเล่น (Pacing)
              </span>
              <button
                type="button"
                onClick={onOpenPacingModal}
                className="text-[11px] font-semibold text-[var(--gp-brand-light)] hover:underline flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                ตั้งค่า
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-[var(--gp-rail)] border border-[var(--gp-divider)]">
                <span className="text-[10px] text-[var(--gp-text-muted)] block">ต่อสัปดาห์</span>
                <span className="text-sm font-bold font-mono text-[var(--gp-text-strong)]">
                  {weeklyHours} <span className="text-[10px] font-normal text-[var(--gp-text-muted)]">ชม.</span>
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--gp-rail)] border border-[var(--gp-divider)]">
                <span className="text-[10px] text-[var(--gp-text-muted)] block">เฉลี่ยต่อวัน</span>
                <span className="text-sm font-bold font-mono text-[var(--gp-text-strong)]">
                  ~{dailyHours} <span className="text-[10px] font-normal text-[var(--gp-text-muted)]">ชม.</span>
                </span>
              </div>
            </div>

            <div className="text-[11px] text-[var(--gp-text-muted)] flex items-center justify-between pt-1 border-t border-[var(--gp-divider)]">
              <span>จ.-ศ.: {weekdayHours} ชม.</span>
              <span>ส.-อา.: {weekendHours} ชม.</span>
            </div>
          </div>

          {/* Weekly Playtime Activity & Bar Chart */}
          <div className="rounded-xl bg-[var(--gp-primary)] border border-[var(--gp-divider)] p-3.5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gp-text-muted)] flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-[var(--gp-brand-light)]" />
                เวลาเล่นสัปดาห์นี้
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--gp-brand)]/15 text-[var(--gp-brand-light)] border border-[var(--gp-brand)]/30">
                {totalWeekHours} / {weeklyHours} ชม.
              </span>
            </div>

            {/* Quick Yesterday vs Today vs This Week Breakdown */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="p-2 rounded-lg bg-[var(--gp-rail)]/80 border border-[var(--gp-divider)]">
                <span className="text-[9.5px] text-[var(--gp-text-muted)] block truncate">เมื่อวาน</span>
                <span className="text-xs font-bold font-mono text-[var(--gp-text-strong)]">
                  {totalYesterdayHours} <span className="text-[9px] font-normal text-[var(--gp-text-muted)]">ชม.</span>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[var(--gp-brand)]/10 border border-[var(--gp-brand)]/40 shadow-xs">
                <span className="text-[9.5px] text-[var(--gp-brand-light)] font-bold block truncate">วันนี้</span>
                <span className="text-xs font-bold font-mono text-[var(--gp-brand-light)]">
                  {totalTodayHours} <span className="text-[9px] font-normal text-[var(--gp-brand-light)]/80">ชม.</span>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[var(--gp-rail)]/80 border border-[var(--gp-divider)]">
                <span className="text-[9.5px] text-[var(--gp-text-muted)] block truncate">สัปดาห์นี้</span>
                <span className="text-xs font-bold font-mono text-[var(--gp-text-strong)]">
                  {totalWeekHours} <span className="text-[9px] font-normal text-[var(--gp-text-muted)]">ชม.</span>
                </span>
              </div>
            </div>

            {/* Weekly Target Progress */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[var(--gp-text-muted)]">เป้าหมายประจำสัปดาห์</span>
                <span className="font-bold font-mono text-[var(--gp-text-strong)]">{weeklyPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--gp-rail)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--gp-brand)] to-[var(--gp-brand-light)] rounded-full transition-all duration-500"
                  style={{ width: `${weeklyPercent}%` }}
                />
              </div>
            </div>

            {/* 7-Day Bar Chart with Daily Target Line */}
            <div className="pt-1">
              <div className="bg-[var(--gp-rail)]/60 rounded-xl p-3 border border-[var(--gp-divider)] space-y-2 relative">
                {/* Target Benchmark Legend */}
                <div className="flex items-center justify-between text-[10px] text-[var(--gp-text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-[var(--gp-brand-light)] rounded-full inline-block" />
                    เป้าเฉลี่ย: <strong className="font-mono text-[var(--gp-brand-light)] font-semibold">{dailyHours} ชม./วัน</strong>
                  </span>
                  <span className="font-mono text-[9px] text-[var(--gp-text-faint)]">
                    สัปดาห์นี้ {weeklyHours} ชม.
                  </span>
                </div>

                {/* Bars Area with Target Line Overlay */}
                <div className="relative h-[72px] w-full pt-2">
                  {/* Horizontal Dashed Target Line */}
                  {dailyHours > 0 && targetLinePercent > 0 && (
                    <div
                      className="absolute left-0 right-0 border-b border-dashed border-[var(--gp-brand-light)]/30 z-10 pointer-events-none flex items-center justify-end"
                      style={{ bottom: `${targetLinePercent}%` }}
                    >
                      <span className="text-[8.5px] font-mono text-[var(--gp-brand-light)] bg-[var(--gp-floating)]/90 px-1 py-0.2 rounded border border-[var(--gp-brand)]/30 -translate-y-1/2 shadow-xs">
                        {dailyHours} ชม.
                      </span>
                    </div>
                  )}

                  {/* 7 Day Bars */}
                  <div className="flex items-end justify-between gap-1.5 h-full w-full">
                    {weekDaysData.map((d, idx) => {
                      const hasHours = d.hours > 0;
                      const barHeight = maxDailyVal > 0 && hasHours
                        ? Math.min(100, Math.max(10, (d.hours / maxDailyVal) * 100))
                        : 0;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                          {/* Tooltip on hover */}
                          <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[var(--gp-floating)] border border-[var(--gp-divider)] text-[10px] font-mono px-2 py-0.5 rounded shadow-lg z-30 whitespace-nowrap text-[var(--gp-text-strong)]">
                            {d.isToday ? 'วันนี้ ' : d.isYesterday ? 'เมื่อวาน ' : ''}{d.label}: {d.hours.toFixed(1)} ชม.
                          </div>

                          {/* Hours Label above bar so hovering is not required */}
                          {hasHours && (
                            <span className={`text-[8.5px] font-mono font-bold leading-none mb-1 select-none pointer-events-none ${
                              d.isToday ? 'text-[var(--gp-brand-light)] drop-shadow-sm' : 'text-[var(--gp-text-strong)]'
                            }`}>
                              {d.hours}
                            </span>
                          )}

                          {/* Bar Column Track with Today Highlight */}
                          <div
                            className={`w-full max-w-[20px] rounded-t-md overflow-hidden flex items-end h-full relative transition-all ${
                              d.isToday
                                ? 'bg-[var(--gp-brand)]/15 border-x border-t border-[var(--gp-brand)]/40 shadow-[0_0_8px_rgba(88,101,242,0.25)]'
                                : 'bg-[var(--gp-elevated)]/30'
                            }`}
                          >
                            {hasHours ? (
                              <div
                                className={`w-full rounded-t-md transition-all duration-500 ${
                                  d.isToday
                                    ? 'bg-gradient-to-t from-[var(--gp-brand)] to-[#7983f5] shadow-[0_0_10px_rgba(88,101,242,0.7)]'
                                    : 'bg-[var(--gp-brand)]/80 hover:bg-[var(--gp-brand)]'
                                }`}
                                style={{ height: `${barHeight}%` }}
                              />
                            ) : (
                              <div className="w-full flex justify-center pb-0.5 self-end">
                                {d.isToday ? (
                                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--gp-brand-light)] animate-pulse" title="วันนี้ยังไม่มีบันทึกเวลา" />
                                ) : (
                                  <div className="w-full h-[2px] bg-[var(--gp-divider)]" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Day Labels below bars */}
                <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-[var(--gp-divider)]/40">
                  {weekDaysData.map((d, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      {d.isToday ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-[var(--gp-brand)] text-white font-bold text-[9px] shadow-xs flex flex-col items-center leading-none">
                          <span>{d.label}</span>
                          <span className="text-[7px] text-white/90 scale-90 -mt-0.5">วันนี้</span>
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-medium transition-colors ${
                            d.isYesterday
                              ? 'text-[var(--gp-text-strong)] font-semibold'
                              : 'text-[var(--gp-text-muted)]'
                          }`}
                        >
                          {d.label}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Games Played This Week (Scrollable container if overflowing) */}
            {playedThisWeekGames.length > 0 ? (
              <div className="pt-2 border-t border-[var(--gp-divider)] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[var(--gp-text-muted)]">
                  <span>เกมที่เล่นในสัปดาห์นี้ ({playedThisWeekGames.length})</span>
                  <span className="text-[10px] text-[var(--gp-text-faint)]">เลื่อนแถวนี้ได้</span>
                </div>

                {/* Independent Scroll Container for games list */}
                <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {playedThisWeekGames.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[var(--gp-rail)]/60 hover:bg-[var(--gp-rail)] border border-[var(--gp-divider)] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {g.game.coverUrl ? (
                          <img
                            src={g.game.coverUrl}
                            alt={g.game.title}
                            className="w-6 h-6 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-[var(--gp-secondary)] flex items-center justify-center shrink-0">
                            <Gamepad2 className="w-3.5 h-3.5 text-[var(--gp-text-muted)]" />
                          </div>
                        )}
                        <span className="text-xs font-medium text-[var(--gp-text-strong)] truncate">
                          {g.game.title}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-[var(--gp-brand-light)] shrink-0">
                        {g.weekHours.toFixed(1)} ชม.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-[var(--gp-divider)] text-center p-2 rounded-lg bg-[var(--gp-rail)]/40 space-y-1">
                <p className="text-[11px] font-medium text-[var(--gp-text-muted)]">
                  ยังไม่มีบันทึกเวลาเล่นใหม่ในสัปดาห์นี้
                </p>
                <p className="text-[10px] text-[var(--gp-text-faint)]">
                  เมื่อคุณเล่นเกมแล้วกด Sync หรือกดเพิ่มเวลา ตัวเลขจะเริ่มนับเป็นสถิติสัปดาห์นี้
                </p>
              </div>
            )}
          </div>

          {/* Backlog Burn & Burnout Status */}
          <div className="rounded-xl bg-[var(--gp-primary)] border border-[var(--gp-divider)] p-3.5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gp-text-muted)] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                ภาระ Backlog สะสม
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold font-mono text-amber-400">
                  {(totalRemainingHours || 0).toFixed(1)} <span className="text-xs font-normal text-[var(--gp-text-muted)]">ชม.</span>
                </span>
                <span className="text-xs font-medium font-mono text-[var(--gp-text-muted)]">
                  ~{totalRemainingDays || 0} วันจบ
                </span>
              </div>
              <p className="text-[11px] text-[var(--gp-text-muted)] mt-1">
                เวลาที่ต้องใช้เพื่อเคลียร์เกมเนื้อเรื่องทั้งหมดตาม Pacing ปัจจุบัน
              </p>
            </div>

            {/* Burnout Risk Badge */}
            <div className={`p-2 rounded-lg border text-xs flex items-center gap-2 font-medium ${riskColor}`}>
              {riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 shrink-0" />
              )}
              <span className="leading-snug">{riskLabel}</span>
            </div>
          </div>

          {/* Library Quick Stats */}
          <div className="rounded-xl bg-[var(--gp-primary)] border border-[var(--gp-divider)] p-3.5 space-y-2.5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gp-text-muted)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--gp-brand-light)]" />
              ภาพรวมคลังเกม
            </span>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--gp-text-muted)]">เกมทั้งหมดในคลัง</span>
                <span className="font-bold font-mono text-[var(--gp-text-strong)]">{totalGames} เกม</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--gp-text-muted)]">กำลังเล่น (Story)</span>
                <span className="font-bold font-mono text-indigo-400">{playingStoryGames.length} เกม</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--gp-text-muted)]">เกมเล่นเรื่อยๆ (Endless)</span>
                <span className="font-bold font-mono text-emerald-400">{endlessGames.length} เกม</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--gp-text-muted)]">เคลียร์จบแล้ว</span>
                <span className="font-bold font-mono text-emerald-400">{completedAllGames.length} เกม</span>
              </div>

              {/* Completion Progress Bar */}
              <div className="pt-1.5">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[var(--gp-text-muted)]">อัตราการเคลียร์เกม Story</span>
                  <span className="font-bold font-mono text-[var(--gp-text-strong)]">{completionRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--gp-rail)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, completionRate)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Steam Profile & Export Actions */}
          <div className="rounded-xl bg-[var(--gp-primary)] border border-[var(--gp-divider)] p-3.5 space-y-2.5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gp-text-muted)] flex items-center gap-1.5">
              <SteamIcon className="w-3.5 h-3.5 text-[#66c0f4]" />
              Steam Profile
            </span>

            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[var(--gp-rail)] border border-[var(--gp-divider)]">
              <div className="min-w-0">
                <span className="text-[10px] text-[var(--gp-text-muted)] block truncate">{userName || 'บัญชีเชื่อมต่อ'}</span>
                <span className="text-xs font-mono font-semibold text-[var(--gp-text-strong)] truncate block">
                  {userSteamId || 'ไม่ได้เชื่อมต่อ'}
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenSteamConnect}
                className="text-[10px] px-2 py-1 rounded bg-[var(--gp-secondary)] hover:bg-[var(--gp-elevated)] text-[var(--gp-text)] border border-[var(--gp-divider)] font-semibold shrink-0"
              >
                เปลี่ยน
              </button>
            </div>

            {/* Export CSV Backup Action */}
            <div className="pt-1">
              <button
                type="button"
                onClick={onExportCSV}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-[var(--gp-secondary)] hover:bg-[var(--gp-elevated)] border border-[var(--gp-divider)] text-[var(--gp-text-strong)] transition-all cursor-pointer shadow-xs active:scale-98"
                title="ส่งออกประวัติเกมและชั่วโมงเล่นเป็นไฟล์ CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>ส่งออกข้อมูลคลังเกม (CSV)</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
  );
}
