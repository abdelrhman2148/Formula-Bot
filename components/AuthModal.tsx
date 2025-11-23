import React, { useState } from 'react';
import { ModuleCard, SynthButton, InsetInput } from './UIComponents';
import { X, Lock, Key } from 'lucide-react';
import { login, upgradeToPremium } from '../services/mockBackend';
import { User } from '../types';

interface AuthModalProps {
  mode: 'login' | 'upgrade';
  onClose: () => void;
  onSuccess: (user: User) => void;
  currentUserId?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode: initialMode, onClose, onSuccess, currentUserId }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'upgrade'>(initialMode);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email);
      onSuccess(user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const user = await upgradeToPremium(currentUserId);
      onSuccess(user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000aa] backdrop-grayscale">
      <div className="w-full max-w-md bg-synth-plastic p-2 shadow-hard border-2 border-white">
        
        {/* Header Strip */}
        <div className="bg-synth-dark text-white p-3 flex justify-between items-center mb-4">
            <h2 className="font-mono font-bold uppercase tracking-widest flex items-center gap-2">
                {mode === 'upgrade' ? <Lock size={16} /> : <Key size={16} />}
                {mode === 'upgrade' ? 'SYSTEM_UPGRADE' : 'ACCESS_CONTROL'}
            </h2>
            <button onClick={onClose} className="hover:text-synth-orange transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-4 bg-[#f4f4f4] border-2 border-t-slate-400 border-l-slate-400 border-b-white border-r-white">
            
            {mode === 'upgrade' ? (
              <div className="space-y-6 text-center">
                 <div className="border-2 border-synth-orange bg-orange-50 p-4 shadow-hard-sm">
                    <h3 className="text-xl font-bold uppercase text-synth-orange mb-2">PREMIUM_TIER</h3>
                    <p className="font-mono text-sm text-slate-600 mb-4">UNLOCK_FULL_COMPUTE_POWER</p>
                    <ul className="text-left font-mono text-xs space-y-2 pl-4 list-disc text-slate-700">
                        <li>UNLIMITED_GENERATIONS</li>
                        <li>PRIORITY_THREADING</li>
                        <li>ADVANCED_MODELS</li>
                    </ul>
                 </div>
                 
                 <div className="space-y-2">
                     <p className="text-xs font-mono text-slate-500">PAYMENT_GATEWAY: STRIPE_MOCK</p>
                     <SynthButton onClick={handleUpgrade} isLoading={loading} variant="primary" className="w-full">
                        CONFIRM_TRANSACTION ($19)
                     </SynthButton>
                 </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-500 uppercase">IDENTIFIER_EMAIL</label>
                        <InsetInput 
                            type="email" 
                            required 
                            placeholder="USER@DOMAIN.COM" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="uppercase"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-500 uppercase">ACCESS_KEY</label>
                        <InsetInput 
                            type="password" 
                            required 
                            placeholder="********" 
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <SynthButton type="submit" isLoading={loading} className="w-full">
                        {mode === 'login' ? 'INITIATE_SESSION' : 'REGISTER_USER'}
                    </SynthButton>
                </div>

                <div className="text-center">
                    <button 
                        type="button"
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-xs font-mono underline text-slate-500 hover:text-synth-orange"
                    >
                        {mode === 'login' ? 'CREATE_NEW_RECORD' : 'EXISTING_USER_LOGIN'}
                    </button>
                </div>
              </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
