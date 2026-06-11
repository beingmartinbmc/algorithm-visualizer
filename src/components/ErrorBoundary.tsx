import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time errors anywhere in the route tree so a single broken
 * page doesn't blank the whole app. The reset button clears the error state;
 * if the error is environmental (e.g. WebAudio refusal) the user can also
 * reload the page.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to console — there's no telemetry pipeline in this project yet.
    console.error('Route render error:', error, info.componentStack);
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 ring-1 ring-rose-500/30">
          <AlertTriangle size={22} className="text-rose-400" />
        </div>
        <h2 className="text-lg font-bold text-white">Something went wrong rendering this page</h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          {error.message || 'An unexpected error occurred. The rest of the app is still usable.'}
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={this.reset}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/15 px-4 py-2 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/30 hover:bg-indigo-500/25"
          >
            <RefreshCcw size={13} /> Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800/70 px-4 py-2 text-xs font-semibold text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-700/70"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
