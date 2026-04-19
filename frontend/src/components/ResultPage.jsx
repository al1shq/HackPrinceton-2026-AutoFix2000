import { useState } from 'react';

function ConfidenceRing({ score }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <svg width="120" height="120" className="confidence-ring" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--soft-gray)" strokeWidth="8" />
      <circle
        cx="60" cy="60" r={r} fill="none"
        stroke="var(--dusky-purple)" strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease', filter: 'drop-shadow(0 0 6px rgba(124,107,158,0.6))' }}
      />
      <text
        x="60" y="64" textAnchor="middle"
        style={{ transform: 'rotate(90deg) translate(0px, -120px)', fontFamily: 'VT323', fontSize: '28px', fill: 'var(--dusky-purple-dark)' }}
      >
        {score}%
      </text>
    </svg>
  );
}

export default function ResultPage({ result, inputData, onRestart }) {
  const [showTranscript, setShowTranscript] = useState(false);

  // result.apiResult is the final backend response object
  // result.messages is the full conversation history
  const { apiResult, messages } = result;

  const recommendation = apiResult?.recommendation ?? '';
  const confidenceRaw = apiResult?.confidence ?? 0;
  const confidencePct = Math.round(
    confidenceRaw <= 1 ? confidenceRaw * 100 : confidenceRaw
  );
  const hypotheses = apiResult?.hypotheses ?? [];
  const wastePrevented = apiResult?.waste_prevented ?? {};

  // Parse recommendation: could be a string or an object
  const recommendationText = typeof recommendation === 'string'
    ? recommendation
    : recommendation?.summary ?? recommendation?.text ?? JSON.stringify(recommendation);

  // Steps: recommendation might contain a steps array, or it could be in the string
  const steps = Array.isArray(recommendation?.steps)
    ? recommendation.steps
    : typeof recommendation === 'string'
    ? recommendation.split(/\n+/).filter(Boolean)
    : [];

  // Top diagnosis label from hypotheses
  const topHypothesis = (() => {
    if (!hypotheses.length) return 'Diagnosis Complete';
    const first = hypotheses[0];
    return typeof first === 'string' ? first : (first.label ?? first.name ?? 'Diagnosis Complete');
  })();

  // Conversation pairs for transcript
  const transcript = [];
  for (let i = 1; i < messages.length; i += 2) {
    const assistant = messages[i];
    const user = messages[i + 1];
    if (assistant && user) {
      transcript.push({ q: assistant.content, a: user.content });
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      {/* Top bar */}
      <div className="window-bar" style={{ borderBottom: '2px solid var(--dusky-purple)' }}>
        <div className="window-dot" style={{ background: '#ff6b6b' }} />
        <div className="window-dot" style={{ background: '#ffd93d' }} />
        <div className="window-dot" style={{ background: '#6bcb77' }} />
        <span className="ml-2 font-pixel" style={{ fontSize: '16px' }}>AutoFix 2000</span>
        <span className="ml-4 opacity-70">— Diagnostic Complete</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="status-dot" style={{ background: '#6bcb77' }} />
          <span style={{ fontSize: '10px', opacity: 0.8, letterSpacing: '0.1em' }}>REPORT READY</span>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6 boot-in">

          {/* ── Header: Diagnosis + Confidence ── */}
          <div className="retro-box">
            <div className="window-bar">
              <span>◉ DIAGNOSTIC RESULT</span>
              <span className="ml-auto opacity-70 font-mono-retro" style={{ fontSize: '10px' }}>SESSION COMPLETE</span>
            </div>
            <div className="p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <ConfidenceRing score={confidencePct} />
                <div className="font-mono-retro text-center" style={{ fontSize: '10px', color: 'var(--text-mid)', letterSpacing: '0.15em' }}>
                  CONFIDENCE
                </div>
              </div>

              <div className="flex-1">
                <div className="font-mono-retro mb-1" style={{ fontSize: '10px', color: 'var(--dusky-purple-light)', letterSpacing: '0.2em' }}>
                  MOST LIKELY DIAGNOSIS
                </div>
                <div className="font-pixel glow-text" style={{ fontSize: '38px', color: 'var(--dusky-purple-dark)', lineHeight: 1.1 }}>
                  {topHypothesis}
                </div>
                <div className="mt-3 retro-box-dark p-3">
                  <p className="font-mono-retro" style={{ fontSize: '12px', color: 'var(--text-dark)', lineHeight: 1.7 }}>
                    Based on {Math.max(transcript.length, 1)} diagnostic {transcript.length === 1 ? 'query' : 'queries'},
                    the AI has identified this as the primary cause. Confidence rated at{' '}
                    <strong>{confidencePct}%</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Recommendation + Impact ── */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Recommendation */}
            <div className="retro-box">
              <div className="window-bar">
                <span>◈ RECOMMENDED FIX</span>
              </div>
              <div className="p-4">
                {steps.length > 1 ? (
                  <div className="space-y-2">
                    {steps.map((step, i) => (
                      <div
                        key={i}
                        className="retro-box-dark fade-up"
                        style={{ animationDelay: `${i * 0.07}s`, padding: '10px 12px', borderLeft: '3px solid var(--dusky-purple)' }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="font-pixel shrink-0"
                            style={{
                              fontSize: '20px', color: 'white', background: 'var(--dusky-purple)',
                              width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            {i + 1}
                          </div>
                          <p className="font-mono-retro" style={{ fontSize: '11px', color: 'var(--text-dark)', lineHeight: 1.6 }}>
                            {step}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="retro-box-dark p-4" style={{ borderLeft: '3px solid var(--dusky-purple)' }}>
                    <p className="font-mono-retro" style={{ fontSize: '12px', color: 'var(--text-dark)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                      {recommendationText}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Waste prevented + Hypotheses */}
            <div className="space-y-4">

              {/* Waste prevented */}
              {Object.keys(wastePrevented).length > 0 && (
                <div className="retro-box">
                  <div className="window-bar-yellow">
                    <span>◈ WASTE PREVENTED</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {Object.entries(wastePrevented).map(([key, value]) => {
                      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                      const isMoney = key.toLowerCase().includes('cost') || key.toLowerCase().includes('money') || key.toLowerCase().includes('saving') || String(value).includes('$');
                      const isCo2 = key.toLowerCase().includes('co2') || key.toLowerCase().includes('carbon') || key.toLowerCase().includes('emission');
                      return (
                        <div
                          key={key}
                          className={isMoney ? 'retro-box-yellow p-3 text-center' : isCo2 ? 'retro-box p-3 text-center' : 'retro-box-dark p-3 text-center'}
                        >
                          <div className="font-mono-retro" style={{ fontSize: '9px', color: isMoney ? '#6b5a10' : 'var(--text-mid)', letterSpacing: '0.1em' }}>
                            {label}
                          </div>
                          <div
                            className={isMoney ? 'font-pixel glow-text-yellow mt-1' : isCo2 ? 'font-pixel glow-text mt-1' : 'font-mono-retro mt-1'}
                            style={{ fontSize: isMoney || isCo2 ? '26px' : '13px', color: isMoney ? '#7a5a10' : isCo2 ? 'var(--dusky-purple-dark)' : 'var(--text-dark)' }}
                          >
                            {String(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hypothesis ranking */}
              {hypotheses.length > 0 && (
                <div className="retro-box">
                  <div className="window-bar">
                    <span>◈ HYPOTHESIS RANKING</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {hypotheses.map((h, i) => {
                      const label = typeof h === 'string' ? h : (h.label ?? h.name ?? String(h));
                      const prob = typeof h === 'object'
                        ? (h.probability ?? h.prob ?? null)
                        : null;
                      const probPct = prob != null
                        ? (prob <= 1 ? Math.round(prob * 100) : Math.round(prob))
                        : null;
                      return (
                        <div key={i}>
                          <div className="flex justify-between mb-1">
                            <span className="font-mono-retro" style={{ fontSize: '10px', color: 'var(--text-dark)' }}>
                              {i + 1}. {label}
                            </span>
                            {probPct != null && (
                              <span className="font-pixel" style={{ fontSize: '16px', color: 'var(--dusky-purple)' }}>
                                {probPct}%
                              </span>
                            )}
                          </div>
                          {prob != null && (
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${prob <= 1 ? prob * 100 : prob}%` }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Q&A Transcript (expandable) ── */}
          {transcript.length > 0 && (
            <div className="retro-box">
              <div
                className="window-bar cursor-pointer"
                onClick={() => setShowTranscript(!showTranscript)}
                style={{ userSelect: 'none' }}
              >
                <span>◈ DIAGNOSTIC TRANSCRIPT</span>
                <span className="ml-auto">{showTranscript ? '▲ COLLAPSE' : '▼ EXPAND'}</span>
              </div>
              {showTranscript && (
                <div className="p-4 space-y-2 boot-in">
                  {transcript.map((t, i) => (
                    <div key={i} className="retro-box-dark p-3">
                      <div className="font-mono-retro" style={{ fontSize: '10px', color: 'var(--text-mid)' }}>
                        Q{i + 1}: {t.q}
                      </div>
                      <div className="font-mono-retro mt-1" style={{ fontSize: '11px', color: 'var(--dusky-purple-dark)' }}>
                        → {t.a}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pb-4">
            <button className="btn-primary" style={{ fontSize: '13px' }} onClick={() => window.print()}>
              ⎙ PRINT REPORT
            </button>
            <button className="btn-secondary" style={{ fontSize: '13px' }} onClick={onRestart}>
              ↺ NEW DIAGNOSIS
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
