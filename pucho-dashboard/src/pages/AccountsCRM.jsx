import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tallyService } from '../services/tallyService';
import { 
  Phone, 
  MessageSquare, 
  Clock, 
  Plus, 
  ChevronRight,
  Filter,
  Search,
  Calendar,
  ArrowUpRight,
  User,
  RefreshCcw,
  X,
  Target,
  Sparkles
} from 'lucide-react';

const AgingCard = ({ title, amount, count, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-6 flex-1 min-w-[200px]"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        <Clock className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
    </div>
    <h3 className="text-2xl font-bold text-slate-800">{amount}</h3>
    <p className="text-sm text-slate-500 mt-1">{count} Pending Invoices</p>
  </motion.div>
);

const AccountsCRM = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const result = await tallyService.getDashboardStats();
    if (result) {
      setLiveData(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); 
    return () => clearInterval(interval);
  }, []);

  const displayTasks = useMemo(() => {
    // Priority 1: Use AI Generated Tasks (WF-2)
    const aiTasks = liveData?.tasks?.filter(t => t.task_type === 'Collection Follow-up' || t.task_type === 'Payment Follow-up') || [];
    
    if (aiTasks.length > 0) {
      return aiTasks.map(t => ({
        id: t.task_id || Math.random(),
        customer: t.customer || 'Unknown',
        amount: t.detail?.match(/₹[\d,L]+/)?.[0] || '₹0',
        days: t.detail?.match(/\d+ days/)?.[0] || 'Overdue',
        status: t.priority || 'High',
        contact: t.contact || '+91 00000 00000',
        invoice: t.task_id || 'AI-TASK'
      })).filter(task => {
        const matchesSearch = (task.customer || '').toLowerCase().includes((searchTerm || '').toLowerCase());
        const matchesFilter = activeFilter === 'All' || task.status === activeFilter;
        return matchesSearch && matchesFilter;
      });
    }

    // Priority 2: Fallback to Raw Receivables Sync (WF-1)
    const syncTasks = (liveData?.receivables || []).map(r => ({
      id: r.id || r.bill_name || Math.random(),
      customer: r.party_name || r.name || 'Unknown Customer',
      amount: `₹${Number(r.amount || 0).toLocaleString('en-IN')}`,
      numericAmount: r.amount,
      days: r.days || 30,
      status: Math.abs(Number(r.amount || 0)) > 500000 ? "Critical" : "Overdue",
      contact: "+91 00000 00000",
      invoice: r.bill_name || "TALLY-REF"
    }));

    return syncTasks.filter(task => {
      const matchesSearch = (task.customer || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                           (task.invoice || '').toLowerCase().includes((searchTerm || '').toLowerCase());
      const matchesFilter = activeFilter === 'All' || task.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [liveData, searchTerm, activeFilter]);

  const stats = {
    totalRevenue: liveData?.stats?.totalRevenue || "₹0",
    totalOutstanding: liveData?.stats?.totalOutstanding || "₹0",
    pendingInvoices: liveData?.stats?.pendingInvoices || 0,
    agingBuckets: liveData?.stats?.agingBuckets || { 
      '0-30': '₹0L', 
      '31-60': '₹0L', 
      '61-90': '₹0L', 
      '90+': '₹0L' 
    },
    collectorPerformance: liveData?.stats?.collectorPerformance || []
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Accounts CRM</h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-black uppercase text-emerald-600 border border-emerald-100">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active WF-1
             </div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                {liveData?.lastUpdated ? `Last Sync: ${new Date(liveData.lastUpdated).toLocaleTimeString()}` : 'Connecting Tally...'}
             </p>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <button onClick={loadData} className="px-6 py-3 rounded-2xl bg-white text-slate-600 font-black text-xs uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-slate-50 flex items-center gap-2">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Tally
          </button>
          <button className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-transform flex items-center gap-2">
            <Plus className="w-4 h-4" /> Collection Task
          </button>
        </div>
      </div>

      {/* UC-1 Admin: Aging Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AgingCard title="0-30 Days" amount={stats.agingBuckets['0-30']} count="Current" color="bg-emerald-500" delay={0.1} />
        <AgingCard title="31-60 Days" amount={stats.agingBuckets['31-60']} count="Follow-up" color="bg-amber-500" delay={0.2} />
        <AgingCard title="61-90 Days" amount={stats.agingBuckets['61-90']} count="Escalate" color="bg-orange-500" delay={0.3} />
        <AgingCard title="90+ Days" amount={stats.agingBuckets['90+']} count="Critical" color="bg-rose-500" delay={0.4} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search customers, invoices, or aging..." 
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-100 outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
              {['All', 'Critical', 'Overdue'].map(filter => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                    activeFilter === filter ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {displayTasks.length > 0 ? displayTasks.map((task, idx) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedTask(task)}
                className="group bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <User className="w-7 h-7" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{task.customer}</h4>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                         INV {task.invoice} • <span className="text-indigo-500">{task.days} Days Overdue</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-800 tracking-tight">{task.amount}</p>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      task.status === 'Critical' ? 'bg-rose-50 text-rose-600' : 
                      task.status === 'Overdue' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${task.status === 'Critical' ? 'bg-rose-600' : 'bg-indigo-600'}`} />
                      {task.status}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center relative z-10">
                  <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    Action Queue <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </motion.div>
            )) : (
              <div className="bg-white p-20 text-center rounded-[3rem] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Filter className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Active Tasks</h3>
                <p className="text-slate-400 text-xs font-medium mt-2">All receivables are currently within terms.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* UC-1 Admin: Collector Performance */}
          <div className="premium-card p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Collector Efficiency</h3>
               <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="space-y-6">
              {stats.collectorPerformance.map((collector, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                          {collector.name.charAt(0)}
                       </div>
                       <span className="text-xs font-black text-slate-600">{collector.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400">{collector.completed} / {collector.assigned}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(collector.completed / collector.assigned) * 100}%` }}
                      transition={{ delay: 0.5 + i*0.1 }}
                      className="h-full bg-indigo-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UC-1 Admin: Promise Pipeline */}
          <div className="premium-card p-8 bg-slate-900 text-white border-none relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-2 rounded-lg bg-emerald-500 shadow-lg shadow-emerald-500/20">
                      <Target className="w-5 h-5 text-white" />
                   </div>
                   <h3 className="font-black uppercase tracking-widest text-xs">Promise Pipeline</h3>
                </div>
                <div className="space-y-6">
                   <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter mb-2 text-emerald-400">
                         <span>Weekly Target</span>
                         <span>85% Path</span>
                      </div>
                      <h3 className="text-2xl font-black italic tracking-widest">₹12.85L</h3>
                      <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest opacity-60">Confirmed Commitments</p>
                   </div>
                   <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                      View Commitment Log
                   </button>
                </div>
             </div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full" />
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-indigo-900 text-xs uppercase tracking-widest">AI Intelligence</h3>
            </div>
            <p className="text-xs font-medium text-indigo-700 leading-relaxed">
              Based on historical collection cycles, **{displayTasks[0]?.customer || 'Retailers'}** are 40% more likely to pay if contacted via WhatsApp **before 11:00 AM**.
            </p>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">{selectedTask.customer}</h3>
                  <div className="flex items-center gap-3 mt-2">
                     <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase">INV {selectedTask.invoice}</span>
                     <span className="text-indigo-600 text-sm font-black">{selectedTask.amount}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <button className="h-16 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" /> Voice Call
                  </button>
                  <button className="h-16 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5" /> WhatsApp
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-[0.3em]">Log Outcome (WF-3)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['Connected', 'No Response', 'Promised', 'Disputed'].map(res => (
                      <button 
                        key={res}
                        className="py-4 rounded-2xl border border-slate-100 font-black text-slate-500 text-[10px] uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-center gap-8">
                  <button onClick={() => setSelectedTask(null)} className="text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em]">Dismiss</button>
                  <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-[0.2em]">Confirm & Close</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountsCRM;
