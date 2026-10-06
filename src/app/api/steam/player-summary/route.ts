import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchPlayerSummary } from '@/lib/steam';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let steamId = searchParams.get('steamId');

    if (!steamId) {
      return NextResponse.json(
        { success: false, message: 'No Steam ID provided' },
        { status: 400 }
      );
    }

    if (!steamId) {
      return NextResponse.json(
        {
          success: false,
          message: 'No Steam ID found or provided',
        },
        { status: 400 }
      );
    }

    const summary = await fetchPlayerSummary(steamId);

    if (!summary) {
      return NextResponse.json(
        {
          success: false,
          message: 'Could not fetch Steam player summary (check API key or profile privacy settings)',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('Error in /api/steam/player-summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
