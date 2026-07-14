import { useState } from 'react';

// Encoding: digit → ASCII → XOR 27 → 8-bit binary
// '4'→52→47→00101111  '7'→55→44→00101100
// '2'→50→41→00101001  '8'→56→35→00100011
const ANSWER = '4728';

const ENCODED = [
  { id: 0, label: 'BYTE 01', binary: '00101111' },
  { id: 1, label: 'BYTE 02', binary: '00101100' },
  { id: 2, label: 'BYTE 03', binary: '00101001' },
  { id: 3, label: 'BYTE 04', binary: '00100011' },
];

const CLUES = [
  {
    id: 1,
    tag: 'STEP 01',
    title: 'Convert Binary to a Number',
    color: '#ef4444',
    body: 'Each card shows 8 bits (0s and 1s). Starting from the right, each position is worth double the one before it: 1, 2, 4, 8, 16, 32, 64, 128. Add up the values where you see a 1.',
  },
  {
    id: 2,
    tag: 'STEP 02',
    title: 'XOR the Number with 27',
    color: '#f97316',
    body: 'Take the number from Step 1 and XOR it with 27. To XOR: compare each bit — write 1 if they differ, 0 if they match. Convert the result back to decimal. Tip: most scientific calculators have an XOR button.',
  },
  {
    id: 3,
    tag: 'STEP 03',
    title: 'Subtract 48 to Get Your Digit',
    color: '#dc2626',
    body: 'The number from Step 2 is a character code. Subtract 48 from it — the result is the single digit you type into the box below that card.',
  },
];

export default function RealityCipherGame({ onComplete }) {
  const [digits,   setDigits]   = useState(['', '', '', '']);
  const [openClue, setOpenClue] = useState(null);
  const [complete, setComplete] = useState(false);

  const isCorrect = (i, d) => d !== '' && d === ANSWER[i];
  const isWrong   = (i, d) => d !== '' && d !== ANSWER[i];

  const handleDigit = (i, raw) => {
    const v = raw.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (next.every((d, idx) => d === ANSWER[idx]) && !complete) {
      setComplete(true);
      setTimeout(() => { if (onComplete) onComplete(); }, 700);
    }
  };

  const solvedCount = digits.filter((d, i) => isCorrect(i, d)).length;

  return (
    <div style={{ fontFamily: "'Rajdhani', sans-serif" }}>

      {/* ── Top bar ── */}
      <div style={{
        background: 'rgba(239,68,68,0.05)',
        border: '1px solid rgba(239,68,68,0.15)',
        borderRadius: '8px',
        padding: '0.65rem 0.85rem',
        marginBottom: '1rem',
      }}>
        <div style={{ fontSize: '0.48rem', color: '#ef4444', letterSpacing: '2.5px', marginBottom: '0.15rem' }}>
          S.H.I.E.L.D. INTERCEPT SYSTEM v2.1
        </div>
        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>
          Decode each encrypted byte → enter the decoded digit → unlock the Reality Stone
        </div>
      </div>

      {/* ── Byte cards — 2×2 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', marginBottom: '1rem' }}>
        {ENCODED.map(({ id, label, binary }) => {
          const d   = digits[id];
          const ok  = isCorrect(id, d);
          const bad = isWrong(id, d);

          return (
            <div key={id} style={{
              background: '#000d08',
              border: '2px solid rgba(0,255,80,0.15)',
              borderRadius: '10px',
              padding: '0.75rem 0.6rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              {/* Label */}
              <div style={{ fontSize: '0.48rem', color: 'rgba(0,255,80,0.4)', letterSpacing: '2px', fontFamily: 'monospace' }}>
                {label}
              </div>

              {/* Binary — two nibble rows */}
              <div style={{
                fontFamily: 'monospace',
                fontSize: '1rem',
                color: '#00ff50',
                textShadow: '0 0 8px rgba(0,255,80,0.5)',
                letterSpacing: '3px',
                lineHeight: 1.5,
              }}>
                {binary.slice(0, 4)}<br />{binary.slice(4)}
              </div>

              {/* Input directly below binary */}
              <input
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(id, e.target.value)}
                placeholder="?"
                style={{
                  width: '52px',
                  height: '52px',
                  fontSize: '1.8rem',
                  fontFamily: "'Rajdhani', monospace",
                  fontWeight: 700,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: '2px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: 'var(--white)',
                  outline: 'none',
                  caretColor: '#ef4444',
                  transition: 'all 0.15s ease',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Progress ── */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem', color: 'rgba(255,255,255,0.22)', marginBottom: '0.3rem', letterSpacing: '1px' }}>
          <span>BYTES DECODED</span>
          <span style={{ color: solvedCount === 4 ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>{solvedCount} / 4</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(solvedCount / 4) * 100}%`,
            background: 'linear-gradient(90deg, #ef4444, #22c55e)',
            borderRadius: '2px',
            transition: 'width 0.35s ease',
          }} />
        </div>
      </div>

      {/* ── Clues ── */}
      <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '2px', marginBottom: '0.5rem' }}>
        FIELD INTELLIGENCE
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {CLUES.map(clue => {
          const isOpen = openClue === clue.id;
          return (
            <div key={clue.id} style={{
              background: 'rgba(0,5,15,0.92)',
              border: `1px solid ${clue.color}25`,
              borderLeft: `3px solid ${clue.color}`,
              borderRadius: '6px',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => setOpenClue(isOpen ? null : clue.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.45rem', color: clue.color, letterSpacing: '2px' }}>{clue.tag}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--white)', fontWeight: 600 }}>{clue.title}</span>
                </div>
                <span style={{
                  fontSize: '0.6rem', color: clue.color, flexShrink: 0,
                  display: 'inline-block',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }}>▼</span>
              </button>

              {isOpen && (
                <div style={{ padding: '0 0.85rem 0.8rem', borderTop: `1px solid ${clue.color}18` }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--silver)', lineHeight: 1.65, margin: '0.5rem 0' }}>
                    {clue.body}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Success flash ── */}
      {complete && (
        <div className="fade-in" style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.4)',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: '#22c55e',
          letterSpacing: '2px',
          fontWeight: 700,
        }}>
          ✓ CIPHER DECODED — ACCESS GRANTED
        </div>
      )}
    </div>
  );
}
