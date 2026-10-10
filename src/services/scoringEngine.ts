/**
 * CAL FIRE Defensible Space & Home Hardening Scoring Engine
 * Computes transparent, auditable scores and prioritized action plans based on real standards.
 */

import {
  ActionItem,
  HardeningScore,
  QuizAnswers,
  QuizOption,
  QuizQuestion,
  ZoneCategory,
  ZoneScore,
} from '../types/wildfire';
import { QUIZ_QUESTIONS, ZONE_METADATA } from '../data/quizStandards';

const ZONE_WEIGHTS: Record<ZoneCategory, number> = {
  zone0: 0.25, // 25%: AB 3074 Ember-resistant zone (highest structural ignition threat)
  home_hardening: 0.35, // 35%: Roof, vents, siding, windows (90% structural loss factor)
  zone1: 0.20, // 20%: 5-30 ft Lean, Clean, and Green buffer
  zone2: 0.10, // 10%: 30-100 ft Fuel reduction
  egress: 0.10, // 10%: Life safety, evacuation corridor, fire engine clearance
};

export function calculateHardeningAudit(answers: QuizAnswers): {
  hardeningScore: HardeningScore;
  actionItems: ActionItem[];
} {
  const zoneCategories: ZoneCategory[] = [
    'zone0',
    'zone1',
    'zone2',
    'home_hardening',
    'egress',
  ];

  const zonesResult: Partial<Record<ZoneCategory, ZoneScore>> = {};
  const actionItems: ActionItem[] = [];

  for (const zone of zoneCategories) {
    const questionsInZone = QUIZ_QUESTIONS.filter((q) => q.zone === zone);
    let totalWeightedPoints = 0;
    let earnedWeightedPoints = 0;
    let deficienciesCount = 0;
    const rationales: ZoneScore['rationales'] = [];
    const deductions: ZoneScore['deductions'] = [];

    for (const q of questionsInZone) {
      const selectedOptionId = answers[q.id];
      const selectedOption: QuizOption | undefined =
        q.options.find((opt) => opt.id === selectedOptionId) || q.options[q.options.length - 1]; // Default to lowest if unanswered

      const maxPoints = 100;
      const points = selectedOption ? selectedOption.points : 0;
      const weight = q.weight;

      totalWeightedPoints += maxPoints * weight;
      earnedWeightedPoints += points * weight;

      const compliant = selectedOption ? selectedOption.calFireStandardMet : false;
      if (!compliant) {
        deficienciesCount++;
        const pointsLost = Math.round(100 - points);
        deductions.push({
          questionId: q.id,
          factor: q.title,
          selectedLabel: selectedOption.label,
          pointsLost,
          codeCitation: q.calFireCodeRef,
          explanation: selectedOption.riskPenaltyNotice || q.whyItMatters,
        });
      }

      // Rationale explanation
      const explanation = compliant
        ? `Compliant with ${q.calFireCodeRef}. ${selectedOption.label}`
        : `${selectedOption.riskPenaltyNotice || 'Does not meet current CAL FIRE defensible space recommendations.'} (${q.calFireCodeRef})`;

      rationales.push({
        questionTitle: q.title,
        selectedLabel: selectedOption.label,
        pointsEarned: points,
        maxPoints: 100,
        compliant,
        explanation,
      });

      // Generate action item if gap exists
      if (!compliant) {
        const action = createActionItemForQuestion(q, selectedOption);
        if (action) {
          actionItems.push(action);
        }
      }
    }

    const rawScore = totalWeightedPoints > 0 ? (earnedWeightedPoints / totalWeightedPoints) * 100 : 0;
    const finalZoneScore = Math.round(rawScore);

    let status: ZoneScore['status'] = 'Critical Vulnerability';
    let statusColor = '#C23B22'; // alert red
    if (finalZoneScore >= 90) {
      status = 'CAL FIRE Compliant';
      statusColor = '#6B7F5E'; // sage green
    } else if (finalZoneScore >= 70) {
      status = 'Acceptable';
      statusColor = '#7A8C66';
    } else if (finalZoneScore >= 45) {
      status = 'Needs Improvement';
      statusColor = '#D48B38'; // ochre
    }

    const meta = ZONE_METADATA[zone];
    zonesResult[zone] = {
      zone,
      name: meta.name,
      subtitle: meta.subtitle,
      distanceRange: meta.distanceRange,
      score: finalZoneScore,
      totalPossiblePoints: Math.round(totalWeightedPoints),
      earnedPoints: Math.round(earnedWeightedPoints),
      status,
      statusColor,
      deficienciesCount,
      rationales,
      deductions,
    };
  }

  // Calculate overall weighted score
  let weightedTotal = 0;
  for (const zone of zoneCategories) {
    const zScore = zonesResult[zone]?.score || 0;
    weightedTotal += zScore * ZONE_WEIGHTS[zone];
  }
  const overallScore = Math.round(weightedTotal);

  let ratingTier: HardeningScore['ratingTier'] = 'Severe Vulnerability';
  let ratingDescription =
    'Significant vulnerability to wind-blown embers and wildfire flame contact. High likelihood of ignition under extreme fire weather.';
  let ratingColor = '#C23B22';

  if (overallScore >= 90) {
    ratingTier = 'Exemplary CAL FIRE Standard';
    ratingDescription =
      'Outstanding compliance with California Public Resources Code § 4291 and Chapter 7A home hardening. Structure is prepared to survive ember storms.';
    ratingColor = '#6B7F5E';
  } else if (overallScore >= 75) {
    ratingTier = 'Well Fortified';
    ratingDescription =
      'Good baseline defensible space and structural defense. Minor improvements needed in Zone 0 or vent screenings to reach full compliance.';
    ratingColor = '#7A8C66';
  } else if (overallScore >= 50) {
    ratingTier = 'Moderate Hardening Needed';
    ratingDescription =
      'Multiple actionable vulnerabilities identified, particularly around ember intrusion points or combustible surface fuels.';
    ratingColor = '#D48B38';
  }

  // Sort action items by impact score (highest impact first)
  actionItems.sort((a, b) => b.impactScore - a.impactScore);

  return {
    hardeningScore: {
      overallScore,
      ratingTier,
      ratingDescription,
      ratingColor,
      zones: zonesResult as Record<ZoneCategory, ZoneScore>,
    },
    actionItems,
  };
}

