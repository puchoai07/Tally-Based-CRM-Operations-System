import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { fetchDebtorAgeingData, fetchDebtorOutstandingData, formatCurrency } from '../lib/sheetService';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const DebtorsDashboard = () => {
    const [ageingData, setAgeingData] = useState([]);
    const [outstandingData, setOutstandingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Fetch both datasets concurrently
                const [rawAgeing, rawOutstanding] = await Promise.all([
                    fetchDebtorAgeingData(),
                    fetchDebtorOutstandingData()
                ]);

                // --- Process Ageing Data ---
                const formattedAgeing = rawAgeing
                    .filter(item => item && item.days && item.amount)
                    .map(item => ({
                        ...item,
                        amount: parseFloat(String(item.amount).replace(/,/g, '')) || 0,
                    }));
                formattedAgeing.sort((a, b) => b.amount - a.amount);
                setAgeingData(formattedAgeing);

                // --- Process Outstanding Data ---
                const formattedOutstanding = rawOutstanding
                    .filter(item => item && item.month && item.year)
                    .map(item => {
                        const yearTrimmed = item.year.trim();
                        const yearPrefix = yearTrimmed.includes('-') ? yearTrimmed.split('-')[0] : yearTrimmed;
                        return {
                            ...item,
                            debtors: parseFloat(String(item.debtors).replace(/,/g, '')) || 0,
                            days: parseFloat(String(item.days).replace(/,/g, '')) || 0,
                            year: yearTrimmed,
                            Label: `${item.month.trim().substring(0, 3)} ${yearPrefix}`
                        }
                    });
                setOutstandingData(formattedOutstanding);

            } catch (err) {
                console.error("Failed to fetch Debtors Data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Summaries
    const ageingSummary = useMemo(() => {
        if (!ageingData || ageingData.length === 0) return null;
        const totalAmount = ageingData.reduce((acc, curr) => acc + curr.amount, 0);
        const largestSegment = ageingData[0];
        return {
            totalAmount,
            largestCategory: largestSegment.days,
            largestAmount: largestSegment.amount,
            totalCategories: ageingData.length
        };
    }, [ageingData]);

    const outstandingSummary = useMemo(() => {
        if (!outstandingData || outstandingData.length === 0) return null;
        const validDebtors = outstandingData.map(d => d.debtors).filter(v => v > 0);
        const validDays = outstandingData.map(d => d.days).filter(v => v > 0);
        const latestDebtors = outstandingData[outstandingData.length - 1].debtors;
        const latestDays = outstandingData[outstandingData.length - 1].days;
        const peakDebtors = validDebtors.length > 0 ? Math.max(...validDebtors) : 0;
        const avgDays = validDays.length > 0
            ? validDays.reduce((a, b) => a + b, 0) / validDays.length
            : 0;

        return {
            latestDebtors,
            latestDays,
            peakDebtors,
            avgDays: avgDays.toFixed(1)
        };
    }, [outstandingData]);

    // Formatters
    const formatNumber = (value) => {
        if (!value) return '0';
        const num = parseFloat(value);
        if (isNaN(num)) return value;

        let formatted = '';
        if (num >= 10000000) {
            formatted = (num / 10000000).toFixed(1) + ' Cr';
        } else if (num >= 100000) {
            formatted = (num / 100000).toFixed(1) + ' L';
        } else if (num >= 1000) {
            formatted = (num / 1000).toFixed(1) + ' K';
        } else {
            formatted = num.toString();
        }
        return formatted.replace('.0 ', ' ');
    };

    const formatCurrencyCompact = (value) => {
        if (value === 0) return '₹0';
        return `₹${formatNumber(value)}`;
    };

    const AgeingTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                    <p className="font-medium text-gray-900 mb-2">{payload[0].payload.days}</p>
                    <p className="text-[#4F46E5] font-semibold">
                        Amount: {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-8 min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pucho-purple"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    const ageingHeaders = ageingData.length > 0 ? Object.keys(ageingData[0]) : [];
    const outstandingHeaders = outstandingData.length > 0 ? Object.keys(outstandingData[0]).filter(k => k !== 'Label') : [];

    return (
        <div className="p-6 space-y-8 animate-fade-in bg-gray-50 min-h-screen">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Debtors Analysis Dashboards</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Unified view of Ageing buckets and Outstanding timeline balances
                </p>
            </div>

            {/* Combined KPI Section */}
            {(ageingSummary || outstandingSummary) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Ageing Highlights */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Overdue Exposed</p>
                        <h4 className="text-3xl font-bold text-[#4F46E5]">{formatCurrencyCompact(ageingSummary?.totalAmount || 0)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Highest Exposure Bracket</p>
                        <h4 className="text-xl font-bold text-gray-900 truncate" title={ageingSummary?.largestCategory}>
                            {ageingSummary?.largestCategory || 'N/A'}
                        </h4>
                    </div>
                    {/* Outstanding Highlights */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest Outstanding Volume</p>
                        <h4 className="text-3xl font-bold text-[#F59E0B]">{formatNumber(outstandingSummary?.latestDebtors || 0)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Historical Debtor Days</p>
                        <h4 className="text-3xl font-bold text-[#10B981]">{outstandingSummary?.avgDays || 0} <span className="text-lg text-gray-400 font-medium">days avg</span></h4>
                    </div>
                </div>
            )}

            {/* Outstanding Timelines */}
            <h2 className="text-xl font-bold text-gray-800 pt-4 border-b pb-2">Debtor Outstanding Timeline</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Debtors Timeline */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Debtors volume</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={outstandingData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorDebtors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="Label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={20} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={formatNumber} width={40} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} formatter={(value) => formatNumber(value)} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Area type="monotone" dataKey="debtors" stroke="#4F46E5" fillOpacity={1} fill="url(#colorDebtors)" strokeWidth={3} activeDot={{ r: 6 }} name="Debtors" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Days Timeline */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Debtor Days</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={outstandingData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="Label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={20} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} width={40} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" dataKey="days" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Days Tracker" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Ageing Distributions */}
            <h2 className="text-xl font-bold text-gray-800 pt-4 border-b pb-2">Ageing Distributions</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ageing Bar Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bucket Spread</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ageingData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} tickFormatter={formatCurrencyCompact} />
                                <YAxis dataKey="days" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} width={120} />
                                <Tooltip content={<AgeingTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                <Bar dataKey="amount" fill="#4F46E5" radius={[0, 4, 4, 0]}>
                                    {ageingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Ageing Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Liability Share</h3>
                    <div className="flex-1 flex items-center justify-center min-h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={ageingData} cx="50%" cy="50%" labelLine={false} outerRadius={100} innerRadius={60} fill="#8884d8" dataKey="amount" nameKey="days" paddingAngle={3}>
                                    {ageingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Custom Legend to save space */}
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        {ageingData.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                <span className="truncate max-w-[100px]" title={entry.days}>{entry.days}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Split Data Tables Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-4">

                {/* Ageing Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                        <h3 className="text-lg font-semibold text-gray-900">Overdue Buckets Log</h3>
                    </div>
                    <div className="overflow-auto max-h-[400px]">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white sticky top-0 z-10 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    {ageingHeaders.map((header) => (
                                        <th key={header} className="px-6 py-3 capitalize">{header.replace(/_/g, ' ')}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {ageingData.length > 0 ? (
                                    ageingData.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            {ageingHeaders.map((header) => (
                                                <td key={`${index}-${header}`} className="px-6 py-3 text-gray-700">
                                                    {header === 'amount' ? formatCurrency(row[header]) : row[header]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={ageingHeaders.length || 1} className="px-6 py-8 text-center text-gray-500">
                                            No ageing data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Outstanding Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                        <h3 className="text-lg font-semibold text-gray-900">Outstanding Timeline Log</h3>
                    </div>
                    <div className="overflow-auto max-h-[400px]">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white sticky top-0 z-10 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    {outstandingHeaders.map((header) => (
                                        <th key={header} className="px-6 py-3 capitalize">{header.replace(/_/g, ' ')}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {outstandingData.length > 0 ? (
                                    outstandingData.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            {outstandingHeaders.map((header) => (
                                                <td key={`${index}-${header}`} className="px-6 py-3 text-gray-700">
                                                    {header === 'debtors' ? formatNumber(row[header]) : row[header]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={outstandingHeaders.length || 1} className="px-6 py-8 text-center text-gray-500">
                                            No outstanding timeline data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default DebtorsDashboard;
