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
  Zap
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

  const loadData = async () => {
    setLoading(true);
    const stats = await tallyService.getDashboardStats();
    const rawOrders = await tallyService.getDispatchData();
    const aiTasks = stats?.tasks?.filter(t => t.task_type === 'Warehouse Dispatch' || t.task_type === 'Dispatch') || [];
    
    // Merge AI suggestions with Raw Orders
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
      const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           order.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'All' || order.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [orders, searchTerm, activeTab]);

  const stats = [
    { label: 'Pending Dispatch', value: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'text-amber-500' },
    { label: 'Packing in Progress', value: orders.filter(o => o.status === 'Packing').length, icon: Package, color: 'text-emerald-500' },
    { label: 'Ready for Loading', value: orders.filter(o => o.status === 'Ready').length, icon: CheckCircle2, color: 'text-indigo-500' },
    { label: 'Dispatched (Historical)', value: orders.filter(o => o.status === 'Dispatched').length, icon: Truck, color: 'text-slate-800' },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dispatch Center</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Real-time Fulfillment & Order Tracking (UC-2 & UC-10)</p>
        </div>
        <div className="flex gap-4">
           <button onClick={loadData} className="btn-secondary flex items-center gap-2 border-slate-200">
             <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Tally Register
           </button>
           <button className="btn-pucho flex items-center gap-2 shadow-xl shadow-indigo-100">
             <Plus className="w-4 h-4" /> New Dispatch task
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="premium-card p-8 group hover:border-indigo-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                <h3 className="text-4xl font-black text-slate-800 mt-2">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-2xl bg-slate-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
               <Zap className="w-3 h-3 fill-emerald-600" /> Live from Tally
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pipeline View */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {['All', 'Pending', 'Packing', 'Ready', 'Dispatched'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Customer or Order ID..." 
              className="pl-12 pr-6 py-3 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-50/50 w-80 text-sm font-medium shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredOrders.length > 0 ? filteredOrders.map((order, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                key={order.id}
                className="premium-card p-6 group hover:border-indigo-600/20 transition-all cursor-pointer bg-white"
              >
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-8">
                  {/* Order Meta */}
                  <div className="w-40 border-r border-slate-50">
                    <h4 className="font-black text-indigo-600 text-lg tracking-tight">{order.id}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                      <Clock className="w-3 h-3" /> {order.time}
                    </p>
                  </div>

                  {/* Customer & Item */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3">
                       <h3 className="font-black text-slate-800 text-xl">{order.customer}</h3>
                       {order.priority === 'High' && (
                         <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-500 text-[9px] font-black rounded-lg uppercase tracking-tighter">
                            <AlertTriangle className="w-2.5 h-2.5" /> Express
                         </span>
                       )}
                    </div>
                    <p className="text-sm font-bold text-slate-500 flex items-center gap-2 mt-1">
                      <Package className="w-4 h-4 text-indigo-400" /> {order.items}
                    </p>
                  </div>

                  {/* Location Hub */}
                  <div className="hidden xl:flex flex-col gap-1 w-48 text-sm">
                    <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Workflow Stage</span>
                    <span className="text-slate-700 flex items-center gap-2 font-bold bg-slate-50 px-3 py-1.5 rounded-xl w-max">
                      <MapPin className="w-3 h-3 text-rose-500 fill-rose-500" /> {order.location}
                    </span>
                  </div>

                  {/* Status & Priority */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <StatusBadge status={order.status} />
                    </div>
                    
                    {/* Action Hub */}
                    <div className="flex gap-2">
                       <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-slate-900 transition-all text-xs uppercase shadow-lg shadow-indigo-100 group-hover:translate-x-1">
                          Log Dispatch <ChevronRight className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="premium-card p-20 text-center border-dashed border-2 border-slate-100 flex flex-col items-center gap-4 bg-white/50">
                 <div className="p-5 bg-slate-50 rounded-3xl text-slate-300">
                    <LayoutGrid className="w-12 h-12" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-700">No Dispatches Found</h3>
                    <p className="text-slate-400 text-sm mt-1">Sync your Tally Sales Register to pull new orders.</p>
                 </div>
                 <button onClick={loadData} className="btn-secondary mt-2">Sync Now</button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default DispatchCenter;
