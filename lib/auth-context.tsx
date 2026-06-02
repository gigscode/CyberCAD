'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  role: 'learner' | 'super-admin';
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  title?: string;
  phoneNumber?: string;
  location?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function supabaseUserToAppUser(
  supabaseUser: SupabaseUser,
  profileData?: Partial<User>
): User {
  const meta = supabaseUser.user_metadata ?? {};
  // Profiles table is the authoritative source for role.
  // user_metadata is the fallback only.
  const role = (profileData?.role ?? meta.role ?? 'learner') as User['role'];
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    role,
    firstName: profileData?.firstName ?? meta.firstName ?? '',
    lastName: profileData?.lastName ?? meta.lastName ?? '',
    avatar: profileData?.avatar ?? meta.avatar,
    bio: profileData?.bio ?? meta.bio,
    title: profileData?.title ?? meta.title,
    phoneNumber: profileData?.phoneNumber ?? meta.phoneNumber,
    location: profileData?.location ?? meta.location,
    socialLinks: profileData?.socialLinks ?? meta.socialLinks,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(
    async (supabaseUser: SupabaseUser): Promise<User> => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, role, first_name, last_name, avatar, bio, title, phone_number, location, social_links')
          .eq('id', supabaseUser.id)
          .single();

        if (error) {
          // RLS or network error — fall back to metadata
          console.warn('[auth] profiles fetch failed, using metadata fallback:', error.message);
          return supabaseUserToAppUser(supabaseUser);
        }

        if (!profile) {
          console.warn('[auth] no profile row found for user:', supabaseUser.id);
          return supabaseUserToAppUser(supabaseUser);
        }

        return supabaseUserToAppUser(supabaseUser, {
          role: profile.role as User['role'],
          firstName: profile.first_name ?? undefined,
          lastName: profile.last_name ?? undefined,
          avatar: profile.avatar ?? undefined,
          bio: profile.bio ?? undefined,
          title: profile.title ?? undefined,
          phoneNumber: profile.phone_number ?? undefined,
          location: profile.location ?? undefined,
          socialLinks: profile.social_links ?? undefined,
        });
      } catch (e) {
        console.warn('[auth] unexpected error loading profile:', e);
        return supabaseUserToAppUser(supabaseUser);
      }
    },
    [supabase]
  );

  const refreshUser = useCallback(async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      const appUser = await loadProfile(supabaseUser);
      setUser(appUser);
    }
  }, [supabase, loadProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const appUser = await loadProfile(session.user);
        setUser(appUser);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          const appUser = await loadProfile(session.user);
          setUser(appUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, loadProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
    },
    [supabase]
  );

  const register = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      role = 'learner'
    ) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { firstName, lastName, role },
        },
      });
      if (error) throw new Error(error.message);
      // Email confirmation required — session will be null
      if (!data.session && data.user) {
        throw new Error('CHECK_EMAIL');
      }
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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
