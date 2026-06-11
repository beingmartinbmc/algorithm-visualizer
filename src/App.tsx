import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import ErrorBoundary from '@/components/ErrorBoundary';
import RouteFallback from '@/components/RouteFallback';

// Landing & section index pages stay eager — they're small and the most
// common navigation targets. Heavy feature pages are code-split below.
import LandingPage from '@/pages/LandingPage';
import AlgorithmsPage from '@/features/algorithms/AlgorithmsPage';
import TraversalsPage from '@/features/traversals/TraversalsPage';
import DataStructuresPage from '@/features/data-structures/DataStructuresPage';
import GamesPage from '@/features/games/GamesPage';

// Feature pages — lazy. Vite will produce a separate chunk per import.
const AlgorithmPlaygroundPage = lazy(() => import('@/features/algorithms/AlgorithmPlaygroundPage'));
const LinkedListAlgorithmsPage = lazy(() => import('@/features/algorithms/linked-list/LinkedListAlgorithmsPage'));
const LinkedListAlgoPage = lazy(() => import('@/features/algorithms/linked-list/LinkedListAlgoPage'));
const GraphTraversalPage = lazy(() => import('@/features/traversals/graph/GraphTraversalPage'));
const SortingPage = lazy(() => import('@/features/sorting/SortingPage'));
const SudokuPage = lazy(() => import('@/features/sudoku-solver/SudokuPage'));
const TreeTraversalPage = lazy(() => import('@/features/traversals/tree/TreeTraversalPage'));
const TriePage = lazy(() => import('@/features/traversals/trie/TriePage'));
const BalancedTreePage = lazy(() => import('@/features/data-structures/balanced-trees/BalancedTreePage'));
const StackPage = lazy(() => import('@/features/data-structures/stack/StackPage'));
const QueuePage = lazy(() => import('@/features/data-structures/queue/QueuePage'));
const ArrayPage = lazy(() => import('@/features/data-structures/array/ArrayPage'));
const LinkedListPage = lazy(() => import('@/features/data-structures/linked-list/LinkedListPage'));
const AdvancedStructurePage = lazy(() => import('@/features/data-structures/advanced/AdvancedStructurePage'));
const FibonacciGamePage = lazy(() => import('@/features/games/fibonacci/FibonacciGamePage'));
const DijkstraGamePage = lazy(() => import('@/features/games/dijkstra/DijkstraGamePage'));
const BattlePage = lazy(() => import('@/features/games/battles/BattlePage'));
const MahjongGamePage = lazy(() => import('@/features/games/mahjong/MahjongGamePage'));
const EvolutionSimulatorPage = lazy(() => import('@/features/games/evolution-simulator/EvolutionSimulatorPage'));
const RubiksCubeGamePage = lazy(() => import('@/features/games/rubiks-cube/RubiksCubeGamePage'));
const WorldMapGamePage = lazy(() => import('@/features/games/world-map/WorldMapGamePage'));
const GitPage = lazy(() => import('@/features/git/GitPage'));

function App() {
  return (
    <BrowserRouter basename="/algorithm-visualizer">
      <div className="flex h-screen flex-col text-white font-sans">
        <Header />
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/algorithms" element={<AlgorithmsPage />} />
              <Route path="/algorithms/sorting" element={<SortingPage />} />
              <Route path="/algorithms/tree" element={<TreeTraversalPage />} />
              <Route path="/algorithms/graph" element={<GraphTraversalPage />} />
              <Route path="/algorithms/binary-search" element={<AlgorithmPlaygroundPage demo="binary-search" />} />
              <Route path="/algorithms/ternary-search" element={<AlgorithmPlaygroundPage demo="ternary-search" />} />
              <Route path="/algorithms/queue-using-stacks" element={<AlgorithmPlaygroundPage demo="queue-using-stacks" />} />
              <Route path="/algorithms/stack-using-queues" element={<AlgorithmPlaygroundPage demo="stack-using-queues" />} />
              <Route path="/algorithms/tower-of-hanoi" element={<AlgorithmPlaygroundPage demo="tower-of-hanoi" />} />
              <Route path="/algorithms/rat-maze" element={<AlgorithmPlaygroundPage demo="rat-maze" />} />
              <Route path="/algorithms/grid-search" element={<AlgorithmPlaygroundPage demo="grid-search" />} />
              <Route path="/algorithms/dutch-national-flag" element={<AlgorithmPlaygroundPage demo="dutch-national-flag" />} />
              <Route path="/algorithms/top-k-frequent" element={<AlgorithmPlaygroundPage demo="top-k-frequent" />} />
              <Route path="/algorithms/linked-list" element={<LinkedListAlgorithmsPage />} />
              <Route path="/algorithms/linked-list/find-middle" element={<LinkedListAlgoPage problem="find-middle" />} />
              <Route path="/algorithms/linked-list/reverse-list" element={<LinkedListAlgoPage problem="reverse-list" />} />
              <Route path="/algorithms/linked-list/add-two-numbers" element={<LinkedListAlgoPage problem="add-two-numbers" />} />
              <Route path="/algorithms/linked-list/reverse-k-group" element={<LinkedListAlgoPage problem="reverse-k-group" />} />
              <Route path="/algorithms/linked-list/palindrome" element={<LinkedListAlgoPage problem="palindrome" />} />
              <Route path="/algorithms/linked-list/lru-cache" element={<LinkedListAlgoPage problem="lru-cache" />} />
              <Route path="/algorithms/linked-list/segregate" element={<LinkedListAlgoPage problem="segregate" />} />
              <Route path="/algorithms/linked-list/detect-cycle" element={<LinkedListAlgoPage problem="detect-cycle" />} />
              <Route path="/algorithms/linked-list/sort-list" element={<LinkedListAlgoPage problem="sort-list" />} />
              <Route path="/traversals" element={<TraversalsPage />} />
              <Route path="/traversals/graph" element={<GraphTraversalPage />} />
              <Route path="/traversals/tree" element={<TreeTraversalPage />} />
              <Route path="/traversals/trie" element={<TriePage />} />
              <Route path="/sorting" element={<SortingPage />} />
              <Route path="/games/sudoku-solver" element={<SudokuPage />} />
              <Route path="/data-structures" element={<DataStructuresPage />} />
              <Route path="/data-structures/balanced-trees" element={<BalancedTreePage />} />
              <Route path="/data-structures/stack" element={<StackPage />} />
              <Route path="/data-structures/queue" element={<QueuePage />} />
              <Route path="/data-structures/array" element={<ArrayPage />} />
              <Route path="/data-structures/linked-list" element={<LinkedListPage />} />
              <Route path="/data-structures/trie" element={<AdvancedStructurePage structure="trie" />} />
              <Route path="/data-structures/segment-tree" element={<AdvancedStructurePage structure="segment-tree" />} />
              <Route path="/data-structures/fenwick-tree" element={<AdvancedStructurePage structure="fenwick-tree" />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/games/fibonacci" element={<FibonacciGamePage />} />
              <Route path="/games/dijkstra" element={<DijkstraGamePage />} />
              <Route path="/games/battles" element={<BattlePage />} />
              <Route path="/games/mahjong" element={<MahjongGamePage />} />
              <Route path="/games/evolution-simulator" element={<EvolutionSimulatorPage />} />
              <Route path="/games/rubiks-cube" element={<RubiksCubeGamePage />} />
              <Route path="/games/world-map" element={<WorldMapGamePage />} />
              <Route path="/git" element={<GitPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}

export default App;
