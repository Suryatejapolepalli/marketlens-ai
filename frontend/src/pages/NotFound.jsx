import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <p className="text-6xl font-bold text-slate-700 stat-mono mb-3">404</p>
      <h1 className="text-xl font-semibold mb-2">Page not found</h1>
      <p className="text-sm text-slate-500 mb-6">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/" className="btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
}
