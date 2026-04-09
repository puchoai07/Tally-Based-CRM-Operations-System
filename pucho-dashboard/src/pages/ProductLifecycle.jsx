import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  ShoppingCart, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  Package,
  Zap,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';

const products = [
  { item: 'MS Pipe 20mm', customer: 'Vardhman Ind.', lastOrdered: '12-Mar-2024', cycle: '45 Days', estDepletion: '28-Apr-2024', risk: 'High', status: 'Nudge Sent' },
  { item: 'Cement (ACC)', customer: 'Tata Projects', lastOrdered: '05-Apr-2024', cycle: '10 Days', estDepletion: '15-Apr-2024', risk: 'Critical', status: 'Pending Nudge' },
  { item: 'GI Sheets', customer: 'Rohan Ent.', lastOrdered: '01-Apr-2024', cycle: '30 Days', estDepletion: '01-May-2024', risk: 'Safe', status: 'Monitoring' },
];

const ProductLifecycle = () => {
  return (
    <div className="p-8 space-y-12 animate-fade-in">
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product Lifecycle</h1>
          <p className="text-slate-500 font-medium tracking-tight">Reorder Frequency & Depletion Tracking (UC-15)</p>
        </div>
        <div className="flex gap-4">
           <button className="btn-premium flex items-center gap-2">
              <Zap className="w-4 h-4" /> Run Depletion Scan
           </button>
        </div>
      </div>

      {/* Cycle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
           { label: 'Avg. Reorder Cycle', val: '22 Days', icon: History, color: 'indigo' },
           { label: 'At Depletion Risk', val: '14 Customers', icon: AlertCircle, color: 'rose' },
           { label: 'Successful Nudges', val: '42 Orders', icon: CheckCircle, color: 'emerald' },
           { label: 'Potential Pipe', val: '₹12.8L', icon: ShoppingCart, color: 'amber' },
         ].map((stat, i) => (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               key={i} 
               className={`premium-card p-6 border-l-4 border-l-${stat.color}-500 transition-all hover:scale-105 cursor-pointer bg-white relative overflow-hidden h-[180px] flex flex-col justify-between`}
            >
               <div className="flex justify-between relative z-10">
                  <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</div>
               </div>
               <div className="relative z-10">
                  <p className="text-3xl font-black text-slate-800 mt-1">{stat.val}</p>
               </div>
               <stat.icon className="absolute -bottom-10 -right-10 w-32 h-32 text-slate-900/5 rotate-12" />
            </motion.div>
         ))}
      </div>

      {/* Depletion Tracker Table */}
      <div className="premium-card overflow-hidden bg-white">
         <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
               <Activity className="w-5 h-5 text-indigo-500" /> Customer Stock Depletion Estimates
            </h3>
         </div>
         
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Product / Customer</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Last Trxn</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Frequency</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none text-center">Depletion Risk</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none text-right">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {products.map((row, i) => (
                  <tr key={i} className="group hover:bg-slate-50/30 transition-all cursor-pointer">
                     <td className="px-8 py-6">
                        <div className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{row.item}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{row.customer}</div>
                     </td>
                     <td className="px-8 py-6 font-bold text-slate-800 text-sm tracking-tight">{row.lastOrdered}</td>
                     <td className="px-8 py-6 font-bold text-slate-800 text-sm tracking-tight">{row.cycle}</td>
                     <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-2">
                           <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              row.risk === 'Critical' ? 'bg-rose-100 text-rose-600 shadow-lg shadow-rose-100 animate-pulse' : 
                              row.risk === 'High' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                           }`}>
                              {row.risk}
                           </div>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Est: {row.estDepletion}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
                           {row.status}
                        </span>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Bottom Insights */}
      <div className="premium-card p-10 bg-indigo-900 border-none flex flex-wrap lg:flex-nowrap items-center gap-12 relative overflow-hidden text-white min-h-[300px]">
         <div className="relative z-10 space-y-6 max-w-lg">
            <div className="p-4 rounded-[28px] bg-white/10 backdrop-blur-xl w-16 h-16 flex items-center justify-center text-indigo-300 shadow-2xl">
               <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-4xl font-black tracking-tight leading-none">Automated <br />Customer Nudges</h3>
            <p className="text-indigo-200 text-base font-medium leading-relaxed">
               Pucho AI predicts **8 Major Customers** will run out of stock by this weekend. Automatically schedule **Inquiry Nudges** for them?
            </p>
            <button className="btn-premium bg-white text-indigo-900 shadow-2xl shadow-indigo-950 mt-4 px-12 h-14">View Prediction Models</button>
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

export default ProductLifecycle;
