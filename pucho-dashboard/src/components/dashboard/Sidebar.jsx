import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/pucho_logo_latest.png';
import { 
  BarChart3, 
  CreditCard, 
  Truck, 
  Files, 
  Activity, 
  UserSquare2, 
  Terminal, 
  LogOut,
  RefreshCw,
  Box,
  FileText,
  Workflow,
  Zap
} from 'lucide-react';


const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [expandedMenus, setExpandedMenus] = useState({});
    const toggleMenu = (menuName) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    // Organized Menu Items strictly based on the 16 Use Cases
    const menuItems = [
        { name: 'Management Dashboard', path: '/admin', icon: BarChart3 }, // UC-16
        {
            name: 'Accounts & CRM',
            icon: CreditCard,
            children: [
                { name: 'Accounts CRM', path: '/admin/accounts-crm' }, // UC-1, UC-3
                { name: 'Payment Planning', path: '/admin/payments' }, // UC-9
                { name: 'Bank Reconciliation', path: '/admin/bank-recon' }, // UC-6
            ]
        },
        {
            name: 'Dispatch & Logistic',
            icon: Truck,
            children: [
                { name: 'Dispatch Center', path: '/admin/dispatch' }, // UC-2
                { name: 'Order Tracking', path: '/admin/orders' }, // UC-10
                { name: 'Material Planning', path: '/admin/material' }, // UC-11
            ]
        },
        {
            name: 'Compliance Hub',
            icon: Files,
            children: [
              { name: 'GSTR-1 Validation', path: '/admin/gst' }, // UC-7
              { name: '2B Reconciliation', path: '/admin/2b-recon' }, // UC-8
            ]
        },
        { name: 'Sales & Quotation', path: '/admin/quotation', icon: FileText }, // UC-13
        { name: 'Product Lifecycle', path: '/admin/lifecycle', icon: RefreshCw }, // UC-15
        { name: 'AI Assignment Audit', path: '/admin/ai-audit', icon: Workflow }, // UC-5
        { name: 'Employee Master', path: '/admin/employees', icon: UserSquare2 }, // UC-12
        { name: 'Briefing Hub', path: '/admin/productivity', icon: Zap }, // WF-9, 10
    ];


    const renderNavItems = (items, depth = 0) => {
        return items.map((item) => (
            <div key={item.name} className={depth > 0 ? "mt-1" : "mb-1"}>
                {item.children ? (
                    <>
                        <button
                            onClick={() => toggleMenu(item.name)}
                            className={`w-full flex justify-between items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-xl group ${
                                expandedMenus[item.name] ? 'bg-slate-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon && <item.icon className={`w-4 h-4 ${expandedMenus[item.name] ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />}
                                <span>{item.name}</span>
                            </div>
                            <svg className={`w-3 h-3 transition-transform ${expandedMenus[item.name] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedMenus[item.name] && (
                            <div className="pl-9 mt-1 space-y-1">
                                {renderNavItems(item.children, depth + 1)}
                            </div>
                        )}
                    </>
                ) : (
                    <NavLink
                        to={item.path}
                        end={item.path === '/admin'}
                        onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 ${
                            isActive 
                            ? 'bg-indigo-50/50 border-indigo-100 text-indigo-700 shadow-sm' 
                            : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                    >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        <span className="truncate">{item.name}</span>
                    </NavLink>
                )}
            </div>
        ));
    };

    return (
        <aside className={`w-[260px] h-screen bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 left-0 z-30 transition-transform duration-300 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-20 flex items-center px-6">
                <img src={logo} alt="Pucho" className="h-8 w-auto filter drop-shadow-sm" />
            </div>

            <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
                {renderNavItems(menuItems)}
            </nav>

            <div className="px-6 py-4 border-t border-slate-50 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <UserSquare2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.full_name || 'Admin'}</p>
                        <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest font-bold">{user?.role || 'Administrator'}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all duration-200">
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
