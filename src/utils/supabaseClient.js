import { createClient } from '@supabase/supabase-js';

// *** ¡IMPORTANTE! REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO SUPABASE ***
const supabaseUrl = 'https://rlbmomerfewhjlxndfgk.supabase.co'; // Ejemplo: 'https://abcdefghijk.supabase.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYm1vbWVyZmV3aGpseG5kZmdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg4MTI0NywiZXhwIjoyMDY0NDU3MjQ3fQ.ZvSQTwnkdp6rdMmDOsUkwW-giYvavn9yGc7hLpjzZkQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
