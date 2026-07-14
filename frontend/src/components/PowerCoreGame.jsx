import { useState, useEffect, useRef, useCallback } from 'react';

// ── Target signal (hidden from player) ───────────────────────────────────────
const TGT_FREQ = 1.2;   // Hz
const TGT_PHASE = 0;     // degrees
const TGT_AMP = 1.0;   // normalised

// ── Game rules ───────────────────────────────────────────────────────────────
const DURATION = 60;   // seconds
const LOCK_REQUIRED = 3;    // seconds above threshold to win
const MATCH_THRESHOLD = 88;   // % match required

// ── Player starting values (intentionally wrong) ─────────────────────────────
const INIT_FREQ = 1.85;
const INIT_PHASE = 115;
const INIT_AMP = 0.55;

// ── Compute RMS-based match % ─────────────────────────────────────────────────
function calcMatch(freq, phaseDeg, amp) {
  const N = 400;
  const dur = 2 / TGT_FREQ;
  let errSum = 0, tgtSum = 0;
  const pr = phaseDeg * Math.PI / 180;
  for (let i = 0; i < N; i++) {
    const t = (i / N) * dur;
    const ty = Math.sin(2 * Math.PI * TGT_FREQ * t) * TGT_AMP;
    const py = Math.sin(2 * Math.PI * freq * t + pr) * amp;
    errSum += (ty - py) ** 2;
    tgtSum += ty ** 2;
  }
  const rmsErr = Math.sqrt(errSum / N);
  const rmsTgt = Math.sqrt(tgtSum / N);
  return Math.max(0, Math.min(100, (1 - rmsErr / (rmsTgt * 2.2)) * 100));
}

