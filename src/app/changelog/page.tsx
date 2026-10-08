import fs from 'fs';
import path from 'path';
import { ChangelogShell } from '@/components/ChangelogShell';

export const metadata = {
  title: 'คู่มือการใช้งาน & มีอะไรใหม่ | GamePace',
  description: 'คู่มือการใช้งานและบันทึกการอัปเดตฟีเจอร์ใหม่ทั้งหมดใน GamePace',
};

export default function DocsAndChangelogPage() {
  const manualPath = path.join(process.cwd(), 'content', 'manual.md');
  const changelogPath = path.join(process.cwd(), 'content', 'changelog.md');

  let manualContent = '';
  let changelogContent = '';

  try {
    manualContent = fs.readFileSync(manualPath, 'utf-8');
  } catch (err) {
    console.error('Failed to read manual.md:', err);
    manualContent = '# คู่มือการใช้งาน\n\nยังไม่พบเนื้อหาคู่มือในระบบ';
  }

  try {
    changelogContent = fs.readFileSync(changelogPath, 'utf-8');
  } catch (err) {
    console.error('Failed to read changelog.md:', err);
    changelogContent = '# บันทึกการอัปเดต\n\nยังไม่พบเนื้อหาอัปเดตในระบบ';
  }

  return (
    <ChangelogShell
      manualContent={manualContent}
      changelogContent={changelogContent}
    />
  );
}
