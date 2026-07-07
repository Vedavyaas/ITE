/**
 * HexStoneIcon — A premium hexagonal Infinity Stone SVG
 * @param {number} size  — rendered size in px
 * @param {string} color — core hex colour
 * @param {string} glow  — rgb/rgba glow string
 */
export default function HexStoneIcon({ size = 48, color = '#ffffff', glow = 'rgba(255,255,255,0.5)' }) {
  const gradientId = `hex-grad-${color.replace('#', '')}`;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', filter: `drop-shadow(0 0 8px ${glow})` }}
    >
      <defs>
        <radialGradient id={`${gradientId}-glow`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="40%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </radialGradient>
      </defs>

      {/* Main Hexagon Body */}
      <polygon 
        points="50,4 96,27 96,73 50,96 4,73 4,27" 
        fill={`url(#${gradientId}-glow)`} 
        stroke="rgba(255,255,255,0.4)" 
        strokeWidth="1.5"
      />
      
      {/* Inner Bevel / Facet lines for 3D gem look */}
      <polygon 
        points="50,18 82,34 82,66 50,82 18,66 18,34" 
        fill="none" 
        stroke="rgba(255,255,255,0.6)" 
        strokeWidth="1"
      />
      
      {/* Facet connect lines */}
      <line x1="50" y1="4" x2="50" y2="18" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      <line x1="50" y1="96" x2="50" y2="82" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      <line x1="4" y1="27" x2="18" y2="34" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      <line x1="96" y1="27" x2="82" y2="34" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      <line x1="4" y1="73" x2="18" y2="66" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      <line x1="96" y1="73" x2="82" y2="66" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    </svg>
  );
}
