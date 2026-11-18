import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  Hash,
  HelpCircle,
  Info,
  Lightbulb,
  Package,
  RotateCcw,
  Shuffle,
  X,
} from 'lucide-react';
import {
  MatchCategory,
  MatchTile,
  OSI_LAYERS,
  OsiLayerSpec,
  buildMatchTiles,
  isTileCorrectForSlot,
} from '../data/osiLayers';

type VerificationMode = 'instant' | 'exam';
type BankFilter = 'all' | MatchCategory;
type LayerNum = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type SlotKey = `${LayerNum}-${MatchCategory}`;

interface FeedbackBanner {
  tone: 'success' | 'error' | 'info' | 'hint';
  title: string;
  detail: string;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const CATEGORY_META: Record<
  MatchCategory,
  { label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }
> = {
  address: { label: 'Address Type', shortLabel: 'Address', icon: Hash },
  pdu: { label: 'Name of Data (PDU)', shortLabel: 'Data (PDU)', icon: Package },
  devices: { label: 'Layer Devices', shortLabel: 'Devices', icon: Cpu },
};

const MATCH_BEST_KEY = 'osi_stack_lab_match_best_v1';

function readBestMatchScore(): number {
  try {
    const raw = window.localStorage.getItem(MATCH_BEST_KEY);
    return raw ? Math.max(0, Number.parseInt(raw, 10) || 0) : 0;
  } catch {
    return 0;
  }
}

function saveBestMatchScore(value: number) {
  try {
    window.localStorage.setItem(MATCH_BEST_KEY, String(value));
  } catch {
    // Ignore storage errors
  }
}

export interface MatchingLabProps {
  onNavigateToFlow: () => void;
  onNavigateToQuiz: () => void;
  resetSignal: number;
}

export function MatchingLab({
  onNavigateToFlow,
  onNavigateToQuiz,
  resetSignal,
}: MatchingLabProps) {
  const allTiles = useMemo(() => buildMatchTiles(), []);
  const tileById = useMemo(() => {
    const map = new Map<string, MatchTile>();
    for (const t of allTiles) map.set(t.id, t);
    return map;
  }, [allTiles]);

  const [mode, setMode] = useState<VerificationMode>('instant');
  const [bankOrder, setBankOrder] = useState<string[]>(() =>
    shuffleArray(allTiles.map((t) => t.id))
  );
  const [placements, setPlacements] = useState<Partial<Record<SlotKey, string>>>({});
  const [examGraded, setExamGraded] = useState(false);
  const [examChecksUsed, setExamChecksUsed] = useState(0);
  const [bankFilter, setBankFilter] = useState<BankFilter>('all');
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [targetedSlot, setTargetedSlot] = useState<{
    layer: LayerNum;
    category: MatchCategory;
  } | null>(null);
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<SlotKey | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [bestScore, setBestScore] = useState<number>(() => readBestMatchScore());
  const [inspectedLayer, setInspectedLayer] = useState<LayerNum | null>(7);
  const [feedback, setFeedback] = useState<FeedbackBanner>({
    tone: 'info',
    title: 'Match each OSI layer to its core attributes',
    detail:
      'Drag tiles from the bank onto the 7-layer stack, or click any tile and click its matching slot (+100 pts per match plus streak bonus).',
  });

  // Reset when parent triggers resetSignal
  const [lastResetSignal, setLastResetSignal] = useState(resetSignal);
  if (resetSignal !== lastResetSignal) {
    setLastResetSignal(resetSignal);
    setPlacements({});
    setExamGraded(false);
    setExamChecksUsed(0);
    setSelectedTileId(null);
    setTargetedSlot(null);
    setAttempts(0);
    setCorrectAttempts(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setBankOrder(shuffleArray(allTiles.map((t) => t.id)));
    setFeedback({
      tone: 'info',
      title: 'Board reset',
      detail: 'All 21 tiles have been shuffled back into the bank.',
    });
  }

  const placedTileIds = useMemo(() => {
    const set = new Set<string>();
    for (const val of Object.values(placements)) {
      if (val) set.add(val);
    }
    return set;
  }, [placements]);

  const remainingTiles = useMemo(() => {
    return bankOrder
      .filter((id) => !placedTileIds.has(id))
      .map((id) => tileById.get(id)!)
      .filter((tile) => (bankFilter === 'all' ? true : tile.category === bankFilter));
  }, [bankOrder, placedTileIds, tileById, bankFilter]);

  const categoryCounts = useMemo(() => {
    const counts: Record<BankFilter, number> = { all: 0, address: 0, pdu: 0, devices: 0 };
    for (const id of bankOrder) {
      if (!placedTileIds.has(id)) {
        const tile = tileById.get(id);
        if (tile) {
          counts.all += 1;
          counts[tile.category] += 1;
        }
      }
    }
    return counts;
  }, [bankOrder, placedTileIds, tileById]);

  const totalSlots = 21;
  const placedCount = placedTileIds.size;

  const verifiedCount = useMemo(() => {
    let count = 0;
    for (const layer of OSI_LAYERS) {
      for (const category of ['address', 'pdu', 'devices'] as MatchCategory[]) {
        const key: SlotKey = `${layer.layerNumber}-${category}`;
        const tid = placements[key];
        if (!tid) continue;
        const tile = tileById.get(tid);
        if (tile && isTileCorrectForSlot(tile, layer.layerNumber, category)) {
          count += 1;
        }
      }
    }
    return count;
  }, [placements, tileById]);

  const allCompleted =
    mode === 'instant' ? verifiedCount === totalSlots : examGraded && verifiedCount === totalSlots;

  const accuracyPct =
    attempts > 0 ? Math.round((correctAttempts / attempts) * 100) : 100;

  function updateScore(nextScore: number) {
    const clamped = Math.max(0, nextScore);
    setScore(clamped);
    if (clamped > bestScore) {
      setBestScore(clamped);
      saveBestMatchScore(clamped);
    }
  }

  function resetBoard(newMode?: VerificationMode) {
    if (newMode) setMode(newMode);
    setPlacements({});
    setExamGraded(false);
    setExamChecksUsed(0);
    setSelectedTileId(null);
    setTargetedSlot(null);
    setAttempts(0);
    setCorrectAttempts(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setBankOrder(shuffleArray(allTiles.map((t) => t.id)));
    setFeedback({
      tone: 'info',
      title:
        newMode === 'exam'
          ? 'Exam Mode active'
          : newMode === 'instant'
            ? 'Instant Feedback active'
            : 'Board reset',
      detail:
        newMode === 'exam'
          ? 'Place all 21 tiles across the 7 layers without hints, then click Check Answers (+300 bonus for a first-try perfect stack).'
          : 'Drag or click tiles to match each layer with its Address Type, Name of Data (PDU), and Devices.',
    });
  }

  function shuffleBank() {
    setBankOrder((prev) => shuffleArray(prev));
  }

  function removeTileFromSlot(layer: LayerNum, category: MatchCategory) {
    const key: SlotKey = `${layer}-${category}`;
    const existingId = placements[key];
    if (!existingId) return;

    // In Instant mode, verified tiles stay locked so progress feels solid
    if (mode === 'instant') {
      const tile = tileById.get(existingId);
      if (tile && isTileCorrectForSlot(tile, layer, category)) {
        setInspectedLayer(layer);
        return;
      }
    }

    setPlacements((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (examGraded) setExamGraded(false);
  }

  function placeTile(tileId: string, targetLayer: LayerNum, targetCategory: MatchCategory) {
    const tile = tileById.get(tileId);
    if (!tile) return;

    const targetKey: SlotKey = `${targetLayer}-${targetCategory}`;
    const targetLayerSpec = OSI_LAYERS.find((l) => l.layerNumber === targetLayer)!;

    // Prevent dropping e.g. a Device tile into an Address Type slot
    if (tile.category !== targetCategory) {
      setFeedback({
        tone: 'error',
        title: `Wrong column: ${CATEGORY_META[tile.category].label}`,
        detail: `"${tile.label}" is a ${CATEGORY_META[tile.category].shortLabel} tile. Place it in the ${CATEGORY_META[tile.category].label} column.`,
      });
      setSelectedTileId(null);
      setDraggedTileId(null);
      setDragOverSlot(null);
      return;
    }

    // If Instant mode and target slot is already verified, do not overwrite
    const currentInSlot = placements[targetKey];
    if (mode === 'instant' && currentInSlot) {
      const existingTile = tileById.get(currentInSlot);
      if (existingTile && isTileCorrectForSlot(existingTile, targetLayer, targetCategory)) {
        setFeedback({
          tone: 'info',
          title: `Layer ${targetLayer} (${targetLayerSpec.name}) ${CATEGORY_META[targetCategory].shortLabel} is already verified`,
          detail: 'Choose an open slot to place this tile.',
        });
        return;
      }
    }

    if (mode === 'instant') {
      setAttempts((a) => a + 1);
      const correct = isTileCorrectForSlot(tile, targetLayer, targetCategory);

      if (correct) {
        const nextStreak = streak + 1;
        const streakBonus = nextStreak >= 2 ? Math.min(60, (nextStreak - 1) * 15) : 0;
        const earned = 100 + streakBonus;

        setCorrectAttempts((c) => c + 1);
        setStreak(nextStreak);
        setBestStreak((b) => Math.max(b, nextStreak));
        updateScore(score + earned);
        setPlacements((prev) => {
          const next = { ...prev };
          // Remove tile if it was somehow in another slot
          for (const [k, v] of Object.entries(next)) {
            if (v === tileId) delete next[k as SlotKey];
          }
          next[targetKey] = tileId;
          return next;
        });
        setInspectedLayer(targetLayer);
        setSelectedTileId(null);
        setTargetedSlot(null);
        setDraggedTileId(null);
        setDragOverSlot(null);

        setFeedback({
          tone: 'success',
          title: `Matched Layer ${targetLayer} · ${targetLayerSpec.name} · +${earned} pts`,
          detail: tile.explanation,
        });
      } else {
        setStreak(0);
        updateScore(score - 20);
        setSelectedTileId(null);
        setDraggedTileId(null);
        setDragOverSlot(null);
        setFeedback({
          tone: 'error',
          title: `Not Layer ${targetLayer} (${targetLayerSpec.name}) · -20 pts`,
          detail:
            targetCategory === 'address'
              ? `"${tile.label}" does not match Layer ${targetLayer}. Clue for Layer ${targetLayer} Address: ${targetLayerSpec.addressClue}`
              : targetCategory === 'pdu'
                ? `"${tile.label}" is not the PDU for Layer ${targetLayer}. Clue: ${targetLayerSpec.pduClue}`
                : `"${tile.label}" does not operate at Layer ${targetLayer}. Clue: ${targetLayerSpec.devicesClue}`,
        });
      }
      return;
    }

    // Exam Mode: place freely without revealing correctness until graded
    setPlacements((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(next)) {
        if (v === tileId) delete next[k as SlotKey];
      }
      next[targetKey] = tileId;
      return next;
    });
    if (examGraded) setExamGraded(false);
    setSelectedTileId(null);
    setTargetedSlot(null);
    setDraggedTileId(null);
    setDragOverSlot(null);
  }

  function handleSlotClick(layer: LayerNum, category: MatchCategory) {
    const key: SlotKey = `${layer}-${category}`;
    const existingId = placements[key];

    if (selectedTileId) {
      placeTile(selectedTileId, layer, category);
      return;
    }

    if (existingId) {
      removeTileFromSlot(layer, category);
      return;
    }

    // Select slot first so user can pick a matching tile from the bank
    if (targetedSlot?.layer === layer && targetedSlot?.category === category) {
      setTargetedSlot(null);
    } else {
      setTargetedSlot({ layer, category });
      setBankFilter(category);
      setInspectedLayer(layer);
    }
  }

  function handleTileClick(tile: MatchTile) {
    if (targetedSlot) {
      placeTile(tile.id, targetedSlot.layer, targetedSlot.category);
      return;
    }
    setSelectedTileId((prev) => (prev === tile.id ? null : tile.id));
  }

  function handleHint() {
    if (mode === 'exam') {
      setFeedback({
        tone: 'info',
        title: 'Hints are disabled in Exam Mode',
        detail: 'Switch to Instant Feedback to receive layer clues, or place your best matches and click Check Answers.',
      });
      return;
    }

    // Find targeted empty slot or first incomplete slot
    let target: { layer: LayerNum; category: MatchCategory } | null = targetedSlot;
    if (!target || placements[`${target.layer}-${target.category}`]) {
      outer: for (const layer of OSI_LAYERS) {
        for (const category of ['address', 'pdu', 'devices'] as MatchCategory[]) {
          const k: SlotKey = `${layer.layerNumber}-${category}`;
          if (!placements[k]) {
            target = { layer: layer.layerNumber, category };
            break outer;
          }
        }
      }
    }

    if (!target) {
      setFeedback({
        tone: 'success',
        title: 'All 21 slots are already verified',
        detail: 'Great job! Every layer has its correct Address Type, Data Unit, and Devices.',
      });
      return;
    }

    const layerSpec = OSI_LAYERS.find((l) => l.layerNumber === target!.layer)!;
    const clue =
      target.category === 'address'
        ? layerSpec.addressClue
        : target.category === 'pdu'
          ? layerSpec.pduClue
          : layerSpec.devicesClue;

    updateScore(score - 15);
    setTargetedSlot(target);
    setBankFilter(target.category);
    setInspectedLayer(target.layer);
    setFeedback({
      tone: 'hint',
      title: `Hint for Layer ${target.layer} (${layerSpec.name}) · ${CATEGORY_META[target.category].shortLabel} · -15 pts`,
      detail: clue,
    });
  }

  function handleGradeExam() {
    const nextCheckCount = examChecksUsed + 1;
    setExamChecksUsed(nextCheckCount);
    setExamGraded(true);

    const mistakes = placedCount - verifiedCount;
    const firstTryBonus =
      verifiedCount === totalSlots && nextCheckCount === 1 ? 300 : 0;
    const computedScore = Math.max(
      0,
      verifiedCount * 100 - mistakes * 20 - (nextCheckCount - 1) * 50 + firstTryBonus
    );
    updateScore(computedScore);

    if (verifiedCount === totalSlots) {
      setFeedback({
        tone: 'success',
        title: `Perfect score: 21 / 21 verified · ${computedScore.toLocaleString()} pts`,
        detail:
          firstTryBonus > 0
            ? 'All 21 slots matched on your first check (+300 first-try bonus earned).'
            : 'You accurately matched every OSI layer with its Address Type, Data Unit (PDU), and Devices.',
      });
    } else {
      const missing = totalSlots - placedCount;
      setFeedback({
        tone: 'error',
        title: `Score: ${verifiedCount} / 21 correct · ${computedScore.toLocaleString()} pts`,
        detail: `${mistakes} placed tile${mistakes === 1 ? '' : 's'} mismatched${
          missing > 0 ? ` and ${missing} slot${missing === 1 ? '' : 's'} empty` : ''
        }. Click "Clear Mismatches" to return wrong tiles to the bank.`,
      });
    }
  }

  function handleClearMismatches() {
    setPlacements((prev) => {
      const next: Partial<Record<SlotKey, string>> = {};
      for (const layer of OSI_LAYERS) {
        for (const category of ['address', 'pdu', 'devices'] as MatchCategory[]) {
          const key: SlotKey = `${layer.layerNumber}-${category}`;
          const tid = prev[key];
          if (!tid) continue;
          const tile = tileById.get(tid);
          if (tile && isTileCorrectForSlot(tile, layer.layerNumber, category)) {
            next[key] = tid;
          }
        }
      }
      return next;
    });
    setExamGraded(false);
    setFeedback({
      tone: 'info',
      title: 'Mismatched tiles returned to bank',
      detail: 'Correctly matched slots were kept. Reassign the remaining tiles and check again.',
    });
  }

  const inspectedSpec: OsiLayerSpec | undefined = useMemo(
    () => OSI_LAYERS.find((l) => l.layerNumber === inspectedLayer),
    [inspectedLayer]
  );

  return (
    <section aria-label="Interactive OSI Layer Matching Lab" className="space-y-6">
      {/* Workspace Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {/* Verification Mode Segmented Control */}
          <div
            role="group"
            aria-label="Checking mode"
            className="inline-flex items-center rounded-lg bg-slate-100 p-1"
          >
            <button
              type="button"
              onClick={() => {
                if (mode !== 'instant') resetBoard('instant');
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                mode === 'instant'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Instant Feedback
            </button>
            <button
              type="button"
              onClick={() => {
                if (mode !== 'exam') resetBoard('exam');
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                mode === 'exam'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Exam Mode
            </button>
          </div>

          {/* Unboxed Tabular Score & Progress Readout */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>
              Score{' '}
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {score.toLocaleString()} pts
              </span>
            </span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                {mode === 'instant' ? verifiedCount : placedCount} / {totalSlots}
              </span>{' '}
              {mode === 'instant' ? 'Verified' : 'Placed'}
            </span>
            {mode === 'instant' && (
              <>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span>
                  Streak{' '}
                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                    {streak}
                  </span>
                </span>
              </>
            )}
            {mode === 'instant' && attempts > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span>
                  Accuracy{' '}
                  <span className="font-mono text-slate-900 tabular-nums">{accuracyPct}%</span>
                </span>
              </>
            )}
            {mode === 'exam' && examGraded && (
              <>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                  {verifiedCount} / {totalSlots} Correct
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

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {mode === 'instant' ? (
            <button
              type="button"
              onClick={handleHint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
              Get Clue
            </button>
          ) : (
            <>
              {examGraded && verifiedCount < totalSlots && (
                <button
                  type="button"
                  onClick={handleClearMismatches}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  Clear Mismatches
                </button>
              )}
              <button
                type="button"
                onClick={handleGradeExam}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Check Answers
              </button>
            </>
          )}

          <button
            type="button"
            onClick={shuffleBank}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            <Shuffle className="h-3.5 w-3.5 text-slate-500" />
            Shuffle Bank
          </button>

          <button
            type="button"
            onClick={() => resetBoard()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            Reset
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      {allCompleted && (
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <div>
              <h3 className="font-display text-base font-semibold text-emerald-950">
                Complete OSI Stack Verified (21 / 21) · {score.toLocaleString()} pts
              </h3>
              <p className="mt-0.5 text-sm text-emerald-900">
                All seven layers are matched with their address types, PDUs, and devices
                {mode === 'instant'
                  ? ` at ${accuracyPct}% accuracy (best streak ${bestStreak}).`
                  : '.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onNavigateToQuiz}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              Try Scenario Quiz
            </button>
            <button
              type="button"
              onClick={onNavigateToFlow}
              className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-900 whitespace-nowrap shrink-0 transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              Watch Packet Flow
            </button>
            <button
              type="button"
              onClick={() => resetBoard('exam')}
              className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-900 whitespace-nowrap shrink-0 transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              Try Exam Mode
            </button>
          </div>
        </div>
      )}

      {/* Two-Zone Sandbox Layout: Left Interactive Stack (~68%), Right Tile Bank & Feedback (~32%) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        {/* LEFT ZONE: 7-Layer OSI Matrix */}
        <div className="xl:col-span-8">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {/* Column Headers */}
            <div className="hidden border-b border-slate-200 bg-slate-50/80 px-4 py-3 md:grid md:grid-cols-12 md:gap-3">
              <div className="col-span-3 text-xs font-semibold tracking-wide text-slate-600">
                OSI Layer (L7 → L1)
              </div>
              <div className="col-span-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-600">
                <Hash className="h-3.5 w-3.5 text-slate-400" />
                Address Type
              </div>
              <div className="col-span-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-600">
                <Package className="h-3.5 w-3.5 text-slate-400" />
                Name of Data (PDU)
              </div>
              <div className="col-span-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-600">
                <Cpu className="h-3.5 w-3.5 text-slate-400" />
                Devices
              </div>
            </div>

            {/* 7 Layer Rows */}
            <div className="divide-y divide-slate-200">
              {OSI_LAYERS.map((layer) => {
                const isLayerInspected = inspectedLayer === layer.layerNumber;
                const layerVerifiedCount = (['address', 'pdu', 'devices'] as MatchCategory[]).filter(
                  (cat) => {
                    const tid = placements[`${layer.layerNumber}-${cat}`];
                    if (!tid) return false;
                    const t = tileById.get(tid);
                    return t ? isTileCorrectForSlot(t, layer.layerNumber, cat) : false;
                  }
                ).length;
                const layerFullyVerified =
                  (mode === 'instant' || examGraded) && layerVerifiedCount === 3;

                return (
                  <div
                    key={layer.layerNumber}
                    className={`p-4 transition-colors ${
                      isLayerInspected ? 'bg-sky-50/30' : 'bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-stretch">
                      {/* Layer Identity Column */}
                      <button
                        type="button"
                        onClick={() => setInspectedLayer(layer.layerNumber)}
                        className="md:col-span-3 flex flex-col justify-center rounded-lg border border-transparent p-2 text-left transition-colors hover:border-slate-200 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-semibold ${layer.accentBg} ${layer.accentText} ${layer.accentBorder}`}
                          >
                            L{layer.layerNumber}
                          </span>
                          <div className="min-w-0">
                            <div className="font-display text-sm font-semibold text-slate-900 truncate">
                              {layer.name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">{layer.group}</div>
                          </div>
                        </div>
                        {layerFullyVerified && (
                          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>Layer verified</span>
                          </div>
                        )}
                      </button>

                      {/* 3 Match Slots: Address Type, PDU, Devices */}
                      {(['address', 'pdu', 'devices'] as MatchCategory[]).map((category) => {
                        const slotKey: SlotKey = `${layer.layerNumber}-${category}`;
                        const placedId = placements[slotKey];
                        const placedTile = placedId ? tileById.get(placedId) : undefined;
                        const isTargeted =
                          targetedSlot?.layer === layer.layerNumber &&
                          targetedSlot?.category === category;
                        const isDragOver = dragOverSlot === slotKey;

                        const showValidation = mode === 'instant' || examGraded;
                        const isCorrect =
                          placedTile &&
                          isTileCorrectForSlot(placedTile, layer.layerNumber, category);
                        const isWrong = Boolean(placedTile && showValidation && !isCorrect);

                        const draggedTile = draggedTileId
                          ? tileById.get(draggedTileId)
                          : selectedTileId
                            ? tileById.get(selectedTileId)
                            : undefined;
                        const compatibleHover =
                          draggedTile && draggedTile.category === category && !placedTile;

                        let slotStyle =
                          'border-dashed border-slate-300 bg-slate-50/70 text-slate-500 hover:border-sky-400 hover:bg-sky-50/40';
                        if (isDragOver || isTargeted) {
                          slotStyle =
                            'border-solid border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20';
                        } else if (compatibleHover) {
                          slotStyle =
                            'border-dashed border-sky-400 bg-sky-50/50 text-sky-800';
                        }

                        if (placedTile) {
                          if (showValidation && isCorrect) {
                            slotStyle =
                              'border-solid border-emerald-300 bg-emerald-50/70 text-emerald-950';
                          } else if (isWrong) {
                            slotStyle =
                              'border-solid border-red-300 bg-red-50/80 text-red-950';
                          } else {
                            slotStyle =
                              'border-solid border-slate-300 bg-white text-slate-900 hover:border-slate-400';
                          }
                        }

                        const CategoryIcon = CATEGORY_META[category].icon;

                        return (
                          <div key={slotKey} className="md:col-span-3 flex flex-col">
                            {/* Mobile-only label */}
                            <span className="mb-1 text-[11px] font-medium text-slate-500 md:hidden">
                              {CATEGORY_META[category].label}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleSlotClick(layer.layerNumber, category)}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (dragOverSlot !== slotKey) setDragOverSlot(slotKey);
                              }}
                              onDragLeave={() => {
                                if (dragOverSlot === slotKey) setDragOverSlot(null);
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                const droppedId =
                                  e.dataTransfer.getData('text/plain') || draggedTileId;
                                setDragOverSlot(null);
                                if (droppedId) {
                                  placeTile(droppedId, layer.layerNumber, category);
                                }
                              }}
                              aria-label={`Layer ${layer.layerNumber} ${layer.name} ${CATEGORY_META[category].label}`}
                              className={`group flex min-h-[72px] w-full flex-col justify-between rounded-lg border p-2.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${slotStyle}`}
                            >
                              {placedTile ? (
                                <>
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-xs font-semibold leading-snug">
                                      {placedTile.label}
                                    </span>
                                    {showValidation && isCorrect ? (
                                      <CheckCircle2
                                        aria-label="Verified"
                                        className="h-4 w-4 shrink-0 text-emerald-600"
                                      />
                                    ) : isWrong ? (
                                      <AlertCircle
                                        aria-label="Incorrect"
                                        className="h-4 w-4 shrink-0 text-red-600"
                                      />
                                    ) : (
                                      <X
                                        aria-label="Remove tile"
                                        className="h-3.5 w-3.5 shrink-0 text-slate-400 opacity-70 group-hover:text-slate-700 group-hover:opacity-100"
                                      />
                                    )}
                                  </div>
                                  <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px]">
                                    <span
                                      className={
                                        showValidation && isCorrect
                                          ? 'font-medium text-emerald-700'
                                          : isWrong
                                            ? 'font-medium text-red-700'
                                            : 'text-slate-500'
                                      }
                                    >
                                      {showValidation && isCorrect
                                        ? 'Verified'
                                        : isWrong
                                          ? `Mismatch · Click to remove`
                                          : 'Placed · Click to return'}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex h-full flex-col justify-between">
                                  <div className="flex items-center justify-between text-xs font-medium">
                                    <span>
                                      {isTargeted
                                        ? 'Pick matching tile'
                                        : selectedTileId
                                          ? 'Click to place here'
                                          : `Drop ${CATEGORY_META[category].shortLabel}`}
                                    </span>
                                    <CategoryIcon className="h-3.5 w-3.5 opacity-55" />
                                  </div>
                                  <span className="mt-2 text-[11px] opacity-75">
                                    L{layer.layerNumber} {CATEGORY_META[category].shortLabel}
                                  </span>
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT ZONE: Sticky Feedback + Tile Bank + Layer Inspector */}
        <aside className="space-y-4 xl:col-span-4 xl:sticky xl:top-6">
          {/* Live Feedback Banner */}
          <div
            role="status"
            aria-live="polite"
            className={`rounded-xl border p-4 ${
              feedback.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                : feedback.tone === 'error'
                  ? 'border-red-200 bg-red-50/80 text-red-950'
                  : feedback.tone === 'hint'
                    ? 'border-amber-200 bg-amber-50/80 text-amber-950'
                    : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {feedback.tone === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : feedback.tone === 'error' ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              ) : feedback.tone === 'hint' ? (
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              ) : (
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold">{feedback.title}</p>
                <p className="mt-1 text-xs leading-relaxed opacity-90">{feedback.detail}</p>
              </div>
            </div>
          </div>

          {/* Tile Bank */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-semibold text-slate-900">
                Matching Tile Bank
              </h2>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {categoryCounts.all} left
              </span>
            </div>

            {/* Category Filter Tabs */}
            <div
              role="tablist"
              aria-label="Filter tiles by category"
              className="mt-3 grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1"
            >
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'address', label: 'Address' },
                  { id: 'pdu', label: 'Data' },
                  { id: 'devices', label: 'Devices' },
                ] as const
              ).map((tab) => {
                const active = bankFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => setBankFilter(tab.id)}
                    className={`rounded-md px-2 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label} ({categoryCounts[tab.id]})
                  </button>
                );
              })}
            </div>

            {/* Active Selection / Target Indicator */}
            {(selectedTileId || targetedSlot) && (
              <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
                <span className="truncate font-medium">
                  {selectedTileId
                    ? `Selected: ${tileById.get(selectedTileId)?.label}`
                    : `Targeting Layer ${targetedSlot?.layer} · ${CATEGORY_META[targetedSlot!.category].shortLabel}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTileId(null);
                    setTargetedSlot(null);
                  }}
                  className="shrink-0 font-semibold text-sky-700 hover:text-sky-950"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Tile List */}
            <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {remainingTiles.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                  <p className="text-xs font-medium text-slate-600">
                    {categoryCounts.all === 0
                      ? 'All 21 tiles have been placed on the stack.'
                      : 'No remaining tiles in this category.'}
                  </p>
                  {categoryCounts.all > 0 && bankFilter !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setBankFilter('all')}
                      className="mt-2 text-xs font-semibold text-sky-600 hover:text-sky-800"
                    >
                      Show all remaining tiles
                    </button>
                  )}
                </div>
              ) : (
                remainingTiles.map((tile) => {
                  const Icon = CATEGORY_META[tile.category].icon;
                  const isSelected = selectedTileId === tile.id;
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', tile.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedTileId(tile.id);
                        setSelectedTileId(tile.id);
                      }}
                      onDragEnd={() => {
                        setDraggedTileId(null);
                        setDragOverSlot(null);
                      }}
                      onClick={() => handleTileClick(tile)}
                      className={`w-full cursor-grab active:cursor-grabbing rounded-lg border p-3 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900">
                            {tile.label}
                          </div>
                          {mode === 'instant' && (
                            <div className="mt-0.5 text-[11px] text-slate-500 truncate">
                              {tile.sublabel}
                            </div>
                          )}
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-slate-500">
                          <Icon className="h-3.5 w-3.5" />
                          {CATEGORY_META[tile.category].shortLabel}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Contextual Layer Inspector */}
          {inspectedSpec && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-sky-600" />
                  <h3 className="font-display text-sm font-semibold text-slate-900">
                    Layer {inspectedSpec.layerNumber}: {inspectedSpec.name}
                  </h3>
                </div>
                <span className="text-xs text-slate-500">{inspectedSpec.group}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {inspectedSpec.roleSummary}
              </p>
              <div className="mt-3 border-t border-slate-100 pt-2.5 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Common protocols: </span>
                <span className="font-mono">{inspectedSpec.protocols.join(' · ')}</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
