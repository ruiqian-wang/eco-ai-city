import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, ArrowUpCircle, Zap, Battery, ArrowRight } from 'lucide-react';
import { Scenario, TileState, Player } from '../types';

interface ScenarioDetailPopupProps {
  scenario: Scenario;
  tileState: TileState | undefined;
  publicEnergy: number;
  player: Player;
  onClose: () => void;
  onUnlock?: (id: number) => void;
  onConfirmContribution?: (amount: number) => void;
}

export const ScenarioDetailPopup: React.FC<ScenarioDetailPopupProps> = ({
  scenario,
  tileState,
  publicEnergy,
  player,
  onClose,
  onUnlock,
  onConfirmContribution,
}) => {
  const [expandedContribute, setExpandedContribute] = useState(false);
  const [amount, setAmount] = useState(0);

  const isLocked = tileState?.status === 'locked';
  const isRed = tileState?.status === 'red';
  const canUnlock = isLocked && publicEnergy >= scenario.game_stats.startup_cost;

  const totalContributed = tileState
    ? (Object.values(tileState.contributions) as number[]).reduce((a, b) => a + b, 0)
    : 0;
  const remaining = Math.max(0, scenario.game_stats.upgrade_cost - totalContributed);
  const progressPct = Math.min(100, (totalContributed / scenario.game_stats.upgrade_cost) * 100);
  const max = Math.min(player.batteries, remaining);

  const handleConfirm = () => {
    if (amount <= 0 || !onConfirmContribution) return;
    onConfirmContribution(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl bg-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-xl font-extrabold text-stone-900">{scenario.name}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        {/* Two-panel body */}
        <div className="grid grid-cols-2" style={{ minHeight: 300 }}>
          {/* LEFT – Red AI Problem */}
          <div className="flex flex-col p-6 gap-3" style={{ backgroundColor: '#EF702E' }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-white/90 shrink-0" strokeWidth={2.5} />
              <span className="text-xs font-extrabold text-white uppercase tracking-widest">Red AI Problem</span>
            </div>
            <p className="font-extrabold text-white text-sm leading-snug">
              {scenario.red_ai_status.problem}
            </p>
            <p className="text-white/90 text-xs leading-relaxed">
              {scenario.red_ai_status.description}
            </p>
            <p className="text-white/80 text-xs italic leading-relaxed mt-auto">
              {scenario.red_ai_status.eco_impact_fact}
            </p>
          </div>

          {/* RIGHT – Green Transformation */}
          <div className="flex flex-col p-6 gap-3" style={{ backgroundColor: '#BDDF4D' }}>
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-stone-800/80 shrink-0" strokeWidth={2.5} />
              <span className="text-xs font-extrabold text-stone-800 uppercase tracking-widest">Green Transformation</span>
            </div>
            <p className="font-extrabold text-stone-900 text-sm leading-snug">
              {scenario.green_transformation.title}
            </p>
            <p className="text-stone-800/90 text-xs leading-relaxed">
              {scenario.green_transformation.effect_desc}
            </p>
            <p className="text-stone-700 text-xs italic leading-relaxed mt-auto">
              {scenario.green_transformation.strategy_tip}
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 bg-white space-y-2">
          {isLocked && onUnlock && (
            <button
              disabled={!canUnlock}
              onClick={() => onUnlock(scenario.id)}
              className="w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white"
              style={{ backgroundColor: '#EF702E' }}
            >
              <Zap className="w-4 h-4" />
              Unlock Scenario — {scenario.game_stats.startup_cost} ⚡
            </button>
          )}
          {isRed && !expandedContribute && onConfirmContribution && (
            <button
              onClick={() => setExpandedContribute(true)}
              className="w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] text-stone-900"
              style={{ backgroundColor: '#BDDF4D' }}
            >
              <Battery className="w-4 h-4" />
              Contribute to Upgrade
            </button>
          )}
        </div>

        {/* Expanded: Progress + Your Contribution + Confirm */}
        <AnimatePresence>
          {isRed && expandedContribute && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-stone-100"
            >
              <div className="px-6 py-5 space-y-5 bg-stone-50/80">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-stone-500">Progress</span>
                    <span className="text-sm font-extrabold text-stone-900">
                      {totalContributed} / {scenario.game_stats.upgrade_cost} 🔋
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.4 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: '#BDDF4D' }}
                    />
                  </div>
                </div>

                {/* Your Contribution */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-stone-900">Your Contribution</span>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-stone-700"
                      style={{ backgroundColor: '#E4EFA6' }}
                    >
                      <Battery className="w-3.5 h-3.5" />
                      {player.batteries} available
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={max}
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-stone-200"
                    style={{ accentColor: '#BDDF4D' }}
                  />
                  <div className="flex justify-center">
                    <span className="text-4xl font-extrabold tabular-nums" style={{ color: '#BDDF4D' }}>
                      {amount}
                    </span>
                  </div>
                </div>

                {/* Confirm */}
                <button
                  disabled={amount <= 0}
                  onClick={handleConfirm}
                  className="w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] group disabled:opacity-40 disabled:cursor-not-allowed"
                  style={
                    amount > 0
                      ? { backgroundColor: '#BDDF4D', color: '#1a1a1a' }
                      : { backgroundColor: '#e5e7eb', color: '#9ca3af' }
                  }
                >
                  Confirm Contribution
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
