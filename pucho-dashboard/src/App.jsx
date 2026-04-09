import React from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import AccountsCRM from "./pages/AccountsCRM";
import DispatchCenter from "./pages/DispatchCenter";


// To be implemented based on blueprint
import ManagementDashboard from "./pages/ManagementDashboard";
import GSTRCompliance from "./pages/GSTRCompliance";
import BankRecon from "./pages/BankRecon";
import TwoBReconcile from "./pages/TwoBReconcile";
import OrderLifecycle from "./pages/OrderLifecycle";
import MaterialPlanning from "./pages/MaterialPlanning";
import PaymentPlanning from "./pages/PaymentPlanning";
import QuotationManager from "./pages/QuotationManager";
import ProductLifecycle from "./pages/ProductLifecycle";
import AIAssignmentAudit from "./pages/AIAssignmentAudit";
import ProductivityBriefing from "./pages/ProductivityBriefing";




const Placeholder = ({ title }) => (
    <div className="p-8 glass-card animate-fade-in flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold font-sans text-slate-800">{title}</h2>
        <p className="text-slate-500 mt-2">Implementation as per Use Case Blueprint in progress.</p>
    </div>
);

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-indigo-600 animate-pulse">Loading Pucho Tally CRM...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        {/* Tally CRM & Operations Layout */}
                        <Route path="/admin" element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }>
                            {/* Phase 1 Modules */}
                            <Route index element={<ManagementDashboard />} />

                            <Route path="accounts-crm" element={<AccountsCRM />} />
                            <Route path="dispatch" element={<DispatchCenter />} />

                            <Route path="orders" element={<OrderLifecycle />} />

                            <Route path="employees" element={<UserManagement />} />
                            
                            {/* Phase 2 & 3 Modules */}
                            <Route path="bank-recon" element={<BankRecon />} />

                            <Route path="payments" element={<PaymentPlanning />} />

                            <Route path="gst" element={<GSTRCompliance />} />
                            <Route path="2b-recon" element={<TwoBReconcile />} />


                            <Route path="quotation" element={<QuotationManager />} />

                            <Route path="material" element={<MaterialPlanning />} />

                            <Route path="lifecycle" element={<ProductLifecycle />} />
                            <Route path="ai-audit" element={<AIAssignmentAudit />} />
                            <Route path="productivity" element={<ProductivityBriefing />} />


                        </Route>

                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
