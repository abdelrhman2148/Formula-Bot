import React, { useState, useCallback } from 'react';
import { Platform, GeneratorState, HistoryItem, User } from '../types';
import { generateFormulaFromAI } from '../services/geminiService';
import { checkRateLimit, incrementUsage } from '../services/mockBackend';
import { ModuleCard, SynthButton, LCDDisplay } from './UIComponents';
import { Copy, Check, AlertTriangle, Zap, Power } from 'lucide-react';

interface FormulaGeneratorProps {
  user: User | null;
  onSuccess: (item: HistoryItem) => void;
  onUpgradeClick: () => void;
  onLoginClick: () => void;
}

const FormulaGenerator: React.FC<FormulaGeneratorProps> = ({ user, onSuccess, onUpgradeClick, onLoginClick }) => {
  const [state, setState] = useState<GeneratorState>({
    prompt: '',
    platform: Platform.EXCEL,
    isLoading: false,
    result: null,
    error: null,
  });

  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!state.prompt.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, result: null }));

    try {
      await checkRateLimit(user);
      const result = await generateFormulaFromAI(state.prompt, state.platform);
      incrementUsage(user);
      
      setState(prev => ({ ...prev, isLoading: false, result }));
      
      onSuccess({
        ...result,
        id: crypto.randomUUID(),
        prompt: state.prompt,
        timestamp: Date.now()
      });

    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || "SYSTEM ERROR" 
      }));
    }
  };

  const handleCopy = useCallback(() => {
    if (state.result?.formula) {
      navigator.clipboard.writeText(state.result.formula);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [state.result]);

  const isRateLimitError = state.error?.includes("Limit reached");

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-4">
      
      {/* --- CONTROL MODULE (Left Col) --- */}
      <div className="md:col-span-4 flex flex-col gap-6">
        
        {/* Platform Switcher */}
        <ModuleCard label="MODE_SELECT" className="h-fit">
          <div className="flex flex-col gap-3">
             <label className={`cursor-pointer group flex items-center justify-between p-3 border-2 transition-all ${state.platform === Platform.EXCEL ? 'border-synth-orange bg-white' : 'border-transparent bg-slate-100 opacity-60'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 border-slate-400 ${state.platform === Platform.EXCEL ? 'bg-synth-orange' : 'bg-transparent'}`}></div>
                    <span className="font-bold">EXCEL_MODE</span>
                </div>
                <input 
                    type="radio" 
                    name="platform" 
                    className="hidden"
                    checked={state.platform === Platform.EXCEL} 
                    onChange={() => setState(prev => ({ ...prev, platform: Platform.EXCEL }))} 
                />
             </label>
             
             <label className={`cursor-pointer group flex items-center justify-between p-3 border-2 transition-all ${state.platform === Platform.GOOGLE_SHEETS ? 'border-green-600 bg-white' : 'border-transparent bg-slate-100 opacity-60'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 border-slate-400 ${state.platform === Platform.GOOGLE_SHEETS ? 'bg-green-600' : 'bg-transparent'}`}></div>
                    <span className="font-bold">SHEETS_MODE</span>
                </div>
                <input 
                    type="radio" 
                    name="platform" 
                    className="hidden"
                    checked={state.platform === Platform.GOOGLE_SHEETS} 
                    onChange={() => setState(prev => ({ ...prev, platform: Platform.GOOGLE_SHEETS }))} 
                />
             </label>
          </div>
        </ModuleCard>

        {/* Generate Button Module */}
        <ModuleCard className="flex flex-col gap-2 items-center justify-center py-8 bg-[#e0e0e0]">
            <SynthButton 
                onClick={handleGenerate} 
                isLoading={state.isLoading}
                disabled={!state.prompt}
                variant="primary"
                className="w-full text-lg py-6"
                icon={<Power size={20} />}
            >
                EXECUTE
            </SynthButton>
            <div className="flex gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${state.isLoading ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
                <div className={`w-2 h-2 rounded-full ${!state.isLoading && state.result ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            </div>
        </ModuleCard>
      </div>

      {/* --- INPUT/OUTPUT MODULE (Right Col) --- */}
      <div className="md:col-span-8 flex flex-col gap-6">
        
        {/* Input Area */}
        <ModuleCard label="INPUT_SEQUENCE">
            <textarea
              value={state.prompt}
              onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value.toUpperCase() }))}
              placeholder="ENTER LOGIC DESCRIPTION HERE..."
              className="w-full h-32 bg-[#e8e8e8] text-synth-dark font-mono p-4 border-none shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-1px_-1px_0px_#fff] focus:outline-none resize-none placeholder-slate-400 uppercase"
            />
        </ModuleCard>

        {/* Error Display */}
        {state.error && (
            <div className="bg-red-100 border-2 border-red-500 p-4 font-mono text-red-600 flex items-center justify-between shadow-hard-sm">
                <div className="flex items-center gap-3">
                    <AlertTriangle />
                    <span className="uppercase font-bold">{state.error}</span>
                </div>
                {isRateLimitError && (
                    <button onClick={!user ? onLoginClick : onUpgradeClick} className="underline hover:bg-red-200 px-2 py-1">
                        {!user ? 'LOGIN_REQUIRED' : 'UPGRADE_SYSTEM'}
                    </button>
                )}
            </div>
        )}

        {/* Output Display */}
        <ModuleCard label="OUTPUT_RESULT" className="min-h-[240px]">
            <div className="flex flex-col gap-6 h-full">
                <div className="flex justify-between items-end">
                    <span className="text-xs font-mono text-slate-500">
                        STATUS: {state.result ? `COMPLEXITY_${state.result.complexity.toUpperCase()}` : 'STANDBY'}
                    </span>
                    <button 
                        onClick={handleCopy}
                        disabled={!state.result}
                        className="bg-slate-200 hover:bg-white active:bg-slate-300 p-2 border-b-2 border-r-2 border-slate-400 border-t-2 border-l-2 border-white transition-all active:border-t-slate-400 active:border-l-slate-400 active:border-b-white active:border-r-white"
                        title="COPY_DATA"
                    >
                        {copied ? <Check className="text-green-600" size={16} /> : <Copy className="text-slate-600" size={16} />}
                    </button>
                </div>

                <LCDDisplay label="FORMULA_STRING" className="text-lg md:text-xl">
                    {state.result ? state.result.formula : "READY_FOR_INPUT..."}
                </LCDDisplay>

                {state.result && (
                     <div className="bg-white border-2 border-dashed border-slate-300 p-4 font-mono text-sm text-slate-600">
                        <span className="block text-xs font-bold text-slate-400 mb-2 uppercase">Analysis:</span>
                        {state.result.explanation}
                     </div>
                )}
            </div>
        </ModuleCard>

      </div>

    </div>
  );
};

export default FormulaGenerator;
