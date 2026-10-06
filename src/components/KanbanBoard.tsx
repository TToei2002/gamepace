'use client';

import React, { useState } from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { GameCard, UserGameItem } from './GameCard';
import { GameDetailModal } from './GameDetailModal';
import { EndlessGamesRow, SteamLiveStatusInfo } from './EndlessGamesRow';
import { SteamLivePlayingBanner } from './SteamLivePlayingBanner';

type ColumnId = 'BACKLOG' | 'PLAYING' | 'COMPLETED' | 'DROPPED';

interface DropTargetState {
  type: 'column' | 'endless';
  columnId?: ColumnId;
  targetCardId?: string | null;
  position?: 'before' | 'after' | 'end';
}

interface KanbanBoardProps {
  userGames: UserGameItem[];
  currentlyPlaying?: SteamLiveStatusInfo | null;
  weekdayHours: number;
  weekendHours: number;
  onMoveGameStatus: (id: string, status: ColumnId) => void;
  onReorderGame: (
    draggedId: string,
    targetStatus: ColumnId | 'ENDLESS',
    targetCardId: string | null,
    position: 'before' | 'after' | 'end'
  ) => void;
  onAddManualTime?: (id: string, mins: number) => void;
  onUpdateTargetHours: (id: string, newTargetHours: number, goalName?: string) => void;
  onRemoveGame: (id: string) => void;
  onOpenSteamSearch?: () => void;
  onAddLiveGameToEndless?: (gameInfo: SteamLiveStatusInfo) => void;
}

