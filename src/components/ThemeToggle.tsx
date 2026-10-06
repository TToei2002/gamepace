'use client';

import React from 'react';
import { ThemeMode } from '@/lib/theme';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export function ThemeToggle({ currentTheme, onThemeChange }: ThemeToggleProps) {
  const toggleTheme = () => {
    const nextTheme: ThemeMode = currentTheme === 'light-blue' ? 'dark-purple' : 'light-blue';
    onThemeChange(nextTheme);
  };

  const isLight = currentTheme === 'light-blue';

  return (
    <button
      onClick={toggleTheme}
      title="Toggle theme (Light / Dark)"
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm group"
      style={{
        backgroundColor: 'var(--theme-card)',
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-text)',
      }}
    >
      <div className="relative w-4 h-4 transition-transform duration-500 group-hover:rotate-45">
        {isLight ? (
          <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
        ) : (
          <Moon className="w-4 h-4 text-purple-400" />
        )}
      </div>
      <span className="hidden sm:inline font-medium">{isLight ? 'Light' : 'Dark'}</span>
    </button>
  );
}
