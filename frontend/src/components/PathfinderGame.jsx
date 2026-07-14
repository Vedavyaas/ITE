import { useState, useEffect, useCallback } from 'react';

const GRID_ROWS = 7;
const GRID_COLS = 7;
const SRC = { r: 0, c: 0 };
const DEST = { r: 6, c: 6 };

// Dijkstra to find shortest path length
function getShortestPathLength(grid) {
  const dist = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(Infinity));
  const visited = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
  dist[SRC.r][SRC.c] = 0;

  const dirs = [[-1,0], [1,0], [0,-1], [0,1]];

  for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) {
    let minDist = Infinity;
    let minR = -1;
    let minC = -1;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (!visited[r][c] && dist[r][c] < minDist) {
          minDist = dist[r][c];
          minR = r;
          minC = c;
        }
      }
    }

    if (minR === -1 || minDist === Infinity) break;

    visited[minR][minC] = true;

    if (minR === DEST.r && minC === DEST.c) return minDist;

    for (let [dr, dc] of dirs) {
      const nr = minR + dr;
      const nc = minC + dc;
      if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS && !visited[nr][nc] && grid[nr][nc].type !== 'obstacle') {
        const alt = minDist + grid[nr][nc].weight;
        if (alt < dist[nr][nc]) {
          dist[nr][nc] = alt;
        }
      }
    }
  }

  return dist[DEST.r][DEST.c] === Infinity ? -1 : dist[DEST.r][DEST.c];
}

// Generate a valid grid that has a path
function generateValidGrid() {
  let grid;
  let shortestPath = -1;
  // Loop until a solvable grid is generated
  while (shortestPath === -1) {
    grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
    
    // Add random obstacles and weights
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (r === SRC.r && c === SRC.c) {
          grid[r][c] = { type: 'src', weight: 0 };
        } else if (r === DEST.r && c === DEST.c) {
          grid[r][c] = { type: 'dest', weight: 0 };
        } else {
          const weight = Math.floor(Math.random() * 90) + 10; // 10 to 99 weight
          grid[r][c] = { type: 'empty', weight };
        }
      }
    }
    shortestPath = getShortestPathLength(grid);
  }
  return { grid, shortestPath };
}

export default function PathfinderGame({ onComplete, onResetClick }) {
  const [gridData, setGridData] = useState(null);
  const [userPath, setUserPath] = useState([{ r: 0, c: 0 }]); // Always starts at src
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const initGame = useCallback(() => {
    setGridData(generateValidGrid());
    setUserPath([{ r: 0, c: 0 }]);
    setIsDone(false);
    setErrorMsg('');
  }, []);

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
    if (r === DEST.r && c === DEST.c) {
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
          setUserPath([{ r: 0, c: 0 }]);
        }, 2000);
      }
    }
  };

  const handleReset = () => {
    initGame();
    if (onResetClick) onResetClick();
  };

  if (!gridData) return null;

  return (
    <div className="pathfinder-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.8rem', width: '100%' }}>{errorMsg}</div>}
      
      <div 
        className="pathfinder-grid fade-in" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gap: '0.3rem',
          width: '100%',
          maxWidth: '460px',
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

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
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
