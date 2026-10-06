'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, Plus, ChevronDown, ChevronUp, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserGameItem } from './GameCard';
import { GameCoverImage } from './GameCoverImage';

export interface SteamLiveStatusInfo {
  isPlaying: boolean;
  gameTitle: string | null;
  appId: number | null;
  coverUrl?: string | null;
}

interface EndlessGamesRowProps {
  endlessGames: UserGameItem[];
  allUserGames?: UserGameItem[];
  currentlyPlaying?: SteamLiveStatusInfo | null;
  isDragOver: boolean;
  draggedId: string | null;
  dropTargetCardId?: string | null;
  dropPosition?: 'before' | 'after' | null;
  onOpenDetail: (game: UserGameItem) => void;
  onOpenSteamSearch?: () => void;
  onAddLiveGameToEndless?: (gameInfo: SteamLiveStatusInfo) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onCardDragOver?: (e: React.DragEvent, cardId: string) => void;
  onCardDrop?: (e: React.DragEvent, targetCardId: string) => void;
  onRowDragOver: (e: React.DragEvent) => void;
  onRowDragLeave: (e: React.DragEvent) => void;
  onRowDrop: (e: React.DragEvent) => void;
  onToggleStatus: (id: string, nextStatus: 'PLAYING' | 'DROPPED') => void;
}

