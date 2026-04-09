import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchStockData, formatCurrency, extractSheetDate } from '../lib/sheetService';
import { useOutletContext } from 'react-router-dom';

// Template Icons
import SearchIcon from '../assets/icons/search.svg';
import ActivityIcon from '../assets/icons/activity.svg';
import MarketplaceIcon from '../assets/icons/marketplace.svg';
import AgentsIcon from '../assets/icons/agents.svg';
import HomeIcon from '../assets/icons/home.svg';
import ChevronLeftIcon from '../assets/icons/chevron_left.png';
import ChevronRightIcon from '../assets/icons/chevron_right.png';
import MapIcon from '../assets/icons/Property 2=map, Property 1=Default.png';

// Chart Icons
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Chart logic re-added as per user request

const StockView = () => {
    const { setLastUpdated } = useOutletContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; // Increased items per page for better grid density

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchStockData();
                setData(result);

                // Update Context with specific sheet date
                const sheetDate = extractSheetDate(result);
                if (sheetDate) setLastUpdated(sheetDate);

            } catch (error) {
                console.error("Failed to fetch stock data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Calculations
    const totalValue = useMemo(() => data.reduce((acc, item) => {
        const val = parseFloat(String(item.closing_value).replace(/,/g, '')) || 0;
        return acc + val;
    }, 0), [data]);

    const totalQty = useMemo(() => data.reduce((acc, item) => {
        const qty = parseFloat(String(item.closing_quantity).replace(/,/g, '')) || 0;
        return acc + qty;
    }, 0), [data]);

    const showValue = totalValue !== 0; // Show value if not exactly 0



    const filteredData = useMemo(() => {
        return data.filter(item =>
            item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const hasData = data.length > 0;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    };

    // Prepare Chart Data (Top 5 Locations by Value)
    const chartData = useMemo(() => {
        const locationMap = {};
        data.forEach(item => {
            const loc = item.location_name || 'Unknown';
            const val = parseFloat(String(item.closing_value).replace(/,/g, '')) || 0;
            locationMap[loc] = (locationMap[loc] || 0) + val;
        });

        return Object.entries(locationMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5
    }, [data]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-inter pb-8">


            {/* Metric Cards - Premium Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Inventory Value"
                    value={formatCurrency(totalValue)}
                    icon={MarketplaceIcon}
                    bgColor="bg-blue-600"
                    trend="+2.4%"
                />
                <MetricCard
                    title="Active SKUs"
                    value={data.length}
                    icon={ActivityIcon}
                    bgColor="bg-emerald-500"
                    trend={data.length > 0 ? "Synced" : "No Data"}
                />
                <MetricCard
                    title="Total Stock Quantity"
                    value={`${totalQty.toLocaleString()}`}
                    unit="Units"
                    icon={AgentsIcon}
                    bgColor="bg-indigo-500"
                />
            </div>

            {/* Link to Chart */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Stock Distribution by Location</h2>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value) => [formatCurrency(value), 'Value']}
                            />
                            <Bar
                                dataKey="value"
                                fill="url(#stockGradient)"
                                radius={[8, 8, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>


            {/* Content Container - Glassmorphism & Shadows */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                {/* Search Header */}
                <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-gray-800">Review Stock Items</h2>
                    <div className="relative group w-full sm:max-w-md">
                        <img
                            src={SearchIcon}
                            alt="Search"
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity"
                        />
                        <input
                            type="text"
                            placeholder="Search by SKU or location..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-sm font-medium"
                        />
                    </div>
                </div>

                {/* Grid with Animations */}
                <div className="p-6">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence>
                            {paginatedData.map((item, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    layout
                                    className="group relative bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                                                    {item.location_name || 'Main Warehouse'}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors" title={item.item_name}>
                                                {item.item_name}
                                            </h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                            <img src={MarketplaceIcon} alt="Stock Item" className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" style={{ filter: 'grayscale(100%) opacity(0.6)' }} />
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-end justify-between">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</span>
                                            <div className="text-lg font-bold text-gray-900">
                                                {item.closing_quantity} <span className="text-xs text-gray-400 font-medium">Units</span>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Value</span>
                                            <div className={`text-lg font-black tracking-tight ${item.closing_value > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                                                {formatCurrency(item.closing_value)}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Empty State */}
                    {filteredData.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-32 text-center"
                        >
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <img src={SearchIcon} className="w-6 h-6 opacity-20" alt="No results" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No stock items found</h3>
                            <p className="text-sm text-gray-500 mt-2">Try adjusting your search filters.</p>
                        </motion.div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pl-6 pr-24 py-2 border-t border-gray-50 bg-gray-50/50 backdrop-blur-sm flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                            Showing page {currentPage} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2.5 rounded-xl border border-gray-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600"
                            >
                                <img src={ChevronLeftIcon} alt="Prev" className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2.5 rounded-xl border border-gray-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600"
                            >
                                <img src={ChevronRightIcon} alt="Next" className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};

// Sub-component for Metric Cards - Premium Style
const MetricCard = ({ icon, title, value, unit, trend, bgColor }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="relative overflow-hidden bg-white p-4 rounded-3xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 ${bgColor} opacity-5 rounded-bl-[100px] -mr-6 -mt-6 pointer-events-none`}></div>

        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
                    {unit && <span className="text-sm font-medium text-gray-400">{unit}</span>}
                </div>
                {trend && (
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 border border-green-100">
                        <span className="text-[10px] font-bold text-green-600">{trend}</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-2xl ${bgColor} bg-opacity-10 shadow-sm`}>
                <img src={icon} alt={title} className="w-6 h-6 object-contain" style={{ filter: 'currentColor' }} />
            </div>
        </div>
    </motion.div>
);

export default StockView;
