import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://bsqcdtnbggteperunbkr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzcWNkdG5iZ2d0ZXBlcnVuYmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2OTg0MDgsImV4cCI6MjA4NzI3NDQwOH0.7vCGEkZij2nxXWN06aSqUsYVCkOMZguwZBOXu3ysM9Y";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
