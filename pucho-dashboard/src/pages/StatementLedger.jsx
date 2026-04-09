import React, { useState, useEffect, useMemo } from 'react';
import { fetchStatementLedgerData, formatCurrency, extractSheetDate } from '../lib/sheetService';
import SearchIcon from '../assets/icons/search.svg';
import FlowsIcon from '../assets/icons/flows.svg';
import ChevronLeftIcon from '../assets/icons/chevron_left.png';
import ChevronRightIcon from '../assets/icons/chevron_right.png';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const StatementLedger = () => {
    const { setLastUpdated } = useOutletContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    // View Mode State - Default to Cards/Grid as per standardization request
    const [viewMode, setViewMode] = useState('grid');
    const itemsPerPage = 9; // Standardizing to 9 for grid

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchStatementLedgerData();
                setData(result);

                // Update Context with specific sheet date
                const sheetDate = extractSheetDate(result);
                setLastUpdated('01 Jan 2026'); // Forced as per user request

            } catch (error) {
                console.error("Failed to fetch ledger data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Helper to detect if a column is numeric (currency/number)
    const isNumericColumn = (key, value) => {
        if (!value) return false;
        const cleanVal = String(value).replace(/[₹,]/g, '').trim();
        return !isNaN(parseFloat(cleanVal)) && isFinite(cleanVal);
    };

    // Filter and Pagination
    const filteredData = useMemo(() => {
        return data.filter(row =>
            Object.values(row).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm]);

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

    // Chart Data: Running Balance Trend
    const chartData = useMemo(() => {
        const dateMap = {};

        // Parse and sort data chronologically first to ensure correct balance progression
        const info = [...data]
            .map(row => {
                const cleanVal = (val) => {
                    if (typeof val === 'number') return val;
                    // Remove commas and currency symbols, keep negatives
                    return parseFloat(String(val || '0').replace(/[^0-9.-]+/g, "")) || 0;
                };
                return {
                    ...row,
                    dateTimestamp: new Date(row.date).getTime(),
                    balance: cleanVal(row.bal)
                };
            })
            // Filter out invalid dates
            .filter(row => !isNaN(row.dateTimestamp))
            .sort((a, b) => a.dateTimestamp - b.dateTimestamp);

        // Populate map with the LATEST balance for each date
        info.forEach(row => {
            dateMap[row.date] = {
                date: row.date,
                balance: row.balance,
                timestamp: row.dateTimestamp
            };
        });

        // Convert to array
        return Object.values(dateMap)
            .sort((a, b) => a.timestamp - b.timestamp);
    }, [data]);

    // Extract headers dynamically
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    // Calculate Totals for Cards
    const totals = useMemo(() => {
        const cleanVal = (val) => parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;

        const totalCredit = data.reduce((sum, row) => sum + cleanVal(row.credit || row.Credit), 0);
        const totalDebit = data.reduce((sum, row) => sum + cleanVal(row.debit || row.Debit), 0);

        // Closing Balance: Get the balance from the last chronological entry
        const sorted = [...data]
            .map(row => ({ ...row, ts: new Date(row.date).getTime() }))
            .filter(r => !isNaN(r.ts))
            .sort((a, b) => b.ts - a.ts); // Descending to get latest first

        const closingBalance = sorted.length > 0 ? cleanVal(sorted[0].bal || sorted[0].Balance) : 0;

        return { totalCredit, totalDebit, closingBalance };
    }, [data]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pucho-purple"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-inter max-w-[1600px] mx-auto animate-fade-in pb-10">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">


                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative group flex-1 md:w-80">
                        <img
                            src={SearchIcon}
                            alt="Search"
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity"
                        />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-11 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="TOTAL CREDIT"
                    value={formatCurrency(totals.totalCredit)}
                    icon={ArrowUpRight}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                    blobColor="bg-green-50"
                    trend="Inflow"
                    trendColor="text-green-600"
                    isPositive={totals.totalCredit >= 0}
                />
                <SummaryCard
                    title="TOTAL DEBIT"
                    value={formatCurrency(totals.totalDebit)}
                    icon={ArrowDownRight}
                    iconBg="bg-red-100"
                    iconColor="text-red-600"
                    blobColor="bg-red-50"
                    trend="Outflow"
                    trendColor="text-red-600"
                    isPositive={false} // Debit is naturally an outflow, usually shown as positive number but red context
                />
                <SummaryCard
                    title="CLOSING BALANCE"
                    value={formatCurrency(totals.closingBalance)}
                    icon={Wallet}
                    iconBg="bg-indigo-100"
                    iconColor="text-indigo-600"
                    blobColor="bg-indigo-50"
                    trend="Net Position"
                    trendColor="text-gray-500"
                    isPositive={totals.closingBalance >= 0}
                />
            </div>

            {/* Account Trends Graph */}
            {chartData.length > 0 && (
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl shadow-gray-100/50 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Account Balance Trend</h2>
                            <p className="text-sm text-gray-500">Daily interaction history</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-1 flex gap-1">
                            <button className="px-3 py-1 bg-white shadow-sm rounded-md text-xs font-bold text-gray-800">Graph</button>
                        </div>
                    </div>

                    <div className="h-[340px] w-full overflow-x-auto pb-4 custom-scrollbar">
                        <div style={{ minWidth: `${Math.max(1000, chartData.length * 50)}px`, height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset={(() => {
                                                const dataMax = Math.max(...chartData.map((i) => i.balance));
                                                const dataMin = Math.min(...chartData.map((i) => i.balance));
                                                if (dataMax <= 0) return 0;
                                                if (dataMin >= 0) return 1;
                                                return dataMax / (dataMax - dataMin);
                                            })()} stopColor="#10b981" stopOpacity={1} />
                                            <stop offset={(() => {
                                                const dataMax = Math.max(...chartData.map((i) => i.balance));
                                                const dataMin = Math.min(...chartData.map((i) => i.balance));
                                                if (dataMax <= 0) return 0;
                                                if (dataMin >= 0) return 1;
                                                return dataMax / (dataMax - dataMin);
                                            })()} stopColor="#ef4444" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                                        tickFormatter={(str) => new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                                        tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val)}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [formatCurrency(value), 'Balance']}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="url(#splitColor)"
                                        strokeWidth={3}
                                        fillOpacity={0.1}
                                        fill="url(#splitColor)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            {filteredData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedData.map((row, index) => {
                        // Dynamically filter keys to display
                        const displayKeys = Object.keys(row).filter(key => {
                            const lowerKey = key.toLowerCase().trim();
                            // Filter out standard technical fields, plus the typo 'currect date' seen in user data
                            return !['current date', 'currect date', 'yr', 'mo', 'sort', 'datetimestamp', 'balance', 'date'].includes(lowerKey);
                        });

                        return (
                            <div key={index} className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1">
                                {/* Solid Background for Max Visibility */}
                                <div className="absolute inset-0 bg-white border border-gray-200 shadow-md group-hover:shadow-xl transition-all"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-gray-50/50 pointer-events-none"></div>

                                <div className="relative z-10 flex flex-col h-full space-y-4">
                                    {/* Header: Name/Email */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            {row['name'] && (
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{row['name']}</h3>
                                            )}
                                            {row['Email'] && row['Email'] !== 'N/A' && (
                                                <p className="text-xs text-blue-600 font-medium break-all">{row['Email']}</p>
                                            )}
                                            {!row['name'] && row['date'] && (
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight">{row['date']}</h3>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full h-px bg-gradient-to-r from-gray-200/50 via-gray-300/50 to-gray-200/50"></div>

                                    {/* Key Details Grid */}
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                        {displayKeys.map(key => {
                                            if (['name', 'email', 'date'].includes(key.toLowerCase())) return null; // Already shown in header

                                            // Format value logic
                                            let value = row[key];
                                            const isCurrency = ['credit', 'debit', 'bal', 'balance'].includes(key.toLowerCase());

                                            if (isCurrency) {
                                                const num = parseFloat(String(value).replace(/,/g, ''));
                                                const colorClass = key.toLowerCase().includes('bal')
                                                    ? (num < 0 ? 'text-red-600' : 'text-green-600')
                                                    : 'text-gray-700';

                                                value = (
                                                    <span className={`font-mono font-bold ${colorClass}`}>
                                                        {value ? formatCurrency(value) : '-'}
                                                    </span>
                                                );
                                            } else if (!value || value === 'N/A') {
                                                value = <span className="text-gray-300 text-xs italic">N/A</span>;
                                            }

                                            return (
                                                <div key={key} className="flex flex-col">
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-0.5">
                                                        {key.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-gray-700 font-medium leading-snug break-words">
                                                        {value}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img src={FlowsIcon} alt="Empty" className="w-8 h-8 opacity-20" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">No records found</h3>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search.</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <img src={ChevronLeftIcon} alt="Prev" className="w-4 h-4 opacity-60" />
                        </button>
                        <span className="px-4 text-xs font-semibold text-gray-500">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <img src={ChevronRightIcon} alt="Next" className="w-4 h-4 opacity-60" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const SummaryCard = ({ title, value, icon: Icon, iconBg, iconColor, blobColor, trend, trendColor, isPositive }) => (
    <div className="flex-1 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group h-[160px] flex flex-col justify-center">
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

export default StatementLedger;
