import { fetchFinancialInsightsData, formatCurrency, extractSheetDate } from '../lib/sheetService';
import ActivityIcon from '../assets/icons/activity.svg';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';

const FinancialInsight = () => {
    const { setLastUpdated } = useOutletContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Calculate Totals
    const totals = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return { sales: 0, expenses: 0, balance: 0 };

        try {
            const clean = (val) => {
                if (typeof val === 'number') return val;
                return parseFloat(String(val || '0').replace(/[^0-9.-]+/g, "")) || 0;
            };
            return data.reduce((acc, curr) => ({
                sales: acc.sales + clean(curr['sales_total']),
                expenses: acc.expenses + clean(curr['expenses_total']),
                balance: acc.balance + clean(curr['total_bank_balance'])
            }), { sales: 0, expenses: 0, balance: 0 });
        } catch (err) {
            console.error("Error calculating Financial totals:", err);
            return { sales: 0, expenses: 0, balance: 0 };
        }
    }, [data]);

    // Chart Data Preparation
    const chartData = useMemo(() => {
        return data.map(row => {
            const clean = (val) => parseFloat(String(val || '0').replace(/[^0-9.-]+/g, "")) || 0;
            return {
                name: row['profit_center'] || 'Unknown',
                Sales: clean(row['sales_total']),
                Expenses: clean(row['expenses_total']),
                Balance: clean(row['total_bank_balance'])
            };
        });
    }, [data]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchFinancialInsightsData();
                setData(result);

                // Update Context with specific sheet date
                const sheetDate = extractSheetDate(result);
                if (sheetDate) setLastUpdated(sheetDate);

            } catch (error) {
                console.error("Failed to fetch Financial Insight data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Helper to determine status color
    const getStatusColor = (status) => {
        const s = String(status).toLowerCase();
        if (s.includes('caution') || s.includes('risk') || s.includes('concerning')) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        if (s.includes('moderate')) return 'text-orange-600 bg-orange-50 border-orange-100';
        if (s.includes('healthy') || s.includes('good')) return 'text-green-600 bg-green-50 border-green-100';
        return 'text-gray-600 bg-gray-50 border-gray-100';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pucho-purple"></div>
            </div>
        );
    }



    return (
        <div className="space-y-6 font-inter w-full animate-fade-in">

            {/* Overview Summary Cards */}
            {data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard
                        title="TOTAL SALES"
                        value={formatCurrency(totals.sales)}
                        icon={TrendingUp}
                        iconBg="bg-blue-100"
                        iconColor="text-blue-600"
                        blobColor="bg-blue-50"
                        trend="Revenue"
                        trendColor="text-blue-600"
                        isPositive={true}
                    />
                    <SummaryCard
                        title="TOTAL EXPENSES"
                        value={formatCurrency(totals.expenses)}
                        icon={ArrowDownRight}
                        iconBg="bg-red-100"
                        iconColor="text-red-600"
                        blobColor="bg-red-50"
                        trend="Outflow"
                        trendColor="text-red-600"
                        isPositive={false}
                    />
                    <SummaryCard
                        title="TOTAL BANK BALANCE"
                        value={formatCurrency(totals.balance)}
                        icon={DollarSign}
                        iconBg="bg-emerald-100"
                        iconColor="text-emerald-600"
                        blobColor="bg-emerald-50"
                        trend="Holdings"
                        trendColor="text-gray-500"
                        isPositive={totals.balance >= 0}
                    />
                </div>
            )}

            {/* Chart Section */}
            {data.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-subtle">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Profit Center Performance</h3>
                            <p className="text-sm text-gray-500">Sales vs Expenses & Cash Reserves</p>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val)} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val)} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar yAxisId="left" dataKey="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} fillOpacity={0.8} />
                                <Bar yAxisId="left" dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} fillOpacity={0.8} />
                                <Line yAxisId="right" type="monotone" dataKey="Balance" name="Bank Balance" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((row, index) => {
                    const healthStatus = row['financial_health'] || 'Unknown';
                    const statusClass = getStatusColor(healthStatus);
                    const clean = (val) => parseFloat(String(val || '0').replace(/[^0-9.-]+/g, "")) || 0;

                    return (
                        <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-subtle hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                            {/* Header / Profit Center */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Profit Center</span>
                                    <h3 className="font-bold text-gray-900 text-sm">{row['profit_center'] || 'General'}</h3>
                                </div>
                                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${statusClass} max-w-[50%] truncate`} title={healthStatus}>
                                    {healthStatus.split('-')[0].trim()}
                                </div>
                            </div>

                            {/* Sales & Expenses */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <span className="text-xs text-gray-500 font-medium block mb-0.5">Total Sales</span>
                                    <span className="text-2xl font-bold text-gray-900 tracking-tight">{formatCurrency(clean(row['sales_total']))}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Expenses</span>
                                        <span className="text-sm font-bold text-red-600 font-mono">{formatCurrency(clean(row['expenses_total']))}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Invoices</span>
                                        <span className="text-sm font-bold text-gray-700 font-mono">{row['invoice_count'] || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Balance & Heads */}
                            <div className="pt-4 border-t border-gray-50 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Bank Balance</span>
                                    <span className="text-sm font-bold text-gray-900 font-mono">{formatCurrency(clean(row['total_bank_balance']))}</span>
                                </div>

                                {row['expense_heads'] && row['expense_heads'] !== '0' && (
                                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                                        <span className="font-bold text-gray-900 block mb-1">Key Heads</span>
                                        <p className="line-clamp-2 leading-relaxed" title={row['expense_heads']}>{row['expense_heads']}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {data.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <img src={ActivityIcon} alt="Empty" className="w-8 h-8 opacity-20" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">No financial insights found</h3>
                        <p className="text-sm text-gray-500 mt-1">Check the data source for updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialInsight;

const SummaryCard = ({ title, value, icon: Icon, iconBg, iconColor, blobColor, trend, trendColor, isPositive }) => (
    <div className="flex-1 bg-white p-6 rounded-[32px] border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group h-[160px] flex flex-col justify-center">
        {/* Blob Background */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 ${blobColor} rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none`}></div>

        <div className="flex justify-between items-center relative z-10 w-full">
            <div className="flex flex-col gap-1">
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className={`text-[32px] font-bold tracking-tight leading-none ${isPositive === undefined ? 'text-gray-900' : (isPositive ? 'text-emerald-600' : 'text-red-600')}`}>
                        {value}
                    </h3>
                </div>
                {trend && (
                    <div className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold ${trendColor}`}>
                        {trend}
                    </div>
                )}
            </div>

            <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 ml-4 shadow-sm`}>
                <Icon className={`w-7 h-7 ${iconColor}`} strokeWidth={1.5} />
            </div>
        </div>
    </div>
);
