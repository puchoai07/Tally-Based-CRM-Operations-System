import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import { fetchActTurnoverSpeedData } from '../lib/sheetService';

const ActTurnoverSpeed = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const rawData = await fetchActTurnoverSpeedData();

                // Format the actual data from the sheet: ID, AOP, Speed, Year
                const formattedData = rawData
                    .filter(item => item && item.Year) // ensure it has a year
                    .map(item => ({
                        ...item,
                        AOP: parseFloat(item.AOP || 0),
                        Speed: parseFloat(item.Speed || 0),
                        Year: item.Year.trim(),
                    }))
                    .sort((a, b) => {
                        const yearA = parseInt(a.Year.split('-')[0], 10);
                        const yearB = parseInt(b.Year.split('-')[0], 10);
                        return yearA - yearB;
                    });

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

    // Summary calculation for cards
    const summary = useMemo(() => {
        if (!data || data.length === 0) return null;

        const validAOP = data.map(d => d.AOP).filter(v => v > 0);
        const validSpeed = data.map(d => d.Speed).filter(v => v > 0);

        const latestAOP = data[data.length - 1].AOP;
        const latestSpeed = data[data.length - 1].Speed;

        const peakAOP = validAOP.length > 0 ? Math.max(...validAOP) : 0;
        const peakSpeed = validSpeed.length > 0 ? Math.max(...validSpeed) : 0;

        return {
            latestAOP,
            latestSpeed,
            peakAOP,
            peakSpeed
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

    // Get keys for table headers
    const tableHeaders = data.length > 0 ? Object.keys(data[0]) : [];

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

    return (
        <div className="p-6 space-y-8 animate-fade-in bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Act Turnover Speed</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Analysis of AOP versus Speed over Years
                    </p>
                </div>
            </div>

            {/* Analysis Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest AOP</p>
                        <h4 className="text-3xl font-bold text-[#4F46E5]">{formatNumber(summary.latestAOP)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest Speed</p>
                        <h4 className="text-3xl font-bold text-[#10B981]">{formatNumber(summary.latestSpeed)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Peak AOP Tracking</p>
                        <h4 className="text-3xl font-bold text-[#4F46E5]">{formatNumber(summary.peakAOP)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Peak Speed Tracking</p>
                        <h4 className="text-3xl font-bold text-[#10B981]">{formatNumber(summary.peakSpeed)}</h4>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Chart 1: Bar Chart (AOP vs Speed) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AOP vs Speed (Bar)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="Year" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={formatNumber} width={40} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    formatter={(value) => formatNumber(value)}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="AOP" fill="#4F46E5" radius={[4, 4, 0, 0]} name="AOP" />
                                <Bar dataKey="Speed" fill="#10B981" radius={[4, 4, 0, 0]} name="Speed" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Line Chart Trend */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AOP vs Speed (Trend)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="Year" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={formatNumber} width={40} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => formatNumber(value)}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" dataKey="AOP" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="AOP" />
                                <Line type="monotone" dataKey="Speed" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Speed" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Raw Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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

export default ActTurnoverSpeed;