function createActionItemForQuestion(
  q: QuizQuestion,
  selectedOption: QuizOption
): ActionItem | null {
  const zoneMeta = ZONE_METADATA[q.zone];

  switch (q.id) {
    case 'z0_ground_cover':
      return {
        id: 'act_z0_mulch',
        questionId: q.id,
        title: 'Establish 0–5 Ft Non-Combustible Ground Buffer',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Immediate / High Impact',
        impactScore: 10,
        effortCost: 'DIY ($20 - $150)',
        estimatedCostRange: '$20 – $100 (DIY gravel or paver border)',
        calFireCode: 'CAL FIRE AB 3074 / PRC § 4291(a)(1)(B)',
        instructions:
          'Rake away all organic mulch, bark chips, and dry leaves within 5 feet of exterior siding and foundation. Replace with pea gravel, crushed granite, pavers, or bare earth. Do not allow organic bark to contact siding.',
        materialsNeeded: ['Rake', 'Wheelbarrow', 'Gravel or decomposed granite', 'Landscape fabric border'],
        insuranceRebateEligible: true,
        completed: false,
      };

    case 'z0_vegetation':
      return {
        id: 'act_z0_plants',
        questionId: q.id,
        title: 'Remove Combustible Shrubs from House Perimeter',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Immediate / High Impact',
        impactScore: 9,
        effortCost: 'DIY ($0)',
        estimatedCostRange: '$0 (DIY pruning / shovel removal)',
        calFireCode: 'CAL FIRE AB 3074 Standard',
        instructions:
          'Remove volatile shrubs like junipers, arborvitae, cypress, and climbing ivy located directly against walls or beneath windows. If planting, substitute with widely spaced, hydrated succulents.',
        materialsNeeded: ['Loppers', 'Pruning saw', 'Heavy work gloves'],
        insuranceRebateEligible: true,
        completed: false,
      };

    case 'z0_combustible_storage':
      return {
        id: 'act_z0_firewood',
        questionId: q.id,
        title: 'Relocate Firewood & Combustibles 30+ Feet from Structure',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Immediate / High Impact',
        impactScore: 10,
        effortCost: 'DIY ($0)',
        estimatedCostRange: '$0 (Physical relocation)',
        calFireCode: 'CAL FIRE PRC § 4291(a)(1)',
        instructions:
          'Move all firewood piles, lumber scraps, wicker furniture, and plastic recycling bins at least 30 feet away from the home. Never store firewood on or under wooden decks.',
        materialsNeeded: ['Work gloves', 'Tarp or dedicated firewood rack 30 ft away'],
        insuranceRebateEligible: true,
        completed: false,
      };

    case 'z1_tree_spacing':
      return {
        id: 'act_z1_trees',
        questionId: q.id,
        title: 'Thin Tree Canopies to 10-Foot Horizontal Spacing',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Seasonal Maintenance',
        impactScore: 8,
        effortCost: 'Moderate ($150 - $600)',
        estimatedCostRange: '$150 – $600 (Arborist pruning or DIY pole saw)',
        calFireCode: 'CAL FIRE PRC § 4291(a)(1)(A)',
        instructions:
          'Prune tree branches to maintain at least 10 feet of clear sky between neighboring tree crowns in the 5–30 foot zone. Remove any limbs overhanging your roofline within 10 feet of chimneys.',
        materialsNeeded: ['Pole saw', 'Tree service contractor if on steep slope'],
        insuranceRebateEligible: false,
        completed: false,
      };

    case 'z1_ladder_fuels':
      return {
        id: 'act_z1_ladder',
        questionId: q.id,
        title: 'Prune Lower Tree Branches 6 Feet from Ground',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Immediate / High Impact',
        impactScore: 9,
        effortCost: 'DIY ($0)',
        estimatedCostRange: '$0 (DIY pruning)',
        calFireCode: 'CAL FIRE PRC § 4291(a)(1)(A)',
        instructions:
          'Eliminate "ladder fuels" by cutting off all lower tree limbs up to 6 feet from the ground (or up to 1/3 tree height for smaller trees). Clear brush growing directly beneath the tree canopy drip line.',
        materialsNeeded: ['Pruning saw', 'Bypass loppers', 'Yard waste bags'],
        insuranceRebateEligible: false,
        completed: false,
      };

    case 'z1_lawn_ground_condition':
      return {
        id: 'act_z1_surface',
        questionId: q.id,
        title: 'Mow Grass Under 4 Inches & Clear Pine Needle Mats',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Seasonal Maintenance',
        impactScore: 7,
        effortCost: 'DIY ($0)',
        estimatedCostRange: '$0 (Routine seasonal yard care)',
        calFireCode: 'CAL FIRE PRC § 4291(a)(1)(A)',
        instructions:
          'Keep all dry grass cut to 4 inches or less throughout fire season (May through November). Rake fallen pine needles and dry leaves so accumulation does not exceed 1/2 inch in depth.',
        materialsNeeded: ['Lawnmower', 'Leaf rake', 'Compost / green bin'],
        insuranceRebateEligible: false,
        completed: false,
      };

    case 'z2_fuel_reduction':
      return {
        id: 'act_z2_grass',
        questionId: q.id,
        title: 'Abate Tall Annual Weeds in Zone 2 (30–100 Ft)',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Seasonal Maintenance',
        impactScore: 7,
        effortCost: 'DIY ($20 - $150)',
        estimatedCostRange: '$0 – $100 (Weed trimmer rental or string)',
        calFireCode: 'CAL FIRE PRC § 4291(a)(2)',
        instructions:
          'Complete annual weed abatement by June 1st. Use string trimmers early in the morning before 10:00 AM (never in hot windy afternoon conditions when metal blades can strike rocks and spark fires).',
        materialsNeeded: ['String trimmer / weed whacker with plastic line', 'Safety glasses'],
        insuranceRebateEligible: false,
        completed: false,
      };

    case 'z2_downed_wood':
      return {
        id: 'act_z2_downed',
        questionId: q.id,
        title: 'Chip or Remove Accumulated Brush & Slash Piles',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Seasonal Maintenance',
        impactScore: 6,
        effortCost: 'Moderate ($150 - $600)',
        estimatedCostRange: '$0 – $250 (Local Fire Safe Council chipper day)',
        calFireCode: 'CAL FIRE PRC § 4291(a)(2)',
        instructions:
          'Take advantage of your local Fire Safe Council free curbside chipping program, or haul dry brush piles to an authorized green waste facility. Scattered sound logs over 3 inches are acceptable.',
        materialsNeeded: ['Fire Safe Council chipper sign-up or trailer haul'],
        insuranceRebateEligible: false,
        completed: false,
      };

    case 'hh_roof_material':
      return {
        id: 'act_hh_roof',
        questionId: q.id,
        title: 'Upgrade to Class A Fire-Rated Roof Covering',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Capital Hardening Investment',
        impactScore: 10,
        effortCost: 'Contractor / High ($1000+)',
        estimatedCostRange: 'High Capital Investment ($10,000+ when reroofing)',
        calFireCode: 'CBC Chapter 7A § 705A',
        instructions:
          'When replacing your roof, specify Class A rated architectural composition shingles, standing seam metal, or clay/concrete tile. For existing tile roofs, install metal "bird stops" at eave edges to block ember entry.',
        materialsNeeded: ['Class A rated roofing assembly', 'Licensed C-39 roofing contractor'],
        insuranceRebateEligible: true,
        completed: false,
      };

    case 'hh_gutters_valleys':
      return {
        id: 'act_hh_gutters',
        questionId: q.id,
        title: 'Clean Gutters & Install Non-Combustible Ember Guards',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Immediate / High Impact',
        impactScore: 9,
        effortCost: 'DIY ($20 - $150)',
        estimatedCostRange: '$50 – $200 (DIY metal gutter guards)',
        calFireCode: 'CAL FIRE PRC § 4291(a)(6)',
        instructions:
          'Clean all pine needles and leaves from gutters and roof valleys. Install non-combustible corrosion-resistant aluminum or stainless steel micro-mesh gutter guards to prevent re-accumulation.',
        materialsNeeded: ['Metal gutter guards', 'Ladder stabilizer', 'Gutter scoop'],
        insuranceRebateEligible: true,
        completed: false,
      };

    case 'hh_vents':
      return {
        id: 'act_hh_vents',
        questionId: q.id,
        title: 'Retrofit Vents with 1/8-Inch Corrosion-Resistant Mesh',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Immediate / High Impact',
        impactScore: 10,
        effortCost: 'DIY ($20 - $150)',
        estimatedCostRange: '$30 – $120 (DIY mesh retrofit) or $300-$600 (Vulcan vents)',
        calFireCode: 'CBC Chapter 7A § 706A & Safer from Wildfires',
        instructions:
          'Retrofit all attic, soffit, gable, and crawlspace vents with 1/8-inch or 1/16-inch galvanized or stainless steel hardware cloth. Alternatively, install certified ember-resistant flame-baffle vents.',
        materialsNeeded: ['1/8" galvanized wire mesh roll', 'Tin snips', 'Staple gun or exterior screws'],
        insuranceRebateEligible: true,
        completed: false,
      };

    case 'hh_eaves_soffits':
      return {
        id: 'act_hh_eaves',
        questionId: q.id,
        title: 'Enclose Open Eaves with Non-Combustible Soffit Panels',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Capital Hardening Investment',
        impactScore: 8,
        effortCost: 'Contractor / High ($1000+)',
        estimatedCostRange: '$1,500 – $4,500 (Contractor boxing)',
        calFireCode: 'CBC Chapter 7A § 707A',
        instructions:
          'Box in exposed rafter tails under roof overhangs with fiber-cement panels (e.g. HardieSoffit) or non-combustible stucco finish to eliminate pockets where heat and embers accumulate.',
        materialsNeeded: ['Fiber cement soffit panels', 'Corrosion-resistant fasteners'],
        insuranceRebateEligible: true,
        completed: false,
      };

    case 'hh_siding_material':
      return {
        id: 'act_hh_siding',
        questionId: q.id,
        title: 'Establish 6-Inch Foundation Reveal & Hardened Siding',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Capital Hardening Investment',
        impactScore: 8,
        effortCost: 'Moderate ($150 - $600)',
        estimatedCostRange: '$100 – $500 (DIY flashing / gravel reveal) or contractor re-siding',
        calFireCode: 'CBC Chapter 7A § 707A',
        instructions:
          'Ensure the bottom 6 inches of your exterior wall is exposed non-combustible foundation concrete (not siding in contact with soil/mulch). On wood siding, caulk all joint gaps and touch up weather-resistant paint.',
        materialsNeeded: ['Exterior fire-rated caulk', 'Concrete/metal flashing', 'Exterior paint'],
        insuranceRebateEligible: true,
        completed: false,
      };

    case 'hh_deck_porch':
      return {
        id: 'act_hh_deck',
        questionId: q.id,
        title: 'Clear & Enclose Underside of Combustible Decks',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Immediate / High Impact',
        impactScore: 9,
        effortCost: 'DIY ($20 - $150)',
        estimatedCostRange: '$30 – $150 (Wire mesh skirting + ground gravel)',
        calFireCode: 'CBC Chapter 7A § 709A & Safer from Wildfires',
        instructions:
          'Remove all firewood, lumber, furniture, and plastic storage from beneath decks. Clear the ground under the deck to bare mineral soil or gravel. Enclose deck perimeter with 1/8" metal mesh to stop embers blowing underneath.',
        materialsNeeded: ['1/8" galvanized wire mesh', 'Framing staples', 'Pea gravel'],
        insuranceRebateEligible: true,
        completed: false,
      };

    case 'hh_windows_glazing':
      return {
        id: 'act_hh_windows',
        questionId: q.id,
        title: 'Upgrade Single-Pane Windows or Install Metal Window Screens',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Capital Hardening Investment',
        impactScore: 8,
        effortCost: 'Moderate ($150 - $600)',
        estimatedCostRange: '$50 – $200 (Heavy metal exterior screens) to $500+/window (tempered replacement)',
        calFireCode: 'CBC Chapter 7A § 708A',
        instructions:
          'Replace single-pane windows with dual-pane units having at least one tempered glass pane. As an immediate lower-cost interim measure, install heavy-duty metal window screens on all exterior windows (screens deflect radiant heat and embers).',
        materialsNeeded: ['Heavy aluminum window insect screens', 'Dual-pane tempered window units'],
        insuranceRebateEligible: true,
        completed: false,
      };

    case 'egress_routes':
      return {
        id: 'act_eg_routes',
        questionId: q.id,
        title: 'Pre-Plan Secondary Evacuation Corridor & Early Trigger',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Emergency Protocol',
        impactScore: 10,
        effortCost: 'DIY ($0)',
        estimatedCostRange: '$0 (Family emergency planning)',
        calFireCode: 'CAL FIRE PRC § 4290 & Local OES Evacuation Plan',
        instructions:
          'Map out primary and secondary evacuation corridors in Genasys Protect or Watch Duty. If living in a single-access canyon or dead-end road, set your household rule to EVACUATE IMMEDIATELY upon any Evacuation Warning — never wait for mandatory orders.',
        materialsNeeded: ['Printed evacuation map in go-bag', 'Watch Duty app notifications set to county'],
        insuranceRebateEligible: false,
        completed: false,
      };

    case 'egress_driveway_clearance':
      return {
        id: 'act_eg_driveway',
        questionId: q.id,
        title: 'Prune Driveway Overhead Clearance to 14 Feet',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Immediate / High Impact',
        impactScore: 8,
        effortCost: 'DIY ($0)',
        estimatedCostRange: '$0 (DIY pole saw clearance)',
        calFireCode: 'CAL FIRE PRC § 4290 Subchapter 2',
        instructions:
          'Prune all tree branches hanging over your driveway up to 14 feet vertical clearance. Ensure the drivable width is at least 12 feet so CAL FIRE Type 3 fire engines can navigate and access water connections.',
        materialsNeeded: ['Pole saw', 'Measuring tape / 14ft pole check'],
        insuranceRebateEligible: false,
        completed: false,
      };

    case 'egress_address_signage':
      return {
        id: 'act_eg_signage',
        questionId: q.id,
        title: 'Install Reflective 4-Inch Address Sign at Street',
        zone: q.zone,
        zoneLabel: zoneMeta.name,
        priority: 'Emergency Protocol',
        impactScore: 8,
        effortCost: 'DIY ($20 - $150)',
        estimatedCostRange: '$25 – $40 (Local Fire Safe Council reflective sign)',
        calFireCode: 'CAL FIRE PRC § 4290 § 1274',
        instructions:
          'Mount 4-inch tall reflective numbers on a high-contrast reflective green or aluminum plate at your driveway entrance, visible from both directions of travel. Responding out-of-area fire crews depend on these in heavy smoke.',
        materialsNeeded: ['Fire Safe Council reflective address plate', 'Metal fence post or post clamp'],
        insuranceRebateEligible: false,
        completed: false,
      };

    default:
      return null;
  }
}
