import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Plus, 
  CheckSquare, 
  Clock, 
  ArrowUpRight, 
  MoreHorizontal,
  ChevronRight,
  TrendingDown,
  Activity,
  Zap,
  Target
} from 'lucide-react';

const quotients = [
  { id: 'QTN-4421', customer: 'Mehra Builders', amount: '₹12,45,000', stage: 'Sent', days: '2d ago', status: 'Follow-up Due', checklist: '80%' },
  { id: 'QTN-4430', customer: 'Skyline Pvt. Ltd.', amount: '₹4,50,000', stage: 'Draft', days: '1h ago', status: 'Checking', checklist: '40%' },
  { id: 'QTN-4410', customer: 'Rishi Construction', amount: '₹1,20,000', stage: 'Sent', days: 'Yesterday', status: 'Nudge Pending', checklist: '100%' },
];

const QuotationManager = () => {
  return (
    <div className="p-8 space-y-12 animate-fade-in">
       {/* Global Title */}
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sales & Quotation</h1>
          <p className="text-slate-500 font-medium tracking-tight">Quotation Prep & Conversion Tracking (UC-13)</p>
        </div>
        <div className="flex gap-4">
           <button className="btn-glass flex items-center gap-2">
              <Search className="w-4 h-4" /> Filter Quotes
           </button>
           <button className="btn-premium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Inquiry
           </button>
        </div>
      </div>

      {/* Conversion Board Header */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <motion.div whileHover={{ y: -5 }} className="premium-card p-6 bg-white border-none shadow-xl shadow-slate-100 flex flex-col justify-between h-[200px] group transition-all">
            <div className="flex justify-between">
               <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Activity className="w-6 h-6" />
               </div>
               <div className="text-xs font-black text-slate-400 tracking-widest uppercase">Response TAT</div>
            </div>
            <div className="mt-4">
               <h3 className="text-3xl font-black text-slate-800 tracking-tight">2.1 Hours</h3>
               <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase">12% Faster than Last Week</p>
            </div>
         </motion.div>

         <motion.div whileHover={{ y: -5 }} className="premium-card p-6 bg-white border-none shadow-xl shadow-slate-100 flex flex-col justify-between h-[200px] group transition-all">
            <div className="flex justify-between">
               <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Zap className="w-6 h-6" />
               </div>
               <div className="text-xs font-black text-slate-400 tracking-widest uppercase">Sent Quotes</div>
            </div>
            <div className="mt-4">
               <h3 className="text-3xl font-black text-slate-800 tracking-tight">24 Quotes</h3>
               <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">₹42.8L in Value</p>
            </div>
         </motion.div>

         <motion.div whileHover={{ y: -5 }} className="premium-card p-6 bg-indigo-900 border-none shadow-xl shadow-indigo-100 flex flex-col justify-between h-[200px] group transition-all text-white">
            <div className="flex justify-between">
               <div className="p-3 rounded-2xl bg-white/10 text-white">
                  <Target className="w-6 h-6" />
               </div>
               <div className="text-xs font-black text-indigo-300 tracking-widest uppercase">Conversion</div>
            </div>
            <div className="mt-4">
               <h3 className="text-3xl font-black tracking-tight text-white">18.2%</h3>
               <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-2 border border-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: '18.2%' }} transition={{ duration: 1.5 }} className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
               </div>
            </div>
         </motion.div>

         {/* Won-Lost Card */}
         <div className="premium-card p-6 border-l-4 border-emerald-500 flex flex-col justify-between h-[200px]">
            <div className="text-3xl font-black text-emerald-600">Won: ₹18L</div>
            <div className="h-[1px] w-full bg-slate-50" />
            <div className="text-lg font-bold text-rose-400">Lost: ₹4.2L</div>
         </div>
      </div>

      {/* Main Quotation List */}
      <div className="premium-card overflow-hidden bg-white">
         <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
               <FileText className="w-5 h-5 text-indigo-500" /> Active Quotation Pipeline
            </h3>
         </div>
         
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Customer / Ref</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Quote Value</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Stage</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Checklist</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {quotients.map((qtn, i) => (
                  <tr key={qtn.id} className="group hover:bg-slate-50/30 transition-all cursor-pointer">
                     <td className="px-8 py-6">
                        <div className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{qtn.customer}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{qtn.id} • Updated {qtn.days}</div>
                     </td>
                     <td className="px-8 py-6 font-black text-slate-800 text-lg">{qtn.amount}</td>
                     <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-max ${
                              qtn.stage === 'Sent' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-100 text-slate-500'
                           }`}>
                              {qtn.stage}
                           </span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{qtn.status}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6 max-w-[200px]">
                        <div className="flex items-center gap-3">
                           <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: qtn.checklist }} transition={{ duration: 1 }} className={`h-full ${parseInt(qtn.checklist) >= 80 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                           </div>
                           <span className="text-[10px] font-black text-slate-800 uppercase leading-none">{qtn.checklist}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <button className="p-3 rounded-2xl bg-slate-50 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all shadow-xl shadow-slate-100">
                           <ChevronRight className="w-5 h-5" />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Checklist Reminder */}
      <div className="premium-card p-10 bg-gradient-to-br from-indigo-950 to-indigo-900 border-none flex flex-wrap lg:flex-nowrap items-center gap-12 relative overflow-hidden text-white min-h-[300px]">
         <div className="relative z-10 space-y-6 max-w-lg">
            <div className="p-4 rounded-[28px] bg-white/10 backdrop-blur-xl w-16 h-16 flex items-center justify-center text-indigo-300 shadow-2xl">
               <CheckSquare className="w-8 h-8" />
            </div>
            <h3 className="text-4xl font-black tracking-tight leading-none">Quotation <br />Completeness AI</h3>
            <p className="text-indigo-200 text-base font-medium leading-relaxed">
               Pucho AI detects that **4 Drafts** are missing the HSN-level tax mapping. Complete them now to avoid GSTR-1 validation errors later.
            </p>
            <button className="btn-premium bg-white text-indigo-900 shadow-2xl shadow-indigo-950 mt-4 px-12 h-14">Fix All Inaccuracies</button>
         </div>
         {/* Decorative Element */}
         <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
            className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10 blur-[100px] bg-indigo-400 rounded-full -translate-y-1/2 translate-x-1/2" 
         />
      </div>
    </div>
  );
};

export default QuotationManager;
