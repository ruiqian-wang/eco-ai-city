import React from 'react';
import { motion } from 'motion/react';
import { Battery, User } from 'lucide-react';
import { Player } from '../types';
import { INITIAL_ENERGY } from '../constants';
import { cn } from '../lib/utils';

interface ResourceHUDProps {
  energy: number;
  players: Record<string, Player>;
  currentPlayerId: string;
  activePlayerId: string;
  playerOrder: string[];
  round: number;
}

export const ResourceHUD: React.FC<ResourceHUDProps> = ({
  energy,
  players,
  currentPlayerId,
  activePlayerId,
  playerOrder,
  round,
}) => {
  const energyPercent = Math.max(0, Math.min(100, (energy / INITIAL_ENERGY) * 100));
  const isLowEnergy = energyPercent < 20;
  const activeIndex = playerOrder.indexOf(activePlayerId);

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Public Power Pool */}
      <div className="flex items-center gap-3 px-1">
        <img src="/power.png" alt="Power" className="w-16 h-16 object-contain shrink-0 drop-shadow" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-bold text-stone-500">Public Power</span>
            <span className="text-2xl font-extrabold text-stone-900">{energy}</span>
          </div>
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{
                width: `${energyPercent}%`,
                backgroundColor: isLowEnergy ? '#EF702E' : '#BDDF4D',
              }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Player Status card */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-sm"
        style={{ backgroundColor: '#E4EFA6' }}
      >
        {/* status.svg decorative background */}
        <img
          src="/status.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          aria-hidden
        />

        <div className="relative z-10 p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-extrabold text-stone-800">Player Status</span>
            <span
              className="text-[10px] font-bold text-white rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: '#EF702E' }}
            >
              Turn {activeIndex + 1} / {playerOrder.length}
            </span>
          </div>

          {/* Player rows */}
          <div className="space-y-2">
            {playerOrder.map((pid) => {
              const player = players[pid];
              if (!player) return null;
              const isActive = pid === activePlayerId;
              const isMe = pid === currentPlayerId;

              return (
                <motion.div
                  key={pid}
                  animate={{ opacity: isActive ? 1 : 0.85 }}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-2xl border-2 bg-white',
                    isActive ? 'border-[#EF702E]' : 'border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: '#93C5FD' }}
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 truncate max-w-[110px]">
                        {player.name}{isMe ? ' (You)' : ''}
                      </div>
                      <div className="text-[9px] font-medium" style={{ color: isActive ? '#EF702E' : '#a8a29e' }}>
                        {isActive ? 'Acting now' : 'Waiting'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl" style={{ backgroundColor: '#E4EFA6' }}>
                    <Battery className="w-3 h-3 text-stone-500" />
                    <span className="text-xs font-extrabold text-stone-800">{player.batteries}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Round indicator */}
          <div className="mt-4 text-center text-[10px] font-bold text-stone-500 uppercase tracking-widest">
            Round {round}
          </div>
        </div>
      </div>
    </div>
  );
};
