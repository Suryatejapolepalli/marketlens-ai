import { useState } from "react";
import { useTicker } from "../context/TickerContext";

export default function Header({ onMenuClick }) {
  const { ticker, setTicker } = useTicker();
  const [input, setInput] = useState(ticker);
  const [tickerError, setTickerError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const clean = input.trim().toUpperCase();
    if (!/^[A-Z]{1,6}$/.test(clean)) {
      setTickerError("Enter 1-6 letters, e.g. AAPL");
      return;
    }
    setTickerError(null);
    setTicker(clean);
  }

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border-800 bg-bg-900/95 backdrop-blur px-4 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="lg:hidden -ml-1 p-1.5 rounded-lg hover:bg-panel-800 text-slate-300"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-accent-500 flex items-center justify-center font-bold text-white text-sm">
            M
          </div>
          <span className="font-bold text-sm">MarketLens</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-start gap-2 flex-1 max-w-md">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-[11px] w-4 h-4 text-slate-500"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value.toUpperCase());
              setTickerError(null);
            }}
            placeholder="Search ticker (e.g. AAPL)"
            className="input-base w-full pl-9 font-mono uppercase"
            maxLength={8}
          />
          {tickerError && (
            <p className="absolute top-full mt-1 text-xs text-bear-400">{tickerError}</p>
          )}
        </div>
        <button type="submit" className="btn-primary whitespace-nowrap">
          Analyze
        </button>
      </form>

      <div className="hidden sm:flex items-center gap-3">
        <span className="badge badge-bull">
          <span className="w-1.5 h-1.5 rounded-full bg-bull-400" />
          Market Open
        </span>
        <span className="stat-mono text-sm text-slate-400">{ticker}</span>
      </div>
    </header>
  );
}