export function KanbanBoard({
  userGames,
  currentlyPlaying,
  weekdayHours,
  weekendHours,
  onMoveGameStatus,
  onReorderGame,
  onAddManualTime,
  onUpdateTargetHours,
  onRemoveGame,
  onOpenSteamSearch,
  onAddLiveGameToEndless,
}: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTargetState | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  // Completed column view states: compact toggle
  const [isCompletedCompact, setIsCompletedCompact] = useState(true);

  const activeGame = selectedGameId
    ? userGames.find((g) => g.id === selectedGameId) || null
    : null;

  // Separate endless games from story backlog games
  const endlessGames = userGames
    .filter((g) => g.targetGoal === 'ENDLESS')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const storyGames = userGames.filter((g) => g.targetGoal !== 'ENDLESS');

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget(null);
  };

  const handleCardDragOver = (e: React.DragEvent, cardId: string, colId: ColumnId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedId || draggedId === cardId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position: 'before' | 'after' = e.clientY < midY ? 'before' : 'after';

    setDropTarget({
      type: 'column',
      columnId: colId,
      targetCardId: cardId,
      position,
    });
  };

  const handleCardDrop = (e: React.DragEvent, targetCardId: string, colId: ColumnId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedId) return;

    const pos =
      dropTarget?.targetCardId === targetCardId ? (dropTarget.position || 'before') : 'before';

    onReorderGame(draggedId, colId, targetCardId, pos);
    setDraggedId(null);
    setDropTarget(null);
  };

  const handleColumnDragOver = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    if (!draggedId) return;

    if (dropTarget?.type !== 'column' || dropTarget?.columnId !== colId || dropTarget?.targetCardId === null) {
      setDropTarget({
        type: 'column',
        columnId: colId,
        targetCardId: null,
        position: 'end',
      });
    }
  };

  const handleColumnDragLeave = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dropTarget?.columnId === colId) {
      setDropTarget(null);
    }
  };

  const handleColumnDrop = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    if (!draggedId) return;

    if (dropTarget && dropTarget.columnId === colId && dropTarget.targetCardId) {
      onReorderGame(draggedId, colId, dropTarget.targetCardId, dropTarget.position || 'before');
    } else {
      onReorderGame(draggedId, colId, null, 'end');
    }
    setDraggedId(null);
    setDropTarget(null);
  };

  // Endless card drag & drop
  const handleEndlessCardDragOver = (e: React.DragEvent, cardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedId || draggedId === cardId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const position: 'before' | 'after' = e.clientX < midX ? 'before' : 'after';

    setDropTarget({
      type: 'endless',
      targetCardId: cardId,
      position,
    });
  };

  const handleEndlessCardDrop = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedId) return;

    const pos =
      dropTarget?.type === 'endless' && dropTarget?.targetCardId === targetCardId
        ? (dropTarget.position || 'before')
        : 'before';

    onReorderGame(draggedId, 'ENDLESS', targetCardId, pos);
    setDraggedId(null);
    setDropTarget(null);
  };

  const handleEndlessRowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedId) return;
    if (dropTarget?.type !== 'endless' || dropTarget?.targetCardId !== null) {
      setDropTarget({
        type: 'endless',
        targetCardId: null,
        position: 'end',
      });
    }
  };

  const handleEndlessRowDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dropTarget?.type === 'endless') {
      setDropTarget(null);
    }
  };

  const handleEndlessRowDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedId) return;

    if (dropTarget?.type === 'endless' && dropTarget.targetCardId) {
      onReorderGame(
        draggedId,
        'ENDLESS',
        dropTarget.targetCardId,
        dropTarget.position || 'before'
      );
    } else {
      onReorderGame(draggedId, 'ENDLESS', null, 'end');
    }

    setDraggedId(null);
    setDropTarget(null);
  };

  const handleToggleEndlessStatus = (id: string, nextStatus: 'PLAYING' | 'DROPPED') => {
    onMoveGameStatus(id, nextStatus);
  };

  const columns: {
    id: ColumnId;
    title: string;
    badgeBg: string;
    badgeText: string;
    dotBg: string;
    staggerClass: string;
  }[] = [
    {
      id: 'BACKLOG',
      title: 'รอเล่น (Backlog)',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
      badgeText: 'text-slate-700 dark:text-slate-300',
      dotBg: 'bg-slate-400',
      staggerClass: 'stagger-1',
    },
    {
      id: 'PLAYING',
      title: 'กำลังเล่น (Playing)',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/30',
      badgeText: 'text-indigo-700 dark:text-indigo-300',
      dotBg: 'bg-indigo-500 dark:bg-indigo-400 animate-pulse',
      staggerClass: 'stagger-2',
    },
    {
      id: 'COMPLETED',
      title: 'เล่นจบแล้ว (Finished)',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30',
      badgeText: 'text-emerald-700 dark:text-emerald-400',
      dotBg: 'bg-emerald-500 dark:bg-emerald-400',
      staggerClass: 'stagger-3',
    },
    {
      id: 'DROPPED',
      title: 'ดอง/เลิกเล่น (Dropped)',
      badgeBg: 'bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/30',
      badgeText: 'text-rose-700 dark:text-rose-400',
      dotBg: 'bg-rose-500 dark:bg-rose-400',
      staggerClass: 'stagger-4',
    },
  ];

  return (
    <div className="flex flex-col gap-5 w-full min-w-0">
      {/* Hero Now Playing / Up Next Banner */}
      <SteamLivePlayingBanner
        currentlyPlaying={currentlyPlaying}
        allUserGames={userGames}
        onOpenDetail={(game) => setSelectedGameId(game.id)}
        onAddLiveGameToEndless={onAddLiveGameToEndless}
        onOpenSteamSearch={onOpenSteamSearch}
      />

      {/* Dedicated Row for Endless & Live-Service Games */}
      <EndlessGamesRow
        endlessGames={endlessGames}
        allUserGames={userGames}
        currentlyPlaying={currentlyPlaying}
        isDragOver={dropTarget?.type === 'endless' && !dropTarget?.targetCardId}
        draggedId={draggedId}
        dropTargetCardId={dropTarget?.type === 'endless' ? dropTarget?.targetCardId : null}
        dropPosition={dropTarget?.type === 'endless' ? (dropTarget?.position as 'before' | 'after' | null) : null}
        onOpenDetail={(game) => setSelectedGameId(game.id)}
        onOpenSteamSearch={onOpenSteamSearch}
        onAddLiveGameToEndless={onAddLiveGameToEndless}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onCardDragOver={handleEndlessCardDragOver}
        onCardDrop={handleEndlessCardDrop}
        onRowDragOver={handleEndlessRowDragOver}
        onRowDragLeave={handleEndlessRowDragLeave}
        onRowDrop={handleEndlessRowDrop}
        onToggleStatus={handleToggleEndlessStatus}
      />

      {/* 4 Story Backlog Columns */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 flex-grow items-stretch pb-6 w-full min-w-0">
        {columns.map((col) => {
          const gamesInCol = storyGames
            .filter((g) => g.status === col.id)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

          const isColDragOver =
            dropTarget?.type === 'column' && dropTarget.columnId === col.id;
          const isDropTargetBottom =
            isColDragOver && dropTarget?.position === 'end';

          // Completed column logic: allow compact toggle (all games rendered and scrollable inside column)
          const isCompletedCol = col.id === 'COMPLETED';
          const displayedGames = gamesInCol;

          const headerAction = isCompletedCol && gamesInCol.length > 0 ? (
            <button
              type="button"
              onClick={() => setIsCompletedCompact(!isCompletedCompact)}
              title={isCompletedCompact ? 'สลับเป็นมุมมองการ์ดเต็ม' : 'สลับเป็นมุมมองกะทัดรัด (Compact)'}
              className="p-1 rounded-md border border-[var(--gp-border-subtle)] text-[var(--gp-text-muted)] hover:text-[var(--gp-text)] bg-[var(--gp-rail)] transition-colors"
            >
              {isCompletedCompact ? (
                <LayoutList className="w-3.5 h-3.5 text-[var(--gp-green)]" />
              ) : (
                <LayoutGrid className="w-3.5 h-3.5" />
              )}
            </button>
          ) : undefined;

          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              badgeBg={col.badgeBg}
              badgeText={col.badgeText}
              dotBg={col.dotBg}
              count={gamesInCol.length}
              staggerClass={col.staggerClass}
              headerAction={headerAction}
              onAddGame={col.id === 'BACKLOG' ? onOpenSteamSearch : undefined}
              isDragOver={isColDragOver}
              isDropTargetBottom={isDropTargetBottom}
              onDragOver={(e) => handleColumnDragOver(e, col.id)}
              onDragLeave={(e) => handleColumnDragLeave(e, col.id)}
              onDrop={(e) => handleColumnDrop(e, col.id)}
            >
              {displayedGames.map((ug) => {
                const isThisDragging = draggedId === ug.id;
                const isCardTarget =
                  dropTarget?.type === 'column' &&
                  dropTarget?.targetCardId === ug.id;
                const cardDropPos = isCardTarget
                  ? (dropTarget.position as 'before' | 'after')
                  : null;

                return (
                  <GameCard
                    key={ug.id}
                    userGame={ug}
                    weekdayHours={weekdayHours}
                    weekendHours={weekendHours}
                    isCompact={isCompletedCol && isCompletedCompact}
                    isDragging={isThisDragging}
                    dropPosition={cardDropPos}
                    onOpenDetail={(game) => setSelectedGameId(game.id)}
                    onAddManualTime={onAddManualTime}
                    onUpdateTargetHours={onUpdateTargetHours}
                    onRemoveGame={onRemoveGame}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onCardDragOver={(e) => handleCardDragOver(e, ug.id, col.id)}
                    onCardDrop={(e) => handleCardDrop(e, ug.id, col.id)}
                  />
                );
              })}
            </KanbanColumn>
          );
        })}
      </section>

      {/* Game Detail & Settings Modal */}
      <GameDetailModal
        isOpen={Boolean(activeGame)}
        userGame={activeGame}
        weekdayHours={weekdayHours}
        weekendHours={weekendHours}
        onClose={() => setSelectedGameId(null)}
        onUpdateTargetHours={onUpdateTargetHours}
        onMoveGameStatus={onMoveGameStatus}
        onRemoveGame={onRemoveGame}
      />
    </div>
  );
}
