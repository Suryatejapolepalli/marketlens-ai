import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTicker } from "../context/TickerContext";
import { useApiData } from "../hooks/useApiData";
import { getMarketPrices, getTechnicalIndicators, getAiScore } from "../services/api";
import MetricCard from "../components/MetricCard";
import { LoadingState, ErrorState, EmptyState } from "../components/StateView";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function recommendationTone(rec) {
  if (!rec) return "default";
  if (rec.includes("Bullish")) return "bull";
  if (rec.includes("Bearish") || rec.includes("Risky")) return "bear";
  return "gold";
}

export default function Dashboard() {
  const { ticker } = useTicker();

  const prices = useApiData(() => getMarketPrices(ticker), [ticker]);
  const tech = useApiData(() => getTechnicalIndicators(ticker), [ticker]);
  const score = useApiData(() => getAiScore(ticker), [ticker]);

  const loading = prices.loading || tech.loading || score.loading;
  const error = prices.error || tech.error || score.error;

  function retryAll() {
    prices.refetch();
    tech.refetch();
    score.refetch();
  }

  if (loading) return <LoadingState label={`Loading ${ticker} dashboard...`} />;
  if (error) return <ErrorState message={error} onRetry={retryAll} />;

  const sortedPrices = [...(prices.data || [])].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const sortedTech = [...(tech.data || [])].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const latestPrice = sortedPrices[sortedPrices.length - 1];
  const prevPrice = sortedPrices[sortedPrices.length - 2];
  const latestTech = sortedTech[sortedTech.length - 1];
  const aiScore = score.data;

  const change =
    latestPrice && prevPrice ? latestPrice.close - prevPrice.close : null;
  const changePct =
    change !== null && prevPrice ? (change / prevPrice.close) * 100 : null;

  const chartData = sortedPrices.slice(-90).map((p) => ({
    date: formatDate(p.date),
    close: Number(p.close?.toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{ticker} Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time research overview powered by your BigQuery pipeline
          </p>
        </div>
        {aiScore?.recommendation && (
          <span className={`badge ${
            recommendationTone(aiScore.recommendation) === "bull"
              ? "badge-bull"
              : recommendationTone(aiScore.recommendation) === "bear"
              ? "badge-bear"
              : "badge-neutral"
          }`}>
            {aiScore.recommendation}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Last Close"
          value={latestPrice ? `$${latestPrice.close.toFixed(2)}` : "—"}
        />
        <MetricCard
          label="Day Change"
          value={
            change !== null
              ? `${change >= 0 ? "+" : ""}${change.toFixed(2)} (${changePct.toFixed(2)}%)`
              : "—"
          }
          tone={change >= 0 ? "bull" : "bear"}
        />
        <MetricCard
          label="AI Score"
          value={aiScore?.score !== undefined ? `${aiScore.score}/100` : "—"}
          tone="accent"
        />
        <MetricCard
          label="Trend Signal"
          value={latestTech?.trend_signal ?? "—"}
          tone={
            latestTech?.trend_signal === "Bullish"
              ? "bull"
              : latestTech?.trend_signal === "Bearish"
              ? "bear"
              : "gold"
          }
        />
        <MetricCard
          label="Volume Ratio"
          value={latestTech?.volume_ratio ? latestTech.volume_ratio.toFixed(2) : "—"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Price History (90d)</h2>
            <span className="text-xs text-slate-500">Close price · USD</span>
          </div>
          {chartData.length === 0 ? (
            <EmptyState message="No price history found for this ticker." />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e2738" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={["auto", "auto"]}
                  width={56}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d121c",
                    border: "1px solid #29324a",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#8b95a8" }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  fill="url(#priceFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">AI Recommendation</h2>
            <Link to="/ai-analyst" className="text-xs text-accent-400 hover:underline">
              Full analysis →
            </Link>
          </div>

          {aiScore?.error ? (
            <EmptyState message={aiScore.error} />
          ) : (
            <>
              <p className={`text-3xl font-bold mb-1 ${
                recommendationTone(aiScore?.recommendation) === "bull"
                  ? "text-bull-400"
                  : recommendationTone(aiScore?.recommendation) === "bear"
                  ? "text-bear-400"
                  : "text-gold-400"
              }`}>
                {aiScore?.recommendation ?? "—"}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                Score: <span className="stat-mono">{aiScore?.score ?? "N/A"}</span>/100
              </p>

              <div className="space-y-2">
                {(aiScore?.reasons || []).slice(0, 4).map((reason, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm bg-panel-800 rounded-lg p-3">
                    <span className="text-accent-400 mt-0.5">•</span>
                    <span className="text-slate-300">{reason}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
