import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeftRight, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Download,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const reconData = [
  { vendor: 'Tata Steel Ltd', gst: '09AAACT1234F1Z5', tallyVal: '₹1,50,000', portalVal: '₹1,50,000', status: 'Matched', diff: '₹0' },
  { vendor: 'JSW Infra', gst: '27AABCM5678D2Z1', tallyVal: '₹85,000', portalVal: '₹0', status: 'Missing in 2B', diff: '₹85,000' },
  { vendor: 'Hindalco Indus', gst: '24AAACH9012E1Z9', tallyVal: '₹45,200', portalVal: '₹42,000', status: 'Mismatch', diff: '₹3,200' },
];

const TwoBReconcile = () => {
  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">GSTR-2B Reconciliation</h1>
          <p className="text-slate-500">Tally Purchase Register vs Govt. GST Portal (UC-8)</p>
        </div>
        <div className="flex gap-3">
           <button className="btn-secondary">Fetch from GST Portal</button>
           <button className="btn-pucho">Download Recon Report</button>
        </div>
      </div>

      {/* ITC Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-6 border-l-4 border-indigo-600">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Eligible ITC (Tally)</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">₹12,45,000</h3>
         </div>
         <div className="glass-card p-6 border-l-4 border-emerald-500">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ITC in GSTR-2B</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">₹11,60,000</h3>
         </div>
         <div className="glass-card p-6 border-l-4 border-rose-500 bg-rose-50/20">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Actionable Variance</p>
            <h3 className="text-2xl font-black text-rose-600 mt-2">₹85,000</h3>
            <p className="text-[10px] font-bold text-rose-400 mt-1 flex items-center gap-1 uppercase">
               <AlertCircle className="w-3 h-3" /> Potential ITC Loss
            </p>
         </div>
      </div>

      {/* Recon Table */}
      <div className="glass-card overflow-hidden">
         <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div className="flex bg-white rounded-lg p-1 border border-slate-100 scale-90 origin-left">
               {['All', 'Matched', 'Mismatch', 'Missing'].map((f, i) => (
                  <button key={i} className={`px-4 py-1.5 text-xs font-bold rounded-md ${i===0 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{f}</button>
               ))}
            </div>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input type="text" placeholder="Search Vendor/GSTIN..." className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-100" />
            </div>
         </div>

         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Vendor / GSTIN</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Tally Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Portal Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {reconData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/20 transition-all text-sm group">
                     <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{row.vendor}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-tighter">{row.gst}</div>
                     </td>
                     <td className="px-6 py-4 font-bold text-slate-700">{row.tallyVal}</td>
                     <td className="px-6 py-4 font-bold text-indigo-600">{row.portalVal}</td>
                     <td className="px-6 py-4">
                        <div className="flex justify-center">
                           <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              row.status === 'Matched' ? 'bg-emerald-50 text-emerald-600' :
                              row.status === 'Mismatch' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                           }`}>
                              {row.status === 'Matched' ? <CheckCircle2 className="w-3 h-3" /> : 
                               row.status === 'Mismatch' ? <HelpCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {row.status}
                           </span>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all">
                           <ExternalLink className="w-4 h-4" />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Actionable Prompt */}
      <div className="glass-card p-8 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between border-l-4 border-l-indigo-600">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
               <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
               <h4 className="text-xl font-black text-slate-900 tracking-tight">Recover Lost ITC</h4>
               <p className="text-slate-500 text-sm">Pucho AI found 12 vendors who haven't filed their returns. Automatically nudge them over WhatsApp?</p>
            </div>
         </div>
         <button className="btn-pucho shadow-indigo-200">Yes, Nudge Vendors</button>
      </div>
    </div>
  );
};

export default TwoBReconcile;
