import React, { useState, useEffect, useMemo } from 'react';
import { fetchKPIData, formatCurrency, extractSheetDate } from '../lib/sheetService';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';

// Template Icons
import DollarIcon from '../assets/icons/marketplace.svg';
import ActivityIcon from '../assets/icons/activity.svg';
import CreditIcon from '../assets/icons/Property 2=Credits, Property 1=Default.png';
import WalletIcon from '../assets/icons/marketplace.svg';
import ArrowUpIcon from '../assets/icons/Property 2=Arrow Right, Property 1=Default.png';
import ArrowDownIcon from '../assets/icons/Property 2=Arrow Down, Property 1=Default.png';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

// --- Simple Classic Card (V4) ---
const ClassicCard = ({ title, value, icon, colorClass, trendDirection, trendPercent }) => {
    const isPositive = trendDirection === 'up';

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-subtle hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-[170px]">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${colorClass} bg-opacity-10 flex-shrink-0`}>
                    <img src={icon} alt={title} className="w-5 h-5 object-contain" style={{ filter: 'currentColor' }} />
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
                {trendDirection !== 'neutral' && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        <img src={isPositive ? ArrowUpIcon : ArrowDownIcon} className={`w-3 h-3 ${isPositive ? '-rotate-45' : ''}`} alt="" />
                        <span>{Math.abs(trendPercent).toFixed(1)}%</span>
                        <span className="text-gray-400 font-normal ml-1">vs yesterday</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const CardsGrid = () => {
    const { setLastUpdated } = useOutletContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchKPIData();
                setData(result);

                // Update Context with specific sheet date
                const sheetDate = extractSheetDate(result);
                if (sheetDate) setLastUpdated(sheetDate);

            } catch (error) {
                console.error("Failed to fetch sheet data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const metrics = useMemo(() => {
        if (!data || data.length === 0) return null;

        const latest = data[0];
        const previous = data[1] || latest;

        const calculateTrend = (current, previous) => {
            const currVal = parseFloat(String(current).replace(/,/g, ''));
            const prevVal = parseFloat(String(previous).replace(/,/g, ''));
            if (!prevVal) return { direction: 'neutral', percent: 0 };
            const change = ((currVal - prevVal) / Math.abs(prevVal)) * 100;
            return { direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral', percent: change };
        };

        return {
            latest,
            salesTrend: calculateTrend(latest['Total Sales Amount'], previous['Total Sales Amount']),
            paymentsTrend: calculateTrend(latest['Total Payment Amount'], previous['Total Payment Amount']),
            cashflowTrend: calculateTrend(latest['Net Cash Flow'], previous['Net Cash Flow']),
            liquidityTrend: calculateTrend(latest['Total Liquidity (Cash + Bank)'], previous['Total Liquidity (Cash + Bank)']),
        };
    }, [data]);

    // Prepare Chart Data
    const chartData = useMemo(() => {
        return [...data].reverse().map(item => ({
            date: formatDate(item['current date'] || item.Date), // Handle both key variations
            sales: parseFloat(String(item['Total Sales Amount']).replace(/,/g, '')) || 0,
            payments: parseFloat(String(item['Total Payment Amount']).replace(/,/g, '')) || 0,
            cashflow: parseFloat(String(item['Net Cash Flow']).replace(/,/g, '')) || 0,
        }));
    }, [data]);

    // Aggregated Donut Data (Use latest or sum of view? Let's use Sum of current view)
    const donutData = useMemo(() => {
        const totalSales = chartData.reduce((acc, cur) => acc + cur.sales, 0);
        const totalPayments = chartData.reduce((acc, cur) => acc + cur.payments, 0);
        return [
            { name: 'Total Sales', value: totalSales },
            { name: 'Total Payments', value: totalPayments }
        ];
    }, [chartData]);

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pucho-purple"></div></div>;
    // Debug Block
    if (!metrics) {
        const debugKeys = data && data.length > 0 ? Object.keys(data[0]).join(', ') : 'No data';
        return (
            <div className="p-8 text-center text-gray-500">
                <p>No KPI data available.</p>
                <div className="bg-yellow-50 p-4 mt-4 text-left text-xs text-yellow-800 border border-yellow-200 rounded overflow-auto">
                    <strong>Debug Info:</strong><br />
                    Data Length: {data ? data.length : 'null'}<br />
                    Headers: {debugKeys}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ClassicCard
                    title="Total Sales"
                    value={formatCurrency(metrics.latest['Total Sales Amount'])}
                    icon={DollarIcon}
                    colorClass="bg-blue-500 text-blue-600"
                    trendDirection={metrics.salesTrend.direction}
                    trendPercent={metrics.salesTrend.percent}
                />
                <ClassicCard
                    title="Total Payments"
                    value={formatCurrency(metrics.latest['Total Payment Amount'])}
                    icon={CreditIcon}
                    colorClass="bg-rose-500 text-rose-600"
                    trendDirection={metrics.paymentsTrend.direction}
                    trendPercent={metrics.paymentsTrend.percent}
                />
                <ClassicCard
                    title="Net Cash Flow"
                    value={formatCurrency(metrics.latest['Net Cash Flow'])}
                    icon={ActivityIcon}
                    colorClass="bg-purple-500 text-purple-600"
                    trendDirection={metrics.cashflowTrend.direction}
                    trendPercent={metrics.cashflowTrend.percent}
                />
                <ClassicCard
                    title="Total Liquidity"
                    value={formatCurrency(metrics.latest['Total Liquidity (Cash + Bank)'])}
                    icon={WalletIcon}
                    colorClass="bg-emerald-500 text-emerald-600"
                    trendDirection={metrics.liquidityTrend.direction}
                    trendPercent={metrics.liquidityTrend.percent}
                />
                <ClassicCard
                    title="Receivables"
                    value={formatCurrency(metrics.latest['Total Receivables'])}
                    icon={CreditIcon}
                    colorClass="bg-amber-500 text-amber-600"
                    trendDirection="neutral"
                />
                <ClassicCard
                    title="Payables"
                    value={formatCurrency(metrics.latest['Total Payables'])}
                    icon={CreditIcon}
                    colorClass="bg-pink-500 text-pink-600"
                    trendDirection="neutral"
                />
                <ClassicCard
                    title="Sales Vouchers"
                    value={metrics.latest['Sales Voucher Count']}
                    icon={ActivityIcon}
                    colorClass="bg-indigo-500 text-indigo-600"
                    trendDirection="neutral"
                />
            </div>

            {/* Charts Section - Grid Layout */}
            {chartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Donut Chart: Cash Flow Mix */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-subtle flex flex-col"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Cash Flow Mix</h2>
                        <p className="text-sm text-gray-500 mb-6">Total Sales vs Payments Distribution</p>

                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={donutData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                    >
                                        <Cell fill="#3b82f6" /> {/* Sales - Blue */}
                                        <Cell fill="#f43f5e" /> {/* Payments - Rose */}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Legend
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        iconType="circle"
                                        wrapperStyle={{ paddingTop: '20px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Bar Chart: Financial Trends */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-subtle flex flex-col"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Financial Trends</h2>
                        <p className="text-sm text-gray-500 mb-6">Daily Sales & Payments</p>

                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                                        </linearGradient>
                                        <linearGradient id="paymentsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11, fill: '#4b5563' }}
                                        axisLine={{ stroke: '#9ca3af' }}
                                        tickLine={{ stroke: '#9ca3af' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#4b5563' }}
                                        axisLine={{ stroke: '#9ca3af' }}
                                        tickLine={{ stroke: '#9ca3af' }}
                                        tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
                                            padding: '12px 20px',
                                            fontFamily: 'Inter, sans-serif'
                                        }}
                                        formatter={(value, name) => [
                                            <span className="font-bold text-gray-900">₹{value.toLocaleString()}</span>,
                                            <span className="text-xs uppercase tracking-wider font-medium text-gray-500">{name}</span>
                                        ]}
                                        labelStyle={{ marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '13px' }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        height={36}
                                        iconType="circle"
                                    />

                                    <Bar
                                        dataKey="sales"
                                        name="Sales"
                                        barSize={32}
                                        radius={[4, 4, 0, 0]}
                                        fill="url(#salesGradient)"
                                    />
                                    <Bar
                                        dataKey="payments"
                                        name="Payments"
                                        barSize={32}
                                        radius={[4, 4, 0, 0]}
                                        fill="url(#paymentsGradient)"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 shadow-subtle overflow-hidden mt-4">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Recent History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Vouchers</th>
                                <th className="px-6 py-3">Sales</th>
                                <th className="px-6 py-3">Payments</th>
                                <th className="px-6 py-3">Cash Flow</th>
                                <th className="px-6 py-3">Receivables</th>
                                <th className="px-6 py-3">Payables</th>
                                <th className="px-6 py-3">Liquidity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 10).map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{row['Sales Voucher Count']}</td>
                                    <td className="px-6 py-4">{formatCurrency(row['Total Sales Amount'])}</td>
                                    <td className="px-6 py-4">{formatCurrency(row['Total Payment Amount'])}</td>
                                    <td className="px-6 py-4 text-emerald-600 font-medium">{formatCurrency(row['Net Cash Flow'])}</td>
                                    <td className="px-6 py-4">{formatCurrency(row['Total Receivables'])}</td>
                                    <td className="px-6 py-4">{formatCurrency(row['Total Payables'])}</td>
                                    <td className="px-6 py-4 font-medium">{formatCurrency(row['Total Liquidity (Cash + Bank)'])}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CardsGrid;
