import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Zap, AlertTriangle, Trophy, User, Users } from 'lucide-react';
import { cn } from './lib/utils';
import { GameState, Player, TileState, PlanChoice, Scenario, CrisisCard } from './types';
import { SCENARIOS, INITIAL_MATERIALS, INITIAL_POWER, INITIAL_WATER, WIN_UPGRADE_COUNT, PLAYER_ACTIONS, CRISIS_CARDS } from './constants';
import { ResourceHUD } from './components/ResourceHUD';
import { ScenarioDetailPopup } from './components/ScenarioDetailPopup';
import { v4 as uuidv4 } from 'uuid';

const AVATAR_COLOR = '#93C5FD';
const BOARD_SCENE_CONFIG = [
  { id: 1, image: '/canteen.png', className: 'top-[4%] left-[22%] w-[13%]' },
  { id: 8, image: '/teacher.png', className: 'top-[4%] left-[50%] w-[15%]' },
  { id: 7, image: '/library.png', className: 'top-[24%] left-[36%] w-[13%]' },
  { id: 4, image: '/classroom.png', className: 'top-[28%] left-[12%] w-[13%]' },
  { id: 3, image: '/health.png', className: 'top-[42%] left-[54%] w-[15%]' },
  { id: 5, image: '/garden.png', className: 'top-[52%] left-[28%] w-[16%]' },
  { id: 6, image: '/security.png', className: 'bottom-[4%] left-[10%] w-[13%]' },
  { id: 2, image: '/studio.png', className: 'bottom-[4%] left-[46%] w-[15%]' },
] as const;

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    publicPower: INITIAL_POWER,
    publicWater: INITIAL_WATER,
    publicMaterials: INITIAL_MATERIALS,
    players: {},
    playerOrder: [],
    currentPlayerIndex: 0,
    tiles: SCENARIOS.reduce((acc, s) => {
      acc[s.id] = { id: s.id, status: 'locked', contributions: {} };
      return acc;
    }, {} as Record<number, TileState>),
    round: 1,
    status: 'waiting',
    actionsRemaining: 1,
  });

  const [viewingScenarioId, setViewingScenarioId] = useState<number | null>(null);
  const [fadingUnlockIds, setFadingUnlockIds] = useState<number[]>([]);
  const [unlockNotice, setUnlockNotice] = useState<string | null>(null);
  const [activeCrisis, setActiveCrisis] = useState<CrisisCard | null>(null);
  const [joiningSlotIndex, setJoiningSlotIndex] = useState<number | null>(null);
  const [joinName, setJoinName] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const triggerLockFade = useCallback((tileId: number) => {
    setFadingUnlockIds(prev => (prev.includes(tileId) ? prev : [...prev, tileId]));
    window.setTimeout(() => {
      setFadingUnlockIds(prev => prev.filter(id => id !== tileId));
    }, 1800);
  }, []);

  const getStatsForTile = useCallback((scenario: Scenario, tile?: TileState) => {
    if (!scenario.dual_path) return scenario.game_stats;
    const plan = tile?.selectedPlan;
    if (plan === 'B') return scenario.dual_path.planB.game_stats;
    return scenario.dual_path.planA.game_stats;
  }, []);

  const sceneKeyByScenarioName: Record<string, CrisisCard['scene']> = {
    'Teacher Office': 'teacher_office',
    'Creative Studio': 'creative_studio',
    'Mental Health': 'mental_health',
  };

  const applyCrisisCost = useCallback((state: GameState, cost: { battery: number; water: number }): GameState => {
    return {
      ...state,
      publicPower: Math.max(0, state.publicPower - cost.battery),
      publicWater: Math.max(0, state.publicWater - cost.water),
    };
  }, []);

  const drawCrisisCard = useCallback((state: GameState): CrisisCard | null => {
    const eligibleScenes = new Set<CrisisCard['scene']>();
    for (const tile of Object.values(state.tiles) as TileState[]) {
      if (tile.status !== 'red' || tile.selectedPlan !== 'A') continue;
      const scenario = SCENARIOS.find(s => s.id === tile.id);
      if (!scenario?.dual_path) continue;
      const sceneKey = sceneKeyByScenarioName[scenario.name];
      if (sceneKey) eligibleScenes.add(sceneKey);
    }
    if (eligibleScenes.size === 0) return null;
    const pool = CRISIS_CARDS.filter(card => eligibleScenes.has(card.scene));
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const checkGameStatus = useCallback((state: GameState): GameState => {
    if (state.status !== 'playing') return state;

    if (state.publicPower <= 0 || state.publicWater <= 0 || state.publicMaterials <= 0) {
      return {
        ...state,
        status: 'lost',
        lossReason: "Resource Depletion: Power, water, or materials ran out."
      };
    }

    const tileList = Object.values(state.tiles) as TileState[];
    const upgradedCount = tileList.filter(t => t.status === 'green').length;
    if (upgradedCount >= WIN_UPGRADE_COUNT) {
      return { ...state, status: 'won' };
    }

    return state;
  }, []);

  const calculateResourceConsumption = useCallback((state: GameState): GameState => {
    let totalPower = 0;
    let totalWater = 0;

    const tileList = Object.values(state.tiles) as TileState[];
    tileList.forEach(tile => {
      const scenario = SCENARIOS.find(s => s.id === tile.id);
      if (!scenario) return;
      const stats = getStatsForTile(scenario, tile);

      if (tile.status === 'red') {
        totalPower += stats.ai_operating_consumption_per_round.standard_ai.battery;
        totalWater += stats.ai_operating_consumption_per_round.standard_ai.water;
      }
      if (tile.status === 'green') {
        totalPower += stats.ai_operating_consumption_per_round.green_ai.battery;
        totalWater += stats.ai_operating_consumption_per_round.green_ai.water;
      }
    });

    const consumedState = {
      ...state,
      publicPower: Math.max(0, state.publicPower - totalPower),
      publicWater: Math.max(0, state.publicWater - totalWater),
    };
    return checkGameStatus(consumedState);
  }, [checkGameStatus, getStatsForTile]);

  const handleJoin = (name: string) => {
    if (name.trim() && gameState.playerOrder.length < 6) {
      const playerId = uuidv4();
      const newPlayer: Player = {
        id: playerId,
        name: name.trim(),
        battery: 0,
        water: 0,
        materials: 0,
        color: AVATAR_COLOR,
        isReady: false,
        socketId: 'local',
      };
      setGameState(prev => ({
        ...prev,
        players: { ...prev.players, [playerId]: newPlayer },
        playerOrder: [...prev.playerOrder, playerId]
      }));
      setJoinName('');
      setJoiningSlotIndex(null);
    }
  };

  const handleRename = (playerId: string, newName: string) => {
    if (!newName.trim()) return;
    setGameState(prev => {
      const player = prev.players[playerId];
      if (!player) return prev;
      return {
        ...prev,
        players: { ...prev.players, [playerId]: { ...player, name: newName.trim() } }
      };
    });
    setEditingPlayerId(null);
    setEditingName('');
  };

  const handleStartGame = () => {
    const playerList = gameState.playerOrder.map(pid => gameState.players[pid]).filter(Boolean) as Player[];
    if (playerList.length >= 3) {
      const n = playerList.length;
      const perBattery = Math.floor(INITIAL_POWER / n);
      const perWater = Math.floor(INITIAL_WATER / n);
      const perMaterials = Math.floor(INITIAL_MATERIALS / n);
      const updatedPlayers = { ...gameState.players };
      playerList.forEach(p => {
        updatedPlayers[p.id] = {
          ...p,
          battery: perBattery,
          water: perWater,
          materials: perMaterials,
        };
      });
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        playerOrder: [...prev.playerOrder].sort(() => 0.5 - Math.random()),
        currentPlayerIndex: 0,
        actionsRemaining: 1,
        players: updatedPlayers,
      }));
    }
  };

  const handlePickTile = (tileId: number, planChoice?: PlanChoice): boolean => {
    const activePlayerId = gameState.playerOrder[gameState.currentPlayerIndex];
    if (gameState.status !== 'playing') return false;
    if (gameState.actionsRemaining <= 0) {
      setUnlockNotice('You can unlock only one scene per turn. Consider contribute to upgrade or end turn.');
      return false;
    }

    const tile = gameState.tiles[tileId];
    const scenario = SCENARIOS.find(s => s.id === tileId);
    const activePlayer = activePlayerId ? gameState.players[activePlayerId] : null;
    if (!tile || !scenario || tile.status !== 'locked' || !activePlayer) return false;

    if (scenario.dual_path && !planChoice) return false;
    const unlockStats = scenario.dual_path
      ? (planChoice === 'B' ? scenario.dual_path.planB.game_stats : scenario.dual_path.planA.game_stats)
      : scenario.game_stats;
    const costP = unlockStats.deployment_cost.battery;
    const costW = unlockStats.deployment_cost.water;
    const costM = unlockStats.deployment_cost.rare_materials;
    if (activePlayer.battery < costP || activePlayer.water < costW || activePlayer.materials < costM) return false;
    if (gameState.publicPower < costP || gameState.publicWater < costW || gameState.publicMaterials < costM) return false;

    setGameState(prev => {
      const p = prev.players[activePlayerId];
      if (!p || p.battery < costP || p.water < costW || p.materials < costM) return prev;
      const nextState = {
        ...prev,
        publicPower: prev.publicPower - costP,
        publicWater: prev.publicWater - costW,
        publicMaterials: prev.publicMaterials - costM,
        players: {
          ...prev.players,
          [activePlayerId]: {
            ...p,
            battery: p.battery - costP,
            water: p.water - costW,
            materials: p.materials - costM,
          },
        },
        tiles: {
          ...prev.tiles,
          [tileId]: { ...tile, status: 'red' as const, selectedPlan: scenario.dual_path ? (planChoice || 'A') : undefined }
        },
        actionsRemaining: prev.actionsRemaining - 1
      };
      return checkGameStatus(nextState);
    });
    triggerLockFade(tileId);
    return true;
  };

  const handleEndTurn = () => {
    if (gameState.status !== 'playing' || activeCrisis) return;

    const nextIndex = gameState.currentPlayerIndex + 1;
    if (nextIndex < gameState.playerOrder.length) {
      setGameState(prev => ({
        ...prev,
        currentPlayerIndex: prev.currentPlayerIndex + 1,
        actionsRemaining: 1,
      }));
      return;
    }

    const roundAdvancedState: GameState = {
      ...gameState,
      round: gameState.round + 1,
      currentPlayerIndex: 0,
      actionsRemaining: 1,
    };
    let nextState = calculateResourceConsumption(roundAdvancedState);
    const crisis = drawCrisisCard(nextState);
    if (crisis) {
      if (crisis.consequence_type === 'fixed' && crisis.cost) {
        nextState = checkGameStatus(applyCrisisCost(nextState, crisis.cost));
      }
      setActiveCrisis(crisis);
    }
    setGameState(nextState);
  };

  const handleResolveChoiceCrisis = (cost: { battery: number; water: number }) => {
    setGameState(prev => checkGameStatus(applyCrisisCost(prev, cost)));
    setActiveCrisis(null);
  };

  const handleAcknowledgeFixedCrisis = () => {
    setActiveCrisis(null);
  };

  const handleContribute = (tileId: number, amount: { battery: number; water: number }) => {
    if (gameState.status !== 'playing') return;
    const activePlayerId = gameState.playerOrder[gameState.currentPlayerIndex];
    const activePlayer = activePlayerId ? gameState.players[activePlayerId] : null;
    const tile = gameState.tiles[tileId];
    const scenario = SCENARIOS.find(s => s.id === tileId);
    const activeStats = scenario && tile ? getStatsForTile(scenario, tile) : null;

    if (!tile || !scenario || !activeStats || tile.status !== 'red' || !activePlayer) return;
    if (amount.battery <= 0 && amount.water <= 0) return;
    if (activePlayer.battery < amount.battery || activePlayer.water < amount.water) return;
    if (gameState.publicPower < amount.battery || gameState.publicWater < amount.water) return;

    setGameState(prev => {
      const p = prev.players[activePlayerId];
      if (!p || p.battery < amount.battery || p.water < amount.water) return prev;
      const updatedContributions = {
        ...tile.contributions,
        [activePlayerId]: {
          battery: (tile.contributions[activePlayerId]?.battery || 0) + amount.battery,
          water: (tile.contributions[activePlayerId]?.water || 0) + amount.water,
        }
      };
      const contributionEntries = Object.values(updatedContributions) as { battery: number; water: number }[];
      const totalBattery = contributionEntries.reduce((sum, c) => sum + c.battery, 0);
      const totalWater = contributionEntries.reduce((sum, c) => sum + c.water, 0);
      const nextStatus =
        totalBattery >= activeStats.green_upgrade_cost.battery &&
        totalWater >= activeStats.green_upgrade_cost.water
          ? 'green'
          : 'red';

      return checkGameStatus({
        ...prev,
        publicPower: prev.publicPower - amount.battery,
        publicWater: prev.publicWater - amount.water,
        players: {
          ...prev.players,
          [activePlayerId]: {
            ...p,
            battery: p.battery - amount.battery,
            water: p.water - amount.water,
          },
        },
        tiles: {
          ...prev.tiles,
          [tileId]: { ...tile, status: nextStatus, contributions: updatedContributions }
        }
      });
    });
  };

  const activePlayerId = gameState.playerOrder[gameState.currentPlayerIndex];
  const currentPlayer = activePlayerId ? gameState.players[activePlayerId] : null;
  const players = Object.values(gameState.players) as Player[];

  const playerOrderInWaiting = gameState.playerOrder;
  const playersInLobby = playerOrderInWaiting.map(pid => gameState.players[pid]).filter(Boolean) as Player[];

  if (gameState.status === 'waiting') {
    const canStart = playersInLobby.length >= 3;

    return (
      <div className="min-h-screen font-sans relative overflow-hidden" style={{ backgroundColor: '#f5f1ec' }}>

        {/* Hero section */}
        <div className="relative pt-12 pb-8 px-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-4">Welcome to</p>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black text-stone-900 leading-[1.05] tracking-tight">
            Eco-AI<br />Campus
          </h1>
          <p className="mt-4 text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
            Build sustainable AI for your campus.
            <br />
            Collaborate with others to go green.
          </p>

          {/* Floating accent badges */}
          <div className="absolute top-8 right-[8%] bg-[#1a1a1a] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl rotate-6 shadow-lg select-none">{playersInLobby.length}/6</div>
          <div className="absolute top-24 left-[6%] bg-[#4abe6a] text-white text-[10px] font-extrabold px-4 py-2 rounded-full -rotate-12 shadow-md select-none">GREEN AI</div>
          <div className="absolute top-16 right-[16%] bg-[#f18a47] text-white text-[10px] font-extrabold px-4 py-2 rounded-full rotate-3 shadow-md select-none">DEPLOY</div>
          <div className="hidden md:block absolute top-36 left-[12%] bg-[#ffd43b] text-stone-900 text-[10px] font-extrabold px-4 py-2 rounded-xl rotate-6 shadow-md select-none">UPGRADE</div>
        </div>

        {/* Main content */}
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-5 items-center">

            {/* Player card */}
            <div className="bg-white rounded-[28px] shadow-[0_4px_40px_rgba(0,0,0,0.06)] overflow-hidden">

            {/* Player Slots */}
            <div className="px-6 pt-6 pb-2 space-y-2">
              {Array.from({ length: 6 }, (_, i) => {
                const pid = playerOrderInWaiting[i];
                const p = pid ? gameState.players[pid] : null;

                if (p) {
                  const isEditing = editingPlayerId === p.id;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#f8f6f3] transition-all hover:bg-[#f3f0ec]"
                    >
                      <div
                        className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.name[0]?.toUpperCase()}
                      </div>
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => handleRename(p.id, editingName)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(p.id, editingName);
                            if (e.key === 'Escape') { setEditingPlayerId(null); setEditingName(''); }
                          }}
                          className="flex-1 px-3 py-1 bg-white border border-stone-200 rounded-xl text-stone-900 font-bold text-sm outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className="flex-1 font-semibold text-stone-800 text-sm cursor-pointer hover:text-stone-600 transition-colors"
                          onClick={() => { setEditingPlayerId(p.id); setEditingName(p.name); }}
                        >
                          {p.name}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-stone-300 uppercase">P{i + 1}</span>
                    </div>
                  );
                }

                if (joiningSlotIndex === i) {
                  return (
                    <div
                      key={`join-${i}`}
                      className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#f8f6f3] border border-stone-200"
                    >
                      <div
                        className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: AVATAR_COLOR }}
                      >
                        ?
                      </div>
                      <input
                        autoFocus
                        type="text"
                        placeholder="Your name…"
                        value={joinName}
                        onChange={(e) => setJoinName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleJoin(joinName);
                          if (e.key === 'Escape') { setJoiningSlotIndex(null); setJoinName(''); }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 font-bold text-sm outline-none min-w-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={() => handleJoin(joinName)}
                        className="shrink-0 px-4 py-2 rounded-full text-white font-extrabold text-xs bg-[#1a1a1a] hover:bg-stone-800 transition-colors"
                      >
                        Join
                      </button>
                      <button
                        onClick={() => { setJoiningSlotIndex(null); setJoinName(''); }}
                        className="shrink-0 px-2 py-1.5 rounded-xl text-stone-400 text-xs hover:text-stone-600"
                      >
                        Cancel
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    key={`empty-${i}`}
                    onClick={() => { setJoiningSlotIndex(i); setJoinName(''); }}
                    className="w-full px-4 py-3.5 rounded-2xl border border-dashed border-stone-200 flex items-center justify-center text-xs font-semibold uppercase tracking-wider transition-all text-stone-400 hover:border-stone-400 hover:text-stone-600 hover:bg-[#faf8f5]"
                  >
                    + Join as Player {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Start button */}
            <div className="px-6 pt-4 pb-6">
              <button
                disabled={!canStart}
                onClick={handleStartGame}
                className="w-full py-4 rounded-full font-extrabold text-sm tracking-wide transition-all active:scale-[0.98]"
                style={
                  canStart
                    ? { backgroundColor: '#1a1a1a', color: '#fff' }
                    : { backgroundColor: '#eae7e3', color: '#b5b0a8', cursor: 'not-allowed' }
                }
              >
                {canStart ? 'Start Game →' : `Need ${3 - playersInLobby.length} more player${3 - playersInLobby.length !== 1 ? 's' : ''} to start`}
              </button>
            </div>
            </div>

            {/* How to play */}
            <div className="bg-white rounded-[28px] shadow-[0_4px_40px_rgba(0,0,0,0.06)] p-6 lg:p-7">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-5">How to play</p>
              <div className="space-y-3.5">
                {[
                  ['Join', 'Click a slot to enter. Click your name to edit.'],
                  ['Deploy', 'Use shared resources to unlock campus buildings.'],
                  ['Go Green', 'Upgrade all 8 buildings to sustainable AI to win.'],
                ].map(([title, desc], i) => (
                  <div key={i} className="rounded-2xl bg-[#f8f6f3] px-4 py-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#1a1a1a] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-[20px] font-black text-stone-900 leading-none mb-2">{title}</p>
                        <p className="text-[12px] text-stone-500 leading-snug">{desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-stone-900 font-sans overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/bg-left.svg"
          alt=""
          className="absolute left-0 top-0 h-full w-auto object-contain pointer-events-none select-none"
          aria-hidden
        />
        <img
          src="/bg-right.svg"
          alt=""
          className="absolute right-0 top-0 h-full w-auto object-contain pointer-events-none select-none"
          aria-hidden
        />
        {/* <img
          src="/path.svg"
          alt=""
          className="absolute inset-y-0 left-0 w-full h-full object-fill pointer-events-none"
          aria-hidden
        /> */}
      </div>

      <div className="absolute inset-0 z-10">
        {BOARD_SCENE_CONFIG.map(({ id, image, className }) => {
          const scenario = SCENARIOS.find(s => s.id === id);
          const state = gameState.tiles[id];
          if (!scenario || !state) return null;

          const isLocked = state.status === 'locked';
          const isUnlockFading = fadingUnlockIds.includes(id);
          const isGreen = state.status === 'green';
          const isRed = state.status === 'red';

          return (
            <button
              key={id}
              onClick={() => {
                setUnlockNotice(null);
                setViewingScenarioId(id);
              }}
              className={cn(
                'absolute group transition-transform hover:scale-[1.02] active:scale-[0.98]',
                className
              )}
            >
              <img
                src={image}
                alt={scenario.name}
                className="w-full h-auto select-none"
              />

              {/* Lock: center anchored on building so size doesn't shift position */}
              <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                <AnimatePresence>
                  {(isLocked || isUnlockFading) && (
                    <motion.img
                      key={`${id}-${isLocked ? 'locked' : 'fade'}`}
                      src="/lock.svg"
                      alt="locked"
                      className="drop-shadow-md object-contain shrink-0"
                      style={{ width: 260, height: 260 }}
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ opacity: isLocked ? 1 : 0, scale: isLocked ? 1 : 1.06 }}
                      transition={{ duration: 1.6, ease: 'easeOut' }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
              </div>
              {/* Status icons (red/green) below lock */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[58%] flex items-center justify-center gap-1.5">
                {isRed && (
                  <div className="rounded-full bg-[#EF702E]/95 p-2 shadow-md">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                )}
                {isGreen && (
                  <div className="rounded-full bg-[#BDDF4D]/95 p-2 shadow-md border border-[#7FA700]/30">
                    <Leaf className="w-5 h-5 text-[#2f4a00]" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Always-visible player/public resources panel */}
      <div className="fixed right-3 top-3 z-40 w-[min(92vw,380px)] max-h-[calc(100vh-1.5rem)] overflow-y-auto">
        <ResourceHUD
          inModal
          power={gameState.publicPower}
          water={gameState.publicWater}
          materials={gameState.publicMaterials}
          players={gameState.players}
          currentPlayerId={activePlayerId || ''}
          activePlayerId={activePlayerId || ''}
          playerOrder={gameState.playerOrder}
          round={gameState.round}
          onEndTurn={handleEndTurn}
        />
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {activeCrisis && (
          <motion.div
            key={activeCrisis.card_id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[96] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="w-full max-w-xl rounded-3xl bg-[#f8f6f3] border border-white/60 shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 bg-[#fff1e6] border-b border-[#f0d8c6]">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Crisis Card</p>
                <h3 className="mt-1 text-2xl font-black text-stone-900">{activeCrisis.title}</h3>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#b45309]">{activeCrisis.crisis_type}</p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-stone-700 leading-relaxed">{activeCrisis.description}</p>

                {activeCrisis.consequence_type === 'choice' && activeCrisis.options && (
                  <div className="space-y-2.5">
                    {activeCrisis.options.map((option) => (
                      <button
                        key={option.option_id}
                        onClick={() => handleResolveChoiceCrisis(option.cost)}
                        className="w-full rounded-2xl bg-white border border-stone-200 p-3 text-left hover:border-stone-400 transition-colors"
                      >
                        <div className="text-sm font-extrabold text-stone-900">
                          Option {option.option_id}: {option.text}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-stone-500">
                          Cost: B {option.cost.battery} / W {option.cost.water}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {activeCrisis.consequence_type === 'fixed' && activeCrisis.cost && (
                  <div className="rounded-2xl border border-stone-200 bg-white p-4">
                    <p className="text-sm font-bold text-stone-800">
                      Fixed cost applied: B {activeCrisis.cost.battery} / W {activeCrisis.cost.water}
                    </p>
                    <button
                      onClick={handleAcknowledgeFixedCrisis}
                      className="mt-3 w-full rounded-full bg-[#1a1a1a] py-3 text-sm font-extrabold text-white hover:bg-stone-800 transition-colors"
                    >
                      Acknowledge
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        {viewingScenarioId !== null && currentPlayer && (
          <ScenarioDetailPopup
            scenario={SCENARIOS.find(s => s.id === viewingScenarioId)!}
            tileState={gameState.tiles[viewingScenarioId]}
            activePlayer={currentPlayer}
            publicPower={gameState.publicPower}
            publicWater={gameState.publicWater}
            publicMaterials={gameState.publicMaterials}
            unlockNotice={unlockNotice}
            onClose={() => { setViewingScenarioId(null); setUnlockNotice(null); }}
            onUnlock={(id, plan) => {
              setUnlockNotice(null);
              const unlocked = handlePickTile(id, plan);
              if (unlocked) setViewingScenarioId(null);
            }}
            onConfirmContribution={(contribution) => {
              handleContribute(viewingScenarioId!, contribution);
              setViewingScenarioId(null);
            }}
          />
        )}

        {gameState.status === 'lost' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center text-white p-10 text-center"
          >
            <AlertTriangle className="w-24 h-24 mb-8" />
            <h2 className="text-5xl font-bold mb-4">Game Over</h2>
            <p className="text-xl opacity-80 max-w-md">{gameState.lossReason}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-12 px-10 py-4 bg-white text-red-600 font-bold rounded-2xl hover:scale-105 transition-transform"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {gameState.status === 'won' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-emerald-500 flex flex-col items-center justify-center text-white p-10 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Trophy className="w-24 h-24 mb-8" />
            </motion.div>
            <h2 className="text-5xl font-bold mb-4">Eco-AI Campus!</h2>
            <p className="text-xl opacity-80 max-w-md">You've successfully transitioned the campus to Green AI. The future is bright!</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-12 px-10 py-4 bg-white text-emerald-600 font-bold rounded-2xl hover:scale-105 transition-transform"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

