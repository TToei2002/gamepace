'use client';

import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Clock, Compass, ChevronRight } from 'lucide-react';
import { UserGameItem } from './GameCard';

export interface SteamLiveStatusInfo {
  isPlaying: boolean;
  gameTitle: string | null;
  appId: number | null;
  coverUrl?: string | null;
}

interface SteamLivePlayingBannerProps {
  currentlyPlaying?: SteamLiveStatusInfo | null;
  allUserGames?: UserGameItem[];
  onOpenDetail?: (game: UserGameItem) => void;
  onAddLiveGameToEndless?: (gameInfo: SteamLiveStatusInfo) => void;
  onOpenSteamSearch?: () => void;
}

export function SteamLivePlayingBanner({
  currentlyPlaying,
  allUserGames = [],
  onOpenDetail,
  onAddLiveGameToEndless,
  onOpenSteamSearch,
}: SteamLivePlayingBannerProps) {
  const isLive = Boolean(currentlyPlaying?.isPlaying);

  // If live on Steam, find matching game in database
  const matchedGame = isLive
    ? allUserGames.find(
      (g) =>
        (currentlyPlaying?.appId && g.game.steamAppId === currentlyPlaying.appId) ||
        (currentlyPlaying?.gameTitle &&
          g.game.title.toLowerCase().trim() === currentlyPlaying.gameTitle.toLowerCase().trim())
    )
    : null;

  // Fallback if NOT playing: Find the best game to recommend next
  // Rule: Must be from games currently playing (PLAYING, excluding ENDLESS) and closest to 100% completion
  // If a game reaches 100%, pick the one closest to 100%
  const playingStoryGames = allUserGames.filter(
    (g) => g.status === 'PLAYING' && g.targetGoal !== 'ENDLESS'
  );

  const sortedPlayingGames = [...playingStoryGames].sort((a, b) => {
    const targetA = a.targetHours > 0 ? a.targetHours : 40;
    const targetB = b.targetHours > 0 ? b.targetHours : 40;
    const pctA = ((a.currentPlayedMinutes / 60) / targetA) * 100;
    const pctB = ((b.currentPlayedMinutes / 60) / targetB) * 100;

    const aUnder100 = pctA < 100;
    const bUnder100 = pctB < 100;

    if (aUnder100 && bUnder100) {
      return pctB - pctA; // Highest percentage under 100 comes first (closest to finishing)
    }
    if (aUnder100 && !bUnder100) return -1;
    if (!aUnder100 && bUnder100) return 1;

    // Both are >= 100%: pick closest to 100%
    return Math.abs(pctA - 100) - Math.abs(pctB - 100);
  });

  const backlogGames = allUserGames.filter(
    (g) => g.status === 'BACKLOG' && g.targetGoal !== 'ENDLESS'
  );
  const fallbackBacklog = [...backlogGames].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0] || null;

  const recommendedGame = !isLive
    ? (sortedPlayingGames[0] || fallbackBacklog || null)
    : null;

  const recTargetHours = recommendedGame
    ? (recommendedGame.targetHours > 0 ? recommendedGame.targetHours : 40)
    : 0;
  const recPlayedHours = recommendedGame
    ? Number((recommendedGame.currentPlayedMinutes / 60).toFixed(1))
    : 0;
  const recProgress = recommendedGame && recTargetHours > 0
    ? Math.round((recPlayedHours / recTargetHours) * 100)
    : 0;
  const recRemainingHours = recommendedGame
    ? Math.max(0, Number((recTargetHours - recPlayedHours).toFixed(1)))
    : 0;

  // Cover image URL resolution
  const coverUrl = isLive
    ? currentlyPlaying?.coverUrl ||
    (currentlyPlaying?.appId
      ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${currentlyPlaying.appId}/header.jpg`
      : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80')
    : recommendedGame?.game.coverUrl ||
    (recommendedGame?.game.steamAppId
      ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${recommendedGame.game.steamAppId}/header.jpg`
      : null);

  const displayTitle = isLive
    ? currentlyPlaying?.gameTitle || 'เกมบน Steam'
    : recommendedGame?.game.title || 'ยินดีต้อนรับสู่ GamePace';

  const isEndless = matchedGame?.targetGoal === 'ENDLESS';

  return (
    <section
      onClick={!isLive && recommendedGame ? () => onOpenDetail?.(recommendedGame) : undefined}
      className={`relative w-full rounded-2xl overflow-hidden border border-[var(--gp-divider)] shadow-xs transition-all duration-300 group ${!isLive && recommendedGame ? 'cursor-pointer hover:border-[var(--gp-brand)]/40 hover:shadow-sm' : ''
        }`}
    >
      {/* Blurred Game Cover Background */}
      {coverUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 filter blur-2xl opacity-25 dark:opacity-30 transition-all duration-700 pointer-events-none"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--gp-brand)]/15 to-transparent pointer-events-none" />
      )}

      {/* Surface Overlay */}
      <div className="absolute inset-0 bg-[var(--gp-secondary)]/85 backdrop-blur-md pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Game Art & Meta */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Header Image Capsule */}
          {coverUrl ? (
            <div className="relative shrink-0 w-24 h-16 sm:w-36 sm:h-20 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-[var(--gp-rail)] group/thumb">
              <img
                src={coverUrl}
                alt={displayTitle}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80';
                }}
              />
              {isLive && (
                <div className="absolute top-1.5 right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-[var(--gp-floating)]" />
                </div>
              )}
            </div>
          ) : (
            <div className="shrink-0 w-24 h-16 sm:w-36 sm:h-20 rounded-xl bg-[var(--gp-rail)] border border-[var(--gp-divider)] flex items-center justify-center text-[var(--gp-brand)]">
              <Compass className="w-8 h-8" />
            </div>
          )}

          {/* Text Details */}
          <div className="min-w-0 flex-grow">
            {/* Status Headline */}
            <div className="flex items-center gap-2 flex-wrap">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--gp-rail)]/80 text-[var(--gp-text-strong)] border border-[var(--gp-divider)] shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  กำลังเล่นเกมนี้อยู่บน Steam
                </span>
              ) : recommendedGame ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--gp-rail)]/80 text-[var(--gp-text)] border border-[var(--gp-divider)] shadow-xs">
                  <Sparkles className="w-3 h-3 text-[var(--gp-brand-light)]" />
                  เกมแนะนำให้เล่นต่อ ({recProgress}%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--gp-rail)] text-[var(--gp-text-muted)] border border-[var(--gp-divider)]">
                  <Compass className="w-3 h-3" />
                  พร้อมเริ่มเล่นเกมใหม่
                </span>
              )}

            </div>

            {/* Game Title */}
            <h2
              className="text-base sm:text-lg font-bold text-[var(--gp-text-strong)] truncate mt-1 leading-snug tracking-tight"
              title={displayTitle}
            >
              {displayTitle}
            </h2>

            {/* Location & Pacing Hint */}
            <div className="flex items-center gap-2 text-xs text-[var(--gp-text-muted)] mt-1 flex-wrap">
              {isLive ? (
                matchedGame ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--gp-rail)]/80 border border-[var(--gp-divider)] text-[11px] text-[var(--gp-text-muted)] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>
                      {isEndless
                        ? 'อยู่ในแถบ: เกมเล่นเรื่อยๆ (Endless)'
                        : matchedGame.status === 'PLAYING'
                        ? 'อยู่ในแถว: กำลังเล่น (Playing)'
                        : matchedGame.status === 'BACKLOG'
                        ? 'อยู่ในแถว: รอเล่น (Backlog)'
                        : matchedGame.status === 'COMPLETED'
                        ? 'อยู่ในแถว: เล่นจบแล้ว'
                        : `อยู่ในแถว: ${matchedGame.status}`}
                    </span>
                  </span>
                ) : (
                  <span className="text-[var(--gp-text-muted)]">ยังไม่ได้เพิ่มลงใน GamePace</span>
                )
              ) : recommendedGame ? (
                <span>
                  เล่นไปแล้ว {recPlayedHours} / {recTargetHours} ชม.
                  {recRemainingHours > 0 ? (
                    <span className="ml-1 text-[var(--gp-brand-light)] font-mono font-medium">
                      (เหลืออีก ~{recRemainingHours} ชม.)
                    </span>
                  ) : (
                    <span className="ml-1 text-emerald-400 font-mono font-medium">
                      (บรรลุเป้าหมาย 100% แล้ว)
                    </span>
                  )}
                </span>
              ) : (
                <span>เพิ่มเกมโปรดจาก Steam เพื่อเริ่มคำนวณ Pacing และเวลาเคลียร์เกม</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Action CTA (Only for Live Steam Game with details) */}
        {isLive && matchedGame && (
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={() => onOpenDetail?.(matchedGame)}
              className="px-4 py-2 text-xs rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <span>ดูรายละเอียดเกม</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
