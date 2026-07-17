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
    brief: 'The Mind Stone grants its wielder absolute mastery over intellect and willpower. Your first challenge tests the sharpest minds in your squad. Solve the puzzle presented to you and claim this stone.',
    hint:  null,
  },
  {
    id:    'SECOND',
    stone: 'Space Stone',
    color: '#3b82f6',
    glow:  'rgba(59,130,246,0.55)',
    emoji: '💙',
    title: 'The Space Stone',
    brief: 'The Space Stone — known to many as the Tesseract — allows its wielder to traverse any point in the universe instantly. Navigate through the spatial challenge that awaits you and seize this stone.',
    hint:  null,
  },
  {
    id:    'THIRD',
    stone: 'Reality Stone',
    color: '#ef4444',
    glow:  'rgba(239,68,68,0.55)',
    emoji: '❤️',
    title: 'The Reality Stone',
    brief: 'The Reality Stone warps what is real — and it has done exactly that to its own unlock code. S.H.I.E.L.D. intercepted an Aether-encrypted payload, but the data is disguised behind a mathematical lock. Your squad must break the cipher by solving a series of equations. Only a team that understands the mathematics of reality can unlock this Stone.',
    hint:  'Divide and conquer. Each equation yields a single digit of the unlock code.',
  },
  {
    id:    'FOURTH',
    stone: 'Power Stone',
    color: '#a855f7',
    glow:  'rgba(168,85,247,0.55)',
    emoji: '💜',
    title: 'The Power Stone',
    brief: 'The Power Stone has overloaded Tony Stark\'s Arc Reactor, throwing its harmonic field into chaos. To harness its energy without triggering a catastrophic feedback loop, your squad must manually recalibrate the reactor\'s signal parameters — frequency, phase, and amplitude — until your waveform locks onto the target resonance signature.',
    hint:  'Precision over speed. Tune all three parameters together — one wrong value offsets the others.',
  },
  {
    id:    'FIFTH',
    stone: 'Time Stone',
    color: '#22c55e',
    glow:  'rgba(34,197,94,0.55)',
    emoji: '💚',
    title: 'The Time Stone',
    brief: 'The Time Stone holds mastery over the past, present, and future. To wield it, you must prove you can navigate the timestream without breaking it. Watch the timeline closely, and repeat the exact sequence of events before the time loop collapses.',
    hint:  'If you make a mistake, time resets. "Dormammu, I\'ve come to bargain."',
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
