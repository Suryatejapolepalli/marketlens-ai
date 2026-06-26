import { useTicker } from "../context/TickerContext";
import { useApiData } from "../hooks/useApiData";
import { getAiAnalysis } from "../services/api";
import { LoadingState, ErrorState, EmptyState } from "../components/StateView";
import RagSources from "../components/RagSources";

function toneFor(recommendation) {
  if (recommendation === "Buy") return "bull";
  if (recommendation === "Sell") return "bear";
  return "gold";
}

function toneForSignal(signal) {
  if (!signal) return "default";
  const s = signal.toLowerCase();
  if (["bullish", "positive", "strong", "low risk"].includes(s)) return "bull";
  if (["bearish", "negative", "weak", "high risk"].includes(s)) return "bear";
  return "gold";
}

function ScoreGauge({ score }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, score ?? 0)) / 100;
  const offset = circumference * (1 - pct);
  const color = score >= 75 ? "#4ade80" : score >= 55 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="#1e2738" strokeWidth="14" fill="none" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke={color}
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="stat-mono text-4xl font-bold">{score ?? "—"}</span>
        <span className="text-xs text-slate-500 mt-1">out of 100</span>
      </div>
    </div>
  );
}

function AgentCard({ label, agent }) {
  const tone = toneForSignal(agent?.signal);
  return (
    <div className="panel panel-hover p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <span className="stat-mono text-sm font-semibold text-slate-300">{agent?.score ?? "—"}</span>
      </div>
      <p
        className={`badge ${
          tone === "bull" ? "badge-bull" : tone === "bear" ? "badge-bear" : "badge-neutral"
        }`}
      >
        {agent?.signal ?? "Unknown"}
      </p>
      {agent?.reasons?.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {agent.reasons.slice(0, 3).map((reason, i) => (
            <li key={i} className="text-xs text-slate-400 leading-snug">
              · {reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AIAnalyst() {
  const { ticker } = useTicker();
  const { data, loading, error, refetch } = useApiData(() => getAiAnalysis(ticker), [ticker]);

  if (loading) return <LoadingState label={`Running AI agent analysis for ${ticker}...`} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data || data.error) return <EmptyState message={data?.error || "No AI analysis available."} />;

  const tone = toneFor(data.final_recommendation);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Analyst</h1>
        <p className="text-sm text-slate-500 mt-1">
          Multi-agent score and rationale for {data.ticker ?? ticker}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="panel p-8 flex flex-col items-center justify-center text-center">
          <ScoreGauge score={data.ai_score} />
          <p
            className={`badge mt-5 ${
              tone === "bull" ? "badge-bull" : tone === "bear" ? "badge-bear" : "badge-neutral"
            }`}
          >
            {data.final_recommendation}
          </p>
          <p className="text-xs text-slate-500 mt-3">Ticker: {data.ticker}</p>
        </section>

        <section className="lg:col-span-2 panel p-6">
          <h2 className="font-semibold mb-4">Why this score</h2>
          {data.reasons?.length ? (
            <div className="space-y-2.5">
              {data.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-3 bg-panel-800 rounded-lg p-3.5">
                  <span
                    className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                      tone === "bull" ? "bg-bull-400" : tone === "bear" ? "bg-bear-400" : "bg-gold-400"
                    }`}
                  />
                  <span className="text-sm text-slate-300">{reason}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No contributing signals were recorded." />
          )}
        </section>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <AgentCard label="Technical" agent={data.technical} />
        <AgentCard label="Sentiment" agent={data.sentiment} />
        <AgentCard label="Fundamentals" agent={data.fundamentals} />
        <AgentCard label="Risk" agent={data.risk} />
        <AgentCard label="Market Context" agent={data.market_context} />
      </div>

      {data.llm_summary && (
        <section className="panel p-6">
          <h2 className="font-semibold mb-4">AI research summary</h2>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {data.llm_summary}
          </p>
        </section>
      )}

      <RagSources ragContext={data.rag_context} />
    </div>
  );
}
