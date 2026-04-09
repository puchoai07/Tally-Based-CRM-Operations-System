import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tallyService } from '../services/tallyService';
import { 
  CreditCard, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  Plus,
  Filter,
  DollarSign,
  RefreshCcw,
  Search
} from 'lucide-react';

const PaymentPlanning = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePriority, setActivePriority] = useState('All');

  const loadData = async () => {
    setLoading(true);
    const result = await tallyService.getPayablesData();
    if (result && result.length > 0) {
      setPayments(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 45000); 
    return () => clearInterval(interval);
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter(pay => {
      const vendorName = pay.vendor || '';
      const vendorId = pay.id || '';
      const matchesSearch = vendorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           vendorId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = activePriority === 'All' || pay.priority === activePriority;
      return matchesSearch && matchesPriority;
    });
  }, [payments, searchTerm, activePriority]);

  const totalSum = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + (parseFloat(String(p.amount).replace(/₹|,/g, '')) || 0), 0);
  }, [filteredPayments]);

  return (
    <div className="p-8 space-y-8 animate-fade-in">
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Planning</h1>
          <p className="text-slate-500 font-medium">Daily Outflow Proposal & Approval (UC-9)</p>
        </div>
        <div className="flex gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search vendors..."
                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-indigo-500/20 outline-none w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex bg-slate-100 p-1 rounded-xl">
              {['All', 'Critical', 'High'].map(prio => (
                <button 
                  key={prio}
                  onClick={() => setActivePriority(prio)}
                  className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${
                    activePriority === prio ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  {prio}
                </button>
              ))}
           </div>
           <button onClick={loadData} className="btn-glass flex items-center gap-2 shadow-sm border-slate-200">
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Vendors
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <motion.div whileHover={{ y: -5 }} className="premium-card p-8 bg-indigo-600 text-white border-none shadow-2xl shadow-indigo-100 flex justify-between items-center overflow-hidden relative">
            <div className="relative z-10">
               <p className="text-xs font-black uppercase tracking-widest text-indigo-200">Proposed Outflow Today</p>
               <h2 className="text-4xl font-black mt-2">₹{(totalSum/100000).toFixed(2)}L</h2>
               <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-indigo-100 bg-white/10 px-3 py-1 rounded-full w-max">
                  <Clock className="w-3 h-3" /> Tally Creditors Snapshot
               </div>
            </div>
            <Wallet className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
         </motion.div>

         <div className="premium-card p-8 bg-white flex justify-between items-center">
            <div>
               <p className="text-xs font-black uppercase tracking-widest text-slate-400">Approved Payments</p>
               <h2 className="text-4xl font-black text-slate-800 mt-2">₹0.00</h2>
               <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for Bank Transfer
               </p>
            </div>
            <div className="p-5 rounded-3xl bg-emerald-50 text-emerald-600">
               <CreditCard className="w-8 h-8" />
            </div>
         </div>

         <div className="premium-card p-8 bg-rose-50 border-rose-100 flex justify-between items-center">
            <div>
               <p className="text-xs font-black uppercase tracking-widest text-rose-400">Overdue Payables</p>
               <h2 className="text-4xl font-black text-rose-600 mt-2">₹{(totalSum/200000).toFixed(2)}L</h2>
               <p className="text-xs font-bold text-rose-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Escalation in 24 Hours
               </p>
            </div>
            <div className="p-5 rounded-3xl bg-white text-rose-500 shadow-sm">
               <AlertCircle className="w-8 h-8" />
            </div>
         </div>
      </div>

      <div className="premium-card overflow-hidden bg-white">
         <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800">Priority Payment Proposal</h3>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest border border-slate-100 px-4 py-2 rounded-xl">{filteredPayments.length} Items Matching</div>
         </div>
         
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Vendor Detail</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Priority</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {filteredPayments.length > 0 ? filteredPayments.map((pay, i) => (
                  <tr key={i} className="group hover:bg-slate-50/30 transition-all cursor-pointer">
                     <td className="px-8 py-6">
                        <div className="font-black text-slate-800">{pay.vendor}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">REF: {String(pay.id).substring(0, 8)} • Due: {pay.dueDate}</div>
                     </td>
                     <td className="px-8 py-6 font-black text-slate-800 text-lg">{pay.amount}</td>
                     <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                           pay.priority === 'Critical' ? 'bg-rose-100 text-rose-600' : 
                           pay.priority === 'High' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                           {pay.priority}
                        </span>
                     </td>
                     <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                             <Clock className={`w-4 h-4 ${pay.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'}`} />
                             {pay.status}
                          </div>
                      </td>
                     <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-indigo-600"><ArrowRight className="w-4 h-4" /></button>
                        </div>
                     </td>
                  </tr>
               )) : (
                <tr>
                   <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-medium border-dashed border-2 border-slate-50">
                      No vendors found matching "{searchTerm}" or priority "{activePriority}"
                   </td>
                </tr>
               )}
            </tbody>
         </table>
      </div>

      <div className="premium-card p-10 bg-indigo-900 border-none relative overflow-hidden flex flex-wrap lg:flex-nowrap items-center gap-12">
          <div className="relative z-10 flex flex-col items-start gap-4">
             <div className="w-16 h-16 rounded-[28px] bg-white/10 backdrop-blur-xl flex items-center justify-center text-indigo-300">
                <ShieldCheck className="w-8 h-8" />
             </div>
             <h3 className="text-3xl font-black text-white tracking-tight">Approval Required</h3>
             <p className="text-indigo-200 font-medium max-w-sm">Payments above <b>₹5,00,000</b> require direct manager authorization as per Pucho.ai policy rules.</p>
             <button className="btn-premium bg-white text-indigo-900 shadow-xl shadow-indigo-950 mt-4 px-12">View Pending Approvals</button>
          </div>
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }} 
            className="absolute -right-20 -top-20 opacity-10"
          >
             <ShieldCheck className="w-[500px] h-[500px] text-white" />
          </motion.div>
      </div>
    </div>
  );
};

export default PaymentPlanning;
