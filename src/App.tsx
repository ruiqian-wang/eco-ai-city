import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Zap, AlertTriangle, Trophy, User, Users } from 'lucide-react';
import { cn } from './lib/utils';
import { GameState, Player, TileState } from './types';
import { SCENARIOS, INITIAL_ENERGY, WIN_UPGRADE_COUNT } from './constants';
import { ScenarioTile } from './components/ScenarioTile';
import { ResourceHUD } from './components/ResourceHUD';
import { ScenarioDetailPopup } from './components/ScenarioDetailPopup';
import { v4 as uuidv4 } from 'uuid';

const AVATAR_COLOR = '#93C5FD';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    publicEnergy: INITIAL_ENERGY,
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
    closedScenariosCount: 0,
  });

  const [viewingScenarioId, setViewingScenarioId] = useState<number | null>(null);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const checkGameStatus = useCallback((state: GameState): GameState => {
    if (state.status !== 'playing') return state;

    const playerList = Object.values(state.players) as Player[];
    const anyPlayerBroke = playerList.some(p => p.batteries < 0);
    if (anyPlayerBroke) {
      return {
        ...state,
        status: 'lost',
        lossReason: "Social Inequality: A player has run out of batteries."
      };
    }

    if (state.publicEnergy <= 0) {
      return {
        ...state,
        status: 'lost',
        lossReason: "Energy Depletion: The public power pool is empty."
      };
    }

    const tileList = Object.values(state.tiles) as TileState[];
    const upgradedCount = tileList.filter(t => t.status === 'green').length;
    if (upgradedCount >= WIN_UPGRADE_COUNT) {
      return { ...state, status: 'won' };
    }

    return state;
  }, []);

  const calculateMaintenance = useCallback((state: GameState): GameState => {
    let totalMaintenance = 0;
    let totalBenefit = 0;

    const tileList = Object.values(state.tiles) as TileState[];
    tileList.forEach(tile => {
      const scenario = SCENARIOS.find(s => s.id === tile.id);
      if (!scenario) return;

      if (tile.status === 'red') {
        totalMaintenance += scenario.game_stats.maintenance_fee;
      } else if (tile.status === 'green') {
        totalBenefit += scenario.green_transformation.green_benefit;
      }
    });

    const nextEnergy = Math.max(0, state.publicEnergy - totalMaintenance + totalBenefit);
    return checkGameStatus({ ...state, publicEnergy: nextEnergy });
  }, [checkGameStatus]);

  const handleJoin = (name: string) => {
    if (name.trim() && gameState.playerOrder.length < 6) {
      const playerId = uuidv4();
      const newPlayer: Player = {
        id: playerId,
        name: name.trim(),
        batteries: 0,
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
      setShowJoinInput(false);
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
      const batteryPerPlayer = Math.floor(60 / playerList.length);
      const updatedPlayers = { ...gameState.players };
      playerList.forEach(p => {
        updatedPlayers[p.id] = { ...p, batteries: batteryPerPlayer };
      });
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        playerOrder: [...prev.playerOrder].sort(() => 0.5 - Math.random()),
        currentPlayerIndex: 0,
        actionsRemaining: 1,
        players: updatedPlayers
      }));
    }
  };

  const handlePickTile = (tileId: number) => {
    const activePlayerId = gameState.playerOrder[gameState.currentPlayerIndex];
    if (gameState.status !== 'playing' || gameState.actionsRemaining <= 0) return;

    const tile = gameState.tiles[tileId];
    const scenario = SCENARIOS.find(s => s.id === tileId);
    if (tile && scenario && tile.status === 'locked') {
      if (gameState.publicEnergy >= scenario.game_stats.startup_cost) {
        setGameState(prev => {
          const nextState = {
            ...prev,
            publicEnergy: prev.publicEnergy - scenario.game_stats.startup_cost,
            tiles: {
              ...prev.tiles,
              [tileId]: { ...tile, status: 'red' }
            },
            actionsRemaining: prev.actionsRemaining - 1
          };
          return checkGameStatus(nextState);
        });
      }
    }
  };

  const handleCloseTile = (tileId: number) => {
    if (gameState.status !== 'playing' || gameState.closedScenariosCount >= 2) return;

    const tile = gameState.tiles[tileId];
    if (tile && tile.status === 'red') {
      setGameState(prev => ({
        ...prev,
        tiles: {
          ...prev.tiles,
          [tileId]: { ...tile, status: 'closed' }
        },
        closedScenariosCount: prev.closedScenariosCount + 1
      }));
    }
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
        return calculateMaintenance(nextState);
      }

      return { ...nextState, currentPlayerIndex: nextIndex };
    });
  };

  const handleContribute = (tileId: number, amount: number) => {
    if (gameState.status !== 'playing') return;
    const activePlayerId = gameState.playerOrder[gameState.currentPlayerIndex];
    const player = gameState.players[activePlayerId];
    const tile = gameState.tiles[tileId];
    const scenario = SCENARIOS.find(s => s.id === tileId);

    if (player && tile && scenario && tile.status === 'red' && player.batteries >= amount) {
      setGameState(prev => {
        const updatedPlayer = { ...player, batteries: player.batteries - amount };
        const updatedContributions = { 
          ...tile.contributions, 
          [activePlayerId]: (tile.contributions[activePlayerId] || 0) + amount 
        };
        const contributionValues = Object.values(updatedContributions) as number[];
        const totalContributed = contributionValues.reduce((a, b) => a + b, 0);
        const nextStatus = totalContributed >= scenario.game_stats.upgrade_cost ? 'green' : 'red';

        const nextState = {
          ...prev,
          players: { ...prev.players, [activePlayerId]: updatedPlayer },
          tiles: {
            ...prev.tiles,
            [tileId]: { ...tile, status: nextStatus, contributions: updatedContributions }
          }
        };
        return checkGameStatus(nextState);
      });
    }
  };

  const activePlayerId = gameState.playerOrder[gameState.currentPlayerIndex];
  const currentPlayer = activePlayerId ? gameState.players[activePlayerId] : null;
  const players = Object.values(gameState.players) as Player[];
  const isMyTurn = true; // In local mode, it's always the current user's turn (pass and play)

  // Board Layout Logic (Monopoly style rectangle)
  const gridPositions = [
    "col-start-1 row-start-1", "col-start-2 row-start-1", "col-start-3 row-start-1", "col-start-4 row-start-1",
    "col-start-4 row-start-2", "col-start-4 row-start-3",
    "col-start-3 row-start-3", "col-start-2 row-start-3", "col-start-1 row-start-3",
    "col-start-1 row-start-2"
  ];

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

                return (
                  <button
                    key={`empty-${i}`}
                    onClick={() => setShowJoinInput(true)}
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

            {/* Join input */}
            {showJoinInput && (
              <div className="mx-6 mt-2 p-4 rounded-2xl space-y-2" style={{ backgroundColor: '#E4EFA6' }}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Enter your name…"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleJoin(joinName);
                    if (e.key === 'Escape') { setShowJoinInput(false); setJoinName(''); }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-none outline-none text-stone-900 font-semibold text-sm shadow-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleJoin(joinName)}
                    className="flex-1 py-2 rounded-xl text-stone-900 font-extrabold text-sm transition-opacity hover:opacity-80"
                    style={{ backgroundColor: '#ffffff', outline: '1px solid #BDDF4D'}}
                  >
                    Join
                  </button>
                  <button
                    onClick={() => { setShowJoinInput(false); setJoinName(''); }}
                    className="px-4 py-2 rounded-xl text-stone-500 font-medium text-sm bg-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

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
                ['Unlock scenarios with shared energy, but watch the drain!', '#BDDF4D'],
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
    <div className="min-h-screen bg-white text-stone-900 p-6 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left: Game Board */}
        <div className="flex-1">
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{ aspectRatio: '1.18 / 1', backgroundColor: '#BDDF4D' }}
          >
            {/* board.svg decorative overlay (arrows / paths) */}
            <img
              src="/board.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              aria-hidden
            />

            {/* Scenario grid */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-3 p-5">
              {SCENARIOS.map((scenario, idx) => {
                const state = gameState.tiles[scenario.id];
                return (
                  <div key={scenario.id} className={gridPositions[idx]}>
                    <ScenarioTile
                      scenario={scenario}
                      state={state}
                      isCurrentPlayer={isMyTurn}
                      canClose={isMyTurn && gameState.closedScenariosCount < 2}
                      onScenarioClick={(id) => setViewingScenarioId(id)}
                      onPick={handlePickTile}
                      onCloseClick={handleCloseTile}
                    />
                  </div>
                );
              })}

              {/* Center: */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center text-center space-y-3 pointer-events-auto">
                  <div className="w-fit text-center text-xs font-bold text-stone-700 bg-white/85 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm">
                    {currentPlayer?.name}'s Turn
                  </div>
                  <button
                    onClick={handleEndTurn}
                    className="px-6 py-2.5 text-white rounded-full text-sm font-extrabold hover:scale-105 transition-transform shadow-lg"
                    style={{ backgroundColor: '#EF702E' }}
                  >
                    End Turn
                  </button>
                  <div
                    className="w-fit items-center gap-2 rounded-full px-4 py-1.5 text-white text-xs font-bold shadow-md"
                    style={{ backgroundColor: 'rgba(30,30,30,0.75)' }}
                  >
                    Closed Scenarios {gameState.closedScenariosCount}/2
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: HUD */}
        <div className="lg:w-80 xl:w-96 flex flex-col gap-4 pt-2">
          <ResourceHUD 
            energy={gameState.publicEnergy} 
            players={gameState.players}
            currentPlayerId={activePlayerId || ''}
            activePlayerId={activePlayerId || ''}
            playerOrder={gameState.playerOrder}
            round={gameState.round}
          />
        </div>
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {viewingScenarioId !== null && currentPlayer && (
          <ScenarioDetailPopup
            scenario={SCENARIOS.find(s => s.id === viewingScenarioId)!}
            tileState={gameState.tiles[viewingScenarioId]}
            publicEnergy={gameState.publicEnergy}
            player={currentPlayer}
            onClose={() => setViewingScenarioId(null)}
            onUnlock={(id) => { handlePickTile(id); setViewingScenarioId(null); }}
            onConfirmContribution={(amount) => {
              handleContribute(viewingScenarioId!, amount);
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

