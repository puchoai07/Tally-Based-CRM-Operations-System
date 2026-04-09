import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Line, ComposedChart, Area
} from 'recharts';
import { fetchRepairsData } from '../lib/sheetService';

// Month ordering for Financial Year (April to March)
const monthOrder = {
    'apr': 1, 'may': 2, 'jun': 3, 'jul': 4, 'aug': 5, 'sep': 6,
    'oct': 7, 'nov': 8, 'dec': 9, 'jan': 10, 'feb': 11, 'mar': 12
};

const RepairsDashboard = () => {
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('All');

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const fetched = await fetchRepairsData();
                const cleaned = fetched
                    .filter(item => item && item.month && item.year)
                    .map(item => ({
                        ...item,
                        value: parseFloat(String(item.value).replace(/,/g, '')) || 0,
                        type: String(item.type).trim()
                    }))
                    .filter(item => item.value > 0);

                setRawData(cleaned);
            } catch (err) {
                console.error("Failed to fetch Repairs data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const data = useMemo(() => {
        if (!rawData || rawData.length === 0) return [];

        // Group data by Month/Year label
        const grouped = {};

        rawData.forEach(item => {
            const m = item.month.trim().toLowerCase().substring(0, 3);
            const y = item.year ? item.year.trim().split('-')[0] : 'Unknown';
            const label = `${m} ${y}`;

            if (!grouped[label]) {
                grouped[label] = {
                    Label: label,
                    month: m,
                    year: y,
                    total_repair: 0
                };
            }

            const typeKey = item.type;
            if (!grouped[label][typeKey]) {
                grouped[label][typeKey] = 0;
            }

            grouped[label][typeKey] += item.value;
            grouped[label].total_repair += item.value;
        });

        let formattedData = Object.values(grouped);

        // Sort chronologically by Financial Year then Month
        formattedData.sort((a, b) => {
            const yearA = parseInt(a.year, 10) || 0;
            const yearB = parseInt(b.year, 10) || 0;
            if (yearA !== yearB) return yearA - yearB;

            const monthA = monthOrder[a.month] || 99;
            const monthB = monthOrder[b.month] || 99;
            return monthA - monthB;
        });

        if (selectedType !== 'All') {
            return formattedData.map(d => ({
                Label: d.Label,
                [selectedType]: d[selectedType] || 0,
                total_repair: d[selectedType] || 0
            }));
        }

        return formattedData;
    }, [rawData, selectedType]);

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
        return formatted.replace('.0 ', ' ').replace(/\.00$/, '');
    };

    const formatCurrencyCompact = (value) => {
        if (!value || value === 0) return '₹0';
        return `₹${formatNumber(value)}`;
    };

    // Summary calculation for KPI cards
    const summary = useMemo(() => {
        if (!data || data.length === 0) return null;

        const latestRecord = data[data.length - 1];

        const validTotals = data.map(d => d.total_repair).filter(v => v !== 0 && !isNaN(v));
        const grandTotal = validTotals.reduce((acc, curr) => acc + curr, 0);
        const peakRepairCost = validTotals.length > 0 ? Math.max(...validTotals) : 0;
        const avgRepairCost = validTotals.length > 0 ? grandTotal / validTotals.length : 0;

        return {
            latestTotal: latestRecord.total_repair || 0,
            grandTotal,
            peakRepairCost,
            avgRepairCost
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

    // Dynamic extraction of all repair type keys for rendering Area maps
    const activeRepairTypes = selectedType === 'All'
        ? [...new Set(rawData.map(d => d.type))]
        : [selectedType];

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];

    return (
        <div className="p-6 space-y-8 animate-fade-in bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Infrastructure & Maintenance Repairs</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Timeline monitoring of overarching repair costs and segment allocations
                    </p>
                </div>

                <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    <label className="text-sm font-medium text-gray-500">Maintenance Area:</label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="bg-transparent text-sm font-semibold text-gray-900 focus:outline-none cursor-pointer"
                    >
                        <option value="All">All Facilities</option>
                        {[...new Set(rawData.map(d => d.type))].map(type => (
                            <option key={type} value={type}>{type.replace(/_/g, ' ').toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Analysis Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest Monthly Liability</p>
                        <h4 className="text-3xl font-bold text-[#4F46E5]">{formatCurrencyCompact(summary.latestTotal)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Peak Baseline Cost</p>
                        <h4 className="text-3xl font-bold text-[#F59E0B]">{formatCurrencyCompact(summary.peakRepairCost)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Aggregate Cost</p>
                        <h4 className="text-3xl font-bold text-[#ef4444]">{formatCurrencyCompact(summary.grandTotal)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Average Overhead Setup</p>
                        <h4 className="text-3xl font-bold text-[#10B981]">{formatCurrencyCompact(summary.avgRepairCost)}</h4>
                    </div>
                </div>
            )}

            {/* Composed Chart mapping maintenance loads */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Capital Maintenance Liabilities</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="Label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={20} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={formatCurrencyCompact} width={80} />

                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value, name) => [formatCurrencyCompact(value), name.replace(/_/g, ' ').toUpperCase()]}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(val) => val.replace(/_/g, ' ').toUpperCase()} />

                            {activeRepairTypes.map((type, index) => (
                                <Bar
                                    key={`bar-${type}`}
                                    dataKey={type}
                                    stackId="1"
                                    fill={COLORS[index % COLORS.length]}
                                    radius={[4, 4, 0, 0]}
                                />
                            ))}
                            {selectedType === 'All' && (
                                <Line
                                    type="monotone"
                                    dataKey="total_repair"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#ef4444' }}
                                    activeDot={{ r: 6 }}
                                    name="Overarching Total Liability"
                                />
                            )}
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
                                {activeRepairTypes.map((type) => (
                                    <th key={type} className="px-6 py-4 capitalize">{type.replace(/_/g, ' ')}</th>
                                ))}
                                {selectedType === 'All' && <th className="px-6 py-4 capitalize font-bold text-gray-900">Total Liability</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.length > 0 ? (
                                data.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                                            <span className="capitalize">{row.Label}</span>
                                        </td>
                                        {activeRepairTypes.map((type) => (
                                            <td key={`${index}-${type}`} className="px-6 py-4 text-gray-700">
                                                {formatCurrencyCompact(row[type] || 0)}
                                            </td>
                                        ))}
                                        {selectedType === 'All' && (
                                            <td className="px-6 py-4 text-gray-900 font-bold bg-gray-50/30">
                                                {formatCurrencyCompact(row.total_repair)}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={activeRepairTypes.length + 2} className="px-6 py-8 text-center text-gray-500">
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

export default RepairsDashboard;
