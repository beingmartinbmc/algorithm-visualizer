import { useLinkedListAlgo } from './hooks/useLinkedListAlgo';
import LinkedListAlgoCanvas from './components/LinkedListAlgoCanvas';
import LinkedListAlgoControls from './components/LinkedListAlgoControls';
import AlgorithmCodePanel from '../shared/AlgorithmCodePanel';
import type { LLProblem } from './types/linkedListAlgo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LinkedListAlgoPage({ problem }: { problem: LLProblem }) {
  const hook = useLinkedListAlgo(problem);
  const { info } = hook;

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:p-6 xl:flex-row">
      <main className="order-last flex min-h-[520px] flex-1 flex-col gap-4 xl:order-first">
        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur-sm">
          <Link
            to="/algorithms/linked-list"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-indigo-300"
          >
            <ArrowLeft size={13} /> Linked List Algorithms
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">Linked List Algorithms</p>
          <h2 className="mt-1 text-xl font-bold text-white">{info.title}</h2>
          <p className="mt-1 text-sm text-slate-400">{info.subtitle}</p>
        </section>
        <section className="flex flex-1 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 backdrop-blur-sm">
          <LinkedListAlgoCanvas step={hook.currentStep} />
        </section>
        <AlgorithmCodePanel pseudocode={info.pseudocode} activeLine={hook.currentStep?.codeLine ?? null} />
      </main>

      <LinkedListAlgoControls hook={hook} problem={problem} />
    </div>
  );
}
