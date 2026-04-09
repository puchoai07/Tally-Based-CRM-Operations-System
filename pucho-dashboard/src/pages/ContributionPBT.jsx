import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import { fetchContributionPBTData, formatCurrency } from '../lib/sheetService';

// Month ordering for Financial Year (April to March)
const monthOrder = {
    'April': 1, 'May': 2, 'June': 3, 'July': 4, 'August': 5, 'September': 6,
    'October': 7, 'November': 8, 'December': 9, 'January': 10, 'February': 11, 'March': 12
};

const ContributionPBT = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const rawData = await fetchContributionPBTData();

                let formattedData = rawData
                    .filter(item => {
                        const vals = Object.values(item);
                        return vals.length >= 6 && vals[1] && vals[5]; // ensure month and year exist
                    })
                    .map(item => {
                        const vals = Object.values(item);
                        return {
                            id: vals[0],
                            month: vals[1],
                            revenue: parseFloat(String(vals[2]).replace(/,/g, '') || 0),
                            contrib: parseFloat(String(vals[3]).replace(/,/g, '') || 0),
                            pbt: parseFloat(String(vals[4]).replace(/,/g, '') || 0),
                            year: String(vals[5]).trim(),
                            Label: `${vals[1].substring(0, 3)} '${vals[5].split('-')[1] || vals[5]}`
                        };
                    });

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
                console.error("Failed to fetch data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Formatter
    const formatYAxis = (value) => {
        if (!value) return '₹0';
        const num = parseFloat(value);
        if (isNaN(num)) return value;

        const absNum = Math.abs(num);
        let formatted = '';
        if (absNum >= 10000000) {
            formatted = (num / 10000000).toFixed(1) + ' Cr';
        } else if (absNum >= 100000) {
            formatted = (num / 100000).toFixed(1) + ' L';
        } else if (absNum >= 1000) {
            formatted = (num / 1000).toFixed(1) + ' K';
        } else {
            formatted = num.toString();
        }

        const sign = num < 0 ? '-' : '';
        const cleanStr = formatted.replace('.0 ', ' ').replace('-', '');
        return `${sign}₹${cleanStr}`;
    };

    // Summary calculation for cards
    const summary = useMemo(() => {
        if (!data || data.length === 0) return null;

        const validRevData = data.filter(d => d.revenue !== 0 && !isNaN(d.revenue));
        const validPbtData = data.filter(d => d.pbt !== 0 && !isNaN(d.pbt));

        const validRev = data.map(d => d.revenue).filter(v => v !== 0 && !isNaN(v));
        const validContrib = data.map(d => d.contrib).filter(v => v !== 0 && !isNaN(v));

        const latestRev = validRevData.length > 0 ? validRevData[validRevData.length - 1].revenue : 0;
        const totalRev = validRev.reduce((acc, curr) => acc + curr, 0);
        const totalContrib = validContrib.reduce((acc, curr) => acc + curr, 0);
        const latestPbt = validPbtData.length > 0 ? validPbtData[validPbtData.length - 1].pbt : 0;

        return {
            latestRev,
            totalRev,
            totalContrib,
            latestPbt
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

    return (
        <div className="p-6 space-y-8 animate-fade-in bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contribution PBT Revenue</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Monthly Revenue vs Contribution tracking
                    </p>
                </div>
            </div>

            {/* Analysis Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Period Revenue</p>
                        <h4 className="text-3xl font-bold text-[#4F46E5]">{formatYAxis(summary.totalRev)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Period Contribution</p>
                        <h4 className="text-3xl font-bold text-[#10B981]">{formatYAxis(summary.totalContrib)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest Monthly Revenue</p>
                        <h4 className="text-3xl font-bold text-[#4F46E5]">{formatYAxis(summary.latestRev)}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 mb-1">Latest Monthly PBT</p>
                        {/* Dynamic color for negative profits */}
                        <h4 className={`text-3xl font-bold ${summary.latestPbt < 0 ? 'text-red-500' : 'text-[#F59E0B]'}`}>
                            {formatYAxis(summary.latestPbt)}
                        </h4>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Chart 1: Revenue vs Contribution (Bar) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue & Contribution</h3>
                    <p className="text-sm text-gray-400 mb-4">PBT excluded to prevent scale crushing</p>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="Label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={20} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={formatYAxis} width={50} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Revenue" />
                                <Bar dataKey="contrib" fill="#10B981" radius={[4, 4, 0, 0]} name="Contribution" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: PBT Trend Analysis (Line) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">PBT Performance</h3>
                    <p className="text-sm text-gray-400 mb-4">Isolated Profit Before Tax tracking</p>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="colorPBT" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="Label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} minTickGap={20} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={formatYAxis} width={50} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Area type="monotone" dataKey="pbt" stroke="#F59E0B" fillOpacity={1} fill="url(#colorPBT)" strokeWidth={3} activeDot={{ r: 6 }} name="PBT" />
                            </AreaChart>
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
                                                {/* Format currency columns, else show raw */}
                                                {(header === 'revenue' || header === 'contrib' || header === 'pbt') && row[header] !== ''
                                                    ? formatCurrency(row[header])
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

export default ContributionPBT;
