import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Battery, ArrowRight } from 'lucide-react';
import { Scenario, Player, TileState } from '../types';

interface UpgradeDialogProps {
  scenario: Scenario;
  tileState: TileState;
  player: Player;
  onClose: () => void;
  onContribute: (amount: number) => void;
}

export const UpgradeDialog: React.FC<UpgradeDialogProps> = ({
  scenario,
  tileState,
  player,
  onClose,
  onContribute,
}) => {
  const [amount, setAmount] = useState(0);
  const totalContributed = (Object.values(tileState.contributions) as number[]).reduce((a, b) => a + b, 0);
  const remaining = Math.max(0, scenario.game_stats.upgrade_cost - totalContributed);
  const progressPct = Math.min(100, (totalContributed / scenario.game_stats.upgrade_cost) * 100);
  const max = Math.min(player.batteries, remaining);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 16 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between border-b border-stone-100">
          <div>
            <h3 className="text-xl font-extrabold text-stone-900">{scenario.name}</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 mt-0.5">
              Crowdfunding Upgrade
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors shrink-0 mt-0.5"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Red AI quote */}
          <div
            className="rounded-2xl p-4 text-xs italic leading-relaxed"
            style={{ backgroundColor: '#FFF0EB', color: '#C0442A', borderLeft: '3px solid #EF702E' }}
          >
            "{scenario.red_ai_status.description}"
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-stone-500">Progress</span>
              <span className="text-sm font-extrabold text-stone-900">
                {totalContributed} / {scenario.game_stats.upgrade_cost}{' '}
                <span className="text-base">🔋</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: '#BDDF4D' }}
              />
            </div>
          </div>

          {/* Contribution slider */}
          <div className="space-y-4">
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
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#BDDF4D', backgroundColor: '#E4EFA6' }}
            />

            <div className="flex justify-center">
              <span
                className="text-5xl font-extrabold tabular-nums"
                style={{ color: '#BDDF4D' }}
              >
                {amount}
              </span>
            </div>
          </div>

          {/* Confirm */}
          <button
            disabled={amount <= 0}
            onClick={() => { onContribute(amount); onClose(); }}
            className="w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] group"
            style={
              amount > 0
                ? { backgroundColor: '#BDDF4D', color: '#1a1a1a' }
                : { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }
            }
          >
            Confirm Contribution
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
