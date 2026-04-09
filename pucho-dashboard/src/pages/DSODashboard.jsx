import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, ComposedChart, Area
} from 'recharts';
import { fetchDSODashData } from '../lib/sheetService';

// Month ordering for Financial Year (April to March)
const monthOrder = {
    'April': 1, 'May': 2, 'June': 3, 'July': 4, 'August': 5, 'September': 6,
    'October': 7, 'November': 8, 'December': 9, 'January': 10, 'February': 11, 'March': 12
};

const DSODashboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const rawData = await fetchDSODashData();

                // Group data by Month/Year label
                const grouped = {};

                rawData.forEach(row => {
                    if (!row.month || !row.year) return;

                    const yearTrimmed = row.year.trim();
                    const yearPrefix = yearTrimmed.includes('-') ? yearTrimmed.split('-')[0] : yearTrimmed;
                    const label = `${row.month.trim().substring(0, 3)} ${yearPrefix}`;

                    if (!grouped[label]) {
                        grouped[label] = {
                            Label: label,
                            month: row.month.trim(),
                            year: yearTrimmed,
                            debtors: 0,
                            dso: 0
                        };
                    }

                    const val = parseFloat(String(row.value).replace(/,/g, '')) || 0;
                    if (row.type === 'debtors') {
                        grouped[label].debtors = val;
                    } else if (row.type === 'dso') {
                        grouped[label].dso = val;
                    }
                });

                let formattedData = Object.values(grouped);

                // Sort chronologically by Financial Year then Month
                formattedData.sort((a, b) => {
                    const yearA = parseInt(a.year.split('-')[0], 10) || 0;
                    const yearB = parseInt(b.year.split('-')[0], 10) || 0;
                    if (yearA !== yearB) return yearA - yearB;

                    const monthA = monthOrder[a.month] || 99;
                    const monthB = monthOrder[b.month] || 99;
                    return monthA - monthB;
                });

                setData(formattedData);
            } catch (err) {
                console.error("Failed to fetch DSO data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Formatter
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

    // Summary calculation for cards
    const summary = useMemo(() => {
        if (!data || data.length === 0) return null;

        const validDebtors = data.map(d => d.debtors).filter(v => v !== 0 && !isNaN(v));
        const validDso = data.map(d => d.dso).filter(v => v !== 0 && !isNaN(v));

        const getLatest = (arr, key) => {
            const valid = arr.filter(d => d[key] !== 0 && !isNaN(d[key]));
            return valid.length > 0 ? valid[valid.length - 1][key] : 0;
        };

        const latestDebtors = getLatest(data, 'debtors');
        const latestDso = getLatest(data, 'dso');
        const peakDebtors = validDebtors.length > 0 ? Math.max(...validDebtors) : 0;
        const avgDso = validDso.length > 0 ? validDso.reduce((a, b) => a + b, 0) / validDso.length : 0;

        return {
            latestDebtors,
            latestDso,
            peakDebtors,
            avgDso: avgDso.toFixed(1)
        };
    }, [data]);

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

    const tableHeaders = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'Label' && k !== 'month' && k !== 'year') : [];

    return (
        <div className="p-6 space-y-8 animate-fade-in bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Days Sales Outstanding (DSO)</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Timeline tracking for Debtors Volume against DSO metric values
                    </p>
                </div>
            </div>

            {/* Analysis Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest Debtors Volume</p>
                        <h4 className="text-3xl font-bold text-[#4F46E5]">{formatNumber(summary.latestDebtors)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Peak Exposure Recorded</p>
                        <h4 className="text-3xl font-bold text-[#F59E0B]">{formatNumber(summary.peakDebtors)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest DSO Tracker</p>
                        <h4 className="text-3xl font-bold text-[#10B981]">{summary.latestDso} <span className="text-lg text-gray-400 font-medium">days</span></h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Historical Average DSO</p>
                        <h4 className="text-3xl font-bold text-[#8B5CF6]">{summary.avgDso} <span className="text-lg text-gray-400 font-medium">days avg</span></h4>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume vs Speed (DSO) Tracker</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="colorDsoDebtors" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="Label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={20} />

                            {/* Left Y-Axis for Debtors Volume */}
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={formatNumber} width={50} />

                            {/* Right Y-Axis for DSO Days */}
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={10} width={50} />

                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            <Area yAxisId="left" type="monotone" dataKey="debtors" stroke="#4F46E5" fillOpacity={1} fill="url(#colorDsoDebtors)" strokeWidth={3} activeDot={{ r: 6 }} name="Total Debtors" />
                            <Line yAxisId="right" type="monotone" dataKey="dso" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="DSO Days" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Raw Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Historical Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 capitalize">Timeline</th>
                                {tableHeaders.map((header) => (
                                    <th key={header} className="px-6 py-4 capitalize">{header.replace(/_/g, ' ')}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.length > 0 ? (
                                data.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-700 font-medium">
                                            {row.Label}
                                        </td>
                                        {tableHeaders.map((header) => (
                                            <td key={`${index}-${header}`} className="px-6 py-4 text-gray-700">
                                                {header === 'debtors' ? formatNumber(row[header]) : row[header]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={tableHeaders.length + 1 || 1} className="px-6 py-8 text-center text-gray-500">
                                        No data available for this view.
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

export default DSODashboard;