// ── Custom tech slider ────────────────────────────────────────────────────────
function TechSlider({ id, label, value, min, max, step, unit, onChange, color, subLabel }) {
  const trackRef = useRef(null);
  const dragging = useRef(false);
  const pct = ((value - min) / (max - min)) * 100;

  const snap = useCallback((raw) => Math.round(raw / step) * step, [step]);

  const fromEvent = useCallback((clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return value;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.max(min, Math.min(max, snap(min + x * (max - min))));
  }, [min, max, snap, value]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      onChange(fromEvent(cx));
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [fromEvent, onChange]);

  const startDrag = useCallback((e) => {
    dragging.current = true;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    onChange(fromEvent(cx));
    e.preventDefault();
  }, [fromEvent, onChange]);

  return (
    <div style={{
      background: 'rgba(0,6,18,0.92)',
      border: `1px solid ${color}35`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '8px',
      padding: '0.85rem 1.1rem',
      userSelect: 'none',
    }}>

      {/* ── Row 1: Label + Value ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.55rem' }}>
        <div>
          <span style={{ fontSize: '0.58rem', color, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 }}>
            {label}
          </span>
          {subLabel && (
            <span style={{ fontSize: '0.48rem', color: `${color}55`, marginLeft: '0.5rem', letterSpacing: '1px' }}>{subLabel}</span>
          )}
        </div>
        <div>
          <span style={{ fontSize: '1.5rem', fontFamily: "'Rajdhani', monospace", color, fontWeight: 700, lineHeight: 1 }}>
            {value.toFixed(step < 1 ? 2 : 0)}
          </span>
          <span style={{ fontSize: '0.68rem', color: `${color}88`, marginLeft: '2px' }}>{unit}</span>
        </div>
      </div>

      {/* ── Row 2: Track ── */}
      <div
        id={id}
        ref={trackRef}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        style={{
          position: 'relative',
          height: '8px',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: '4px',
          cursor: 'ew-resize',
          marginBottom: '0.3rem',
        }}
      >
        <div style={{
          position: 'absolute', left: 0, top: 0,
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}55, ${color})`,
          borderRadius: '4px',
          boxShadow: `0 0 8px ${color}66`,
        }} />
        <div style={{
          position: 'absolute',
          top: '50%', left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          width: '18px', height: '18px',
          borderRadius: '50%',
          background: `radial-gradient(circle, white 15%, ${color} 65%)`,
          boxShadow: `0 0 10px ${color}, 0 0 20px ${color}55`,
          border: '2px solid rgba(255,255,255,0.35)',
          cursor: 'ew-resize',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.48rem', color: 'rgba(255,255,255,0.18)' }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ── Main game ─────────────────────────────────────────────────────────────────
export default function PowerCoreGame({ onWin, onFail }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [matchPct, setMatchPct] = useState(0);
  const [lockTime, setLockTime] = useState(0);
  const [freq, setFreq] = useState(INIT_FREQ);
  const [phase, setPhase] = useState(INIT_PHASE);
  const [amp, setAmp] = useState(INIT_AMP);

  const G = useRef({
    offset: 0,
    timeLeft: DURATION,
    lockTime: 0,
    lastTime: null,
    status: 'playing',
    freq: INIT_FREQ,
    phase: INIT_PHASE,
    amp: INIT_AMP,
  });

  // ── Draw ──────────────────────────────────────────────────────────────────
  const drawFrame = useCallback((offset, freq, phaseDeg, amp, matchPct) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const midY = H / 2;
    const ampPx = H * 0.34;
    const DUR = 2 / TGT_FREQ; // time window = 2 target periods
    const phRad = phaseDeg * Math.PI / 180;
    const locked = matchPct >= MATCH_THRESHOLD;

    // Background
    ctx.fillStyle = '#000a14';
    ctx.fillRect(0, 0, W, H);

    // CRT scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);

    // Grid
    ctx.strokeStyle = 'rgba(0,255,160,0.055)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(W / 8 * i, 0); ctx.lineTo(W / 8 * i, H); ctx.stroke(); }
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, H / 4 * i); ctx.lineTo(W, H / 4 * i); ctx.stroke(); }
    // Centre dashed
    ctx.strokeStyle = 'rgba(0,255,160,0.12)';
    ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();
    ctx.setLineDash([]);

    // ── Error/diff wave (faint red fill between the two waves) ──
    if (!locked) {
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = '#ff4466';
      ctx.beginPath();
      // Top pass: target
      for (let x = 0; x <= W; x++) {
        const t = (x / W) * DUR;
        const y = midY + Math.sin(2 * Math.PI * TGT_FREQ * t - offset) * ampPx;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      // Bottom pass: player (reverse)
      for (let x = W; x >= 0; x--) {
        const t = (x / W) * DUR;
        const y = midY + Math.sin(2 * Math.PI * freq * t + phRad - offset) * ampPx * amp;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // ── Ghost second harmonic ──
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const t = (x / W) * DUR;
      const y = midY + Math.sin(2 * Math.PI * TGT_FREQ * 2 * t - offset * 1.8) * ampPx * 0.4;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // ── Target wave (green, solid) ──
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00ffaa';
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const t = (x / W) * DUR;
      const y = midY + Math.sin(2 * Math.PI * TGT_FREQ * t - offset) * ampPx;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    // bright centre line
    ctx.shadowBlur = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const t = (x / W) * DUR;
      const y = midY + Math.sin(2 * Math.PI * TGT_FREQ * t - offset) * ampPx;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // ── Player wave (cyan dashed → white solid when locked) ──
    const pCol = locked ? '#ffffff' : '#00d4ff';
    ctx.save();
    ctx.shadowBlur = locked ? 28 : 14;
    ctx.shadowColor = locked ? '#ffffff' : '#00d4ff';
    ctx.strokeStyle = pCol;
    ctx.lineWidth = locked ? 2.8 : 2.2;
    if (!locked) ctx.setLineDash([7, 4]);
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const t = (x / W) * DUR;
      const y = midY + Math.sin(2 * Math.PI * freq * t + phRad - offset) * ampPx * amp;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // ── Lock-on aura (when waves align) ──
    if (locked) {
      const auraAlpha = 0.18 + 0.07 * Math.sin(Date.now() * 0.005);
      ctx.save();
      ctx.globalAlpha = auraAlpha;
      ctx.shadowBlur = 50;
      ctx.shadowColor = '#00d4ff';
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const t = (x / W) * DUR;
        const y = midY + Math.sin(2 * Math.PI * TGT_FREQ * t - offset) * ampPx;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // ── Frequency tick marks on X-axis ──
    ctx.fillStyle = 'rgba(0,255,160,0.2)';
    const tgtPeriodPx = W / 2; // 2 periods fill width
    for (let i = 0; i <= 2; i++) {
      const x = i * tgtPeriodPx;
      ctx.fillRect(x - 1, midY - 5, 2, 10);
    }

    // ── HUD ──
    ctx.fillStyle = 'rgba(0,255,160,0.42)';
    ctx.font = '10px monospace';
    ctx.fillText('STARK OSC v3.7  ◆  HARMONIC CALIBRATION MATRIX', 10, 14);

    ctx.font = '8.5px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(0,255,160,0.5)';
    ctx.fillText('— TARGET SIGNAL', W - 10, H - 16);
    ctx.fillStyle = locked ? 'rgba(255,255,255,0.7)' : 'rgba(0,212,255,0.55)';
    ctx.fillText('-- YOUR SIGNAL', W - 10, H - 5);
    ctx.textAlign = 'left';

    // ── Match readout in canvas ──
    const matchColor = matchPct >= MATCH_THRESHOLD ? '#00d4ff' : matchPct >= 60 ? '#00ffaa' : '#a855f7';
    ctx.fillStyle = matchColor;
    ctx.font = 'bold 13px "Rajdhani", monospace';
    ctx.fillText(`MATCH  ${matchPct.toFixed(1)}%`, 10, H - 8);
  }, []);

  // ── Game loop ─────────────────────────────────────────────────────────────
  const gameLoop = useCallback((time) => {
    if (G.current.status !== 'playing') return;
    if (G.current.lastTime === null) G.current.lastTime = time;
    const dt = Math.min((time - G.current.lastTime) / 1000, 0.1);
    G.current.lastTime = time;

    G.current.offset += dt * TGT_FREQ * Math.PI * 2;
    G.current.timeLeft -= dt;

    const match = calcMatch(G.current.freq, G.current.phase, G.current.amp);

    if (match >= MATCH_THRESHOLD) {
      G.current.lockTime += dt;
    } else {
      G.current.lockTime = Math.max(0, G.current.lockTime - dt * 0.8);
    }

    drawFrame(G.current.offset, G.current.freq, G.current.phase, G.current.amp, match);

    if (G.current.lockTime >= LOCK_REQUIRED) {
      G.current.status = 'won';
      if (onWin) onWin();
      return;
    }
    if (G.current.timeLeft <= 0) {
      G.current.status = 'failed';
      setTimeLeft(0);
      if (onFail) onFail();
      return;
    }

    setTimeLeft(G.current.timeLeft);
    setMatchPct(Math.round(match * 10) / 10);
    setLockTime(G.current.lockTime);

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [drawFrame, onWin, onFail]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameLoop]);

  // ── Slider handlers — update ref immediately, state for display ───────────
  const handleFreq = useCallback((v) => { setFreq(v); G.current.freq = v; }, []);
  const handlePhase = useCallback((v) => { setPhase(v); G.current.phase = v; }, []);
  const handleAmp = useCallback((v) => { setAmp(v); G.current.amp = v; }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const locked = matchPct >= MATCH_THRESHOLD;
  const lockPct = Math.min(100, (lockTime / LOCK_REQUIRED) * 100);
  const timeWarn = timeLeft < 12;
  const matchColor = locked ? '#00d4ff' : matchPct >= 60 ? '#00ffaa' : '#a855f7';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0.25rem' }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.6rem',
        marginBottom: '1rem',
        fontFamily: "'Rajdhani', monospace",
      }}>
        {/* Match % */}
        <div style={{
          background: 'rgba(0,6,18,0.9)',
          border: `1px solid ${matchColor}44`,
          borderRadius: '8px',
          padding: '0.7rem 1rem',
          boxShadow: locked ? `0 0 16px ${matchColor}22` : 'none',
          transition: 'all 0.3s ease',
        }}>
          <div style={{ fontSize: '0.55rem', color: matchColor, letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.75 }}>
            Signal Match
          </div>
          <div style={{ fontSize: '2rem', color: matchColor, fontWeight: 700, lineHeight: 1.1 }}>
            {matchPct.toFixed(1)}<span style={{ fontSize: '1rem', opacity: 0.6 }}>%</span>
          </div>
          <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.1rem' }}>
            NEED ≥ {MATCH_THRESHOLD}% TO LOCK
          </div>
        </div>

        {/* Time */}
        <div style={{
          background: 'rgba(0,6,18,0.9)',
          border: `1px solid ${timeWarn ? '#ff4466' : '#ffffff'}22`,
          borderRadius: '8px',
          padding: '0.7rem 1rem',
          boxShadow: timeWarn ? '0 0 16px rgba(255,68,102,0.1)' : 'none',
        }}>
          <div style={{ fontSize: '0.55rem', color: timeWarn ? '#ff4466' : 'rgba(255,255,255,0.4)', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Time Remaining
          </div>
          <div style={{
            fontSize: '2rem',
            color: timeWarn ? '#ff4466' : 'var(--white)',
            fontWeight: 700, lineHeight: 1.1,
            animation: timeWarn ? 'pulse-success 0.7s infinite' : 'none',
          }}>
            {Math.max(0, timeLeft).toFixed(1)}<span style={{ fontSize: '1rem', opacity: 0.5 }}>s</span>
          </div>
          <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.1rem' }}>
            REACTOR WINDOW
          </div>
        </div>
      </div>

      {/* ── Oscilloscope ── */}
      <div style={{
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden',
        border: `1px solid ${locked ? 'rgba(0,212,255,0.55)' : 'rgba(0,255,160,0.18)'}`,
        boxShadow: locked
          ? '0 0 40px rgba(0,212,255,0.2), 0 0 80px rgba(0,212,255,0.06)'
          : '0 0 20px rgba(0,0,0,0.8)',
        marginBottom: '1rem',
        transition: 'box-shadow 0.5s ease, border-color 0.5s ease',
      }}>
        <canvas
          ref={canvasRef}
          width={620}
          height={210}
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
        {locked && (
          <div style={{
            position: 'absolute', top: '10px', right: '12px',
            background: 'rgba(0,212,255,0.12)',
            border: '1px solid rgba(0,212,255,0.7)',
            borderRadius: '4px',
            padding: '3px 10px',
            fontSize: '0.65rem',
            color: '#00d4ff',
            letterSpacing: '2px',
            fontFamily: "'Rajdhani', monospace",
            fontWeight: 700,
            animation: 'pulse-success 1s infinite',
          }}>
            ⚡ FREQUENCY LOCK
          </div>
        )}
      </div>

      {/* ── Match progress + lock-in bars ── */}
      <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {/* Match bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.35rem', letterSpacing: '1.5px', fontFamily: "'Rajdhani', sans-serif" }}>
            <span>SIGNAL CORRELATION</span>
            <span style={{ color: matchColor }}>{matchPct.toFixed(1)}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{
              width: `${matchPct}%`,
              height: '100%',
              background: `linear-gradient(90deg, #a855f7, ${matchColor})`,
              boxShadow: `0 0 10px ${matchColor}66`,
              transition: 'width 0.12s ease',
              borderRadius: '4px',
            }} />
          </div>
          {/* Threshold tick */}
          <div style={{ position: 'relative', height: '14px' }}>
            <div style={{ position: 'absolute', left: `${MATCH_THRESHOLD}%`, top: 0, width: '2px', height: '6px', background: 'rgba(255,255,255,0.25)' }} />
            <div style={{ position: 'absolute', left: `${MATCH_THRESHOLD}%`, top: '8px', transform: 'translateX(-50%)', fontSize: '0.48rem', color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>LOCK THR.</div>
          </div>
        </div>

        {/* Lock-in hold bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: locked ? '#00d4ff' : 'rgba(255,255,255,0.25)', marginBottom: '0.35rem', letterSpacing: '1.5px', fontFamily: "'Rajdhani', sans-serif" }}>
            <span>CALIBRATION HOLD</span>
            <span>{lockPct.toFixed(0)}% — {LOCK_REQUIRED}s</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', overflow: 'hidden', border: `1px solid ${locked ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.05)'}` }}>
            <div style={{
              width: `${lockPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00d4ff, #00ffaa)',
              boxShadow: locked ? '0 0 12px rgba(0,212,255,0.8)' : 'none',
              transition: 'width 0.1s linear',
              borderRadius: '4px',
            }} />
          </div>
          <div style={{ height: '14px', display: 'flex', alignItems: 'center', paddingLeft: '2px' }}>
            <span style={{ fontSize: '0.5rem', color: locked ? '#00d4ff' : 'rgba(255,255,255,0.15)', letterSpacing: '1px' }}>
              {locked ? '⚡ HOLD STEADY — LOCKING IN' : `Reach ${MATCH_THRESHOLD}% to start lock`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Three Sliders ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem', marginBottom: '1rem' }}>
        <TechSlider
          id="slider-freq"
          label="Frequency"
          value={freq}
          min={0.5}
          max={2.5}
          step={0.01}
          unit=" Hz"
          color="#00ffaa"
          subLabel={`TARGET: ${TGT_FREQ.toFixed(2)} Hz`}
          onChange={handleFreq}
        />
        <TechSlider
          id="slider-phase"
          label="Phase Offset"
          value={phase}
          min={-180}
          max={180}
          step={1}
          unit="°"
          color="#00d4ff"
          subLabel={`TARGET: ${TGT_PHASE}°`}
          onChange={handlePhase}
        />
        <TechSlider
          id="slider-amp"
          label="Amplitude"
          value={amp}
          min={0.3}
          max={1.8}
          step={0.01}
          unit="×"
          color="#a855f7"
          subLabel={`TARGET: ${TGT_AMP.toFixed(2)}×`}
          onChange={handleAmp}
        />
      </div>

      {/* ── Hint strip ── */}
      <div style={{
        padding: '0.6rem 1rem',
        background: 'rgba(0,255,160,0.03)',
        border: '1px solid rgba(0,255,160,0.1)',
        borderRadius: '8px',
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.5px',
        fontFamily: "'Rajdhani', sans-serif",
        display: 'flex',
        gap: '1.5rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        <span><span style={{ color: '#00ffaa' }}>FREQ</span> — compresses/stretches the wave</span>
        <span><span style={{ color: '#00d4ff' }}>PHASE</span> — shifts it left or right</span>
        <span><span style={{ color: '#a855f7' }}>AMP</span> — changes the height</span>
      </div>
    </div>
  );
}
