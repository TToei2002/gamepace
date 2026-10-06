import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchSteamOwnedGames } from '@/lib/steam';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId } = body;

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
    });

    const apiKey = process.env.STEAM_API_KEY;
    const syncLogs: string[] = [];
    let liveOwned: any = null;

    if (apiKey && user.steamId) {
      liveOwned = await fetchSteamOwnedGames(user.steamId);
      if (liveOwned.isLive && liveOwned.games.length > 0) {
        for (const ug of userGames) {
          if (!ug.game.steamAppId) continue;
          const liveGame = liveOwned.games.find((g: any) => g.appId === ug.game.steamAppId);

          if (liveGame && liveGame.playedMinutes > ug.currentPlayedMinutes) {
            const diff = liveGame.playedMinutes - ug.currentPlayedMinutes;
            await prisma.userGame.update({
              where: { id: ug.id },
              data: { currentPlayedMinutes: liveGame.playedMinutes },
            });
            // Use exact time game was last played on Steam if available, otherwise fallback to current time
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
            syncLogs.push(`อัปเดต ${ug.game.title}: +${(diff / 60).toFixed(1)} ชม.`);
          }
        }

        if (syncLogs.length === 0) {
          syncLogs.push('ซิงค์เรียบร้อย ข้อมูลชั่วโมงเล่นเป็นปัจจุบันแล้ว');
        }
      } else {
        syncLogs.push(liveOwned.message || 'ไม่พบข้อมูลเกมในคลัง Steam บัญชีนี้');
      }
    } else {
      syncLogs.push('กรุณาเชื่อมต่อ Steam ID ที่ถูกต้องก่อนทำการซิงค์ข้อมูล');
    }

    const updatedUserGames = await prisma.userGame.findMany({
      where: { userId: user.id },
      include: { game: true, syncHistories: true },
      orderBy: [{ status: 'asc' }, { order: 'asc' }],
    });

    const steamDebugInfo = userGames.map((ug) => {
      const liveGame = (liveOwned as any)?.games?.find((g: any) => g.appId === ug.game.steamAppId);
      return {
        gameTitle: ug.game.title,
        steamAppId: ug.game.steamAppId,
        databaseMinutes: ug.currentPlayedMinutes,
        steamPlaytimeMinutes: liveGame?.playedMinutes ?? null,
        rtime_last_played: liveGame?.rtimeLastPlayed ?? null,
        lastPlayedThaiDate: liveGame?.rtimeLastPlayed ? new Date(liveGame.rtimeLastPlayed * 1000).toLocaleString('th-TH') : 'ไม่มีประวัติเวลาเล่น',
      };
    });

    return NextResponse.json({
      success: true,
      syncLogs,
      syncedAt: new Date().toISOString(),
      userGames: updatedUserGames,
      steamDebugInfo,
    });
  } catch (error: any) {
    console.error('Error during Steam sync:', error);
    return NextResponse.json({ error: error.message || 'Sync failed' }, { status: 500 });
  }
}
