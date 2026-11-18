import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  RotateCcw,
  Target,
} from 'lucide-react';
import { OSI_LAYERS, OSI_SCENARIOS, OsiScenario } from '../data/osiLayers';

type QuizLength = 10 | 21;
type LayerNum = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface AnsweredRecord {
  scenarioId: string;
  expectedLayer: LayerNum;
  chosenLayer: LayerNum;
  isCorrect: boolean;
  usedClue: boolean;
  pointsEarned: number;
}

function shuffleScenarios(items: OsiScenario[]): OsiScenario[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const QUIZ_BEST_KEY = 'osi_stack_lab_quiz_best_v1';

function readBestQuizScore(): number {
  try {
    const raw = window.localStorage.getItem(QUIZ_BEST_KEY);
    return raw ? Math.max(0, Number.parseInt(raw, 10) || 0) : 0;
  } catch {
    return 0;
  }
}

function saveBestQuizScore(score: number) {
  try {
    window.localStorage.setItem(QUIZ_BEST_KEY, String(score));
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export interface QuizModeProps {
  onNavigateToReference: () => void;
  resetSignal: number;
}

export function QuizMode({ onNavigateToReference, resetSignal }: QuizModeProps) {
  const [roundLength, setRoundLength] = useState<QuizLength>(10);
  const [deck, setDeck] = useState<OsiScenario[]>(() =>
    shuffleScenarios(OSI_SCENARIOS).slice(0, 10)
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState<LayerNum | null>(null);
  const [clueRevealed, setClueRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [bestScore, setBestScore] = useState<number>(() => readBestQuizScore());
  const [history, setHistory] = useState<AnsweredRecord[]>([]);
  const [isRoundComplete, setIsRoundComplete] = useState(false);

  const startNewRound = useCallback(
    (length: QuizLength = roundLength) => {
      setRoundLength(length);
      setDeck(shuffleScenarios(OSI_SCENARIOS).slice(0, length));
      setQuestionIndex(0);
      setSelectedLayer(null);
      setClueRevealed(false);
      setScore(0);
      setStreak(0);
      setBestStreak(0);
      setHistory([]);
      setIsRoundComplete(false);
    },
    [roundLength]
  );

  // Sync with header "Reset Lab"
  const [lastResetSignal, setLastResetSignal] = useState(resetSignal);
  if (resetSignal !== lastResetSignal) {
    setLastResetSignal(resetSignal);
    startNewRound(roundLength);
  }

  const currentScenario = deck[questionIndex];
  const hasAnswered = selectedLayer !== null;
  const isCurrentCorrect = hasAnswered && selectedLayer === currentScenario?.layerNumber;

  const submitAnswer = useCallback(
    (layerNum: LayerNum) => {
      if (!currentScenario || selectedLayer !== null || isRoundComplete) return;

      const isCorrect = layerNum === currentScenario.layerNumber;
      const nextStreak = isCorrect ? streak + 1 : 0;
      const basePoints = clueRevealed ? 60 : 100;
      const streakBonus = isCorrect && nextStreak >= 2 ? Math.min(50, (nextStreak - 1) * 15) : 0;
      const pointsEarned = isCorrect ? basePoints + streakBonus : 0;
      const nextScore = score + pointsEarned;

      setSelectedLayer(layerNum);
      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
      setScore(nextScore);

      if (nextScore > bestScore) {
        setBestScore(nextScore);
        saveBestQuizScore(nextScore);
      }

      setHistory((prev) => [
        ...prev,
        {
          scenarioId: currentScenario.id,
          expectedLayer: currentScenario.layerNumber,
          chosenLayer: layerNum,
          isCorrect,
          usedClue: clueRevealed,
          pointsEarned,
        },
      ]);
    },
    [bestScore, clueRevealed, currentScenario, isRoundComplete, score, selectedLayer, streak]
  );

  const advanceQuestion = useCallback(() => {
    if (selectedLayer === null) return;
    if (questionIndex >= deck.length - 1) {
      setIsRoundComplete(true);
      return;
    }
    setQuestionIndex((prev) => prev + 1);
    setSelectedLayer(null);
    setClueRevealed(false);
  }, [deck.length, questionIndex, selectedLayer]);

  // Keyboard shortcuts: 1-7 selects layer, Enter advances when answered
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isRoundComplete) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (selectedLayer === null && e.key >= '1' && e.key <= '7') {
        e.preventDefault();
        submitAnswer(Number(e.key) as LayerNum);
      } else if (selectedLayer !== null && e.key === 'Enter') {
        e.preventDefault();
        advanceQuestion();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [advanceQuestion, isRoundComplete, selectedLayer, submitAnswer]);

  const correctCount = useMemo(
    () => history.filter((item) => item.isCorrect).length,
    [history]
  );
  const accuracyPct =
    history.length > 0 ? Math.round((correctCount / history.length) * 100) : 100;

  const perLayerStats = useMemo(() => {
    return OSI_LAYERS.map((layer) => {
      const items = history.filter((h) => h.expectedLayer === layer.layerNumber);
      const hits = items.filter((h) => h.isCorrect).length;
      return {
        layerNumber: layer.layerNumber,
        name: layer.name,
        total: items.length,
        hits,
      };
    });
  }, [history]);

  const missedScenarios = useMemo(() => {
    return history
      .filter((h) => !h.isCorrect)
      .map((h) => ({
        record: h,
        scenario: OSI_SCENARIOS.find((s) => s.id === h.scenarioId)!,
      }));
  }, [history]);

  return (
    <section aria-label="OSI Scenario Quiz Mode" className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div
            role="group"
            aria-label="Quiz round size"
            className="inline-flex items-center rounded-lg bg-slate-100 p-1"
          >
            <button
              type="button"
              onClick={() => startNewRound(10)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                roundLength === 10
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              10-Question Round
            </button>
            <button
              type="button"
              onClick={() => startNewRound(21)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                roundLength === 21
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full 21 Scenarios
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {score.toLocaleString()} pts
            </span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span>
              Streak <span className="font-mono font-medium text-slate-900 tabular-nums">{streak}</span>
            </span>
            {history.length > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span>
                  Accuracy{' '}
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {accuracyPct}%
                  </span>
                </span>
              </>
            )}
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span>
              Best{' '}
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                {bestScore.toLocaleString()} pts
              </span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => startNewRound(roundLength)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 hover:text-slate-900 lg:self-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
          New Random Round
        </button>
      </div>

      {/* Round Complete Summary */}
      {isRoundComplete ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col justify-between gap-6 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3.5">
                <Award className="mt-0.5 h-6 w-6 shrink-0 text-sky-600" />
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Scenario Quiz Complete · {deck.length} Questions
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">
                    Final Score: <span className="font-mono tabular-nums">{score.toLocaleString()} pts</span>
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    You identified {correctCount} of {deck.length} network scenarios ({accuracyPct}%
                    accuracy) with a longest streak of {bestStreak}.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => startNewRound(roundLength)}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  Play New Round
                </button>
                <button
                  type="button"
                  onClick={onNavigateToReference}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  Review Layer Guide
                </button>
              </div>
            </div>

            {/* Per-Layer Accuracy Breakdown */}
            <div className="mt-6">
              <h3 className="font-display text-sm font-semibold text-slate-900">
                Performance by OSI Layer
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {perLayerStats.map((stat) => (
                  <div
                    key={stat.layerNumber}
                    className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"
                  >
                    <div className="font-mono text-xs font-semibold text-slate-700">
                      L{stat.layerNumber} · {stat.name}
                    </div>
                    <div className="mt-1 font-mono text-sm font-bold text-slate-900 tabular-nums">
                      {stat.total > 0 ? `${stat.hits}/${stat.total}` : '—'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {stat.total > 0 ? 'Correct' : 'Not drawn'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Missed Scenarios Review */}
          {missedScenarios.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-display text-base font-semibold text-slate-900">
                Missed Scenarios to Review ({missedScenarios.length})
              </h3>
              <div className="mt-4 divide-y divide-slate-200">
                {missedScenarios.map(({ record, scenario }) => {
                  const expectedSpec = OSI_LAYERS.find(
                    (l) => l.layerNumber === scenario.layerNumber
                  )!;
                  const chosenSpec = OSI_LAYERS.find(
                    (l) => l.layerNumber === record.chosenLayer
                  )!;
                  return (
                    <div key={scenario.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{scenario.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-red-700">
                          Answered L{chosenSpec.layerNumber} ({chosenSpec.name})
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-emerald-700">
                          Correct: L{expectedSpec.layerNumber} ({expectedSpec.name})
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-slate-900">{scenario.prompt}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {scenario.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Active Quiz Two-Zone Layout */
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
          {/* LEFT STAGE: Scenario Card + 7-Layer Selector */}
          <div className="space-y-5 xl:col-span-8">
            {/* Scenario Prompt */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    Scenario {questionIndex + 1} of {deck.length}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Focus: {currentScenario.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Worth {clueRevealed ? '60' : '100'} pts{streak >= 1 ? ' + streak bonus' : ''}
                  </span>
                </div>

                {!hasAnswered && !clueRevealed && (
                  <button
                    type="button"
                    onClick={() => setClueRevealed(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                    Show Clue (-40 pts)
                  </button>
                )}
              </div>

              <h2 className="mt-4 font-display text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
                {currentScenario.prompt}
              </h2>

              {clueRevealed && !hasAnswered && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-950">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <span className="font-semibold">Clue: </span>
                    {currentScenario.clue}
                  </div>
                </div>
              )}

              {/* Answer Feedback Panel */}
              {hasAnswered && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`mt-5 rounded-lg border p-4 ${
                    isCurrentCorrect
                      ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                      : 'border-red-200 bg-red-50/80 text-red-950'
                  }`}
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="flex items-start gap-2.5">
                      {isCurrentCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                      )}
                      <div>
                        <div className="text-sm font-semibold">
                          {isCurrentCorrect
                            ? `Correct · Layer ${currentScenario.layerNumber} (${
                                OSI_LAYERS.find(
                                  (l) => l.layerNumber === currentScenario.layerNumber
                                )?.name
                              }) · +${history[history.length - 1]?.pointsEarned ?? 0} pts`
                            : `Incorrect · This scenario occurs at Layer ${
                                currentScenario.layerNumber
                              } (${
                                OSI_LAYERS.find(
                                  (l) => l.layerNumber === currentScenario.layerNumber
                                )?.name
                              })`}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed opacity-90">
                          {currentScenario.explanation}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={advanceQuestion}
                      className="inline-flex items-center gap-1.5 self-start rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                    >
                      {questionIndex === deck.length - 1 ? 'View Summary' : 'Next Scenario'}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Key Indicators Breakdown */}
                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-black/10 pt-3 text-xs sm:grid-cols-3">
                    <div>
                      <span className="block text-[11px] opacity-75">Address Type</span>
                      <span className="font-semibold">{currentScenario.addressHighlight}</span>
                    </div>
                    <div>
                      <span className="block text-[11px] opacity-75">Data Unit (PDU)</span>
                      <span className="font-mono font-semibold">
                        {currentScenario.pduHighlight}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] opacity-75">Key Device</span>
                      <span className="font-semibold">{currentScenario.deviceHighlight}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 7-Layer Stack Answer Options */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  Select the corresponding OSI layer
                </span>
                <span className="hidden sm:inline font-mono">Keys 1–7 to select · Enter for next</span>
              </div>

              <div className="space-y-2">
                {OSI_LAYERS.map((layer) => {
                  const isExpected = layer.layerNumber === currentScenario.layerNumber;
                  const isChosen = layer.layerNumber === selectedLayer;

                  let buttonClass =
                    'border-slate-200 bg-white text-slate-900 hover:border-sky-400 hover:bg-sky-50/40';
                  if (hasAnswered) {
                    if (isExpected) {
                      buttonClass =
                        'border-emerald-400 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-400/40';
                    } else if (isChosen && !isExpected) {
                      buttonClass = 'border-red-300 bg-red-50/80 text-red-950';
                    } else {
                      buttonClass = 'border-slate-200 bg-slate-50/60 text-slate-500 opacity-75';
                    }
                  }

                  return (
                    <button
                      key={layer.layerNumber}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => submitAnswer(layer.layerNumber)}
                      className={`flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-default ${buttonClass}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-semibold ${layer.accentBg} ${layer.accentText} ${layer.accentBorder}`}
                        >
                          L{layer.layerNumber}
                        </span>
                        <div className="min-w-0">
                          <div className="font-display text-sm font-semibold">
                            Layer {layer.layerNumber} — {layer.name}
                          </div>
                          <div className="text-xs opacity-75 truncate">{layer.group}</div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 text-xs font-medium">
                        {hasAnswered && isExpected && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="h-4 w-4" />
                            Correct Layer
                          </span>
                        )}
                        {hasAnswered && isChosen && !isExpected && (
                          <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
                            <AlertCircle className="h-4 w-4" />
                            Your Pick
                          </span>
                        )}
                        {!hasAnswered && (
                          <span className="font-mono text-[11px] text-slate-400">
                            Key {layer.layerNumber}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT DECK: Scoreboard & Session Tracker */}
          <aside className="space-y-4 xl:col-span-4 xl:sticky xl:top-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  Quiz Scoreboard
                </h3>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {questionIndex + (hasAnswered ? 1 : 0)} / {deck.length} answered
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                  <div className="text-[11px] font-medium text-slate-500">Current Score</div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
                    {score.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                  <div className="text-[11px] font-medium text-slate-500">Best Streak</div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
                    {bestStreak}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Round Progress</span>
                  <span className="font-mono tabular-nums">
                    {Math.round(((questionIndex + (hasAnswered ? 1 : 0)) / deck.length) * 100)}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-sky-600 transition-all duration-200"
                    style={{
                      width: `${((questionIndex + (hasAnswered ? 1 : 0)) / deck.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Scoring Rules */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-sky-600" />
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  Scoring Rules
                </h3>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center justify-between">
                  <span>Correct identification</span>
                  <span className="font-mono font-semibold text-slate-900">+100 pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Streak bonus (2+ in a row)</span>
                  <span className="font-mono font-semibold text-emerald-700">+15 to +50 pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Using a scenario clue</span>
                  <span className="font-mono font-semibold text-amber-700">60 pts base</span>
                </li>
              </ul>
            </div>

            {/* Layer Accuracy Mini-Tracker */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-display text-sm font-semibold text-slate-900">
                Session Coverage
              </h3>
              <div className="mt-3 space-y-2">
                {perLayerStats.map((stat) => (
                  <div
                    key={stat.layerNumber}
                    className="flex items-center justify-between text-xs text-slate-600"
                  >
                    <span>
                      L{stat.layerNumber} · {stat.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-900">
                      {stat.total > 0 ? `${stat.hits} / ${stat.total}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
