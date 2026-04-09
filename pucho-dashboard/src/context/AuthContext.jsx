import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('dashboard_user_data');
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { return null; }
        }
        return null;
    });
    // Only show loading screen if no user is found in localStorage
    const [loading, setLoading] = useState(!user);

    useEffect(() => {
        // 1. Safety Check: If keys are missing, run in Demo Mode
        if (!supabase) {
            console.warn("Supabase keys missing. App running in Demo Mode.");
            setLoading(false);
            return;
        }

        const fetchProfile = async (userId) => {
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                return profile;
            } catch (err) {
                console.error("Profile fetch error:", err);
                return null;
            }
        };

        const initializeAuth = async () => {
            // If we already have a user, don't show the global loading screen again
            // but we still want to verify the session in the background.
            const isRestored = !!user;
            if (!isRestored) setLoading(true);

            // Safety timeout (reduced to 2s if we have a user, 3s otherwise)
            const timeoutDuration = isRestored ? 2000 : 3000;
            const timer = setTimeout(() => {
                if (!isRestored) setLoading(false);
            }, timeoutDuration);

            try {
                // Check active Supabase session
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const profile = await fetchProfile(session.user.id);
                    setUser({ ...session.user, ...(profile || {}) });
                } else if (!isRestored) {
                    // Only check backdoor if we didn't already restore it syncly
                    const storedUser = localStorage.getItem('dashboard_user_data');
                    if (storedUser) {
                        try { setUser(JSON.parse(storedUser)); } catch (e) { }
                    }
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                clearTimeout(timer);
                setLoading(false);
            }
        };

        initializeAuth();

        // set up listener for session changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("[DEBUG] onAuthStateChange event:", event);
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                setUser({ ...session.user, ...(profile || {}) });
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem('dashboard_user_data');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (username, password) => {
        // 2. BACKDOOR (Keep for now if needed, or remove to force Supabase)
        if (username === 'admin' && password === 'admin') {
            const mockUser = {
                id: 'admin-1',
                email: 'admin@pucho.ai',
                role: 'admin',
                full_name: 'Pucho Admin'
            };
            setUser(mockUser);
            localStorage.setItem('dashboard_user_data', JSON.stringify(mockUser));
            return { success: true };
        }

        // 3. REAL AUTH (Supabase)
        try {
            // Support Username login by appending domain if needed
            const finalEmail = username.includes('@') ? username : `${username}@pucho.app`;

            const { data, error } = await supabase.auth.signInWithPassword({
                email: finalEmail,
                password: password,
            });

            if (error) throw error;

            // Get Role from 'profiles' table
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.warn("Profile fetch failed, using basic auth data", profileError);
            }

            const fullUser = { ...data.user, ...(profile || {}) };
            setUser(fullUser);
            // We rely on Supabase session persistence usually, but setting state helps
            return { success: true };
        } catch (error) {
            console.error("Login error:", error.message);
            if (error.message === "Invalid login credentials") {
                return { success: false, message: "Email or password is not correct" };
            }
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('dashboard_user_data');
        await supabase.auth.signOut();
    };



    console.log("[DEBUG] AuthProvider Render. Loading:", loading, "User:", user);
    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
