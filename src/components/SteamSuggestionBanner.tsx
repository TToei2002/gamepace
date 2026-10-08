'use client';

import React, { useState } from 'react';
import { Sparkles, Play, Bookmark, Infinity as InfinityIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SteamGameItem } from '@/lib/steam';

interface SteamSuggestionBannerProps {
  suggestions: SteamGameItem[];
  onImport: (game: SteamGameItem, status: 'PLAYING' | 'BACKLOG', goal?: string) => Promise<void> | void;
  onDismiss: (appId: number) => void;
  onDismissAll?: () => void;
}

export function SteamSuggestionBanner({
  suggestions,
  onImport,
  onDismiss,
  onDismissAll,
}: SteamSuggestionBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingAppId, setLoadingAppId] = useState<number | null>(null);

  if (!suggestions || suggestions.length === 0) return null;

  // Safe index clamp
  const safeIndex = Math.min(currentIndex, suggestions.length - 1);
  const currentGame = suggestions[safeIndex];
  if (!currentGame) return null;

  const totalCount = suggestions.length;
  const playedHours = (currentGame.playedMinutes / 60).toFixed(1);
  const recentHours = currentGame.playtime2Weeks
    ? (currentGame.playtime2Weeks / 60).toFixed(1)
    : null;

  const handleAction = async (status: 'PLAYING' | 'BACKLOG', goal: string = 'Main + Extra') => {
    try {
      setLoadingAppId(currentGame.appId);
      await onImport(currentGame, status, goal);
    } finally {
      setLoadingAppId(null);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalCount);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalCount) % totalCount);
  };

  const coverUrl =
    currentGame.coverUrl ||
    `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${currentGame.appId}/header.jpg`;

  return (
    <div
      role="region"
      aria-label="การแนะนำเกมจากประวัติการเล่น Steam ล่าสุด"
      className="relative w-full rounded-2xl overflow-hidden border border-[var(--gp-brand)]/35 bg-[var(--gp-secondary)] shadow-sm transition-all animate-fadeIn"
    >
      {/* Background ambient cover glow */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 dark:opacity-25 pointer-events-none scale-110"
        style={{ backgroundImage: `url(${coverUrl})` }}
      />
      {/* Linear gradient veil */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--gp-brand)]/10 via-[var(--gp-secondary)]/90 to-[var(--gp-secondary)] pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Game Thumbnail + Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Game Header Thumbnail */}
          <div className="relative shrink-0 w-28 h-16 sm:w-36 sm:h-20 rounded-xl overflow-hidden border border-white/10 shadow-md bg-[var(--gp-rail)]">
            <img
              src={coverUrl}
              alt={currentGame.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80';
              }}
            />
            {totalCount > 1 && (
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/75 text-white backdrop-blur-xs">
                {safeIndex + 1}/{totalCount}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--gp-brand)]/15 text-[var(--gp-brand-light)] border border-[var(--gp-brand)]/30">
                พบเกมที่คุณเพิ่งเล่นบน Steam
              </span>

              {totalCount > 1 && (
                <div className="flex items-center gap-1 ml-auto sm:ml-0">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="ดูเกมแนะนำก่อนหน้า"
                    className="p-1 rounded-md text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] hover:bg-[var(--gp-rail)] transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-[var(--gp-text-muted)] font-mono">
                    {safeIndex + 1} จาก {totalCount}
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="ดูเกมแนะนำถัดไป"
                    className="p-1 rounded-md text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] hover:bg-[var(--gp-rail)] transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <h3
              className="text-base sm:text-lg font-bold text-[var(--gp-text-strong)] truncate mt-1 leading-snug"
              title={currentGame.title}
            >
              {currentGame.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-[var(--gp-text-muted)] mt-1 flex-wrap">
              {recentHours && Number(recentHours) > 0 ? (
                <span>
                  เล่นไป <strong className="text-[var(--gp-text-strong)] font-mono">{recentHours} ชม.</strong> ใน 2 สัปดาห์นี้
                  <span className="text-[var(--gp-text-muted)]/70 ml-1">(เล่นสะสม {playedHours} ชม.)</span>
                </span>
              ) : currentGame.rtimeLastPlayed ? (
                <span>
                  🕒 เล่นล่าสุดเมื่อ {new Date(currentGame.rtimeLastPlayed * 1000).toLocaleDateString('th-TH')}
                  <span className="text-[var(--gp-text-muted)]/70 ml-1">(เล่นสะสม {playedHours} ชม.)</span>
                </span>
              ) : (
                <span>มีอยู่ในคลัง Steam เล่นไปแล้ว {playedHours} ชม.</span>
              )}
              <span className="hidden sm:inline text-[var(--gp-text-muted)]/40">•</span>
              <span className="text-[var(--gp-text-muted)] hidden sm:inline">ยังไม่ได้เพิ่มลงใน GamePace</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-end">
          {/* Action 1: Add to Playing */}
          <button
            type="button"
            disabled={loadingAppId === currentGame.appId}
            onClick={() => handleAction('PLAYING', 'Main + Extra')}
            aria-label={`เพิ่ม ${currentGame.title} เข้าแถว กำลังเล่น`}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--gp-brand)] hover:brightness-110 active:scale-95 text-white transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>กำลังเล่น</span>
          </button>

          {/* Action 2: Add to Backlog */}
          <button
            type="button"
            disabled={loadingAppId === currentGame.appId}
            onClick={() => handleAction('BACKLOG', 'Main + Extra')}
            aria-label={`เพิ่ม ${currentGame.title} เข้า Backlog`}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--gp-rail)] hover:bg-[var(--gp-divider)] active:scale-95 text-[var(--gp-text-strong)] border border-[var(--gp-divider)] transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Backlog</span>
          </button>

          {/* Action 3: Add to Endless */}
          <button
            type="button"
            disabled={loadingAppId === currentGame.appId}
            onClick={() => handleAction('PLAYING', 'ENDLESS')}
            aria-label={`เพิ่ม ${currentGame.title} เข้าแถว Endless`}
            className="hidden lg:flex px-3 py-2 rounded-xl text-xs font-medium bg-[var(--gp-rail)] hover:bg-[var(--gp-divider)] active:scale-95 text-[var(--gp-text-muted)] hover:text-[var(--gp-text)] border border-[var(--gp-divider)] transition-all items-center gap-1.5 disabled:opacity-50"
            title="เพิ่มเข้าแถบเกมเล่นเรื่อยๆ / Live-Service"
          >
            <InfinityIcon className="w-3.5 h-3.5" />
            <span>Endless</span>
          </button>

          {/* Action 4: Dismiss / Skip this game */}
          <button
            type="button"
            onClick={() => onDismiss(currentGame.appId)}
            aria-label={`ไม่สนใจคำแนะนำเกม ${currentGame.title}`}
            title="ข้ามเกมนี้ (จะไม่แนะนำซ้ำอีก)"
            className="px-2.5 py-2 rounded-xl text-xs font-medium text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] hover:bg-[var(--gp-rail)] transition-all flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ข้าม</span>
          </button>
        </div>
      </div>
    </div>
  );
}
