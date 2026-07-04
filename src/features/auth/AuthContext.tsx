import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/supabase/supabase';
import type { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];
export type ThemePreference = 'light' | 'dark';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
  loading: boolean;
  theme: ThemePreference;
  signOut: () => Promise<void>;
  mockSignIn: (role: 'admin' | 'super') => void;
  updateOrganizationPlace: (place: string) => Promise<void>;
  updateTheme: (theme: ThemePreference) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Apply theme class to document root
function applyTheme(theme: ThemePreference) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<ThemePreference>(() => {
    // Restore theme from localStorage as initial value before Supabase loads
    const saved = localStorage.getItem('theme_preference');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  // Apply theme immediately when it changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme_preference', theme);
  }, [theme]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          await fetchProfileAndOrg(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setOrganization(null);
        }
      } catch (err) {
        console.error('Error checking auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true);
        if (session) {
          setUser(session.user);
          await fetchProfileAndOrg(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setOrganization(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfileAndOrg = async (userId: string) => {
    try {
      const { data: rawProfile, error: profileError } = await (supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single() as any);

      if (profileError) throw profileError;
      const profileData = rawProfile as Profile;
      setProfile(profileData);

      // Apply saved theme preference from database
      if (profileData?.theme_preference) {
        const pref = profileData.theme_preference as ThemePreference;
        setTheme(pref);
        applyTheme(pref);
      }

      // Fetch organization if user is an org_admin
      if (profileData?.organization_id) {
        const { data: rawOrg, error: orgError } = await (supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single() as any);

        if (!orgError && rawOrg) {
          setOrganization(rawOrg as Organization);
        }
      }
    } catch (err) {
      console.error('Error fetching profile/org:', err);
      setProfile(null);
      setOrganization(null);
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      setOrganization(null);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const updateOrganizationPlace = useCallback(async (place: string) => {
    if (!organization?.id) throw new Error('No organization found.');
    const { error } = await (supabase.from('organizations') as any)
      .update({ location: place, updated_at: new Date().toISOString() })
      .eq('id', organization.id);

    if (error) throw error;
    // Update in-memory state immediately (no page reload required)
    setOrganization(prev => prev ? { ...prev, location: place } : null);
  }, [organization]);

  const updateTheme = useCallback(async (newTheme: ThemePreference) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme_preference', newTheme);

    // Persist to Supabase if user is logged in
    if (profile?.id) {
      try {
        await (supabase.from('profiles') as any)
          .update({ theme_preference: newTheme })
          .eq('id', profile.id);
      } catch (err) {
        console.warn('Could not persist theme to Supabase:', err);
      }
    }
  }, [profile]);

  const mockSignIn = (role: 'admin' | 'super') => {
    setLoading(true);
    const mockUser: User = {
      id: role === 'admin' ? '00000000-0000-0000-0000-000000000200' : '00000000-0000-0000-0000-000000000100',
      email: role === 'admin' ? 'admin@greenclass.com' : 'superadmin@assufadars.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as any;

    const mockProfile: Profile = {
      id: mockUser.id,
      organization_id: role === 'admin' ? '00000000-0000-0000-0000-000000000001' : null,
      full_name: role === 'admin' ? 'Green Class Admin' : 'Super Admin User',
      phone: '+919876543210',
      role: role === 'admin' ? 'org_admin' : 'super_admin',
      theme_preference: theme,
      created_at: new Date().toISOString(),
    };

    const mockOrg: Organization | null = role === 'admin' ? {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Green Dars',
      location: 'Wandoor',
      admin_phone: '+919876543210',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } : null;

    setUser(mockUser);
    setProfile(mockProfile);
    setOrganization(mockOrg);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, organization, loading,
      theme, signOut, mockSignIn,
      updateOrganizationPlace, updateTheme
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
