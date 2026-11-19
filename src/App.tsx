import { useEffect, useState } from 'react';
import { MatchingLab } from './components/MatchingLab';
import { QuizMode } from './components/QuizMode';
import { EncapsulationFlow } from './components/EncapsulationFlow';
import { ReferenceMatrix } from './components/ReferenceMatrix';

type ActiveView = 'match' | 'quiz' | 'flow' | 'reference';

const VALID_VIEWS: ActiveView[] = ['match', 'quiz', 'flow', 'reference'];

function getViewFromHash(): ActiveView {
  if (typeof window === 'undefined') return 'match';
  const raw = window.location.hash.replace(/^#/, '') as ActiveView;
  return VALID_VIEWS.includes(raw) ? raw : 'match';
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>(() => getViewFromHash());
  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    const onHashChange = () => {
      setActiveView(getViewFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function navigateTo(view: ActiveView) {
    setActiveView(view);
    if (typeof window !== 'undefined' && window.location.hash !== `#${view}`) {
      window.history.replaceState(null, '', `#${view}`);
    }
  }

  function handleResetLab() {
    setResetSignal((n) => n + 1);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar: 1-row, 3-zone contract */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-8 px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="#match"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('match');
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            OSI Stack Lab
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={() => navigateTo('match')}
              className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                activeView === 'match'
                  ? 'border-b-2 border-sky-600 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:underline underline-offset-4'
              }`}
            >
              Match Lab
            </button>
            <button
              type="button"
              onClick={() => navigateTo('quiz')}
              className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                activeView === 'quiz'
                  ? 'border-b-2 border-sky-600 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:underline underline-offset-4'
              }`}
            >
              Quiz Mode
            </button>
            <button
              type="button"
              onClick={() => navigateTo('flow')}
              className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                activeView === 'flow'
                  ? 'border-b-2 border-sky-600 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:underline underline-offset-4'
              }`}
            >
              Packet Flow
            </button>
            <button
              type="button"
              onClick={() => navigateTo('reference')}
              className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                activeView === 'reference'
                  ? 'border-b-2 border-sky-600 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:underline underline-offset-4'
              }`}
            >
              Layer Guide
            </button>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleResetLab}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              Reset Lab
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main id="workspace" className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Intro Header & Mode Switcher */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-medium text-slate-500">
              ISO/IEC 7498 · 7-Layer Networking Model · Interactive Practice
            </div>
            <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance">
              Match each OSI layer with its address type, data unit, and devices
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Earn points and streaks in the 7-layer Matching Lab, diagnose real network scenarios
              in Quiz Mode, or trace live packet encapsulation from browser to server.
            </p>
          </div>

          {/* Workspace Mode Selector */}
          <div
            role="tablist"
            aria-label="Workspace view"
            className="inline-flex flex-wrap self-start rounded-lg border border-slate-200 bg-slate-100 p-1 lg:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'match'}
              onClick={() => navigateTo('match')}
              className={`rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                activeView === 'match'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Match Challenge
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'quiz'}
              onClick={() => navigateTo('quiz')}
              className={`rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                activeView === 'quiz'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quiz Mode
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'flow'}
              onClick={() => navigateTo('flow')}
              className={`rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                activeView === 'flow'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Packet Flow
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'reference'}
              onClick={() => navigateTo('reference')}
              className={`rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                activeView === 'reference'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Layer Guide
            </button>
          </div>
        </div>

        {/* Active View */}
        {activeView === 'match' && (
          <MatchingLab
            onNavigateToFlow={() => navigateTo('flow')}
            onNavigateToQuiz={() => navigateTo('quiz')}
            resetSignal={resetSignal}
          />
        )}
        {activeView === 'quiz' && (
          <QuizMode
            onNavigateToReference={() => navigateTo('reference')}
            resetSignal={resetSignal}
          />
        )}
        {activeView === 'flow' && <EncapsulationFlow />}
        {activeView === 'reference' && <ReferenceMatrix />}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>OSI Stack Lab · 7 Layers · Address Types · Protocol Data Units · Devices</span>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('match')}
              className="hover:text-slate-900 transition-colors"
            >
              Match Challenge
            </button>
            <button
              type="button"
              onClick={() => navigateTo('quiz')}
              className="hover:text-slate-900 transition-colors"
            >
              Quiz Mode
            </button>
            <button
              type="button"
              onClick={() => navigateTo('flow')}
              className="hover:text-slate-900 transition-colors"
            >
              Encapsulation Flow
            </button>
            <button
              type="button"
              onClick={() => navigateTo('reference')}
              className="hover:text-slate-900 transition-colors"
            >
              Study Reference
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
