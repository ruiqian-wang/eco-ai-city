import { Scenario } from './types';

export const SCENARIOS: Scenario[] = [
    {
      "id": 1,
      "name": "AI Tutor",
      "category": "Green-in",
      "visual_theme": "energy_warning",
      "red_ai_status": {
        "problem": "Heavy Cloud Dependency",
        "description": "Red AI: Connects to a massive cloud server for every single question, wasting enough electricity to power 100 laptops[cite: 3014, 3018].",
        "eco_impact_fact": "Carbon footprint is like charging your phone 500 times per session."
      },
      "game_stats": {
        "startup_cost": 7,
        "maintenance_fee": 4,
        "upgrade_cost": 2
      },
      "green_transformation": {
        "title": "Model Distillation",
        "effect_desc": "Green AI: Compresses the AI to run locally on your device[cite: 2905, 3010]. Zero cloud energy used.",
        "green_benefit": 0,
        "strategy_tip": "Low upgrade cost! Great for early-game energy saving."
      }
    },
    {
      "id": 2,
      "name": "AI Art Club",
      "category": "Green-in",
      "visual_theme": "energy_warning",
      "red_ai_status": {
        "problem": "Massive Parameter Training",
        "description": "Red AI: Generating one high-res poster requires thousands of chips running simultaneously[cite: 2672, 3312].",
        "eco_impact_fact": "Training this model emits as much CO2 as flying across the ocean 33 times[cite: 2673, 3700]!"
      },
      "game_stats": {
        "startup_cost": 7,
        "maintenance_fee": 5,
        "upgrade_cost": 3
      },
      "green_transformation": {
        "title": "Green-in: Algorithm Optimization",
        "effect_desc": "Green AI: Uses 'Sparse Training' to cut unnecessary calculations[cite: 2914, 3010]. Maintenance fee becomes 0.",
        "green_benefit": 0,
        "strategy_tip": "Stop the 'Red AI' energy drain early to keep your team's budget safe."
      }
    },
    {
      "id": 3,
      "name": "Med-Bot",
      "category": "Green-in",
      "visual_theme": "energy_warning",
      "red_ai_status": {
        "problem": "Bloated Architecture",
        "description": "Red AI: To get 99% accuracy, the model became too 'heavy' and power-hungry[cite: 2663, 2729].",
        "eco_impact_fact": "Processing one scan uses the same energy as a 5W LED bulb running for 80 minutes[cite: 2677]."
      },
      "game_stats": {
        "startup_cost": 9,
        "maintenance_fee": 5,
        "upgrade_cost": 4
      },
      "green_transformation": {
        "title": "Green-in: Specialized Hardware",
        "effect_desc": "Green AI: Switches from general GPUs to efficient AI chips (TPUs)[cite: 2920, 3011].",
        "green_benefit": -1,
        "strategy_tip": "Upgrading hardware saves 50% energy per turn. A wise long-term investment!"
      }
    },
    {
      "id": 4,
      "name": "Smart Toaster",
      "category": "Green-in",
      "visual_theme": "energy_warning",
      "red_ai_status": {
        "problem": "Inefficient Data Use",
        "description": "Red AI: Uses massive, unfiltered datasets to recognize toast, wasting 80% of its energy[cite: 3466].",
        "eco_impact_fact": "More data doesn't always mean better results—it just means more heat[cite: 2666, 3341]!"
      },
      "game_stats": {
        "startup_cost": 6,
        "maintenance_fee": 4,
        "upgrade_cost": 2
      },
      "green_transformation": {
        "title": "Frugal AI Design",
        "effect_desc": "Green AI: Learns more from less data (Data Efficiency)[cite: 2725, 3723]. Maintenance fee becomes 0.",
        "green_benefit": 0,
        "strategy_tip": "Cheap to start and cheap to upgrade. Good for maintaining team balance."
      }
    },
    {
      "id": 5,
      "name": "Secret Treehole",
      "category": "Green-in",
      "visual_theme": "energy_warning",
      "red_ai_status": {
        "problem": "Computation-Heavy Privacy",
        "description": "Red AI: Complex encryption for your secrets causes the processor to overheat constantly[cite: 3500].",
        "eco_impact_fact": "Privacy is vital, but inefficient code makes it cost an 'arm and a leg' in energy[cite: 3313]."
      },
      "game_stats": {
        "startup_cost": 11,
        "maintenance_fee": 6,
        "upgrade_cost": 5
      },
      "green_transformation": {
        "title": "Privacy-Preserving Efficiency",
        "effect_desc": "Green AI: Uses 'Federated Learning' to protect data with much lower compute power[cite: 2924, 3221].",
        "green_benefit": -1,
        "strategy_tip": "This AI is social but expensive. Make sure your team has a 'Power Buffer' before starting."
      }
    },
    {
      "id": 6,
      "name": "Waste Sorter",
      "category": "Green-by",
      "visual_theme": "eco_growth",
      "red_ai_status": {
        "problem": "Bias & Error Energy",
        "description": "Red AI: Often confuses plastic with paper, forcing the machine to restart and waste power.",
        "eco_impact_fact": "A biased AI is like a broken robot—it consumes energy but creates more work[cite: 2658]."
      },
      "game_stats": {
        "startup_cost": 9,
        "maintenance_fee": 5,
        "upgrade_cost": 4
      },
      "green_transformation": {
        "title": "Green-by AI: Eco-Action",
        "effect_desc": "AI now helps the planet! Boosts campus recycling rates and saves real-world resources[cite: 2731, 3032].",
        "green_benefit": 2,
        "strategy_tip": "TRANSFORM ASAP! This AI returns 2 batteries to the grid every turn."
      }
    },
    {
      "id": 7,
      "name": "Smart Campus Bus",
      "category": "Green-by",
      "visual_theme": "eco_growth",
      "red_ai_status": {
        "problem": "Constant Scanning Drain",
        "description": "Red AI: Scans the entire campus 24/7. It's an 'Energy Vampire' that never sleeps[cite: 2669].",
        "eco_impact_fact": "Training this bus model used energy equivalent to 121 homes for a year[cite: 2672]!"
      },
      "game_stats": {
        "startup_cost": 13,
        "maintenance_fee": 7,
        "upgrade_cost": 6
      },
      "green_transformation": {
        "title": "Green-by AI: Smart Mobility",
        "effect_desc": "AI optimizes routes and reduces campus-wide traffic emissions[cite: 2851, 2854].",
        "green_benefit": 3,
        "strategy_tip": "High initial cost, but the回馈 (3 batteries/turn) is essential for survival."
      }
    },
    {
      "id": 8,
      "name": "Rooftop Farm AI",
      "category": "Green-by",
      "visual_theme": "eco_growth",
      "red_ai_status": {
        "problem": "Redundant Monitoring",
        "description": "Red AI: Monitors every single drop of water with zero regard for energy cost[cite: 3511].",
        "eco_impact_fact": "Red AI buys accuracy by 'spending' massive amounts of your limited batteries[cite: 2901, 3392]."
      },
      "game_stats": {
        "startup_cost": 11,
        "maintenance_fee": 6,
        "upgrade_cost": 5
      },
      "green_transformation": {
        "title": "Green-by AI: Sustainable Agriculture",
        "effect_desc": "AI precisely manages water and fertilizers, saving more energy than it uses[cite: 2863, 2865].",
        "green_benefit": 3,
        "strategy_tip": "A true team player. Use shared funds to upgrade this for a stable grid."
      }
    },
    {
      "id": 9,
      "name": "Gym Weather Station",
      "category": "Green-by",
      "visual_theme": "eco_growth",
      "red_ai_status": {
        "problem": "Supercomputer Overload",
        "description": "Red AI: Predicting rain requires massive data centers that heat up the planet[cite: 2665, 2927].",
        "eco_impact_fact": "Computers used for this are projected to reach 30% of global energy use by 2030[cite: 2669]!"
      },
      "game_stats": {
        "startup_cost": 15,
        "maintenance_fee": 8,
        "upgrade_cost": 8
      },
      "green_transformation": {
        "title": "Green-by AI: Climate Adaptation",
        "effect_desc": "Early warnings prevent disaster damage, saving huge amounts of campus resources[cite: 2878, 3032].",
        "green_benefit": 5,
        "strategy_tip": "The ultimate Eco-Hero. It gives back 5 batteries every single turn!"
      }
    },
    {
      "id": 10,
      "name": "Campus AI Hub",
      "category": "Shared",
      "visual_theme": "system_core",
      "red_ai_status": {
        "problem": "Systemic Inefficiency",
        "description": "Red AI: Connects all devices but has NO energy management. It's a ticking time bomb[cite: 2938].",
        "eco_impact_fact": "If this hub crashes, the whole 'Digital School' goes dark[cite: 3021, 3054]."
      },
      "game_stats": {
        "startup_cost": 18,
        "maintenance_fee": 9,
        "upgrade_cost": 10
      },
      "green_transformation": {
        "title": "Sustainable Tech Governance",
        "effect_desc": "Allows any researcher with a laptop to participate, not just the 'Rich Kids'[cite: 2658, 3321].",
        "green_benefit": 8,
        "strategy_tip": "The Final Boss. Everyone MUST contribute batteries to upgrade this together!"
      }
    }
  ]

export const INITIAL_ENERGY = 60;
export const INITIAL_BATTERIES = 10;
export const WIN_UPGRADE_COUNT = 8;
