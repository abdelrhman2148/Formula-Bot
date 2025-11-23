import React from 'react';
import { Loader2 } from 'lucide-react';

interface ModuleCardProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ children, className = '', label }) => {
  return (
    <div className={`relative bg-synth-plastic p-1 ${className}`}>
        {/* Outer Bevel */}
        <div className="absolute inset-0 border-t-2 border-l-2 border-white border-b-2 border-r-2 border-slate-400 pointer-events-none"></div>
        
        {/* Content Container */}
        <div className="h-full w-full bg-[#f4f4f4] p-4 relative z-10">
            {label && (
                <div className="absolute -top-3 left-4 bg-synth-bg px-2 border border-slate-400 text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                    {label}
                </div>
            )}
            {children}
        </div>
    </div>
  );
};

interface SynthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
}

export const SynthButton: React.FC<SynthButtonProps> = ({ 
  children, 
  isLoading, 
  variant = 'primary', 
  className = '',
  icon,
  ...props 
}) => {
  const baseStyle = "relative inline-flex items-center justify-center px-6 py-3 font-mono font-bold text-sm uppercase tracking-wide transition-all active:scale-[0.98] active:shadow-plastic-active border-none outline-none disabled:opacity-60 disabled:cursor-not-allowed";
  
  const styles = {
    primary: "bg-synth-orange text-white shadow-plastic active:bg-orange-600",
    secondary: "bg-synth-dark text-white shadow-plastic active:bg-black",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-200 border border-transparent",
    danger: "bg-red-600 text-white shadow-plastic active:bg-red-700"
  };

  return (
    <button 
      className={`${baseStyle} ${styles[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
         <div className="flex items-center gap-2">
           <Loader2 className="w-4 h-4 animate-spin" />
           <span>PROC...</span>
         </div>
      ) : (
        <div className="flex items-center gap-2">
          {icon}
          {children}
        </div>
      )}
    </button>
  );
};

export const InsetInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <div className="relative">
      <input 
        {...props}
        className={`w-full bg-[#e8e8e8] text-synth-dark font-mono px-4 py-3 border-none shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-1px_-1px_0px_#fff] focus:outline-none focus:bg-[#e0e0e0] placeholder-slate-400 transition-colors ${props.className}`}
      />
      {/* Decorative Screw Head */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-slate-400 bg-slate-300 flex items-center justify-center opacity-50 pointer-events-none">
         <div className="w-full h-[1px] bg-slate-500 rotate-45"></div>
      </div>
  </div>
);

export const LCDDisplay: React.FC<{ children: React.ReactNode; className?: string; label?: string }> = ({ children, className = '', label }) => (
    <div className="flex flex-col gap-1 w-full">
        {label && <span className="text-[10px] uppercase font-bold text-slate-500 ml-1">{label}</span>}
        <div className={`bg-synth-lcd border-4 border-[#82aed9] shadow-screen p-4 font-mono text-synth-lcdText overflow-x-auto ${className}`}>
            <div className="opacity-90 mix-blend-multiply font-bold">
                {children}
            </div>
        </div>
    </div>
);
