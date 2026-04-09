import React, { useState, useEffect, useMemo } from 'react';
import { LayoutList, LayoutGrid, Store, Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchVendorCustomerData, formatCurrency, extractSheetDate } from '../lib/sheetService';
import { useOutletContext } from 'react-router-dom';

// Components
const Tabs = ({ activeTab, onTabChange }) => (
    <div className="flex p-1 bg-gray-100 rounded-xl relative w-full md:w-64 h-11">
        <motion.div
            layoutId="activeTab"
            className="absolute inset-y-1 bg-white shadow-sm rounded-lg z-0"
            animate={{
                left: activeTab === 'vendor' ? '4px' : 'calc(50% + 2px)',
                width: 'calc(50% - 6px)'
            }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        />
        <button
            onClick={() => onTabChange('vendor')}
            className={`flex-1 relative z-10 py-2 text-sm font-bold transition-colors duration-300 ${activeTab === 'vendor' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
        >
            Vendors
        </button>
        <button
            onClick={() => onTabChange('customer')}
            className={`flex-1 relative z-10 py-2 text-sm font-bold transition-colors duration-300 ${activeTab === 'customer' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
        >
            Customers
        </button>
    </div>
);

const SearchBar = ({ searchTerm, onSearchChange, placeholder }) => (
    <div className="relative group w-full md:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
        />
    </div>
);

const EntityCard = ({ data, type }) => {
    const name = data.name || 'Unknown';
    const balance = data.balance !== undefined ? `₹${data.balance}` : '₹0';
    const initial = name.charAt(0).toUpperCase();

    // Contextual Details
    const renderDetails = () => {
        if (type === 'Vendor') {
            return (
                <div className="text-xs text-gray-400 space-y-1">
                    <div className="flex justify-between">
                        <p>Date: <span className="text-gray-600 font-medium">{data.bill_date}</span></p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p>Due: <span className="text-gray-600">{data.due_date}</span></p>
                        {data.amount && <p className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">Bill Amt: <span className="font-medium text-gray-700">₹{data.amount}</span></p>}
                    </div>
                </div>
            );
        }
        return (
            <div className="text-xs text-gray-400 space-y-1">
                <p>GSTN: <span className="text-gray-600 font-medium">{data.gstn || '-'}</span></p>
                <p className="truncate" title={data.address}>Addr: {data.address}</p>
                <p className="truncate" title={data.email}>{data.email}</p>
            </div>
        );
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg ${type === 'Vendor' ? 'bg-indigo-500 shadow-indigo-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
                    {initial}
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${type === 'Vendor' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {type}
                </span>
            </div>

            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1" title={name}>{name}</h3>

            <div className="mb-4 min-h-[40px]">
                {renderDetails()}
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-between items-center bg-gray-50/50 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
                <span className="text-xs font-semibold text-gray-400 uppercase">
                    {type === 'Vendor' ? 'Pending' : 'Closing Bal'}
                </span>
                <span className="text-gray-900 font-bold font-mono text-lg">{balance}</span>
            </div>
        </motion.div>
    );
};

const VendorCustomer = () => {
    const { setLastUpdated } = useOutletContext();
    const [activeTab, setActiveTab] = useState('vendor');
    const [viewMode, setViewMode] = useState('grid');
    const [vendorData, setVendorData] = useState([]);
    const [customerData, setCustomerData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            try {
                const allData = await fetchVendorCustomerData();

                // Update Context with specific sheet date
                const sheetDate = extractSheetDate(allData);
                if (sheetDate) setLastUpdated(sheetDate);

                // Helper to get value matching multiple possible keys
                const getVal = (row, candidates) => {
                    const fuzzy = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanCandidates = candidates.map(fuzzy);

                    // 1. Direct Match (Case Sensitive)
                    for (let key of candidates) {
                        const val = row[key];
                        if (val !== undefined && val !== null && String(val).trim() !== '') return String(val).trim();
                    }

                    // 2. Fuzzy Match across all keys
                    const rowKeys = Object.keys(row);
                    for (let kw of cleanCandidates) {
                        const matchedKey = rowKeys.find(k => fuzzy(k) === kw);
                        if (matchedKey) {
                            const val = row[matchedKey];
                            if (val !== undefined && val !== null && String(val).trim() !== '') return String(val).trim();
                        }
                    }

                    return '-';
                };

                // Normalize Data
                // Vendors: vendor_name, bill_number, bill_date, due_date, amount, pending_amount, ageing
                const vendors = allData
                    .filter(row => row.Type === 'Vendor')
                    .map((row, index) => {
                        const mapped = {
                            name: getVal(row, ['vendor_name', 'Vendor Name', 'name']),
                            balance: getVal(row, ['pending_amount', 'Pending Amount', 'balance', 'closing_balance']) || 0,
                            bill_number: getVal(row, ['bill_number', 'Bill Number', 'bill_no', 'bill_no.', 'Bill No.', 'bill#', 'Bill #', 'voucher_number', 'voucher_no', 'Voucher No.', 'Reference', 'Ref No.']),
                            bill_date: getVal(row, ['bill_date', 'Bill Date', 'date']),
                            due_date: getVal(row, ['due_date', 'Due Date']),
                            ageing: getVal(row, ['ageing', 'Ageing']),
                            amount: getVal(row, ['amount', 'Bill Amount', 'total_amount']) || 0,
                            type: 'Vendor',
                            raw: row
                        };
                        if (index < 3) console.log(`VENDOR [${index}] RAW KEYS:`, Object.keys(row));
                        if (index === 0) console.log("VENDOR [0] MAPPED:", mapped);
                        return mapped;
                    });

                console.log("FETCHED VENDORS (PROCESSED):");
                console.table(vendors.slice(0, 5).map(v => ({ name: v.name, bill: v.bill_number, balance: v.balance })));

                // Customers: name, gstn, mailing_address, email, closing_balance
                const customers = allData
                    .filter(row => row.Type === 'Customer')
                    .map(row => ({
                        name: getVal(row, ['name', 'Customer Name', 'customer_name']),
                        balance: getVal(row, ['closing_balance', 'Closing Balance', 'balance']) || 0,
                        gstn: getVal(row, ['gstn', 'GST Number', 'gst_no']),
                        address: getVal(row, ['mailing_address', 'Address', 'mailing address']),
                        email: getVal(row, ['email', 'Email Address']),
                        type: 'Customer',
                        raw: row
                    }));

                setVendorData(vendors);
                setCustomerData(customers);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, []);

    const currentData = activeTab === 'vendor' ? vendorData : customerData;

    // Filter
    const filteredData = useMemo(() => {
        return currentData.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [currentData, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional
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
        <div className="font-inter max-w-[1600px] mx-auto animate-fade-in space-y-8">

            {/* Top Section: Premium Split Interactive Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Vendor Card */}
                <motion.div
                    onClick={() => setActiveTab('vendor')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative overflow-hidden rounded-3xl p-8 h-[220px] shadow-2xl cursor-pointer group transition-all duration-300 ${activeTab === 'vendor' ? 'ring-4 ring-indigo-100' : ''}`}
                >
                    {/* Background with Gradient and Glass Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1] via-[#4f46e5] to-[#4338ca]"></div>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                    {/* Decorative Blob */}
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                <Store className="w-8 h-8 text-white opacity-90" />
                            </div>
                            {activeTab === 'vendor' && (
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">Active</span>
                            )}
                        </div>

                        <div>
                            <h3 className="text-indigo-200 font-medium tracking-wide uppercase text-xs mb-1">Total Vendors</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-white font-bold text-5xl tracking-tight">{vendorData.length}</span>
                                <span className="text-indigo-200 text-sm">Partners</span>
                            </div>

                        </div>
                    </div>

                    {/* Giant Faded Icon background */}
                    <div className="absolute -bottom-6 -right-6 opacity-[0.1] rotate-[-12deg] transform group-hover:scale-110 group-hover:rotate-[-6deg] transition-all duration-500">
                        <Store className="w-48 h-48 text-white" />
                    </div>
                </motion.div>

                {/* Customer Card */}
                <motion.div
                    onClick={() => setActiveTab('customer')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative overflow-hidden rounded-3xl p-8 h-[220px] shadow-2xl cursor-pointer group transition-all duration-300 ${activeTab === 'customer' ? 'ring-4 ring-green-100' : ''}`}
                >
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857]"></div>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                    {/* Decorative Blob */}
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                <Users className="w-8 h-8 text-white opacity-90" />
                            </div>
                            {activeTab === 'customer' && (
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">Active</span>
                            )}
                        </div>

                        <div>
                            <h3 className="text-green-200 font-medium tracking-wide uppercase text-xs mb-1">Total Customers</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-white font-bold text-5xl tracking-tight">{customerData.length}</span>
                                <span className="text-green-200 text-sm">Clients</span>
                            </div>

                        </div>
                    </div>

                    {/* Giant Faded Icon background */}
                    <div className="absolute -bottom-6 -right-6 opacity-[0.1] rotate-[-12deg] transform group-hover:scale-110 group-hover:rotate-[-6deg] transition-all duration-500">
                        <Users className="w-48 h-48 text-white" />
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <Tabs activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setCurrentPage(1); }} />

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                    </div>
                    <SearchBar
                        searchTerm={searchTerm}
                        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                        placeholder={`Search ${activeTab}s...`}
                    />
                </div>
            </div>

            {/* Content: Grid or List */}
            {filteredData.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedData.map((item, index) => (
                            <EntityCard key={index} data={item} type={activeTab === 'vendor' ? 'Vendor' : 'Customer'} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{activeTab === 'vendor' ? 'Ageing' : 'Address'}</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedData.map((item, index) => (
                                        <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${activeTab === 'vendor' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    {activeTab === 'vendor' ? (
                                                        <>
                                                            <span className="text-sm text-gray-900">Bill #: {item.bill_number}</span>
                                                            <span className="text-xs text-gray-500">Date: {item.bill_date}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-sm text-gray-900">GSTN: {item.gstn}</span>
                                                            <span className="text-xs text-gray-500 truncate max-w-[150px]">{item.email}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-500">
                                                    {activeTab === 'vendor' ? item.ageing : <span title={item.address} className="line-clamp-1">{item.address}</span>}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-mono text-sm text-gray-700">₹{item.balance}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <Store className="w-12 h-12 text-gray-200 mb-3" />
                    <h3 className="text-gray-900 font-bold">No results found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your search.</p>
                </div>
            )}

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
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorCustomer;
