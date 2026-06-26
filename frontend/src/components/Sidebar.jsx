import { NavLink, useNavigate } from "react-router-dom";
import { clearSession, getLocalDisplayName } from "../utils/user";

const ICONS = {
  dashboard: (
    <path d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18v6h8V3h-8z" />
  ),
  ai: (
    <path d="M12 2a1 1 0 0 1 1 1v1.06A8 8 0 0 1 19.94 11H21a1 1 0 1 1 0 2h-1.06A8 8 0 0 1 13 19.94V21a1 1 0 1 1-2 0v-1.06A8 8 0 0 1 4.06 13H3a1 1 0 1 1 0-2h1.06A8 8 0 0 1 11 4.06V3a1 1 0 0 1 1-1zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
  ),
  technical: (
    <path d="M3 17l5-5 4 4 8-9v4l-8 9-4-4-5 5z" />
  ),
  fundamentals: (
    <path d="M4 4h16v2H4V4zm2 4h2v12H6V8zm5 4h2v8h-2v-8zm5-6h2v14h-2V6z" />
  ),
  news: (
    <path d="M4 4h13a2 2 0 0 1 2 2v13a1 1 0 0 0 1-1V8h1v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1zm2 4h9v2H6V8zm0 4h9v2H6v-2zm0 4h6v2H6v-2z" />
  ),
  watchlist: (
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  ),
  community: (
    <path d="M16 11a3 3 0 1 0-2.83-4H10.8A3 3 0 1 0 8 11a3 3 0 0 0 1.17-.24c.31.34.6.71.83 1.12A6.97 6.97 0 0 0 8 17v2h2v-2a5 5 0 0 1 10 0v2h2v-2a7 7 0 0 0-4-6.32c.18-.36.31-.75.36-1.16A3 3 0 0 0 16 11z" />
  ),
};

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/ai-analyst", label: "AI Analyst", icon: "ai" },
  { to: "/technical", label: "Technical Analysis", icon: "technical" },
  { to: "/fundamentals", label: "Fundamentals", icon: "fundamentals" },
  { to: "/news", label: "News", icon: "news" },
  { to: "/watchlist", label: "Watchlist", icon: "watchlist" },
  { to: "/community", label: "Community", icon: "community" },
];

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    if (onNavigate) onNavigate();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border-800">
        <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center font-bold text-white">
          M
        </div>
        <div>
          <p className="font-bold text-sm leading-none">MarketLens AI</p>
          <p className="text-[11px] text-slate-500 leading-none mt-1">
            Stock Research Terminal
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4.5 h-4.5 shrink-0"
              width="18"
              height="18"
            >
              {ICONS[item.icon]}
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-border-800 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-slate-500">Signed in as</p>
          <p className="text-sm font-medium truncate">{getLocalDisplayName()}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs font-medium text-slate-500 hover:text-bear-400 transition shrink-0"
        >
          Log out
        </button>
      </div>

      <div className="px-4 py-4 border-t border-border-800">
        <div className="panel px-3 py-3">
          <p className="text-[11px] text-slate-500">Data Source</p>
          <p className="text-xs font-medium mt-0.5">BigQuery · yfinance</p>
        </div>
      </div>
    </>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border-800 bg-bg-900 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="absolute left-0 top-0 h-full w-72 flex flex-col bg-bg-900 border-r border-border-800 shadow-2xl animate-[slideIn_0.2s_ease-out]">
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
