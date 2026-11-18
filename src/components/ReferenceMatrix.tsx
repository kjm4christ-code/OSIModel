import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { OSI_LAYERS } from '../data/osiLayers';

type StudyColumn = 'address' | 'pdu' | 'devices';

export function ReferenceMatrix() {
  const [hiddenColumns, setHiddenColumns] = useState<Record<StudyColumn, boolean>>({
    address: false,
    pdu: false,
    devices: false,
  });
  const [revealedCells, setRevealedCells] = useState<Record<string, boolean>>({});

  function toggleColumn(col: StudyColumn) {
    setHiddenColumns((prev) => ({ ...prev, [col]: !prev[col] }));
    setRevealedCells({});
  }

  function toggleCell(key: string) {
    setRevealedCells((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <section aria-label="OSI Layer Reference & Recall Matrix" className="space-y-6">
      {/* Header + Active Recall Toggles */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">
            7-Layer Reference &amp; Active Recall Sheet
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Review every layer’s Address Type, Data Name (PDU), and Devices, or hide columns to
            quiz yourself before returning to the Matching Lab.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-slate-500">Study mask:</span>
          {(
            [
              { id: 'address', label: 'Address Type' },
              { id: 'pdu', label: 'Name of Data' },
              { id: 'devices', label: 'Devices' },
            ] as const
          ).map((col) => {
            const masked = hiddenColumns[col.id];
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => toggleColumn(col.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                  masked
                    ? 'border-sky-500 bg-sky-50 text-sky-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {masked ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {masked ? `Reveal ${col.label}` : `Hide ${col.label}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reference Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold text-slate-600">
              <th className="px-4 py-3.5 w-44">Layer</th>
              <th className="px-4 py-3.5">Address Type</th>
              <th className="px-4 py-3.5 w-48">Name of Data (PDU)</th>
              <th className="px-4 py-3.5">Devices</th>
              <th className="px-4 py-3.5">Key Protocols</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {OSI_LAYERS.map((layer) => {
              const addrMasked = hiddenColumns.address && !revealedCells[`${layer.layerNumber}-address`];
              const pduMasked = hiddenColumns.pdu && !revealedCells[`${layer.layerNumber}-pdu`];
              const devMasked = hiddenColumns.devices && !revealedCells[`${layer.layerNumber}-devices`];

              return (
                <tr key={layer.layerNumber} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3.5 align-top">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-semibold ${layer.accentBg} ${layer.accentText} ${layer.accentBorder}`}
                      >
                        L{layer.layerNumber}
                      </span>
                      <div>
                        <div className="font-display text-sm font-semibold text-slate-900">
                          {layer.name}
                        </div>
                        <div className="text-[11px] text-slate-500">{layer.group}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 align-top">
                    {addrMasked ? (
                      <button
                        type="button"
                        onClick={() => toggleCell(`${layer.layerNumber}-address`)}
                        className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:border-sky-400 hover:text-sky-800"
                      >
                        Click to reveal address
                      </button>
                    ) : (
                      <div>
                        <div className="font-semibold text-slate-900">{layer.addressType}</div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-500">
                          {layer.addressExample}
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3.5 align-top">
                    {pduMasked ? (
                      <button
                        type="button"
                        onClick={() => toggleCell(`${layer.layerNumber}-pdu`)}
                        className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:border-sky-400 hover:text-sky-800"
                      >
                        Click to reveal PDU
                      </button>
                    ) : (
                      <div>
                        <div className="font-mono font-semibold text-slate-900">
                          {layer.pduDisplay}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500">{layer.pduExample}</div>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3.5 align-top">
                    {devMasked ? (
                      <button
                        type="button"
                        onClick={() => toggleCell(`${layer.layerNumber}-devices`)}
                        className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:border-sky-400 hover:text-sky-800"
                      >
                        Click to reveal devices
                      </button>
                    ) : (
                      <div>
                        <div className="font-semibold text-slate-900">{layer.devices}</div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          {layer.devicesDetail}
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3.5 align-top font-mono text-[11px] text-slate-600">
                    {layer.protocols.join(' · ')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mnemonic Helpers */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Top-Down Mnemonic · L7 → L1</div>
          <h3 className="mt-1 font-display text-base font-semibold text-slate-900">
            “All People Seem To Need Data Processing”
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Application · Presentation · Session · Transport · Network · Data Link · Physical
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Bottom-Up Mnemonic · L1 → L7</div>
          <h3 className="mt-1 font-display text-base font-semibold text-slate-900">
            “Please Do Not Throw Sausage Pizza Away”
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Physical · Data Link · Network · Transport · Session · Presentation · Application
          </p>
        </div>
      </div>
    </section>
  );
}
