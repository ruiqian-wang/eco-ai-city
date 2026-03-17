import { Scenario } from './types';

export const BUILDING_COST_CONFIG = {
  general_building_deployment_costs: [
    { building: 'Library', battery: 5, water: 3, rare_materials: 1 },
    { building: 'Classroom', battery: 6, water: 3, rare_materials: 1 },
    { building: 'Canteen', battery: 4, water: 4, rare_materials: 1 },
    { building: 'Garden', battery: 4, water: 3, rare_materials: 1 },
    { building: 'Security', battery: 5, water: 3, rare_materials: 1 },
  ],
  green_ai_upgrade_costs: [
    { building: 'Library', battery: 2, water: 1 },
    { building: 'Classroom', battery: 2, water: 1 },
    { building: 'Teacher', battery: 2, water: 2 },
    { building: 'Canteen', battery: 2, water: 2 },
    { building: 'Garden', battery: 1, water: 1 },
    { building: 'Studio', battery: 2, water: 2 },
    { building: 'Health', battery: 2, water: 2 },
    { building: 'Security', battery: 2, water: 1 },
  ],
  ai_operating_consumption_per_round: [
    { building: 'Library', standard_ai: { battery: 2, water: 1 }, green_ai: { battery: 1, water: 0 } },
    { building: 'Classroom', standard_ai: { battery: 2, water: 1 }, green_ai: { battery: 1, water: 0 } },
    { building: 'Teacher', standard_ai: { battery: 3, water: 2 }, green_ai: { battery: 1, water: 1 } },
    { building: 'Canteen', standard_ai: { battery: 2, water: 2 }, green_ai: { battery: 1, water: 1 } },
    { building: 'Garden', standard_ai: { battery: 1, water: 1 }, green_ai: { battery: 0, water: 0 } },
    { building: 'Studio', standard_ai: { battery: 3, water: 2 }, green_ai: { battery: 1, water: 1 } },
    { building: 'Health', standard_ai: { battery: 3, water: 2 }, green_ai: { battery: 1, water: 1 } },
    { building: 'Security', standard_ai: { battery: 2, water: 1 }, green_ai: { battery: 1, water: 0 } },
  ],
  special_building_options: {
    option_a: {
      name: 'Full AI Deployment',
      pros: 'Rapid deployment, lower initial cost',
      cons: 'Ethical risks, potential for events triggered every round',
      costs: [
        { building: 'Counseling Center', battery: 5, water: 4, rare_materials: 1 },
        { building: 'Creative Arts Studio', battery: 6, water: 4, rare_materials: 1 },
        { building: 'Teachers Office', battery: 5, water: 4, rare_materials: 1 },
      ],
    },
    option_b: {
      name: 'Human-AI Collaboration',
      pros: 'Reduced ethical risks, higher long-term security',
      cons: 'Slightly higher initial cost',
      costs: [
        { building: 'Counseling Center', battery: 6, water: 4, rare_materials: 1 },
        { building: 'Creative Arts Studio', battery: 7, water: 4, rare_materials: 1 },
        { building: 'Teachers Office', battery: 6, water: 4, rare_materials: 1 },
      ],
    },
  },
};

const SPECIAL_OPTION_IN_USE: 'option_a' | 'option_b' = 'option_b';

const deploymentByBuilding = new Map(
  BUILDING_COST_CONFIG.general_building_deployment_costs.map(item => [item.building, item] as const)
);
for (const item of BUILDING_COST_CONFIG.special_building_options[SPECIAL_OPTION_IN_USE].costs) {
  const mappedName =
    item.building === 'Counseling Center'
      ? 'Health'
      : item.building === 'Creative Arts Studio'
        ? 'Studio'
        : item.building === 'Teachers Office'
          ? 'Teacher'
          : item.building;
  deploymentByBuilding.set(mappedName, item);
}
const upgradeByBuilding = new Map(
  BUILDING_COST_CONFIG.green_ai_upgrade_costs.map(item => [item.building, item] as const)
);
const operatingByBuilding = new Map(
  BUILDING_COST_CONFIG.ai_operating_consumption_per_round.map(item => [item.building, item] as const)
);

const makeStats = (building: string) => ({
  deployment_cost: deploymentByBuilding.get(building)!,
  green_upgrade_cost: upgradeByBuilding.get(building)!,
  ai_operating_consumption_per_round: operatingByBuilding.get(building)!,
});

