import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Router,
  Server,
  Shield,
  Laptop,
  Network,
} from 'lucide-react';
import { ENCAPSULATION_STEPS, OSI_LAYERS } from '../data/osiLayers';

const TOPOLOGY_NODES = [
  { label: 'Client Host', sub: 'L7–L1 Stack', icon: Laptop },
  { label: 'L2 Switch', sub: 'MAC Forwarding', icon: Network },
  { label: 'Router', sub: 'IP Routing (L3)', icon: Router },
  { label: 'Firewall', sub: 'Port State (L4)', icon: Shield },
  { label: 'Web Server', sub: 'L1–L7 Receive', icon: Server },
];

export function EncapsulationFlow() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentStep = ENCAPSULATION_STEPS[stepIndex];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= ENCAPSULATION_STEPS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2100);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  function handleStepBack() {
    setIsPlaying(false);
    setStepIndex((prev) => Math.max(0, prev - 1));
  }

  function handleStepForward() {
    setIsPlaying(false);
    setStepIndex((prev) => Math.min(ENCAPSULATION_STEPS.length - 1, prev + 1));
  }

  function handleReset() {
    setIsPlaying(false);
    setStepIndex(0);
  }

  const activeLayerSpec = OSI_LAYERS.find((l) => l.layerNumber === currentStep.layerNumber)!;

  return (
    <section aria-label="Packet Encapsulation Simulator" className="space-y-6">
      {/* Control Deck Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Live Encapsulation &amp; Transit Walkthrough
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Follow an HTTPS request as headers wrap down the OSI stack, cross physical devices, and
            decapsulate at the server.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleStepBack}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Step Back
          </button>

          <button
            type="button"
            onClick={() => {
              if (stepIndex === ENCAPSULATION_STEPS.length - 1 && !isPlaying) {
                setStepIndex(0);
              }
              setIsPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                {stepIndex === ENCAPSULATION_STEPS.length - 1 ? 'Replay' : 'Play Flow'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleStepForward}
            disabled={stepIndex === ENCAPSULATION_STEPS.length - 1}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            Step Forward
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset encapsulation walkthrough"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Stage + Inspector Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Stage (~7 cols): Network Path + Live PDU Anatomy */}
        <div className="space-y-6 lg:col-span-8">
          {/* Network Topology Path */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-slate-700">
                {currentStep.phase}
              </span>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                Step {stepIndex + 1} of {ENCAPSULATION_STEPS.length}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {TOPOLOGY_NODES.map((node, idx) => {
                const Icon = node.icon;
                const isActive = currentStep.transitNodeIndex === idx;
                const isPassed = idx < currentStep.transitNodeIndex;
                return (
                  <div
                    key={node.label}
                    className={`relative flex flex-col items-center rounded-lg border p-3.5 text-center transition-all ${
                      isActive
                        ? 'border-sky-500 bg-sky-50/70 text-sky-950 ring-2 ring-sky-500/20'
                        : isPassed
                          ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                          : 'border-slate-200 bg-slate-50/60 text-slate-600'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive
                          ? 'text-sky-600'
                          : isPassed
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                      }`}
                    />
                    <span className="mt-2 font-display text-xs font-semibold">{node.label}</span>
                    <span className="mt-0.5 text-[11px] opacity-80">{node.sub}</span>
                    {idx < TOPOLOGY_NODES.length - 1 && (
                      <ArrowRight
                        aria-hidden="true"
                        className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live PDU Header Wrapping Visualizer */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-semibold text-slate-900">
                Protocol Data Unit (PDU) Structure at Layer {currentStep.layerNumber}
              </h3>
              <span className="font-mono text-xs font-semibold text-sky-700">
                Active PDU: {currentStep.pduName}
              </span>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              {currentStep.headersVisible.includes('bits') ? (
                <div className="space-y-2">
                  <div className="font-mono text-xs font-medium text-slate-600">
                    Physical Wire Encoding (1000BASE-T / Optical Pulse Stream)
                  </div>
                  <div className="overflow-x-auto rounded-md border border-slate-300 bg-slate-900 px-3 py-3 font-mono text-xs tracking-wider text-emerald-400">
                    10101010 10101011 00011010 00101011 11000000 10101000 00001010 00011000
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-stretch gap-1.5">
                  {currentStep.headersVisible.includes('l2') && (
                    <div className="rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-xs">
                      <div className="font-semibold text-orange-900">L2 Frame Header</div>
                      <div className="mt-0.5 font-mono text-[11px] text-orange-800">
                        MAC: 00:1A:2B → GW
                      </div>
                    </div>
                  )}
                  {currentStep.headersVisible.includes('l3') && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs">
                      <div className="font-semibold text-amber-900">L3 IP Header</div>
                      <div className="mt-0.5 font-mono text-[11px] text-amber-800">
                        192.168.10.24 → 93.184.216.34
                      </div>
                    </div>
                  )}
                  {currentStep.headersVisible.includes('l4') && (
                    <div className="rounded-md border border-teal-300 bg-teal-50 px-3 py-2 text-xs">
                      <div className="font-semibold text-teal-900">L4 TCP Header</div>
                      <div className="mt-0.5 font-mono text-[11px] text-teal-800">
                        Src 54120 → Port 443
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-[180px] rounded-md border border-sky-300 bg-sky-50 px-3 py-2 text-xs">
                    <div className="font-semibold text-sky-900">L5–L7 Data Payload</div>
                    <div className="mt-0.5 font-mono text-[11px] text-sky-800">
                      HTTP GET /grades (TLS 1.3)
                    </div>
                  </div>
                  {currentStep.headersVisible.includes('l2') && (
                    <div className="rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-xs">
                      <div className="font-semibold text-orange-900">L2 Trailer</div>
                      <div className="mt-0.5 font-mono text-[11px] text-orange-800">FCS CRC-32</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step Explanation */}
            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
              <div>
                <div className="text-[11px] font-medium text-slate-500">Address Used</div>
                <div className="mt-0.5 font-mono text-xs font-medium text-slate-900">
                  {currentStep.addressUsed}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">Data Name (PDU)</div>
                <div className="mt-0.5 font-mono text-xs font-medium text-slate-900">
                  {currentStep.pduName}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">Active Device / Stack</div>
                <div className="mt-0.5 text-xs font-semibold text-slate-900">
                  {currentStep.activeDevice}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-3.5">
              <div className="font-display text-sm font-semibold text-slate-900">
                {currentStep.actionTitle}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {currentStep.actionDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Right Deck (~4 cols): Clickable Step Timeline */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Journey Checkpoints
            </h3>
            <span className="font-mono text-xs text-slate-500">
              L{activeLayerSpec.layerNumber} {activeLayerSpec.name}
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            {ENCAPSULATION_STEPS.map((step, idx) => {
              const active = idx === stepIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIndex(idx);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                    active
                      ? 'border-sky-500 bg-sky-50 font-semibold text-sky-950'
                      : 'border-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`font-mono text-[11px] tabular-nums shrink-0 ${
                        active ? 'text-sky-700' : 'text-slate-400'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate">{step.actionTitle}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 shrink-0">
                    {step.pduName.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
