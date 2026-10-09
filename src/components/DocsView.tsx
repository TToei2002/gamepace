'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface DocsViewProps {
  initialTab?: 'manual' | 'changelog';
}

export function DocsView({ initialTab = 'manual' }: DocsViewProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'changelog'>(initialTab);
  const [manualContent, setManualContent] = useState<string>('');
  const [changelogContent, setChangelogContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDocs() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/docs');
        if (!res.ok) throw new Error('Failed to fetch documentation');
        const data = await res.json();
        if (isMounted) {
          setManualContent(data.manualContent || '');
          setChangelogContent(data.changelogContent || '');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'ไม่สามารถโหลดเนื้อหาคู่มือได้');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDocs();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto pb-10 animate-fade-in">
      {/* Top Segmented Tabs Bar (Full Width) */}
      <div className="grid grid-cols-2 gap-2 p-1.5 sm:p-2 rounded-2xl bg-[var(--gp-floating)] border border-[var(--gp-divider)] shadow-md w-full">
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${
            activeTab === 'manual'
              ? 'bg-[var(--gp-brand)] text-white shadow-md shadow-[var(--gp-brand)]/30'
              : 'text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] hover:bg-[var(--gp-hover)]'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeTab === 'manual' ? 'text-white' : 'text-sky-400'}`} />
          <span>คู่มือการใช้งาน (Manual)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('changelog')}
          className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${
            activeTab === 'changelog'
              ? 'bg-[var(--gp-brand)] text-white shadow-md shadow-[var(--gp-brand)]/30'
              : 'text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] hover:bg-[var(--gp-hover)]'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === 'changelog' ? 'text-white' : 'text-amber-400'}`} />
          <span>มีอะไรใหม่ (Changelog)</span>
        </button>
      </div>

      {/* Main Content Box */}
      <div className="rounded-2xl border border-[var(--gp-divider)] bg-[var(--gp-secondary-alt)] p-6 sm:p-8 shadow-xl min-h-[500px]">
        {loading ? (
          <div className="space-y-4 py-8 animate-pulse">
            <div className="h-8 bg-[var(--gp-secondary)] rounded-lg w-1/3" />
            <div className="h-4 bg-[var(--gp-secondary)] rounded-md w-2/3" />
            <div className="h-4 bg-[var(--gp-secondary)] rounded-md w-1/2" />
            <div className="h-32 bg-[var(--gp-secondary)] rounded-xl w-full mt-6" />
            <div className="h-24 bg-[var(--gp-secondary)] rounded-xl w-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-red-400 font-semibold mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--gp-secondary)] hover:bg-[var(--gp-hover)] text-[var(--gp-text)] border border-[var(--gp-divider)]"
            >
              โหลดใหม่อีกครั้ง
            </button>
          </div>
        ) : (
          <MarkdownRenderer
            content={activeTab === 'manual' ? manualContent : changelogContent}
          />
        )}
      </div>
    </div>
  );
}
