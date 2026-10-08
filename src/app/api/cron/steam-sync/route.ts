import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchSteamOwnedGames } from '@/lib/steam';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Authorization check for Vercel Cron or external webhook
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'STEAM_API_KEY is not configured in environment' }, { status: 500 });
    }

    // 2. Find all active users with a Steam ID
    const users = await prisma.user.findMany({
      where: { steamId: { not: null } },
      include: {
        userGames: {
          include: { game: true },
        },
      },
    });

    const summary = {
      totalUsers: users.length,
      syncedUsers: 0,
      updatedGames: 0,
      timestamp: new Date().toISOString(),
    };

    // 3. Process sync for each user
    for (const user of users) {
      if (!user.steamId) continue;

      const liveOwned = await fetchSteamOwnedGames(user.steamId);
      if (!liveOwned.isLive || !Array.isArray(liveOwned.games) || liveOwned.games.length === 0) {
        continue;
      }

      for (const ug of user.userGames) {
        if (!ug.game.steamAppId) continue;
        const liveGame = liveOwned.games.find((g: any) => g.appId === ug.game.steamAppId);
        if (!liveGame) continue;

        // If playtime increased, update and create daily snapshot in sync history
        if (liveGame.playedMinutes > ug.currentPlayedMinutes) {
          const diff = liveGame.playedMinutes - ug.currentPlayedMinutes;

          await prisma.userGame.update({
            where: { id: ug.id },
            data: { currentPlayedMinutes: liveGame.playedMinutes },
          });

          // Use the exact time game was last closed if available, otherwise current time
          let actualPlayedAt = new Date();
          if (liveGame.rtimeLastPlayed && liveGame.rtimeLastPlayed > 0) {
            const steamDate = new Date(liveGame.rtimeLastPlayed * 1000);
            if (!isNaN(steamDate.getTime())) {
              actualPlayedAt = steamDate;
            }
          }

          await prisma.syncHistory.create({
            data: {
              userGameId: ug.id,
              previousMinutes: ug.currentPlayedMinutes,
              newMinutes: liveGame.playedMinutes,
              syncedAt: actualPlayedAt,
            },
          });

          summary.updatedGames++;
        }
      }

      summary.syncedUsers++;
    }

    return NextResponse.json({
      success: true,
      message: `Cron Steam sync completed: ${summary.updatedGames} games updated across ${summary.syncedUsers} users`,
      summary,
    });
  } catch (error: any) {
    console.error('Error during scheduled Steam sync cron:', error);
    return NextResponse.json({ error: error.message || 'Cron sync failed' }, { status: 500 });
  }
}
