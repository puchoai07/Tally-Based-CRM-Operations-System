import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';

const MENU_ITEMS = [
    { icon: Sparkles, label: 'Tally Assistant', path: '/' }
];

export function Sidebar({ isOpen, onClose }) {
    const location = useLocation();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "w-64 h-screen border-r border-slate-200 bg-white fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Area */}
                <div className="h-16 md:h-20 flex items-center justify-center px-6 border-b border-slate-100 relative">
                    <img src="/logo.png" alt="pucho.ai" className="h-8 md:h-10" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {MENU_ITEMS.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => onClose && onClose()} // Close sidebar on mobile when link clicked
                                className={cn(
                                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-[#F4EBFF] text-pucho-purple shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-pucho-purple"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 mr-3 transition-colors", isActive ? "text-pucho-purple" : "text-slate-400 group-hover:text-pucho-purple")} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>
        </>
    );
}
