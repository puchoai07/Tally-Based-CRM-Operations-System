import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileSearch, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Database,
  Link,
  Plus
} from 'lucide-react';

const matchData = [
  { bankDate: '12 Apr', tallyDate: '11 Apr', narration: 'NEFT: Rohan Ent.', amount: '₹45,200', confidence: 100, status: 'Exact Match' },
  { bankDate: '13 Apr', tallyDate: '12 Apr', narration: 'CLG: Vardhman', amount: '₹12,000', confidence: 85, status: 'Probable' },
  { bankDate: '15 Apr', tallyDate: '-', narration: 'UPI: 9876543210', amount: '₹500', confidence: 0, status: 'No Match' },
];

const BankRecon = () => {
  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bank Reconciliation</h1>
          <p className="text-slate-500">Tally Ledger vs Bank Statement AI Matching (UC-6)</p>
        </div>
        <button className="btn-pucho flex items-center gap-2">
           <Upload className="w-4 h-4" /> Upload Statement
        </button>
      </div>

      {/* Upload & Sync Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-6 border-l-4 border-indigo-600">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tally Sync Status</p>
            <div className="flex items-center gap-3 mt-2">
               <Database className="w-5 h-5 text-indigo-600" />
               <span className="font-bold text-slate-800">Bank Ledger (HDFC)</span>
               <span className="ml-auto text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">15m ago</span>
            </div>
         </div>
         <div className="glass-card p-6 border-l-4 border-emerald-500">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Auto-Match Coverage</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">84% <span className="text-sm font-medium text-slate-400">Items Matched</span></h3>
         </div>
         <div className="glass-card p-6 border-l-4 border-rose-500">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Action Required</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">08 <span className="text-sm font-medium text-slate-400">Exceptions</span></h3>
         </div>
      </div>

      {/* Recon Interface */}
      <div className="glass-card overflow-hidden">
         <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">AI Matching Workbench</h3>
            <div className="flex gap-2 text-xs font-bold">
               <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Matched</span>
               <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full"><HelpCircle className="w-3 h-3" /> Review Required</span>
            </div>
         </div>
         
         <table className="w-full text-left">
            <thead>
               <tr className="border-b border-slate-50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Bank Entry</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-center">Match Confidence</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Tally Record</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {matchData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/20 transition-colors">
                     <td className="px-6 py-6">
                        <div className="text-xs font-bold text-slate-400">{row.bankDate}</div>
                        <div className="text-sm font-medium text-slate-700">{row.narration}</div>
                     </td>
                     <td className="px-6 py-6 border-x border-slate-50/50">
                        <div className="flex flex-col items-center gap-2">
                           <div className="text-[10px] font-black text-slate-400 uppercase">{row.confidence}%</div>
                           <div className={`h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden`}>
                              <div className={`h-full ${row.confidence > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${row.confidence}%` }}></div>
                           </div>
                           <div className={`text-[10px] font-bold ${row.confidence > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{row.status}</div>
                        </div>
                     </td>
                     <td className="px-6 py-6">
                        {row.tallyDate !== '-' ? (
                           <>
                              <div className="text-xs font-bold text-indigo-400">{row.tallyDate}</div>
                              <div className="text-sm font-bold text-slate-800">Tally Ledger: Same Amount</div>
                           </>
                        ) : (
                           <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl group hover:bg-indigo-600 hover:text-white transition-all">
                              <Plus className="w-3 h-3" /> Create Receipt
                           </button>
                        )}
                     </td>
                     <td className="px-6 py-6 font-black text-slate-800">{row.amount}</td>
                     <td className="px-6 py-6 text-right">
                        <button className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-slate-100">
                           <Link className="w-4 h-4" />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Exception Resolver Info */}
      <div className="p-6 rounded-[32px] bg-indigo-900 text-white flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
               <FileSearch className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
               <h4 className="text-xl font-bold tracking-tight">Need help with exceptions?</h4>
               <p className="text-indigo-300 text-sm">Pucho AI can suggest Tally entries based on narration semantics.</p>
            </div>
         </div>
         <button className="bg-white text-indigo-900 font-black px-8 py-3 rounded-2xl hover:bg-indigo-50 transition-colors uppercase text-xs tracking-widest">Ask AI Agent</button>
      </div>
    </div>
  );
};

export default BankRecon;
