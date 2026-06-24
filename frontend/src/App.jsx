import { lazy, Suspense, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TickerProvider } from "./context/TickerContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { LoadingState } from "./components/StateView";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const AIAnalyst = lazy(() => import("./pages/AIAnalyst"));
const TechnicalAnalysis = lazy(() => import("./pages/TechnicalAnalysis"));
const Fundamentals = lazy(() => import("./pages/Fundamentals"));
const News = lazy(() => import("./pages/News"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Community = lazy(() => import("./pages/Community"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Layout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-950 text-slate-100">
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 min-w-0">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <TickerProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<LoadingState label="Loading page..." />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ai-analyst" element={<AIAnalyst />} />
              <Route path="/technical" element={<TechnicalAnalysis />} />
              <Route path="/fundamentals" element={<Fundamentals />} />
              <Route path="/news" element={<News />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/community" element={<Community />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </TickerProvider>
  );
}
