import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Truck, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  Target,
  Sparkles,
  Search,
  Bell,
  Calendar,
  Layers,
  ArrowRight,
  Clock,
  RefreshCcw,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { tallyService } from '../services/tallyService';

const data = [
  { name: 'Mon', val: 45000 },
  { name: 'Tue', val: 52000 },
  { name: 'Wed', val: 48000 },
  { name: 'Thu', val: 61000 },
  { name: 'Fri', val: 55000 },
  { name: 'Sat', val: 67000 },
  { name: 'Sun', val: 72000 },
];

const PremiumGlassCard = ({ title, val, change, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8 }}
    whileHover={{ y: -5 }}
    className="premium-card p-7 group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white"
  >
     <div className="flex justify-between items-start relative z-10">
        <div className={`p-4 rounded-3xl bg-white shadow-xl shadow-slate-100 group-hover:scale-110 transition-transform duration-500`}>
           <Icon className={`w-7 h-7 ${color}`} strokeWidth={2.5} />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest shadow-sm shadow-emerald-50">
           <ArrowUpRight className="w-3 h-3" /> {change}
        </div>
     </div>
     <div className="mt-8 relative z-10">
        <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h4>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-2 tracking-tight group-hover:text-indigo-600 transition-colors uppercase tracking-widest truncate">{val}</h2>
     </div>
     <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] opacity-20 transition-all duration-700 group-hover:opacity-40 group-hover:scale-150 rotate-45 ${color.replace('text', 'bg')}`} />
  </motion.div>
);

const ManagementDashboard = () => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [liveData, setLiveData] = useState(null);
    const [dashboardStats, setDashboardStats] = useState({
      receivables: '₹0.00',
      dispatch: '94.2%',
      collections: '₹0.00',
      compliance: '98%',
      productivity: { score: 65, rank: 'Top 5%', onTime: '88%' },
      taskSummary: { total: 0, overdue: 0, completed: 0 },
      collectionHealth: { percentage: 0, target: '₹0L' },
      dispatchSLA: { percentage: 0 },
      complianceStatus: { daysToDeadline: 0, exceptionCount: 0 },
      aiAccuracy: { percentage: 0 },
      refillPipeline: { value: '₹0L' },
      vendorObligation: { totalDue: '₹0L' },
      pendingInvoices: 0,
      teamCapacity: [],
      ai_audit_log: []
    });

    const syncData = async () => {
        setIsSyncing(true);
        const result = await tallyService.getDashboardStats();
        if (result) {
            setLiveData(result);
            const stats = result.stats || {};
            setDashboardStats({
                receivables: stats.totalOutstanding || '₹0.00',
                dispatch: `${stats.dispatchSLA?.percentage || 94.2}%`,
                collections: stats.totalRevenue || '₹0.00',
                compliance: '100%',
                productivity: result.productivity || { score: 65, rank: 'Top 5%', onTime: '88%' },
                taskSummary: stats.taskSummary || { total: 0, overdue: 0, completed: 0 },
                collectionHealth: stats.collectionHealth || { percentage: 0, target: '₹0L' },
                dispatchSLA: stats.dispatchSLA || { percentage: 0 },
                complianceStatus: stats.complianceStatus || { daysToDeadline: 0, exceptionCount: 0 },
                aiAccuracy: stats.aiAccuracy || { percentage: 0 },
                refillPipeline: stats.refillPipeline || { value: '₹0L' },
                vendorObligation: stats.vendorObligation || { totalDue: '₹0L' },
                pendingInvoices: stats.pendingInvoices || 0,
                teamCapacity: stats.teamCapacity || [],
                ai_audit_log: result.ai_audit_log || []
            });
        }
        setTimeout(() => setIsSyncing(false), 2000);
    };

    useEffect(() => {
      syncData();
      const interval = setInterval(syncData, 30000);
      return () => clearInterval(interval);
    }, []);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1700px] mx-auto min-h-screen animate-fade-in bg-slate-50/50">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-4 lg:p-6 rounded-3xl border border-slate-100 px-6 lg:px-8 shadow-sm gap-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
               <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
               <h1 className="text-xl font-black text-slate-800 tracking-tight">Management Dashboard</h1>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  Unified Operations Control • <span className={isSyncing ? 'text-indigo-500 animate-pulse' : 'text-emerald-500'}>{isSyncing ? 'Syncing Tally...' : 'Tally Live'}</span>
               </p>
            </div>
         </div>
         
         <div className="flex items-center gap-6">
            <div className="hidden xl:flex items-center gap-8 px-6 py-2 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="text-center border-r border-slate-200 pr-8">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">AI Accuracy</p>
                  <p className="text-sm font-black text-indigo-600">{dashboardStats.aiAccuracy.percentage}%</p>
               </div>
               <div className="text-center border-r border-slate-200 pr-8">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Compliance In</p>
                  <p className="text-sm font-black text-rose-600">{dashboardStats.complianceStatus.daysToDeadline} Days</p>
               </div>
               <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Refill Pipeline</p>
                  <p className="text-sm font-black text-emerald-600">{dashboardStats.refillPipeline.value}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button className="p-3 rounded-2xl bg-white hover:bg-slate-50 transition-all border border-slate-100 shadow-sm">
                  <Bell className="w-5 h-5 text-slate-500" />
               </button>
               <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-white font-black text-sm shadow-xl">
                  AD
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Pending Tasks', val: dashboardStats.taskSummary.total, sub: `${dashboardStats.taskSummary.overdue} Overdue`, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
           { label: 'Collection Health', val: `${dashboardStats.collectionHealth.percentage}%`, sub: `Target: ${dashboardStats.collectionHealth.target}`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Dispatch SLA', val: `${dashboardStats.dispatchSLA.percentage}%`, sub: 'On-Time Delivery', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50' },
           { label: 'GST Exceptions', val: dashboardStats.complianceStatus.exceptionCount, sub: 'Requires Review', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' }
         ].map((pulse, i) => (
            <motion.div 
               key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }}
               className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-indigo-200 transition-colors"
            >
               <div className={`w-14 h-14 rounded-2xl ${pulse.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <pulse.icon className={`w-7 h-7 ${pulse.color}`} strokeWidth={2.5} />
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{pulse.label}</p>
                  <h3 className="text-2xl font-black text-slate-800">{pulse.val}</h3>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">{pulse.sub}</p>
               </div>
            </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <div className="xl:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="premium-card p-10 bg-indigo-700 text-white border-none relative overflow-hidden group">
                   <div className="relative z-10">
                      <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">Total Outstanding (Receivables)</p>
                      <h2 className="text-4xl lg:text-5xl font-black mt-4 truncate tracking-tight">{dashboardStats.receivables}</h2>
                      <div className="flex gap-4 mt-12">
                         <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">
                            WF-1 Active
                         </div>
                         <div className="px-4 py-2 bg-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                            {dashboardStats.pendingInvoices} Overdue Invoices
                         </div>
                      </div>
                   </div>
                   <div className="absolute top-1/2 -translate-y-1/2 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                </div>

                <div className="premium-card p-8 bg-white group border border-slate-100">
                   <div className="flex justify-between items-start">
                      <div className="p-4 rounded-3xl bg-emerald-50 text-emerald-600">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Pipeline</p>
                        <h2 className="text-3xl font-black text-slate-800 mt-2">{dashboardStats.collections}</h2>
                      </div>
                   </div>
                   <div className="mt-8 flex items-end gap-2 h-20">
                      {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                         <div key={i} className="flex-1 bg-slate-50 rounded-lg relative group/bar overflow-hidden">
                            <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i*0.1 }} className="absolute bottom-0 w-full bg-emerald-100 group-hover/bar:bg-emerald-500 transition-colors" />
                         </div>
                      ))}
                   </div>
                </div>
            </div>

            <div className="premium-card p-8 bg-white border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-black text-slate-800">AI Assignment Audit Log (WF-11)</h3>
                   <div className="flex gap-2">
                       <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-tighter">Real-time Routing</span>
                   </div>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {dashboardStats.ai_audit_log.length > 0 ? dashboardStats.ai_audit_log.map((log, i) => (
                       <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                             <Sparkles className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between">
                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{log.task_id}</p>
                                <p className="text-[8px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                             </div>
                             <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">{log.reason}</p>
                             <p className="text-[9px] font-black text-indigo-600 mt-2 uppercase tracking-widest">→ Assigned to {log.assigned_to}</p>
                          </div>
                       </div>
                    )) : (
                       <div className="p-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest opacity-50">
                          Waiting for next Tally Sync to route tasks...
                       </div>
                    )}
                </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="premium-card p-8 bg-white border-2 border-indigo-600 shadow-2xl shadow-indigo-100 relative overflow-hidden">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                     <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Team Capacity</h3>
               </div>
               <div className="space-y-6">
                  {dashboardStats.teamCapacity.length > 0 ? dashboardStats.teamCapacity.map((flow, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                          <span className="text-slate-400">{flow.label}</span>
                          <span className={flow.color.replace('bg-', 'text-')}>{flow.val}</span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${flow.percent}%` }} transition={{ delay: 0.5+i*0.1 }} className={`h-full ${flow.color}`} />
                       </div>
                    </div>
                  )) : (
                    ['Accounts Team', 'Dispatch Center', 'Compliance Dept'].map((label, i) => (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                             <span className="text-slate-400">{label}</span>
                             <span className="text-emerald-500">Optimal</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 w-[60%]" />
                          </div>
                       </div>
                    ))
                  )}
               </div>
               <div className="mt-8 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Productivity</p>
                     <p className="text-xl font-black text-slate-800">{dashboardStats.productivity.score}%</p>
                  </div>
               </div>
            </div>

            <div className="premium-card p-8 bg-slate-900 text-white border-none relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                      <Sparkles className="w-7 h-7 text-indigo-400" />
                   </div>
                   <h3 className="text-lg font-bold tracking-tight">Repurchase Forecast</h3>
                   <p className="text-indigo-200/50 text-[11px] font-medium mt-3 leading-relaxed">
                     AI predicts **{dashboardStats.refillPipeline.value}** worth of orders from existing customers this month.
                   </p>
                   <button className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                      View Pipeline <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-3xl" />
            </div>
         </div>
      </div>

    </div>
  );
};

export default ManagementDashboard;
