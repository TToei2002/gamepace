import { NextResponse } from 'next/server';
import { fetchSteamOwnedGames } from '@/lib/steam';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let steamId = searchParams.get('steamId') || undefined;

    if (!steamId) {
      return NextResponse.json({ error: 'steamId is required' }, { status: 400 });
    }

    const result = await fetchSteamOwnedGames(steamId);
    return NextResponse.json({
      games: result.games,
      isLive: result.isLive,
      message: result.message,
      steamId,
    });
  } catch (error: any) {
    console.error('Error fetching owned games:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch library' }, { status: 500 });
  }
}
