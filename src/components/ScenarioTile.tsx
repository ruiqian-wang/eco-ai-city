import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Leaf, X } from 'lucide-react';
import { Scenario, TileState } from '../types';
import { cn } from '../lib/utils';

interface ScenarioTileProps {
  scenario: Scenario;
  state: TileState;
  isCurrentPlayer?: boolean;
  canClose?: boolean;
  onScenarioClick?: (id: number) => void;
  onPick?: (id: number) => void;
  onCloseClick?: (id: number) => void;
}

export const ScenarioTile: React.FC<ScenarioTileProps> = ({
  scenario,
  state,
  isCurrentPlayer,
  canClose,
  onScenarioClick,
  onCloseClick,
}) => {
  const totalContributed = (Object.values(state.contributions) as number[]).reduce((a, b) => a + b, 0);
  const progress = Math.min(100, (totalContributed / scenario.game_stats.upgrade_cost) * 100);

  const baseCard = "relative w-full h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-200";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        baseCard,
        state.status === 'locked' && "bg-white shadow-md",
        state.status === 'red'    && "bg-white shadow-md ring-2 ring-[#EF702E]/40",
        state.status === 'green'  && "shadow-md ring-2 ring-[#BDDF4D]/70",
        state.status === 'closed' && "bg-stone-600 shadow-inner opacity-55"
      )}
      style={state.status === 'green' ? { backgroundColor: '#E4EFA6' } : undefined}
      onClick={() => onScenarioClick?.(scenario.id)}
    >
      <AnimatePresence mode="wait">

        {/* ── LOCKED ── */}
        {state.status === 'locked' && (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2"
          >
            <div className="text-[10px] font-bold text-center text-stone-700 leading-tight px-1">
              {scenario.name}
            </div>
            <div
              className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-white text-[9px] font-bold"
              style={{ backgroundColor: '#EF702E' }}
            >
              <Zap className="w-2.5 h-2.5" />
              {scenario.game_stats.startup_cost}
            </div>
          </motion.div>
        )}

        {/* ── RED (active, draining) ── */}
        {state.status === 'red' && (
          <motion.div
            key="red"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col p-2.5"
          >
            <div className="flex justify-between items-start">
              <div className="text-[10px] font-bold text-stone-800 leading-tight flex-1 pr-1">
                {scenario.name}
              </div>
              <div className="flex gap-1 shrink-0 items-center">
                {canClose && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onCloseClick?.(scenario.id); }}
                    className="p-0.5 rounded hover:opacity-70 transition-opacity"
                    style={{ color: '#EF702E' }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                >
                  <Zap className="w-3.5 h-3.5" style={{ color: '#EF702E', fill: '#EF702E' }} />
                </motion.div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex justify-between text-[9px] font-semibold mb-1" style={{ color: '#EF702E' }}>
                <span>Fee: {scenario.game_stats.maintenance_fee}⚡</span>
                <span>{totalContributed}/{scenario.game_stats.upgrade_cost}🔋</span>
              </div>
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: '#BDDF4D' }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── GREEN (upgraded) ── */}
        {state.status === 'green' && (
          <motion.div
            key="green"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col p-2.5"
          >
            <div className="flex justify-between items-start">
              <div className="text-[10px] font-bold text-stone-800 leading-tight flex-1 pr-1">
                {scenario.name}
              </div>
              <Leaf className="w-3.5 h-3.5 shrink-0" style={{ color: '#BDDF4D', fill: '#BDDF4D' }} />
            </div>
            <div className="mt-auto">
              <div className="flex justify-between text-[9px] font-semibold" style={{ color: '#7aad00' }}>
                <span>Green AI ✓</span>
                {scenario.green_transformation.green_benefit !== 0 && (
                  <span className="font-extrabold">
                    {scenario.green_transformation.green_benefit > 0 ? '+' : ''}
                    {scenario.green_transformation.green_benefit}⚡
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CLOSED ── */}
        {state.status === 'closed' && (
          <motion.div
            key="closed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-2"
          >
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-0.5">
              Closed
            </div>
            <div className="text-[10px] font-bold text-white/60 text-center leading-tight">
              {scenario.name}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
};
