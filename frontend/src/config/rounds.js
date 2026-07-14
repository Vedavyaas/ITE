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
    brief: 'The Time Stone — the Eye of Agamotto — allows its user to rewind, advance, and loop time itself. Speed and precision are everything here. Race against the clock and earn this stone.',
    hint:  null,
  },
  {
    id:    'SIXTH',
    stone: 'Soul Stone',
    color: '#f97316',
    glow:  'rgba(249,115,22,0.55)',
    emoji: '🧡',
    title: 'The Soul Stone',
    brief: 'The Soul Stone is the most enigmatic of all six. To obtain it, one must make a choice that costs everything. Your final challenge will demand everything your team has left. Are you ready?',
    hint:  'The hardest decisions require the strongest will.',
  },
];

// ── Nick Fury briefing ── (edit freely)
export const NICK_FURY_INTRO = {
  lines: [
    'Listen up.',
    "I'm Nick Fury — Director of S.H.I.E.L.D. And right now, I need your team.",
    'Six Infinity Stones are scattered across our challenge zones. In the wrong hands, they can unmake half the universe.',
    'Your mission: tackle six challenges — one per stone. Complete them in order. No skipping. No shortcuts.',
    'Collect all six. Load the Gauntlet. Snap.',
  ],
  quote: '"Whatever it takes."',
  ctaLabel: '⚡ Begin Mission',
};
