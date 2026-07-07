import { useState, useRef } from 'react';

// Define the anomalies (differences)
const DIFFERENCES = [
  { 
    id: 1, 
    x: 23, y: 25, 
    radius: 7, 
    alterStyle: { width: '12%', height: '10%', background: '#000', opacity: 0.9, filter: 'blur(3px)', borderRadius: '10px' } 
  },
  { 
    id: 2, 
    x: 80, y: 78, 
    radius: 7, 
    alterStyle: { width: '10%', height: '8%', background: 'rgba(239,68,68,0.7)', mixBlendMode: 'color' } 
  },
  { 
    id: 3, 
    x: 50, y: 45, 
    radius: 7, 
    alterStyle: { width: '8%', height: '15%', background: 'rgba(34,197,94,0.4)', filter: 'brightness(1.5) hue-rotate(90deg)', borderRadius: '50%' } 
  },
];

export default function SpotTheDifferenceGame({ baseImage, onComplete }) {
  const [foundIndices, setFoundIndices] = useState([]);
  const [ripple, setRipple] = useState(null);
  const containerRef = useRef(null);

  const handleImageClick = (e) => {
    if (foundIndices.length === DIFFERENCES.length) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Calculate percentage
    const pX = (clickX / rect.width) * 100;
    const pY = (clickY / rect.height) * 100;

    let hit = false;

    // Check against all differences
    DIFFERENCES.forEach((diff) => {
      // Euclidean distance in percentage
      const dist = Math.sqrt(Math.pow(pX - diff.x, 2) + Math.pow(pY - diff.y, 2));
      if (dist <= diff.radius) {
        if (!foundIndices.includes(diff.id)) {
          hit = true;
          const newFound = [...foundIndices, diff.id];
          setFoundIndices(newFound);
          
          if (newFound.length === DIFFERENCES.length) {
            if (onComplete) setTimeout(onComplete, 800);
          }
        }
      }
    });

    // Show ripple
    setRipple({ x: pX, y: pY, hit, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
  };

  return (
    <div className="sotd-container fade-in">
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ color: 'var(--silver)' }}>Original Reality</span>
        <span style={{ color: 'var(--reality)', fontWeight: 600 }}>Altered Reality (Find {DIFFERENCES.length - foundIndices.length} more)</span>
      </div>

      <div className="sotd-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        
        {/* Left Image (Original) */}
        <div className="sotd-image-wrapper">
          <img src={baseImage} alt="Original Room" style={{ width: '100%', display: 'block', borderRadius: '8px' }} />
        </div>

        {/* Right Image (Altered) */}
        <div 
          className="sotd-image-wrapper interactive" 
          ref={containerRef}
          onClick={handleImageClick}
          style={{ position: 'relative', cursor: 'crosshair' }}
        >
          <img src={baseImage} alt="Altered Room" style={{ width: '100%', display: 'block', borderRadius: '8px' }} />
          
          {/* Render fake programmatic differences */}
          {DIFFERENCES.map(diff => (
            <div 
              key={`diff-${diff.id}`}
              style={{
                position: 'absolute',
                top: `calc(${diff.y}% - ${diff.alterStyle.height} / 2)`,
                left: `calc(${diff.x}% - ${diff.alterStyle.width} / 2)`,
                ...diff.alterStyle,
                pointerEvents: 'none', // let clicks pass through to container
                transition: 'opacity 0.3s ease',
                opacity: foundIndices.includes(diff.id) ? 0 : diff.alterStyle.opacity || 1
              }}
            />
          ))}

          {/* Render circles for found differences */}
          {foundIndices.map(id => {
            const diff = DIFFERENCES.find(d => d.id === id);
            return (
              <div 
                key={`found-${id}`}
                className="sotd-hotspot-found"
                style={{
                  top: `${diff.y}%`,
                  left: `${diff.x}%`,
                }}
              />
            );
          })}

          {/* Render click ripple feedback */}
          {ripple && (
            <div 
              key={ripple.id}
              className={`sotd-ripple ${ripple.hit ? 'hit' : 'miss'}`}
              style={{ top: `${ripple.y}%`, left: `${ripple.x}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
