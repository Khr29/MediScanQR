import React from 'react';
import { ScanLine, ShieldCheck, ClipboardList, PackageCheck, History } from 'lucide-react';

const STEPS = [
  { key: 'scan', label: 'Scan', icon: ScanLine },
  { key: 'verify', label: 'Verify', icon: ShieldCheck },
  { key: 'review', label: 'Review', icon: ClipboardList },
  { key: 'dispense', label: 'Dispense', icon: PackageCheck },
  { key: 'record', label: 'Record', icon: History },
];

// Shows the pharmacist where they are in the scan -> verify -> review ->
// dispense -> record workflow, since that flow spans three separate pages.
const DispenseFlowSteps = ({ current }) => {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = idx < currentIndex;
        const active = idx === currentIndex;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                  active
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : done
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  active ? 'text-amber-600' : done ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 w-6 sm:w-10 rounded-full ${idx < currentIndex ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default DispenseFlowSteps;
