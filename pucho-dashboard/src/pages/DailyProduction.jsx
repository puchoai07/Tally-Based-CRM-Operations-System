import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, ComposedChart, Area
} from 'recharts';
import { fetchDailyProductionData, formatCurrency } from '../lib/sheetService';

const DailyProduction = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const rawData = await fetchDailyProductionData();

                // Format data, extracting numbers from strings while avoiding NaNs
                const formattedData = rawData
                    .filter(item => item && item.date)
                    .map(item => {
                        const dateStr = item.date.replace(/"/g, '').trim();
                        return {
                            ...item,
                            Label: new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                            str_plant: parseFloat(item.str_plant) || 0,
                            bittren_GPL: parseFloat(item.bittren_GPL) || 0,
                            equl_br2_prod: parseFloat(item.equl_br2_prod) || 0,
                            total_hbr_prod: parseFloat(item.total_hbr_prod) || 0,
                            cabr2_prod: parseFloat(item.cabr2_prod) || 0,
                            cabr2_stock: parseFloat(item.cabr2_stock) || 0,
                            stripping_plant: parseFloat(item.stripping_plant) || 0,
                            frist_aid: parseFloat(item.frist_aid) || 0,
                            rawDate: dateStr
                        };
                    });

                // Sort by date chronological
                formattedData.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

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
        const totalHBR = data.reduce((acc, curr) => acc + curr.total_hbr_prod, 0);
        const totalCABR2 = data.reduce((acc, curr) => acc + curr.cabr2_prod, 0);
        const latestStock = data[data.length - 1].cabr2_stock;
        const avgBittren = data.reduce((acc, curr) => acc + curr.bittren_GPL, 0) / data.length;

        return {
            totalHBR: totalHBR.toFixed(2),
            totalCABR2: totalCABR2.toFixed(2),
            latestStock: latestStock.toFixed(2),
            avgBittren: avgBittren.toFixed(2)
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

    const tableHeaders = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'Label' && k !== 'rawDate') : [];

    // Compact number formatter for UI/Charts
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
                    <h1 className="text-2xl font-bold text-gray-900">Daily Production</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Analysis of Daily Plant Production Metrics
                    </p>
                </div>
            </div>

            {/* Analysis Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total HBR Prod</p>
                        <h4 className="text-3xl font-bold text-gray-900">{formatNumber(summary.totalHBR)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total CABR2 Prod</p>
                        <h4 className="text-3xl font-bold text-gray-900">{formatNumber(summary.totalCABR2)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest CABR2 Stock</p>
                        <h4 className="text-3xl font-bold text-[#10B981]">{formatNumber(summary.latestStock)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Avg Bittren GPL</p>
                        <h4 className="text-3xl font-bold text-[#4F46E5]">{formatNumber(summary.avgBittren)}</h4>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Chart 1: Core Production Trend (Line) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Production Trend</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="Label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={20} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={formatNumber} width={60} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" dataKey="total_hbr_prod" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="HBR Prod" />
                                <Line type="monotone" dataKey="cabr2_prod" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="CABR2 Prod" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Plant Operations & Stock (Composed) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Plant Ops & Stock Tracking</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="Label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={20} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={formatNumber} width={50} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={10} tickFormatter={formatNumber} width={50} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar yAxisId="left" dataKey="str_plant" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Str Plant" />
                                <Bar yAxisId="left" dataKey="stripping_plant" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Stripping Plant" />
                                <Line yAxisId="right" type="monotone" dataKey="cabr2_stock" stroke="#EF4444" strokeWidth={3} dot={false} name="CABR2 Stock" />
                            </ComposedChart>
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

export default DailyProduction;
