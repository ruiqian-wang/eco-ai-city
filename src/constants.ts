import { CrisisCard, Scenario } from './types';

const makeStats = (
  deployment: { battery: number; water: number; rare_materials: number },
  upgrade: { battery: number; water: number },
  upkeep: { red: { battery: number; water: number }; green: { battery: number; water: number } }
) => ({
  deployment_cost: deployment,
  green_upgrade_cost: upgrade,
  ai_operating_consumption_per_round: {
    standard_ai: upkeep.red,
    green_ai: upkeep.green,
  },
});

export const STANDARD_SCENES = [
  {
    name: 'Canteen',
    unlock: { B: 3, W: 2, RM: 1 },
    upgrade: { B: 2, W: 2 },
    upkeep: { red: { B: 3, W: 2 }, green: { B: 1, W: 1 } },
  },
  {
    name: 'Library',
    unlock: { B: 2, W: 3, RM: 2 },
    upgrade: { B: 3, W: 3 },
    upkeep: { red: { B: 2, W: 2 }, green: { B: 1, W: 1 } },
  },
  {
    name: 'Classroom',
    unlock: { B: 3, W: 3, RM: 2 },
    upgrade: { B: 3, W: 2 },
    upkeep: { red: { B: 3, W: 2 }, green: { B: 1, W: 1 } },
  },
  {
    name: 'Garden',
    unlock: { B: 2, W: 2, RM: 1 },
    upgrade: { B: 2, W: 3 },
    upkeep: { red: { B: 2, W: 2 }, green: { B: 1, W: 1 } },
  },
  {
    name: 'Security Office',
    unlock: { B: 3, W: 3, RM: 2 },
    upgrade: { B: 2, W: 2 },
    upkeep: { red: { B: 3, W: 2 }, green: { B: 1, W: 1 } },
  },
];

export const DUAL_PATH_SCENES = [
  {
    name: 'Teacher Office',
    planA: {
      title: 'Full AI Grading',
      description: 'AI autonomously grades all assignments and provides feedback. However, the system may replicate historical grading biases, potentially disadvantaging certain student groups.',
      unlock: { B: 2, W: 2, RM: 1 },
      upgrade: { B: 2, W: 2 },
      upkeep: { red: { B: 3, W: 2 }, green: { B: 1, W: 1 } },
      risk: 'Bias (-4B or -3W)',
    },
    planB: {
      title: 'Human-in-the-Loop Grading',
      description: 'Teachers review AI-generated grades before finalizing them. Higher initial investment in training and workflow integration prevents bias-related incidents entirely.',
      unlock: { B: 3, W: 3, RM: 1 },
      upgrade: { B: 3, W: 3 },
      upkeep: { red: { B: 2, W: 1 }, green: { B: 1, W: 1 } },
      risk: 'None',
    },
  },
  {
    name: 'Creative Studio',
    planA: {
      title: 'Unrestricted AI Generation',
      description: 'Students can freely generate artwork with minimal oversight. Without proper citation mechanisms, students may submit AI-generated work as original creations.',
      unlock: { B: 3, W: 2, RM: 2 },
      upgrade: { B: 3, W: 2 },
      upkeep: { red: { B: 3, W: 2 }, green: { B: 1, W: 1 } },
      risk: 'Plagiarism (-5B or -3B,-3W)',
    },
    planB: {
      title: 'Guided AI Co-Creation',
      description: 'AI tools are paired with educator supervision and authorship training. Additional setup costs ensure students understand creative integrity and proper attribution.',
      unlock: { B: 4, W: 3, RM: 2 },
      upgrade: { B: 3, W: 2 },
      upkeep: { red: { B: 2, W: 1 }, green: { B: 1, W: 1 } },
      risk: 'None',
    },
  },
  {
    name: 'Mental Health',
    planA: {
      title: 'Automated Crisis Detection',
      description: 'AI independently screens student messages for mental health risks and responds automatically. Misdiagnosis or delayed human intervention could escalate urgent cases.',
      unlock: { B: 2, W: 3, RM: 2 },
      upgrade: { B: 3, W: 3 },
      upkeep: { red: { B: 3, W: 3 }, green: { B: 1, W: 1 } },
      risk: 'Crisis (-6B)',
    },
    planB: {
      title: 'Counselor-Supervised AI Support',
      description: 'Licensed counselors monitor all AI interactions in real-time, ensuring accurate crisis identification. Higher staffing and integration costs eliminate misdiagnosis risks.',
      unlock: { B: 3, W: 4, RM: 2 },
      upgrade: { B: 3, W: 3 },
      upkeep: { red: { B: 2, W: 2 }, green: { B: 1, W: 1 } },
      risk: 'None',
    },
  },
];

