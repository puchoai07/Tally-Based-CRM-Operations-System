import React, { useState, useEffect, useMemo } from 'react';
import { fetchMISData, formatCurrency, extractSheetDate } from '../lib/sheetService';
import ActivityIcon from '../assets/icons/activity.svg';
import { motion } from 'framer-motion';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const MISAnalytical = () => {
    const { setLastUpdated } = useOutletContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'

    // Calculate Totals - MOVED UP due to Hook Rules
    // Calculate Totals
    const totals = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return { sales: 0, expenses: 0, netflow: 0 };

        try {
            const clean = (val) => {
                if (typeof val === 'number') return val;
                return parseFloat(String(val || '0').replace(/[^0-9.-]+/g, "")) || 0;
            };
            return data.reduce((acc, curr) => ({
                sales: acc.sales + clean(curr['Total Sales']),
                expenses: acc.expenses + clean(curr['Expenses']),
                netflow: acc.netflow + clean(curr['net_cash_flow'])
            }), { sales: 0, expenses: 0, netflow: 0 });
        } catch (err) {
            console.error("Error calculating MIS totals:", err);
            return { sales: 0, expenses: 0, netflow: 0 };
        }
    }, [data]);

    // Format Graph Data
    const chartData = useMemo(() => {
        return data.map(row => {
            const clean = (val) => parseFloat(String(val || '0').replace(/[^0-9.-]+/g, "")) || 0;
            return {
                name: `${new Date(row['Week Start']).getDate()} ${new Date(row['Week Start']).toLocaleString('default', { month: 'short' })}`,
                sales: clean(row['Total Sales']),
                expenses: clean(row['Expenses']),
                netflow: clean(row['net_cash_flow']),
                fullDate: `${row['Week Start']} - ${row['Week End']}`
            };
        });
    }, [data]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchMISData();
                setData(result);

                // Update Context with specific sheet date
                const sheetDate = extractSheetDate(result);
                if (sheetDate) setLastUpdated(sheetDate);

            } catch (error) {
                console.error("Failed to fetch MIS data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pucho-purple"></div>
            </div>
        );
    }





    return (
        <div className="space-y-6 font-inter max-w-[1600px] mx-auto animate-fade-in">

            {/* Overview Summary Cards */}
            {data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard
                        title="TOTAL SALES"
                        value={formatCurrency(totals.sales)}
                        icon={TrendingUp}
                        iconBg="bg-blue-100"
                        iconColor="text-blue-600"
                        blobColor="bg-blue-50"
                        trend="Revenue"
                        trendColor="text-blue-600"
                        isPositive={true}
                    />
                    <SummaryCard
                        title="TOTAL EXPENSES"
                        value={formatCurrency(totals.expenses)}
                        icon={ArrowDownRight}
                        iconBg="bg-red-100"
                        iconColor="text-red-600"
                        blobColor="bg-red-50"
                        trend="Outflow"
                        trendColor="text-red-600"
                        isPositive={false}
                    />
                    <SummaryCard
                        title="NET CASH FLOW"
                        value={formatCurrency(totals.netflow)}
                        icon={Activity}
                        iconBg="bg-emerald-100"
                        iconColor="text-emerald-600"
                        blobColor="bg-emerald-50"
                        trend="Net Position"
                        trendColor="text-gray-500"
                        isPositive={totals.netflow >= 0}
                    />
                </div>
            )}

            {/* Main Graph: Sales vs Expenses vs Net Flow */}
            {data.length > 0 && (
                <div className="bg-white rounded-[24px] border border-gray-200 shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Financial Performance</h2>
                            <p className="text-sm text-gray-500">Weekly breakdown of Sales, Expenses, and Cash Flow</p>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                                    tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val)}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                                    tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val)}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => formatCurrency(value)}
                                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar yAxisId="left" dataKey="sales" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.8} />
                                <Bar yAxisId="left" dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.8} />
                                <Line yAxisId="right" type="monotone" dataKey="netflow" name="Net Cash Flow" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}


            {/* View Toggle */}
            <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-xl backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2 px-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Records: {data.length}</span>
                </div>
                <div className="flex bg-white rounded-lg p-1 border border-gray-100 shadow-sm">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-pucho-purple text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-pucho-purple text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Cards
                    </button>
                </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Period</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total Sales</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Expenses</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Cash Inflow</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Top Customer</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.map((row, index) => {
                                    const clean = (val) => parseFloat(String(val || '0').replace(/[^0-9.-]+/g, "")) || 0;
                                    return (
                                        <tr key={index} className="hover:bg-blue-50/5 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900 text-sm whitespace-nowrap">{row['week_start']} - {row['week_end']}</div>
                                            </td>
                                            <td className="p-4 text-right font-mono text-sm text-gray-700">{formatCurrency(clean(row['total_sales']))}</td>
                                            <td className="p-4 text-right font-mono text-sm text-red-500">{formatCurrency(clean(row['expenses']))}</td>
                                            <td className="p-4 text-right font-mono text-sm font-bold text-green-600">{formatCurrency(clean(row['cash_inflow']))}</td>
                                            <td className="p-4 text-sm text-gray-600 truncate max-w-xs">{row['top_customer']}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Grid View (Cards) */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((row, index) => {
                        const clean = (val) => parseFloat(String(val || '0').replace(/[^0-9.-]+/g, "")) || 0;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-subtle hover:shadow-xl hover:border-blue-100 transition-all duration-300 group cursor-default"
                            >
                                {/* Card Header: Week */}
                                <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-50 group-hover:border-blue-50 transition-colors">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Fiscal Week</span>
                                        <h3 className="text-gray-900 font-bold text-sm bg-gray-50 px-2 py-1 rounded inline-block">
                                            {row['Week Start']} <span className="text-gray-400 mx-1">→</span> {row['Week End']}
                                        </h3>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Key Metrics */}
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[11px] text-gray-500 font-medium uppercase block mb-1">Total Sales</span>
                                            <span className="text-xl font-bold text-gray-900 tracking-tight block">{formatCurrency(clean(row['Total Sales']))}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[11px] text-gray-500 font-medium uppercase block mb-1">Net Cash Flow</span>
                                            <span className="text-xl font-bold text-green-600 tracking-tight block">{formatCurrency(clean(row['net_cash_flow']))}</span>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-700 uppercase">Cash Outflow</span>
                                            <span className="text-xs font-bold text-red-500">{formatCurrency(clean(row['Expenses']))} exp</span>
                                        </div>
                                        <div className="text-lg font-mono font-bold text-gray-900">{formatCurrency(clean(row['Cash Outflow']))}</div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex items-center justify-between text-xs py-1">
                                            <span className="text-gray-400 font-medium uppercase">Top Customer</span>
                                            <span className="font-bold text-pucho-purple truncate max-w-[140px]" title={row['Top Customer']}>{row['Top Customer']}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <img src={ActivityIcon} alt="Empty" className="w-8 h-8 opacity-20" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No report data found</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">Connecting to your data source. If this persists, please check your sheet connection.</p>
                </div>
            )}
        </div>
    );
};

export default MISAnalytical;

const SummaryCard = ({ title, value, icon: Icon, iconBg, iconColor, blobColor, trend, trendColor, isPositive }) => (
    <div className="flex-1 bg-white p-6 rounded-[32px] border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group h-[160px] flex flex-col justify-center">
        {/* Blob Background */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 ${blobColor} rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none`}></div>

        <div className="flex justify-between items-center relative z-10 w-full">
            <div className="flex flex-col gap-1">
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className={`text-[32px] font-bold tracking-tight leading-none ${isPositive === undefined ? 'text-gray-900' : (isPositive ? 'text-emerald-600' : 'text-red-600')}`}>
                        {value}
                    </h3>
                </div>
                {trend && (
                    <div className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold ${trendColor}`}>
                        {trend}
                    </div>
                )}
            </div>

            <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 ml-4 shadow-sm`}>
                <Icon className={`w-7 h-7 ${iconColor}`} strokeWidth={1.5} />
            </div>
        </div>
    </div>
);
