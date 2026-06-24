import { useState } from "react";
import { useTicker } from "../context/TickerContext";
import { useApiData } from "../hooks/useApiData";
import { addComment, getComments } from "../services/api";
import { ensureDemoUser, getLocalDisplayName, setLocalDisplayName } from "../utils/user";
import { LoadingState, ErrorState, EmptyState } from "../components/StateView";

function timeAgo(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Community() {
  const { ticker } = useTicker();
  const [displayName, setDisplayName] = useState(getLocalDisplayName());
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const { data, loading, error, refetch } = useApiData(
    () => getComments(ticker),
    [ticker, refreshKey]
  );

  async function handlePost(e) {
    e.preventDefault();
    if (!comment.trim()) return;

    setPosting(true);
    setFeedback(null);
    try {
      setLocalDisplayName(displayName.trim() || "Guest Trader");
      const userId = await ensureDemoUser();
      await addComment(userId, ticker, comment.trim());
      setComment("");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setFeedback({ message: err.message });
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Community</h1>
        <p className="text-sm text-slate-500 mt-1">Discussion thread for {ticker}</p>
      </div>

      <form onSubmit={handlePost} className="panel p-5 space-y-3">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your display name"
          className="input-base w-full sm:w-64"
          maxLength={40}
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`Share your take on ${ticker}...`}
          className="input-base w-full min-h-24 resize-none"
          maxLength={500}
        />
        {feedback && <p className="text-sm text-bear-400">{feedback.message}</p>}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={posting || !comment.trim()}>
            {posting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingState label="Loading comments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState message="No comments yet. Be the first to share your take." />
      ) : (
        <div className="space-y-3">
          {data.map((c) => (
            <div key={c.comment_id} className="panel p-4 flex gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-500/15 text-accent-400 flex items-center justify-center font-semibold text-xs shrink-0">
                {initials(c.name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{c.name ?? "Anonymous"}</span>
                  <span className="text-xs text-slate-500">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-slate-300 break-words">{c.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
