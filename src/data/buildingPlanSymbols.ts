import { PlanSymbolItem } from '../types/sans';

export const SA_ELECTRICAL_SYMBOLS: PlanSymbolItem[] = [
  // --- SWITCHES ---
  {
    id: 'sw_1way',
    name: 'One-Way Light Switch (Single Pole)',
    category: 'switches',
    standardRef: 'SANS 10143 / SANS 10142-1',
    description: 'Standard single-throw light switch controlling one lighting circuit.',
    mountingHeightAffMm: 1250,
    symbolIcon: 'switch_1way',
    specs: '16A 250V AC. Mounted at 1200mm - 1400mm Above Finished Floor (AFF), typically strike-side of door jamb.',
  },
  {
    id: 'sw_2way',
    name: 'Two-Way Light Switch',
    category: 'switches',
    standardRef: 'SANS 10143 / SANS 10142-1',
    description: 'Two-way switch for dual-location control of lighting (hallways, stairwells, master bedrooms).',
    mountingHeightAffMm: 1250,
    symbolIcon: 'switch_2way',
    specs: '16A 250V AC changeover. Requires 3-core strap wiring between switches.',
  },
  {
    id: 'sw_intermediate',
    name: 'Intermediate Switch',
    category: 'switches',
    standardRef: 'SANS 10143 / SANS 10142-1',
    description: 'Intermediate 4-terminal cross-over switch for 3 or more control positions on a single luminaire circuit.',
    mountingHeightAffMm: 1250,
    symbolIcon: 'switch_intermediate',
    specs: '16A 250V AC cross-switching. Wired between two 2-way switches.',
  },
  {
    id: 'sw_dimmer',
    name: 'Dimmer Switch / Controller',
    category: 'switches',
    standardRef: 'SANS 10142-1 Clause 6.5',
    description: 'Rotary or push-button electronic phase-cut (trailing/leading edge) dimmer.',
    mountingHeightAffMm: 1250,
    symbolIcon: 'switch_dimmer',
    specs: '400W - 600W LED/Universal. Neutral required for flicker-free smart dimming modules.',
  },

  // --- SOCKETS ---
  {
    id: 'sso_standard',
    name: 'Switched Socket Outlet (SSO 16A)',
    category: 'sockets',
    standardRef: 'SANS 164-1 (Type M / Standard 3-Pin)',
    description: 'Standard South African large 3-pin round earth socket with rocker switch.',
    mountingHeightAffMm: 300,
    symbolIcon: 'sso_standard',
    specs: '16A 250V AC. 300mm AFF in living areas / bedrooms; 1100mm AFF above kitchen worktops.',
  },
  {
    id: 'sso_double',
    name: 'Double Switched Socket Outlet (2x SSO)',
    category: 'sockets',
    standardRef: 'SANS 164-1 & SANS 164-2 combination',
    description: 'Dual socket outlet featuring one standard SANS 164-1 3-pin and one SANS 164-2 hexagonal socket.',
    mountingHeightAffMm: 300,
    symbolIcon: 'sso_double',
    specs: '16A combined rating. 2x4 or 4x4 wall box mounting with integral safety shutters.',
  },
  {
    id: 'sso_dedicated',
    name: 'Dedicated Socket Outlet (Clean / UPS)',
    category: 'sockets',
    standardRef: 'SANS 164-4 (Flat Earth Pin / Red Faceplate)',
    description: 'Dedicated socket with flattened round earth pin to restrict appliance plug-in to authorized IT/UPS gear.',
    mountingHeightAffMm: 300,
    symbolIcon: 'sso_dedicated',
    specs: '16A 250V. Red or black faceplate for computer equipment / servers; fed via UPS or inverter sub-DB.',
  },
  {
    id: 'sso_weatherproof',
    name: 'Weatherproof Outdoor Socket (IP65/IP66)',
    category: 'sockets',
    standardRef: 'SANS 10142-1 Clause 6.1.2',
    description: 'Surface-mounted industrial polycarbonate enclosure with silicone gasket seal and spring-loaded flap.',
    mountingHeightAffMm: 450,
    symbolIcon: 'sso_weatherproof',
    specs: 'IP65 minimum for outdoor patios, garden pumps, and gate motors. Mandatory 30mA RCD protection.',
  },

  // --- ISOLATORS ---
  {
    id: 'iso_geyser',
    name: 'Geyser Disconnector / Isolator',
    category: 'isolators',
    standardRef: 'SANS 10142-1 Clause 6.15',
    description: 'Double pole switch with neon pilot light to disconnect water heater element.',
    mountingHeightAffMm: 1500,
    symbolIcon: 'iso_geyser',
    specs: 'Double Pole 30A / 20A. Must be located within 1.5m of the geyser and easily accessible from the ceiling trap door.',
  },
  {
    id: 'iso_stove',
    name: 'Stove Disconnector / Isolator',
    category: 'isolators',
    standardRef: 'SANS 10142-1 Clause 6.16',
    description: 'Double pole high-current isolating switch for electric oven / hob.',
    mountingHeightAffMm: 1400,
    symbolIcon: 'iso_stove',
    specs: 'Double Pole 45A / 60A. Located within 1.5m of stove cooking surface, but NOT directly above cooking plates.',
  },
  {
    id: 'iso_aircon',
    name: 'Air Conditioner Rotary Isolator',
    category: 'isolators',
    standardRef: 'SANS 10142-1 Clause 6.13',
    description: 'Weatherproof lockable rotary disconnector for condenser condensing unit.',
    mountingHeightAffMm: 1200,
    symbolIcon: 'iso_aircon',
    specs: '20A / 32A 2-pole or 4-pole IP65. Located within arm’s reach (1.5m) of condensing unit for service technician safety.',
  },

  // --- LIGHTING ---
  {
    id: 'lum_ceiling',
    name: 'Ceiling Luminaire (Downlight / Pendant)',
    category: 'lighting',
    standardRef: 'SANS 10142-1 Clause 6.6',
    description: 'Ceiling-mounted circular luminaire or recessed LED downlight point.',
    mountingHeightAffMm: 2400,
    symbolIcon: 'lum_ceiling',
    specs: 'Class II or earthed Class I fitting. Max 660W or 16A breaker allocation per branch.',
  },
  {
    id: 'lum_fluorescent',
    name: 'Linear Fluorescent / LED Batten',
    category: 'lighting',
    standardRef: 'SANS 10142-1 Clause 6.6',
    description: 'Linear 1200mm / 1500mm vapor-proof or decorative surface batten.',
    mountingHeightAffMm: 2400,
    symbolIcon: 'lum_fluorescent',
    specs: '1x or 2x 36W / 58W equivalent LED. High power factor (>0.90) electronic ballast.',
  },
  {
    id: 'lum_floodlight',
    name: 'Outdoor Security Floodlight with PIR',
    category: 'lighting',
    standardRef: 'SANS 10142-1 Clause 6.1.2',
    description: 'Exterior high-output LED floodlight with integrated infrared motion detector.',
    mountingHeightAffMm: 2800,
    symbolIcon: 'lum_floodlight',
    specs: '30W - 100W IP65. Daylight override sensor with manual DB bypass switch.',
  },

  // --- DISTRIBUTION ---
  {
    id: 'dist_main_db',
    name: 'Main Distribution Board (MDB)',
    category: 'distribution',
    standardRef: 'SANS 10142-1 Clause 6.7',
    description: 'Main incoming switchboard housing utility main isolator, surge protection (SPD), and circuit breakers.',
    mountingHeightAffMm: 1700,
    symbolIcon: 'dist_main_db',
    specs: 'Enclosure top height max 2200mm, bottom min 500mm AFF. Incomer accessible without tool or ladder.',
  },
  {
    id: 'dist_sub_db',
    name: 'Sub-Distribution Board (Sub-DB)',
    category: 'distribution',
    standardRef: 'SANS 10142-1 Clause 6.7',
    description: 'Secondary distribution board for garage, workshop, solar plant, or upper floor.',
    mountingHeightAffMm: 1700,
    symbolIcon: 'dist_sub_db',
    specs: 'Fitted with dedicated local main switch disconnector and IP2X deadfront barriers.',
  },
];

