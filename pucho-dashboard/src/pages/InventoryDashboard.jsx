import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tallyService } from '../services/tallyService';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  ArrowRight,
  Filter,
  BarChart3,
  Box,
  Layers,
  RefreshCcw,
  Zap
} from 'lucide-react';

const InventoryDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [aiTasks, setAiTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await tallyService.getDashboardStats();
      const stockData = await tallyService.getInventoryData();
      
      if (stockData) setInventory(stockData);
      if (result && result.tasks) {
        setAiTasks(result.tasks.filter(t => t.task_type === 'Refill Task' || t.task_type === 'Procurement'));
      }
    } catch (e) {
      console.error("Failed to load inventory data", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 45000);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total SKUs', value: inventory.length, icon: Box, color: 'text-indigo-600' },
    { label: 'Low Stock Alerts', value: inventory.filter(i => i.stock < 10 && i.stock > 0).length, icon: AlertTriangle, color: 'text-amber-500' },
    { label: 'Out of Stock', value: inventory.filter(i => i.stock <= 0).length, icon: Layers, color: 'text-rose-500' },
    { label: 'Stock Value', value: 'Live Sync', icon: TrendingUp, color: 'text-emerald-500' },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inventory & Planning</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Real-time Stock Monitor & Shortfall Analysis (UC-11)</p>
        </div>
        <div className="flex gap-4">
           <button onClick={loadData} className="btn-secondary flex items-center gap-2 border-slate-200">
             <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Tally Stock
           </button>
           <button className="btn-pucho flex items-center gap-2 shadow-xl shadow-indigo-100">
             <BarChart3 className="w-4 h-4" /> Material Forecast
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
          </motion.div>
        ))}
      </div>

      {/* Inventory List */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
             <button className="px-6 py-2 rounded-xl text-xs font-black bg-white shadow-sm text-indigo-600 uppercase tracking-widest">All Stock</button>
             <button className="px-6 py-2 rounded-xl text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Low Stock</button>
             <button className="px-6 py-2 rounded-xl text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Raw Material</button>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Items/Categories..." 
              className="pl-12 pr-6 py-3 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-50/50 w-80 text-sm font-medium shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* AI Smart Suggestion Section (WF-7) */}
        {aiTasks.length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Smart Refill Queue</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {aiTasks.map((task, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="premium-card p-5 bg-gradient-to-r from-indigo-50/50 to-white border-l-4 border-l-indigo-500"
                 >
                   <div className="flex justify-between items-start">
                     <div>
                       <h4 className="font-black text-slate-800">{task.customer || 'Material Alert'}</h4>
                       <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tight">{task.detail}</p>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                       task.priority === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                     }`}>
                       {task.priority}
                     </span>
                   </div>
                   <button className="mt-4 w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors">
                     Create PO Reference
                   </button>
                 </motion.div>
               ))}
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredItems.length > 0 ? filteredItems.map((item, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={item.name}
                className="premium-card p-6 group hover:border-indigo-100 transition-all bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      item.stock <= 0 ? 'bg-rose-50 text-rose-500' : 
                      item.stock < 10 ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-indigo-500'
                    }`}>
                      <Package className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-xl tracking-tight">{item.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                        {item.stock < 10 && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase tracking-tighter">
                            <AlertTriangle className="w-3 h-3" /> Reorder Soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 text-right">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Qty</p>
                      <h4 className={`text-2xl font-black ${item.stock <= 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                        {item.stock.toLocaleString()} <span className="text-sm text-slate-400 font-bold ml-1">Units</span>
                      </h4>
                    </div>
                    <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                       <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="premium-card p-20 text-center border-dashed border-2 border-slate-100 flex flex-col items-center gap-4 bg-white/50">
                 <div className="p-5 bg-slate-50 rounded-3xl text-slate-300">
                    <Zap className="w-12 h-12" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-700">No Inventory Data Synced</h3>
                 <button onClick={loadData} className="btn-secondary">Retry Sync</button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
