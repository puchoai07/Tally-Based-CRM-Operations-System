import React, { useState, useEffect, useMemo } from 'react';
import { fetchUsersData } from '../lib/sheetService';

const UsersDashboard = () => {
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const fetched = await fetchUsersData();
                const cleaned = fetched.filter(item => item && item.u_email);
                setRawData(cleaned);
            } catch (err) {
                console.error("Failed to fetch Users data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Summary calculations
    const summary = useMemo(() => {
        if (!rawData || rawData.length === 0) return null;

        const totalUsers = rawData.length;
        const activeUsers = rawData.filter(d => String(d.u_active) === '1').length;
        const inactiveUsers = totalUsers - activeUsers;
        const admins = rawData.filter(d => String(d.u_type).toLowerCase() === 'admin').length;

        return {
            totalUsers,
            activeUsers,
            inactiveUsers,
            admins
        };
    }, [rawData]);

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

    // Role format helper
    const hasAccess = (val) => String(val) === '1';

    return (
        <div className="p-6 space-y-8 animate-fade-in bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management Analysis</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Security overview of system operators, active accounts, and module permission matrices
                    </p>
                </div>
            </div>

            {/* Analysis Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total System Users</p>
                        <h4 className="text-3xl font-bold text-[#4F46E5]">{summary.totalUsers}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Active Accounts</p>
                        <h4 className="text-3xl font-bold text-[#10B981]">{summary.activeUsers}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Dormant Accounts</p>
                        <h4 className="text-3xl font-bold text-[#F59E0B]">{summary.inactiveUsers}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Administrators</p>
                        <h4 className="text-3xl font-bold text-[#ef4444]">{summary.admins}</h4>
                    </div>
                </div>
            )}

            {/* Access Matrix Data Grid */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Operator Directory & Permissions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Identity</th>
                                <th className="px-6 py-4">Contact Profile</th>
                                <th className="px-6 py-4">Account Status</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-center">Financials</th>
                                <th className="px-6 py-4 text-center">Sales & Mktg</th>
                                <th className="px-6 py-4 text-center">Production</th>
                                <th className="px-6 py-4 text-center">Operations</th>
                                <th className="px-6 py-4 text-center">Work Capital</th>
                                <th className="px-6 py-4 text-center">EHS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {rawData.length > 0 ? (
                                rawData.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 font-medium capitalize">
                                            {row.u_fname} {row.u_lname}
                                        </td>
                                        <td className="px-6 py-4 text-blue-600 font-medium">
                                            {row.u_email}
                                        </td>
                                        <td className="px-6 py-4">
                                            {String(row.u_active) === '1'
                                                ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Active</span>
                                                : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Inactive</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 capitalize">
                                            {row.u_type || 'User'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {hasAccess(row.financials) ? '✅' : '❌'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {hasAccess(row.sales_marketing) ? '✅' : '❌'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {hasAccess(row.production) ? '✅' : '❌'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {hasAccess(row.other_operations) ? '✅' : '❌'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {hasAccess(row.working_capital) ? '✅' : '❌'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {hasAccess(row.ehs) ? '✅' : '❌'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                                        No users found.
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

export default UsersDashboard;
