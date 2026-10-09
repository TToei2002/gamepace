'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Sparkles, Sun, Moon } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChangelogShellProps {
  manualContent: string;
  changelogContent: string;
}

export function ChangelogShell({ manualContent, changelogContent }: ChangelogShellProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'changelog'>('manual');
  const [theme, setTheme] = useState<'dark-purple' | 'light-blue'>('dark-purple');

  useEffect(() => {
    // Read theme
    const savedTheme = localStorage.getItem('gamepace_theme') as 'dark-purple' | 'light-blue';
    const active = savedTheme === 'light-blue' || savedTheme === 'dark-purple' ? savedTheme : 'dark-purple';
    setTheme(active);
    document.documentElement.setAttribute('data-theme', active);
    if (active === 'dark-purple') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Read query tab if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'changelog') {
        setActiveTab('changelog');
      } else if (tabParam === 'manual') {
        setActiveTab('manual');
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark-purple' ? 'light-blue' : 'dark-purple';
    setTheme(next);
    localStorage.setItem('gamepace_theme', next);
    document.documentElement.setAttribute('data-theme', next);
    if (next === 'dark-purple') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleTabChange = (tab: 'manual' | 'changelog') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div
      className="min-h-screen w-full transition-colors font-sans antialiased"
      style={{
        backgroundColor: 'var(--gp-primary)',
        color: 'var(--gp-text)',
      }}
    >
      {/* Top Navigation Bar */}
      <header
        className="sticky top-0 z-30 h-16 px-4 sm:px-8 border-b backdrop-blur-md transition-colors flex items-center justify-between"
        style={{
          backgroundColor: 'var(--gp-floating)',
          borderColor: 'var(--gp-divider)',
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--gp-secondary)] hover:bg-[var(--gp-hover)] text-[var(--gp-text-strong)] border border-[var(--gp-divider)] transition-all active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>กลับสู่ Dashboard</span>
          </Link>
          <div className="h-4 w-[1px] bg-[var(--gp-divider)] hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--gp-text-muted)]">
            <span className="font-semibold text-[var(--gp-brand-light)]">GamePace</span>
            <span>/</span>
            <span>{activeTab === 'manual' ? 'คู่มือการใช้งาน' : 'มีอะไรใหม่'}</span>
          </div>
        </div>

        {/* Right Action: Theme Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--gp-divider)] bg-[var(--gp-secondary)] hover:bg-[var(--gp-hover)] text-[var(--gp-text-strong)] text-xs font-semibold transition-all active:scale-95"
            title="สลับธีม สว่าง / มืด"
          >
            {theme === 'light-blue' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Navigation Tabs (Manual vs Changelog) */}
        <div className="flex items-center gap-2 mb-6 p-1.5 rounded-2xl bg-[var(--gp-floating)] border border-[var(--gp-divider)] w-fit shadow-md">
          <button
            type="button"
            onClick={() => handleTabChange('manual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === 'manual'
                ? 'bg-[var(--gp-brand)] text-white shadow-lg shadow-[rgba(88,101,242,0.3)]'
                : 'text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] hover:bg-[var(--gp-hover)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>คู่มือการใช้งาน (Manual)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('changelog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === 'changelog'
                ? 'bg-[var(--gp-brand)] text-white shadow-lg shadow-[rgba(88,101,242,0.3)]'
                : 'text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] hover:bg-[var(--gp-hover)]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>มีอะไรใหม่ (Changelog)</span>
          </button>
        </div>

        {/* Markdown Content Card */}
        <div className="rounded-2xl border border-[var(--gp-divider)] bg-[var(--gp-secondary-alt)] p-6 sm:p-8 shadow-xl">
          <MarkdownRenderer
            content={activeTab === 'manual' ? manualContent : changelogContent}
          />
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-[var(--gp-divider)] mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--gp-text-muted)]">
          <p>© 2026 GamePace. v1.2.0</p>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-[var(--gp-brand-light)] hover:underline font-semibold flex items-center gap-1"
            >
              <span>กลับสู่หน้า Dashboard</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
