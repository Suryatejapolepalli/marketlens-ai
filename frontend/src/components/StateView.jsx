export function LoadingState({ label = "Loading data..." }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label={label}>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="w-3 h-3 rounded-full border-2 border-slate-700 border-t-accent-500 animate-spin" />
        {label}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="panel p-5 space-y-3">
            <div className="skeleton h-3 w-2/3" />
            <div className="skeleton h-6 w-1/2" />
          </div>
        ))}
      </div>

      <div className="panel p-6 space-y-4">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-64 w-full" />
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="panel border-bear-500/30 bg-bear-500/5 p-6 text-center">
      <p className="text-bear-400 font-semibold mb-1">Couldn't load data</p>
      <p className="text-sm text-slate-400 mb-4">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-primary">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = "No data available yet." }) {
  return (
    <div className="panel p-10 text-center text-slate-500 text-sm">
      {message}
    </div>
  );
}
