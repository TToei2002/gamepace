'use client';

import React from 'react';
import { 
  Gamepad2, 
  RefreshCw, 
  Plus, 
  Compass, 
  BarChart3, 
  PanelRight, 
  Search,
  Hash,
  Sparkles
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ThemeMode } from '@/lib/theme';
import { SteamIcon } from './SteamIcon';

interface HeaderProps {
  user: {
    id: string;
    name: string;
    steamId?: string | null;
    avatar?: string | null;
  } | null;
  currentlyPlaying?: {
    isPlaying: boolean;
    gameTitle: string | null;
    appId: number | null;
  } | null;
  isSyncing: boolean;
  activeTab: 'kanban' | 'analytics' | 'manual';
  currentTheme: ThemeMode;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onThemeChange: (theme: ThemeMode) => void;
  onTabChange: (tab: 'kanban' | 'analytics' | 'manual') => void;
  onTriggerSteamSync: () => void;
  onOpenSteamSearch: () => void;
  onOpenSteamConnect: () => void;
}

export function Header({
  user,
  currentlyPlaying,
  isSyncing,
  activeTab,
  currentTheme,
  isSidebarOpen = true,
  onToggleSidebar,
  onThemeChange,
  onTabChange,
  onTriggerSteamSync,
  onOpenSteamSearch,
  onOpenSteamConnect,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-20 h-14 px-4 sm:px-6 border-b select-none transition-colors flex items-center justify-between shrink-0"
      style={{
        backgroundColor: 'var(--gp-floating)',
        borderColor: 'var(--gp-divider)',
      }}
    >
      {/* Left: Channel Header style */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-[var(--gp-text-muted)]">
          <Hash className="w-5 h-5 text-[var(--gp-text-muted)]" />
          <h1 className="text-sm font-bold tracking-tight text-[var(--gp-text-strong)] truncate">
            {activeTab === 'kanban' 
              ? 'กระดาน-kanban' 
              : activeTab === 'analytics' 
              ? 'dashboard-สถิติ' 
              : 'คู่มือ-การใช้งาน'}
          </h1>
        </div>

        <div className="hidden sm:block w-[1px] h-4 bg-[var(--gp-divider)]" />

        <p className="hidden md:block text-xs text-[var(--gp-text-muted)] truncate">
          {activeTab === 'kanban' 
            ? 'จัดการคลังเกมและสถานะการเล่นแบบ Kanban' 
            : activeTab === 'analytics'
            ? 'วิเคราะห์อัตราการเล่นและงบ Pacing'
            : 'คู่มือแนะนำการใช้งาน GamePace และบันทึกการอัปเดต'}
        </p>
      </div>

      {/* Middle/Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Add Game Button */}
        <button
          id="tour-add-game"
          type="button"
          onClick={onOpenSteamSearch}
          aria-label="เพิ่มเกมใหม่จาก Steam"
          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--gp-brand)] hover:bg-[var(--gp-brand-hover)] text-white flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">เพิ่มเกม</span>
        </button>

        {/* Sync Button */}
        <button
          type="button"
          onClick={() => onTriggerSteamSync()}
          disabled={isSyncing}
          aria-label="ซิงค์ข้อมูลชั่วโมงเล่นล่าสุดจาก Steam"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md text-xs font-semibold bg-[var(--gp-secondary)] hover:bg-[var(--gp-hover)] text-[var(--gp-text-strong)] border border-[var(--gp-divider)] flex items-center gap-1.5 transition-all disabled:opacity-50"
          title="ซิงค์ข้อมูลชั่วโมงเล่นล่าสุดจาก Steam"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[var(--gp-brand)] ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* Steam Account Indicator Pill */}
        <button
          id="tour-steam-connect"
          type="button"
          onClick={onOpenSteamConnect}
          aria-label={user?.steamId ? `Steam ID: ${user.steamId}` : 'เชื่อมต่อบัญชี Steam'}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--gp-secondary)] hover:bg-[var(--gp-hover)] text-[var(--gp-text)] border border-[var(--gp-divider)] transition-all"
          title={user?.steamId ? `Steam ID: ${user.steamId}` : 'เชื่อมต่อบัญชี Steam'}
        >
          <SteamIcon className="w-3.5 h-3.5 text-[#66c0f4] shrink-0" />
          <span className="text-[11px] font-mono">{user?.steamId ? 'Steam' : 'เชื่อม Steam'}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              user?.steamId ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-slate-500'
            }`}
          />
        </button>

        {/* Theme Toggle */}
        <div className="hidden sm:block">
          <ThemeToggle currentTheme={currentTheme} onThemeChange={onThemeChange} />
        </div>

        {/* Toggle Right Sidebar Button */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? 'ซ่อนแถบ Activity & Pacing' : 'แสดงแถบ Activity & Pacing'}
            className={`p-1.5 rounded-md border border-[var(--gp-divider)] transition-all ${
              isSidebarOpen 
                ? 'bg-[var(--gp-brand)] text-white shadow-xs' 
                : 'bg-[var(--gp-secondary)] hover:bg-[var(--gp-hover)] text-[var(--gp-text-muted)] hover:text-[var(--gp-text)]'
            }`}
            title={isSidebarOpen ? 'ซ่อนแถบ Activity & Pacing' : 'แสดงแถบ Activity & Pacing'}
          >
            <PanelRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
