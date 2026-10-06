export interface PacingResult {
  weeklyHours: number;
  dailyHours: number;
  remainingHours: number;
  daysRemaining: number;
  estimatedCompletionDate: string;
  completionPercentage: number;
  isOvertime: boolean;
  overtimeHours: number;
  isEndless?: boolean;
  suggestEndless?: boolean;
}

/**
 * Calculates pacing metrics according to GamePace specification:
 * - H_daily = ((H_weekday * 5) + (H_weekend * 2)) / 7
 * - D = ceil( max(0, H_target - H_played) / H_daily )
 * - ECD = CurrentDate + D days
 */
export function calculatePacing(
  targetHours: number,
  playedHours: number,
  weekdayHours: number = 2.0,
  weekendHours: number = 5.5,
  targetGoal?: string
): PacingResult {
  const weeklyHours = weekdayHours * 5 + weekendHours * 2;
  const dailyHours = weeklyHours > 0 ? weeklyHours / 7 : 1;

  const isEndless = targetGoal === 'ENDLESS';

  if (isEndless) {
    const ecdDate = new Date();
    return {
      weeklyHours: Number(weeklyHours.toFixed(1)),
      dailyHours: Number(dailyHours.toFixed(1)),
      remainingHours: 0,
      daysRemaining: 0,
      estimatedCompletionDate: ecdDate.toISOString().split('T')[0],
      completionPercentage: 100,
      isOvertime: false,
      overtimeHours: 0,
      isEndless: true,
      suggestEndless: false,
    };
  }

  const isOvertime = playedHours > targetHours;
  const overtimeHours = isOvertime ? Number((playedHours - targetHours).toFixed(1)) : 0;
  
  // Remaining hours: if overtime and not completed, default to 0 unless extended
  const remainingHours = Math.max(0, Number((targetHours - playedHours).toFixed(1)));
  const daysRemaining = Math.ceil(remainingHours / dailyHours);

  const ecdDate = new Date();
  ecdDate.setDate(ecdDate.getDate() + daysRemaining);

  const completionPercentage =
    targetHours > 0
      ? Math.round((playedHours / targetHours) * 100)
      : 0;

  // Suggest Endless if overtime is significant (played > 1.2x target or overtime >= 5 hours)
  const suggestEndless = isOvertime && (playedHours >= targetHours * 1.2 || overtimeHours >= 5);

  return {
    weeklyHours: Number(weeklyHours.toFixed(1)),
    dailyHours: Number(dailyHours.toFixed(1)),
    remainingHours,
    daysRemaining,
    estimatedCompletionDate: ecdDate.toISOString().split('T')[0],
    completionPercentage,
    isOvertime,
    overtimeHours,
    isEndless: false,
    suggestEndless,
  };
}

export interface BurnoutStatus {
  isBurnoutRisk: boolean;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  playingCount: number;
  totalRemainingHours: number;
  message: string;
}

export function evaluateBurnoutRisk(
  userGames: Array<{
    status: string;
    targetHours: number;
    currentPlayedMinutes: number;
    targetGoal?: string;
  }>
): BurnoutStatus {
  const playingGames = userGames.filter((g) => g.status === 'PLAYING');
  const totalRemainingHours = playingGames.reduce((acc, g) => {
    if (g.targetGoal === 'ENDLESS') return acc;
    return acc + Math.max(0, g.targetHours - g.currentPlayedMinutes / 60);
  }, 0);

  const playingCount = playingGames.length;
  const endlessCount = playingGames.filter((g) => g.targetGoal === 'ENDLESS').length;

  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (playingCount > 4 || totalRemainingHours > 120) {
    level = 'CRITICAL';
  } else if (playingCount > 2 || totalRemainingHours > 80) {
    level = 'HIGH';
  } else if (playingCount === 2 || totalRemainingHours > 40) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  const isBurnoutRisk = level === 'HIGH' || level === 'CRITICAL';

  if (isBurnoutRisk) {
    return {
      isBurnoutRisk: true,
      level,
      playingCount,
      totalRemainingHours: Number(totalRemainingHours.toFixed(1)),
      message: `เตือนภาวะ Burnout! คุณมี ${playingCount} เกมกำลังเล่น${endlessCount > 0 ? ` (รวมเกมออนไลน์/ไร้จุดจบ ${endlessCount} เกม)` : ''} (เหลือรวม ${totalRemainingHours.toFixed(1)} ชม.)`,
    };
  }

  return {
    isBurnoutRisk: false,
    level,
    playingCount,
    totalRemainingHours: Number(totalRemainingHours.toFixed(1)),
    message: `จังหวะกำลังพอดี! เล่นอยู่ ${playingCount} เกม${endlessCount > 0 ? ` (มีเกมออนไลน์ ${endlessCount} เกม)` : ''} (เหลือรวม ${totalRemainingHours.toFixed(1)} ชม.)`,
  };
}
