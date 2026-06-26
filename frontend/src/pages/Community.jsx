import { useEffect, useState } from "react";
import { useTicker } from "../context/TickerContext";
import { useApiData } from "../hooks/useApiData";
import { addComment, getComments, searchUsers, getFriends, addFriend } from "../services/api";
import { getUserId, getLocalDisplayName, setLocalDisplayName } from "../utils/user";
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

function FriendsPanel() {
  const userId = getUserId();
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getFriends(userId);
        if (!cancelled) setFriends(list);
      } catch (err) {
        if (!cancelled) setFeedback({ message: err.message });
      } finally {
        if (!cancelled) setLoadingFriends(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setFeedback(null);
    try {
      const list = await searchUsers(query.trim());
      const friendIds = new Set(friends.map((f) => f.user_id));
      setResults(list.filter((u) => u.user_id !== userId && !friendIds.has(u.user_id)));
    } catch (err) {
      setFeedback({ message: err.message });
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(friend) {
    setFeedback(null);
    try {
      await addFriend(userId, friend.user_id);
      setResults((r) => r.filter((u) => u.user_id !== friend.user_id));
      setFriends((f) => [...f, friend]);
    } catch (err) {
      setFeedback({ message: err.message });
    }
  }

  return (
    <section className="panel p-5 space-y-4">
      <h2 className="font-semibold">Friends</h2>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="input-base flex-1"
        />
        <button
          type="submit"
          className="btn-primary shrink-0"
          disabled={searching || !query.trim()}
        >
          {searching ? "..." : "Search"}
        </button>
      </form>

      {feedback && <p className="text-sm text-bear-400">{feedback.message}</p>}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((u) => (
            <div
              key={u.user_id}
              className="flex items-center justify-between bg-panel-800 rounded-lg p-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{u.name}</p>
                <p className="text-xs text-slate-500 truncate">{u.email}</p>
              </div>
              <button
                type="button"
                onClick={() => handleAdd(u)}
                className="text-xs font-medium text-accent-400 hover:text-accent-300 shrink-0 ml-2"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
          Your friends {friends.length > 0 && `(${friends.length})`}
        </p>
        {loadingFriends ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : friends.length === 0 ? (
          <p className="text-sm text-slate-500">No friends yet. Search above to connect.</p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f.user_id} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-accent-500/15 text-accent-400 flex items-center justify-center font-semibold text-[10px] shrink-0">
                  {initials(f.name)}
                </div>
                <p className="text-sm truncate">{f.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
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
      await addComment(getUserId(), ticker, comment.trim());
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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

        <FriendsPanel />
      </div>
    </div>
  );
}
