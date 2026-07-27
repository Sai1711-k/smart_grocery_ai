// lib/supabase-server.ts — Supabase admin client for server-side usage (API routes)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_KEY!;

// This client bypasses RLS — use only in API routes / server actions
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
