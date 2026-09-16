import React from 'react';
import { Calculator, CheckCircle, HelpCircle, FileCheck } from 'lucide-react';
import { DeterministicCalculation } from '../types';

interface FormulaCardProps {
  calculation: DeterministicCalculation;
  onInspectEvidence?: (evidenceId: string) => void;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({ calculation, onInspectEvidence }) => {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-mono">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{calculation.formulaName}</h4>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              DETERMINISTIC CODE EXECUTION
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          NO LLM ARITHMETIC
        </span>
      </div>

      {/* Formula Expression */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 flex items-center justify-between mb-3">
        <span className="text-slate-500 text-[11px]">Formula:</span>
        <span className="font-semibold text-slate-900">{calculation.formulaExpression}</span>
      </div>

      {/* Inputs Breakdown */}
      <div className="space-y-1.5 mb-3">
        <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
          Verified Inputs (Ground Truth):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {Object.entries(calculation.inputs).map(([key, rawInput]) => {
            const input = rawInput as { label: string; value: number; unit: string; evidenceId?: string };
            return (
              <div key={key} className="p-2 rounded bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-slate-700 font-medium text-[11px]">{input.label}</div>
                  {input.evidenceId && (
                    <button
                      onClick={() => onInspectEvidence && onInspectEvidence(input.evidenceId!)}
                      className="text-[10px] text-blue-600 hover:text-blue-800 underline flex items-center gap-1 mt-0.5"
                    >
                      <FileCheck className="w-2.5 h-2.5" />
                      Source Evidence
                    </button>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900">{input.value}</span>{' '}
                  <span className="text-[10px] text-slate-500">{input.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Result Output */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">Derived Output:</span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-lg font-extrabold text-blue-700">
            {calculation.output > 0 && calculation.formulaName.includes('Deviation') ? '+' : ''}
            {calculation.output}
          </span>
          <span className="text-xs font-semibold text-slate-600">{calculation.unit}</span>
        </div>
      </div>

      {calculation.notes && (
        <div className="mt-2 text-[11px] text-slate-500 italic bg-blue-50/50 px-2 py-1 rounded border border-blue-100">
          {calculation.notes}
        </div>
      )}
    </div>
  );
};
