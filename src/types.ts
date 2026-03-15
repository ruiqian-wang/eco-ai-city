export interface RedAIStatus {
  problem: string;
  description: string;
  eco_impact_fact: string;
}

export interface GameStats {
  startup_cost: number;
  maintenance_fee: number;
  upgrade_cost: number;
}

export interface GreenTransformation {
  title: string;
  effect_desc: string;
  green_benefit: number;
  strategy_tip: string;
}

export interface Scenario {
  id: number;
  name: string;
  category: 'Green-in' | 'Green-by' | 'Shared';
  visual_theme?: string;
  red_ai_status: RedAIStatus;
  game_stats: GameStats;
  green_transformation: GreenTransformation;
}

export type TileStatus = 'locked' | 'red' | 'green' | 'closed';

export interface TileState {
  id: number;
  status: TileStatus;
  contributions: Record<string, number>; // playerId -> amount
}

export interface Player {
  id: string;
  name: string;
  batteries: number;
  color: string;
  isReady: boolean;
  socketId: string;
}

export interface GameState {
  publicEnergy: number;
  players: Record<string, Player>;
  playerOrder: string[];
  currentPlayerIndex: number;
  tiles: Record<number, TileState>;
  round: number;
  status: 'waiting' | 'playing' | 'won' | 'lost';
  lossReason?: string;
  actionsRemaining: number;
  closedScenariosCount: number;
}
