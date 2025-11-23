import React from 'react';
import { ModuleCard, LCDDisplay } from './UIComponents';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { HistoryItem } from '../types';

interface DashboardProps {
  history: HistoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const totalGenerated = history.length;
  const excelCount = history.filter(h => h.platform === 'Excel').length;
  const sheetsCount = history.filter(h => h.platform === 'Google Sheets').length;
  
  const complexityData = [
    { name: 'BAS', value: history.filter(h => h.complexity === 'Basic').length, color: '#9ca3af' }, // slate-400
    { name: 'INT', value: history.filter(h => h.complexity === 'Intermediate').length, color: '#4b5563' }, // slate-600
    { name: 'ADV', value: history.filter(h => h.complexity === 'Advanced').length, color: '#FF4F00' }, // Orange
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-synth-bg border-2 border-synth-dark p-2 font-mono text-xs shadow-hard">
          <p className="font-bold mb-1 underline">{label}</p>
          <p>COUNT: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 mt-8 mb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TOTAL COUNTER */}
          <ModuleCard label="TOTAL_OPS">
             <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-full border-4 border-slate-300 flex items-center justify-center bg-white shadow-inset-hard">
                    <div className="w-1 h-8 bg-slate-300 rotate-45"></div>
                </div>
                <LCDDisplay className="w-32 text-center text-2xl tracking-widest">
                    {totalGenerated.toString().padStart(4, '0')}
                </LCDDisplay>
             </div>
          </ModuleCard>

          {/* PLATFORM SPLIT */}
          <ModuleCard label="PLATFORM_DIST">
              <div className="flex items-center gap-4 h-full justify-center">
                  <div className="text-center">
                      <div className="text-xs font-mono font-bold mb-1">XLS</div>
                      <div className="bg-white border-2 border-slate-400 px-3 py-1 font-mono font-bold shadow-inset-hard">
                          {excelCount}
                      </div>
                  </div>
                  <div className="h-full w-[2px] bg-slate-300"></div>
                  <div className="text-center">
                      <div className="text-xs font-mono font-bold mb-1">G-SHT</div>
                      <div className="bg-white border-2 border-slate-400 px-3 py-1 font-mono font-bold shadow-inset-hard">
                          {sheetsCount}
                      </div>
                  </div>
              </div>
          </ModuleCard>

          {/* GRAPH */}
          <ModuleCard label="COMPLEXITY_METRICS" className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complexityData} margin={{ top: 20, right: 0, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="#d1d5db" vertical={false} strokeDasharray="2 2" />
                    <XAxis dataKey="name" tick={{fontFamily: 'Roboto Mono', fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                    <Bar dataKey="value">
                        {complexityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#333" strokeWidth={2} />
                        ))}
                    </Bar>
                </BarChart>
              </ResponsiveContainer>
          </ModuleCard>
      </div>
    </div>
  );
};

export default Dashboard;
