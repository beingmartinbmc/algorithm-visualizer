import { useCallback, useState, type ComponentType } from 'react';
import { Network, Database, Gamepad2, Waypoints, GitBranch, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { path: '/algorithms', label: 'Algorithms', icon: Waypoints },
  { path: '/data-structures', label: 'Data Structures', icon: Database },
  { path: '/games', label: 'Games', icon: Gamepad2 },
  { path: '/git', label: 'Git', icon: GitBranch },
];

const SECTION_PREFIXES = ['/games', '/algorithms', '/data-structures', '/git'] as const;

/** Compute whether a nav item is "active" given the current pathname. */
function isNavActive(itemPath: string, pathname: string): boolean {
  // Legacy paths (`/sorting`, `/traversals/*`) live under the Algorithms section.
  const legacyAlgorithmsActive =
    itemPath === '/algorithms' && (pathname.startsWith('/traversals') || pathname === '/sorting');
  const isSectionItem = (SECTION_PREFIXES as readonly string[]).includes(itemPath);
  return isSectionItem
    ? pathname.startsWith(itemPath) || legacyAlgorithmsActive
    : pathname === itemPath;
}

interface NavLinkProps {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
  variant: 'desktop' | 'mobile';
}

function NavLink({ item, active, onNavigate, variant }: NavLinkProps) {
  const { path, label, icon: Icon } = item;
  const layoutClasses =
    variant === 'desktop'
      ? 'gap-2 px-3 py-2'
      : 'gap-3 px-3 py-2.5';
  return (
    <Link
      to={path}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`
        flex items-center rounded-lg text-sm font-medium transition-all duration-200
        ${layoutClasses}
        ${active
          ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
        }
      `}
    >
      <Icon size={variant === 'desktop' ? 15 : 16} />
      {label}
    </Link>
  );
}

export default function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((p) => !p), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

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
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              item={item}
              active={isNavActive(item.path, location.pathname)}
              onNavigate={closeMenu}
              variant="desktop"
            />
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-slate-800/50 bg-slate-950/95 backdrop-blur-md px-4 pb-3 pt-2 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              item={item}
              active={isNavActive(item.path, location.pathname)}
              onNavigate={closeMenu}
              variant="mobile"
            />
          ))}
        </nav>
      )}
    </header>
  );
}
