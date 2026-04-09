import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import { fetchCreditorRMPMData } from '../lib/sheetService';

const CreditorRMPM = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const rawData = await fetchCreditorRMPMData();

                // Format data, extracting numbers from strings while avoiding NaNs
                const formattedData = rawData
                    .filter(item => item && item.month)
                    .map(item => {
                        const yearRaw = item.year ? item.year.trim() : '';
                        const yearPrefix = yearRaw.includes('-') ? yearRaw.split('-')[0] : yearRaw;
                        return {
                            ...item,
                            Label: `${item.month.trim()} ${yearPrefix}`.trim(),
                            days: parseFloat(item.days) || 0,
                            creditors: parseFloat(String(item.creditors).replace(/,/g, '')) || 0,
                            year: yearRaw
                        };
                    });

                // Since this might not be standard dates, we rely on the sheet's existing sorting or 'id'
                if (formattedData.length > 0 && formattedData[0].id) {
                    formattedData.sort((a, b) => parseInt(a.id) - parseInt(b.id));
                }

                setData(formattedData);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Memoize the summary cards data
    const summary = useMemo(() => {
        if (!data || data.length === 0) return null;

        const validCreditors = data.map(d => d.creditors).filter(v => v > 0);
        const validDays = data.map(d => d.days).filter(v => v > 0);

        const latestCreditors = data[data.length - 1].creditors;
        const latestDays = data[data.length - 1].days;

        const peakCreditors = validCreditors.length > 0 ? Math.max(...validCreditors) : 0;
        const avgDays = validDays.length > 0 ? validDays.reduce((acc, curr) => acc + curr, 0) / validDays.length : 0;

        return {
            latestCreditors,
            latestDays,
            peakCreditors,
            avgDays: avgDays.toFixed(1)
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

    const tableHeaders = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'Label') : [];

    // Custom hybrid formatter to safely display Thousands as K, Lakhs as L, Crores as Cr
    const formatNumber = (value) => {
        if (value === undefined || value === null || isNaN(value)) return '0';
        if (value >= 10000000) return (value / 10000000).toFixed(2) + 'Cr';
        if (value >= 100000) return (value / 100000).toFixed(2) + 'L';
        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
        return value.toString();
    };

    return (
        <div className="p-6 space-y-8 animate-fade-in bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Creditor RM PM</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Tracking Creditor Data Over Time
                    </p>
                </div>
            </div>

            {/* Analysis Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest Creditors</p>
                        <h4 className="text-3xl font-bold text-gray-900">{formatNumber(summary.latestCreditors)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Peak Creditors</p>
                        <h4 className="text-3xl font-bold text-gray-900">{formatNumber(summary.peakCreditors)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest Days Tracked</p>
                        <h4 className="text-3xl font-bold text-[#10B981]">{summary.latestDays}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Avg Days Tracked</p>
                        <h4 className="text-3xl font-bold text-[#4F46E5]">{summary.avgDays}</h4>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Chart 1: Creditors Trend (Line) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Creditors Trend Overview</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="Label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={20} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={formatNumber} width={50} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => formatNumber(value)}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" dataKey="creditors" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Creditors" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Days Tracker (Bar) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Days Tracker</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="Label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={20} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={formatNumber} width={50} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => formatNumber(value)}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="days" fill="#10B981" radius={[4, 4, 0, 0]} name="Days" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Raw Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Raw Data View</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-medium">
                            <tr>
                                {tableHeaders.map((header) => (
                                    <th key={header} className="px-6 py-4 capitalize">{header.replace(/_/g, ' ')}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.length > 0 ? (
                                data.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        {tableHeaders.map((header) => (
                                            <td key={`${index}-${header}`} className="px-6 py-4 text-gray-700">
                                                {(typeof row[header] === 'number')
                                                    ? formatNumber(row[header])
                                                    : row[header]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={tableHeaders.length || 1} className="px-6 py-8 text-center text-gray-500">
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

export default CreditorRMPM;
