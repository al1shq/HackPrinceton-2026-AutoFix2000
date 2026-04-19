import { useState, useEffect, useRef } from 'react';

const API_URL = 'http://localhost:3000/diagnose';

function ProbBar({ prob }) {
  const pct = typeof prob === 'number' ? Math.min(Math.max(prob * 100, 0), 100) : 0;
  return (
    <div className="progress-bar w-full">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function DiagnosticPage({ inputData, onComplete }) {
  // messages array in the format the backend expects
  const [messages, setMessages] = useState([]);
  // current backend response
  const [current, setCurrent] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const logEndRef = useRef(null);

  // Auto-scroll reasoning log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [current]);

  // On mount: send initial description to kick off the session
  useEffect(() => {
    const initial = [{ role: 'user', content: inputData.description }];
    setMessages(initial);
    callBackend(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callBackend = async (msgs) => {
  setLoading(true);
  setError(null);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs }),
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();

    setCurrent(data);
    
    if (data.confidence >= 0.85) {
      setTimeout(() => onComplete({ apiResult: data, messages: msgs }), 600);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleAnswer = (answerText) => {
    if (!current || loading) return;

    // Build updated message history:
    // append assistant's question, then user's answer
    const updated = [
      ...messages,
      { role: 'assistant', content: current.question },
      { role: 'user', content: answerText },
    ];
    setMessages(updated);
    setTextInput('');
    setTurnCount(t => t + 1);
    callBackend(updated);
  };

  // Derived display values
  const hypotheses = current?.hypotheses ?? [];
  const wastePrevented = current?.waste_prevented ?? {};
  const question = current?.question ?? '';
  const questionType = current?.question_type ?? 'yes_no';
  const options = current?.options ?? [];
  const confidencePct = current?.confidence != null ? Math.round(current.confidence * 100) : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      {/* Top bar */}
      <div className="window-bar" style={{ borderBottom: '2px solid var(--dusky-purple)' }}>
        <div className="window-dot" style={{ background: '#ff6b6b' }} />
        <div className="window-dot" style={{ background: '#ffd93d' }} />
        <div className="window-dot" style={{ background: '#6bcb77' }} />
        <span className="ml-2 font-pixel" style={{ fontSize: '16px' }}>AutoFix 2000</span>
        <span className="ml-4 opacity-70">— Active Diagnostic Session</span>
        <div className="ml-auto flex items-center gap-3">
          <div
            className="status-dot status-dot-pulse"
            style={{ background: loading ? '#ffd93d' : '#6bcb77' }}
          />
          <span style={{ fontSize: '10px', opacity: 0.8, letterSpacing: '0.1em' }}>
            {loading ? 'PROCESSING...' : 'AI ENGINE ACTIVE'}
          </span>
        </div>
      </div>

      {/* Confidence progress bar */}
      <div className="progress-bar" style={{ height: '4px', border: 'none', borderRadius: 0 }}>
        <div
          className="progress-fill"
          style={{ width: confidencePct != null ? `${confidencePct}%` : '0%' }}
        />
      </div>

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 'calc(100vh - 60px)' }}>

        {/* ── LEFT: Reasoning / Hypotheses Panel ── */}
        <div className="flex flex-col" style={{ width: '260px', minWidth: '220px', borderRight: '2px solid var(--dusky-purple-light)' }}>
          <div className="window-bar-yellow" style={{ borderBottom: '2px solid #c8b84a' }}>
            <span>◈ REASONING PANEL</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4" style={{ background: 'var(--cream)' }}>
            {/* Hypotheses */}
            <div>
              <div className="font-mono-retro mb-2" style={{ fontSize: '10px', color: 'var(--text-mid)', letterSpacing: '0.15em' }}>
                ACTIVE HYPOTHESES
              </div>

              {hypotheses.length === 0 && !loading && (
                <div className="font-mono-retro" style={{ fontSize: '10px', color: 'var(--dusky-purple-light)' }}>
                  Awaiting data...
                </div>
              )}

              <div className="space-y-3">
                {hypotheses.map((h, i) => {
                  const label = typeof h === 'string' ? h : (h.label ?? h.name ?? JSON.stringify(h));
                  const prob = typeof h === 'object' && h.probability != null
                    ? h.probability
                    : typeof h === 'object' && h.prob != null
                    ? h.prob
                    : null;
                  const probPct = prob != null
                    ? (prob <= 1 ? Math.round(prob * 100) : Math.round(prob))
                    : null;

                  return (
                    <div key={i} className="slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-mono-retro" style={{ fontSize: '10px', color: 'var(--text-dark)', lineHeight: 1.3 }}>
                          {label}
                        </span>
                        {probPct != null && (
                          <span className="font-pixel ml-1" style={{ fontSize: '14px', color: 'var(--dusky-purple)', whiteSpace: 'nowrap' }}>
                            {probPct}%
                          </span>
                        )}
                      </div>
                      {prob != null && <ProbBar prob={prob <= 1 ? prob : prob / 100} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confidence indicator */}
            {confidencePct != null && (
              <div className="border-t pt-3" style={{ borderColor: 'var(--soft-gray)' }}>
                <div className="font-mono-retro mb-1" style={{ fontSize: '10px', color: 'var(--text-mid)', letterSpacing: '0.15em' }}>
                  DIAGNOSIS CONFIDENCE
                </div>
                <div className="flex items-center gap-2">
                  <div className="progress-bar flex-1">
                    <div className="progress-fill" style={{ width: `${confidencePct}%` }} />
                  </div>
                  <span className="font-pixel" style={{ fontSize: '18px', color: 'var(--dusky-purple-dark)', minWidth: '40px' }}>
                    {confidencePct}%
                  </span>
                </div>
                <div className="font-mono-retro mt-1" style={{ fontSize: '9px', color: 'var(--dusky-purple-light)' }}>
                  Target: 85% for final diagnosis
                </div>
              </div>
            )}

            {/* Q&A log */}
            {messages.length > 1 && (
              <div className="border-t pt-3" style={{ borderColor: 'var(--soft-gray)' }}>
                <div className="font-mono-retro mb-2" style={{ fontSize: '10px', color: 'var(--text-mid)', letterSpacing: '0.15em' }}>
                  SESSION LOG
                </div>
                <div
                  className="retro-box p-2"
                  style={{ background: '#1a1628', maxHeight: '180px', overflowY: 'auto' }}
                >
                  {messages.slice(1).map((m, i) => (
                    <div key={i} className="font-mono-retro" style={{ fontSize: '9px', color: m.role === 'user' ? '#ffd93d' : '#b8a9d9', lineHeight: 1.6 }}>
                      <span style={{ color: m.role === 'user' ? '#c8a000' : '#7c6b9e' }}>
                        {m.role === 'user' ? 'YOU' : ' AI'}
                      </span>
                      {' '}{m.content}
                    </div>
                  ))}
                  {loading && (
                    <div className="font-mono-retro" style={{ fontSize: '9px', color: '#7c6b9e' }}>
                      {' AI'} <span className="cursor" style={{ background: '#b8a9d9' }} />
                    </div>
                  )}
                  <div ref={logEndRef} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: Question Panel ── */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6 overflow-y-auto">
          <div className="w-full max-w-lg">

            {/* Turn counter */}
            <div className="font-mono-retro mb-3 text-center" style={{ fontSize: '10px', color: 'var(--dusky-purple-light)', letterSpacing: '0.2em' }}>
              DIAGNOSTIC QUERY {turnCount + 1}
              {confidencePct != null && ` · CONFIDENCE ${confidencePct}%`}
            </div>

            {/* Question box */}
            <div className="retro-box mb-5 fade-up" key={turnCount}>
              <div className="window-bar" style={{ margin: 0 }}>
                <span>◉ SYSTEM QUERY</span>
                {questionType && (
                  <span className="ml-auto font-mono-retro opacity-70" style={{ fontSize: '9px', letterSpacing: '0.1em' }}>
                    {questionType.toUpperCase().replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className="p-6">
                {loading && !question ? (
                  <div className="flex justify-center items-center py-4">
                    <span className="font-mono-retro" style={{ fontSize: '13px', color: 'var(--dusky-purple-light)' }}>
                      Analyzing symptoms<span className="cursor" />
                    </span>
                  </div>
                ) : (
                  <p className="font-mono-retro text-center" style={{ fontSize: '16px', color: 'var(--text-dark)', lineHeight: 1.8 }}>
                    {question}
                  </p>
                )}

                {loading && question && (
                  <div className="flex justify-center mt-4">
                    <span className="font-mono-retro" style={{ fontSize: '11px', color: 'var(--dusky-purple-light)' }}>
                      Processing answer<span className="cursor" />
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="retro-box-yellow p-4 mb-4 text-center fade-up">
                <p className="font-mono-retro" style={{ fontSize: '12px', color: '#7a3a00' }}>
                  ⚠ Connection error: {error}
                </p>
                <button
                  className="btn-secondary mt-3"
                  style={{ fontSize: '11px', padding: '6px 16px' }}
                  onClick={() => callBackend(messages)}
                >
                  ↺ RETRY
                </button>
              </div>
            )}

            {/* Answer inputs — only show when not loading */}
            {!loading && !error && question && (
              <div className="space-y-3 fade-up" style={{ animationDelay: '0.1s' }}>

                {/* YES / NO */}
                {questionType === 'yes_no' && (
                  <div className="flex gap-3 justify-center">
                    {['Yes', 'No'].map((opt) => (
                      <button
                        key={opt}
                        className="btn-answer"
                        style={{ flex: 1, maxWidth: '160px', fontSize: '14px', padding: '11px 24px' }}
                        onClick={() => handleAnswer(opt)}
                      >
                        {opt === 'Yes' ? '✓ Yes' : '✕ No'}
                      </button>
                    ))}
                  </div>
                )}

                {/* MULTIPLE CHOICE */}
                {questionType === 'multiple_choice' && (
                  <div className="grid grid-cols-2 gap-2">
                    {options.map((opt, i) => (
                      <button
                        key={i}
                        className="btn-answer"
                        style={{ fontSize: '12px', padding: '10px 14px', textAlign: 'left' }}
                        onClick={() => handleAnswer(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* inspection */}
                {(questionType === 'inspection') && (
                  <>
                    {questionType === 'inspection' && (
                      <div className="retro-box-yellow p-3 mb-2 text-center">
                        <span className="font-mono-retro" style={{ fontSize: '11px', color: '#6b5a10', letterSpacing: '0.08em' }}>
                          🔍 Perform the inspection described above, then enter your observation below.
                        </span>
                      </div>
                    )}
                    {/* text*/}
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            className="retro-input flex-1"
                            style={{ fontSize: '13px' }}
                            placeholder="Type your answer here..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && textInput.trim() && handleAnswer(textInput.trim())}
                          />
                          <button
                            className="btn-primary"
                            style={{ padding: '8px 16px', fontSize: '14px' }}
                            onClick={() => textInput.trim() && handleAnswer(textInput.trim())}
                            disabled={!textInput.trim()}
                          >
                            ↵
                          </button>
                        </div>
                  </>
                )}

              </div>
            )}
          </div>

          {/* Uploaded image reference */}
          {inputData.imagePreview && (
            <div className="w-full max-w-lg">
              <div className="retro-box-yellow">
                <div className="window-bar-yellow">
                  <span>◈ UPLOADED REFERENCE IMAGE</span>
                </div>
                <div className="p-2">
                  <img src={inputData.imagePreview} alt="vehicle" className="w-full max-h-32 object-contain" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Waste / Impact Panel ── */}
        <div className="flex flex-col" style={{ width: '240px', minWidth: '200px', borderLeft: '2px solid var(--dusky-purple-light)' }}>
          <div className="window-bar" style={{ borderBottom: '2px solid var(--dusky-purple)' }}>
            <span>◈ WASTE TRACKER</span>
          </div>

          <div className="flex-1 p-3 space-y-4 overflow-y-auto" style={{ background: 'var(--cream)' }}>

            {/* Dynamic waste_prevented fields from backend */}
            {Object.keys(wastePrevented).length > 0 ? (
              Object.entries(wastePrevented).map(([key, value]) => {
                const isMonetary = typeof value === 'string'
                  ? value.includes('$') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('money') || key.toLowerCase().includes('saving')
                  : false;
                const isCo2 = key.toLowerCase().includes('co2') || key.toLowerCase().includes('co₂') || key.toLowerCase().includes('carbon') || key.toLowerCase().includes('emission');
                const label = key
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, c => c.toUpperCase());

                return (
                  <div
                    key={key}
                    className={isCo2 ? 'retro-box p-4 text-center' : isMonetary ? 'retro-box-yellow p-4 text-center' : 'retro-box-dark p-3'}
                  >
                    <div className="font-mono-retro" style={{ fontSize: '10px', color: isCo2 ? 'var(--text-mid)' : isMonetary ? '#6b5a10' : 'var(--text-mid)', letterSpacing: '0.12em' }}>
                      {label}
                    </div>
                    <div
                      className={isCo2 ? 'font-pixel glow-text mt-1' : isMonetary ? 'font-pixel glow-text-yellow mt-1' : 'font-mono-retro mt-1'}
                      style={{
                        fontSize: isCo2 || isMonetary ? '28px' : '13px',
                        color: isCo2 ? 'var(--dusky-purple-dark)' : isMonetary ? '#7a5a10' : 'var(--text-dark)',
                        lineHeight: 1.2,
                      }}
                    >
                      {String(value)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="retro-box-dark p-4 text-center">
                <div className="font-mono-retro" style={{ fontSize: '10px', color: 'var(--dusky-purple-light)' }}>
                  Waste savings will appear as diagnosis progresses...
                </div>
              </div>
            )}

            {/* Report summary */}
            <div className="border-t pt-3" style={{ borderColor: 'var(--soft-gray)' }}>
              <div className="font-mono-retro mb-1" style={{ fontSize: '10px', color: 'var(--text-mid)', letterSpacing: '0.15em' }}>
                YOUR REPORT
              </div>
              <div className="retro-box p-2" style={{ background: '#f5f0ff' }}>
                <p className="font-mono-retro" style={{ fontSize: '9px', color: 'var(--text-dark)', lineHeight: 1.6 }}>
                  {inputData.description.slice(0, 140)}{inputData.description.length > 140 ? '...' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
