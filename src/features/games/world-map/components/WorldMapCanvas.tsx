import { useMemo } from 'react';
import type { Airport, AlgorithmStep, FlightPlan, FlightProgress, FlightRoute } from '../types/worldMap';

interface Props {
  airports: Airport[];
  routes: FlightRoute[];
  source: string;
  destination: string;
  currentStep: AlgorithmStep | null;
  plan: FlightPlan;
  flightProgress: FlightProgress | null;
  onSelectSource: (code: string) => void;
  onSelectDestination: (code: string) => void;
}

export default function WorldMapCanvas({
  airports,
  routes,
  source,
  destination,
  currentStep,
  plan,
  flightProgress,
  onSelectSource,
  onSelectDestination,
}: Props) {
  const airportMap = useMemo(() => new Map(airports.map((airport) => [airport.code, airport])), [airports]);
  const visited = new Set(currentStep?.visited ?? []);
  const frontier = new Set((currentStep?.frontier ?? []).map((item) => item.code));
  const activePath = currentStep?.route?.length ? currentStep.route : plan.path;
  const activeEdges = new Set(activePath.slice(0, -1).map((code, index) => [code, activePath[index + 1]].sort().join('-')));
  const relaxedKey = currentStep?.relaxedRoute ? [currentStep.relaxedRoute.from, currentStep.relaxedRoute.to].sort().join('-') : null;

  const planePosition = useMemo(() => {
    if (!flightProgress) return null;
    const from = airportMap.get(flightProgress.from);
    const to = airportMap.get(flightProgress.to);
    if (!from || !to) return null;
    const arcLift = Math.sin(flightProgress.progress * Math.PI) * -44;
    return {
      x: from.x + (to.x - from.x) * flightProgress.progress,
      y: from.y + (to.y - from.y) * flightProgress.progress + arcLift,
      angle: Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI),
    };
  }, [airportMap, flightProgress]);

  return (
    <div className="relative min-h-[620px] flex-1 overflow-hidden rounded-[1.75rem] border border-slate-700/50 bg-slate-950/90 shadow-2xl shadow-black/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_78%_72%,rgba(59,130,246,0.12),transparent_30%)]" />

      <div className="absolute left-5 top-5 z-20 rounded-2xl border border-slate-700/60 bg-slate-950/85 p-4 shadow-xl shadow-black/30 backdrop-blur-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-400">Global Air Traffic Network</p>
        <div className="mt-2 flex gap-4 text-xs text-slate-300">
          <span><strong className="font-mono text-white">{airports.length}</strong> airports</span>
          <span><strong className="font-mono text-white">{routes.length}</strong> routes</span>
          <span><strong className="font-mono text-white">{plan.path.length || 0}</strong> hops</span>
        </div>
      </div>

      {currentStep && (
        <div className="absolute bottom-5 left-5 z-20 max-w-md rounded-2xl border border-slate-700/60 bg-slate-950/90 p-4 shadow-xl shadow-black/35 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">Algorithm Radar</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">{currentStep.description}</p>
          {currentStep.frontier.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {currentStep.frontier.slice(0, 7).map((item) => (
                <span key={`${item.code}-${item.priority}`} className="rounded-full bg-sky-500/10 px-2 py-1 text-[10px] font-mono font-semibold text-sky-300 ring-1 ring-sky-500/25">
                  {item.code}: {Number.isFinite(item.priority) ? item.priority : '∞'}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <svg viewBox="0 0 1000 520" className="relative z-10 h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="world-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="world-shadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#020617" floodOpacity="0.7" />
          </filter>
          <linearGradient id="ocean" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#07111f" />
            <stop offset="55%" stopColor="#082f49" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>

        <rect width="1000" height="520" rx="28" fill="url(#ocean)" />
        <path d="M108 168C126 98 204 70 280 116C324 142 294 202 350 228C310 274 242 268 186 250C132 232 86 226 108 168Z" fill="#0f5132" opacity="0.62" />
        <path d="M230 270C300 262 342 310 318 376C292 450 220 470 190 400C170 354 174 286 230 270Z" fill="#14532d" opacity="0.52" />
        <path d="M442 138C500 88 596 88 644 146C686 198 628 236 570 226C506 216 452 204 442 138Z" fill="#134e4a" opacity="0.62" />
        <path d="M510 230C596 210 662 264 650 340C636 428 548 432 512 366C486 318 468 250 510 230Z" fill="#166534" opacity="0.48" />
        <path d="M638 132C722 68 852 102 900 174C812 200 784 262 704 244C646 232 604 186 638 132Z" fill="#164e63" opacity="0.62" />
        <path d="M790 342C846 310 924 332 934 390C876 432 810 420 774 378Z" fill="#166534" opacity="0.5" />
        <path d="M0 260H1000" stroke="#38bdf8" strokeOpacity="0.12" strokeDasharray="7 10" />
        <path d="M500 0V520" stroke="#38bdf8" strokeOpacity="0.1" strokeDasharray="7 10" />

        {routes.map((route) => {
          const a = airportMap.get(route.source);
          const b = airportMap.get(route.destination);
          if (!a || !b) return null;
          const key = [route.source, route.destination].sort().join('-');
          const isActive = activeEdges.has(key);
          const isRelaxed = key === relaxedKey;
          const color = isRelaxed ? '#facc15' : isActive ? '#22c55e' : '#334155';
          const lift = Math.min(120, Math.abs(a.x - b.x) * 0.12 + 28);
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2 - lift;
          return (
            <g key={route.id}>
              <path
                d={`M${a.x},${a.y} Q${midX},${midY} ${b.x},${b.y}`}
                fill="none"
                stroke={color}
                strokeWidth={isActive || isRelaxed ? 3 : 1.2}
                strokeOpacity={isActive || isRelaxed ? 0.92 : 0.24}
                strokeDasharray={isActive ? undefined : '5 8'}
                filter={isActive || isRelaxed ? 'url(#world-glow)' : undefined}
              />
            </g>
          );
        })}

        {airports.map((airport) => {
          const isSource = airport.code === source;
          const isDestination = airport.code === destination;
          const isVisited = visited.has(airport.code);
          const isFrontier = frontier.has(airport.code);
          const isCurrent = currentStep?.airportCode === airport.code;
          const showLabel = isSource || isDestination || isCurrent || isFrontier || isVisited || airport.hubScore >= 92;
          const fill = isSource ? '#fde047' : isDestination ? '#fb923c' : isCurrent ? '#38bdf8' : isVisited ? '#22c55e' : isFrontier ? '#a78bfa' : '#94a3b8';
          return (
            <g key={airport.code} className="cursor-pointer">
              <title>{airport.code} - {airport.city}, {airport.country}</title>
              <circle cx={airport.x} cy={airport.y} r={isSource || isDestination ? 12 : 8} fill="#020617" stroke="#0f172a" strokeWidth={7} filter="url(#world-shadow)" />
              <circle
                cx={airport.x}
                cy={airport.y}
                r={isSource || isDestination ? 9 : 6}
                fill={fill}
                fillOpacity={isSource || isDestination || isVisited || isFrontier || isCurrent ? 0.96 : 0.58}
                stroke={fill}
                strokeWidth={isCurrent ? 4 : 2}
                onClick={(event) => {
                  if (event.shiftKey) onSelectDestination(airport.code);
                  else onSelectSource(airport.code);
                }}
              />
              {showLabel && (
                <text x={airport.x} y={airport.y - 14} textAnchor="middle" fontSize="10" fontWeight="800" fontFamily="ui-monospace, monospace" fill={fill}>
                  {airport.code}
                </text>
              )}
            </g>
          );
        })}

        {planePosition && (
          <g transform={`translate(${planePosition.x} ${planePosition.y}) rotate(${planePosition.angle})`} filter="url(#world-glow)">
            <path d="M-14 -5L18 0L-14 5L-8 0Z" fill="#f8fafc" stroke="#38bdf8" strokeWidth="1.2" />
            <path d="M-5 -3L-12 -13L2 -4Z" fill="#bae6fd" opacity="0.9" />
            <path d="M-5 3L-12 13L2 4Z" fill="#bae6fd" opacity="0.9" />
          </g>
        )}
      </svg>

      <div className="absolute bottom-5 right-5 z-20 hidden rounded-2xl border border-slate-700/60 bg-slate-950/85 p-4 text-[10px] text-slate-400 shadow-xl shadow-black/30 backdrop-blur-sm sm:block">
        <div className="mb-2 font-semibold uppercase tracking-[0.24em] text-slate-500">Tip</div>
        Click an airport to set origin. Shift-click to set destination.
      </div>
    </div>
  );
}
