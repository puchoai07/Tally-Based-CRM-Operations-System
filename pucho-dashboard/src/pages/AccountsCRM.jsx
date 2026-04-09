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
  X
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
        const matchesSearch = task.customer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'All' || task.status === activeFilter;
        return matchesSearch && matchesFilter;
      });
    }

    // Priority 2: Fallback to Raw Receivables Sync (WF-1)
    const syncTasks = liveData?.receivables?.map(r => ({
      id: r.id || r.bill_name || Math.random(),
      customer: r.party_name || r.name,
      amount: `₹${parseFloat(r.amount || 0).toLocaleString()}`,
      numericAmount: r.amount,
      days: r.days || 30,
      status: Math.abs(r.amount) > 500000 ? "Critical" : "Overdue",
      contact: "+91 00000 00000",
      invoice: r.bill_name || "TALLY-REF"
    })) || [];

    return syncTasks.filter(task => {
      const matchesSearch = task.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           task.invoice.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || task.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [liveData, searchTerm, activeFilter]);

  const stats = liveData?.stats || {
    totalRevenue: "₹0",
    totalOutstanding: "₹0",
    pendingInvoices: 0
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Accounts CRM</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Customer Outstanding & Collection Follow-ups</p>
        </div>
        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <button onClick={loadData} className="btn-secondary flex-1 md:flex-none justify-center">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
          </button>
          <button className="btn-pucho flex-1 md:flex-none justify-center whitespace-nowrap">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {/* Aging Overview */}
      <div className="flex gap-6 overflow-x-auto pb-2 custom-scrollbar">
        <AgingCard title="Total O/S" amount={stats.totalOutstanding} count={displayTasks.length} color="bg-emerald-500" delay={0.1} />
        <AgingCard title="31-60 Days" amount="₹2.8L" count={8} color="bg-amber-500" delay={0.2} />
        <AgingCard title="61-90 Days" amount="₹1.5L" count={5} color="bg-orange-500" delay={0.3} />
        <AgingCard title="90+ Days" amount="₹6.4L" count={3} color="bg-rose-500" delay={0.4} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search customers or invoices..." 
                className="w-full pl-10 pr-4 py-3 md:py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 glass-card bg-white/50 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
              {['All', 'Critical', 'Overdue'].map(filter => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-all flex-1 md:flex-none whitespace-nowrap ${
                    activeFilter === filter ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {displayTasks.length > 0 ? displayTasks.map((task, idx) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedTask(task)}
                className={`glass-card p-5 glass-card-hover cursor-pointer border-l-4 ${
                  task.status === 'Critical' ? 'border-l-rose-500' : 
                  task.status === 'Overdue' ? 'border-l-amber-500' : 'border-l-indigo-500'
                }`}
              >
                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{task.customer}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <span className="font-medium text-indigo-600">{task.invoice}</span> • {task.days} days overdue
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-slate-900">{task.amount}</span>
                    <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
                      task.status === 'Critical' ? 'text-rose-600' : 
                      task.status === 'Overdue' ? 'text-amber-600' : 'text-indigo-600'
                    }`}>
                      {task.status}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="text-sm font-semibold text-indigo-600 flex items-center hover:translate-x-1 transition-transform">
                    Action Required <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="glass-card p-12 text-center border-dashed border-2 border-slate-200">
                <p className="text-slate-400 font-medium">No customers found matching your criteria</p>
                <button onClick={() => { setSearchTerm(''); setActiveFilter('All'); }} className="mt-2 text-indigo-600 text-sm font-bold">Clear Filters</button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/20">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">AI Smart Suggestion</h3>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Based on payment history, **{displayTasks[0]?.customer || 'Customers'}** responds best to WhatsApp reminders between 10:00 AM - 11:30 AM.
            </p>
            <button className="mt-4 w-full py-2 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
              Apply Suggestion
            </button>
          </motion.div>

          <div className="glass-card p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
              Promise Tracker
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 uppercase">This Week</span>
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Collected', value: '₹1.2L', goal: '₹2.0L', percent: 60, color: 'bg-indigo-500' },
                { label: 'Promised', value: '₹85k', goal: '₹1.0L', percent: 85, color: 'bg-amber-500' }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">{item.label}</span>
                    <span className="font-bold text-slate-800">{item.value} <span className="text-slate-400 font-normal">/ {item.goal}</span></span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ delay: 0.5 + i*0.2, duration: 1 }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass-card p-8 border-none overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedTask.customer}</h3>
                  <p className="text-slate-500">{selectedTask.invoice} • Outstanding: {selectedTask.amount}</p>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-1 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button className="btn-pucho h-12 flex items-center justify-center gap-2">
                    <Phone className="w-5 h-5" /> Audio Call
                  </button>
                  <button className="btn-secondary h-12 border-emerald-200 text-emerald-600 hover:bg-emerald-50 flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" /> WhatsApp
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 block text-center uppercase tracking-widest">
                    Log Result
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Connected', 'No Response', 'Promised', 'Disputed'].map(res => (
                      <button 
                        key={res}
                        className="p-3 rounded-xl border border-slate-200 font-medium text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all text-sm"
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <button onClick={() => setSelectedTask(null)} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase">Cancel</button>
                  <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase">Save Follow-up</button>
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
