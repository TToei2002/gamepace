'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Gamepad, Plus, Check, Info, CheckCircle2, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { SteamGameItem } from '@/lib/steam';
import { UserGameItem } from './GameCard';
import { GameCoverImage } from './GameCoverImage';

interface SteamSearchModalProps {
  isOpen: boolean;
  steamId?: string | null;
  userGames: UserGameItem[];
  onClose: () => void;
  onImportGame: (game: SteamGameItem) => void;
}

// In-memory session cache (persists until webpage is reloaded/refreshed)
let cachedLibraryData: {
  steamId: string;
  games: SteamGameItem[];
  isLive: boolean;
  statusMsg: string;
} | null = null;

export function SteamSearchModal({
  isOpen,
  steamId,
  userGames,
  onClose,
  onImportGame,
}: SteamSearchModalProps) {
  const currentSteamIdKey = steamId || '';
  const [query, setQuery] = useState('');
  const [steamLibrary, setSteamLibrary] = useState<SteamGameItem[]>(() => {
    if (cachedLibraryData && cachedLibraryData.steamId === currentSteamIdKey) {
      return cachedLibraryData.games;
    }
    return [];
  });
  const [isLive, setIsLive] = useState(() => {
    if (cachedLibraryData && cachedLibraryData.steamId === currentSteamIdKey) {
      return cachedLibraryData.isLive;
    }
    return false;
  });
  const [statusMsg, setStatusMsg] = useState(() => {
    if (cachedLibraryData && cachedLibraryData.steamId === currentSteamIdKey) {
      return cachedLibraryData.statusMsg;
    }
    return '';
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // If already cached for this steamId, reuse immediately without re-fetching
    if (cachedLibraryData && cachedLibraryData.steamId === currentSteamIdKey && cachedLibraryData.games.length > 0) {
      setSteamLibrary(cachedLibraryData.games);
      setIsLive(cachedLibraryData.isLive);
      setStatusMsg(cachedLibraryData.statusMsg);
      return;
    }

    // Only fetch if not yet loaded in this session
    fetchLibrary();
  }, [isOpen, currentSteamIdKey]);

  const fetchLibrary = async (force = false) => {
    // If not forced and we already have cached games for this steamId, skip
    if (!force && cachedLibraryData && cachedLibraryData.steamId === currentSteamIdKey && cachedLibraryData.games.length > 0) {
      return;
    }

    setLoading(true);
    try {
      const url = steamId ? `/api/steam/owned?steamId=${encodeURIComponent(steamId)}` : '/api/steam/owned';
      const res = await fetch(url);
      const data = await res.json();
      if (data.games) {
        const gamesList = data.games as SteamGameItem[];
        const live = Boolean(data.isLive);
        const msg = data.message || '';

        setSteamLibrary(gamesList);
        setIsLive(live);
        setStatusMsg(msg);

        // Store in session cache
        cachedLibraryData = {
          steamId: currentSteamIdKey,
          games: gamesList,
          isLive: live,
          statusMsg: msg,
        };
      }
    } catch (err) {
      console.error('Failed to fetch Steam library:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredGames = steamLibrary.filter((g) =>
    g.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[var(--gp-primary)] border border-[var(--gp-border)] rounded-2xl max-w-lg w-full p-4 sm:p-5 space-y-4 shadow-2xl animate-scaleIn relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--gp-border-subtle)] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--gp-brand)]/15 text-[var(--gp-brand-light)] flex items-center justify-center">
              <Gamepad className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--gp-text)]">
                เลือกเกมจากคลัง Steam
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLibrary(true)}
              disabled={loading}
              title="ดึงข้อมูลล่าสุดจาก Steam ใหม่"
              className="p-1 px-2 rounded-lg border border-[var(--gp-border-subtle)] bg-[var(--gp-rail)] text-xs flex items-center gap-1 text-[var(--gp-text-muted)] hover:text-[var(--gp-text)] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-[11px]">รีเฟรช</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--gp-text-muted)] hover:text-[var(--gp-text)] hover:bg-[var(--gp-elevated)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner if private/fallback */}
        {!isLive && statusMsg && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-400">{statusMsg}</p>
              <p className="text-[11px] leading-relaxed text-[var(--gp-text-muted)]">
                * ข้อแนะนำ: หากต้องการดึงเกมจริงจาก Steam โปรดไปที่โปรไฟล์ Steam &rarr; Privacy Settings &rarr; เปลี่ยน <strong>Game Details เป็น Public (สาธารณะ)</strong>
              </p>
            </div>
          </div>
        )}

        {isLive && (
          <div className="p-2.5 rounded-xl border border-[var(--gp-green)]/30 bg-[var(--gp-green)]/10 text-xs flex items-center gap-2 text-[var(--gp-green)]">
            <CheckCircle2 className="w-4 h-4 text-[var(--gp-green)] shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gp-text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหารายชื่อเกมในคลัง Steam ของคุณ..."
            className="w-full bg-[var(--gp-rail)] border border-[var(--gp-divider)] focus:border-[var(--gp-brand)] rounded-lg pl-9 pr-3.5 py-2 text-xs sm:text-sm text-[var(--gp-text)] placeholder-[var(--gp-text-muted)] focus:outline-none transition-colors"
          />
        </div>

        {/* Games List */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1 text-xs scrollbar-thin">
          {loading ? (
            <div className="py-12 text-center text-[var(--gp-text-muted)] flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-[var(--gp-brand)] border-t-transparent rounded-full animate-spin"></div>
              <span>กำลังเชื่อมต่อดึงข้อมูลจาก Steam API...</span>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="py-12 text-center text-[var(--gp-text-muted)] flex flex-col items-center justify-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--gp-rail)] flex items-center justify-center text-[var(--gp-text-muted)] border border-[var(--gp-divider)]">
                <Gamepad className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[var(--gp-text-strong)]">
                {query ? 'ไม่พบเกมที่ตรงกับคำค้นหา' : 'ไม่พบเกมในคลัง Steam ของคุณ'}
              </p>
              <p className="text-[11px] text-[var(--gp-text-muted)] max-w-xs leading-relaxed">
                {query
                  ? 'ลองตรวจสอบตัวสะกด หรือค้นหาด้วยชื่อภาษาอังกฤษ'
                  : 'หากมีเกมในบัญชีจริง โปรดตรวจสอบว่าได้ตั้งค่า Game Details เป็น Public ในหน้า Privacy Settings ของ Steam แล้ว'}
              </p>
            </div>
          ) : (
            filteredGames.map((game) => {
              const isAdded = userGames.some((ug) => ug.game.steamAppId === game.appId);
              const playedHrs = (game.playedMinutes / 60).toFixed(1);

              return (
                <div
                  key={game.appId}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--gp-divider)] bg-[var(--gp-secondary)] hover:bg-[var(--gp-elevated)] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="overflow-hidden rounded-lg border border-[var(--gp-divider)] shrink-0 w-10 h-10 bg-[var(--gp-rail)]">
                      <GameCoverImage
                        src={game.coverUrl}
                        appId={game.appId}
                        title={game.title}
                        className="w-10 h-10 object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm truncate text-[var(--gp-text-strong)]">
                        {game.title}
                      </div>
                      <div className="text-[11px] flex items-center gap-1 mt-0.5 font-mono text-[var(--gp-text-muted)]">
                        <Clock className="w-3 h-3 text-[var(--gp-brand-light)]" />
                        <span>เล่นแล้ว {playedHrs} ชม.</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onImportGame(game)}
                    disabled={isAdded}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                      isAdded
                        ? 'bg-[var(--gp-rail)] text-[var(--gp-text-muted)] cursor-not-allowed border border-[var(--gp-divider)]'
                        : 'bg-[var(--gp-brand)] hover:bg-[var(--gp-brand-hover)] text-white shadow-xs active:scale-95'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> เพิ่มแล้ว
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> เลือก
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
