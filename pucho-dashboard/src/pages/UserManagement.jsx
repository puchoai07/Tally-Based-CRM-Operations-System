import React, { useState, useEffect } from 'react';
import { adminSupabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Trash2, UserPlus, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const UserManagement = () => {
    const { setLastUpdated } = useOutletContext();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [newUserLogin, setNewUserLogin] = useState(''); // Username for login
    const [newUserRole, setNewUserRole] = useState('user');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserName, setNewUserName] = useState('');

    useEffect(() => {
        setLastUpdated(null); // Explicitly remove "Last Updated" badge for this page
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data: { users }, error } = await adminSupabase.auth.admin.listUsers();
            if (error) throw error;
            setUsers(users);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to fetch users. Ensure you have admin privileges (Service Key).");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');
        setMessage('');

        try {
            const { data, error } = await adminSupabase.auth.admin.createUser({
                email: newUserLogin.includes('@') ? newUserLogin : `${newUserLogin}@pucho.app`, // Auto-detect format
                password: newUserPassword,
                email_confirm: true,
                user_metadata: {
                    full_name: newUserName,
                    role: newUserRole
                }
            });

            if (error) throw error;

            setMessage(`User ${newUserLogin} created successfully!`);
            setNewUserLogin('');
            setNewUserRole('user');
            setNewUserPassword('');
            setNewUserName('');
            fetchUsers(); // Refresh list
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        setActionLoading(true);
        try {
            console.log("Attempting to delete user:", userId);

            // 1. Delete Profile First (Manual Cascade)
            const { error: profileError } = await adminSupabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (profileError) {
                console.warn("Error deleting profile (might not exist):", profileError);
                // We verify if we should continue, usually yes if profile is just missing
            }

            // 2. Delete Auth User
            const { error } = await adminSupabase.auth.admin.deleteUser(userId);
            if (error) throw error;

            setMessage("User deleted successfully.");
            fetchUsers();
        } catch (err) {
            console.error("Delete failed:", err);
            setError(`Delete failed: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    if (currentUser?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-[60vh] flex-col text-red-500">
                <Shield className="w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in font-inter px-6 pt-0 pb-6">

            {/* Messages */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}
            {message && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Create User Form */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Add New User</h2>
                    </div>

                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                value={newUserName}
                                onChange={e => setNewUserName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username (Login ID)</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                value={newUserLogin}
                                onChange={e => setNewUserLogin(e.target.value.replace(/\s+/g, '').toLowerCase())}
                                placeholder="john"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Will be saved as {newUserLogin.includes('@') ? newUserLogin : `${newUserLogin || 'username'}@pucho.app`}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                                value={newUserRole}
                                onChange={e => setNewUserRole(e.target.value)}
                            >
                                <option value="user">User (Standard Access)</option>
                                <option value="admin">Admin (Full Access)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                value={newUserPassword}
                                onChange={e => setNewUserPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create User'}
                        </button>
                    </form>
                </div>

                {/* User List */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Existing Users ({users.length})</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Created</th>
                                    <th className="px-6 py-4">Last Sign In</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Loading users...</td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">No users found.</td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                                        {(u.user_metadata?.full_name || u.email || 'U')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 line-clamp-1">{u.user_metadata?.full_name || 'No Name'}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.user_metadata?.role === 'admin'
                                                    ? 'bg-indigo-100 text-indigo-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {(u.user_metadata?.role || 'user').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
