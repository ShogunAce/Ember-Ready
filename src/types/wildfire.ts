/**
 * Wildfire household resilience audit types
 * Aligned with CAL FIRE PRC § 4291, AB 3074, and FEMA National Risk Index standards
 */

export interface CaliforniaLocation {
  address: string;
  street: string;
  city: string;
  county: string;
  state: 'CA';
  zipCode: string;
  lat: number;
  lon: number;
  elevationFt?: number;
  geocodedVia: 'google' | 'census' | 'nominatim' | 'curated_ca_index';
}

export type FHSZTier = 'Very High' | 'High' | 'Moderate' | 'Non-Wildland Urban' | 'No FHSZ Designation';
export type ResponsibilityArea = 'SRA' | 'LRA' | 'FRA';

export interface FHSZProfile {
  tier: FHSZTier;
  responsibilityArea: ResponsibilityArea;
  responsibilityAreaFull: string;
  legalMandate: string;
  calFireCode: string;
  description: string;
  isMandatoryZone0: boolean; // AB 3074 0-5ft requirement
  source: string;
  frapLayerUrl?: string;
}

export interface FEMANRIProfile {
  countyName: string;
  wildfireRiskPercentile: number; // 0 - 100
  wildfireRiskRating: 'Very High' | 'Relatively High' | 'Relatively Moderate' | 'Relatively Low' | 'Very Low';
  wildfireExpectedAnnualLossDollars: number;
  communityResilienceScore: number; // 0 - 100
  communityResilienceRating: 'Very High' | 'Relatively High' | 'Relatively Moderate' | 'Relatively Low' | 'Very Low';
  socialVulnerabilityRating: 'Very High' | 'Relatively High' | 'Relatively Moderate' | 'Relatively Low' | 'Very Low';
  source: string;
}

export interface NWSAlert {
  id: string;
  event: string; // e.g. "Red Flag Warning", "Fire Weather Watch"
  headline: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  urgency: string;
  effective: string;
  expires: string;
  description: string;
  instruction?: string;
  isRedFlagWarning: boolean;
}

export interface FireWeatherConditions {
  redFlagActive: boolean;
  activeAlerts: NWSAlert[];
  temperatureF?: number;
  relativeHumidityPct?: number;
  windSpeedMph?: number;
  windGustMph?: number;
  windDirection?: string;
  weatherSummary?: string;
  source: string;
}

export interface FIRMSDetection {
  id: string;
  name?: string;
  latitude: number;
  longitude: number;
  distanceMiles: number;
  brightness?: number;
  confidence?: 'low' | 'nominal' | 'high' | number;
  acqDate: string;
  acqTime?: string;
  instrument?: string; // VIIRS, MODIS, or NIFC Incident
  containmentPct?: number;
  acres?: number;
  isIncident?: boolean;
}

export interface FIRMSSummary {
  nearestFireMiles: number | null;
  activeDetectionsCount25Miles: number;
  activeDetectionsCount50Miles: number;
  detections: FIRMSDetection[];
  source: string;
}

export interface AirQualityData {
  aqi: number;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  categoryColor: string;
  pm25?: number; // ug/m3
  dominantPollutant: string;
  reportingArea: string;
  observationTime: string;
  smokeAdvisory: string;
  source: string;
}

export interface HazardProfile {
  location: CaliforniaLocation;
  fhsz: FHSZProfile;
  femaNri: FEMANRIProfile;
  weather: FireWeatherConditions;
  firms: FIRMSSummary;
  airQuality: AirQualityData;
  timestamp: string;
  apiStatus: {
    geocoding: { live: boolean; provider: string };
    fhsz: { live: boolean; provider: string };
    fema: { live: boolean; provider: string };
    nws: { live: boolean; provider: string };
    firms: { live: boolean; provider: string };
    airNow: { live: boolean; provider: string };
  };
}

// QUIZ & AUDIT HARDENING TYPES
export type ZoneCategory = 
  | 'zone0' // 0-5 ft Ember-Resistant
  | 'zone1' // 5-30 ft Lean, Clean and Green
  | 'zone2' // 30-100 ft Reduced Fuel
  | 'home_hardening' // Structural building elements
  | 'egress'; // Evacuation & Access

export interface QuizOption {
  id: string;
  label: string;
  description?: string;
  points: number; // 0 to 100 relative to this question
  calFireStandardMet: boolean;
  riskPenaltyNotice?: string;
}

export interface QuizQuestion {
  id: string;
  zone: ZoneCategory;
  title: string;
  prompt: string;
  fieldGuidance: string;
  options: QuizOption[];
  calFireCodeRef: string;
  whyItMatters: string;
  weight: number; // Weighting in category
}

export type QuizAnswers = Record<string, string>; // questionId -> optionId

export interface ZoneScore {
  zone: ZoneCategory;
  name: string;
  subtitle: string;
  distanceRange: string;
  score: number; // 0 - 100
  totalPossiblePoints: number;
  earnedPoints: number;
  status: 'Critical Vulnerability' | 'Needs Improvement' | 'Acceptable' | 'CAL FIRE Compliant';
  statusColor: string;
  deficienciesCount: number;
  rationales: {
    questionTitle: string;
    selectedLabel: string;
    pointsEarned: number;
    maxPoints: number;
    compliant: boolean;
    explanation: string;
  }[];
  deductions: {
    questionId: string;
    factor: string;
    selectedLabel: string;
    pointsLost: number;
    codeCitation: string;
    explanation: string;
  }[];
}

export interface HardeningScore {
  overallScore: number; // 0 - 100
  ratingTier: 'Severe Vulnerability' | 'Moderate Hardening Needed' | 'Well Fortified' | 'Exemplary CAL FIRE Standard';
  ratingDescription: string;
  ratingColor: string;
  zones: Record<ZoneCategory, ZoneScore>;
}

export type ActionPriority = 'Immediate / High Impact' | 'Seasonal Maintenance' | 'Capital Hardening Investment' | 'Emergency Protocol';
export type EffortCost = 'DIY ($0)' | 'DIY ($20 - $150)' | 'Moderate ($150 - $600)' | 'Contractor / High ($1000+)';

export interface ActionItem {
  id: string;
  questionId: string;
  title: string;
  zone: ZoneCategory;
  zoneLabel: string;
  priority: ActionPriority;
  impactScore: number; // 1 to 10
  effortCost: EffortCost;
  estimatedCostRange: string;
  calFireCode: string;
  instructions: string;
  materialsNeeded?: string[];
  insuranceRebateEligible: boolean; // Safer from Wildfires standard
  completed: boolean;
}

export interface ResourceLink {
  title: string;
  category: 'Evacuation & Dispatch' | 'CAL FIRE Inspection' | 'Insurance & Rebates' | 'Local Fire Safe Council';
  url: string;
  description: string;
  isOfficialGov: boolean;
}

export interface AuditReport {
  id: string;
  createdAt: string;
  updatedAt: string;
  hazardProfile: HazardProfile;
  quizAnswers: QuizAnswers;
  hardeningScore: HardeningScore;
  actionItems: ActionItem[];
  userNotes?: string;
}
