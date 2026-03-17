import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, ArrowUpCircle, Zap, Battery, Droplets, Gem, ArrowRight } from 'lucide-react';
import { Scenario, TileState, Player } from '../types';

interface ScenarioDetailPopupProps {
  scenario: Scenario;
  tileState: TileState | undefined;
  activePlayer: Player;
  publicPower: number;
  publicWater: number;
  publicMaterials: number;
  onClose: () => void;
  onUnlock?: (id: number) => void;
  onConfirmContribution?: (amount: { battery: number; water: number }) => void;
}

export const ScenarioDetailPopup: React.FC<ScenarioDetailPopupProps> = ({
  scenario,
  tileState,
  activePlayer,
  publicPower,
  publicWater,
  publicMaterials,
  onClose,
  onUnlock,
  onConfirmContribution,
}) => {
  const [expandedContribute, setExpandedContribute] = useState(false);
  const [batteryAmount, setBatteryAmount] = useState(0);
  const [waterAmount, setWaterAmount] = useState(0);

  const isLocked = tileState?.status === 'locked';
  const isRed = tileState?.status === 'red';
  const isGreen = tileState?.status === 'green';
  const rc = scenario.game_stats.deployment_cost;
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
  const remainingBattery = Math.max(0, scenario.game_stats.green_upgrade_cost.battery - totalContributedBattery);
  const remainingWater = Math.max(0, scenario.game_stats.green_upgrade_cost.water - totalContributedWater);
  const progressPctBattery =
    scenario.game_stats.green_upgrade_cost.battery === 0
      ? 100
      : Math.min(100, (totalContributedBattery / scenario.game_stats.green_upgrade_cost.battery) * 100);
  const progressPctWater =
    scenario.game_stats.green_upgrade_cost.water === 0
      ? 100
      : Math.min(100, (totalContributedWater / scenario.game_stats.green_upgrade_cost.water) * 100);
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
              onClick={() => onUnlock(scenario.id)}
              className="w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] text-white"
              style={{ backgroundColor: '#EF702E' }}
            >
              <Zap className="w-4 h-4" />
              <span>Unlock —</span>
              <span className="flex items-center gap-2">
                <span className="flex items-center gap-0.5">
                  <Battery className="w-4 h-4" />
                  {rc.battery}
                </span>
                <span className="flex items-center gap-0.5">
                  <Droplets className="w-4 h-4" />
                  {rc.water}
                </span>
                <span className="flex items-center gap-0.5">
                  <Gem className="w-4 h-4" />
                  {rc.rare_materials}
                </span>
              </span>
            </button>
          )}
          {(isRed || isGreen) && (
            <div className="rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-700 space-y-1">
              <div className="font-bold">
                Per round consumption:
                <span className="ml-2">
                  Standard B {scenario.game_stats.ai_operating_consumption_per_round.standard_ai.battery} / W {scenario.game_stats.ai_operating_consumption_per_round.standard_ai.water},
                  Green B {scenario.game_stats.ai_operating_consumption_per_round.green_ai.battery} / W {scenario.game_stats.ai_operating_consumption_per_round.green_ai.water}
                </span>
              </div>
              <div className="font-bold">
                Green upgrade required:
                <span className="ml-2">B {scenario.game_stats.green_upgrade_cost.battery} / W {scenario.game_stats.green_upgrade_cost.water}</span>
              </div>
            </div>
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
              className="overflow-hidden border-t border-stone-100"
            >
              <div className="px-6 py-5 space-y-5 bg-stone-50/80">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-stone-500">Progress</span>
                    <span className="text-sm font-extrabold text-stone-900">
                      B {totalContributedBattery}/{scenario.game_stats.green_upgrade_cost.battery} · W {totalContributedWater}/{scenario.game_stats.green_upgrade_cost.water}
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
                    <span className="text-sm font-extrabold text-stone-900">Your contribution</span>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-stone-700"
                      style={{ backgroundColor: '#E4EFA6' }}
                    >
                      <Battery className="w-3.5 h-3.5" />
                      B {activePlayer.battery} · W {activePlayer.water}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-stone-600">Battery</div>
                  <input
                    type="range"
                    min={0}
                    max={maxBattery}
                    value={batteryAmount}
                    onChange={(e) => setBatteryAmount(parseInt(e.target.value, 10))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-stone-200"
                    style={{ accentColor: '#BDDF4D' }}
                  />
                  <div className="text-xs font-bold text-stone-600">Water</div>
                  <input
                    type="range"
                    min={0}
                    max={maxWater}
                    value={waterAmount}
                    onChange={(e) => setWaterAmount(parseInt(e.target.value, 10))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-stone-200"
                    style={{ accentColor: '#60A5FA' }}
                  />
                  <div className="flex justify-center gap-6">
                    <span className="text-3xl font-extrabold tabular-nums" style={{ color: '#BDDF4D' }}>
                      B {batteryAmount}
                    </span>
                    <span className="text-3xl font-extrabold tabular-nums text-sky-500">
                      W {waterAmount}
                    </span>
                  </div>
                </div>

                {/* Confirm */}
                <button
                  disabled={batteryAmount <= 0 && waterAmount <= 0}
                  onClick={handleConfirm}
                  className="w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] group disabled:opacity-40 disabled:cursor-not-allowed"
                  style={
                    batteryAmount > 0 || waterAmount > 0
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
