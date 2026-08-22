import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://sixnsbwikhxaaiajmxbe.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5zYndpa2h4YWFpYWpteGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NDY2NTMsImV4cCI6MjEwMjIyMjY1M30.DOvQsbyB9SX4S-0XbKy8z1u_aNY9v9qrSlNcJUIz4qs";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
