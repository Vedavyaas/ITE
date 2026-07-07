/**
 * GauntletIcon — Infinity Gauntlet SVG
 * Renders a detailed golden gauntlet with all 6 Infinity Stones.
 * @param {number} width  — rendered width in px (height is auto-proportional)
 */
export default function GauntletIcon({ width = 100 }) {
  const h = Math.round(width * 1.42);
  return (
    <svg
      viewBox="0 0 120 170"
      width={width}
      height={h}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        {/* ── Gold gradients ── */}
        <linearGradient id="gld-main" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%"   stopColor="#ffe280" />
          <stop offset="30%"  stopColor="#d4941e" />
          <stop offset="70%"  stopColor="#a06414" />
          <stop offset="100%" stopColor="#6b3e00" />
        </linearGradient>
        <linearGradient id="gld-finger" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#ffe080" />
          <stop offset="45%"  stopColor="#cc8c18" />
          <stop offset="100%" stopColor="#7a4800" />
        </linearGradient>
        <linearGradient id="gld-palm" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%"   stopColor="#ffd060" />
          <stop offset="40%"  stopColor="#c07818" />
          <stop offset="100%" stopColor="#7a4800" />
        </linearGradient>
        <linearGradient id="gld-wrist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c07818" />
          <stop offset="100%" stopColor="#6b3e00" />
        </linearGradient>

        {/* ── Stone radial gradients ── */}
        <radialGradient id="st-soul"    cx="38%" cy="32%" r="60%"><stop offset="0%" stopColor="#ffe0b0"/><stop offset="100%" stopColor="#f97316"/></radialGradient>
        <radialGradient id="st-time"    cx="38%" cy="32%" r="60%"><stop offset="0%" stopColor="#bbffd0"/><stop offset="100%" stopColor="#22c55e"/></radialGradient>
        <radialGradient id="st-mind"    cx="38%" cy="32%" r="60%"><stop offset="0%" stopColor="#fffa90"/><stop offset="100%" stopColor="#eab308"/></radialGradient>
        <radialGradient id="st-power"   cx="38%" cy="32%" r="60%"><stop offset="0%" stopColor="#eedcff"/><stop offset="100%" stopColor="#a855f7"/></radialGradient>
        <radialGradient id="st-space"   cx="38%" cy="32%" r="60%"><stop offset="0%" stopColor="#c0e8ff"/><stop offset="100%" stopColor="#3b82f6"/></radialGradient>
        <radialGradient id="st-reality" cx="38%" cy="32%" r="60%"><stop offset="0%" stopColor="#ffc0c0"/><stop offset="100%" stopColor="#ef4444"/></radialGradient>

        {/* ── Glow filter ── */}
        <filter id="sg" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* ── Drop shadow ── */}
        <filter id="shade" x="-10%" y="-5%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#3a1e00" floodOpacity="0.55"/>
        </filter>

        {/* ── Metal sheen overlay ── */}
        <linearGradient id="sheen" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.18"/>
          <stop offset="50%"  stopColor="white" stopOpacity="0.04"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* ════ WRIST ════ */}
      <path
        d="M28,168 L92,168 L98,132 L22,132 Z"
        fill="url(#gld-wrist)"
        filter="url(#shade)"
      />
      {/* Wrist armour bands */}
      <path d="M25,144 L95,144" stroke="#5a3000" strokeWidth="2" opacity="0.55"/>
      <path d="M27,154 L93,154" stroke="#5a3000" strokeWidth="1.5" opacity="0.45"/>
      <path d="M29,162 L91,162" stroke="#5a3000" strokeWidth="1" opacity="0.35"/>
      {/* Wrist rivet dots */}
      {[34,50,70,86].map(x => (
        <circle key={x} cx={x} cy={144} r="1.5" fill="#ffcf50" opacity="0.6"/>
      ))}
      {/* Wrist sheen */}
      <path d="M28,168 L92,168 L98,132 L22,132 Z" fill="url(#sheen)"/>

      {/* ════ PALM PLATE ════ */}
      <path
        d="M8,132 L112,132 L109,58 L11,58 Z"
        fill="url(#gld-palm)"
        filter="url(#shade)"
      />
      {/* Palm edge detail lines */}
      <path d="M11,58 L109,58 L110,66 L10,66 Z" fill="rgba(255,220,80,0.1)"/>
      <path d="M16,120 L104,120" stroke="#5a3000" strokeWidth="1" opacity="0.35"/>
      <path d="M14,110 L106,110" stroke="#5a3000" strokeWidth="0.8" opacity="0.25"/>
      {/* Central palm crease */}
      <path d="M60,128 L60,68" stroke="#5a3000" strokeWidth="1.5" opacity="0.3"/>
      {/* Palm rivet row */}
      {[22,40,60,80,98].map(x => (
        <circle key={x} cx={x} cy={128} r="1.3" fill="#ffcf50" opacity="0.5"/>
      ))}
      {/* Palm sheen */}
      <path d="M8,132 L112,132 L109,58 L11,58 Z" fill="url(#sheen)"/>

      {/* ════ THUMB ════ */}
      <path
        d="M11,105 Q2,98 3,80 Q4,62 16,67 L14,80 Q11,92 12,105 Z"
        fill="url(#gld-finger)"
        filter="url(#shade)"
      />
      {/* Thumb joints */}
      <path d="M3.5,83 Q9,81 14.5,82" stroke="#5a3000" strokeWidth="1.2" opacity="0.55" fill="none"/>
      <path d="M3.5,95 Q9,93 13.5,94" stroke="#5a3000" strokeWidth="1.2" opacity="0.45" fill="none"/>
      {/* Thumb sheen */}
      <path d="M11,105 Q2,98 3,80 Q4,62 16,67 L14,80 Q11,92 12,105 Z" fill="url(#sheen)"/>

      {/* ════ FINGERS ════ */}

      {/* Pinky */}
      <path d="M10,58 L24,58 L21,14 L9,14 Z" fill="url(#gld-finger)" filter="url(#shade)"/>
      <path d="M9.5,12 L21.5,12 Q22,12 22,14 L10,14 Q10,12 9.5,12 Z" rx="3" fill="url(#gld-finger)"/>
      <path d="M9.3,44 L23,44"   stroke="#5a3000" strokeWidth="1.2" opacity="0.55"/>
      <path d="M9.6,30 L22.5,30" stroke="#5a3000" strokeWidth="1.2" opacity="0.45"/>
      <rect x="9.5" y="11" width="12" height="5" rx="2.5" fill="url(#gld-finger)"/>
      <path d="M10,58 L24,58 L21,14 L9,14 Z" fill="url(#sheen)"/>

      {/* Ring */}
      <path d="M27,58 L44,58 L42,6 L26,6 Z" fill="url(#gld-finger)" filter="url(#shade)"/>
      <path d="M27,44 L44,44" stroke="#5a3000" strokeWidth="1.2" opacity="0.55"/>
      <path d="M27,28 L43,28" stroke="#5a3000" strokeWidth="1.2" opacity="0.45"/>
      <rect x="26.5" y="3" width="15" height="5" rx="2.5" fill="url(#gld-finger)"/>
      <path d="M27,58 L44,58 L42,6 L26,6 Z" fill="url(#sheen)"/>

      {/* Middle */}
      <path d="M47,58 L67,58 L66,2 L47,2 Z" fill="url(#gld-finger)" filter="url(#shade)"/>
      <path d="M47,44 L67,44" stroke="#5a3000" strokeWidth="1.2" opacity="0.55"/>
      <path d="M47,28 L67,28" stroke="#5a3000" strokeWidth="1.2" opacity="0.45"/>
      <rect x="47.5" y="-1" width="18" height="5" rx="2.5" fill="url(#gld-finger)"/>
      <path d="M47,58 L67,58 L66,2 L47,2 Z" fill="url(#sheen)"/>

      {/* Index */}
      <path d="M70,58 L88,58 L87,8 L69,8 Z" fill="url(#gld-finger)" filter="url(#shade)"/>
      <path d="M69.5,44 L88,44" stroke="#5a3000" strokeWidth="1.2" opacity="0.55"/>
      <path d="M70,28 L87,28"  stroke="#5a3000" strokeWidth="1.2" opacity="0.45"/>
      <rect x="69.5" y="5" width="17" height="5" rx="2.5" fill="url(#gld-finger)"/>
      <path d="M70,58 L88,58 L87,8 L69,8 Z" fill="url(#sheen)"/>

      {/* ════ INFINITY STONES ════ */}

      {/* ─ Knuckle stones (at finger-palm junction) ─ */}

      {/* Soul Stone — Pinky (orange) */}
      <ellipse cx="17"  cy="61" rx="6"   ry="4"   fill="#5a3000"/>
      <ellipse cx="17"  cy="61" rx="5"   ry="3.2" fill="url(#st-soul)"    filter="url(#sg)"/>
      <ellipse cx="15.8" cy="59.8" rx="1.6" ry="1" fill="rgba(255,255,255,0.45)"/>

      {/* Time Stone — Ring (green) */}
      <ellipse cx="35.5" cy="61" rx="6.5" ry="4.2" fill="#5a3000"/>
      <ellipse cx="35.5" cy="61" rx="5.5" ry="3.4" fill="url(#st-time)"    filter="url(#sg)"/>
      <ellipse cx="34.2" cy="59.7" rx="1.8" ry="1.1" fill="rgba(255,255,255,0.45)"/>

      {/* Mind Stone — Middle (yellow) — largest / centre */}
      <ellipse cx="57"  cy="61" rx="7.5" ry="4.8" fill="#5a3000"/>
      <ellipse cx="57"  cy="61" rx="6.3" ry="4"   fill="url(#st-mind)"    filter="url(#sg)"/>
      <ellipse cx="55.5" cy="59.5" rx="2.2" ry="1.3" fill="rgba(255,255,255,0.5)"/>

      {/* Power Stone — Index (purple) */}
      <ellipse cx="79"  cy="61" rx="6.5" ry="4.2" fill="#5a3000"/>
      <ellipse cx="79"  cy="61" rx="5.5" ry="3.4" fill="url(#st-power)"   filter="url(#sg)"/>
      <ellipse cx="77.7" cy="59.7" rx="1.8" ry="1.1" fill="rgba(255,255,255,0.45)"/>

      {/* ─ Palm stones ─ */}

      {/* Space Stone — left palm (blue) */}
      <ellipse cx="36"  cy="98" rx="8.5" ry="5.8" fill="#5a3000"/>
      <ellipse cx="36"  cy="98" rx="7.2" ry="4.8" fill="url(#st-space)"   filter="url(#sg)"/>
      <ellipse cx="34.3" cy="96.2" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.42)"/>

      {/* Reality Stone — right palm (red) */}
      <ellipse cx="84"  cy="98" rx="8.5" ry="5.8" fill="#5a3000"/>
      <ellipse cx="84"  cy="98" rx="7.2" ry="4.8" fill="url(#st-reality)" filter="url(#sg)"/>
      <ellipse cx="82.3" cy="96.2" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.42)"/>

      {/* ════ OUTER EDGE RIM LIGHT ════ */}
      <path d="M8,132 L112,132 L109,58 L11,58 Z"
        fill="none" stroke="rgba(255,220,80,0.22)" strokeWidth="1.5"/>
      <path d="M10,58 L24,58 L21,14 L9,14 Z"
        fill="none" stroke="rgba(255,220,80,0.18)" strokeWidth="1"/>
      <path d="M27,58 L44,58 L42,6 L26,6 Z"
        fill="none" stroke="rgba(255,220,80,0.18)" strokeWidth="1"/>
      <path d="M47,58 L67,58 L66,2 L47,2 Z"
        fill="none" stroke="rgba(255,220,80,0.18)" strokeWidth="1"/>
      <path d="M70,58 L88,58 L87,8 L69,8 Z"
        fill="none" stroke="rgba(255,220,80,0.18)" strokeWidth="1"/>
    </svg>
  );
}
