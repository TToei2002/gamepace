import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId, weekdayCapHours, weekendCapHours } = await req.json();

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        weekdayCapHours: Number(weekdayCapHours),
        weekendCapHours: Number(weekendCapHours),
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error: any) {
    console.error('Error updating pacing config:', error);
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}
