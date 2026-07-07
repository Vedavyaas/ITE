import { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 6;
const SRC = { r: 0, c: 0 };
const DEST = { r: 5, c: 5 };

// BFS to find shortest path length
function getShortestPathLength(grid) {
  const queue = [{ r: 0, c: 0, dist: 0 }];
  const visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
  visited[0][0] = true;

  const dirs = [[-1,0], [1,0], [0,-1], [0,1]];

  while (queue.length > 0) {
    const { r, c, dist } = queue.shift();
    if (r === DEST.r && c === DEST.c) return dist;

    for (let [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && !visited[nr][nc] && grid[nr][nc] !== 'obstacle') {
        visited[nr][nc] = true;
        queue.push({ r: nr, c: nc, dist: dist + 1 });
      }
    }
  }
  return -1;
}

// Generate a valid grid that has a path
function generateValidGrid() {
  let grid;
  let shortestPath = -1;
  // Loop until a solvable grid is generated
  while (shortestPath === -1) {
    grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('empty'));
    grid[SRC.r][SRC.c] = 'src';
    grid[DEST.r][DEST.c] = 'dest';
    
    // Add random obstacles (~28% density)
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if ((r === SRC.r && c === SRC.c) || (r === DEST.r && c === DEST.c)) continue;
        if (Math.random() < 0.28) {
          grid[r][c] = 'obstacle';
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

    if (gridData.grid[r][c] === 'obstacle') {
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
      const userDist = newPath.length - 1; // Number of steps
      if (userDist === gridData.shortestPath) {
        setIsDone(true);
        if (onComplete) onComplete();
      } else {
        setErrorMsg(`Destination reached, but route is suboptimal. Optimal route requires ${gridData.shortestPath} steps, you took ${userDist}. Routing reset.`);
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
    <div className="pathfinder-container">
      {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>{errorMsg}</div>}
      
      <div 
        className="pathfinder-grid fade-in" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gap: '0.4rem',
          maxWidth: '450px',
          margin: '0 auto'
        }}
      >
        {gridData.grid.map((row, r) => (
          row.map((cellType, c) => {
            const isPath = userPath.some(p => p.r === r && p.c === c);
            const isHead = isPath && userPath[userPath.length - 1].r === r && userPath[userPath.length - 1].c === c;
            
            let classes = `path-cell ${cellType}`;
            if (isPath) classes += ' path';
            if (isHead) classes += ' head';
            if (isDone && isPath) classes += ' success-path';

            return (
              <div 
                key={`${r}-${c}`} 
                className={classes}
                onClick={() => handleCellClick(r, c)}
              >
                {cellType === 'src' && 'S'}
                {cellType === 'dest' && 'D'}
                {cellType === 'obstacle' && '✖'}
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
