'use client';

import React, { useState } from 'react';
import { 
  Gamepad2, 
  Columns, 
  BarChart3, 
  Gift, 
  RefreshCw, 
  Plus, 
  Sliders, 
  Sun, 
  Moon,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ThemeMode } from '@/lib/theme';
import { SteamIcon } from './SteamIcon';

interface ServerRailProps {
  activeTab: 'kanban' | 'analytics';
  onTabChange: (tab: 'kanban' | 'analytics') => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  isSyncing: boolean;
  onTriggerSteamSync: () => void;
  onOpenSteamSearch: () => void;
  onOpenSteamConnect: () => void;
  onOpenPacingModal: () => void;
  onOpenGamingWrapped: () => void;
  hasSteamConnected: boolean;
  isPlayingLive: boolean;
}

interface RailItemProps {
  isActive?: boolean;
  tooltip: string;
  badge?: string | number | null;
  badgeColor?: string;
  onClick: () => void;
  children: React.ReactNode;
  alertDot?: boolean;
}

function RailItem({
  isActive = false,
  tooltip,
  badge,
  badgeColor = 'bg-[var(--gp-brand)]',
  onClick,
  children,
  alertDot = false,
}: RailItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      className="relative flex items-center justify-center w-full group py-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Discord-style White Pill Indicator on Left Edge */}
      <span
        className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 pointer-events-none ${
          isActive 
            ? 'h-10' 
            : hovered 
              ? 'h-5 opacity-100' 
              : 'h-2 opacity-0'
        }`}
      />

      {/* Morphing Icon Container: circle (rounded-[24px]) -> squircle (rounded-[16px]) */}
      <button
        type="button"
        onClick={onClick}
        aria-label={tooltip}
        className={`relative w-12 h-12 flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:translate-y-[1px] ${
          isActive
            ? 'bg-[var(--gp-brand)] text-white rounded-[16px] shadow-md shadow-[var(--gp-brand)]/20'
            : 'bg-[var(--gp-secondary)] text-[var(--gp-text-muted)] hover:text-white hover:bg-[var(--gp-brand)] rounded-[24px] hover:rounded-[16px]'
        }`}
      >
        {children}

        {/* Live / Status Indicator Dot */}
        {alertDot && !isActive && (
          <span className="absolute top-1 right-1 flex h-3 w-3 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[var(--gp-rail)]" />
          </span>
        )}

        {/* Counter Badge if needed */}
        {badge !== undefined && badge !== null && (
          <span className={`absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white border-2 border-[var(--gp-rail)] ${badgeColor}`}>
            {badge}
          </span>
        )}
      </button>

      {/* Floating Tooltip (Discord style) */}
      <div
        className={`absolute left-[78px] z-50 px-3 py-1.5 text-xs font-semibold rounded-md shadow-xl whitespace-nowrap pointer-events-none transition-all duration-150 transform ${
          hovered 
            ? 'opacity-100 translate-x-0 scale-100' 
            : 'opacity-0 -translate-x-2 scale-95'
        } bg-[var(--gp-floating)] text-[var(--gp-text-strong)] border border-[var(--gp-divider)]`}
      >
        {tooltip}
        {/* Tooltip Arrow */}
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[var(--gp-floating)]" />
      </div>
    </div>
  );
}

export function ServerRail({
  activeTab,
  onTabChange,
  currentTheme,
  onThemeChange,
  isSyncing,
  onTriggerSteamSync,
  onOpenSteamSearch,
  onOpenSteamConnect,
  onOpenPacingModal,
  onOpenGamingWrapped,
  hasSteamConnected,
  isPlayingLive,
}: ServerRailProps) {
  return (
    <aside 
      className="hidden md:flex flex-col items-center justify-between w-[72px] h-screen bg-[var(--gp-rail)] py-3 z-30 shrink-0 select-none border-r border-[var(--gp-divider)]"
      aria-label="Navigation Rail"
    >
      {/* Top Group: Brand + Main Views */}
      <div className="flex flex-col items-center w-full gap-1">
        {/* App Logo Button */}
        <RailItem
          tooltip="GamePace Hub"
          onClick={() => onTabChange('kanban')}
          isActive={false}
        >
          <div className="w-full h-full flex items-center justify-center text-white bg-[var(--gp-brand)] rounded-inherit">
            <Gamepad2 className="w-6 h-6" />
          </div>
        </RailItem>

        {/* Discord Divider */}
        <div className="w-8 h-[2px] bg-[var(--gp-divider)] rounded-full my-1.5" />

        {/* Kanban Board View */}
        <RailItem
          tooltip="กระดาน Kanban"
          isActive={activeTab === 'kanban'}
          onClick={() => onTabChange('kanban')}
        >
          <Columns className="w-5 h-5" />
        </RailItem>

        {/* Analytics Dashboard View */}
        <RailItem
          tooltip="Dashboard สถิติ & Pacing"
          isActive={activeTab === 'analytics'}
          onClick={() => onTabChange('analytics')}
        >
          <BarChart3 className="w-5 h-5" />
        </RailItem>

        {/* Gaming Wrapped Modal */}
        <RailItem
          tooltip="Gaming Wrapped 2026"
          isActive={false}
          onClick={onOpenGamingWrapped}
        >
          <Gift className="w-5 h-5 text-pink-400 group-hover:text-white" />
        </RailItem>



        {/* Add Game Button */}
        <RailItem
          tooltip="เพิ่มเกมเข้า Backlog"
          isActive={false}
          onClick={onOpenSteamSearch}
        >
          <Plus className="w-5 h-5 text-emerald-400 group-hover:text-white" />
        </RailItem>
      </div>

      {/* Bottom Group: Settings & Profile Actions */}
      <div className="flex flex-col items-center w-full gap-1">
        {/* Discord Divider */}
        <div className="w-8 h-[2px] bg-[var(--gp-divider)] rounded-full my-1.5" />

        {/* Pacing Settings Button */}
        <RailItem
          tooltip="ตั้งค่าเวลาเล่น (Pacing Budget)"
          isActive={false}
          onClick={onOpenPacingModal}
        >
          <Sliders className="w-5 h-5" />
        </RailItem>


      </div>
    </aside>
  );
}
