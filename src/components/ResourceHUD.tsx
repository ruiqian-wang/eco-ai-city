import React from 'react';
import { Battery, Droplets, Gem } from 'lucide-react';
import { Player } from '../types';
import { cn } from '../lib/utils';

const MAX_BATTERY = 60;
const MAX_WATER = 60;
const MAX_MATERIALS = 30;

interface ResourceHUDProps {
  power: number;
  water?: number;
  materials?: number;
  players: Record<string, Player>;
  currentPlayerId: string;
  activePlayerId: string;
  playerOrder: string[];
  round: number;
  onEndTurn?: () => void;
  /** When true, omit outer top margin (e.g. inside a modal) */
  inModal?: boolean;
}

export const ResourceHUD: React.FC<ResourceHUDProps> = ({
  power,
  water = 0,
  materials = 0,
  players,
  currentPlayerId,
  activePlayerId,
  playerOrder,
  round,
  onEndTurn,
  inModal = false,
}) => {
  const activeIndex = playerOrder.indexOf(activePlayerId);
  const resourceConfig = [
    { key: 'battery', label: 'Battery', value: power, max: MAX_BATTERY, Icon: Battery },
    { key: 'water', label: 'Water', value: water, max: MAX_WATER, Icon: Droplets },
    { key: 'materials', label: 'Rare Materials', value: materials, max: MAX_MATERIALS, Icon: Gem },
  ] as const;

  return (
    <div
      className={cn('relative rounded-3xl p-4 lg:p-5 w-full shadow-sm overflow-hidden', !inModal && 'mt-6')}
      style={{
        backgroundImage: 'url(/player-bg.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="flex items-end justify-center gap-5 h-56 mb-4">
        {/* TODO(icon): replace these temporary Lucide icons with final custom icon assets */}
        {resourceConfig.map(({ key, label, value, max, Icon }) => {
          const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
          const barFillHeight = `${Math.max(pct, 4)}%`;
          return (
            <div key={key} className="w-24 flex flex-col items-center text-white">
              <Icon className="w-7 h-7 mb-1.5" />
              <div className={cn('text-sm font-extrabold text-center leading-tight', key === 'materials' && 'max-w-[88px]')}>
                {label}
              </div>
              <div className="w-full mt-2 h-28 rounded-t-[999px] rounded-b-xl bg-white/20 relative overflow-hidden flex flex-col justify-end">
                <div
                  className="w-full rounded-t-[999px] rounded-b-xl bg-[#184D2B] relative min-h-[8px] transition-[height] duration-300"
                  style={{ height: barFillHeight }}
                >
                  <div className="absolute top-1 left-0 right-0 text-center text-2xl font-extrabold text-white drop-shadow-md">
                    {value}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl px-3 py-1.5 shadow-sm space-y-0">
        {playerOrder.map((pid, idx) => {
          const player = players[pid];
          if (!player) return null;
          const isActive = pid === activePlayerId;

          return (
            <div key={pid}>
              <div
                className={cn(
                  'flex items-center gap-2 py-2.5 px-2 rounded-xl transition-colors',
                  isActive && 'bg-stone-50'
                )}
              >
                <div className="min-w-0 flex-1 flex items-center gap-1.5">
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] shrink-0" />
                  )}
                  <span className={cn(
                    'text-sm truncate',
                    isActive ? 'font-extrabold text-stone-900' : 'font-semibold text-stone-500'
                  )}>
                    {player.name}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="flex items-center gap-0.5 text-xs font-bold text-stone-600">
                    <Battery className="w-3 h-3 text-stone-400" />
                    {player.battery ?? 0}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-stone-600">
                    <Droplets className="w-3 h-3 text-stone-400" />
                    {player.water ?? 0}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-stone-600">
                    <Gem className="w-3 h-3 text-stone-400" />
                    {player.materials ?? 0}
                  </span>
                </div>
              </div>
              {idx < playerOrder.length - 1 && <div className="h-px bg-stone-100 mx-2" />}
            </div>
          );
        })}

        {onEndTurn && (
          <div className="pt-2 pb-1.5 px-1">
            <button
              onClick={onEndTurn}
              className="w-full py-3 rounded-full text-sm font-extrabold text-white hover:bg-stone-800 active:scale-[0.98] transition-all bg-[#1a1a1a]"
            >
              End Turn
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-[10px] font-bold text-white/80 uppercase tracking-widest">
        Round {round} · Turn {activeIndex + 1} / {playerOrder.length}
      </div>
    </div>
  );
};
