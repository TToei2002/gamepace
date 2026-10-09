import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchSteamOwnedGames } from '@/lib/steam';

export const dynamic = 'force-dynamic';

// Thailand Timezone Offset: UTC+7
const THAI_OFFSET_MS = 7 * 60 * 60 * 1000;

function getTargetEodThaiDate(runDate: Date = new Date()): Date {
  const thaiNow = new Date(runDate.getTime() + THAI_OFFSET_MS);
  const thaiHours = thaiNow.getUTCHours();

  // If running in early morning (00:00 - 04:59 Thai time), this cron is finalizing yesterday
  const targetDate = new Date(thaiNow);
  if (thaiHours < 5) {
    targetDate.setUTCDate(targetDate.getUTCDate() - 1);
  }

  const targetYear = targetDate.getUTCFullYear();
  const targetMonth = targetDate.getUTCMonth();
  const targetDay = targetDate.getUTCDate();

  // 23:59:59.999 in Thailand (UTC+7) corresponds to 16:59:59.999 in UTC
  return new Date(Date.UTC(targetYear, targetMonth, targetDay, 16, 59, 59, 999));
}

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

    // Target EOD timestamp for accurate daily snapshot lock
    const targetEod = getTargetEodThaiDate();

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
      targetEod: targetEod.toISOString(),
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

          // Smart Midnight Timestamp:
          // Use exact closed time if before target EOD; clamp to target EOD (23:59:59) if later or currently in-game
          let actualPlayedAt = targetEod;
          if (liveGame.rtimeLastPlayed && liveGame.rtimeLastPlayed > 0) {
            const steamDate = new Date(liveGame.rtimeLastPlayed * 1000);
            if (!isNaN(steamDate.getTime())) {
              actualPlayedAt = steamDate <= targetEod ? steamDate : targetEod;
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
