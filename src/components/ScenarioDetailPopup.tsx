import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, ArrowUpCircle, Zap, Battery, Droplets, Gem, ArrowRight } from 'lucide-react';
import { Scenario, TileState, Player, PlanChoice } from '../types';
import { cn } from '../lib/utils';

interface ScenarioDetailPopupProps {
  scenario: Scenario;
  tileState: TileState | undefined;
  activePlayer: Player;
  publicPower: number;
  publicWater: number;
  publicMaterials: number;
  unlockNotice?: string | null;
  onClose: () => void;
  onUnlock?: (id: number, plan?: PlanChoice) => void;
  onConfirmContribution?: (amount: { battery: number; water: number }) => void;
}

export const ScenarioDetailPopup: React.FC<ScenarioDetailPopupProps> = ({
  scenario,
  tileState,
  activePlayer,
  publicPower,
  publicWater,
  publicMaterials,
  unlockNotice,
  onClose,
  onUnlock,
  onConfirmContribution,
}) => {
  const [expandedContribute, setExpandedContribute] = useState(false);
  const [unlockPlan, setUnlockPlan] = useState<PlanChoice>('A');
  const [batteryAmount, setBatteryAmount] = useState(0);
  const [waterAmount, setWaterAmount] = useState(0);

  const isLocked = tileState?.status === 'locked';
  const isRed = tileState?.status === 'red';
  const isGreen = tileState?.status === 'green';
  const isDualPath = Boolean(scenario.dual_path);
  const lockedPlanStats = scenario.dual_path
    ? (unlockPlan === 'B' ? scenario.dual_path.planB.game_stats : scenario.dual_path.planA.game_stats)
    : scenario.game_stats;
  const activeStats = scenario.dual_path
    ? (tileState?.selectedPlan === 'B' ? scenario.dual_path.planB.game_stats : scenario.dual_path.planA.game_stats)
    : scenario.game_stats;
  const activeRisk = scenario.dual_path
    ? (tileState?.selectedPlan === 'B' ? scenario.dual_path.planB.risk : scenario.dual_path.planA.risk)
    : 'None';
  const getRiskText = (risk: string) =>
    risk === 'None'
      ? 'Risk: none'
      : 'Risk: a possible crisis event may happen';
  const rc = lockedPlanStats.deployment_cost;
  const canUnlock = isLocked &&
    activePlayer.battery >= rc.battery &&
    activePlayer.water >= rc.water &&
    activePlayer.materials >= rc.rare_materials &&
    publicPower >= rc.battery &&
    publicWater >= rc.water &&
    publicMaterials >= rc.rare_materials;

  const contributionEntries = tileState ? Object.values(tileState.contributions) as { battery: number; water: number }[] : [];
  const totalContributedBattery = contributionEntries.reduce((sum, item) => sum + item.battery, 0);
  const totalContributedWater = contributionEntries.reduce((sum, item) => sum + item.water, 0);
  const remainingBattery = Math.max(0, activeStats.green_upgrade_cost.battery - totalContributedBattery);
  const remainingWater = Math.max(0, activeStats.green_upgrade_cost.water - totalContributedWater);
  const progressPctBattery =
    activeStats.green_upgrade_cost.battery === 0
      ? 100
      : Math.min(100, (totalContributedBattery / activeStats.green_upgrade_cost.battery) * 100);
  const progressPctWater =
    activeStats.green_upgrade_cost.water === 0
      ? 100
      : Math.min(100, (totalContributedWater / activeStats.green_upgrade_cost.water) * 100);
  const progressPct = Math.min(progressPctBattery, progressPctWater);
  const maxBattery = Math.min(activePlayer.battery, publicPower, remainingBattery);
  const maxWater = Math.min(activePlayer.water, publicWater, remainingWater);

  const handleConfirm = () => {
    if ((batteryAmount <= 0 && waterAmount <= 0) || !onConfirmContribution) return;
    onConfirmContribution({ battery: batteryAmount, water: waterAmount });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.18)] bg-[#f5f1ec] border border-white/60"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#f8f6f3] border-b border-stone-200/70">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Scenario</p>
            <div className="mt-0.5 flex items-center gap-2.5">
              <h3 className="text-xl font-black text-stone-900 tracking-tight">{scenario.name}</h3>
              {(isRed || isGreen) && (
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide',
                    isGreen ? 'bg-[#e3f2cc] text-[#2f4a00]' : 'bg-[#ffe8d8] text-[#9a3412]'
                  )}
                >
                  Current: {isGreen ? 'Green AI' : 'Red AI'}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-stone-100 border border-stone-200 transition-colors"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        {/* Two-panel body */}
        {!(isRed && expandedContribute) && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT – Red AI Problem */}
          <div className="flex flex-col p-5 gap-2 bg-[#fff1e6] border-b md:border-b-0 md:border-r border-[#f0d8c6]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#ef702e] text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-extrabold text-stone-600 uppercase tracking-widest">Red AI Problem</span>
            </div>
            <p className="font-extrabold text-stone-900 text-sm leading-snug">
              {scenario.red_ai_status.problem}
            </p>
            <p className="text-stone-600 text-xs leading-relaxed">
              {scenario.red_ai_status.description}
            </p>
            <p className="text-stone-400 text-[11px] italic leading-relaxed">
              {scenario.red_ai_status.eco_impact_fact}
            </p>
            {(isRed || isGreen) && (
              <div className="mt-auto pt-2.5 border-t border-[#f0d8c6]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Per round Upkeep Cost</p>
                <div className="rounded-lg bg-[#ef702e]/10 px-2 py-1.5">
                  <p className="text-xs font-extrabold text-stone-800">
                    battery {activeStats.ai_operating_consumption_per_round.standard_ai.battery} / water {activeStats.ai_operating_consumption_per_round.standard_ai.water}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT – Green Transformation */}
          <div className="flex flex-col p-5 gap-2 bg-[#edf7de]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center shrink-0">
                <ArrowUpCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-extrabold text-stone-600 uppercase tracking-widest">Green Transformation</span>
            </div>
            <p className="font-extrabold text-stone-900 text-sm leading-snug">
              {scenario.green_transformation.title}
            </p>
            <p className="text-stone-600 text-xs leading-relaxed">
              {scenario.green_transformation.effect_desc}
            </p>
            <p className="text-stone-400 text-[11px] italic leading-relaxed">
              {scenario.green_transformation.strategy_tip}
            </p>
            {(isRed || isGreen) && (
              <div className="mt-auto pt-2.5 border-t border-[#c8e8b0]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Per round Upkeep Cost</p>
                <div className="rounded-lg bg-[#4abe6a]/10 px-2 py-1.5">
                  <p className="text-xs font-extrabold text-stone-800">
                    battery {activeStats.ai_operating_consumption_per_round.green_ai.battery} / water {activeStats.ai_operating_consumption_per_round.green_ai.water}
                  </p>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
        )}

        {/* Footer CTA */}
        <div className="px-5 py-4 bg-[#f8f6f3] space-y-2.5 border-t border-stone-200/70">
          {isLocked && onUnlock && (
            <div className="space-y-2.5">
              {isDualPath && (
                <div className="rounded-2xl border border-stone-200 bg-white p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Choose deployment plan (cannot change after unlock)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setUnlockPlan('A')}
                      className="rounded-xl border px-3 py-2 text-left transition-colors"
                      style={{
                        borderColor: unlockPlan === 'A' ? '#1a1a1a' : '#d6d3d1',
                        backgroundColor: unlockPlan === 'A' ? '#f5f5f4' : '#ffffff',
                      }}
                    >
                      <div className="text-xs font-extrabold text-stone-900">{scenario.dual_path?.planA.title}</div>
                      <div className="mt-1 text-[11px] text-stone-600 leading-relaxed">
                        {scenario.dual_path?.planA.description}
                      </div>
                      <div className="mt-1 text-[11px] text-stone-500">
                        Upkeep battery {scenario.dual_path?.planA.game_stats.ai_operating_consumption_per_round.standard_ai.battery} / water {scenario.dual_path?.planA.game_stats.ai_operating_consumption_per_round.standard_ai.water}
                      </div>
                      <div className="mt-1 text-[11px] text-[#b45309]">{getRiskText(scenario.dual_path?.planA.risk || 'None')}</div>
                    </button>
                    <button
                      onClick={() => setUnlockPlan('B')}
                      className="rounded-xl border px-3 py-2 text-left transition-colors"
                      style={{
                        borderColor: unlockPlan === 'B' ? '#1a1a1a' : '#d6d3d1',
                        backgroundColor: unlockPlan === 'B' ? '#f5f5f4' : '#ffffff',
                      }}
                    >
                      <div className="text-xs font-extrabold text-stone-900">{scenario.dual_path?.planB.title}</div>
                      <div className="mt-1 text-[11px] text-stone-600 leading-relaxed">
                        {scenario.dual_path?.planB.description}
                      </div>
                      <div className="mt-1 text-[11px] text-stone-500">
                        Upkeep battery {scenario.dual_path?.planB.game_stats.ai_operating_consumption_per_round.standard_ai.battery} / water {scenario.dual_path?.planB.game_stats.ai_operating_consumption_per_round.standard_ai.water}
                      </div>
                      <div className="mt-1 text-[11px] text-emerald-700">{getRiskText(scenario.dual_path?.planB.risk || 'None')}</div>
                    </button>
                  </div>
                </div>
              )}
            <button
              onClick={() => onUnlock(scenario.id, isDualPath ? unlockPlan : undefined)}
              className="w-full py-3.5 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 transition-all hover:bg-stone-800 active:scale-[0.98] text-white bg-[#1a1a1a]"
            >
              <Zap className="w-4 h-4" />
              <span>Unlock —</span>
              <span className="flex items-center gap-1.5">
                <span className="flex items-center gap-0.5 bg-white/10 px-1.5 py-0.5 rounded-md">
                  <Battery className="w-4 h-4" />
                  {rc.battery}
                </span>
                <span className="flex items-center gap-0.5 bg-white/10 px-1.5 py-0.5 rounded-md">
                  <Droplets className="w-4 h-4" />
                  {rc.water}
                </span>
                <span className="flex items-center gap-0.5 bg-white/10 px-1.5 py-0.5 rounded-md">
                  <Gem className="w-4 h-4" />
                  {rc.rare_materials}
                </span>
              </span>
            </button>
            {unlockNotice && (
              <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                {unlockNotice}
              </div>
            )}
            </div>
          )}
          {(isRed || isGreen) && (
            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <div className="space-y-2.5 text-sm">
                {isDualPath && (
                  <div className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Selected plan</span>
                    <span className="text-sm font-extrabold text-stone-900">
                      Plan {tileState?.selectedPlan || 'A'}
                      <span className="mx-1 text-stone-400">·</span>
                      <span className="text-stone-700">{getRiskText(activeRisk)}</span>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Green upgrade required</span>
                  <span className="text-sm font-extrabold text-stone-900">
                    battery {activeStats.green_upgrade_cost.battery} / water {activeStats.green_upgrade_cost.water}
                  </span>
                </div>
              </div>
            </div>
          )}
          {isRed && !expandedContribute && onConfirmContribution && (
            <button
              onClick={() => setExpandedContribute(true)}
              className="w-full py-3.5 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 transition-all hover:bg-stone-200 active:scale-[0.98] text-stone-900 bg-white border border-stone-300"
            >
              <Battery className="w-4 h-4" />
              Contribute to Upgrade
            </button>
          )}
          {isLocked && !canUnlock && (
            <div className="text-xs font-semibold text-stone-500">
              Resource not enough yet, but you can still click unlock.
            </div>
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
              className="overflow-hidden border-t border-stone-200/70"
            >
              <div className="px-5 py-4 space-y-3 bg-[#f8f6f3]">

                {/* Progress */}
                <div className="rounded-2xl bg-white border border-stone-200 px-4 py-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Upgrade progress</span>
                    <div className="flex items-center gap-3 text-xs font-extrabold text-stone-700">
                      <span className="flex items-center gap-1">
                        <Battery className="w-3 h-3 text-stone-400" />
                        {totalContributedBattery}<span className="text-stone-300 font-normal">/{activeStats.green_upgrade_cost.battery}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-stone-400" />
                        {totalContributedWater}<span className="text-stone-300 font-normal">/{activeStats.green_upgrade_cost.water}</span>
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.4 }}
                      className="h-full rounded-full bg-[#1a1a1a]"
                    />
                  </div>
                </div>

                {/* Sliders */}
                <div className="rounded-2xl bg-white border border-stone-200 px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Your contribution</span>
                    <span className="text-xs font-bold text-stone-500">
                      available: battery {activePlayer.battery} · water {activePlayer.water}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                        <Battery className="w-3 h-3" /> Battery
                      </span>
                      <span className="text-sm font-extrabold text-stone-900 tabular-nums">{batteryAmount}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={maxBattery}
                      value={batteryAmount}
                      onChange={(e) => setBatteryAmount(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-stone-100"
                      style={{ accentColor: '#1a1a1a' }}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                        <Droplets className="w-3 h-3" /> Water
                      </span>
                      <span className="text-sm font-extrabold text-stone-900 tabular-nums">{waterAmount}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={maxWater}
                      value={waterAmount}
                      onChange={(e) => setWaterAmount(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-stone-100"
                      style={{ accentColor: '#1a1a1a' }}
                    />
                  </div>
                </div>

                {/* Confirm */}
                <button
                  disabled={batteryAmount <= 0 && waterAmount <= 0}
                  onClick={handleConfirm}
                  className="w-full py-3.5 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] group disabled:opacity-40 disabled:cursor-not-allowed"
                  style={
                    batteryAmount > 0 || waterAmount > 0
                      ? { backgroundColor: '#1a1a1a', color: '#ffffff' }
                      : { backgroundColor: '#eae7e3', color: '#b5b0a8' }
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
