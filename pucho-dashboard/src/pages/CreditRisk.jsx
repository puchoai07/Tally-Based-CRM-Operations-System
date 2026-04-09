import { fetchCreditRiskData, formatCurrency, extractSheetDate } from '../lib/sheetService';
import ActivityIcon from '../assets/icons/activity.svg';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Search, Download } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import ChevronLeftIcon from '../assets/icons/chevron_left.png';
import ChevronRightIcon from '../assets/icons/chevron_right.png';
import { useState, useEffect, useMemo } from 'react';

const CreditRisk = () => {
    const { setLastUpdated } = useOutletContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchCreditRiskData();
                setData(Array.isArray(result) ? result : []);

                // Update Context with specific sheet date
                const sheetDate = extractSheetDate(result);
                if (sheetDate) setLastUpdated(sheetDate);

            } catch (error) {
                console.error("Failed to fetch Credit Risk data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Helper for robust float parsing
    const parseCurrency = (val) => parseFloat(String(val || '0').replace(/[^0-9.-]+/g, "")) || 0;

    // 1. Normalize Data
    const processedData = useMemo(() => {
        const processed = data.map((row, index) => {
            const getVal = (candidates) => {
                for (let key of candidates) {
                    if (row[key] !== undefined) return row[key];
                    const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
                    if (foundKey) return row[foundKey];
                }
                return null;
            };

            const riskValue = getVal(['risk', 'risk status', 'low_risk']);

            return {
                id: index,
                name: getVal(['customer_name', 'Customer Name', 'customer name', 'Party Name']) || 'Unknown',
                balance: parseCurrency(getVal(['outstanding_balance', 'Outstanding Balance', 'balance', 'closing_balance'])),
                overdueDays: parseInt(getVal(['overdue_days', 'Overdue Days']) || 0),
                creditPeriod: parseInt(getVal(['credit_period', 'Credit Period']) || 0),
                overdueRatio: parseFloat(getVal(['overdue_ratio', 'Overdue Ratio']) || 0),
                risk: (riskValue || 'LOW').toUpperCase(),
                lastUpdated: getVal(['current date', 'current_date', 'date']) || null,
                raw: row
            };
        });
        if (processed.length > 0) console.log("CREDIT RISK MAPPED FIRST:", processed[0]);
        return processed;
    }, [data]);

    // 2. Analytics
    const { riskDistribution, topOutstanding, totalOutstanding, highRiskCount, lastUpdatedDate } = useMemo(() => {
        let highRisk = 0;
        let lowRisk = 0;
        let total = 0;
        let date = null;

        processedData.forEach(row => {
            if (row.risk.includes('HIGH')) highRisk++;
            else lowRisk++;
            total += row.balance;
            if (row.lastUpdated && !date) date = row.lastUpdated;
        });

        const riskDistribution = [
            { name: 'Low Risk', value: lowRisk, color: '#10b981' },
            { name: 'High Risk', value: highRisk, color: '#ef4444' }
        ];

        const topOutstanding = [...processedData]
            .sort((a, b) => b.balance - a.balance)
            .slice(0, 10);

        return { riskDistribution, topOutstanding, totalOutstanding: total, highRiskCount: highRisk, lastUpdatedDate: date };
    }, [processedData]);

    // 3. Filter & Pagination
    const filteredData = useMemo(() => {
        return processedData.filter(row =>
            row.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [processedData, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pucho-purple"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-inter max-w-[1600px] mx-auto animate-fade-in">

            {/* Header Section */}


            {/* Overview Cards */}
            {data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard
                        title="TOTAL RECEIVABLES"
                        value={formatCurrency(totalOutstanding)}
                        icon={TrendingUp}
                        iconBg="bg-blue-100"
                        iconColor="text-blue-600"
                        blobColor="bg-blue-50"
                        trend="Outstanding"
                        trendColor="text-blue-600"
                        isPositive={false}
                    />
                    <SummaryCard
                        title="HIGH RISK CLIENTS"
                        value={highRiskCount}
                        icon={AlertTriangle}
                        iconBg="bg-red-100"
                        iconColor="text-red-600"
                        blobColor="bg-red-50"
                        trend="Critical"
                        trendColor="text-red-600"
                        isPositive={false}
                    />
                    <SummaryCard
                        title="ACTIVE CUSTOMERS"
                        value={data.length}
                        icon={Users}
                        iconBg="bg-emerald-100"
                        iconColor="text-emerald-600"
                        blobColor="bg-emerald-50"
                        trend="Total Monitor"
                        trendColor="text-emerald-600"
                        isPositive={true}
                    />
                </div>
            )}

            {/* Main Graph: Top Outstanding */}
            {data.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-subtle">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Highest Outstanding Balances</h3>
                            <p className="text-sm text-gray-500">Top 10 customers by receivables amount</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topOutstanding} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} interval={0} angle={-15} textAnchor="end" height={60} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val)} />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(val) => formatCurrency(val)}
                                />
                                <Bar dataKey="balance" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Search Controls */}
            <div className="flex justify-between items-center">
                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-11 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedData.map((row) => {
                    const isHighRisk = row.risk.includes('HIGH');

                    return (
                        <motion.div
                            key={row.id}
                            whileHover={{ y: -4 }}
                            className={`bg-white rounded-2xl p-5 border shadow-subtle transition-all duration-200 flex flex-col justify-between h-[220px] ${isHighRisk ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500 border-gray-100'}`}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-gray-900 line-clamp-1 text-lg" title={row.name}>{row.name}</h3>
                                    {isHighRisk ? (
                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-lg">High Risk</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-lg">Low Risk</span>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-medium">Outstanding</span>
                                        <span className="text-sm font-bold text-gray-900 font-mono">{formatCurrency(row.balance)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-medium">Overdue Days</span>
                                        <span className={`text-sm font-bold font-mono ${parseInt(row.overdueDays) > 30 ? 'text-red-600' : 'text-gray-900'}`}>
                                            {row.overdueDays} Days
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 font-medium">Credit Period</span>
                                        <span className="text-sm text-gray-700 font-mono">{row.creditPeriod} Days</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50">
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${isHighRisk ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{ width: `${Math.min(parseCurrency(row.overdueRatio), 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Overdue Ratio</span>
                                    <span className="text-[10px] text-gray-500 font-bold">{row.overdueRatio}%</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {filteredData.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">No customers found</h3>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pl-4 pr-32 py-3 flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <img src={ChevronLeftIcon} alt="Prev" className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <img src={ChevronRightIcon} alt="Next" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditRisk;

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
