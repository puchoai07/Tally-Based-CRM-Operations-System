import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Target, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  MessageSquare,
  Sparkles,
  TrendingUp,
  RotateForward,
  ChevronRight,
  MoreVertical,
  Activity,
  History,
  Star
} from 'lucide-react';
import { tallyService } from '../services/tallyService';

const ProductivityBriefing = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [briefing, setBriefing] = useState("");
    const [mode, setMode] = useState('DayStart'); // 'DayStart' or 'DayEnd'
    const [reasons, setReasons] = useState({});
    const [statusUpdates, setStatusUpdates] = useState({});

    const fetchTasks = async () => {
        setLoading(true);
        const data = await tallyService.getTasks();
        // Fallback for demo if no tasks exist
        const finalTasks = data.length > 0 ? data : [
            { id: 'T-101', customer: 'Vardhman Ind.', type: 'GSTR Error', detail: 'Missing HSN Code in Invoice #BDG-349', priority: 'High', status: 'Pending' },
            { id: 'T-102', customer: 'Static Ent.', type: 'Follow-up', detail: 'Payment overdue by 12 days (₹1.2L)', priority: 'Medium', status: 'Pending' },
            { id: 'T-103', customer: 'Global Exchange', type: 'Bank Recon', detail: 'Unmatched entry of ₹45,000 from Oct 2', priority: 'Critical', status: 'InProgress' },
        ];
        setTasks(finalTasks);
        
        // Simulating AI Briefing generation
        setBriefing(`Good morning! You've got ${finalTasks.length} critical items to address today. Focus on the Global Exchange reconciliation first—it's tied to an overdue SLA.`);
        
        setTimeout(() => setLoading(false), 800);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleStatusUpdate = (id, status) => {
        setStatusUpdates(prev => ({ ...prev, [id]: status }));
    };

    const handleReasonChange = (id, reason) => {
        setReasons(prev => ({ ...prev, [id]: reason }));
    };

    const submitDayEnd = async () => {
        setLoading(true);
        // This would call the Pucho Studio Webhook
        console.log("Submitting Day End Report:", { tasks, statusUpdates, reasons });
        setTimeout(() => {
            alert("Day End Report Submitted! Manager notified via WhatsApp.");
            setLoading(false);
        }, 1500);
    };

    const productivityScore = useMemo(() => {
        const completed = tasks.filter(t => t.status === 'Completed').length;
        return Math.min(100, (completed / tasks.length) * 100 || 65); // 65 as baseline
    }, [tasks]);

    return (
        <div className="p-8 space-y-10 animate-fade-in bg-slate-50/30 min-h-screen">
            
            {/* Header: AI Morning Pulse */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
                        <button 
                            onClick={() => setMode('DayStart')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'DayStart' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
                        >
                            Day Start Briefing
                        </button>
                        <button 
                            onClick={() => setMode('DayEnd')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'DayEnd' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
                        >
                            Day End Reporting
                        </button>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px]">
                            <Sparkles className="w-3 h-3" /> AI Productivity Briefing
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            {mode === 'DayStart' ? 'Your Action Plan' : 'Shift Closure Report'}
                        </h1>
                        <p className="text-slate-500 font-medium">Monitoring Workflows WF-9, 10 & 28</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                        <History className="w-4 h-4" /> Past Performance
                    </button>
                    <button onClick={fetchTasks} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                        <Zap className="w-4 h-4" /> Refresh Day Scan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                
                {/* Left: AI Context & Insights */}
                <div className="xl:col-span-2 space-y-10">
                    
                    {/* Morning Briefing Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="premium-card p-10 bg-slate-900 text-white border-none relative overflow-hidden group"
                    >
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-indigo-500 shadow-2xl shadow-indigo-500/40">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight uppercase tracking-widest text-xs text-indigo-400">Personalized Briefing</h3>
                            </div>
                            <p className="text-2xl font-medium leading-relaxed italic text-indigo-50 group-hover:text-white transition-colors">
                                "{briefing}"
                            </p>
                            <div className="pt-6 flex gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Est. Time</p>
                                    <p className="text-xl font-black">4.2 Hrs</p>
                                </div>
                                <div className="h-10 w-[1px] bg-white/10" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Focus Intensity</p>
                                    <p className="text-xl font-black">Medium</p>
                                </div>
                            </div>
                        </div>
                        <Activity className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 opacity-10" />
                    </motion.div>

                    {/* Task Board / Closure Table */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest text-[11px] opacity-60">
                                {mode === 'DayStart' ? "Today's Assigned Operations" : "Shift Closure Status"}
                            </h3>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase">WF-9 Active</span>
                                <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[10px] font-black uppercase">{tasks.length} Total</span>
                            </div>
                        </div>

                        {mode === 'DayEnd' ? (
                            <div className="premium-card overflow-hidden bg-white">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400">Task Detail</th>
                                            <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400">Outcome</th>
                                            <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400">Reason (If Pending)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {tasks.map(task => (
                                            <tr key={task.id}>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-800">{task.customer}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-black">{task.id} • {task.type}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select 
                                                        onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                                                        className="bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-100"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Blocked">Blocked</option>
                                                        <option value="CarryForward">Carry Forward</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input 
                                                        type="text"
                                                        placeholder="e.g. Waiting for material"
                                                        onChange={(e) => handleReasonChange(task.id, e.target.value)}
                                                        disabled={statusUpdates[task.id] === 'Completed'}
                                                        className="w-full bg-slate-50 border-none rounded-xl text-xs px-4 py-2 outline-none disabled:opacity-30"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex justify-end">
                                    <button 
                                        onClick={submitDayEnd}
                                        className="btn-premium px-12 h-12 shadow-indigo-100"
                                    >
                                        Submit Final Report & Notify Manager
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {tasks.map((task, i) => (
                                        <motion.div 
                                            key={task.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="premium-card p-6 bg-white hover:border-indigo-100 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${task.priority === 'Critical' ? 'bg-rose-500 animate-pulse' : 'bg-indigo-400'}`} />
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.type}</p>
                                                    </div>
                                                    <h4 className="text-lg font-black text-slate-800 tracking-tight">{task.customer}</h4>
                                                </div>
                                                <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                                    <MoreVertical className="w-4 h-4 text-slate-300" />
                                                </button>
                                            </div>
                                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
                                                {task.detail}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                                                    <Clock className="w-3 h-3" /> Due: Today
                                                </div>
                                                <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Add New Task Proxy */}
                                <div className="p-6 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-400 cursor-pointer transition-all group">
                                    <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 transition-colors mb-2">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Self Assignment</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Productivity Meter & End of Day */}
                <div className="space-y-10">
                    
                    {/* Focus Meter */}
                    <div className="premium-card p-10 bg-white shadow-2xl shadow-indigo-100 flex flex-col items-center text-center">
                        <div className="relative w-40 h-40 mb-8">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                <motion.circle 
                                    cx="80" cy="80" r="70" fill="none" stroke="#4f46e5" strokeWidth="12" 
                                    strokeDasharray="440"
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * (productivityScore / 100)) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <h2 className="text-4xl font-black text-slate-800">{Math.round(productivityScore)}%</h2>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Productivity</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-black text-slate-800">Operational Pulse</h3>
                        <p className="text-xs text-slate-400 mt-2 font-medium">Tracking performance for Day Start/End (WF-10/28)</p>
                        
                        <div className="w-full mt-8 grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 text-left">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">On-Time</p>
                                <p className="font-black text-slate-800 tracking-tight">88%</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50 text-left border border-emerald-100">
                                <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Rank</p>
                                <p className="font-black text-emerald-700 tracking-tight">Top 5%</p>
                            </div>
                        </div>
                    </div>

                    {/* End of Day: Carry Forward */}
                    <div className="premium-card p-8 bg-indigo-50 border-indigo-100 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <RotateForward className="w-4 h-4 text-indigo-600" />
                                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Carry-Forward Engine</h3>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Mark items for automated carry-forward to next business day briefing (WF-28).
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            {tasks.filter(t => t.status !== 'Completed').slice(0, 2).map((t, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-indigo-100/50">
                                    <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{t.customer}</span>
                                    <button className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter hover:underline">Mark for Tomorrow</button>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
                            Submit Day-End Report
                        </button>
                    </div>

                    {/* Achievement Card */}
                    <div className="premium-card p-6 bg-amber-50 border-amber-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-100">
                            <Star className="w-6 h-6 fill-white" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">New Badges</p>
                            <h4 className="text-sm font-black text-slate-800">"Workflow Warrior" unlocked!</h4>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductivityBriefing;
