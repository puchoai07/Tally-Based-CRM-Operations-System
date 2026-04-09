import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  AlertTriangle, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  Package, 
  Zap, 
  ArrowRight,
  UserSquare2
} from 'lucide-react';

const materialShortfallData = [
  { item: 'MS Pipe 20mm', required: '20 Units', available: '05 Units', shortfall: '15 Units', procurement: 'PO-7721', status: 'PO Raised', eta: 'Tomorrow', orderId: 'ORD-7721' },
  { item: 'Cement (ACC)', required: '200 Bags', available: '50 Bags', shortfall: '150 Bags', procurement: 'PO-7725', status: 'In Transit', eta: 'In 2 days', orderId: 'ORD-7725' },
  { item: 'GI Sheets', required: '15 Units', available: '18 Units', shortfall: '0', procurement: '-', status: 'Stock Ready', eta: 'Ready', orderId: 'ORD-7730' },
];

const MaterialPlanning = () => {
  return (
    <div className="p-8 space-y-8 animate-fade-in">
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Material Planning</h1>
          <p className="text-slate-500 font-medium tracking-tight uppercase tracking-widest text-[10px] font-bold">Stock Availability vs Sales Order Requirements (UC-11)</p>
        </div>
        <div className="flex gap-3">
           <button className="btn-secondary">Check Live Stock</button>
           <button className="btn-pucho">Create Purchase Tasks</button>
        </div>
      </div>

      {/* Planning Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Blocked Orders', val: '08', icon: Box, color: 'rose' },
           { label: 'Material Ready', val: '12', icon: CheckCircle2, color: 'emerald' },
           { label: 'Pending Purchase', val: '05', icon: ShoppingCart, color: 'amber' },
           { label: 'GRN Scheduled', val: '03', icon: Package, color: 'indigo' },
         ].map((stat, i) => (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               key={i} 
               className={`glass-card p-6 border-l-4 border-l-${stat.color}-500 transition-all hover:scale-105 cursor-pointer bg-white relative overflow-hidden`}
            >
               <div className="flex justify-between relative z-10">
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</h4>
                    <p className="text-3xl font-black text-slate-800 mt-1">{stat.val}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
               </div>
               <stat.icon className="absolute -bottom-8 -right-8 w-32 h-32 text-slate-900/5 rotate-12" />
            </motion.div>
         ))}
      </div>

      {/* Main Material Workbench Table */}
      <div className="glass-card overflow-hidden">
         <div className="p-6 border-b border-slate-50 bg-slate-50/20">
            <h3 className="font-black text-slate-800 text-lg">Material Shortfall Tracker</h3>
         </div>
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/30">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Item Name</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-center">Stock Check</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Shortfall</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Procurement Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {materialShortfallData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/10 group transition-all">
                     <td className="px-6 py-6">
                        <div className="font-black text-slate-800 text-sm">{row.item}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Related Order: {row.orderId}</div>
                     </td>
                     <td className="px-6 py-6 border-x border-slate-50/50">
                        <div className="flex flex-col items-center gap-1.5">
                           <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex max-w-[120px]">
                              <div className={`h-full bg-emerald-500`} style={{ width: `${(parseInt(row.available)/parseInt(row.required))*100}%` }}></div>
                           </div>
                           <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                              {row.available} / {row.required} Available
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-6">
                        <div className={`font-black text-lg ${row.shortfall === '0' ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {row.shortfall === '0' ? 'Ready' : `-${row.shortfall}`}
                        </div>
                     </td>
                     <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                           <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              row.status === 'Stock Ready' ? 'bg-emerald-50 text-emerald-600' : 
                              row.status === 'In Transit' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 
                              'bg-amber-50 text-amber-600'
                           }`}>
                              {row.status}
                           </span>
                           {row.eta !== 'Ready' && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ETA: {row.eta}</span>}
                        </div>
                     </td>
                     <td className="px-6 py-6 text-right">
                        <button className="p-2.5 rounded-xl bg-slate-50 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100">
                           <ArrowRight className="w-4 h-4" />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Critical Path Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass-card p-10 bg-indigo-900 text-white border-none flex flex-col justify-between overflow-hidden relative min-h-[300px]">
            <div className="relative z-10 flex flex-col items-start gap-4 h-full">
               <div className="w-16 h-16 rounded-[25px] bg-white/10 flex items-center justify-center text-indigo-300 backdrop-blur-md mb-2">
                  <UserSquare2 className="w-8 h-8" />
               </div>
               <h3 className="text-3xl font-black tracking-tight leading-tight">Assign to <br />Purchase Team?</h3>
               <p className="text-indigo-200 text-sm max-w-sm">Pucho AI can auto-create purchase orders in Tally for all shortfall items based on top vendor pricing.</p>
               <button className="mt-4 bg-white text-indigo-900 font-black px-10 py-3 rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest shadow-xl shadow-indigo-950">Auto-Generate PO</button>
            </div>
            <Zap className="absolute top-0 right-0 w-[400px] h-[400px] text-white/5 -translate-y-1/2 translate-x-1/2" />
         </div>

         <div className="glass-card p-8 border-l-4 border-l-rose-500 bg-rose-50/20 space-y-6">
            <h4 className="font-black text-rose-800 text-lg flex items-center gap-2">
               <AlertTriangle className="w-6 h-6" /> Material Delay Alerts
            </h4>
            <div className="space-y-4">
               {[
                 { msg: 'Supplier "Tata Steel" delayed PO-7721 GRN', time: 'Delayed 24h' },
                 { msg: 'Critical shortfall in ORD-7690 Items', time: 'Urgent Action' }
               ].map((m, i) => (
                 <div key={i} className="flex justify-between items-center bg-white p-5 rounded-2xl border border-rose-100 shadow-sm shadow-rose-50">
                    <p className="text-sm font-bold text-slate-800">{m.msg}</p>
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">{m.time}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default MaterialPlanning;
