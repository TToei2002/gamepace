'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ServerRail } from '@/components/ServerRail';
import { ActivitySidebar } from '@/components/ActivitySidebar';
import { PacingOverviewBanner } from '@/components/PacingOverviewBanner';
import { KanbanBoard } from '@/components/KanbanBoard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { SteamSearchModal } from '@/components/SteamSearchModal';
import { SteamConnectModal } from '@/components/SteamConnectModal';
import { UserPacingModal } from '@/components/UserPacingModal';
import { GamingWrappedModal } from '@/components/GamingWrappedModal';
import { UserGameItem } from '@/components/GameCard';
import { SteamGameItem } from '@/lib/steam';
import { evaluateBurnoutRisk } from '@/lib/pacing';
import { ThemeMode } from '@/lib/theme';
import { CloudDownload, X, Heart } from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    steamId?: string | null;
    avatar?: string | null;
    weekdayCapHours: number;
    weekendCapHours: number;
  } | null>(null);

  const [userGames, setUserGames] = useState<UserGameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'kanban' | 'analytics'>('kanban');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<{
    isPlaying: boolean;
    gameTitle: string | null;
    appId: number | null;
    coverUrl?: string | null;
  } | null>(null);

  // Theme Management (White-Blue vs Dark-Purple)
  const [theme, setTheme] = useState<ThemeMode>('dark-purple');

  // Sidebar Open State (Activity & Pacing)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastTime, setToastTime] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Modals visibility
  const [isSteamSearchOpen, setIsSteamSearchOpen] = useState(false);
  const [isSteamConnectOpen, setIsSteamConnectOpen] = useState(false);
  const [isPacingModalOpen, setIsPacingModalOpen] = useState(false);
  const [isGamingWrappedOpen, setIsGamingWrappedOpen] = useState(false);

  // Global Ctrl+K shortcut to open Steam Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSteamSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch Steam Player Summary & log clearly to browser console
  const fetchSteamLiveStatus = async (steamIdParam?: string) => {
    try {
      const activeSteamId = steamIdParam || user?.steamId || localStorage.getItem('gamepace_active_steamId') || '';
      const url = activeSteamId
        ? `/api/steam/player-summary?steamId=${encodeURIComponent(activeSteamId)}`
        : '/api/steam/player-summary';

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.summary) {
        const coverUrl =
          data.summary.currentGameCoverUrl ||
          (data.summary.currentGameAppId
            ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${data.summary.currentGameAppId}/header.jpg`
            : null);

        setCurrentlyPlaying({
          isPlaying: data.summary.isPlaying,
          gameTitle: data.summary.currentGameTitle,
          appId: data.summary.currentGameAppId,
          coverUrl,
        });

        // 🎮 Print visible, well-structured log in browser DevTools Console
        console.group('%c🎮 [Steam Live Status - ตรวจสอบสถานะผู้เล่น]', 'color: #38bdf8; font-weight: bold; font-size: 13px; padding: 2px 4px;');
        console.log('%c👤 ชื่อผู้เล่น Steam:', 'color: #94a3b8; font-weight: bold;', data.summary.personaName);
        console.log('%c🆔 SteamID:', 'color: #94a3b8; font-weight: bold;', data.summary.steamId);
        console.log(
          '%c🟢 สถานะออนไลน์ (Persona State):',
          'color: #94a3b8; font-weight: bold;',
          data.summary.personaState === 1 ? 'Online (ออนไลน์)' : data.summary.personaState === 0 ? 'Offline (ออฟไลน์)' : `State ${data.summary.personaState}`
        );
        if (data.summary.isPlaying) {
          console.log(
            '%c🔥 กำลังเล่นเกม (Currently Playing):',
            'color: #4ade80; font-weight: bold; font-size: 13px;',
            data.summary.currentGameTitle,
            `(AppID: ${data.summary.currentGameAppId})`
          );
        } else {
          console.log('%c💤 สถานะการเล่นเกม:', 'color: #cbd5e1; font-weight: bold;', 'ไม่ได้เปิดเกมบน Steam');
        }
        console.log('%c📦 ข้อมูลดิบจาก Steam API (Raw Data):', 'color: #a855f7;', data.summary.raw);
        console.groupEnd();
      } else {
        setCurrentlyPlaying({
          isPlaying: false,
          gameTitle: null,
          appId: null,
          coverUrl: null,
        });
        console.log('⚠️ [Steam Live Status]:', data.message || 'ไม่พบข้อมูลสถานะผู้เล่น');
      }
    } catch (err) {
      setCurrentlyPlaying({
        isPlaying: false,
        gameTitle: null,
        appId: null,
        coverUrl: null,
      });
      console.warn('Failed to fetch Steam player live summary:', err);
    }
  };

  // Initialize theme & load data on mount, then auto-sync Steam
  useEffect(() => {
    const savedTheme = localStorage.getItem('gamepace_theme') as ThemeMode;
    const initialTheme = (savedTheme === 'light-blue' || savedTheme === 'dark-purple') ? savedTheme : 'dark-purple';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    if (initialTheme === 'dark-purple') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const initAndSync = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSteamId = urlParams.get('steamId');
      const activeSteamId = urlSteamId || localStorage.getItem('gamepace_active_steamId') || undefined;

      if (activeSteamId) {
        if (urlSteamId !== activeSteamId) {
          window.history.replaceState({}, '', `?steamId=${activeSteamId}`);
        }
        localStorage.setItem('gamepace_active_steamId', activeSteamId);
      }

      if (activeSteamId) {
        const loadedUser = await fetchUserData(activeSteamId);
        if (loadedUser) {
          fetchSteamLiveStatus(loadedUser.steamId || activeSteamId);
          triggerSteamSync(loadedUser.id);
        }
      } else {
        setLoading(false);
      }
    };

    initAndSync();
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem('gamepace_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark-purple') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const fetchUserData = async (steamIdParam?: string) => {
    setLoading(true);
    try {
      const activeSteamId = steamIdParam || localStorage.getItem('gamepace_active_steamId') || '';
      const url = activeSteamId ? `/api/user-games?steamId=${encodeURIComponent(activeSteamId)}` : '/api/user-games';
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        if (data.user.steamId) {
          localStorage.setItem('gamepace_active_steamId', data.user.steamId);
        }
      }
      if (data.userGames) {
        setUserGames(data.userGames);
      }
      return data.user;
    } catch (err) {
      console.error('Failed to load user games data:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Steam Sync Action
  const triggerSteamSync = async (targetUserId?: any) => {
    const resolvedUserId = typeof targetUserId === 'string' ? targetUserId : user?.id;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/steam/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resolvedUserId }),
      });
      const data = await res.json();

      if (data.userGames) {
        setUserGames(data.userGames);
      }

      // Log rtime_last_played info to browser console
      if (data.steamDebugInfo) {
        console.group('🎮 [Steam Sync] ข้อมูลชุด rtime_last_played จาก Steam:');
        console.table(data.steamDebugInfo);
        console.log('Raw Debug Details:', data.steamDebugInfo);
        console.groupEnd();
      }

      // Also refresh live player status & log to console
      fetchSteamLiveStatus(user?.steamId || undefined);

      const logMsg = data.syncLogs && data.syncLogs.length > 0
        ? data.syncLogs.join(' · ')
        : 'ซิงค์ข้อมูลสำเร็จ ข้อมูลนาทีเล่นเป็นปัจจุบันแล้ว';

      showToast(logMsg);
    } catch (err) {
      console.error('Steam sync error:', err);
      showToast('การซิงค์ข้อมูลขัดข้อง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSyncing(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsToastVisible(true);
    
    // Auto dismiss
    setTimeout(() => {
      setIsToastVisible(false);
      setTimeout(() => setToastMsg(null), 300); // Wait for transition
    }, 4500);
  };

  // Move status handler (GameDetailModal dropdown or fallback)
  const handleMoveGameStatus = async (
    id: string,
    status: 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'DROPPED'
  ) => {
    setUserGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status } : g))
    );

    try {
      await fetch('/api/user-games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
    } catch (err) {
      console.error('Failed to update game status:', err);
      fetchUserData(user?.steamId || undefined);
    }
  };

  // Free card positioning & reordering handler
  const handleReorderGame = async (
    draggedId: string,
    targetStatus: 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'DROPPED' | 'ENDLESS',
    targetCardId: string | null,
    position: 'before' | 'after' | 'end'
  ) => {
    const dragged = userGames.find((g) => g.id === draggedId);
    if (!dragged) return;

    const wasEndless = dragged.targetGoal === 'ENDLESS';
    const isTargetEndless = targetStatus === 'ENDLESS';
    const remaining = userGames.filter((g) => g.id !== draggedId);

    let nextAllGames: UserGameItem[] = [];
    let itemsToUpdate: Array<{ id: string; status: string; order: number; targetGoal?: string; targetHours?: number }> = [];

    if (isTargetEndless) {
      // Moving into or reordering within the Endless row
      const targetGroup = remaining
        .filter((g) => g.targetGoal === 'ENDLESS')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      let insertIndex = targetGroup.length;
      if (targetCardId && position !== 'end') {
        const idx = targetGroup.findIndex((g) => g.id === targetCardId);
        if (idx !== -1) {
          insertIndex = position === 'before' ? idx : idx + 1;
        }
      }

      const updatedDragged: UserGameItem = {
        ...dragged,
        targetGoal: 'ENDLESS',
        targetHours: 0,
        status: dragged.status === 'DROPPED' ? 'DROPPED' : 'PLAYING',
      };
      targetGroup.splice(insertIndex, 0, updatedDragged);

      const newEndlessGames = targetGroup.map((g, idx) => ({
        ...g,
        order: idx,
      }));

      let sourceColGames: UserGameItem[] = [];
      if (!wasEndless) {
        sourceColGames = remaining
          .filter((g) => g.targetGoal !== 'ENDLESS' && g.status === dragged.status)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((g, idx) => ({ ...g, order: idx }));
      }

      const otherGames = remaining.filter((g) => {
        if (g.targetGoal === 'ENDLESS') return false;
        if (!wasEndless && g.status === dragged.status) return false;
        return true;
      });

      nextAllGames = [...otherGames, ...sourceColGames, ...newEndlessGames];

      itemsToUpdate = [
        ...newEndlessGames.map((g) => ({
          id: g.id,
          status: g.status,
          order: g.order,
          targetGoal: g.targetGoal,
          targetHours: g.targetHours,
        })),
        ...(!wasEndless
          ? sourceColGames.map((g) => ({ id: g.id, status: g.status, order: g.order }))
          : []),
      ];
    } else if (wasEndless) {
      // Moving from Endless row to a Story column
      const defaultHrs = dragged.game.hltbExtra || dragged.game.hltbMainStory || 40;
      const targetColGames = remaining
        .filter((g) => g.targetGoal !== 'ENDLESS' && g.status === targetStatus)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      let insertIndex = targetColGames.length;
      if (targetCardId && position !== 'end') {
        const idx = targetColGames.findIndex((g) => g.id === targetCardId);
        if (idx !== -1) {
          insertIndex = position === 'before' ? idx : idx + 1;
        }
      }

      const updatedDragged: UserGameItem = {
        ...dragged,
        status: targetStatus,
        targetGoal: 'Main + Extra',
        targetHours: defaultHrs,
      };
      targetColGames.splice(insertIndex, 0, updatedDragged);

      const newTargetColGames = targetColGames.map((g, idx) => ({
        ...g,
        order: idx,
      }));

      const newEndlessGames = remaining
        .filter((g) => g.targetGoal === 'ENDLESS')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((g, idx) => ({ ...g, order: idx }));

      const otherGames = remaining.filter((g) => {
        if (g.targetGoal === 'ENDLESS') return false;
        if (g.status === targetStatus) return false;
        return true;
      });

      nextAllGames = [...otherGames, ...newEndlessGames, ...newTargetColGames];

      itemsToUpdate = [
        ...newTargetColGames.map((g) => ({
          id: g.id,
          status: g.status,
          order: g.order,
          targetGoal: g.targetGoal,
          targetHours: g.targetHours,
        })),
        ...newEndlessGames.map((g) => ({ id: g.id, status: g.status, order: g.order })),
      ];
    } else {
      // Moving between or within Story columns
      const sourceStatus = dragged.status;
      const targetColGames = remaining
        .filter((g) => g.targetGoal !== 'ENDLESS' && g.status === targetStatus)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      let insertIndex = targetColGames.length;
      if (targetCardId && position !== 'end') {
        const idx = targetColGames.findIndex((g) => g.id === targetCardId);
        if (idx !== -1) {
          insertIndex = position === 'before' ? idx : idx + 1;
        }
      }

      const updatedDragged: UserGameItem = {
        ...dragged,
        status: targetStatus,
      };
      targetColGames.splice(insertIndex, 0, updatedDragged);

      const newTargetColGames = targetColGames.map((g, idx) => ({
        ...g,
        order: idx,
      }));

      let newSourceColGames: UserGameItem[] = [];
      if (sourceStatus !== targetStatus) {
        const sourceColGames = remaining
          .filter((g) => g.targetGoal !== 'ENDLESS' && g.status === sourceStatus)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        newSourceColGames = sourceColGames.map((g, idx) => ({
          ...g,
          order: idx,
        }));
      }

      const otherGames = remaining.filter((g) => {
        if (g.targetGoal === 'ENDLESS') return true;
        return g.status !== targetStatus && (sourceStatus === targetStatus || g.status !== sourceStatus);
      });

      nextAllGames = [
        ...otherGames,
        ...(sourceStatus !== targetStatus ? newSourceColGames : []),
        ...newTargetColGames,
      ];

      itemsToUpdate = [
        ...newTargetColGames.map((g) => ({ id: g.id, status: g.status, order: g.order })),
        ...(sourceStatus !== targetStatus
          ? newSourceColGames.map((g) => ({ id: g.id, status: g.status, order: g.order }))
          : []),
      ];
    }

    // Optimistic UI update
    setUserGames(nextAllGames);

    try {
      await fetch('/api/user-games/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToUpdate }),
      });
    } catch (err) {
      console.error('Failed to save reordered cards:', err);
      fetchUserData(user?.steamId || undefined);
    }
  };

  // Add manual time bumper (+1h / +2h)
  const handleAddManualTime = async (id: string, mins: number) => {
    const target = userGames.find((g) => g.id === id);
    if (!target) return;

    const newMins = target.currentPlayedMinutes + mins;
    let newStatus = target.status;
    if (newMins >= target.targetHours * 60 && target.status === 'PLAYING') {
      newStatus = 'COMPLETED';
    }

    const newSyncHistory = {
      id: 'local-' + Date.now(),
      previousMinutes: target.currentPlayedMinutes,
      newMinutes: newMins,
      syncedAt: new Date().toISOString(),
    };

    setUserGames((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              currentPlayedMinutes: newMins,
              status: newStatus,
              syncHistories: [...(g.syncHistories || []), newSyncHistory],
            }
          : g
      )
    );

    try {
      await fetch('/api/user-games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, playedMinutesDelta: mins }),
      });
    } catch (err) {
      console.error('Failed to add manual time:', err);
      fetchUserData(user?.steamId || undefined);
    }
  };

  // Update target hours (Expand Target / Select HLTB Goal / Custom)
  const handleUpdateTargetHours = async (
    id: string,
    newTargetHours: number,
    goalName?: string
  ) => {
    setUserGames((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, targetHours: newTargetHours, targetGoal: goalName || g.targetGoal }
          : g
      )
    );

    try {
      await fetch('/api/user-games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, targetHours: newTargetHours, targetGoal: goalName }),
      });
      showToast(`ปรับเปลี่ยนเป้าหมายเวลาเป็น ${newTargetHours} ชม. เรียบร้อยแล้ว`);
    } catch (err) {
      console.error('Failed to update target hours:', err);
      fetchUserData(user?.steamId || undefined);
    }
  };

  // Delete Game
  const handleRemoveGame = async (id: string) => {
    if (!confirm('ยืนยันลบเกมนี้ออกจาก Backlog?')) return;

    setUserGames((prev) => prev.filter((g) => g.id !== id));

    try {
      await fetch(`/api/user-games?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to remove game:', err);
      fetchUserData(user?.steamId || undefined);
    }
  };

  // Import Game from Steam Search Modal
  const handleImportGame = async (steamGame: SteamGameItem) => {
    // 1. Optimistic UI: Close modal immediately
    setIsSteamSearchOpen(false);

    // 2. Create a temporary optimistic game object
    const tempId = `temp-${Date.now()}`;
    const optimisticGame: UserGameItem = {
      id: tempId,
      userId: user?.id || '',
      gameId: `game-${steamGame.appId}`,
      status: 'BACKLOG',
      targetGoal: 'Main + Extra',
      targetHours: 40, // Temporary default
      currentPlayedMinutes: steamGame.playedMinutes,
      order: 0,
      createdAt: new Date().toISOString(),
      game: {
        id: `game-${steamGame.appId}`,
        steamAppId: steamGame.appId,
        title: steamGame.title,
        coverUrl: steamGame.coverUrl || `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${steamGame.appId}/header.jpg`,
        hltbMainStory: 0,
        hltbExtra: 0,
        hltbCompletionist: 0,
      }
    };

    // 3. Add to UI instantly
    setUserGames((prev) => {
      if (prev.some((g) => g.game.steamAppId === steamGame.appId)) return prev; // Already exists
      return [optimisticGame, ...prev];
    });

    try {
      // 4. Perform actual API request in background
      const res = await fetch('/api/user-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          appId: steamGame.appId,
          title: steamGame.title,
          coverUrl: steamGame.coverUrl,
          playedMinutes: steamGame.playedMinutes,
          status: 'BACKLOG',
        }),
      });

      const data = await res.json();
      if (data.userGame) {
        let needsSync = false;
        let syncStatus = 'BACKLOG';
        let syncOrder = 0;

        // Replace temp item with real data from database but PRESERVE user modifications
        setUserGames((prev) => {
          const currentUIState = prev.find((g) => g.id === tempId);
          if (!currentUIState) return prev;

          if (currentUIState.status !== 'BACKLOG' || currentUIState.order !== 0) {
            needsSync = true;
            syncStatus = currentUIState.status;
            syncOrder = currentUIState.order;
          }

          return prev.map((g) => g.id === tempId ? {
            ...data.userGame,
            status: currentUIState.status,
            order: currentUIState.order,
            targetGoal: currentUIState.targetGoal,
            targetHours: currentUIState.targetHours !== 40 ? currentUIState.targetHours : data.userGame.targetHours,
            currentPlayedMinutes: currentUIState.currentPlayedMinutes,
          } : g);
        });

        // If user dragged the temp card before it was saved, sync its new position with the real ID
        if (needsSync) {
          fetch('/api/user-games', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id: data.userGame.id, 
              status: syncStatus,
              order: syncOrder 
            }),
          }).catch(console.error);
        }
        
        if (data.message !== 'Game already in backlog') {
          showToast(`เพิ่ม "${steamGame.title}" เข้า Backlog เรียบร้อยแล้ว!`);
        }
      } else if (data.error) {
        // Rollback on error
        setUserGames((prev) => prev.filter((g) => g.id !== tempId));
        showToast(`ไม่สามารถเพิ่มเกมได้: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to import game:', err);
      // Rollback on error
      setUserGames((prev) => prev.filter((g) => g.id !== tempId));
      showToast('เกิดข้อผิดพลาดในการเพิ่มเกม กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Add Steam Live Playing Game directly into Endless row
  const handleAddLiveGameToEndless = async (liveInfo: {
    appId: number | null;
    gameTitle: string | null;
    coverUrl?: string | null;
  }) => {
    if (!liveInfo.gameTitle) return;
    try {
      const res = await fetch('/api/user-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          appId: liveInfo.appId,
          title: liveInfo.gameTitle,
          coverUrl:
            liveInfo.coverUrl ||
            (liveInfo.appId
              ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${liveInfo.appId}/header.jpg`
              : null),
          playedMinutes: 0,
          status: 'PLAYING',
          targetGoal: 'ENDLESS',
          estimateHours: 0,
        }),
      });

      const data = await res.json();
      if (data.userGame) {
        setUserGames((prev) => {
          if (prev.some((g) => g.id === data.userGame.id)) return prev;
          return [data.userGame, ...prev];
        });
        showToast(`เพิ่ม "${liveInfo.gameTitle}" เข้าสู่แถบ Endless เรียบร้อยแล้ว!`);
      } else if (data.message === 'Game already in backlog') {
        showToast(`"${liveInfo.gameTitle}" มีอยู่ในรายการของคุณแล้ว`);
      } else if (data.error) {
        showToast(`ไม่สามารถเพิ่มเกมได้: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to add live game to endless:', err);
      showToast('เกิดข้อผิดพลาดในการเพิ่มเกม');
    }
  };

  // Save/Switch Steam ID (Isolated Multi-User Profile)
  const handleSaveSteamId = async (input: string) => {
    const res = await fetch('/api/steam/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      const errorMsg = data.error || 'ไม่พบข้อมูลบัญชี Steam ที่ระบุ';
      showToast(errorMsg);
      throw new Error(errorMsg);
    }
    if (data.user) {
      setUser(data.user);
      if (data.user.steamId) {
        localStorage.setItem('gamepace_active_steamId', data.user.steamId);
        window.history.replaceState({}, '', `?steamId=${data.user.steamId}`);
      }
      // Load THIS specific user's isolated backlog!
      await fetchUserData(data.user.steamId);
      showToast(`เชื่อมต่อ Steam สำเร็จ: ${data.user.name}`);
    }
  };

  // Save Pacing Budget Config
  const handleSavePacingConfig = async (weekday: number, weekend: number) => {
    const res = await fetch('/api/user/pacing-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.id,
        weekdayCapHours: weekday,
        weekendCapHours: weekend,
      }),
    });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
    }
  };

  // Export CSV Action
  const handleExportCSV = () => {
    window.location.href = `/api/export/csv?userId=${user?.id || ''}`;
  };

  // Pacing & Burnout calculations
  const weekdayHours = user?.weekdayCapHours || 2.0;
  const weekendHours = user?.weekendCapHours || 5.5;

  const activeGames = userGames.filter((g) => g.status !== 'COMPLETED' && g.status !== 'DROPPED');
  const totalRemainingHours = activeGames
    .filter((g) => g.targetGoal !== 'ENDLESS')
    .reduce(
      (acc, g) => acc + Math.max(0, g.targetHours - g.currentPlayedMinutes / 60),
      0
    );

  const weeklyHours = weekdayHours * 5 + weekendHours * 2;
  const dailyHours = weeklyHours > 0 ? weeklyHours / 7 : 1;
  const totalRemainingDays = Math.ceil(totalRemainingHours / dailyHours);

  const burnoutStatus = evaluateBurnoutRisk(userGames);

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans transition-colors duration-300 bg-[var(--gp-primary)] text-[var(--gp-text)] select-none">
      {/* 1. Left Discord-style Server Rail (Icons & View Switches) */}
      <ServerRail
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        isSyncing={isSyncing}
        onTriggerSteamSync={triggerSteamSync}
        onOpenSteamSearch={() => setIsSteamSearchOpen(true)}
        onOpenSteamConnect={() => setIsSteamConnectOpen(true)}
        onOpenPacingModal={() => setIsPacingModalOpen(true)}
        onOpenGamingWrapped={() => setIsGamingWrappedOpen(true)}
        hasSteamConnected={Boolean(user?.steamId)}
        isPlayingLive={Boolean(currentlyPlaying?.isPlaying)}
      />

      {/* 2. Middle Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--gp-primary)]">
        {/* Top Channel Header */}
        <Header
          user={user}
          currentlyPlaying={currentlyPlaying}
          isSyncing={isSyncing}
          activeTab={activeTab}
          currentTheme={theme}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onThemeChange={handleThemeChange}
          onTabChange={setActiveTab}
          onTriggerSteamSync={triggerSteamSync}
          onOpenSteamSearch={() => setIsSteamSearchOpen(true)}
          onOpenSteamConnect={() => setIsSteamConnectOpen(true)}
        />

        {/* Sync Toast Notification (Discord System Notice style) */}
        <div 
          className={`fixed top-16 right-6 lg:right-10 z-50 transition-all duration-200 transform ${
            isToastVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-[120%] opacity-0 scale-95'
          }`}
        >
          {toastMsg && (
            <div className="bg-[var(--gp-floating)] border border-[var(--gp-divider)] rounded-xl p-3.5 flex flex-col gap-2.5 min-w-[300px] max-w-sm shadow-2xl">
              <div className="flex items-start justify-between gap-3 text-xs font-semibold text-[var(--gp-text-strong)]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--gp-brand)]/15 text-[var(--gp-brand-light)] flex items-center justify-center shrink-0">
                    <CloudDownload className="w-4 h-4" />
                  </div>
                  <span className="leading-snug">{toastMsg}</span>
                </div>
                <button 
                  onClick={() => setIsToastVisible(false)}
                  className="text-[var(--gp-text-muted)] hover:text-[var(--gp-text-strong)] transition-colors p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="w-full h-1 bg-[var(--gp-rail)] rounded-full overflow-hidden mr-2.5">
                  <div 
                    className="h-full bg-[var(--gp-brand)] rounded-full" 
                    style={{ animation: 'progressExpand 4.5s linear forwards' }}
                  />
                </div>
                <span className="text-[var(--gp-text-muted)] font-mono text-[10px] shrink-0">{toastTime}</span>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-6 space-y-5 scrollbar-thin">
          {/* Tab Views */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {/* Skeleton Loading State */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[var(--gp-secondary)] border border-[var(--gp-divider)] rounded-xl h-[520px] animate-pulse" />
              ))}
            </div>
          ) : activeTab === 'kanban' ? (
            <KanbanBoard
              userGames={userGames}
              currentlyPlaying={currentlyPlaying}
              weekdayHours={weekdayHours}
              weekendHours={weekendHours}
              onMoveGameStatus={handleMoveGameStatus}
              onReorderGame={handleReorderGame}
              onAddManualTime={handleAddManualTime}
              onUpdateTargetHours={handleUpdateTargetHours}
              onRemoveGame={handleRemoveGame}
              onOpenSteamSearch={() => setIsSteamSearchOpen(true)}
              onAddLiveGameToEndless={handleAddLiveGameToEndless}
            />
          ) : (
            <AnalyticsDashboard
              userGames={userGames}
              weekdayHours={weekdayHours}
              weekendHours={weekendHours}
              onExportCSV={handleExportCSV}
              onOpenGamingWrapped={() => setIsGamingWrappedOpen(true)}
            />
          )}

          {/* Discord-style Footer in Workspace */}
          <footer className="w-full border-t border-[var(--gp-divider)] pt-4 pb-2 text-center text-xs text-[var(--gp-text-muted)] mt-8">
            <div className="flex items-center justify-center gap-1.5 font-medium">
              <span>GamePace © 2026 — Discord Pacing Engine</span>
            </div>
          </footer>
        </main>
      </div>

      {/* 3. Right Activity & Pacing Sidebar */}
      <ActivitySidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        weekdayHours={weekdayHours}
        weekendHours={weekendHours}
        totalRemainingHours={totalRemainingHours}
        totalRemainingDays={totalRemainingDays}
        burnoutStatus={burnoutStatus}
        userGames={userGames}
        userSteamId={user?.steamId}
        userName={user?.name}
        isSyncing={isSyncing}
        onTriggerSteamSync={triggerSteamSync}
        onOpenPacingModal={() => setIsPacingModalOpen(true)}
        onExportCSV={handleExportCSV}
        onOpenSteamConnect={() => setIsSteamConnectOpen(true)}
      />

      {/* Modals */}
      <SteamSearchModal
        isOpen={isSteamSearchOpen}
        steamId={user?.steamId}
        userGames={userGames}
        onClose={() => setIsSteamSearchOpen(false)}
        onImportGame={handleImportGame}
      />

      <SteamConnectModal
        isOpen={isSteamConnectOpen}
        currentSteamId={user?.steamId}
        onClose={() => setIsSteamConnectOpen(false)}
        onSaveSteamId={handleSaveSteamId}
      />

      <UserPacingModal
        isOpen={isPacingModalOpen}
        weekdayCapHours={weekdayHours}
        weekendCapHours={weekendHours}
        onClose={() => setIsPacingModalOpen(false)}
        onSavePacing={handleSavePacingConfig}
      />

      <GamingWrappedModal
        isOpen={isGamingWrappedOpen}
        userGames={userGames}
        weekdayHours={weekdayHours}
        weekendHours={weekendHours}
        userName={user?.name || 'Gamer'}
        onClose={() => setIsGamingWrappedOpen(false)}
      />
    </div>
  );
}
