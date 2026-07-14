import { useState, useRef } from 'react';

// Math equations for digit mapping
// 4, 7, 2, 8
const ANSWER = '4728';

const EQUATIONS = [
  { id: 0, label: 'EQUATION 01 (Solve for x)', text: '3x + 12 = 24' },
  { id: 1, label: 'EQUATION 02 (Solve for y)', text: '5y - 14 = 21' },
  { id: 2, label: 'EQUATION 03 (Solve for z)', text: '(4z + 8) / 2 = 8' },
  { id: 3, label: 'EQUATION 04 (Solve for w)', text: '7w - 30 = 26' },
];

const RED    = '#E23636';
const PURPLE = '#9333ea';
const DIM    = 'rgba(255,255,255,0.55)';

export default function RealityCipherGame({ onComplete }) {
  const [digits,   setDigits]   = useState(['', '', '', '']);
  const [complete, setComplete] = useState(false);
  const [wrong,    setWrong]    = useState(false);
  const inputRefs = useRef([]);

  const focusBox = (i) => {
    if (inputRefs.current[i]) inputRefs.current[i].focus();
  };

  const handleKey = (i, e) => {
    setWrong(false);

    // Paste: fill all 4 from clipboard text
    if (e.type === 'paste') {
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
      const next = ['', '', '', ''];
      pasted.split('').forEach((ch, idx) => { next[idx] = ch; });
      setDigits(next);
      focusBox(Math.min(pasted.length, 3));
      e.preventDefault();
      return;
    }

    if (e.key === 'Backspace') {
      if (digits[i] !== '') {
        // clear current
        const next = [...digits]; next[i] = ''; setDigits(next);
      } else if (i > 0) {
        // move back and clear
        const next = [...digits]; next[i - 1] = ''; setDigits(next);
        focusBox(i - 1);
      }
      e.preventDefault();
      return;
    }

    if (e.key === 'ArrowLeft' && i > 0)  { focusBox(i - 1); return; }
    if (e.key === 'ArrowRight' && i < 3) { focusBox(i + 1); return; }

    const ch = e.key.replace(/\D/g, '');
    if (!ch) return;
    const next = [...digits]; next[i] = ch; setDigits(next);
    if (i < 3) focusBox(i + 1);
    e.preventDefault();
  };

  const handleSubmit = () => {
    if (digits.join('') === ANSWER && !complete) {
      setComplete(true);
      setTimeout(() => { if (onComplete) onComplete(); }, 700);
    } else {
      setWrong(true);
    }
  };

  return (
    <div style={{ fontFamily: "'Rajdhani', sans-serif" }}>

      {/* ══════════ TEAM NOTE ══════════ */}
      <div style={{
        background: 'rgba(147,51,234,0.08)',
        border: '1px solid rgba(147,51,234,0.25)',
        borderLeft: `3px solid ${PURPLE}`,
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        marginBottom: '1.25rem',
        fontSize: '0.78rem',
        color: DIM,
        lineHeight: 1.6,
      }}>
        <span style={{ color: '#c084fc', fontWeight: 700 }}>TEAM STRATEGY — </span>
        Each byte can be decoded <strong style={{ color: '#fff' }}>independently</strong>.
        Assign one byte per team member, decode it separately, then combine all four digits into the final code together.
      </div>

      {/* ══════════ DECODE STEPS ══════════ */}
      <div style={{
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '0.85rem 1rem',
        marginBottom: '1.25rem',
      }}>
        <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', marginBottom: '0.65rem' }}>
          ▸ DECODE PROCEDURE
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
          <span style={{ background: RED, color: '#fff', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.45rem', flexShrink: 0, letterSpacing: '1px' }}>01</span>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600, marginBottom: '0.15rem' }}>Solve the Equations</div>
            <div style={{ fontSize: '0.7rem', color: DIM, lineHeight: 1.5 }}>
              Each equation yields a single digit. Solve for the unknown variable in each equation.
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0.5rem 0' }} />

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
          <span style={{ background: PURPLE, color: '#fff', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.45rem', flexShrink: 0, letterSpacing: '1px' }}>02</span>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600, marginBottom: '0.15rem' }}>Combine the Digits</div>
            <div style={{ fontSize: '0.7rem', color: DIM, lineHeight: 1.5 }}>
              Enter the resulting digits in order from 01 to 04 to unlock the cipher.
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ EQUATIONS — one by one ══════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
        {EQUATIONS.map(({ id, label, text }) => (
          <div key={id} style={{
            background: 'rgba(226,54,54,0.04)',
            border: '1px solid rgba(226,54,54,0.18)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
          }}>
            <div style={{ fontSize: '0.48rem', color: 'rgba(226,54,54,0.55)', letterSpacing: '2px', marginBottom: '0.35rem' }}>
              {label}
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '1.35rem',
              color: '#ff6b6b',
              letterSpacing: '4px',
              lineHeight: 1,
            }}>
              {text}
            </div>
          </div>
        ))}
      </div>

      {/* ══════════ FINAL CODE + SUBMIT ══════════ */}
      <div style={{
        background: 'rgba(226,54,54,0.06)',
        border: '1px solid rgba(226,54,54,0.22)',
        borderRadius: '10px',
        padding: '1rem',
      }}>
        <div style={{ fontSize: '0.5rem', color: RED, letterSpacing: '2.5px', marginBottom: '0.85rem', textAlign: 'center' }}>
          ▸ FINAL UNLOCK CODE
        </div>

        {/* OTP-style inputs — auto-advance on digit, backspace goes back */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={() => {}}   /* controlled via onKeyDown */
              onKeyDown={e => handleKey(i, e)}
              onPaste={e => handleKey(i, e)}
              onFocus={e => e.target.select()}
              placeholder="-"
              style={{
                width: '40px',
                height: '40px',
                fontSize: '1.2rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                textAlign: 'center',
                background: 'rgba(255,255,255,0.04)',
                border: '2px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
                caretColor: 'transparent',
              }}
            />
          ))}
        </div>

        {wrong && !complete && (
          <div style={{ textAlign: 'center', color: '#ff6b6b', fontSize: '0.75rem', marginBottom: '0.75rem', letterSpacing: '1px' }}>
            ✗ Incorrect — check your calculations
          </div>
        )}

        {complete ? (
          <div className="fade-in" style={{
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
        ) : (
          <button
            onClick={handleSubmit}
            disabled={digits.some(d => d === '')}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: digits.some(d => d === '')
                ? 'rgba(255,255,255,0.05)'
                : 'linear-gradient(135deg, #E23636 0%, #9B1C1C 100%)',
              border: 'none',
              borderRadius: '8px',
              color: digits.some(d => d === '') ? 'rgba(255,255,255,0.3)' : '#fff',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: digits.some(d => d === '') ? 'not-allowed' : 'pointer',
            }}
          >
            SUBMIT CODE
          </button>
        )}
      </div>

    </div>
  );
}
