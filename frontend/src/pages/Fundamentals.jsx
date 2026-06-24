import { useTicker } from "../context/TickerContext";
import { useApiData } from "../hooks/useApiData";
import { getFundamentals } from "../services/api";
import { LoadingState, ErrorState, EmptyState } from "../components/StateView";
import MetricCard from "../components/MetricCard";

function formatLarge(n) {
  if (n == null) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function formatPercent(n) {
  if (n == null) return "—";
  return `${(n * 100).toFixed(2)}%`;
}

export default function Fundamentals() {
  const { ticker } = useTicker();
  const { data, loading, error, refetch } = useApiData(() => getFundamentals(ticker), [ticker]);

  if (loading) return <LoadingState label={`Loading fundamentals for ${ticker}...`} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data || data.length === 0) return <EmptyState message="No fundamentals data found for this ticker." />;

  const f = data[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fundamentals</h1>
        <p className="text-sm text-slate-500 mt-1">
          Company profile and financial ratios for {ticker}
        </p>
      </div>

      <section className="panel p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge badge-neutral">{f.sector ?? "Sector N/A"}</span>
          <span className="badge badge-neutral">{f.industry ?? "Industry N/A"}</span>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard label="Market Cap" value={formatLarge(f.market_cap)} tone="accent" />
        <MetricCard label="P/E Ratio" value={f.pe_ratio != null ? f.pe_ratio.toFixed(2) : "—"} />
        <MetricCard label="EPS" value={f.eps != null ? `$${f.eps.toFixed(2)}` : "—"} />
        <MetricCard label="Revenue" value={formatLarge(f.revenue)} />
        <MetricCard
          label="Profit Margin"
          value={formatPercent(f.profit_margin)}
          tone={f.profit_margin >= 0 ? "bull" : "bear"}
        />
        <MetricCard label="Debt / Equity" value={f.debt_to_equity != null ? f.debt_to_equity.toFixed(2) : "—"} tone="gold" />
      </div>
    </div>
  );
}
