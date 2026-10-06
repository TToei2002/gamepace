import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { lookupHLTB } from '@/lib/hltb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const steamId = searchParams.get('steamId');

    let user = null;
    if (steamId) {
      user = await prisma.user.findUnique({ where: { steamId } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            steamId,
            name: `SteamGamer_${steamId.slice(-4)}`,
            weekdayCapHours: 2.0,
            weekendCapHours: 5.5,
          },
        });
      }
    } else {
      return NextResponse.json({ error: 'steamId is required' }, { status: 400 });
    }

    const userGames = await prisma.userGame.findMany({
      where: { userId: user.id },
      include: {
        game: true,
        syncHistories: true,
      },
      orderBy: [{ status: 'asc' }, { order: 'asc' }, { updatedAt: 'desc' }],
    });

    return NextResponse.json({
      user,
      userGames,
    });
  } catch (error: any) {
    console.error('Error fetching user games:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, appId, title, coverUrl, estimateHours, playedMinutes, targetGoal, status } = body;

    let targetUser = null;
    if (userId) {
      targetUser = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Dynamic HLTB Lookup
    const hltb = await lookupHLTB(title || `Steam Game ${appId}`);
    const resolvedTargetHours = estimateHours || hltb.mainExtra || hltb.mainStory || 40;

    // Upsert Game
    let game;
    if (appId) {
      game = await prisma.game.upsert({
        where: { steamAppId: Number(appId) },
        update: {
          title: title || hltb.title,
          coverUrl: coverUrl ? coverUrl : `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
          hltbMainStory: hltb.mainStory,
          hltbExtra: hltb.mainExtra,
          hltbCompletionist: hltb.completionist,
        },
        create: {
          steamAppId: Number(appId),
          title: title || hltb.title,
          coverUrl: coverUrl || `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
          hltbMainStory: hltb.mainStory,
          hltbExtra: hltb.mainExtra,
          hltbCompletionist: hltb.completionist,
        },
      });
    } else {
      game = await prisma.game.create({
        data: {
          title: title || hltb.title,
          coverUrl: coverUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80',
          hltbMainStory: hltb.mainStory,
          hltbExtra: hltb.mainExtra,
          hltbCompletionist: hltb.completionist,
        },
      });
    }

    // Check if already in user backlog
    const existing = await prisma.userGame.findFirst({
      where: { userId: targetUser.id, gameId: game.id },
    });

    if (existing) {
      return NextResponse.json({ message: 'Game already in backlog', userGame: existing });
    }

    const lastGame = await prisma.userGame.findFirst({
      where: { userId: targetUser.id, status: status || 'BACKLOG' },
      orderBy: { order: 'desc' },
    });
    const nextOrder = lastGame ? lastGame.order + 1 : 0;

    const userGame = await prisma.userGame.create({
      data: {
        userId: targetUser.id,
        gameId: game.id,
        status: status || 'BACKLOG',
        targetGoal: targetGoal || 'Main + Extra',
        targetHours: resolvedTargetHours,
        currentPlayedMinutes: playedMinutes || 0,
        order: nextOrder,
      },
      include: { game: true, syncHistories: true },
    });

    return NextResponse.json({ userGame }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding game:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, playedMinutesDelta, targetHours, targetGoal, order } = body;

    if (!id) {
      return NextResponse.json({ error: 'UserGame ID is required' }, { status: 400 });
    }

    const existing = await prisma.userGame.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'UserGame record not found' }, { status: 404 });
    }

    let newPlayedMinutes = existing.currentPlayedMinutes;
    if (playedMinutesDelta) {
      newPlayedMinutes += Number(playedMinutesDelta);

      // Log sync history delta if played minutes changed
      await prisma.syncHistory.create({
        data: {
          userGameId: id,
          previousMinutes: existing.currentPlayedMinutes,
          newMinutes: newPlayedMinutes,
        },
      });
    }

    let newStatus = status || existing.status;

    const updated = await prisma.userGame.update({
      where: { id },
      data: {
        status: newStatus,
        order: order !== undefined ? Number(order) : existing.order,
        currentPlayedMinutes: newPlayedMinutes,
        targetHours: targetHours !== undefined ? Number(targetHours) : existing.targetHours,
        targetGoal: targetGoal || existing.targetGoal,
      },
      include: { game: true, syncHistories: true },
    });

    return NextResponse.json({ userGame: updated });
  } catch (error: any) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'UserGame ID required' }, { status: 400 });
    }

    await prisma.userGame.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
