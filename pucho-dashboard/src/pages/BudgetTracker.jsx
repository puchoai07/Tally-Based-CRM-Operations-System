import React, { useState, useEffect, useMemo } from 'react';
import { fetchBudgetData, formatCurrency, extractSheetDate } from '../lib/sheetService';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Store, Share2, BarChart3, Filter, LayoutGrid, LayoutList } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Template Icons
import SearchIcon from '../assets/icons/search.svg';
import ChevronLeftIcon from '../assets/icons/chevron_left.png';
import ChevronRightIcon from '../assets/icons/chevron_right.png';
import WarningIcon from '../assets/icons/Property 2=warning.png';

const BudgetTracker = () => {
    const { setLastUpdated } = useOutletContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [showPeriodFilter, setShowPeriodFilter] = useState(false);
    const [viewMode, setViewMode] = useState('list');

    // Get unique sorted periods
    const uniquePeriods = useMemo(() => {
        return [...new Set(data.map(item => item.period).filter(Boolean))].sort().reverse();
    }, [data]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchBudgetData();
                console.log("[DEBUG] Budget Data First Row:", result[0]);
                console.log("[DEBUG] Budget Data Keys:", result.length > 0 ? Object.keys(result[0]) : "No data");
                setData(result);

                // Update Context with specific sheet date
                const sheetDate = extractSheetDate(result);
                if (sheetDate) setLastUpdated(sheetDate);

            } catch (error) {
                console.error("Failed to fetch budget data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // --- Calculations & Filtering ---
    const filteredData = useMemo(() => {
        return data.filter(item =>
            (item.ledger_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.period || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Summary Metrics
    const totalActual = useMemo(() => {
        return data.reduce((sum, item) => sum + (parseFloat(String(item.actual_amount).replace(/,/g, '')) || 0), 0);
    }, [data]);

    const totalBudget = useMemo(() => {
        return data.reduce((sum, item) => {
            if (item.budget_amount && item.budget_amount !== 'N/A') {
                return sum + (parseFloat(String(item.budget_amount).replace(/,/g, '')) || 0);
            }
            return sum;
        }, 0);
    }, [data]);

    const budgetUtilization = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

    // Chart Data 1: Top 5 Ledgers by Spend (Donut)
    const donutData = useMemo(() => {
        return [...data]
            .map(item => ({
                name: item.ledger_name,
                value: parseFloat(String(item.actual_amount).replace(/,/g, '')) || 0
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [data]);

    // Chart Data 2: Budget vs Actual (Horizontal Bar)
    const barData = useMemo(() => {
        return [...data]
            .map(item => ({
                name: item.ledger_name,
                actual: parseFloat(String(item.actual_amount).replace(/,/g, '')) || 0,
                budget: item.budget_amount !== 'N/A' ? parseFloat(String(item.budget_amount).replace(/,/g, '')) || 0 : 0
            }))
            .sort((a, b) => b.actual - a.actual) // Sort by spend
            .slice(0, 10);
    }, [data]);

    // Chart Data 3: Spending Trend (Line) - Aggregate by Date (Start of Period)
    const lineData = useMemo(() => {
        const aggregated = {};
        data.forEach(item => {
            if (item.period) {
                // Extract start date (e.g., "2023-08-08" from "2023-08-08 to ...")
                const datePart = item.period.split(' ')[0];
                const val = parseFloat(String(item.actual_amount).replace(/,/g, '')) || 0;
                if (datePart) {
                    aggregated[datePart] = (aggregated[datePart] || 0) + val;
                }
            }
        });
        return Object.entries(aggregated)
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort chronologically
    }, [data]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pucho-purple"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-inter max-w-[1600px] mx-auto animate-fade-in pb-12">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="ACTUAL SPEND"
                    value={formatCurrency(totalActual)}
                    icon={Store}
                    iconBg="bg-blue-100"
                    iconColor="text-blue-600"
                    blobColor="bg-blue-50"
                    badgeText="+2.4%"
                    badgeColor="text-emerald-600 bg-emerald-50"
                />
                <SummaryCard
                    title="ALLOCATED BUDGET"
                    value={formatCurrency(totalBudget)}
                    icon={Share2}
                    iconBg="bg-indigo-100"
                    iconColor="text-indigo-600"
                    blobColor="bg-indigo-50"
                    badgeText="Synced"
                    badgeColor="text-emerald-600 bg-emerald-50"
                />
                <SummaryCard
                    title="OVERALL UTILIZATION"
                    value={`${budgetUtilization.toFixed(1)}%`}
                    icon={BarChart3}
                    iconBg="bg-purple-100"
                    iconColor="text-purple-600"
                    blobColor="bg-purple-50"
                    badgeText="Units"
                    badgeColor="text-gray-500 bg-transparent px-0"
                />
            </div>

            {/* Charts Row: Donut & Vertical Bar */}
            {(donutData.some(d => d.value > 0) || barData.some(d => d.actual > 0 || d.budget > 0)) && (
                <div className={`grid grid-cols-1 ${donutData.some(d => d.value > 0) && barData.some(d => d.actual > 0 || d.budget > 0) ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-8`}>
                    {/* Donut Chart */}
                    {donutData.some(d => d.value > 0) && (
                        <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl shadow-gray-100/50 p-4 flex flex-col">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Spend Distribution</h2>
                            <p className="text-sm text-gray-500 mb-4">Top 5 Ledgers by Actual Spend</p>
                            <div className="flex-1 min-h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {donutData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Bar Chart (Vertical) */}
                    {barData.some(d => d.actual > 0 || d.budget > 0) && (
                        <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl shadow-gray-100/50 p-4 flex flex-col">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Budget Analysis</h2>
                            <p className="text-sm text-gray-500 mb-4">Actual Spend vs Allocated Budget</p>
                            <div className="flex-1 min-h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={barData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                        barGap={0}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                                            tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 8)}...` : value}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                                            tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f9fafb' }}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.15)', padding: '12px 16px' }}
                                            formatter={(value, name) => [formatCurrency(value), name === 'actual' ? 'Actual Spend' : 'Budget']}
                                        />
                                        <Legend verticalAlign="top" align="right" iconType="circle" height={40} />
                                        <Bar dataKey="budget" name="Budget" fill="#e5e7eb" radius={[6, 6, 0, 0]} barSize={20} />
                                        <Bar dataKey="actual" name="Actual Spend" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content Area: Table */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                {/* Filters Bar */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3 justify-between items-center bg-gray-50/30">
                    <div className="relative w-full md:w-96 group">
                        <img src={SearchIcon} alt="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pucho-purple/20 focus:border-pucho-purple transition-all shadow-sm"
                        />
                    </div>
                    {/* Keep Period Filter */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowPeriodFilter(!showPeriodFilter)}
                                className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm ${showPeriodFilter ? 'ring-2 ring-pucho-purple/20 border-pucho-purple' : ''}`}
                            >
                                <Filter className="w-4 h-4 opacity-70" />
                                Filter Period
                            </button>
                            {showPeriodFilter && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-fade-in max-h-60 overflow-y-auto">
                                    <button onClick={() => { setSearchTerm(''); setShowPeriodFilter(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">All Periods</button>
                                    {uniquePeriods.map((period) => (
                                        <button key={period} onClick={() => { setSearchTerm(period); setShowPeriodFilter(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50">{period}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                title="List View"
                            >
                                <LayoutList className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('card')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'card' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Card View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content: List (Table) or Card (Grid) */}
                {viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ledger Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actual Amount</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pl-10">Message</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedData.map((row, index) => (
                                    <tr key={index} className="group hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-800 text-sm group-hover:text-pucho-purple transition-colors">{row.ledger_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap">{row.period}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-gray-900">{formatCurrency(row.actual_amount)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-gray-600 font-medium">{row.budget_amount === 'N/A' ? '-' : formatCurrency(row.budget_amount)}</span>
                                        </td>
                                        <td className="px-6 py-4 pl-10">
                                            <div className="flex items-center gap-2" title={row.message}>
                                                {row.message && row.message !== 'N/A' && (
                                                    <>
                                                        <img src={WarningIcon} alt="Info" className="w-4 h-4 opacity-50 shrink-0" />
                                                        <span className="text-xs text-gray-500 truncate max-w-[200px]">{row.message}</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {paginatedData.map((row, index) => (
                            <div key={index} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 group flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                                <div className="relative z-10 mb-4">
                                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2" title={row.ledger_name}>{row.ledger_name}</h3>
                                    <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg inline-block">
                                        {row.period}
                                    </span>
                                </div>

                                <div className="space-y-3 relative z-10 flex-1">
                                    <div className="flex justify-between items-end pb-2 border-b border-gray-100">
                                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Actual</span>
                                        <span className="font-bold text-gray-900 text-lg">{formatCurrency(row.actual_amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Budget</span>
                                        <span className="font-medium text-gray-600">{row.budget_amount === 'N/A' ? '-' : formatCurrency(row.budget_amount)}</span>
                                    </div>
                                </div>

                                {row.message && row.message !== 'N/A' && (
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-start gap-2 relative z-10">
                                        <img src={WarningIcon} alt="Alert" className="w-4 h-4 opacity-60 mt-0.5 shrink-0" />
                                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2" title={row.message}>{row.message}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredData.length === 0 && (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <img src={SearchIcon} alt="Not Found" className="w-8 h-8 opacity-20" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No matching records found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search terms</p>
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="pl-6 pr-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <span className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-medium text-gray-900">{filteredData.length}</span> results
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:hover:shadow-none transition-all"
                        >
                            <img src={ChevronLeftIcon} alt="Prev" className="w-4 h-4 opacity-60" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === pageNum
                                        ? 'bg-pucho-purple text-white shadow-md shadow-purple-200'
                                        : 'text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:hover:shadow-none transition-all"
                        >
                            <img src={ChevronRightIcon} alt="Next" className="w-4 h-4 opacity-60" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ title, value, icon: Icon, iconBg, iconColor, blobColor, badgeText, badgeColor }) => (
    <div className="flex-1 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group h-[170px] flex flex-col justify-center">
        {/* Blob Background */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 ${blobColor} rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none`}></div>

        <div className="flex justify-between items-center relative z-10 w-full">
            <div className="flex flex-col gap-1">
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-[32px] font-bold text-gray-900 tracking-tight leading-none">{value}</h3>
                    {/* Optional unit label inline if needed, but badge is below */}
                </div>
                {badgeText && (
                    <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${badgeColor}`}>
                        {badgeText}
                    </div>
                )}
            </div>

            <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 ml-4 shadow-sm`}>
                <Icon className={`w-7 h-7 ${iconColor}`} strokeWidth={1.5} />
            </div>
        </div>
    </div>
);

export default BudgetTracker;
