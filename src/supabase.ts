import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      pooja_lists: {
        Row: {
          id: string;
          title: string;
          items: any[];
          owner_id: string;
          owner_name: string;
          owner_email: string;
          created_at: string;
          updated_at: string;
          is_public: boolean;
          share_code: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          items: any[];
          owner_id: string;
          owner_name: string;
          owner_email: string;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
          share_code?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          items?: any[];
          owner_id?: string;
          owner_name?: string;
          owner_email?: string;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
          share_code?: string | null;
        };
      };
    };
  };
}