import { useTicker } from "../context/TickerContext";
import { useApiData } from "../hooks/useApiData";
import { getFundamentals, getRagSearch, getAnalystRatings, getSecFilings } from "../services/api";
import { LoadingState, ErrorState, EmptyState } from "../components/StateView";
import MetricCard from "../components/MetricCard";
import RagSources from "../components/RagSources";

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

function recommendationTone(rec) {
  if (!rec) return "default";
  const r = rec.toLowerCase();
  if (r.includes("buy")) return "bull";
  if (r.includes("sell") || r.includes("underperform")) return "bear";
  return "gold";
}

function edgarUrl(filing) {
  const accession = filing.accession_number.replace(/-/g, "");
  return `https://www.sec.gov/Archives/edgar/data/${filing.cik}/${accession}/${filing.primary_document}`;
}

function AnalystRatings({ rating }) {
  if (!rating) return null;

  return (
    <section className="panel p-6">
      <h2 className="font-semibold mb-4">Analyst Ratings</h2>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className={`badge ${
          recommendationTone(rating.recommendation) === "bull"
            ? "badge-bull"
            : recommendationTone(rating.recommendation) === "bear"
            ? "badge-bear"
            : "badge-neutral"
        }`}>
          {rating.recommendation ?? "N/A"}
        </span>
        <span className="text-xs text-slate-500">
          {rating.number_of_analysts ?? "—"} analysts covering
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Target Low"
          value={rating.target_low_price != null ? `$${rating.target_low_price.toFixed(2)}` : "—"}
        />
        <MetricCard
          label="Target Mean"
          value={rating.target_mean_price != null ? `$${rating.target_mean_price.toFixed(2)}` : "—"}
          tone="accent"
        />
        <MetricCard
          label="Target High"
          value={rating.target_high_price != null ? `$${rating.target_high_price.toFixed(2)}` : "—"}
        />
      </div>
    </section>
  );
}

function SecFilings({ filings }) {
  if (!filings || filings.length === 0) return null;

  return (
    <section className="panel p-6">
      <h2 className="font-semibold mb-4">Recent SEC Filings</h2>
      <div className="space-y-2">
        {filings.map((f) => (
          <a
            key={f.accession_number}
            href={edgarUrl(f)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-panel-800 rounded-lg p-3.5 hover:bg-panel-700 transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="badge badge-neutral shrink-0">{f.filing_type}</span>
              <span className="text-sm text-slate-300 truncate">{f.company_name}</span>
            </div>
            <span className="text-xs text-slate-500 shrink-0 ml-3">{f.filing_date}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function Fundamentals() {
  const { ticker } = useTicker();
  const { data, loading, error, refetch } = useApiData(() => getFundamentals(ticker), [ticker]);
  const { data: ragContext } = useApiData(() => getRagSearch(ticker), [ticker]);
  const { data: ratings } = useApiData(() => getAnalystRatings(ticker), [ticker]);
  const { data: filings } = useApiData(() => getSecFilings(ticker), [ticker]);

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
        <MetricCard
          label="Revenue Growth"
          value={formatPercent(f.revenue_growth)}
          tone={f.revenue_growth >= 0 ? "bull" : "bear"}
        />
      </div>

      <AnalystRatings rating={ratings?.[0]} />

      <SecFilings filings={filings} />

      <RagSources ragContext={ragContext} title="Related filings & context" />
    </div>
  );
}
