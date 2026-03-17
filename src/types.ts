export interface RedAIStatus {
  problem: string;
  description: string;
  eco_impact_fact: string;
}

export interface GameStats {
  deployment_cost: {
    battery: number;
    water: number;
    rare_materials: number;
  };
  green_upgrade_cost: {
    battery: number;
    water: number;
  };
  ai_operating_consumption_per_round: {
    standard_ai: {
      battery: number;
      water: number;
    };
    green_ai: {
      battery: number;
      water: number;
    };
  };
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

export type TileStatus = 'locked' | 'red' | 'green';

export interface TileState {
  id: number;
  status: TileStatus;
  contributions: Record<string, { battery: number; water: number }>; // playerId -> contribution
}

export interface Player {
  id: string;
  name: string;
  battery: number;
  water: number;
  materials: number;
  color: string;
  isReady: boolean;
  socketId: string;
}

export interface GameState {
  publicPower: number;
  publicWater: number;
  publicMaterials: number;
  players: Record<string, Player>;
  playerOrder: string[];
  currentPlayerIndex: number;
  tiles: Record<number, TileState>;
  round: number;
  status: 'waiting' | 'playing' | 'won' | 'lost';
  lossReason?: string;
  actionsRemaining: number;
}
