import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Zap, AlertTriangle, Trophy, User, Users } from 'lucide-react';
import { cn } from './lib/utils';
import { GameState, Player, TileState } from './types';
import { SCENARIOS, INITIAL_MATERIALS, INITIAL_POWER, INITIAL_WATER, WIN_UPGRADE_COUNT } from './constants';
import { ResourceHUD } from './components/ResourceHUD';
import { ScenarioDetailPopup } from './components/ScenarioDetailPopup';
import { v4 as uuidv4 } from 'uuid';

const AVATAR_COLOR = '#93C5FD';
const BOARD_SCENE_CONFIG = [
  { id: 1, image: '/canteen.png', className: 'top-[9%] left-[24%] w-[14%]' },
  { id: 2, image: '/studio.png', className: 'bottom-[6%] left-[44%] w-[18%]' },
  { id: 3, image: '/health.png', className: 'top-[44%] left-[53%] w-[20%]' },
  { id: 4, image: '/classroom.png', className: 'top-[32%] left-[14%] w-[14%]' },
  { id: 5, image: '/garden.png', className: 'top-[50%] left-[26%] w-[20%]' },
  { id: 6, image: '/security.png', className: 'bottom-[5%] left-[10%] w-[15%]' },
  { id: 7, image: '/library.png', className: 'top-[24%] left-[40%] w-[15%]' },
  { id: 8, image: '/teacher.png', className: 'top-[6%] left-[55%] w-[18%]' },
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

      if (tile.status === 'red') {
        totalPower += scenario.game_stats.ai_operating_consumption_per_round.standard_ai.battery;
        totalWater += scenario.game_stats.ai_operating_consumption_per_round.standard_ai.water;
      }
      if (tile.status === 'green') {
        totalPower += scenario.game_stats.ai_operating_consumption_per_round.green_ai.battery;
        totalWater += scenario.game_stats.ai_operating_consumption_per_round.green_ai.water;
      }
    });

    const nextState = {
      ...state,
      publicPower: Math.max(0, state.publicPower - totalPower),
      publicWater: Math.max(0, state.publicWater - totalWater),
    };
    return checkGameStatus(nextState);
  }, [checkGameStatus]);

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

  const handlePickTile = (tileId: number) => {
    const activePlayerId = gameState.playerOrder[gameState.currentPlayerIndex];
    if (gameState.status !== 'playing' || gameState.actionsRemaining <= 0) return;

    const tile = gameState.tiles[tileId];
    const scenario = SCENARIOS.find(s => s.id === tileId);
    const activePlayer = activePlayerId ? gameState.players[activePlayerId] : null;
    if (!tile || !scenario || tile.status !== 'locked' || !activePlayer) return;

    const costP = scenario.game_stats.deployment_cost.battery;
    const costW = scenario.game_stats.deployment_cost.water;
    const costM = scenario.game_stats.deployment_cost.rare_materials;
    if (activePlayer.battery < costP || activePlayer.water < costW || activePlayer.materials < costM) return;
    if (gameState.publicPower < costP || gameState.publicWater < costW || gameState.publicMaterials < costM) return;

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
          [tileId]: { ...tile, status: 'red' as const }
        },
        actionsRemaining: prev.actionsRemaining - 1
      };
      return checkGameStatus(nextState);
    });
    triggerLockFade(tileId);
  };

  const handleEndTurn = () => {
    if (gameState.status !== 'playing') return;

    setGameState(prev => {
      let nextIndex = prev.currentPlayerIndex + 1;
      let nextRound = prev.round;
      let nextState = { ...prev, actionsRemaining: 1 };

      if (nextIndex >= prev.playerOrder.length) {
        nextIndex = 0;
        nextRound++;
        nextState.round = nextRound;
        nextState.currentPlayerIndex = nextIndex;
        return calculateResourceConsumption(nextState);
      }

      return { ...nextState, currentPlayerIndex: nextIndex };
    });
  };

  const handleContribute = (tileId: number, amount: { battery: number; water: number }) => {
    if (gameState.status !== 'playing') return;
    const activePlayerId = gameState.playerOrder[gameState.currentPlayerIndex];
    const activePlayer = activePlayerId ? gameState.players[activePlayerId] : null;
    const tile = gameState.tiles[tileId];
    const scenario = SCENARIOS.find(s => s.id === tileId);

    if (!tile || !scenario || tile.status !== 'red' || !activePlayer) return;
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
        totalBattery >= scenario.game_stats.green_upgrade_cost.battery &&
        totalWater >= scenario.game_stats.green_upgrade_cost.water
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
      <div
        className="min-h-screen flex items-center justify-center p-6 font-sans"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="max-w-4xl w-full flex flex-row justify-center items-center gap-6">

          {/* Left: Player Panel */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-1/2">
            {/* Title bar */}
            <div className="px-8 pt-8 pb-5">
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: '#E4EFA6' }}
                >
                  <Users className="w-5 h-5" style={{ color: '#6b8a00' }} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900">Eco-AI Campus</h2>
                  <p className="text-xs text-stone-400 font-medium">{playersInLobby.length} / 6 players</p>
                </div>
              </div>
            </div>

            {/* Player Slots */}
            <div className="px-6 pb-2 space-y-2.5">
              {Array.from({ length: 6 }, (_, i) => {
                const pid = playerOrderInWaiting[i];
                const p = pid ? gameState.players[pid] : null;

                if (p) {
                  const isEditing = editingPlayerId === p.id;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{ backgroundColor: '#E4EFA6' }}
                    >
                      <div
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
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
                          className="flex-1 px-2 py-0.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-bold text-sm outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className="flex-1 font-bold text-stone-800 text-sm cursor-pointer hover:underline"
                          onClick={() => { setEditingPlayerId(p.id); setEditingName(p.name); }}
                        >
                          {p.name}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Player {i + 1}</span>
                    </div>
                  );
                }

                if (joiningSlotIndex === i) {
                  return (
                    <div
                      key={`join-${i}`}
                      className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                      style={{ backgroundColor: '#E4EFA6' }}
                    >
                      <div
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
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
                        className="shrink-0 px-3 py-1.5 rounded-xl text-stone-900 font-extrabold text-xs"
                        style={{ backgroundColor: '#BDDF4D' }}
                      >
                        Join
                      </button>
                      <button
                        onClick={() => { setJoiningSlotIndex(null); setJoinName(''); }}
                        className="shrink-0 px-2 py-1.5 rounded-xl text-stone-500 font-medium text-xs hover:bg-white/60"
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
                    className="w-full px-4 py-3 rounded-2xl border-2 border-dashed flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all"
                    style={{ borderColor: '#BDDF4D', color: '#8aad00' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#E4EFA6'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                  >
                    + Join as Player {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Start button */}
            <div className="px-6 py-6 mt-2">
              <button
                disabled={!canStart}
                onClick={handleStartGame}
                className="w-full py-4 rounded-2xl font-extrabold text-sm transition-all active:scale-[0.98]"
                style={
                  canStart
                    ? { backgroundColor: '#EF702E', color: '#fff' }
                    : { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }
                }
              >
                {canStart ? 'Start Game →' : `Need ${3 - playersInLobby.length} more player${3 - playersInLobby.length !== 1 ? 's' : ''} to start`}
              </button>
            </div>
          </div>

          {/* Right: How to play */}
          <div className="hidden md:flex flex-col gap-5 p-2 w-72">
            <div>
              <h3 className="text-3xl font-extrabold text-stone-900 leading-tight mb-1">
                Collaborate to<br />Save the Campus
              </h3>
            </div>
            <ul className="space-y-4">
              {[
                ['Click an empty slot to join. Click your name to rename.', '#EF702E'],
                ['Unlock scenarios with shared resources. Manage power, water, and materials!', '#BDDF4D'],
                ['Upgrade to Green AI — save costs and earn benefits.', '#E4EFA6'],
              ].map(([text, bg], i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-xs text-stone-900"
                    style={{ backgroundColor: bg }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm text-stone-800 leading-relaxed">{text}</p>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-stone-900 font-sans overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/path.svg"
          alt=""
          className="absolute inset-y-0 left-0 w-full h-full object-fill pointer-events-none"
          aria-hidden
        />
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
              onClick={() => setViewingScenarioId(id)}
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

      <div className="relative z-20 min-h-screen flex justify-end items-start p-6 pt-24 pointer-events-none">
        <div className="w-full max-w-sm pointer-events-auto">
          <ResourceHUD 
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
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {viewingScenarioId !== null && currentPlayer && (
          <ScenarioDetailPopup
            scenario={SCENARIOS.find(s => s.id === viewingScenarioId)!}
            tileState={gameState.tiles[viewingScenarioId]}
            activePlayer={currentPlayer}
            publicPower={gameState.publicPower}
            publicWater={gameState.publicWater}
            publicMaterials={gameState.publicMaterials}
            onClose={() => setViewingScenarioId(null)}
            onUnlock={(id) => { handlePickTile(id); setViewingScenarioId(null); }}
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

