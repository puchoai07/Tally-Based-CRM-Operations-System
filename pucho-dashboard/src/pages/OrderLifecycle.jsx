import React from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  Package,
  ShoppingCart,
  Zap,
  MoreVertical
} from 'lucide-react';

const orderLifecycle = [
  { stage: 'Order Received', status: 'Completed', date: '12 Apr, 10:00 AM', sla: '2h', actual: '15m', icon: ShoppingCart, color: 'emerald' },
  { stage: 'Material Check', status: 'Completed', date: '12 Apr, 11:30 AM', sla: '4h', actual: '30m', icon: Package, color: 'emerald' },
  { stage: 'Ready for Dispatch', status: 'In Progress', date: 'Today', sla: '24h', actual: '-', icon: Zap, color: 'indigo' },
  { stage: 'Dispatched', status: 'Pending', date: '-', sla: 'Same day', actual: '-', icon: CheckCircle, color: 'slate' },
];

const OrderLifecycle = () => {
  return (
    <div className="p-8 space-y-8 animate-fade-in">
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Lifecycle & Tracking</h1>
          <p className="text-slate-500 font-medium">Tally Sales Order Stage Management (UC-10)</p>
        </div>
        <div className="flex gap-3">
           <button className="btn-secondary">View History</button>
           <button className="btn-pucho">Update Stage</button>
        </div>
      </div>

      {/* SLA Health Indicator */}
      <div className="glass-card p-10 bg-indigo-900 text-white relative overflow-hidden border-none">
         <div className="relative z-10 flex flex-wrap lg:flex-nowrap items-center gap-12">
            <div className="flex flex-col items-center">
               <div className="w-20 h-20 rounded-[30px] bg-white/10 flex items-center justify-center backdrop-blur-md mb-4 border border-white/10">
                  <Clock className="w-10 h-10 text-indigo-300" />
               </div>
               <h4 className="text-sm font-black uppercase tracking-widest text-indigo-300">Average TAT</h4>
               <p className="text-2xl font-black">2.4 Hours</p>
            </div>
            <div className="flex-1 space-y-4">
               <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">On-Time Fulfillment Health</h3>
                    <p className="text-indigo-200 text-sm">Target: 95% SLA Compliance</p>
                  </div>
                  <span className="text-4xl font-black">94.2%</span>
               </div>
               <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '94.2%' }} transition={{ duration: 1.5 }} className="h-full bg-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.6)]" />
               </div>
            </div>
         </div>
         <Zap className="absolute top-0 right-0 w-64 h-64 text-white/5 -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Active Order Stage Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 glass-card p-8 bg-white min-h-[500px]">
            <h3 className="font-black text-slate-800 text-xl mb-10 flex items-center gap-3">
               <History className="w-6 h-6 text-indigo-600" /> Active Order Journey: #ORD-7721
            </h3>
            
            <div className="px-10 relative space-y-16">
               {/* Connector Line */}
               <div className="absolute left-[4.5rem] top-4 bottom-4 w-1 bg-slate-50 rounded-full" />
               
               {orderLifecycle.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex gap-10 items-start relative z-10"
                  >
                     <div className={`p-4 rounded-[22px] ${
                        item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xl shadow-emerald-50' : 
                        item.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 animate-pulse' : 
                        'bg-slate-50 text-slate-300 border border-slate-100'
                     }`}>
                        <item.icon className="w-6 h-6" />
                     </div>
                     <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start">
                           <div>
                              <h4 className={`text-lg font-black tracking-tight ${item.status === 'Pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                                 {item.stage} 
                              </h4>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{item.date}</p>
                           </div>
                           <div className="text-right">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                                 item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                                 item.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'
                              }`}>
                                 {item.status}
                              </span>
                              <div className="flex items-center gap-3 mt-2">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SLA: {item.sla}</span>
                                 {item.actual !== '-' && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">✔ {item.actual}</span>}
                              </div>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="space-y-6">
            <div className="glass-card p-6 border-l-4 border-l-rose-500 bg-rose-50/20">
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-xl shadow-rose-100">
                     <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-slate-900 tracking-tight">SLA Breaches</h4>
                     <p className="text-sm text-slate-500 uppercase font-black">03 Orders Delayed</p>
                  </div>
               </div>
            </div>

            <div className="glass-card p-8 space-y-6 flex-1 min-h-[400px] flex flex-col justify-center text-center">
               <div className="flex justify-center flex-col items-center">
                  <div className="w-20 h-20 rounded-[35px] bg-slate-50 flex items-center justify-center mb-6">
                     <History className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Timeline Visualizer</h3>
                  <p className="text-slate-400 text-sm mt-2 max-w-[200px]">Get a complete audit trail of every sales order transition stage from Tally.</p>
                  <button className="mt-8 btn-pucho w-3/4">View All Logs</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default OrderLifecycle;
