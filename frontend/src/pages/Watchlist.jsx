import { useState } from "react";
import { useTicker } from "../context/TickerContext";
import { useApiData } from "../hooks/useApiData";
import { addToWatchlist, getWatchlist } from "../services/api";
import { ensureDemoUser } from "../utils/user";
import { LoadingState, ErrorState, EmptyState } from "../components/StateView";

export default function Watchlist() {
  const { ticker, setTicker } = useTicker();
  const [refreshKey, setRefreshKey] = useState(0);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { data, loading, error, refetch } = useApiData(
    async () => {
      const userId = await ensureDemoUser();
      return getWatchlist(userId);
    },
    [refreshKey]
  );

  async function handleAdd() {
    setAdding(true);
    setFeedback(null);
    try {
      const userId = await ensureDemoUser();
      await addToWatchlist(userId, ticker);
      setFeedback({ type: "ok", message: `${ticker} added to your watchlist.` });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Watchlist</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track tickers you care about across your saved tickers
          </p>
        </div>
        <button className="btn-primary" onClick={handleAdd} disabled={adding}>
          {adding ? "Adding..." : `+ Add ${ticker}`}
        </button>
      </div>

      {feedback && (
        <div
          className={`panel p-3.5 text-sm ${
            feedback.type === "ok" ? "text-bull-400 border-bull-500/30" : "text-bear-400 border-bear-500/30"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {loading ? (
        <LoadingState label="Loading your watchlist..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState message="Your watchlist is empty. Add a ticker to get started." />
      ) : (
        <section className="panel divide-y divide-border-800">
          {data.map((item, i) => (
            <button
              key={i}
              onClick={() => setTicker(item.ticker)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-panel-800/60 transition-colors"
            >
              <div>
                <p className="font-semibold stat-mono">{item.ticker}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Added {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
                </p>
              </div>
              <span className="text-xs text-accent-400">View →</span>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
