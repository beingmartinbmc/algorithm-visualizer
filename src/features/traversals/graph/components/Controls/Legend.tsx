const legendItems = [
  { label: 'Start', color: 'bg-emerald-500' },
  { label: 'End', color: 'bg-rose-500' },
  { label: 'Wall', color: 'bg-slate-300' },
  { label: 'Visited', color: 'bg-indigo-500/70' },
  { label: 'Path', color: 'bg-amber-400' },
  { label: 'Empty', color: 'bg-slate-900/40 ring-1 ring-slate-700' },
];

export default function Legend() {
  return (
    <div className="flex items-center justify-center gap-6 py-3">
      {legendItems.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`h-4 w-4 rounded-sm ${color}`} />
          <span className="text-xs text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  );
}
