export function generateCSV(
  games: Array<{
    title: string;
    steamAppId?: number | null;
    status: string;
    targetGoal: string;
    targetHours: number;
    currentPlayedMinutes: number;
    ecdDate?: string;
  }>
): string {
  const headers = [
    'Game Title',
    'Steam AppID',
    'Status',
    'Target Goal',
    'Target Hours (h)',
    'Played Hours (h)',
    'Remaining Hours (h)',
    'Progress (%)',
    'Estimated Completion Date',
  ];

  const rows = games.map((g) => {
    const playedHrs = Number((g.currentPlayedMinutes / 60).toFixed(1));
    const remainingHrs = Number(Math.max(0, g.targetHours - playedHrs).toFixed(1));
    const percent = g.targetHours > 0 ? Math.min(100, Math.round((playedHrs / g.targetHours) * 100)) : 0;

    return [
      `"${g.title.replace(/"/g, '""')}"`,
      g.steamAppId || 'N/A',
      g.status,
      g.targetGoal,
      g.targetHours,
      playedHrs,
      remainingHrs,
      `${percent}%`,
      g.ecdDate || 'N/A',
    ];
  });

  // UTF-8 BOM byte sequence prefix to ensure Excel / Google Sheets opens Thai / unicode correctly
  const bom = '\uFEFF';
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  return bom + csvContent;
}