export const PLAYER_ACTIONS = {
  UNLOCK_SCENE: 'Unlock one scene (pay full unlock cost)',
  CHOOSE_PLAN: 'Choose Plan A or Plan B (dual-path scenes only)',
  CONTRIBUTE_UPGRADE: 'Contribute resources to upgrade (can accumulate across turns)',
  PASS: 'Pass',
} as const;

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
    game_stats: makeStats(
      { battery: 3, water: 2, rare_materials: 1 },
      { battery: 2, water: 2 },
      { red: { battery: 3, water: 2 }, green: { battery: 1, water: 1 } }
    ),
    green_transformation: {
      title: 'Smart meal optimization',
      effect_desc: 'Green AI predicts demand better and reduces redundant operations.',
      green_benefit: 0,
      strategy_tip: 'Good early conversion to stabilize shared resources.',
    },
  },
  {
    id: 2,
    name: 'Creative Studio',
    category: 'Green-in',
    visual_theme: 'energy_warning',
    red_ai_status: {
      problem: 'Render-heavy generation loops',
      description: 'Standard AI repeatedly reruns creative jobs with high compute load.',
      eco_impact_fact: 'Rendering retries consume both battery and water cooling budget.',
    },
    game_stats: makeStats(
      { battery: 3, water: 2, rare_materials: 2 },
      { battery: 3, water: 2 },
      { red: { battery: 3, water: 2 }, green: { battery: 1, water: 1 } }
    ),
    dual_path: {
      planA: {
        title: 'Unrestricted AI Generation',
        description: 'Students can freely generate artwork with minimal oversight. Without proper citation mechanisms, students may submit AI-generated work as original creations.',
        game_stats: makeStats(
          { battery: 3, water: 2, rare_materials: 2 },
          { battery: 3, water: 2 },
          { red: { battery: 3, water: 2 }, green: { battery: 1, water: 1 } }
        ),
        risk: 'Plagiarism (-5B or -3B,-3W)',
      },
      planB: {
        title: 'Guided AI Co-Creation',
        description: 'AI tools are paired with educator supervision and authorship training. Additional setup costs ensure students understand creative integrity and proper attribution.',
        game_stats: makeStats(
          { battery: 4, water: 3, rare_materials: 2 },
          { battery: 3, water: 2 },
          { red: { battery: 2, water: 1 }, green: { battery: 1, water: 1 } }
        ),
        risk: 'None',
      },
    },
    green_transformation: {
      title: 'Efficient generation pipeline',
      effect_desc: 'Green AI avoids redundant passes and uses lightweight inference.',
      green_benefit: 0,
      strategy_tip: 'Upgrade after basic buildings to prevent mid-game drain.',
    },
  },
  {
    id: 3,
    name: 'Mental Health',
    category: 'Green-in',
    visual_theme: 'energy_warning',
    red_ai_status: {
      problem: 'Always-on triage model',
      description: 'Standard AI processes too many non-critical checks continuously.',
      eco_impact_fact: 'Continuous monitoring creates unnecessary operating overhead.',
    },
    game_stats: makeStats(
      { battery: 2, water: 3, rare_materials: 2 },
      { battery: 3, water: 3 },
      { red: { battery: 3, water: 3 }, green: { battery: 1, water: 1 } }
    ),
    dual_path: {
      planA: {
        title: 'Automated Crisis Detection',
        description: 'AI independently screens student messages for mental health risks and responds automatically. Misdiagnosis or delayed human intervention could escalate urgent cases.',
        game_stats: makeStats(
          { battery: 2, water: 3, rare_materials: 2 },
          { battery: 3, water: 3 },
          { red: { battery: 3, water: 3 }, green: { battery: 1, water: 1 } }
        ),
        risk: 'Crisis (-6B)',
      },
      planB: {
        title: 'Counselor-Supervised AI Support',
        description: 'Licensed counselors monitor all AI interactions in real-time, ensuring accurate crisis identification. Higher staffing and integration costs eliminate misdiagnosis risks.',
        game_stats: makeStats(
          { battery: 3, water: 4, rare_materials: 2 },
          { battery: 3, water: 3 },
          { red: { battery: 2, water: 2 }, green: { battery: 1, water: 1 } }
        ),
        risk: 'None',
      },
    },
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
    game_stats: makeStats(
      { battery: 3, water: 3, rare_materials: 2 },
      { battery: 3, water: 2 },
      { red: { battery: 3, water: 2 }, green: { battery: 1, water: 1 } }
    ),
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
    game_stats: makeStats(
      { battery: 2, water: 2, rare_materials: 1 },
      { battery: 2, water: 3 },
      { red: { battery: 2, water: 2 }, green: { battery: 1, water: 1 } }
    ),
    green_transformation: {
      title: 'Precision micro-irrigation',
      effect_desc: 'Green AI only reacts to real changes in soil and weather signals.',
      green_benefit: 0,
      strategy_tip: 'Cheapest path toward a zero-consumption operating site.',
    },
  },
  {
    id: 6,
    name: 'Security Office',
    category: 'Green-by',
    visual_theme: 'eco_growth',
    red_ai_status: {
      problem: 'Always-max surveillance mode',
      description: 'Standard AI runs high-power analytics at all times.',
      eco_impact_fact: 'Context-aware monitoring cuts baseline load significantly.',
    },
    game_stats: makeStats(
      { battery: 3, water: 3, rare_materials: 2 },
      { battery: 2, water: 2 },
      { red: { battery: 3, water: 2 }, green: { battery: 1, water: 1 } }
    ),
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
    game_stats: makeStats(
      { battery: 2, water: 3, rare_materials: 2 },
      { battery: 3, water: 3 },
      { red: { battery: 2, water: 2 }, green: { battery: 1, water: 1 } }
    ),
    green_transformation: {
      title: 'Incremental indexing',
      effect_desc: 'Green AI updates only changed content and caches query results.',
      green_benefit: 0,
      strategy_tip: 'Reliable early target with balanced cost profile.',
    },
  },
  {
    id: 8,
    name: 'Teacher Office',
    category: 'Green-in',
    visual_theme: 'energy_warning',
    red_ai_status: {
      problem: 'Heavy administrative automation',
      description: 'Standard AI performs full-document processing for small updates.',
      eco_impact_fact: 'Most office tasks can be handled with incremental workflows.',
    },
    game_stats: makeStats(
      { battery: 2, water: 2, rare_materials: 1 },
      { battery: 2, water: 2 },
      { red: { battery: 3, water: 2 }, green: { battery: 1, water: 1 } }
    ),
    dual_path: {
      planA: {
        title: 'Full AI Grading',
        description: 'AI autonomously grades all assignments and provides feedback. However, the system may replicate historical grading biases, potentially disadvantaging certain student groups.',
        game_stats: makeStats(
          { battery: 2, water: 2, rare_materials: 1 },
          { battery: 2, water: 2 },
          { red: { battery: 3, water: 2 }, green: { battery: 1, water: 1 } }
        ),
        risk: 'Bias (-4B or -3W)',
      },
      planB: {
        title: 'Human-in-the-Loop Grading',
        description: 'Teachers review AI-generated grades before finalizing them. Higher initial investment in training and workflow integration prevents bias-related incidents entirely.',
        game_stats: makeStats(
          { battery: 3, water: 3, rare_materials: 1 },
          { battery: 3, water: 3 },
          { red: { battery: 2, water: 1 }, green: { battery: 1, water: 1 } }
        ),
        risk: 'None',
      },
    },
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

export const CRISIS_CARDS: CrisisCard[] = [
  {
    card_id: 'bias_01',
    scene: 'teacher_office',
    crisis_type: 'bias',
    title: 'Grading Bias Complaint',
    description: 'Parents report that the AI grader consistently marks essays from multilingual students lower than native speakers. Emergency review and system recalibration required.',
    consequence_type: 'choice',
    options: [
      { option_id: 'A', text: 'Immediate system audit', cost: { battery: 4, water: 0 } },
      { option_id: 'B', text: 'Manual re-grading of affected assignments', cost: { battery: 0, water: 3 } },
    ],
  },
  {
    card_id: 'bias_02',
    scene: 'teacher_office',
    crisis_type: 'bias',
    title: 'Algorithm Favoritism Alert',
    description: 'An internal audit reveals the grading AI assigns higher scores to students using specific writing patterns, regardless of content quality. System-wide retraining needed.',
    consequence_type: 'choice',
    options: [
      { option_id: 'A', text: 'Retrain AI model with balanced dataset', cost: { battery: 4, water: 0 } },
      { option_id: 'B', text: 'Switch to teacher-led grading temporarily', cost: { battery: 0, water: 3 } },
    ],
  },
  {
    card_id: 'bias_03',
    scene: 'teacher_office',
    crisis_type: 'bias',
    title: 'Disciplinary Referral Imbalance',
    description: 'Data shows the AI flags behavioral issues at disproportionate rates for students from specific demographics. Institutional review and corrective action required.',
    consequence_type: 'choice',
    options: [
      { option_id: 'A', text: 'Implement fairness-aware algorithm patch', cost: { battery: 4, water: 0 } },
      { option_id: 'B', text: 'Human oversight committee intervention', cost: { battery: 0, water: 3 } },
    ],
  },
  {
    card_id: 'plagiarism_01',
    scene: 'creative_studio',
    crisis_type: 'plagiarism',
    title: 'Unattributed AI Artwork Scandal',
    description: 'A student\'s award-winning painting is discovered to be 90% AI-generated without disclosure. The school faces public criticism and must address academic integrity policies campus-wide.',
    consequence_type: 'choice',
    options: [
      { option_id: 'A', text: 'Launch campus-wide authorship education program', cost: { battery: 5, water: 0 } },
      { option_id: 'B', text: 'Implement AI detection and disclosure systems', cost: { battery: 3, water: 3 } },
    ],
  },
  {
    card_id: 'plagiarism_02',
    scene: 'creative_studio',
    crisis_type: 'plagiarism',
    title: 'Copyright Infringement Claim',
    description: 'A professional artist alleges that AI-generated student work replicates their copyrighted style without permission. Legal consultation and student re-education necessary.',
    consequence_type: 'choice',
    options: [
      { option_id: 'A', text: 'Conduct legal review and update usage policies', cost: { battery: 5, water: 0 } },
      { option_id: 'B', text: 'Restrict AI tool access pending resolution', cost: { battery: 3, water: 3 } },
    ],
  },
  {
    card_id: 'plagiarism_03',
    scene: 'creative_studio',
    crisis_type: 'plagiarism',
    title: 'Portfolio Authenticity Crisis',
    description: 'College admissions officers question the authenticity of student portfolios containing AI-assisted work. Emergency workshops on creative integrity and transparent documentation required.',
    consequence_type: 'choice',
    options: [
      { option_id: 'A', text: 'Develop portfolio authentication protocols', cost: { battery: 5, water: 0 } },
      { option_id: 'B', text: 'Mandatory artist statements and process logs', cost: { battery: 3, water: 3 } },
    ],
  },
  {
    card_id: 'crisis_01',
    scene: 'mental_health',
    crisis_type: 'misdiagnosis',
    title: 'Missed Suicide Risk Alert',
    description: 'The AI counseling system fails to escalate a student\'s high-risk messages to human counselors. Emergency psychological intervention and system investigation required immediately.',
    consequence_type: 'fixed',
    cost: { battery: 6, water: 0 },
  },
  {
    card_id: 'crisis_02',
    scene: 'mental_health',
    crisis_type: 'misdiagnosis',
    title: 'False Positive Overload',
    description: 'The AI system generates excessive false-positive crisis alerts, overwhelming counseling staff and delaying response to genuine emergencies. Urgent recalibration needed.',
    consequence_type: 'fixed',
    cost: { battery: 6, water: 0 },
  },
  {
    card_id: 'crisis_03',
    scene: 'mental_health',
    crisis_type: 'misdiagnosis',
    title: 'Cultural Misinterpretation Incident',
    description: 'The AI misreads culturally-specific expressions of distress as low-risk, resulting in delayed care for an international student. Cross-cultural training and system updates mandatory.',
    consequence_type: 'fixed',
    cost: { battery: 6, water: 0 },
  },
];
