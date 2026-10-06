import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    await prisma.$transaction(
      items.map((item: { id: string; status: string; order: number; targetGoal?: string; targetHours?: number }) =>
        prisma.userGame.update({
          where: { id: item.id },
          data: {
            status: item.status,
            order: item.order,
            ...(item.targetGoal !== undefined && { targetGoal: item.targetGoal }),
            ...(item.targetHours !== undefined && { targetHours: item.targetHours }),
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error reordering user games:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
