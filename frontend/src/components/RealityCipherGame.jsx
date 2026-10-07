import { useState, useRef } from 'react';

// Math equations for digit mapping
// 4, 7, 2, 8
const ANSWER = '4728';

const EQUATIONS = [
  { id: 0, label: 'EQUATION 01 (Solve for x)', text: '5(x - 2) + 3x = 22' },
  { id: 1, label: 'EQUATION 02 (Solve for y)', text: '3(2y - 5) - 4y = -1' },
  { id: 2, label: 'EQUATION 03 (Solve for z, z > 0)', text: '(3z² + 4) / 2 = 8' },
  { id: 3, label: 'EQUATION 04 (Solve for w)', text: '2^(w - 5) = 8' },
];

const RED = '#E23636';

export default function RealityCipherGame({ onComplete }) {
  const [code,      setCode]      = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [complete,  setComplete]  = useState(false);
  const [wrong,     setWrong]     = useState(false);
  const inputRef = useRef(null);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClear = () => {
    setCode('');
    setWrong(false);
    focusInput();
  };

  const handleChange = (e) => {
    setWrong(false);
    const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(clean);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (code.length === 4) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (code === ANSWER && !complete) {
      setComplete(true);
      setTimeout(() => { if (onComplete) onComplete(); }, 700);
    } else {
      setWrong(true);
    }
  };

  return (
    <div style={{ fontFamily: "'Rajdhani', sans-serif" }}>

      {/* ══════════ EQUATIONS ══════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
        {EQUATIONS.map(({ id, label, text }) => (
          <div key={id} style={{
            background: 'rgba(226,54,54,0.04)',
            border: '1px solid rgba(226,54,54,0.18)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            transition: 'border-color 0.2s',
          }}>
            <div style={{ fontSize: '0.52rem', color: 'rgba(226,54,54,0.65)', letterSpacing: '2px', marginBottom: '0.35rem', fontWeight: 600 }}>
              {label}
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: 'clamp(1.1rem, 3.8vw, 1.35rem)',
              color: '#ff6b6b',
              letterSpacing: 'clamp(1px, 1vw, 3px)',
              lineHeight: 1.2,
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
        borderRadius: '12px',
        padding: '1.15rem 1rem',
      }}>
        <div style={{
          fontSize: '0.55rem',
          color: RED,
          letterSpacing: '2.5px',
          marginBottom: '0.5rem',
          textAlign: 'center',
          fontWeight: 700,
        }}>
          ▸ FINAL UNLOCK CODE
        </div>

        <div style={{
          textAlign: 'center',
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '0.85rem',
          letterSpacing: '0.5px',
        }}>
          Tap boxes below to open keypad • Enter 4-digit code
        </div>

        {/* Unified Mobile-Ready Input: transparent native tel input over 4 visual boxes */}
        <div
          className="cipher-input-container"
          onClick={focusInput}
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0.5rem auto 1rem',
            maxWidth: '320px',
            cursor: 'pointer',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {/* Visual Digits */}
          <div style={{
            display: 'flex',
            gap: 'clamp(0.5rem, 2.5vw, 0.85rem)',
            justifyContent: 'center',
            width: '100%',
            pointerEvents: 'none',
          }}>
            {[0, 1, 2, 3].map((i) => {
              const char = code[i] || '';
              const isActive = isFocused && (i === code.length || (code.length === 4 && i === 3));
              const isFilled = Boolean(char);

              return (
                <div
                  key={i}
                  className={`cipher-digit-input ${isActive ? 'active-focus' : ''} ${isFilled ? 'filled' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                  }}
                >
                  {char ? (
                    <span>{char}</span>
                  ) : isActive ? (
                    <span className="cipher-cursor" />
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '1.2rem' }}>-</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Real native tel input: guarantees mobile numeric keyboard opens immediately on tap */}
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={4}
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              fontSize: '24px', // Prevents iOS Safari auto-zoom
              zIndex: 5,
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-label="4-digit unlock code"
          />
        </div>

        {/* Clear Digits quick action */}
        {code.length > 0 && !complete && (
          <div style={{ textAlign: 'center', marginBottom: '0.85rem' }}>
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.45)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                letterSpacing: '1px',
                textDecoration: 'underline',
                padding: '4px 8px',
              }}
            >
              Clear Digits
            </button>
          </div>
        )}

        {wrong && !complete && (
          <div style={{ textAlign: 'center', color: '#ff6b6b', fontSize: '0.78rem', marginBottom: '0.85rem', letterSpacing: '1px' }}>
            ✗ Incorrect code — check your calculations
          </div>
        )}

        {complete ? (
          <div className="fade-in" style={{
            padding: '0.85rem',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.4)',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: '#22c55e',
            letterSpacing: '2px',
            fontWeight: 700,
          }}>
            ✓ CIPHER DECODED — ACCESS GRANTED
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={code.length < 4}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: code.length < 4
                ? 'rgba(255,255,255,0.05)'
                : 'linear-gradient(135deg, #E23636 0%, #9B1C1C 100%)',
              border: 'none',
              borderRadius: '8px',
              color: code.length < 4 ? 'rgba(255,255,255,0.3)' : '#fff',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: code.length < 4 ? 'not-allowed' : 'pointer',
              boxShadow: code.length < 4 ? 'none' : '0 4px 14px rgba(226,54,54,0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            SUBMIT CODE
          </button>
        )}
      </div>

    </div>
  );
}
