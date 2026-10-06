import { NextResponse } from 'next/server';
import { lookupHLTB } from '@/lib/hltb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Cyberpunk 2077';

    const result = await lookupHLTB(title);
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Error during HLTB lookup:', error);
    return NextResponse.json({ error: error.message || 'Lookup failed' }, { status: 500 });
  }
}
