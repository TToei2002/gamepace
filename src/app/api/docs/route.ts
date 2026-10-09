import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const manualPath = path.join(process.cwd(), 'content', 'manual.md');
    const changelogPath = path.join(process.cwd(), 'content', 'changelog.md');

    let manualContent = '';
    let changelogContent = '';

    if (fs.existsSync(manualPath)) {
      manualContent = fs.readFileSync(manualPath, 'utf-8');
    } else {
      manualContent = '# คู่มือการใช้งาน\n\nยังไม่พบเนื้อหาคู่มือในระบบ';
    }

    if (fs.existsSync(changelogPath)) {
      changelogContent = fs.readFileSync(changelogPath, 'utf-8');
    } else {
      changelogContent = '# บันทึกการอัปเดต\n\nยังไม่พบเนื้อหาอัปเดตในระบบ';
    }

    return NextResponse.json({
      success: true,
      manualContent,
      changelogContent,
    });
  } catch (error: any) {
    console.error('Error reading documentation files:', error);
    return NextResponse.json({ error: error.message || 'Failed to load docs' }, { status: 500 });
  }
}