export function EndlessGamesRow({
  endlessGames,
  allUserGames,
  currentlyPlaying,
  isDragOver,
  draggedId,
  dropTargetCardId,
  dropPosition,
  onOpenDetail,
  onOpenSteamSearch,
  onAddLiveGameToEndless,
  onDragStart,
  onDragEnd,
  onCardDragOver,
  onCardDrop,
  onRowDragOver,
  onRowDragLeave,
  onRowDrop,
  onToggleStatus,
}: EndlessGamesRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalPlayedMinutes = endlessGames.reduce(
    (sum, g) => sum + g.currentPlayedMinutes,
    0
  );
  const totalPlayedHours = (totalPlayedMinutes / 60).toFixed(1);
  const activeCount = endlessGames.filter((g) => g.status === 'PLAYING').length;

  // Prioritize game currently live on Steam to the front of the carousel
  const sortedEndlessGames = [...endlessGames].sort((a, b) => {
    if (!currentlyPlaying?.isPlaying) return 0;
    const isALive =
      (currentlyPlaying.appId && a.game.steamAppId === currentlyPlaying.appId) ||
      (currentlyPlaying.gameTitle &&
        a.game.title.toLowerCase().trim() === currentlyPlaying.gameTitle.toLowerCase().trim());
    const isBLive =
      (currentlyPlaying.appId && b.game.steamAppId === currentlyPlaying.appId) ||
      (currentlyPlaying.gameTitle &&
        b.game.title.toLowerCase().trim() === currentlyPlaying.gameTitle.toLowerCase().trim());

    if (isALive && !isBLive) return -1;
    if (!isALive && isBLive) return 1;
    return 0;
  });

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  return (
    <div
      onDragOver={onRowDragOver}
      onDragLeave={onRowDragLeave}
      onDrop={onRowDrop}
      className={`border rounded-2xl p-3 sm:p-4 transition-all duration-200 relative overflow-visible shadow-xs w-full bg-[var(--gp-secondary)] border-[var(--gp-divider)] ${
        isDragOver
          ? 'border-[var(--gp-brand)] ring-2 ring-[var(--gp-brand)]/30 bg-[var(--gp-brand)]/5'
          : ''
      }`}
    >
      {/* Row Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--gp-divider)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--gp-rail)] text-[var(--gp-text-muted)] flex items-center justify-center border border-[var(--gp-divider)] shadow-xs">
            <Sparkles className="w-4 h-4 text-[var(--gp-brand-light)]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-xs sm:text-sm tracking-tight flex items-center gap-2 text-[var(--gp-text-strong)]">
                <span>เกมเล่นเรื่อยๆ (Endless Carousel)</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold bg-[var(--gp-rail)] border border-[var(--gp-divider)] text-[var(--gp-text-muted)]">
                  {endlessGames.length} เกม
                </span>
              </h2>
            </div>
            <p className="text-[11px] mt-0.5 text-[var(--gp-text-muted)]">
              กำลังเล่น {activeCount} เกม · รวมเล่นไป {totalPlayedHours} ชม.
            </p>
          </div>
        </div>

        {/* Right Side Carousel & Action Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Scroll Carousel Controls */}
          {endlessGames.length > 2 && (
            <div className="flex items-center gap-1 bg-[var(--gp-rail)] p-0.5 rounded-lg border border-[var(--gp-divider)]">
              <button
                type="button"
                onClick={scrollLeft}
                aria-label="เลื่อนซ้าย"
                className="p-1 rounded-md text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] hover:bg-[var(--gp-hover)] transition-colors"
                title="เลื่อนซ้าย"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                aria-label="เลื่อนขวา"
                className="p-1 rounded-md text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] hover:bg-[var(--gp-hover)] transition-colors"
                title="เลื่อนขวา"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg border border-[var(--gp-divider)] bg-[var(--gp-rail)] text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] transition-colors"
            title={isExpanded ? 'ย่อแถว' : 'ขยายแถว'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Row Body / Horizontal Snap Carousel */}
      {isExpanded && (
        <div className="pt-3">
          {endlessGames.length === 0 ? (
            <div
              className={`p-6 border border-dashed rounded-xl flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left transition-all bg-[var(--gp-rail)]/30 border-[var(--gp-divider)] ${
                isDragOver ? 'border-[var(--gp-brand)] bg-[var(--gp-brand)]/10 ring-1 ring-[var(--gp-brand)]/30' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--gp-primary)] text-[var(--gp-text-muted)] flex items-center justify-center shrink-0 border border-[var(--gp-divider)]">
                <Sparkles className="w-5 h-5 text-[var(--gp-brand-light)]" />
              </div>
              <div className="flex-grow">
                <p className="text-xs sm:text-sm font-semibold text-[var(--gp-text-strong)]">
                  {isDragOver ? 'ปล่อยเพื่อย้ายเข้าสู่แถว Endless' : 'ยังไม่มีเกมในแถว Endless'}
                </p>
                <p className="text-[11px] text-[var(--gp-text-muted)] mt-0.5">
                  ลากการ์ดเกมจากคอลัมน์ด้านล่างมาวางที่นี่เพื่อตั้งเป็นเกม Endless
                </p>
              </div>
            </div>
          ) : (
            <div 
              ref={scrollContainerRef}
              className="flex items-stretch gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-thin"
            >
              {sortedEndlessGames.map((game) => {
                const playedHrs = Number((game.currentPlayedMinutes / 60).toFixed(1));
                const isPlaying = game.status === 'PLAYING';
                const isThisDragging = draggedId === game.id;
                const isCardTarget = dropTargetCardId === game.id;
                const isSteamLive = Boolean(
                  currentlyPlaying?.isPlaying &&
                    ((currentlyPlaying.appId && game.game.steamAppId === currentlyPlaying.appId) ||
                      (currentlyPlaying.gameTitle &&
                        game.game.title.toLowerCase().trim() === currentlyPlaying.gameTitle.toLowerCase().trim()))
                );

                return (
                  <div
                    key={game.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, game.id)}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => onCardDragOver?.(e, game.id)}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onCardDrop?.(e, game.id);
                    }}
                    onClick={() => onOpenDetail(game)}
                    className={`min-w-[240px] sm:min-w-[260px] max-w-[280px] shrink-0 snap-start bg-[var(--gp-primary)] hover:bg-[var(--gp-elevated)] border rounded-xl p-3 flex flex-col justify-between gap-2.5 cursor-pointer active:cursor-grabbing transition-all duration-150 select-none group relative shadow-xs hover:translate-y-[-2px] ${
                      isSteamLive
                        ? 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-md shadow-emerald-500/10'
                        : 'border-[var(--gp-divider)]'
                    } ${
                      isThisDragging ? 'opacity-40 scale-[0.98] ring-2 ring-[var(--gp-brand)]/50' : ''
                    } ${
                      isCardTarget ? 'ring-2 ring-[var(--gp-brand)] border-[var(--gp-brand)]' : ''
                    }`}
                  >
                    {/* Drop Indicator Lines */}
                    {isCardTarget && dropPosition === 'before' && (
                      <div className="absolute -left-1 top-1 bottom-1 w-0.5 bg-[var(--gp-brand)] rounded-full z-30 pointer-events-none" />
                    )}
                    {isCardTarget && dropPosition === 'after' && (
                      <div className="absolute -right-1 top-1 bottom-1 w-0.5 bg-[var(--gp-brand)] rounded-full z-30 pointer-events-none" />
                    )}

                    {/* Top: Capsule Cover & Title */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="overflow-hidden rounded-lg border border-[var(--gp-divider)] shrink-0 w-12 h-12 bg-[var(--gp-rail)] relative shadow-xs">
                        <GameCoverImage
                          src={game.game.coverUrl}
                          appId={game.game.steamAppId}
                          title={game.game.title}
                          isEndless={true}
                          className="w-12 h-12 object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        {isSteamLive && (
                          <div className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-[var(--gp-rail)]" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-grow">
                        <h3
                          className="font-semibold text-xs truncate transition-colors text-[var(--gp-text)] group-hover:text-[var(--gp-text-strong)]"
                          title={game.game.title}
                        >
                          {game.game.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold border bg-[var(--gp-rail)] text-[var(--gp-text-muted)] border-[var(--gp-divider)]">
                            Endless
                          </span>
                          {isSteamLive && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold border bg-emerald-500/20 text-emerald-400 border-emerald-500/40 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>เล่นบน Steam</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Hours Played Bar with Nitro glow */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-xs font-mono text-[var(--gp-text-strong)]">
                          {playedHrs} ชม.
                        </span>
                        <span className="text-[10px] text-[var(--gp-text-muted)] font-medium">
                          เล่นเรื่อยๆ
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--gp-rail)] border border-[var(--gp-divider)]">
                        <div
                          className={`h-full w-full rounded-full transition-opacity ${
                            isPlaying ? 'endless-bar-glow' : 'endless-bar-glow opacity-40'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Bottom: Status Toggle & Details Footer */}
                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[var(--gp-divider)] text-[var(--gp-text-muted)]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(game.id, isPlaying ? 'DROPPED' : 'PLAYING');
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-[var(--gp-rail)]/80 text-[var(--gp-text-muted)] hover:text-[var(--gp-text)] border-[var(--gp-divider)] hover:border-emerald-500/40'
                            : 'bg-[var(--gp-rail)]/40 text-[var(--gp-text-faint)] border-[var(--gp-divider)] hover:text-[var(--gp-text-muted)]'
                        }`}
                        title="คลิกเพื่อสลับสถานะ กำลังเล่น / พักไว้"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPlaying ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span>{isPlaying ? 'กำลังเล่น' : 'พักไว้'}</span>
                      </button>

                      <span className="text-[10px] opacity-75 group-hover:text-[var(--gp-brand-light)] font-medium">
                        รายละเอียด
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Drag over helper box */}
              {isDragOver && (
                <div className="min-w-[200px] shrink-0 border border-dashed border-[var(--gp-brand)] bg-[var(--gp-brand)]/10 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-center text-xs font-semibold text-[var(--gp-brand-light)] animate-pulse">
                  <Plus className="w-4 h-4" />
                  <span>ปล่อยเพื่อตั้งเป็น Endless</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
