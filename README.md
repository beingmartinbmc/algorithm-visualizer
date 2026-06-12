# Algorithm Visualizer

An interactive, browser-based playground for learning algorithms, data structures, and Git through animation. Every algorithm runs in the browser as pure TypeScript — no backend, no telemetry, no tracking.

**Live demo:** https://beingmartinbmc.github.io/algorithm-visualizer/

---

## What's inside

- **Sorting** — bubble, selection, insertion, quick, heap, merge with step-by-step bar animation and audio.
- **Graph traversals** — BFS, DFS, Dijkstra, A* on an interactive grid; draw walls, place start/end, generate mazes.
- **Tree traversals** — in/pre/post/level-order on a randomized binary tree.
- **Trie** — word and prefix search with character-by-character traversal.
- **Data structures** — Stack, Queue, Array, Linked List, BST/AVL/Red-Black trees, Trie, Segment Tree, Fenwick Tree.
- **Algorithm playground** — binary/ternary search, Tower of Hanoi, rat-in-a-maze, Dutch national flag, Top-K, queue-via-stacks, stack-via-queues, grid search.
- **Games**
  - Fibonacci Spiral Builder
  - Dijkstra Delivery Simulator
  - World Map Flight Planner (Dijkstra, A*, BFS, greedy)
  - Algorithm Battles (head-to-head sort & pathfind races)
  - Sudoku Solver (4×4 / 9×9 / 16×16, with uniqueness-checked puzzles)
  - Mahjong Hand Solver (backtracking)
  - Evolution Simulator (genetic algorithm)
  - Rubik's Cube Solver
- **Git Visualizer** — a 1.7k-LOC pure-TS Git simulator with terminal, commit-DAG canvas, freeplay mode, and guided lessons (init/add/commit, branching, merging, rebase, reset, stash, cherry-pick, remotes, push/pull, etc.).

## Quick start

Requires Node 22+.

```bash
npm install
npm run dev            # Vite dev server with HMR
npm run lint           # ESLint (strict; CI blocks on errors)
npm test               # run the Vitest suite once
npm run test:watch     # Vitest in watch mode
npm run test:coverage  # run tests with v8 coverage report
npm run build          # tsc + vite build → docs/ for GitHub Pages
npm run preview        # serve the production build locally
```

## Architecture

The codebase follows a strict feature-folder pattern. Every visualization lives in `src/features/<feature>/` and is composed of:

```
features/<feature>/
├── <Feature>Page.tsx          # thin composition: <Canvas /> + <Controls />
├── components/                # presentational React components
├── hooks/use<Feature>.ts      # state machine + step playback
├── algorithms/ (or engine/)   # pure, framework-free TS — the actual algorithm
└── types/<feature>.ts         # shared types and constants
```

The pure-TS layer (`algorithms/` or `engine/`) returns arrays of `Step` objects (step descriptions + visualization payloads). The hook drives forward/backward/auto-play through that array. The components render whatever the current step says. This:

- keeps algorithm code unit-testable and reusable across features (e.g. `games/battles` reuses `traversals/graph/algorithms` directly),
- makes step-back / scrubbing / replay free,
- separates "what the algorithm does" from "how it animates."

### Adding a new visualization

1. Create `src/features/myThing/`.
2. Write `algorithms/myThing.ts` — a pure function from input → `MyThingStep[]`.
3. Write `hooks/useMyThing.ts` — `useState` for the step pointer, `setTimeout` (or the shared `useSound` hook) for playback.
4. Write `components/MyThingCanvas.tsx` and `MyThingControls.tsx`.
5. Add a `MyThingPage.tsx` that composes the above.
6. Lazy-import the page in `src/App.tsx` and add a `<Route>`.

### Cross-cutting helpers

- `src/lib/MinHeap.ts` — generic binary heap. Used by Dijkstra and A*.
- `src/lib/audioContext.ts` — single shared, lazy `AudioContext` with autoplay-policy and Safari-interrupted-state handling.
- `src/components/ErrorBoundary.tsx` — wraps the route tree; one crashing visualization can't blank the app.
- `src/components/RouteFallback.tsx` — Suspense fallback for lazy-loaded routes.

## Tech stack

| Area       | Choice                                      |
|------------|---------------------------------------------|
| Build      | Vite 7, React 19, TypeScript 5 (strict)     |
| Styling    | Tailwind CSS v4 (`@tailwindcss/vite`)       |
| Routing    | `react-router-dom` v7 with code-split routes |
| Icons      | `lucide-react`                              |
| Audio      | Web Audio API (single shared `AudioContext`) |
| Lint       | ESLint flat config + `typescript-eslint` + `react-hooks` |

## Deploy

Production build outputs to `docs/`, ready for GitHub Pages:

```bash
npm run build
# docs/index.html, docs/assets/*, docs/.nojekyll, docs/404.html
```

`docs/404.html` is a copy of `index.html` so GitHub Pages serves the SPA on deep links (the `BrowserRouter` `basename="/algorithm-visualizer"` matches the repo name). `.nojekyll` disables Jekyll processing of underscore-prefixed assets.

## Project status

- **TypeScript:** `tsc -b` passes with zero errors. Strict mode, `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`.
- **ESLint:** zero errors, zero warnings.
- **Tests:** Vitest suite covering the pure step-builders in `algorithms/` (sorting, graph pathfinding, tree traversals, tree generation, linked-list algorithms, random-input helpers). CI runs `vitest run --coverage` and blocks merges below an 85% coverage gate.
- **Bundle:** initial route loads only landing-page + section-index chunks; feature pages are code-split.

## License

MIT.
