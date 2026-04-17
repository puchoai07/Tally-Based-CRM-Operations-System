import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tallyService } from '../services/tallyService';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  AlertTriangle,
  Search,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  LayoutGrid,
  Zap,
  TrendingUp
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const colors = {
    Pending: 'bg-slate-100 text-slate-600',
    Packing: 'bg-emerald-50 text-emerald-600',
    Ready: 'bg-indigo-50 text-indigo-600',
    Dispatched: 'bg-slate-900 text-white',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${colors[status]}`}>
      {status}
    </span>
  );
};

const DispatchCenter = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [liveStats, setLiveStats] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const result = await tallyService.getDashboardStats();
    setLiveStats(result?.stats || null);
    
    const rawOrders = await tallyService.getDispatchData();
    const aiTasks = result?.tasks?.filter(t => t.task_type === 'Warehouse Dispatch' || t.task_type === 'Dispatch') || [];
    
    const merged = [...aiTasks.map(t => ({
      id: t.task_id || 'AI-DISP',
      customer: t.customer || 'Unknown',
      items: t.detail || 'Dispatch Required',
      status: 'Pending',
      location: 'AI Priority',
      time: 'Suggest: Today',
      priority: t.priority || 'High',
      isAI: true
    })), ...rawOrders.filter(ro => !aiTasks.find(at => at.customer === (ro.party_name || ro.customer)))];

    setOrders(merged);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 40000); 
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = String(order.customer).toLowerCase().includes(searchTerm.toLowerCase()) || 
                           String(order.id).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'All' || order.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [orders, searchTerm, activeTab]);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in max-w-[1700px] mx-auto bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dispatch Center</h1>
          <div className="flex items-center gap-3 mt-1">
             <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Fulfillment
             </div>
             <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em]">{liveStats?.dispatchSLA?.percentage}% On-Time Delivery Target</p>
          </div>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
           <button onClick={loadData} className="flex-1 lg:flex-none px-6 py-3 rounded-2xl bg-white text-slate-600 font-black text-[10px] uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2">
             <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Tally
           </button>
           <button className="flex-1 lg:flex-none px-6 py-3 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-105 transition-transform flex items-center justify-center gap-2">
             <Plus className="w-4 h-4" /> New Dispatch task
           </button>
        </div>
      </div>

      {/* UC-2 Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Pending Dispatch', val: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
           { label: 'Packing Now', val: orders.filter(o => o.status === 'Packing').length, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Ready for Truck', val: orders.filter(o => o.status === 'Ready').length, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
           { label: 'Shortfall Alerts', val: liveStats?.materialShortfalls?.length || 0, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' }
         ].map((stat, i) => (
           <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }}
             key={i} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group"
           >
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-800">{stat.val}</h3>
             </div>
             <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" strokeWidth={2.5} />
             </div>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex gap-1">
              {['All', 'Pending', 'Packing', 'Ready'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative group mr-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Dispatch ID / Client..." 
                className="pl-12 pr-4 py-2 bg-slate-50 border-none outline-none rounded-xl text-xs font-semibold w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {filteredOrders.length > 0 ? filteredOrders.map((order, i) => (
                <motion.div 
                  layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                  key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:shadow-indigo-50/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                       <Package className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center gap-3">
                          <h3 className="font-black text-slate-800 text-lg">{order.customer}</h3>
                          {order.priority === 'High' && (
                             <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-rose-100">Critical SLA</span>
                          )}
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: <span className="text-indigo-600">{order.id}</span> • Hub: {order.location}</p>
                    </div>
                    <div className="text-right flex items-center gap-6">
                       <StatusBadge status={order.status} />
                       <button className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors">
                          <ChevronRight className="w-6 h-6" />
                       </button>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                   <LayoutGrid className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Active Fulfillment</h3>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Admin Sidebar Insights */}
        <div className="space-y-6">
          <div className="premium-card p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Loading Efficiency</h3>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
             </div>
             <div className="space-y-6">
                {(liveStats?.dispatchPerformance || []).map((hub, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div>
                         <p className="text-[10px] font-black text-slate-800 uppercase">{hub.name}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{hub.completed} Orders Done</p>
                      </div>
                      <div className="text-right">
                         <p className={`text-xs font-black ${parseFloat(hub.avgDelay) > 2 ? 'text-rose-600' : 'text-emerald-600'}`}>{hub.avgDelay} Delay</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <div className="premium-card p-8 bg-rose-50 border border-rose-100">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-rose-900 uppercase tracking-widest text-[10px]">UC-11: Material Blocking</h3>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
             </div>
             <div className="space-y-4">
                {(liveStats?.materialShortfalls || []).map((short, i) => (
                   <div key={i} className="p-4 bg-white rounded-2xl border border-rose-100/50 shadow-sm shadow-rose-100/20">
                      <div className="flex justify-between items-start">
                         <h4 className="text-[11px] font-black text-slate-800 pr-4">{short.item}</h4>
                         <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase">{short.orders} Orders</span>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Shortfall: <span className="text-rose-500">{short.shortfall}</span></p>
                   </div>
                ))}
             </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Live Action</p>
                <h3 className="text-lg font-bold">12 Trucks Scheduled</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed opacity-60 italic">AI has optimized cross-docking for today's high-value orders (WF-5).</p>
                <button className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                   Manage Logistics
                </button>
             </div>
             <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-indigo-500/10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchCenter;
