import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCSV } from '@/lib/exportCsv';
import { calculatePacing } from '@/lib/pacing';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userGames = await prisma.userGame.findMany({
      where: { userId: user.id },
      include: { game: true },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    const gamesWithEcd = userGames.map((ug) => {
      const playedHrs = ug.currentPlayedMinutes / 60;
      const pacing = calculatePacing(
        ug.targetHours,
        playedHrs,
        user?.weekdayCapHours || 2.0,
        user?.weekendCapHours || 5.5
      );
      return {
        title: ug.game.title,
        steamAppId: ug.game.steamAppId,
        status: ug.status,
        targetGoal: ug.targetGoal,
        targetHours: ug.targetHours,
        currentPlayedMinutes: ug.currentPlayedMinutes,
        ecdDate: ug.status === 'COMPLETED' ? 'Completed' : pacing.estimatedCompletionDate,
      };
    });

    const csvData = generateCSV(gamesWithEcd);

    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename="GamePace_Backlog_${new Date().toISOString().split('T')[0]}.csv"`);

    return new NextResponse(csvData, { status: 200, headers });
  } catch (error: any) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 });
  }
}
