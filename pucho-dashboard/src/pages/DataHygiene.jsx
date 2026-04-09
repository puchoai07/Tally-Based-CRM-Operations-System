import { fetchDataHygieneData, extractSheetDate } from '../lib/sheetService';
import ActivityIcon from '../assets/icons/activity.svg';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Database, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import ChevronLeftIcon from '../assets/icons/chevron_left.png';
import ChevronRightIcon from '../assets/icons/chevron_right.png';
import { useState, useEffect, useMemo } from 'react';

const DataHygiene = () => {
    const { setLastUpdated } = useOutletContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchDataHygieneData();
                setData(result);

                // Update Context with specific sheet date
                const sheetDate = extractSheetDate(result);
                if (sheetDate) setLastUpdated(sheetDate);

            } catch (error) {
                console.error("Failed to fetch Data Hygiene data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const hasMissingData = (val) => {
        if (!val) return true;
        const s = String(val).replace(/\s+/g, '').toLowerCase(); // Remove all spaces for check
        return s === 'n/a' || s === '' || s === '-' || s === 'null' || s === 'undefined';
    };

    // Calculate Health Metrics & Issues Breakdown
    // Calculate Health Metrics & Issues Breakdown
    const { metrics, issueBreakdown, totalRecords } = useMemo(() => {
        let clean = 0;
        let issues = 0;

        // Counters for specific issues
        let missingGstCount = 0;
        let missingMobileCount = 0;
        let missingAddressCount = 0;

        // Default safe return
        if (!Array.isArray(data)) {
            return {
                metrics: { healthy: 0, issues: 0 },
                issueBreakdown: [],
                totalRecords: 0
            };
        }

        data.forEach(row => {
            const mobile = row['Mobile'] || row['mobile'] || row[' Mobile '] || row['Phone'] || row['phone'];
            const gstin = row['GSTIN'] || row['gstin'] || row['GST No'];
            const address = row['Address'] || row['address'] || row['Addr'];

            const missingGst = hasMissingData(gstin);
            const missingAddr = hasMissingData(address);
            const missingMob = hasMissingData(mobile);

            if (missingGst) missingGstCount++;
            if (missingMob) missingMobileCount++;
            if (missingAddr) missingAddressCount++;

            if (!missingGst && !missingAddr && !missingMob) {
                clean++;
            } else {
                issues++;
            }
        });

        const metrics = { healthy: clean, issues: issues };

        const issueBreakdown = [
            { name: 'Missing GSTIN', count: missingGstCount, fill: '#ef4444' },
            { name: 'Missing Mobile', count: missingMobileCount, fill: '#f97316' },
            { name: 'Missing Address', count: missingAddressCount, fill: '#eab308' }
        ];

        return { metrics, issueBreakdown, totalRecords: data.length };
    }, [data]);

    // Pagination
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice(
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
        <div className="space-y-3 font-inter max-w-[1600px] mx-auto animate-fade-in">
            {/* Top Overview Cards */}
            {data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard
                        title="TOTAL RECORDS"
                        value={totalRecords}
                        icon={Database}
                        iconBg="bg-blue-100"
                        iconColor="text-blue-600"
                        blobColor="bg-blue-50"
                        trend="Database Size"
                        trendColor="text-blue-600"
                        isPositive={true}
                    />
                    <SummaryCard
                        title="HEALTHY DATA"
                        value={metrics.healthy}
                        icon={CheckCircle}
                        iconBg="bg-emerald-100"
                        iconColor="text-emerald-600"
                        blobColor="bg-emerald-50"
                        trend="Clean Records"
                        trendColor="text-emerald-600"
                        isPositive={true}
                    />
                    <SummaryCard
                        title="CRITICAL ISSUES"
                        value={metrics.issues}
                        icon={AlertTriangle}
                        iconBg="bg-red-100"
                        iconColor="text-red-600"
                        blobColor="bg-red-50"
                        trend="Action Required"
                        trendColor="text-red-600"
                        isPositive={false}
                    />
                </div>
            )}

            {/* Main Graph Section */}
            {data.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-subtle">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Data Quality Issues</h3>
                            <p className="text-sm text-gray-500">Breakdown of missing or invalid fields</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issueBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 'bold' }} width={120} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedData.map((row, index) => {
                    const mobile = row['Mobile'] || row['mobile'] || row[' Mobile '] || row['Phone'] || row['phone'];
                    const gstin = row['GSTIN'] || row['gstin'] || row['GST No'];
                    const address = row['Address'] || row['address'] || row['Addr'];

                    const isGstMissing = hasMissingData(gstin);
                    const isAddressMissing = hasMissingData(address);
                    const isMobileMissing = hasMissingData(mobile);
                    const hasIssues = isGstMissing || isAddressMissing || isMobileMissing;

                    return (
                        <motion.div
                            whileHover={{ y: -4 }}
                            key={index}
                            className={`rounded-2xl p-5 border shadow-subtle transition-all duration-200 flex flex-col justify-between h-[160px] bg-white ${hasIssues ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500 border-gray-100'}`}
                        >
                            <div>
                                <h3 className="font-bold text-gray-900 line-clamp-1 mb-3" title={row['name']}>{row['name']}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400 font-medium uppercase">GSTIN</span>
                                        {isGstMissing ? (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-lg font-bold">Missing</span>
                                        ) : (
                                            <span className="font-mono text-gray-600">{gstin}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400 font-medium uppercase">Mobile</span>
                                        {isMobileMissing ? (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-lg font-bold">Missing</span>
                                        ) : (
                                            <span className="font-mono text-gray-600">{mobile}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-start text-xs pt-1">
                                        <span className="text-gray-400 font-medium uppercase shrink-0">Address</span>
                                        {isAddressMissing ? (
                                            <span className="text-red-500 italic text-right">Not found</span>
                                        ) : (
                                            <span className="text-gray-600 text-right truncate w-32" title={address}>{address}</span>
                                        )}
                                    </div>
                                </div>
                            </div>


                        </motion.div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pl-4 pr-32 py-3 flex items-center justify-between pt-4 border-t border-gray-100">
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

export default DataHygiene;

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
