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
  role: 'learner' | 'instructor' | 'admin' | 'super-admin';
  firstName?: string;
  lastName?: string;
  activeCohortId?: string;
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
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    role: (meta.role ?? profileData?.role ?? 'learner') as User['role'],
    firstName: meta.firstName ?? profileData?.firstName ?? '',
    lastName: meta.lastName ?? profileData?.lastName ?? '',
    activeCohortId: meta.activeCohortId ?? profileData?.activeCohortId,
    avatar: meta.avatar ?? profileData?.avatar,
    bio: meta.bio ?? profileData?.bio,
    title: meta.title ?? profileData?.title,
    phoneNumber: meta.phoneNumber ?? profileData?.phoneNumber,
    location: meta.location ?? profileData?.location,
    socialLinks: meta.socialLinks ?? profileData?.socialLinks,
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
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
        return supabaseUserToAppUser(supabaseUser, profile ?? undefined);
      } catch {
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
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const appUser = await loadProfile(session.user);
        setUser(appUser);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
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
      // If email confirmation is required, data.session will be null.
      // Throw a specific message so the UI can handle it gracefully.
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
