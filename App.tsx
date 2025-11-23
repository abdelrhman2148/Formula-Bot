import React, { useState, useEffect } from 'react';
import { HistoryItem, User, UserTier } from './types';
import FormulaGenerator from './components/FormulaGenerator';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import { SynthButton } from './components/UIComponents';
import { Terminal, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { getCurrentUser, getHistory, addToHistory, logout } from './services/mockBackend';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'upgrade' }>({ open: false, mode: 'login' });

  useEffect(() => {
    const storedUser = getCurrentUser();
    setUser(storedUser);
    setHistory(getHistory());
  }, []);

  const handleSuccess = (newItem: HistoryItem) => {
    const updated = addToHistory(newItem);
    setHistory(updated);
  };

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setAuthModal({ open: false, mode: 'login' });
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <div className="min-h-screen pb-12">
      
      {/* --- HEADER: CONTROL STRIP --- */}
      <header className="sticky top-0 z-40 bg-synth-plastic border-b-2 border-b-[#999] shadow-hard-sm">
        <div className="w-full max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
           
           {/* Branding */}
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-synth-dark flex items-center justify-center text-white shadow-plastic">
                 <Terminal size={20} />
              </div>
              <div>
                  <h1 className="font-sans font-bold text-xl leading-none uppercase tracking-tighter">Formula<span className="text-synth-orange">Bot</span></h1>
                  <p className="font-mono text-[10px] text-slate-500 leading-none mt-1">UNIT: PRO_EDITION_V2</p>
              </div>
           </div>

           {/* Controls */}
           <div className="flex items-center gap-4">
              {user ? (
                 <>
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="font-mono text-xs font-bold uppercase">{user.tier} Account</span>
                        <span className="font-mono text-[10px] text-slate-500">{user.email}</span>
                    </div>

                    {user.tier !== UserTier.PREMIUM && (
                        <SynthButton variant="primary" className="py-2 px-4 text-xs" onClick={() => setAuthModal({ open: true, mode: 'upgrade' })}>
                            UPGRADE
                        </SynthButton>
                    )}

                    <div className="h-8 w-[2px] bg-slate-300 mx-2"></div>

                    <button onClick={handleLogout} className="p-2 bg-[#e0e0e0] hover:bg-[#d0d0d0] border-2 border-transparent active:border-t-slate-400 active:border-l-slate-400 active:border-b-white active:border-r-white active:bg-[#ccc] transition-all rounded-sm" title="EJECT">
                        <LogOut size={18} className="text-slate-600" />
                    </button>
                 </>
              ) : (
                  <div className="flex gap-4">
                      <button onClick={() => setAuthModal({ open: true, mode: 'login' })} className="font-mono text-xs font-bold underline hover:text-synth-orange">
                          LOGIN
                      </button>
                      <SynthButton variant="secondary" className="py-2 px-4 text-xs" onClick={() => setAuthModal({ open: true, mode: 'login' })}>
                          INITIALIZE
                      </SynthButton>
                  </div>
              )}
           </div>
        </div>
      </header>

      {/* --- MAIN INTERFACE --- */}
      <main className="mt-8 md:mt-12 px-4">
        
        {/* Title Block */}
        <div className="text-center mb-10 space-y-2">
            <h2 className="text-3xl md:text-5xl font-black uppercase text-synth-dark tracking-tight">
                Logic <span className="text-slate-400">///</span> Synthesis
            </h2>
            <p className="font-mono text-sm text-slate-500 max-w-lg mx-auto">
                INPUT NATURAL LANGUAGE. OUTPUT EXECUTABLE FORMULA.
            </p>
        </div>

        <FormulaGenerator 
          user={user}
          onSuccess={handleSuccess} 
          onUpgradeClick={() => setAuthModal({ open: true, mode: 'upgrade' })}
          onLoginClick={() => setAuthModal({ open: true, mode: 'login' })}
        />

        {history.length > 0 && <Dashboard history={history} />}

      </main>

      {/* --- FOOTER: DEVICE SPECS --- */}
      <footer className="w-full max-w-5xl mx-auto px-4 mt-20 border-t-2 border-slate-300 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 font-mono text-xs gap-4">
          <div>
              <span>SYSTEM STATUS: </span>
              <span className="text-green-600 font-bold">ONLINE</span>
          </div>
          <div className="flex gap-4">
              <span>MODEL: GEMINI-2.5-FLASH</span>
              <span>•</span>
              <span>BUILD: 2024.10.15</span>
          </div>
          <div>
             © EXCEL_BOT_CORP
          </div>
      </footer>
      
      {authModal.open && (
        <AuthModal 
          mode={authModal.mode} 
          onClose={() => setAuthModal({ ...authModal, open: false })}
          onSuccess={handleAuthSuccess}
          currentUserId={user?.id}
        />
      )}

    </div>
  );
};

export default App;
