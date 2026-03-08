import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import LandingPage from '@/pages/LandingPage';
import GraphTraversalPage from '@/features/traversals/graph/GraphTraversalPage';
import SortingPage from '@/features/sorting/SortingPage';
import SudokuPage from '@/features/sudoku-solver/SudokuPage';
import TreeTraversalPage from '@/features/traversals/tree/TreeTraversalPage';
import TraversalsPage from '@/features/traversals/TraversalsPage';
import TriePage from '@/features/traversals/trie/TriePage';
import BalancedTreePage from '@/features/data-structures/balanced-trees/BalancedTreePage';
import StackPage from '@/features/data-structures/stack/StackPage';
import QueuePage from '@/features/data-structures/queue/QueuePage';
import ArrayPage from '@/features/data-structures/array/ArrayPage';
import LinkedListPage from '@/features/data-structures/linked-list/LinkedListPage';
import DataStructuresPage from '@/features/data-structures/DataStructuresPage';
import GamesPage from '@/features/games/GamesPage';
import FibonacciGamePage from '@/features/games/fibonacci/FibonacciGamePage';
import DijkstraGamePage from '@/features/games/dijkstra/DijkstraGamePage';
import BattlePage from '@/features/games/battles/BattlePage';
import MahjongGamePage from '@/features/games/mahjong/MahjongGamePage';
import EvolutionSimulatorPage from '@/features/games/evolution-simulator/EvolutionSimulatorPage';

function App() {
  return (
    <BrowserRouter basename="/algorithm-visualizer">
      <div className="flex h-screen flex-col text-white font-sans">
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/fibonacci" element={<FibonacciGamePage />} />
          <Route path="/games/dijkstra" element={<DijkstraGamePage />} />
          <Route path="/games/battles" element={<BattlePage />} />
          <Route path="/games/mahjong" element={<MahjongGamePage />} />
          <Route path="/games/evolution-simulator" element={<EvolutionSimulatorPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
