import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import LandingPage from '@/pages/LandingPage';
import GraphTraversalPage from '@/features/graph-traversal/GraphTraversalPage';
import SortingPage from '@/features/sorting/SortingPage';
import SudokuPage from '@/features/sudoku-solver/SudokuPage';
import TreeTraversalPage from '@/features/tree-traversal/TreeTraversalPage';
import BalancedTreePage from '@/features/balanced-trees/BalancedTreePage';

function App() {
  return (
    <BrowserRouter basename="/algorithm-visualizer">
      <div className="flex h-screen flex-col text-white font-sans">
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/graph-traversal" element={<GraphTraversalPage />} />
          <Route path="/sorting" element={<SortingPage />} />
          <Route path="/sudoku-solver" element={<SudokuPage />} />
          <Route path="/tree-traversal" element={<TreeTraversalPage />} />
          <Route path="/balanced-trees" element={<BalancedTreePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
