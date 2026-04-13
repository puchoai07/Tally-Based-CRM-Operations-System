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
  RefreshCcw
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
        <h2 className="text-4xl font-extrabold text-slate-800 mt-2 tracking-tight group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{val}</h2>
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
      productivity: { score: 65, rank: 'Top 5%', onTime: '88%' }
    });

    const syncData = async () => {
        setIsSyncing(true);
        const result = await tallyService.getDashboardStats();
        if (result) {
            setLiveData(result);
            setDashboardStats({
                receivables: result.stats?.totalOutstanding || '₹0.00',
                dispatch: '98.5%',
                collections: result.stats?.totalRevenue || '₹0.00',
                compliance: '100%',
                productivity: result.productivity || { score: 65, rank: 'Top 5%', onTime: '88%' }
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
    <div className="p-4 md:p-8 space-y-8 max-w-[1700px] mx-auto min-h-screen animate-fade-in bg-slate-50/50">
      
      {/* Universal Search & Live Pulse */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-4 lg:p-6 rounded-3xl border border-slate-100 px-6 lg:px-8 shadow-sm gap-6">
         <div className="relative w-full lg:w-96 group flex items-center gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                   type="text" 
                   placeholder="Search Tally Data / Actions..." 
                   className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400 text-sm font-medium transition-all"
                />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm text-xs">
               <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
               <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter whitespace-nowrap">
                  {isSyncing ? 'Syncing...' : 'Tally Live'}
               </span>
            </div>
         </div>
         <div className="flex items-center justify-between w-full lg:w-auto gap-6 border-t lg:border-t-0 pt-4 lg:pt-0">
            <button className="relative p-3 rounded-2xl bg-white hover:bg-slate-50 transition-all border border-slate-50 shadow-sm shadow-slate-100">
               <Bell className="w-5 h-5 text-slate-500" />
               <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 hidden lg:block"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
               <div className="text-right">
                  <p className="text-sm font-black text-slate-800">Admin Executive</p>
                  <p className="text-[10px] text-indigo-500 font-bold tracking-widest uppercase">Verified Pucho.ai</p>
               </div>
               <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-indigo-100 group-hover:rotate-6 transition-transform">
                  A
               </div>
            </div>
         </div>
      </div>

      {/* Main Dashboard Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-2 space-y-8"
         >
            {/* Real-time KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="premium-card p-6 lg:p-10 bg-indigo-700 text-white border-none relative overflow-hidden group">
                   <div className="relative z-10 flex flex-col justify-between h-full">
                      <div>
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">Total Receivables (O/S)</p>
                        <h2 className="text-4xl lg:text-6xl font-black mt-4 group-hover:scale-105 transition-transform origin-left">{dashboardStats.receivables}</h2>
                      </div>
                      <div className="flex gap-4 mt-12">
                         <button className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-xl text-xs font-black uppercase hover:bg-white/30 transition-all flex items-center gap-2">
                           <Zap className="w-3 h-3" /> Sync Tally
                         </button>
                         <button className="px-6 py-2 bg-indigo-500 rounded-xl text-xs font-black uppercase flex items-center gap-2">
                           Reports <ArrowRight className="w-3 h-3" />
                         </button>
                      </div>
                   </div>
                   <Target className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
                </div>

                <div className="premium-card p-6 lg:p-10 bg-white group hover:border-emerald-200 transition-colors">
                   <div className="flex justify-between">
                      <div className="p-3 lg:p-4 rounded-2xl lg:rounded-3xl bg-emerald-50 text-emerald-600">
                        <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Revenue</p>
                        <h2 className="text-3xl lg:text-4xl font-black text-slate-800 mt-2">{dashboardStats.collections}</h2>
                      </div>
                   </div>
                   <div className="mt-12 h-20 w-full overflow-hidden">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data}>
                             <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} fill="#ecfdf5" />
                          </AreaChart>
                       </ResponsiveContainer>
                   </div>
                </div>
            </div>

            {/* Top Debtors Quick List */}
            <div className="premium-card p-8 bg-white overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-black text-slate-800">Top Outstanding Debtors</h3>
                   <div onClick={syncData} className="p-2 rounded-xl bg-slate-50 text-slate-400 cursor-pointer hover:bg-slate-100">
                     <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                   </div>
                </div>
                <div className="space-y-4">
                    {liveData?.receivables?.slice(0, 4).map((debtor, i) => (
                       <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                                {String(debtor?.name || 'U').charAt(0)}
                             </div>
                             <div>
                                <p className="font-bold text-slate-800">{debtor?.name || 'Unknown Debtor'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Due for 30+ Days</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-slate-800">₹{Number(debtor?.amount || 0).toLocaleString('en-IN')}</p>
                             <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded">Critical</span>
                          </div>
                       </div>
                    ))}
                </div>
            </div>
         </motion.div>

         {/* Sidebar: Automation Health */}
         <div className="space-y-8">
            <div className="premium-card p-8 bg-white border-2 border-indigo-600 shadow-2xl shadow-indigo-100">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white">
                     <Zap className="w-5 h-5 fill-white" />
                  </div>
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Flow Automation</h3>
               </div>
               <div className="space-y-6">
                  {[
                    { label: 'Dispatch Center', val: '12 Orders Ready', color: 'bg-emerald-500', percent: 85 },
                    { label: 'Payment Follow-ups', val: '08 Scheduled', color: 'bg-indigo-500', percent: 70 },
                    { label: 'Productivity Score', val: `${dashboardStats.productivity.score}%`, color: 'bg-amber-400', percent: dashboardStats.productivity.score }
                  ].map((flow, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400">{flow.label}</span>
                          <span className="text-slate-800">{flow.val}</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${flow.percent}%` }} transition={{ delay: 0.5+i*0.1 }} className={`h-full ${flow.color}`} />
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-10 py-4 bg-indigo-50 text-indigo-600 font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-indigo-100 transition-all border border-indigo-100">
                  Manage Pucho Studio
               </button>
            </div>

            <div className="premium-card p-8 bg-slate-900 text-white border-none flex flex-col items-center text-center relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="w-20 h-20 rounded-[32px] bg-white/10 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                      <Clock className="w-10 h-10 text-indigo-400" />
                   </div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Shift Update</h4>
                   <h3 className="text-xl font-bold tracking-tight">Orders Awaiting Dispatch</h3>
                   <p className="text-indigo-200/50 text-xs font-medium mt-4 leading-relaxed">
                     Total **₹24.8L** worth of material is packed and ready for carrier pickup.
                   </p>
                   <button className="mt-8 px-8 py-3 bg-indigo-500 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3">
                      View Center <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
                <Truck className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5 opacity-10" />
            </div>
         </div>
      </div>

    </div>
  );
};

export default ManagementDashboard;
