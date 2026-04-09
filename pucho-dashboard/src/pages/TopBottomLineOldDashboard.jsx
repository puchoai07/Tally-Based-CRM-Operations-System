import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { fetchTopBottomLineOldData } from '../lib/sheetService';

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#14B8A6'];

const TopBottomLineOldDashboard = () => {
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const fetched = await fetchTopBottomLineOldData();

                const cleaned = fetched
                    .filter(item => item && item.key)
                    .map(item => ({
                        ...item,
                        value: parseFloat(String(item.value).replace(/,/g, '')) || 0,
                        type: String(item.type).trim(),
                        key: String(item.key).trim()
                    }));

                setRawData(cleaned);

                if (cleaned.length > 0) {
                    const types = [...new Set(cleaned.map(d => d.type))];
                    if (types.length > 0) setSelectedType(types[0]);
                }
            } catch (err) {
                console.error("Failed to fetch Top Bottom Line Old data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const data = useMemo(() => {
        if (!rawData || rawData.length === 0 || !selectedType) return [];

        return rawData.filter(d => d.type === selectedType);
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
                    <h1 className="text-2xl font-bold text-gray-900">Top & Bottom Line (Legacy)</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Historical summarized view of legacy line parameters mapping budgeted vs targeted limits
                    </p>
                </div>

                <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    <label className="text-sm font-medium text-gray-500">Metric Segment:</label>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">{selectedType} Key Value Matrix</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="key" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} width={80} tickFormatter={formatNumber} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => formatNumber(value)}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Data Grid Summary */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden col-span-1">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">Historical Metric Log</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4 capitalize">Metric Segment</th>
                                    <th className="px-6 py-4 capitalize">Key Identifier</th>
                                    <th className="px-6 py-4 capitalize">Overarching Liability</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.length > 0 ? (
                                    data.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-900 font-medium capitalize">
                                                {row.type}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 font-medium capitalize">
                                                {row.key}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-[#8B5CF6]">
                                                {formatNumber(row.value)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                            No tracking keys found.
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

export default TopBottomLineOldDashboard;
