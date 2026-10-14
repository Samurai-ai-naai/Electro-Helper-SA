import { DiagnosticTreeNode } from '../types/sans';

export interface DiagnosticTree {
  id: string;
  title: string;
  subtitle: string;
  category: 'electrical' | 'hvac' | 'solar';
  initialNodeId: string;
  nodes: Record<string, DiagnosticTreeNode>;
}

export const DIAGNOSTIC_TREES: DiagnosticTree[] = [
  // --- TREE 1: EARTH LEAKAGE NUISANCE TRIPPING ---
  {
    id: 'earth_leakage_tripping',
    title: 'Nuisance Earth Leakage Tripping (30mA ELCB/RCD)',
    subtitle: 'Step-by-step SANS 10142 systematic fault isolation for DB nuisance trips',
    category: 'electrical',
    initialNodeId: 'el_step_1',
    nodes: {
      el_step_1: {
        id: 'el_step_1',
        treeId: 'earth_leakage_tripping',
        stepNumber: 1,
        title: 'Initial Breaker Shedding & Reset',
        instruction: 'Turn OFF all circuit breakers fed downstream of the 30mA Earth Leakage unit. Leave the main isolator ON. Now attempt to re-engage the Earth Leakage switch.',
        multimeterSetting: 'Visual inspection',
        safetyWarning: 'Ensure fingers remain behind the IP2X deadfront panel. Do not touch exposed live busbars.',
        expectedReading: 'ELCB lever remains up in the closed position without instantly snapping down.',
        options: [
          {
            label: 'ELCB trips immediately even with all sub-breakers OFF',
            outcomeSummary: 'Direct Neutral-to-Earth fault inside the DB or on a common neutral bar.',
            nextNodeId: 'el_step_ne_fault',
          },
          {
            label: 'ELCB stays UP successfully with all sub-breakers OFF',
            outcomeSummary: 'The fault is on one of the individual branch circuits.',
            nextNodeId: 'el_step_branch_shedding',
          },
        ],
      },
      el_step_ne_fault: {
        id: 'el_step_ne_fault',
        treeId: 'earth_leakage_tripping',
        stepNumber: 2,
        title: 'Neutral-to-Earth Insulation Resistance Test',
        instruction: 'Switch OFF the Main Supply Isolator. Disconnect the main incoming neutral cable from the neutral busbar to isolate the installation from the municipal grid neutral. Set your Insulation Tester (Megger) to 500V DC. Connect one probe to the DB Neutral bar and the other probe to the DB Earth bar.',
        multimeterSetting: 'Insulation Tester @ 500V DC (MΩ scale)',
        safetyWarning: 'Confirm 0.0V AC between Phase and Neutral before initiating 500V test pulses.',
        expectedReading: 'Mandatory minimum 1.0 MΩ (SANS 10142-1 Clause 8.6.3). A healthy DB reads >50 MΩ.',
        options: [
          {
            label: 'Reading is < 1.0 MΩ (e.g. 0.02 MΩ or 0.00 Ω dead short)',
            outcomeSummary: 'Confirmed Neutral-Earth short circuit or dampness.',
            nextNodeId: 'el_step_ne_isolation',
          },
          {
            label: 'Reading is > 1.0 MΩ (Insulation healthy)',
            outcomeSummary: 'ELCB internal mechanical latch failure or transient capacitive leakage.',
            nextNodeId: 'el_step_elcb_test',
          },
        ],
      },
      el_step_branch_shedding: {
        id: 'el_step_branch_shedding',
        treeId: 'earth_leakage_tripping',
        stepNumber: 2,
        title: 'Sequential Branch Breaker Re-Engagement',
        instruction: 'Keep the ELCB up. Slowly turn ON branch breakers one by one with a 3-second pause between each: Lights, Plugs 1, Plugs 2, Geyser, Stove, Pool Pump, Outdoor/Security.',
        multimeterSetting: 'Visual and listening for click/snap',
        expectedReading: 'Breakers stay closed until the specific faulty circuit is engaged.',
        options: [
          {
            label: 'ELCB trips instantly when one specific breaker is switched ON',
            outcomeSummary: 'Fault identified on that specific branch circuit.',
            nextNodeId: 'el_step_branch_investigation',
          },
          {
            label: 'ELCB holds with all individual breakers, but trips when appliances turn ON',
            outcomeSummary: 'Cumulative earth leakage from heating elements or switch-mode power supplies.',
            nextNodeId: 'el_step_cumulative_leakage',
          },
        ],
      },
      el_step_ne_isolation: {
        id: 'el_step_ne_isolation',
        treeId: 'earth_leakage_tripping',
        stepNumber: 3,
        title: 'Isolate Neutral Conductors One-by-One',
        instruction: 'With 500V Megger connected between Neutral bar and Earth, unscrew branch neutral wires from the neutral bar one at a time until the insulation reading suddenly jumps back up to >10 MΩ.',
        multimeterSetting: 'Insulation Tester @ 500V DC',
        options: [
          {
            label: 'Reading jumps to >10 MΩ when a specific neutral wire is lifted',
            outcomeSummary: 'Fault isolated to that specific neutral conductor path.',
            isResolution: true,
            resolutionType: 'pass',
            remedySteps: [
              'Trace the identified neutral conductor to its corresponding live breaker and field load.',
              'Inspect for a pinched neutral wire inside a screw terminal, neutral touched to earth sleeve in a light box, or moisture inside an outdoor junction box.',
              'Repair or rewire the damaged conductor. Re-terminate on the neutral bar and re-test insulation (must be ≥ 1.0 MΩ).',
            ],
            sansRef: 'SANS 10142-1 Clause 8.6.3 & Clause 6.1.4',
          },
        ],
      },
      el_step_branch_investigation: {
        id: 'el_step_branch_investigation',
        treeId: 'earth_leakage_tripping',
        stepNumber: 3,
        title: 'Branch Circuit Appliance & Cable Meggering',
        instruction: 'On the circuit that tripped the ELCB, unplug all portable appliances. If it is a fixed circuit (Geyser, Stove, Borehole, Aircon), turn OFF the local rotary isolator switch and perform 500V DC insulation tests Phase-to-Earth and Neutral-to-Earth.',
        multimeterSetting: 'Megger 500V DC',
        options: [
          {
            label: 'Low resistance (<1 MΩ) on Geyser or Stove circuit',
            outcomeSummary: 'Heating element insulation breakdown caused by mineral deposits and thermal expansion.',
            isResolution: true,
            resolutionType: 'action_required',
            remedySteps: [
              'Drain geyser or isolate stove cooktop.',
              'Replace water heating element (typically 3kW or 4kW Incoloy/copper element) and inspect thermostat pocket for moisture.',
              'Replace scorched wiring terminals and verify earth continuity Rpe ≤ 0.20 Ω.',
            ],
            sansRef: 'SANS 10142-1 Clause 6.15 (Water heaters) & Clause 8.6.2',
          },
          {
            label: 'Low resistance on Outdoor / Garden lights / Gate motor circuit',
            outcomeSummary: 'Moisture ingress or insect nesting inside underground conduit or junction box.',
            isResolution: true,
            resolutionType: 'action_required',
            remedySteps: [
              'Open outdoor IP65 junction boxes and underground pull boxes.',
              'Dry out condensation, clean ant/spider nesting, and reseal with IP68 waterproof resin gel.',
              'Verify underground cable is SANS 1507 approved PVC/SWA armoring.',
            ],
            sansRef: 'SANS 10142-1 Clause 6.1.2 & Clause 5.2.1',
          },
        ],
      },
      el_step_cumulative_leakage: {
        id: 'el_step_cumulative_leakage',
        treeId: 'earth_leakage_tripping',
        stepNumber: 3,
        title: 'Clamp Meter Cumulative Leakage Measurement',
        instruction: 'Use a high-resolution AC Earth Leakage Clamp Meter (mA range). Clamp around BOTH Phase and Neutral conductors simultaneously at the ELCB output (do NOT clamp earth). Read residual leakage current.',
        multimeterSetting: 'Earth Leakage Clamp Meter (mA AC)',
        expectedReading: 'Standard 30mA ELCB can trip at 15mA - 25mA. Total standing background leakage should not exceed 9mA (30% of rating).',
        options: [
          {
            label: 'Standing leakage is > 18mA AC across multiple healthy circuits',
            outcomeSummary: 'Too many computer power supplies (EMI filters) or LED drivers on a single ELCB.',
            isResolution: true,
            resolutionType: 'action_required',
            remedySteps: [
              'Split the installation across two separate 30mA Earth Leakage units (e.g. Split DB configuration).',
              'Move high-standing-leakage electronic circuits onto a secondary RCBO.',
              'Verify that SANS 10142-1 allows dedicated socket-outlets for IT equipment or servers under specific labeling if permitted.',
            ],
            sansRef: 'SANS 10142-1 Clause 6.7.5 & Annexure E',
          },
        ],
      },
      el_step_elcb_test: {
        id: 'el_step_elcb_test',
        treeId: 'earth_leakage_tripping',
        stepNumber: 3,
        title: 'ELCB Calibrated Trip Time & Current Test',
        instruction: 'Plug in a dedicated RCD / Earth Leakage Tester into a downstream socket. Perform Ramp Test (mA) and 1x 30mA (0° and 180° phase angle) timed trip test.',
        multimeterSetting: 'Dedicated RCD Tester',
        expectedReading: 'Trip current: 15 mA - 30 mA. Trip time at 30mA: ≤ 30 ms (SANS 10142-1 Clause 8.6.4).',
        options: [
          {
            label: 'ELCB trips prematurely at < 15 mA or fails mechanical test button',
            outcomeSummary: 'Defective ELCB internal core balance transformer or weakened mechanical latch.',
            isResolution: true,
            resolutionType: 'fail',
            remedySteps: [
              'Replace 30mA Earth Leakage unit with a new SANS 767 / IEC 61008-1 compliant unit (e.g. CBI, Schneider, or Hager 63A 30mA).',
              'Re-test trip time with RCD tester; record trip time on CoC test report.',
            ],
            sansRef: 'SANS 10142-1 Clause 8.6.4 & Table 8.1',
          },
        ],
      },
    },
  },

  // --- TREE 2: COMPRESSOR WON'T START ---
  {
    id: 'compressor_wont_start',
    title: 'Compressor Won\'t Start (Humming / Tripping Overload)',
    subtitle: 'Refrigeration compressor electrical diagnostics: windings, capacitors, potential relays',
    category: 'hvac',
    initialNodeId: 'comp_step_1',
    nodes: {
      comp_step_1: {
        id: 'comp_step_1',
        treeId: 'compressor_wont_start',
        stepNumber: 1,
        title: 'Supply Voltage & Acoustic Inspection',
        instruction: 'Isolate power. Inspect compressor terminal box for burnt wires or melted plastic. Measure supply voltage across L and N at the compressor contactor while calling for cooling.',
        multimeterSetting: 'AC Voltmeter (600V AC range)',
        safetyWarning: 'Discharge all capacitors with a 20kΩ 5W resistor before touching terminals. Never use a screwdriver tip.',
        expectedReading: '230V AC ± 10% (207V - 253V AC) under loaded start attempt.',
        options: [
          {
            label: 'Voltage drops severely (< 190V AC) when compressor tries to start',
            outcomeSummary: 'Excessive line impedance or undersized feeder cable causing severe voltage drop.',
            nextNodeId: 'comp_step_volt_drop',
          },
          {
            label: 'Voltage stays solid 230V AC, compressor hums for 3-5 sec then trips overload Klixon with a click',
            outcomeSummary: 'Compressor cannot break away: electrical start component failure or mechanical locked rotor.',
            nextNodeId: 'comp_step_windings',
          },
        ],
      },
      comp_step_volt_drop: {
        id: 'comp_step_volt_drop',
        treeId: 'compressor_wont_start',
        stepNumber: 2,
        title: 'Verify Feeder Sizing & Loose Connections',
        instruction: 'Check distribution board breaker terminals, isolator lugs, and contactor silver points for pitting and voltage drops. Calculate cable run length and conductor size against SANS 10142-1.',
        multimeterSetting: 'AC Voltmeter across contactor poles',
        options: [
          {
            label: 'Contactor points pitted or undersized cable identified',
            outcomeSummary: 'Inrush current causes extreme voltage dip preventing motor starting torque.',
            isResolution: true,
            resolutionType: 'action_required',
            remedySteps: [
              'Replace pitted contactor with AC-3 rated unit sized for compressor Locked Rotor Amps (LRA).',
              'Use ElectroAssistant Module 1 to re-size supply cable for allowable voltage drop (< 5%).',
            ],
            sansRef: 'SANS 10142-1 Clause 6.2.8.2 & Clause 6.13',
          },
        ],
      },
      comp_step_windings: {
        id: 'comp_step_windings',
        treeId: 'compressor_wont_start',
        stepNumber: 2,
        title: 'Winding Resistance (C-R-S) & Ground Isolation Test',
        instruction: 'Disconnect all wires from compressor terminals (C, R, S). Measure resistance with low-resistance Ohmmeter between: 1) C to R, 2) C to S, 3) R to S. Then measure from each pin to unpainted copper suction pipe (ground).',
        multimeterSetting: 'Low Ohms (Ω) and Megger 500V DC to Ground',
        expectedReading: 'Golden Rule: R(C to R) + R(C to S) MUST EQUAL R(R to S) within ± 0.3 Ω. Resistance to ground must be >5 MΩ.',
        options: [
          {
            label: 'Formula fails (e.g. C-R is open ∞, or R-to-ground is < 1.0 MΩ)',
            outcomeSummary: 'Internal motor winding burned out or shorted to grounded compressor casing.',
            isResolution: true,
            resolutionType: 'fail',
            remedySteps: [
              'Compressor has experienced electrical motor failure (grounded or open winding).',
              'Isolate refrigerant charge safely into recovery cylinder (comply with SANS 10147 environmental standards).',
              'Replace compressor, install new liquid line filter drier, acid burnout test, vacuum to < 250 microns, and recharge by weight.',
            ],
            sansRef: 'SANS 10147 (Refrigerating systems) & SANS 10142-1 Clause 8.6.3',
          },
          {
            label: 'Windings pass formula perfectly and zero ground leak (R > 50 MΩ)',
            outcomeSummary: 'Internal motor is electrically intact. Starting components (Capacitor/Relay) at fault.',
            nextNodeId: 'comp_step_capacitors',
          },
        ],
      },
      comp_step_capacitors: {
        id: 'comp_step_capacitors',
        treeId: 'compressor_wont_start',
        stepNumber: 3,
        title: 'Run & Start Capacitor Capacitance Check',
        instruction: 'Discharge capacitors. Disconnect wires. Use digital multimeter with capacitance (μF) setting. Compare reading to rated value printed on capacitor label (e.g. 35 μF ± 5%).',
        multimeterSetting: 'Multimeter Capacitance (μF) Mode',
        expectedReading: 'Measured value within ± 5% of manufacturer rated microfarads.',
        options: [
          {
            label: 'Capacitor reading is > 10% low, open 0.0 μF, or bulging top vent',
            outcomeSummary: 'Failed capacitor cannot create the 90° electrical phase shift required for starting torque.',
            isResolution: true,
            resolutionType: 'action_required',
            remedySteps: [
              'Replace defective capacitor with a matching μF rating and equal or higher AC voltage rating (e.g. 440V AC).',
              'Do NOT replace a 440V capacitor with a 370V unit.',
              'Re-test compressor startup with clamp meter monitoring run current (must be ≤ RLA).',
            ],
          },
          {
            label: 'Capacitor microfarads are within ± 5% of rating',
            outcomeSummary: 'Capacitor is healthy. Check Potential Relay or install Hard-Start kit.',
            nextNodeId: 'comp_step_hardstart',
          },
        ],
      },
      comp_step_hardstart: {
        id: 'comp_step_hardstart',
        treeId: 'compressor_wont_start',
        stepNumber: 4,
        title: 'Potential Relay Diagnostics / 5-2-1 Hard Start Test',
        instruction: 'Check potential relay: Measure resistance across coil terminals 2 and 5 (should be 3,000 Ω to 10,000 Ω). Check contact between terminals 1 and 2 (normally closed, should be 0.0 Ω when unenergized). If relay is defective, install a genuine 3-wire 5-2-1 Hard-Start kit.',
        multimeterSetting: 'Ohms (Ω)',
        options: [
          {
            label: 'Compressor starts cleanly with 5-2-1 Hard-Start kit installed',
            outcomeSummary: 'Added start torque overcame tight compressor mechanical tolerances.',
            isResolution: true,
            resolutionType: 'pass',
            remedySteps: [
              'Securely mount 5-2-1 potential relay in upright position inside electrical enclosure.',
              'Verify relay coil drops start capacitor out within 0.5 seconds of compressor rotation.',
              'Check running amps against compressor nameplate RLA.',
            ],
          },
          {
            label: 'Compressor still hums and pulls LRA with 5-2-1 kit installed',
            outcomeSummary: 'Mechanical internal seizure (locked piston, broken connecting rod, or seized bearings).',
            isResolution: true,
            resolutionType: 'fail',
            remedySteps: [
              'Compressor is mechanically seized beyond electrical starting torque recovery.',
              'Replace hermetic compressor unit in accordance with SANS 10147.',
            ],
            sansRef: 'SANS 10147 & SANS 10142-1 Clause 6.13',
          },
        ],
      },
    },
  },

  // --- TREE 3: OFF-GRID INVERTER NEUTRAL FLOAT / ELCB TRIPPING ---
  {
    id: 'inverter_neutral_float',
    title: 'Off-Grid Inverter Earth Leakage & Neutral Float',
    subtitle: 'SANS 10142-1 Annex S & SANS 10142-2 bonding diagnostics for solar & hybrid inverters',
    category: 'solar',
    initialNodeId: 'inv_step_1',
    nodes: {
      inv_step_1: {
        id: 'inv_step_1',
        treeId: 'inverter_neutral_float',
        stepNumber: 1,
        title: 'Grid Loss Simulation & Neutral-to-Earth Voltage',
        instruction: 'With the hybrid/off-grid inverter running loads, switch OFF the Eskom/Grid main input breaker to put the inverter into Islanding / Battery Backup mode. Measure AC voltage between Inverter Output Neutral and Sub-DB Earth bar.',
        multimeterSetting: 'AC Voltmeter (600V AC range)',
        safetyWarning: 'Inverter output remains LIVE even when mains grid is switched OFF. Disconnect solar PV isolators if working inside inverter casing.',
        expectedReading: 'SANS 10142-1 requirement: Neutral-to-Earth voltage must be < 5.0V AC (ideally < 1.0V AC). If reading is ~115V AC (half line voltage), neutral is FLOATING.',
        options: [
          {
            label: 'Neutral to Earth voltage is ~115V AC (Floating Neutral)',
            outcomeSummary: 'Inverter internal bonding relay is disengaged or not installed. Dangerous floating ground!',
            nextNodeId: 'inv_step_bonding_relay',
          },
          {
            label: 'Downstream Earth Leakage snaps OFF immediately when grid fails',
            outcomeSummary: 'N-E bonding relay conflict or reverse polarity between grid and inverter sub-DB.',
            nextNodeId: 'inv_step_elcb_island_trip',
          },
        ],
      },
      inv_step_bonding_relay: {
        id: 'inv_step_bonding_relay',
        treeId: 'inverter_neutral_float',
        stepNumber: 2,
        title: 'Configure Dynamic Neutral-Earth Bonding Relay',
        instruction: 'Inspect inverter settings (e.g. Sunsynk / Deye "Signal Island Mode" or Victron "Ground Relay" enabled). In Island Mode, SANS 10142-1 Annex S mandates an automatic contactor that bonds Output Neutral to Earth when grid is disconnected, and breaks the bond when grid reconnects.',
        multimeterSetting: 'Continuity test between Neutral and Earth with grid disconnected',
        options: [
          {
            label: 'Bonding relay enabled/installed, Neutral-to-Earth voltage drops to < 0.5V AC',
            outcomeSummary: 'Solid reference established. RCD test button operates correctly in island mode.',
            isResolution: true,
            resolutionType: 'pass',
            remedySteps: [
              'Verify inverter firmware has Signal Island / Ground Relay active.',
              'Ensure earth electrode loop impedance Ze is compliant with SANS 10142-1 Table 8.1.',
              'Perform 30mA RCD trip test at a socket outlet while operating purely on battery power to confirm safety trip.',
            ],
            sansRef: 'SANS 10142-1:2020 Annexure S & SANS 10142-2 Section 5',
          },
        ],
      },
      inv_step_elcb_island_trip: {
        id: 'inv_step_elcb_island_trip',
        treeId: 'inverter_neutral_float',
        stepNumber: 2,
        title: 'Check Shared Grid-Inverter Neutral Wiring',
        instruction: 'Check if non-essential circuits and inverter essential circuits share a common Neutral bar in the distribution board. SANS 10142-1 strictly requires completely separate Neutral bars for Essential (inverter backed) and Non-Essential (grid only) circuits.',
        multimeterSetting: 'Continuity & resistance tester',
        options: [
          {
            label: 'Neutral bars are linked together or neutral cross-feed detected',
            outcomeSummary: 'Neutral return current splits across grid and inverter paths, causing instantaneous ELCB trip.',
            isResolution: true,
            resolutionType: 'fail',
            remedySteps: [
              'Separate the distribution board into two completely isolated sections: Grid Non-Essential and Inverter Essential.',
              'Install separate dedicated Neutral bar for the Inverter backup circuits.',
              'Ensure each circuit neutral wire connects ONLY to its respective neutral bar.',
            ],
            sansRef: 'SANS 10142-1 Clause 6.1.4 & Clause 7.12',
          },
        ],
      },
    },
  },
];
