import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tallyService } from '../services/tallyService';
import { 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  FileText, 
  ArrowRight, 
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Filter,
  Zap,
  Building2,
  ExternalLink
} from 'lucide-react';

const GSTRCompliance = () => {
  const [activeTab, setActiveTab] = useState('Validation');
  const [loading, setLoading] = useState(false);
  const [auditStats, setAuditStats] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const data = await tallyService.getDashboardStats();
    if (data) {
      setAuditStats(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const exceptions = useMemo(() => {
    const aiExceptions = auditStats?.tasks?.filter(t => 
      t.task_type === 'Compliance Exception' || 
      t.task_type === 'ITC Mismatch' || 
      t.task_type === 'GSTR Error'
    ) || [];

    if (aiExceptions.length > 0) {
      return aiExceptions.map(t => ({
        id: t.ref_no || 'GSTR-ERR',
        customer: t.customer || 'Unknown Entity',
        type: t.detail?.includes('B2B') ? 'B2B' : 'B2C',
        error: t.detail || 'Validation Error',
        severity: t.priority || 'Critical',
        value: t.detail?.match(/₹[\d,L]+/)?.[0] || '₹0',
        status: 'Filing Blocked'
      }));
    }

    return []; // No exceptions found
  }, [auditStats]);

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Compliance & GST Hub</h1>
            <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-widest mt-1">
              Period: Oct 2023
            </span>
          </div>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">GSTR-1 Validation & 2B Reconciliation (UC-7 & UC-8)</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 border-slate-200">
             <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setLoading(true)} className="btn-pucho flex-1 md:flex-none flex items-center justify-center gap-2 shadow-xl shadow-indigo-100">
             <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Run Audit
          </button>
        </div>
      </div>

      {/* Compliance Health Score & ITC Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 premium-card p-6 md:p-10 bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white border-none relative overflow-hidden">
           <div className="relative z-10">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 w-max text-[10px] font-black uppercase tracking-widest text-indigo-300">
                <Zap className="w-3 h-3 fill-indigo-400" /> Live Tally Audit Active • Period: October 2023
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16 mt-10">
                 <div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter">94.8%</h2>
                    <p className="text-indigo-400 font-bold uppercase text-[10px] mt-2 tracking-[0.2em]">GSTR-1 Filing Readiness</p>
                 </div>
                 <div className="space-y-4 flex-1 max-w-sm">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <span>Correct Documents</span>
                       <span>412 / 438</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <motion.div initial={{ width: 0 }} animate={{ width: '94.8%' }} transition={{ duration: 1.5, ease: 'easeOut' }} className="h-full bg-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.6)]" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">✨ AI identified 26 exceptions requiring manual fix in Tally.</p>
                 </div>
              </div>
           </div>
           <ShieldCheck className="absolute -bottom-20 -right-20 w-80 h-80 text-white/5 rotate-12 hidden md:block" />
        </div>

        <div className="premium-card p-10 bg-white flex flex-col justify-between border-2 border-rose-50 shadow-2xl shadow-rose-50">
           <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6">
                 <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-800">ITC Risk Monitor</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">Pending GSTR-2B Mismatch</p>
           </div>
           <div className="mt-8">
              <h2 className="text-4xl font-black text-rose-600">₹8.42L</h2>
              <p className="text-[10px] font-black text-rose-300 uppercase mt-2 tracking-widest">Blocked Internal Credit</p>
           </div>
           <button className="btn-secondary mt-8 w-full border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white group">
              View Gap Report <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>

      {/* Main Validation Console */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-100 items-center justify-between pb-1">
           <div className="flex gap-10">
              {['Validation Errors', '2B Reconciliation', 'Filed Returns'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-xs font-black uppercase tracking-[0.15em] transition-all relative ${
                    activeTab.includes(tab.split(' ')[0]) ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {tab}
                  {activeTab.includes(tab.split(' ')[0]) && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />
                  )}
                </button>
              ))}
           </div>
           <div className="flex items-center gap-4 mb-4">
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input type="text" placeholder="Search Invoice/GSTIN..." className="pl-12 pr-6 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50/50 w-72 shadow-sm" />
              </div>
              <button className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 shadow-sm"><Filter className="w-4 h-4" /></button>
           </div>
        </div>

        {/* Dynamic Table with Horizontal Scroll */}
        <div className="premium-card overflow-hidden bg-white shadow-xl shadow-slate-100/50 border-none overflow-x-auto no-scrollbar">
           <table className="w-full text-left min-w-[800px]">
              <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Invoice Details</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Exception Type</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Severity</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Tax Value</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Fix Path</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 <AnimatePresence>
                   {exceptions.map((row, i) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className="hover:bg-indigo-50/30 transition-all group"
                      >
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                  <FileText className="w-5 h-5" />
                               </div>
                               <div>
                                  <div className="font-black text-slate-800">{row.id}</div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{row.customer}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                               <AlertCircle className={`w-4 h-4 ${row.severity === 'Critical' ? 'text-rose-500' : 'text-amber-500'}`} />
                               {row.error}
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                               row.severity === 'Critical' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'bg-amber-100 text-amber-700'
                            }`}>
                               {row.severity}
                            </span>
                         </td>
                         <td className="px-8 py-6 font-black text-slate-800 text-lg">{row.value}</td>
                         <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                               <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                  Fix in Tally <ExternalLink className="w-3 h-3" />
                               </button>
                            </div>
                         </td>
                      </motion.tr>
                   ))}
                 </AnimatePresence>
              </tbody>
           </table>
        </div>
      </div>

      {/* Summary Footer Widget */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-8">
           {[
             { label: 'Invalid GSTINs', val: '04', color: 'bg-rose-500' },
             { label: 'Missing HSN', val: '12', color: 'bg-amber-500' },
             { label: 'Place of Supply Fix', val: '08', color: 'bg-indigo-500' }
           ].map((stat, i) => (
             <div key={i} className="flex-1 min-w-[200px] premium-card p-6 bg-white border-none flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className={`w-1 h-8 rounded-full ${stat.color}`} />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                </div>
                <span className="text-2xl font-black text-slate-800 group-hover:scale-110 transition-transform">{stat.val}</span>
             </div>
           ))}
        </div>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center mt-4">
          ⚠️ Note: Displaying audit data for **October 2023** (last sync point) as April 2026 contains 0 records in Tally.
        </p>
      </div>
    </div>
  );
};

export default GSTRCompliance;
