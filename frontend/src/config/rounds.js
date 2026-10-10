// ═══════════════════════════════════════════════════════════════════
//  ROUND CONFIGURATION  —  Edit this file to customise all content
// ═══════════════════════════════════════════════════════════════════
//
//  Each object maps to a backend RoundProgression enum value.
//
//  Fields:
//    id       — backend enum  (FIRST | SECOND | THIRD | FOURTH | FIFTH | SIXTH)
//    stone    — full stone name shown on road + round screen
//    color    — hex accent colour for this stone
//    glow     — rgba string used for glows / shadows
//    emoji    — decorative emoji on nodes + strip
//    title    — headline inside the round screen
//    brief    — mission briefing paragraph (can be multi-sentence)
//    hint     — optional italic tip below the briefing  (null = hidden)
// ═══════════════════════════════════════════════════════════════════

export const ROUNDS = [
  {
    id:    'FIRST',
    stone: 'Mind Stone',
    color: '#eab308',
    glow:  'rgba(234,179,8,0.55)',
    emoji: '💛',
    title: 'The Mind Stone',
    brief: 'The Mind Stone grants its wielder absolute mastery over intellect and willpower. Your first challenge tests the sharpest minds in your squad. Flip tiles to match all identical symbol pairs across two memory grids (4x4, then 5x5) to claim this stone.',
    hint:  null,
  },
  {
    id:    'SECOND',
    stone: 'Space Stone',
    color: '#3b82f6',
    glow:  'rgba(59,130,246,0.55)',
    emoji: '💙',
    title: 'The Space Stone',
    brief: 'The Space Stone — known as the Tesseract — governs cosmic coordinates. Tap adjacent cells to chart a path from Source (S) to Destination (D) with the absolute lowest total energy sum across two navigation grids (5x5, then 7x7) to secure the Stone.',
    hint:  'Choose each step carefully to avoid high-cost nodes. Tap the previous cell to backtrack/undo.',
  },
  {
    id:    'THIRD',
    stone: 'Reality Stone',
    color: '#ef4444',
    glow:  'rgba(239,68,68,0.55)',
    emoji: '❤️',
    title: 'The Reality Stone',
    brief: 'Solve the 4 equations to uncover each digit of the cipher. Enter the 4-digit code in order to claim the Reality Stone.',
    hint:  'Equations 01 through 04 yield digits 1 through 4.',
  },
  {
    id:    'FOURTH',
    stone: 'Power Stone',
    color: '#a855f7',
    glow:  'rgba(168,85,247,0.55)',
    emoji: '💜',
    title: 'The Power Stone',
    brief: 'Calibrate the Arc Reactor by matching your waveform to the target signal. Adjust Frequency, Phase, and Amplitude until you reach ≥ 88% correlation, then hold for 5 seconds.',
    hint:  'Tune Frequency to match wave cycles, Phase to align horizontal shift, and Amplitude to match wave height.',
  },
  {
    id:    'FIFTH',
    stone: 'Time Stone',
    color: '#22c55e',
    glow:  'rgba(34,197,94,0.55)',
    emoji: '💚',
    title: 'The Time Stone',
    brief: 'Memorize and repeat the flashing sequence of Infinity Stones. Each turn adds another step — repeat 12 consecutive steps without a mistake to claim the final stone.',
    hint:  'Watch the sequence carefully before tapping. A single wrong tap resets the loop back to step 1.',
  }
];

// ── Nick Fury briefing ── (edit freely)
export const NICK_FURY_INTRO = {
  lines: [
    'Listen up.',
    "I'm Nick Fury — Director of S.H.I.E.L.D. And right now, I need your team.",
    'Five Infinity Stones are scattered across our challenge zones.',
    'Your mission: tackle five challenges — one per stone. Complete them in order. No skipping. No shortcuts.',
    'Collect all five. Wait for further instructions.',
  ],
  quote: '"Whatever it takes."',
  ctaLabel: '⚡ Begin Mission',
};
