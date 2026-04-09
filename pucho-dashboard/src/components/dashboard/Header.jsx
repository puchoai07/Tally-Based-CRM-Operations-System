import React, { useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import MenuIcon from '../../assets/icons/menu.svg';
import BellIcon from '../../assets/icons/bell.png';
import PuchoLogo from '../../assets/icons/chat_icon_final.png';

const Header = ({ onMenuClick }) => {
    const location = useLocation();

    // Map paths to Title and Description
    const pageMetadata = {
        '/admin': { title: 'Daily Overview', description: 'Financial overview and key performance indicators' },
        '/admin/agents': { title: 'Stock Inventory', description: 'Monitor real-time stock levels and valuation across all geographic locations.' },
        '/admin/chat': { title: 'Budget Analytics', description: 'Track actual expenses against allocated budgets across all ledgers.' },
        '/admin/flow': { title: 'Statement & Ledger', description: 'Financial records and transaction history from statements.' },
        '/admin/activity': { title: 'MIS & Analytical Reporting', description: 'Key performance indicators and analytical reports.' },
        '/admin/mcp': { title: 'Financial Insight', description: 'Automated financial health analysis and key metrics.' },
        '/admin/knowledge': { title: 'Data Hygiene', description: 'Review and fix missing or incomplete data records.' },
        '/admin/tools': { title: 'Credit Risk & Receivables', description: 'Monitor liquidity, payables, and receivables.' },
        '/admin/marketplace': { title: 'Vendor & Customer Management', description: 'Manage vendor and customer directories.' },
        '/admin/taxation': { title: 'Taxation & Compliance', description: 'Monitor compliance status and tax filings.' },
        '/admin/users': { title: 'User Management', description: 'Create and manage access for dashboard users.' },
    };

    const currentPath = location.pathname;
    const { title, description } = pageMetadata[currentPath] || { title: 'Dashboard', description: 'Welcome to Pucho Tally Dashboard' };

    return (
        <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 py-3 md:px-8 md:py-3 gap-4">
            {/* Left Side: Menu Toggle + Dynamic Title */}
            <div className="flex items-center gap-4 h-[44px]">
                {/* Mobile Menu Toggle */}
                <button onClick={onMenuClick} className="lg:hidden p-1 -ml-2 mr-2 hover:bg-gray-100 rounded-full transition-colors">
                    <img src={MenuIcon} alt="Menu" className="w-8 h-8 opacity-100" />
                </button>

                {/* Dynamic Title & Description (Replaces Search) */}
                {/* Dynamic Title & Description */}
                <div>
                    <h1 className="text-xl md:text-2xl font-bold font-inter text-gray-900 tracking-tight leading-none mb-0.5">
                        {title}
                    </h1>
                    <p className="text-xs text-gray-500 font-medium hidden md:block">
                        {description}
                    </p>
                </div>
            </div>

            {/* Actions (Right) */}
            <div className="flex items-center gap-4">
                {/* Mobile: Logo Only */}
                <img src={PuchoLogo} alt="Pucho Logo" className="w-10 h-10 object-contain md:hidden" />

                {/* Desktop: Text Only */}
                <span className="hidden md:block text-sm font-semibold text-[#111935] text-right">Pucho Tally Dashboard</span>
            </div>
        </header>
    );
};

export default Header;
