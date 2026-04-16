import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  city: string | null;
  rider_status: string | null;
  vehicle_type: string | null;
  vehicle_plate: string | null;
  university: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: UserRole, phone?: string, city?: string, vehicleType?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileFetchAttempts, setProfileFetchAttempts] = useState(0);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Force login on every fresh app open (no persistent sessions)
    const sessionActive = sessionStorage.getItem('auth_session_active');
    if (!sessionActive) {
      // Fresh app open — clear any persisted session
      supabase.auth.signOut().then(() => {
        setLoading(false);
      });
      // Don't set up listener until after signout completes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            sessionStorage.setItem('auth_session_active', 'true');
            setTimeout(() => {
              fetchProfile(session.user.id).then((p) => {
                setProfile(p);
                setProfileFetchAttempts(p ? 0 : 1);
              });
            }, 0);
          } else {
            setProfile(null);
            setProfileFetchAttempts(0);
          }
        }
      );
      return () => subscription.unsubscribe();
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetch with setTimeout to avoid deadlock
        if (session?.user) {
          sessionStorage.setItem('auth_session_active', 'true');
          setTimeout(() => {
            fetchProfile(session.user.id).then((p) => {
              setProfile(p);
              setProfileFetchAttempts(p ? 0 : 1);
            });
          }, 0);
        } else {
          setProfile(null);
          setProfileFetchAttempts(0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then((p) => {
          setProfile(p);
          setProfileFetchAttempts(p ? 0 : 1);
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Resilience: if profile fetch fails (network/RLS/transient), retry a few times.
  // This prevents the app from getting stuck on auth screens after successful login.
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (profile) return;
    if (profileFetchAttempts <= 0) return;
    if (profileFetchAttempts > 5) return;

    const delayMs = Math.min(1000 * 2 ** (profileFetchAttempts - 1), 15000);
    const t = window.setTimeout(() => {
      fetchProfile(user.id).then((p) => {
        if (p) {
          setProfile(p);
          setProfileFetchAttempts(0);
        } else {
          setProfileFetchAttempts((n) => n + 1);
        }
      });
    }, delayMs);

    return () => window.clearTimeout(t);
  }, [loading, user, profile, profileFetchAttempts]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'customer',
    phone?: string,
    city?: string,
    vehicleType?: string
  ) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
          phone: phone,
          city: city,
          vehicle_type: vehicleType,
        },
      },
    });

    if (error) return { error: error as Error | null };

    // Ensure profile row exists immediately — don't rely solely on DB trigger
    if (data.user) {
      await supabase.from('profiles').upsert(
        {
          user_id: data.user.id,
          full_name: fullName,
          role: role,
          phone: phone ?? null,
          city: city ?? null,
          vehicle_type: vehicleType ?? null,
        },
        { onConflict: 'user_id' }
      );
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    sessionStorage.removeItem('auth_session_active');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setProfileFetchAttempts(0);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return { error: new Error('No profile found') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, ...updates });
    }

    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
