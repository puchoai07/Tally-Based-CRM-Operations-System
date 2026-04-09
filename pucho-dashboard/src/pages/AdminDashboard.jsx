import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import Chatbot from "../components/dashboard/Chatbot";
import { Outlet, useLocation } from "react-router-dom";
import { fetchLastUpdatedDate } from '../lib/sheetService';

const AdminDashboard = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('Checking...');
    const location = useLocation();
    const isUserManagement = location.pathname.includes('/users');



    return (
        <div className="flex h-screen bg-pucho-light overflow-hidden font-sans text-gray-900">
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar: Responsive */}
            <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col ml-0 lg:ml-[240px] overflow-hidden relative transition-all duration-300 pt-[3px] lg:pt-0">
                {/* Header: Sticky Top */}
                <Header onMenuClick={() => setIsMobileOpen(true)} />

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50/50 px-4 pt-4 md:pt-6 md:px-8 pb-12 relative scroll-smooth custom-scrollbar">
                    {/* Removed Last Update Date Badge */}

                    <div className="w-full">
                        <Outlet context={{ setLastUpdated }} />
                    </div>
                </main>
            </div>
            <Chatbot />
        </div>
    );
};

export default AdminDashboard;
