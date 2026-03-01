import { Network, BarChart3, Grid3X3, TreePine, GitBranch, Gamepad2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/graph-traversal', label: 'Graph Traversal', icon: Network },
  { path: '/sorting', label: 'Sorting', icon: BarChart3 },
  { path: '/sudoku-solver', label: 'Sudoku Solver', icon: Grid3X3 },
  { path: '/tree-traversal', label: 'Tree Traversal', icon: TreePine },
  { path: '/balanced-trees', label: 'BST / AVL / RB', icon: GitBranch },
  { path: '/games', label: 'Games', icon: Gamepad2 },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="flex items-center justify-between border-b border-slate-800/50 px-6 py-3">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20">
            <Network size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">Algorithm Visualizer</h1>
        </Link>
        <nav className="flex items-center gap-1 ml-4">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = path === '/games'
              ? location.pathname.startsWith('/games')
              : location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                  }
                `}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
