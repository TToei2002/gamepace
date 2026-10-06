import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white text-center">
      <h2 className="text-2xl font-bold mb-2">404 - Page Not Found</h2>
      <p className="text-sm text-slate-400 mb-4">ไม่พบหน้าที่คุณกำลังค้นหา</p>
      <Link
        href="/"
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white transition"
      >
        กลับสู่หน้าหลัก GamePace
      </Link>
    </div>
  );
}
