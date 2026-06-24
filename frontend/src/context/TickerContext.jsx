import { createContext, useContext, useMemo, useState } from "react";

const TickerContext = createContext(null);

const DEFAULT_TICKER = "AAPL";

export function TickerProvider({ children }) {
  const [ticker, setTickerState] = useState(
    () => localStorage.getItem("marketlens_ticker") || DEFAULT_TICKER
  );

  function setTicker(next) {
    const clean = next.trim().toUpperCase();
    if (!clean) return;
    setTickerState(clean);
    localStorage.setItem("marketlens_ticker", clean);
  }

  const value = useMemo(() => ({ ticker, setTicker }), [ticker]);

  return (
    <TickerContext.Provider value={value}>{children}</TickerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTicker() {
  const ctx = useContext(TickerContext);
  if (!ctx) throw new Error("useTicker must be used within TickerProvider");
  return ctx;
}
