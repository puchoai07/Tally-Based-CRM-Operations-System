import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Line, ComposedChart, Area
} from 'recharts';
import { fetchRMProportionData } from '../lib/sheetService';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#14B8A6'];

const RMProportionDashboard = () => {
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState('All');

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const fetched = await fetchRMProportionData();

                const cleaned = fetched
                    .filter(item => item && item.year)
                    .map(item => ({
                        ...item,
                        mt: parseFloat(String(item.mt).replace(/,/g, '')) || 0,
                        keys1: parseFloat(String(item.keys1).replace(/,/g, '')) || 0,
                        value: parseFloat(String(item.value).replace(/,/g, '')) || 0,
                        items: String(item.items).trim()
                    }))
                    .filter(item => item.value > 0 || item.mt > 0);

                setRawData(cleaned);
            } catch (err) {
                console.error("Failed to fetch RM Proportion data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const data = useMemo(() => {
        if (!rawData || rawData.length === 0) return [];

        let workingData = rawData;

        // Apply item filter
        if (selectedItem !== 'All') {
            workingData = workingData.filter(d => d.items === selectedItem);
        }

        // Aggregate Data by Year Month (e.g. "2017-01")
        const grouped = {};
        workingData.forEach(item => {
            const label = item.year.trim();
            if (!grouped[label]) {
                grouped[label] = {
                    Label: label,
                    sortKey: label.replace('-', ''),
                    mt: 0,
                    value: 0,
                    keys1: 0,
                    count: 0
                };
            }
            grouped[label].mt += item.mt;
            grouped[label].value += item.value;
            grouped[label].keys1 += item.keys1;
            grouped[label].count += 1;
        });

        // Convert grouped object to array and calculate valid proportion averages
        const formattedData = Object.values(grouped).map(g => ({
            ...g,
            keys1: g.count > 0 ? parseFloat((g.keys1 / g.count).toFixed(2)) : 0
        }));

        // Sort chronologically ascending
        formattedData.sort((a, b) => parseInt(a.sortKey, 10) - parseInt(b.sortKey, 10));

        return formattedData;
    }, [rawData, selectedItem]);

    // Custom Number Formatter
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

    // KPI Card Summaries
    const summary = useMemo(() => {
        if (!data || data.length === 0) return null;

        const latestRecord = data[data.length - 1];
        const validMT = data.map(d => d.mt).filter(v => v !== 0 && !isNaN(v));
        const validValue = data.map(d => d.value).filter(v => v !== 0 && !isNaN(v));
        const validProp = data.map(d => d.keys1).filter(v => v !== 0 && !isNaN(v));

        const totalMT = validMT.reduce((acc, curr) => acc + curr, 0);
        const totalValue = validValue.reduce((acc, curr) => acc + curr, 0);

        const avgProportion = validProp.length > 0
            ? validProp.reduce((a, b) => a + b, 0) / validProp.length
            : 0;

        return {
            latestMT: latestRecord.mt,
            latestValue: latestRecord.value,
            latestProportion: latestRecord.keys1,
            totalMT,
            totalValue,
            avgProportion: avgProportion.toFixed(2)
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

    const availableItems = ['All', ...new Set(rawData.map(d => d.items))].filter(Boolean);

    return (
        <div className="p-6 space-y-8 animate-fade-in bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">RM Proportions Analysis</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Timeline analysis of raw material consumption weightings against total value costs
                    </p>
                </div>

                <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    <label className="text-sm font-medium text-gray-500">Material Selection:</label>
                    <select
                        value={selectedItem}
                        onChange={(e) => setSelectedItem(e.target.value)}
                        className="bg-transparent text-sm font-semibold text-gray-900 focus:outline-none cursor-pointer"
                    >
                        {availableItems.map(item => (
                            <option key={item} value={item}>{item === 'All' ? 'Overall Materials' : item}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Analysis Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest Monthly Weight</p>
                        <h4 className="text-3xl font-bold text-[#4F46E5]">{formatNumber(summary.latestMT)} <span className="text-lg text-gray-400 font-medium">MT</span></h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest Evaluated Cost</p>
                        <h4 className="text-3xl font-bold text-[#F59E0B]">{formatCurrencyCompact(summary.latestValue)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Consumption Tonnage</p>
                        <h4 className="text-3xl font-bold text-[#10B981]">{formatNumber(summary.totalMT)} <span className="text-lg text-gray-400 font-medium">MT</span></h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Average Proportion Score</p>
                        <h4 className="text-3xl font-bold text-[#ef4444]">{summary.avgProportion}</h4>
                    </div>
                </div>
            )}

            {/* Composed Chart Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume Operations (Tonnage vs Liability)</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorMT" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="Label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={20} />

                            {/* Left Y-Axis for MT Validation */}
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={formatNumber} width={60} />

                            {/* Right Y-Axis for Financial Values */}
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={10} tickFormatter={formatCurrencyCompact} width={80} />

                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            <Area yAxisId="left" type="monotone" dataKey="mt" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorMT)" strokeWidth={3} name="Total Material Volume (MT)" />
                            <Line yAxisId="right" type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B' }} activeDot={{ r: 6 }} name="Total Cost Liability" />
                            <Bar yAxisId="left" dataKey="keys1" fill="#14B8A6" radius={[4, 4, 0, 0]} name="Proportion Weight" barSize={30} />
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
                                {selectedItem === 'All' && <th className="px-6 py-4 capitalize">Aggregated Logs</th>}
                                <th className="px-6 py-4 capitalize">Consumed Weight</th>
                                <th className="px-6 py-4 capitalize">Overhead Proportion</th>
                                <th className="px-6 py-4 capitalize">Cost Valuation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.length > 0 ? (
                                data.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 font-medium">
                                            {row.Label}
                                        </td>
                                        {selectedItem === 'All' && <td className="px-6 py-4 text-gray-700">{row.count} entries</td>}
                                        <td className="px-6 py-4 text-gray-700 font-semibold text-emerald-600">
                                            {formatNumber(row.mt)} MT
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {row.keys1}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-semibold text-amber-600">
                                            {formatCurrencyCompact(row.value)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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

export default RMProportionDashboard;
