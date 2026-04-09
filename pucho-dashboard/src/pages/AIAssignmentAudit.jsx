import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
  MoreVertical,
  Cpu,
  BrainCircuit,
  MessageSquareShare
} from 'lucide-react';

const auditLogs = [
  { id: 'LOG-7721', task: 'Follow-up: Vardhman Ind.', assignedTo: 'Rohan (Sales)', reason: '92% Skill Match • Relationship History', time: '12m ago', confidence: 'High' },
  { id: 'LOG-7725', task: 'Dispatch Check: ORD-1025', assignedTo: 'Suresh (Logistics)', reason: 'Available Location (Zone-A)', time: '45m ago', confidence: 'Manual Overridden' },
  { id: 'LOG-7730', task: 'Bank Recon: HDFC Statement', assignedTo: 'Deepa (Accounts)', reason: 'Previous Recon Success Rate (98%)', time: '1h ago', confidence: 'Ultra High' },
];

const AIAssignmentAudit = () => {
  return (
    <div className="p-8 space-y-12 animate-fade-in">
       {/* Global Title */}
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Assignment Audit</h1>
          <p className="text-slate-500 font-medium tracking-tight">Intelligence Layer Oversight & Task Routing Logs (UC-5)</p>
        </div>
        <div className="flex gap-4">
           <button className="btn-glass flex items-center gap-2">
              <History className="w-4 h-4" /> View full History
           </button>
           <button className="btn-premium flex items-center gap-2 shadow-xl shadow-indigo-100">
              <Cpu className="w-4 h-4" /> System Health
           </button>
        </div>
      </div>

      {/* Logic Card */}
      <div className="premium-card p-12 bg-slate-900 text-white border-none flex flex-wrap lg:flex-nowrap items-center gap-16 relative overflow-hidden min-h-[350px]">
         <div className="relative z-10 space-y-10 max-w-2xl">
            <div className="flex items-center gap-4">
               <div className="p-4 rounded-[28px] bg-indigo-600 shadow-2xl shadow-indigo-500/40 text-white">
                  <BrainCircuit className="w-10 h-10" />
               </div>
               <h3 className="text-4xl font-black tracking-tight leading-none">Assignment <br />Reasoning Engine</h3>
            </div>
            <div className="flex gap-12 font-black uppercase tracking-widest text-[10px] text-indigo-300">
               <div>
                  <p className="text-white text-3xl">94.2%</p>
                  <p className="mt-2">Automation Rate</p>
               </div>
               <div className="w-[1px] h-12 bg-white/10" />
               <div>
                  <p className="text-white text-3xl">0.8s</p>
                  <p className="mt-2">Decision TAT</p>
               </div>
            </div>
            <p className="text-indigo-200 text-lg font-medium leading-relaxed opacity-80">
               Every task in the dashboard is automatically routed to the best-matching employee based on **Legacy Skill Tags**, **Current Workload**, and **SLA Success Rate**.
            </p>
         </div>
         {/* Floating Elements */}
         <div className="hidden lg:flex relative z-10 flex-1 justify-center items-center">
            <motion.div 
               animate={{ y: [0, -20, 0] }}
               transition={{ repeat: Infinity, duration: 6 }}
               className="w-80 h-80 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-[100px] opacity-20" 
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-64 h-64 border border-white/5 rounded-full flex items-center justify-center animate-spin-slow">
                  <div className="w-48 h-48 border border-white/10 rounded-full flex items-center justify-center">
                     <div className="w-32 h-32 border border-white/20 rounded-full"/>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Main Audit List */}
      <div className="premium-card overflow-hidden bg-white">
         <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3 uppercase tracking-widest text-xs opacity-50">
               <MessageSquareShare className="w-5 h-5 text-indigo-500" /> Decision Logs
            </h3>
         </div>
         
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Decision Detail</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none text-center">Assigned To</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Logic/Reasoning</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Confidence</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {auditLogs.map((log, i) => (
                  <tr key={log.id} className="group hover:bg-slate-50/30 transition-all cursor-pointer">
                     <td className="px-8 py-6">
                        <div className="font-black text-slate-800 text-lg uppercase tracking-tight">{log.task}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{log.id} • {log.time}</div>
                     </td>
                     <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center">
                           <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs mb-1 border border-indigo-100">{log.assignedTo.charAt(0)}</div>
                           <span className="text-xs font-black text-slate-800">{log.assignedTo}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-600 leading-tight max-w-[250px]">{log.reason}</p>
                     </td>
                     <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                           log.confidence.includes('High') ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}>
                           {log.confidence}
                        </span>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <button className="p-3 rounded-2xl bg-slate-50 text-slate-100 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all shadow-xl shadow-slate-100">
                           <MoreVertical className="w-5 h-5 text-slate-300" />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* System Override Warning */}
      <div className="p-10 premium-card bg-rose-50 border-rose-100 flex items-center justify-between">
         <div className="flex items-center gap-10">
            <div className="p-6 rounded-[35px] bg-white shadow-2xl shadow-rose-100 text-rose-500">
               <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Manual Override Detection</h3>
               <p className="text-slate-500 text-sm mt-1 max-w-sm">Pucho AI found **02 assignments** were manually changed by Admin. It might impact next week's automation accuracy.</p>
            </div>
         </div>
         <button className="btn-premium bg-rose-500 shadow-rose-100 h-14 px-12">Review Overrides</button>
      </div>

    </div>
  );
};

export default AIAssignmentAudit;
