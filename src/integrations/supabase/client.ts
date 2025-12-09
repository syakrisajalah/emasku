import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zzucjfbofodgndxvbuvz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6dWNqZmJvZm9kZ25keHZidXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMDcxNzUsImV4cCI6MjA3OTY4MzE3NX0.Rd_vg3u2fjOTbukPAKdzqPgwW6vsF8SCPJ_rM4pTdeQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);