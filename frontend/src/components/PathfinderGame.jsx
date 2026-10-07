import { useState, useEffect, useCallback } from 'react';

// Dijkstra to find shortest path length
function getShortestPathLength(grid, rows, cols, src, dest) {
  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  dist[src.r][src.c] = 0;

  const dirs = [[-1,0], [1,0], [0,-1], [0,1]];

  for (let i = 0; i < rows * cols; i++) {
    let minDist = Infinity;
    let minR = -1;
    let minC = -1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!visited[r][c] && dist[r][c] < minDist) {
          minDist = dist[r][c];
          minR = r;
          minC = c;
        }
      }
    }

    if (minR === -1 || minDist === Infinity) break;

    visited[minR][minC] = true;

    if (minR === dest.r && minC === dest.c) return minDist;

    for (let [dr, dc] of dirs) {
      const nr = minR + dr;
      const nc = minC + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] && grid[nr][nc].type !== 'obstacle') {
        const alt = minDist + grid[nr][nc].weight;
        if (alt < dist[nr][nc]) {
          dist[nr][nc] = alt;
        }
      }
    }
  }

  return dist[dest.r][dest.c] === Infinity ? -1 : dist[dest.r][dest.c];
}

// Generate a valid grid that has a path
function generateValidGrid(rows, cols, src, dest) {
  let grid;
  let shortestPath = -1;
  // Loop until a solvable grid is generated
  while (shortestPath === -1) {
    grid = Array.from({ length: rows }, () => Array(cols).fill(null));
    
    // Add random obstacles and weights
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === src.r && c === src.c) {
          grid[r][c] = { type: 'src', weight: 0 };
        } else if (r === dest.r && c === dest.c) {
          grid[r][c] = { type: 'dest', weight: 0 };
        } else {
          const weight = Math.floor(Math.random() * 90) + 10; // 10 to 99 weight
          grid[r][c] = { type: 'empty', weight };
        }
      }
    }
    shortestPath = getShortestPathLength(grid, rows, cols, src, dest);
  }
  return { grid, shortestPath };
}

export default function PathfinderGame({ rows, cols, src, dest, onComplete, onResetClick }) {
  const [gridData, setGridData] = useState(null);
  const [userPath, setUserPath] = useState([src]); // Always starts at src
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const initGame = useCallback(() => {
    setGridData(generateValidGrid(rows, cols, src, dest));
    setUserPath([src]);
    setIsDone(false);
    setErrorMsg('');
  }, [rows, cols, src, dest]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCellClick = (r, c) => {
    if (isDone) return;
    setErrorMsg('');

    const cell = gridData.grid[r][c];
    if (cell.type === 'obstacle') {
      setErrorMsg('Cannot route through cosmic anomalies (obstacles).');
      return;
    }

    const currentHead = userPath[userPath.length - 1];

    // Check if clicking the previous cell (undo step)
    if (userPath.length > 1) {
      const prevHead = userPath[userPath.length - 2];
      if (prevHead.r === r && prevHead.c === c) {
        setUserPath(userPath.slice(0, -1));
        return;
      }
    }

    // Check if it's already in the path
    if (userPath.some(p => p.r === r && p.c === c)) {
      setErrorMsg('Path cannot intersect itself.');
      return;
    }

    // Check adjacency
    const isAdjacent = Math.abs(currentHead.r - r) + Math.abs(currentHead.c - c) === 1;
    if (!isAdjacent) {
      setErrorMsg('Must route adjacently.');
      return;
    }

    const newPath = [...userPath, { r, c }];
    setUserPath(newPath);

    // Reached destination?
    if (r === dest.r && c === dest.c) {
      let userDist = 0;
      for (let i = 1; i < newPath.length; i++) {
        const pr = newPath[i].r;
        const pc = newPath[i].c;
        userDist += gridData.grid[pr][pc].weight;
      }
      
      if (userDist === gridData.shortestPath) {
        setIsDone(true);
        if (onComplete) onComplete();
      } else {
        setErrorMsg(`Destination reached, but route is suboptimal. Optimal route requires ${gridData.shortestPath} energy, you used ${userDist}. Routing reset.`);
        setTimeout(() => {
          setUserPath([src]);
        }, 2000);
      }
    }
  };

  const handleReset = () => {
    initGame();
    if (onResetClick) onResetClick();
  };

  if (!gridData) return null;

  const currentEnergy = userPath.slice(1).reduce((sum, p) => sum + (gridData?.grid[p.r]?.[p.c]?.weight || 0), 0);

  return (
    <div className="pathfinder-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '0.5rem 0' }}>
      {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.85rem', width: '100%', maxWidth: '440px' }}>{errorMsg}</div>}
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--silver)' }}>
            Route Energy:
          </span>
          <span style={{ color: '#60C8F8', fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>
            {currentEnergy}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--silver)' }}>
            Steps:
          </span>
          <span style={{ color: '#FBBF24', fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>
            {userPath.length - 1}
          </span>
        </div>
      </div>

      <div 
        className="pathfinder-grid fade-in" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: cols === 7 ? 'clamp(2px, 1vw, 4px)' : 'clamp(4px, 1.5vw, 6px)',
          width: '100%',
          maxWidth: cols === 7 ? '440px' : '360px',
          margin: '0 auto'
        }}
      >
        {gridData.grid.map((row, r) => (
          row.map((cellObj, c) => {
            const isPath = userPath.some(p => p.r === r && p.c === c);
            const isHead = isPath && userPath[userPath.length - 1].r === r && userPath[userPath.length - 1].c === c;
            
            let classes = `path-cell ${cellObj.type}`;
            if (isPath) classes += ' path';
            if (isHead) classes += ' head';
            if (isDone && isPath) classes += ' success-path';

            return (
              <div 
                key={`${r}-${c}`} 
                className={classes}
                onClick={() => handleCellClick(r, c)}
              >
                {cellObj.type === 'src' && 'S'}
                {cellObj.type === 'dest' && 'D'}
                {cellObj.type === 'obstacle' && '✖'}
                {cellObj.type === 'empty' && cellObj.weight}
              </div>
            );
          })
        ))}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--silver)', opacity: 0.7, marginTop: '0.75rem', textAlign: 'center' }}>
        💡 Tap an adjacent cell to advance. Tap the previous cell to backtrack.
      </p>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={handleReset}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          ↻ Reroute (Generate New Map)
        </button>
      </div>
    </div>
  );
}
