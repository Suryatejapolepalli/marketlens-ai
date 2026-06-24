import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTicker } from "../context/TickerContext";
import { useApiData } from "../hooks/useApiData";
import { getTechnicalIndicators } from "../services/api";
import { LoadingState, ErrorState, EmptyState } from "../components/StateView";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function trendBadge(signal) {
  if (signal === "Bullish") return "badge-bull";
  if (signal === "Bearish") return "badge-bear";
  return "badge-neutral";
}

export default function TechnicalAnalysis() {
  const { ticker } = useTicker();
  const { data, loading, error, refetch } = useApiData(() => getTechnicalIndicators(ticker), [ticker]);

  if (loading) return <LoadingState label={`Loading indicators for ${ticker}...`} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data || data.length === 0) return <EmptyState message="No technical indicator data found." />;

  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chartData = sorted.slice(-90).map((r) => ({
    date: formatDate(r.date),
    close: r.close,
    sma_20: r.sma_20,
    sma_50: r.sma_50,
  }));
  const recent = [...sorted].reverse().slice(0, 15);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Technical Analysis</h1>
        <p className="text-sm text-slate-500 mt-1">
          Moving averages, volatility and trend signal for {ticker}
        </p>
      </div>

      <section className="panel p-6">
        <h2 className="font-semibold mb-4">Price vs Moving Averages</h2>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#1e2738" vertical={false} />
            <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
            <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} domain={["auto", "auto"]} width={56} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0d121c", border: "1px solid #29324a", borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: "#8b95a8" }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#8b95a8" }} />
            <Line type="monotone" dataKey="close" name="Close" stroke="#60a5fa" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="sma_20" name="SMA 20" stroke="#fbbf24" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="sma_50" name="SMA 50" stroke="#a78bfa" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="panel p-6 overflow-x-auto">
        <h2 className="font-semibold mb-4">Recent Indicator Snapshots</h2>
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-slate-500 text-xs uppercase border-b border-border-800">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Close</th>
              <th className="py-2 pr-4">SMA 20</th>
              <th className="py-2 pr-4">SMA 50</th>
              <th className="py-2 pr-4">Volatility 20d</th>
              <th className="py-2 pr-4">Volume Ratio</th>
              <th className="py-2 pr-4">Trend</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r, i) => (
              <tr key={i} className="border-b border-border-800/60 last:border-0">
                <td className="py-2.5 pr-4 text-slate-400">{formatDate(r.date)}</td>
                <td className="py-2.5 pr-4 stat-mono">${r.close?.toFixed(2)}</td>
                <td className="py-2.5 pr-4 stat-mono text-slate-400">
                  {r.sma_20 ? `$${r.sma_20.toFixed(2)}` : "—"}
                </td>
                <td className="py-2.5 pr-4 stat-mono text-slate-400">
                  {r.sma_50 ? `$${r.sma_50.toFixed(2)}` : "—"}
                </td>
                <td className="py-2.5 pr-4 stat-mono text-slate-400">
                  {r.volatility_20 != null ? r.volatility_20.toFixed(4) : "—"}
                </td>
                <td className="py-2.5 pr-4 stat-mono text-slate-400">
                  {r.volume_ratio != null ? r.volume_ratio.toFixed(2) : "—"}
                </td>
                <td className="py-2.5 pr-4">
                  <span className={`badge ${trendBadge(r.trend_signal)}`}>{r.trend_signal}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
