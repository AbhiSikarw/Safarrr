import { createClient } from "@supabase/supabase-js";

// Supabase client for browser-side usage
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      flowType: 'pkce', // More secure OAuth flow
    },
    global: {
      headers: {
        'x-application-name': 'banzara',
      },
    },
  }
);

// Helper function for safe queries
export const safeSupabaseQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
) => {
  try {
    const { data, error } = await queryFn();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Supabase query error:', error);
    return { data: null, error };
  }
};

// Type-safe client (optional but recommended)
export type Tables = {
  profiles: {
    Row: {
      id: string;
      name: string | null;
      avatar: string | null;
      created_at: string;
    };
  };
  posts: {
    Row: {
      id: string;
      user_id: string;
      title: string;
      content: string;
      location: string;
      safety_score: number;
      created_at: string;
    };
  };
  // Add other table types as needed
};