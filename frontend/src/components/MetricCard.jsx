const TONE_CLASSES = {
  default: "text-slate-100",
  bull: "text-bull-400",
  bear: "text-bear-400",
  gold: "text-gold-400",
  accent: "text-accent-400",
};

export default function MetricCard({ label, value, sub, tone = "default", icon }) {
  return (
    <div className="panel panel-hover p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        {icon}
      </div>
      <p className={`stat-mono text-2xl font-bold ${TONE_CLASSES[tone]}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-1.5">{sub}</p>}
    </div>
  );
}
