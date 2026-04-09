import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Line, ComposedChart, Area
} from 'recharts';
import { fetchTopBottomLineData } from '../lib/sheetService';

const monthOrder = {
    'apr': 1, 'may': 2, 'jun': 3, 'jul': 4, 'aug': 5, 'sep': 6,
    'oct': 7, 'nov': 8, 'dec': 9, 'jan': 10, 'feb': 11, 'mar': 12,
    'april': 1, 'june': 3, 'july': 4, 'august': 5, 'september': 6, 'october': 7, 'november': 8, 'december': 9, 'january': 10, 'february': 11, 'march': 12
};

const TopBottomLineDashboard = () => {
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const fetched = await fetchTopBottomLineData();

                const cleaned = fetched
                    .filter(item => item && item.year && item.month)
                    .map(item => ({
                        ...item,
                        budgeted: parseFloat(String(item.budgeted).replace(/,/g, '')) || 0,
                        actual: parseFloat(String(item.actual).replace(/,/g, '')) || 0,
                        type: String(item.type).trim()
                    }))
                    .filter(item => item.budgeted !== 0 || item.actual !== 0);

                setRawData(cleaned);

                if (cleaned.length > 0) {
                    const types = [...new Set(cleaned.map(d => d.type))];
                    if (types.length > 0) setSelectedType(types[0]);
                }
            } catch (err) {
                console.error("Failed to fetch Top Bottom Line data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const data = useMemo(() => {
        if (!rawData || rawData.length === 0 || !selectedType) return [];

        const filtered = rawData.filter(d => d.type === selectedType);

        // Group by month and year
        const grouped = {};
        filtered.forEach(item => {
            const m = item.month.trim().toLowerCase();
            const mShort = m.substring(0, 3);
            const y = item.year.trim().split('-')[0];
            const label = `${mShort} ${y}`;

            if (!grouped[label]) {
                grouped[label] = {
                    Label: label,
                    month: m,
                    year: y,
                    budgeted: 0,
                    actual: 0,
                    count: 0
                };
            }

            grouped[label].budgeted += item.budgeted;
            grouped[label].actual += item.actual;
            grouped[label].count += 1;
        });

        const formattedData = Object.values(grouped).map(g => ({
            ...g,
            budgeted: g.count > 0 ? parseFloat((g.budgeted / g.count).toFixed(2)) : 0,
            actual: g.count > 0 ? parseFloat((g.actual / g.count).toFixed(2)) : 0,
            variance: g.count > 0 ? parseFloat(((g.actual / g.count) - (g.budgeted / g.count)).toFixed(2)) : 0
        }));

        formattedData.sort((a, b) => {
            const yearA = parseInt(a.year, 10) || 0;
            const yearB = parseInt(b.year, 10) || 0;
            if (yearA !== yearB) return yearA - yearB;
            const monthA = monthOrder[a.month] || 99;
            const monthB = monthOrder[b.month] || 99;
            return monthA - monthB;
        });

        return formattedData;
    }, [rawData, selectedType]);

    // KPI Summary
    const summary = useMemo(() => {
        if (!data || data.length === 0) return null;

        const latestRecord = data[data.length - 1];

        const sumBudget = data.reduce((acc, curr) => acc + curr.budgeted, 0);
        const sumActual = data.reduce((acc, curr) => acc + curr.actual, 0);

        const avgBudget = sumBudget / data.length;
        const avgActual = sumActual / data.length;
        const overallVariance = sumActual - sumBudget;

        return {
            latestBudget: latestRecord.budgeted,
            latestActual: latestRecord.actual,
            avgBudget: avgBudget.toFixed(2),
            avgActual: avgActual.toFixed(2),
            overallVariance: overallVariance.toFixed(2)
        };
    }, [data]);

    // Custom Number Formatter (K, L, Cr to prevent Chromium T bug)
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
            formatted = Number.isInteger(num) ? num.toString() : num.toFixed(2);
        }
        return `₹${formatted.replace('.0 ', ' ').replace(/\.00$/, '')}`;
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

    const availableTypes = [...new Set(rawData.map(d => d.type))];

    return (
        <div className="p-6 space-y-8 animate-fade-in bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Top & Bottom Line Analysis</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Comparative overview of Budgeted projections vs Actual financial recordings
                    </p>
                </div>

                <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    <label className="text-sm font-medium text-gray-500">Line Metric:</label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="bg-transparent text-sm font-semibold text-gray-900 focus:outline-none cursor-pointer uppercase"
                    >
                        {availableTypes.map(type => (
                            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>

            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest Monthly Budget</p>
                        <h4 className="text-3xl font-bold text-[#8B5CF6]">{formatNumber(summary.latestBudget)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest Monthly Actuals</p>
                        <h4 className={`text-3xl font-bold ${summary.latestActual >= summary.latestBudget ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {formatNumber(summary.latestActual)}
                        </h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Trailing Average Attained</p>
                        <h4 className="text-3xl font-bold text-[#F59E0B]">{formatNumber(summary.avgActual)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Cumulative Run-Rate Variance</p>
                        <h4 className={`text-3xl font-bold ${summary.overallVariance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {summary.overallVariance >= 0 ? '+' : ''}{formatNumber(summary.overallVariance)}
                        </h4>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">{selectedType.replace(/_/g, ' ')} - Tracking Curve</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorAchieve" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="Label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={20} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} width={80} tickFormatter={formatNumber} />

                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} formatter={(value) => formatNumber(value)} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            <Area type="monotone" dataKey="actual" stroke="#10B981" fillOpacity={1} fill="url(#colorAchieve)" strokeWidth={3} name="Physical Actuals" />
                            <Line type="monotone" dataKey="budgeted" stroke="#8B5CF6" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#8B5CF6' }} activeDot={{ r: 6 }} name="Budgeted Target" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Historical Metric Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 capitalize">Timeline</th>
                                <th className="px-6 py-4 capitalize">Budgeted Run-Rate</th>
                                <th className="px-6 py-4 capitalize">Physical Actuals</th>
                                <th className="px-6 py-4 capitalize">Variance Deviation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.length > 0 ? (
                                data.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 font-medium capitalize">
                                            {row.Label}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-medium text-purple-600">
                                            {formatNumber(row.budgeted)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-medium text-emerald-600">
                                            {formatNumber(row.actual)}
                                        </td>
                                        <td className={`px-6 py-4 font-bold ${row.variance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {row.variance >= 0 ? '+' : ''}{formatNumber(row.variance)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No metrics found matching the filter selection.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TopBottomLineDashboard;
