/**
 * Lazily-created, shared AudioContext for all in-app sound effects.
 * Centralized so we can:
 *   - swallow construction errors on browsers that block WebAudio (older
 *     Safari, locked-down enterprise browsers) instead of crashing the page;
 *   - share a single context across every hook (browsers cap concurrent
 *     contexts and our hooks all play very short, fire-and-forget tones);
 *   - resume from `'suspended'` and `'interrupted'` states uniformly.
 *
 * Returns `null` when WebAudio is unavailable. Callers must guard.
 */

type WindowWithLegacyAudio = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

let sharedCtx: AudioContext | null = null;
let constructionFailed = false;

function getAudioContextCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const w = window as WindowWithLegacyAudio;
  return window.AudioContext ?? w.webkitAudioContext ?? null;
}

export function getAudioContext(): AudioContext | null {
  if (constructionFailed) return null;

  if (!sharedCtx || sharedCtx.state === 'closed') {
    const Ctor = getAudioContextCtor();
    if (!Ctor) {
      constructionFailed = true;
      return null;
    }
    try {
      sharedCtx = new Ctor();
    } catch {
      // Most commonly: autoplay policy refused construction outside a user
      // gesture. The next interaction will retry by re-entering this fn.
      sharedCtx = null;
      return null;
    }
  }

  // Safari moves contexts to 'interrupted' when tabs are backgrounded;
  // a regular `'suspended'` check misses that. Resume on any non-running state.
  if (sharedCtx.state !== 'running') {
    // resume() returns a promise; we don't await — the next play attempt will
    // see 'running' or fall through harmlessly.
    sharedCtx.resume().catch(() => {});
  }

  return sharedCtx;
}
