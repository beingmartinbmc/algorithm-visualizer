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

const LAND_MASSES = [
  {
    name: 'North America',
    path: 'M45 82C82 46 145 49 196 75C229 59 287 72 331 102C366 126 369 165 337 188C312 207 287 210 264 235C232 268 178 250 149 222C118 192 78 187 56 150C38 119 28 99 45 82Z',
    fill: '#14532d',
  },
  {
    name: 'Greenland',
    path: 'M285 42C332 20 390 35 404 75C388 111 325 119 286 92C267 78 265 55 285 42Z',
    fill: '#475569',
  },
  {
    name: 'Central America',
    path: 'M246 230C277 232 307 242 329 263C307 276 273 267 246 249C232 240 232 231 246 230Z',
    fill: '#166534',
  },
  {
    name: 'South America',
    path: 'M308 264C352 270 383 315 372 374C364 424 334 474 296 483C281 443 259 405 264 359C269 314 281 281 308 264Z',
    fill: '#15803d',
  },
  {
    name: 'Europe',
    path: 'M438 122C470 96 535 91 575 117C602 137 593 166 558 176C522 186 489 177 454 165C427 156 416 139 438 122Z',
    fill: '#0f766e',
  },
  {
    name: 'Africa',
    path: 'M498 202C553 184 612 223 627 283C640 336 608 409 552 425C514 397 484 340 482 283C480 244 482 216 498 202Z',
    fill: '#166534',
  },
  {
    name: 'Middle East',
    path: 'M572 188C615 178 657 196 674 226C648 245 603 239 580 217C568 206 565 194 572 188Z',
    fill: '#3f6212',
  },
  {
    name: 'Asia',
    path: 'M600 111C683 52 842 83 927 168C910 223 836 246 775 229C728 216 703 257 655 244C611 232 566 159 600 111Z',
    fill: '#164e63',
  },
  {
    name: 'Southeast Asia',
    path: 'M728 252C772 247 824 281 833 322C800 335 755 317 728 287C714 271 714 258 728 252Z',
    fill: '#0f766e',
  },
  {
    name: 'Australia',
    path: 'M794 350C850 316 932 335 949 394C897 437 813 426 774 381C760 365 771 354 794 350Z',
    fill: '#15803d',
  },
  {
    name: 'New Zealand',
    path: 'M958 420C979 425 987 448 970 461C951 456 941 432 958 420Z',
    fill: '#15803d',
  },
];

const COUNTRY_BORDERS = [
  'M186 78C184 128 197 172 230 214',
  'M126 172C171 164 216 173 260 190',
  'M231 237C262 244 292 252 323 263',
  'M303 280C329 305 342 335 335 374',
  'M336 312C350 304 362 304 376 318',
  'M451 140C482 132 515 134 548 149',
  'M496 171C501 144 518 124 545 111',
  'M529 196C540 236 540 277 530 321',
  'M565 223C594 250 611 286 617 329',
  'M591 190C613 203 639 212 671 221',
  'M638 130C675 145 713 153 754 153',
  'M690 184C729 192 768 201 808 216',
  'M757 238C759 278 770 303 807 320',
  'M835 153C841 191 832 219 808 236',
  'M831 365C861 384 892 394 928 396',
];

const MAP_LABELS = [
  { text: 'CANADA', x: 160, y: 118 },
  { text: 'UNITED STATES', x: 190, y: 178 },
  { text: 'MEXICO', x: 250, y: 222 },
  { text: 'BRAZIL', x: 338, y: 336 },
  { text: 'ARGENTINA', x: 315, y: 424 },
  { text: 'EUROPE', x: 507, y: 139 },
  { text: 'NORTH AFRICA', x: 548, y: 246 },
  { text: 'SOUTH AFRICA', x: 560, y: 390 },
  { text: 'MIDDLE EAST', x: 632, y: 210 },
  { text: 'INDIA', x: 710, y: 232 },
  { text: 'CHINA', x: 779, y: 173 },
  { text: 'JAPAN', x: 890, y: 161 },
  { text: 'SOUTHEAST ASIA', x: 770, y: 295 },
  { text: 'AUSTRALIA', x: 860, y: 390 },
];

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
        {[130, 260, 390].map((y) => (
          <path key={`lat-${y}`} d={`M0 ${y}H1000`} stroke="#38bdf8" strokeOpacity="0.1" strokeDasharray="7 10" />
        ))}
        {[125, 250, 375, 500, 625, 750, 875].map((x) => (
          <path key={`lon-${x}`} d={`M${x} 0V520`} stroke="#38bdf8" strokeOpacity="0.08" strokeDasharray="7 10" />
        ))}
        <path d="M0 260H1000" stroke="#67e8f9" strokeOpacity="0.2" strokeDasharray="8 9" />
        <path d="M500 0V520" stroke="#67e8f9" strokeOpacity="0.14" strokeDasharray="8 9" />

        <g filter="url(#world-shadow)">
          {LAND_MASSES.map((land) => (
            <path
              key={land.name}
              d={land.path}
              fill={land.fill}
              fillOpacity="0.78"
              stroke="#a7f3d0"
              strokeOpacity="0.42"
              strokeWidth="1.8"
            />
          ))}
        </g>

        <g>
          {COUNTRY_BORDERS.map((border) => (
            <path
              key={border}
              d={border}
              fill="none"
              stroke="#d1fae5"
              strokeOpacity="0.22"
              strokeWidth="1"
              strokeDasharray="4 5"
            />
          ))}
        </g>

        <g>
          {MAP_LABELS.map((label) => (
            <text
              key={label.text}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              letterSpacing="1.4"
              fill="#e2e8f0"
              fillOpacity="0.28"
            >
              {label.text}
            </text>
          ))}
        </g>

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
