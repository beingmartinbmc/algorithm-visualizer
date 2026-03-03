import { useLinkedList } from './hooks/useLinkedList';
import LinkedListCanvas from './components/LinkedListCanvas';
import LinkedListControls from './components/LinkedListControls';

export default function LinkedListPage() {
  const hook = useLinkedList();

  return (
    <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 overflow-auto p-4 md:p-6">
      <div className="order-last md:order-first flex md:flex-1 flex-col items-center justify-center gap-3 min-h-[40vh] md:min-h-0 max-h-[55vh] md:max-h-none overflow-auto">
        <LinkedListCanvas nodes={hook.displayNodes} currentStep={hook.currentStep} />
      </div>
      <LinkedListControls hook={hook} />
    </div>
  );
}
