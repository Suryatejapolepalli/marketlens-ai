import { lazy, Suspense, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { TickerProvider } from "./context/TickerContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { LoadingState } from "./components/StateView";
import { getUserId } from "./utils/user";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const AIAnalyst = lazy(() => import("./pages/AIAnalyst"));
const TechnicalAnalysis = lazy(() => import("./pages/TechnicalAnalysis"));
const Fundamentals = lazy(() => import("./pages/Fundamentals"));
const News = lazy(() => import("./pages/News"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Community = lazy(() => import("./pages/Community"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const NotFound = lazy(() => import("./pages/NotFound"));

const BARE_ROUTES = ["/login", "/signup"];

function RequireAuth({ children }) {
  const location = useLocation();
  if (!getUserId()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

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

function AppRoutes() {
  const location = useLocation();
  const isBare = BARE_ROUTES.includes(location.pathname);

  const routes = (
    <Suspense fallback={<LoadingState label="Loading page..." />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/ai-analyst"
          element={
            <RequireAuth>
              <AIAnalyst />
            </RequireAuth>
          }
        />
        <Route
          path="/technical"
          element={
            <RequireAuth>
              <TechnicalAnalysis />
            </RequireAuth>
          }
        />
        <Route
          path="/fundamentals"
          element={
            <RequireAuth>
              <Fundamentals />
            </RequireAuth>
          }
        />
        <Route
          path="/news"
          element={
            <RequireAuth>
              <News />
            </RequireAuth>
          }
        />
        <Route
          path="/watchlist"
          element={
            <RequireAuth>
              <Watchlist />
            </RequireAuth>
          }
        />
        <Route
          path="/community"
          element={
            <RequireAuth>
              <Community />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );

  return isBare ? routes : <Layout>{routes}</Layout>;
}

export default function App() {
  return (
    <TickerProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TickerProvider>
  );
}
