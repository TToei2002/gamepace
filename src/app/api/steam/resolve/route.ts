import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveSteamId } from '@/lib/steam';

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json({ error: 'Input Steam ID or URL is required' }, { status: 400 });
    }

    const resolved = await resolveSteamId(input);

    // Upsert or find dedicated user for this specific steamId
    let user = await prisma.user.findUnique({
      where: { steamId: resolved.steamId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          steamId: resolved.steamId,
          name: resolved.name,
          avatar: resolved.avatar,
          weekdayCapHours: 2.0,
          weekendCapHours: 5.5,
        },
      });
    } else if (resolved.name && user.name !== resolved.name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: resolved.name,
          avatar: resolved.avatar || user.avatar,
        },
      });
    }

    return NextResponse.json({ user, resolved });
  } catch (error: any) {
    console.error('Error resolving Steam ID:', error);
    return NextResponse.json({ error: error.message || 'ไม่พบข้อมูลบัญชี Steam ที่ระบุ' }, { status: 400 });
  }
}
