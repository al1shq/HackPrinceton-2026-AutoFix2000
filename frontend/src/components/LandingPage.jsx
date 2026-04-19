import { useState, useEffect } from 'react';

const FULL_TEXT = 'AutoFix 2000 Can Help Diagnose Your Car';
const BOOT_LINES = [
  'AUTOFIX 2000 DIAGNOSTIC SYSTEM v2.000',
  'Loading diagnostic modules...',
  'Initializing vehicle protocol matrix...',
  'Calibrating AI inference engine...',
  'Mounting OBD-II virtual interface...',
  'System ready.',
];

export default function LandingPage({ onStart }) {
  const [bootStep, setBootStep] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showMain, setShowMain] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Boot sequence
  useEffect(() => {
    if (bootStep < BOOT_LINES.length) {
      const t = setTimeout(() => setBootStep(s => s + 1), bootStep === 0 ? 300 : 420);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setShowMain(true), 600);
      return () => clearTimeout(t);
    }
  }, [bootStep]);

  // Typing animation after boot
  useEffect(() => {
    if (!showMain) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(FULL_TEXT.slice(0, i));
      if (i >= FULL_TEXT.length) {
        clearInterval(interval);
        setTimeout(() => setShowButton(true), 400);
      }
    }, 42);
    return () => clearInterval(interval);
  }, [showMain]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--cream)' }}>
      {/* Header bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="window-bar rounded-t-none" style={{ borderRadius: 0 }}>
          <div className="window-dot" style={{ background: '#ff6b6b' }} />
          <div className="window-dot" style={{ background: '#ffd93d' }} />
          <div className="window-dot" style={{ background: '#6bcb77' }} />
          <span className="ml-2">AUTOFIX2000.EXE — System Boot</span>
          <span className="ml-auto opacity-60">v2.000</span>
        </div>

        {/* Boot terminal */}
        <div className="retro-box p-4" style={{ background: '#1a1628', borderTop: 'none' }}>
          <div className="font-mono-retro text-xs space-y-1" style={{ color: '#b8a9d9' }}>
            {BOOT_LINES.slice(0, bootStep).map((line, i) => (
              <div key={i} className="slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <span style={{ color: '#7c6b9e' }}>{'>'}</span> {line}
                {i === bootStep - 1 && bootStep < BOOT_LINES.length && (
                  <span className="cursor" style={{ background: '#b8a9d9' }} />
                )}
                {i === BOOT_LINES.length - 1 && (
                  <span style={{ color: '#6bcb77' }}> ✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main card */}
      {showMain && (
        <div className="w-full max-w-2xl boot-in">
          <div className="retro-box">
            <div className="window-bar">
              <div className="window-dot" style={{ background: '#ff6b6b' }} />
              <div className="window-dot" style={{ background: '#ffd93d' }} />
              <div className="window-dot" style={{ background: '#6bcb77' }} />
              <span className="ml-2">AutoFix 2000 — Welcome</span>
            </div>

            <div className="p-10 flex flex-col items-center gap-8">
              {/* Logo / Title */}
              <div className="text-center">
                <div
                  className="font-pixel glow-text"
                  style={{
                    fontSize: '72px',
                    color: 'var(--dusky-purple-dark)',
                    lineHeight: 1,
                    letterSpacing: '0.02em',
                  }}
                >
                  AutoFix
                </div>
                <div
                  className="font-pixel glow-text-yellow"
                  style={{
                    fontSize: '56px',
                    color: '#a89830',
                    lineHeight: 1,
                    letterSpacing: '0.04em',
                    marginTop: '-4px',
                  }}
                >
                  2000
                </div>
                <div
                  className="font-mono-retro mt-3"
                  style={{ fontSize: '11px', color: 'var(--dusky-purple-light)', letterSpacing: '0.25em' }}
                >
                  AI-POWERED VEHICLE DIAGNOSTIC SYSTEM
                </div>
              </div>

              {/* Divider */}
              <div className="w-full flex items-center gap-3">
                <div style={{ flex: 1, height: '1px', background: 'var(--dusky-purple-light)' }} />
                <div className="font-pixel" style={{ color: 'var(--dusky-purple)', fontSize: '20px' }}>◆</div>
                <div style={{ flex: 1, height: '1px', background: 'var(--dusky-purple-light)' }} />
              </div>

              {/* Typing text */}
              <div
                className="retro-box-yellow w-full p-5 text-center"
                style={{ minHeight: '70px' }}
              >
                <p
                  className="font-mono-retro"
                  style={{ fontSize: '17px', color: 'var(--text-dark)', lineHeight: 1.5 }}
                >
                  {typedText}
                  {typedText.length < FULL_TEXT.length && <span className="cursor" />}
                </p>
              </div>

              {/* Status indicators */}
              <div className="flex gap-6 w-full justify-center">
                {[
                  { label: 'AI ENGINE', color: '#6bcb77' },
                  { label: 'DATABASE', color: '#6bcb77' },
                  { label: 'OBD MODULE', color: '#ffd93d' },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="status-dot status-dot-pulse" style={{ background: color }} />
                    <span className="font-mono-retro" style={{ fontSize: '10px', color: 'var(--text-mid)', letterSpacing: '0.1em' }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Start button */}
              {showButton && (
                <button
                  className="btn-primary fade-up"
                  style={{ fontSize: '15px', padding: '13px 48px' }}
                  onClick={onStart}
                >
                  ▶ START DIAGNOSIS
                </button>
              )}
            </div>
          </div>

          {/* Bottom info bar */}
          <div
            className="font-mono-retro text-center mt-4"
            style={{ fontSize: '10px', color: 'var(--dusky-purple-light)', letterSpacing: '0.2em' }}
          >
            © 2000 AUTOFIX SYSTEMS CORP · ALL RIGHTS RESERVED · PATENT PENDING
          </div>
        </div>
      )}
    </div>
  );
}
