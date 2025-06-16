import { createClient } from '@supabase/supabase-js';

// IMPORTANT: In a real-world application, these values should be loaded from
// environment variables (e.g., via a .env file) and NOT hardcoded for security.
// This is done here because environment variables are not being picked up.
const supabaseUrl: string = "https://ggczjdgtzkfapkfjwrid.supabase.co";
const supabaseAnonKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnY3pqZGd0emtmYXBrZmp3cmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzg3NTQsImV4cCI6MjA2NTY1NDc1NH0.gGFp50pQyoSbM8oMfC-dXG8lstFPu0tFXlS6QqarNj4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);