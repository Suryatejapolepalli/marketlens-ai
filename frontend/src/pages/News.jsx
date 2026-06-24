import { useTicker } from "../context/TickerContext";
import { useApiData } from "../hooks/useApiData";
import { getNews } from "../services/api";
import { LoadingState, ErrorState, EmptyState } from "../components/StateView";

function formatTimestamp(value) {
  if (!value) return "";
  const ms = value > 1e12 ? value : value * 1000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function News() {
  const { ticker } = useTicker();
  const { data, loading, error, refetch } = useApiData(() => getNews(ticker), [ticker]);

  if (loading) return <LoadingState label={`Loading news for ${ticker}...`} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const articles = [...(data || [])].sort((a, b) => (b.datetime || 0) - (a.datetime || 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">News</h1>
        <p className="text-sm text-slate-500 mt-1">Latest headlines mentioning {ticker}</p>
      </div>

      {articles.length === 0 ? (
        <EmptyState message="No recent news articles found for this ticker." />
      ) : (
        <div className="space-y-3">
          {articles.map((a, i) => (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="panel panel-hover block p-5 hover:bg-panel-800/60"
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-medium text-accent-400 uppercase tracking-wide">
                  {a.source ?? "Unknown source"}
                </span>
                <span className="text-xs text-slate-500 shrink-0">{formatTimestamp(a.datetime)}</span>
              </div>
              <h3 className="font-semibold leading-snug mb-1.5">{a.headline}</h3>
              {a.summary && (
                <p className="text-sm text-slate-400 line-clamp-2">{a.summary}</p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
