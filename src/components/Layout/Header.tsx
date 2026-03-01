import { useState, useCallback, useEffect } from 'react';
import { Network, BarChart3, Grid3X3, GitBranch, Gamepad2, Waypoints, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/traversals', label: 'Traversals', icon: Waypoints },
  { path: '/sorting', label: 'Sorting', icon: BarChart3 },
  { path: '/sudoku-solver', label: 'Sudoku Solver', icon: Grid3X3 },
  { path: '/balanced-trees', label: 'BST / AVL / RB', icon: GitBranch },
  { path: '/games', label: 'Games', icon: Gamepad2 },
];

export default function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((p) => !p), []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="relative border-b border-slate-800/50">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20">
            <Network size={16} className="text-white sm:hidden" />
            <Network size={18} className="text-white hidden sm:block" />
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">Algorithm Visualizer</h1>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = path === '/games' || path === '/traversals'
              ? location.pathname.startsWith(path)
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

        {/* Mobile hamburger */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-slate-800/50 bg-slate-950/95 backdrop-blur-md px-4 pb-3 pt-2 flex flex-col gap-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = path === '/games' || path === '/traversals'
              ? location.pathname.startsWith(path)
              : location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                  }
                `}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