export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    name: 'Canteen',
    category: 'Green-in',
    visual_theme: 'energy_warning',
    red_ai_status: {
      problem: 'Inefficient kitchen scheduling',
      description: 'Standard AI over-orders prep cycles and wastes kitchen resources.',
      eco_impact_fact: 'Peak-hour spikes cause avoidable battery and water use.',
    },
    game_stats: makeStats('Canteen'),
    green_transformation: {
      title: 'Smart meal optimization',
      effect_desc: 'Green AI predicts demand better and reduces redundant operations.',
      green_benefit: 0,
      strategy_tip: 'Good early conversion to stabilize shared resources.',
    },
  },
  {
    id: 2,
    name: 'Studio',
    category: 'Green-in',
    visual_theme: 'energy_warning',
    red_ai_status: {
      problem: 'Render-heavy generation loops',
      description: 'Standard AI repeatedly reruns creative jobs with high compute load.',
      eco_impact_fact: 'Rendering retries consume both battery and water cooling budget.',
    },
    game_stats: makeStats('Studio'),
    green_transformation: {
      title: 'Efficient generation pipeline',
      effect_desc: 'Green AI avoids redundant passes and uses lightweight inference.',
      green_benefit: 0,
      strategy_tip: 'Upgrade after basic buildings to prevent mid-game drain.',
    },
  },
  {
    id: 3,
    name: 'Health',
    category: 'Green-in',
    visual_theme: 'energy_warning',
    red_ai_status: {
      problem: 'Always-on triage model',
      description: 'Standard AI processes too many non-critical checks continuously.',
      eco_impact_fact: 'Continuous monitoring creates unnecessary operating overhead.',
    },
    game_stats: makeStats('Health'),
    green_transformation: {
      title: 'Priority-aware triage',
      effect_desc: 'Green AI schedules diagnostics only when confidence is low.',
      green_benefit: 0,
      strategy_tip: 'Keeps resource pressure manageable in later rounds.',
    },
  },
  {
    id: 4,
    name: 'Classroom',
    category: 'Green-in',
    visual_theme: 'energy_warning',
    red_ai_status: {
      problem: 'Over-provisioned tutoring sessions',
      description: 'Standard AI spins up full models for simple classroom tasks.',
      eco_impact_fact: 'Teaching workloads can be served with much smaller models.',
    },
    game_stats: makeStats('Classroom'),
    green_transformation: {
      title: 'Adaptive lightweight tutor',
      effect_desc: 'Green AI scales model size based on lesson complexity.',
      green_benefit: 0,
      strategy_tip: 'Low-risk upgrade with immediate operating savings.',
    },
  },
  {
    id: 5,
    name: 'Garden',
    category: 'Green-by',
    visual_theme: 'eco_growth',
    red_ai_status: {
      problem: 'Inefficient irrigation feedback',
      description: 'Standard AI polls sensors too often and over-corrects watering.',
      eco_impact_fact: 'Smart schedules can nearly eliminate idle consumption.',
    },
    game_stats: makeStats('Garden'),
    green_transformation: {
      title: 'Precision micro-irrigation',
      effect_desc: 'Green AI only reacts to real changes in soil and weather signals.',
      green_benefit: 0,
      strategy_tip: 'Cheapest path toward a zero-consumption operating site.',
    },
  },
  {
    id: 6,
    name: 'Security',
    category: 'Green-by',
    visual_theme: 'eco_growth',
    red_ai_status: {
      problem: 'Always-max surveillance mode',
      description: 'Standard AI runs high-power analytics at all times.',
      eco_impact_fact: 'Context-aware monitoring cuts baseline load significantly.',
    },
    game_stats: makeStats('Security'),
    green_transformation: {
      title: 'Context-triggered monitoring',
      effect_desc: 'Green AI scales down during low-risk periods.',
      green_benefit: 0,
      strategy_tip: 'Strong pick when water is becoming scarce.',
    },
  },
  {
    id: 7,
    name: 'Library',
    category: 'Green-in',
    visual_theme: 'energy_warning',
    red_ai_status: {
      problem: 'Wasteful indexing and retrieval',
      description: 'Standard AI continuously rebuilds indexes with excessive compute.',
      eco_impact_fact: 'Batching and caching can halve runtime usage.',
    },
    game_stats: makeStats('Library'),
    green_transformation: {
      title: 'Incremental indexing',
      effect_desc: 'Green AI updates only changed content and caches query results.',
      green_benefit: 0,
      strategy_tip: 'Reliable early target with balanced cost profile.',
    },
  },
  {
    id: 8,
    name: 'Teacher',
    category: 'Green-in',
    visual_theme: 'energy_warning',
    red_ai_status: {
      problem: 'Heavy administrative automation',
      description: 'Standard AI performs full-document processing for small updates.',
      eco_impact_fact: 'Most office tasks can be handled with incremental workflows.',
    },
    game_stats: makeStats('Teacher'),
    green_transformation: {
      title: 'Incremental office assistant',
      effect_desc: 'Green AI applies focused updates and low-power summarization.',
      green_benefit: 0,
      strategy_tip: 'Higher baseline drain but excellent payoff after upgrade.',
    },
  },
];

export const INITIAL_POWER = 60;
export const INITIAL_WATER = 60;
export const INITIAL_MATERIALS = 30;
export const WIN_UPGRADE_COUNT = 8;
