import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jwqeuijbxlkbcoajbjwc.supabase.co"; // HARDCODED URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cWV1aWpieGxrYmNvYWpiandjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNzYzNDAsImV4cCI6MjA4Mjc1MjM0MH0.2J-w0LXP599FQRmcStdYPT8x__PNG5nLcAIIYTlEbrE"; // HARDCODED ANON KEY
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cWV1aWpieGxrYmNvYWpiandjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE3NjM0MCwiZXhwIjoyMDgyNzUyMzQwfQ.Gjr6VCWavWLnvhEd3wCpiyXjO_XXceKZW5SkTo6gz24"; // HARDCODED SERVICE KEY - WARNING: EXPOSED IN CLIENT BUILD

// Singleton pattern to prevent multiple instances during HMR
// Public client for normal interactions
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Admin client for user management (Service Role)
export const adminSupabase = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            storageKey: 'supabase-admin-auth-token'
        }
    })
    : null;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase keys missing! App will not work correctly.");
}