// SANS 10142-1 Table 6.1 - Conduit Fill Capacities
// 40% Maximum Space Factor for straight runs up to 10m with no more than 2 right-angle bends
export interface ConduitSizeSpec {
  outerDiameterMm: number;
  innerDiameterMm: number;
  internalAreaMm2: number;
  usableAreaMm2_40pct: number;
  maxWires: Record<number, number>; // gauge mm2 -> max wires
}

export const SANS_CONDUIT_SPECS: Record<number, ConduitSizeSpec> = {
  16: {
    outerDiameterMm: 16,
    innerDiameterMm: 13.0,
    internalAreaMm2: 132.7,
    usableAreaMm2_40pct: 53.1,
    maxWires: {
      1.5: 5,
      2.5: 3,
      4.0: 2,
      6.0: 1,
      10.0: 0,
    },
  },
  20: {
    outerDiameterMm: 20,
    innerDiameterMm: 16.8,
    internalAreaMm2: 221.7,
    usableAreaMm2_40pct: 88.7,
    maxWires: {
      1.5: 8,
      2.5: 6,
      4.0: 4,
      6.0: 3,
      10.0: 1,
    },
  },
  25: {
    outerDiameterMm: 25,
    innerDiameterMm: 21.5,
    internalAreaMm2: 363.0,
    usableAreaMm2_40pct: 145.2,
    maxWires: {
      1.5: 14,
      2.5: 10,
      4.0: 6,
      6.0: 5,
      10.0: 3,
    },
  },
  32: {
    outerDiameterMm: 32,
    innerDiameterMm: 28.0,
    internalAreaMm2: 615.7,
    usableAreaMm2_40pct: 246.3,
    maxWires: {
      1.5: 25,
      2.5: 18,
      4.0: 12,
      6.0: 9,
      10.0: 6,
    },
  },
};

// Conductor overall area approximations (including PVC insulation)
export const WIRE_GAUGE_AREAS: Record<number, { nominalArea: number; overallDiaMm: number; overallAreaMm2: number }> = {
  1.5: { nominalArea: 1.5, overallDiaMm: 3.0, overallAreaMm2: 7.1 },
  2.5: { nominalArea: 2.5, overallDiaMm: 3.6, overallAreaMm2: 10.2 },
  4.0: { nominalArea: 4.0, overallDiaMm: 4.4, overallAreaMm2: 15.2 },
  6.0: { nominalArea: 6.0, overallDiaMm: 5.0, overallAreaMm2: 19.6 },
  10.0: { nominalArea: 10.0, overallDiaMm: 6.4, overallAreaMm2: 32.2 },
  16.0: { nominalArea: 16.0, overallDiaMm: 7.8, overallAreaMm2: 47.8 },
};
