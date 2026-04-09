import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell
} from 'recharts';
import { fetchProjectProgressData } from '../lib/sheetService';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#14B8A6'];

const ProjectProgressDashboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const rawData = await fetchProjectProgressData();

                const formattedData = rawData
                    .filter(item => item && item.name)
                    .map(item => ({
                        ...item,
                        progress: parseFloat(item.progress) || 0,
                        pending: parseFloat(item.pending) || 0,
                        Label: item.name.trim()
                    }))
                    .sort((a, b) => b.progress - a.progress); // Sort by highest progress first

                setData(formattedData);
            } catch (err) {
                console.error("Failed to fetch Project Progress data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Summary calculation for KPI cards
    const summary = useMemo(() => {
        if (!data || data.length === 0) return null;

        const totalProjects = data.length;

        // Count anything 100% as fully completed
        const completedProjects = data.filter(d => d.progress >= 100).length;

        // Count anything > 0 but < 100 as active
        const activeProjects = data.filter(d => d.progress > 0 && d.progress < 100).length;

        // Average progress across all portfolio
        const avgProgress = data.reduce((acc, curr) => acc + curr.progress, 0) / totalProjects;

        return {
            totalProjects,
            completedProjects,
            activeProjects,
            avgProgress: avgProgress.toFixed(1)
        };
    }, [data]);

    // Custom Tooltip for the stacked bar
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-100 shadow-lg rounded-xl">
                    <p className="font-semibold text-gray-900 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 text-sm mb-1">
                            <span style={{ color: entry.color }} className="font-medium">
                                {entry.name}:
                            </span>
                            <span className="font-bold text-gray-700">
                                {entry.value}%
                            </span>
                        </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between gap-4 text-sm font-semibold text-gray-900">
                        <span>Status:</span>
                        <span>{payload[0].payload.progress >= 100 ? 'Completed' : 'In Progress'}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

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

    const tableHeaders = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'Label' && k !== 'id') : [];

    return (
        <div className="p-6 space-y-8 animate-fade-in bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Project Progress Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Live monitoring of active project pipelines and completion metrics
                    </p>
                </div>
            </div>

            {/* Analysis Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Active Portfolio</p>
                        <h4 className="text-3xl font-bold text-[#4F46E5]">{summary.totalProjects}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Average Completion Range</p>
                        <h4 className="text-3xl font-bold text-[#F59E0B]">{summary.avgProgress}%</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Currently Active</p>
                        <h4 className="text-3xl font-bold text-[#3B82F6]">{summary.activeProjects}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
                        <p className="text-sm font-medium text-gray-500 mb-1">Fully Completed</p>
                        <h4 className="text-3xl font-bold text-[#10B981]">{summary.completedProjects}</h4>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Completion Tracker</h3>
                <div className="h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                            barSize={32}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis type="category" dataKey="Label" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 13, fontWeight: 500 }} width={120} />

                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(243, 244, 246, 0.4)' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            {/* Stacked Bars representing out of 100% */}
                            <Bar dataKey="progress" stackId="a" fill="#10B981" name="Completed (%)" radius={[0, 0, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.progress >= 100 ? '#10B981' : '#3B82F6'} />
                                ))}
                            </Bar>
                            <Bar dataKey="pending" stackId="a" fill="#E5E7EB" name="Pending (%)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Raw Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Project Specifics Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 capitalize">Project Identifier</th>
                                {tableHeaders.map((header) => (
                                    <th key={header} className="px-6 py-4 capitalize">{header.replace(/_/g, ' ')}</th>
                                ))}
                                <th className="px-6 py-4">Status Indicator</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.length > 0 ? (
                                data.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 font-semibold">{row.Label}</td>
                                        {tableHeaders.map((header) => (
                                            <td key={`${index}-${header}`} className="px-6 py-4 text-gray-700">
                                                {(header === 'progress' || header === 'pending') ? `${row[header]}%` : row[header]}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.progress >= 100
                                                    ? 'bg-green-100 text-green-700'
                                                    : row.progress > 0
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {row.progress >= 100 ? 'Complete' : row.progress > 0 ? 'In Progress' : 'Pending Start'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={tableHeaders.length + 2} className="px-6 py-8 text-center text-gray-500">
                                        No active projects available for this view.
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

export default ProjectProgressDashboard;
