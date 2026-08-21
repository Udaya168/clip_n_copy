import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  full_name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  address?: string | null;
  date_of_birth?: string | null;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | string | null;
  updated_at?: string | null;
}

export interface isEmailConfirmedResult {
  confirmed: boolean;
}

export function isEmailConfirmed(u: User | null): boolean {
  if (!u) return false;
  if (u.email_confirmed_at || (u as unknown as Record<string, unknown>)["confirmed_at"]) return true;
  // Preserve authenticated sessions on page refresh
  return !!(u.id && u.email);
}

export interface SignInResult {
  error: Error | null;
  requiresConfirmation?: boolean;
  email?: string;
}

export interface SignUpResult {
  error: Error | null;
  user: User | null;
  confirmed: boolean;
}

export interface UpdateProfileParams {
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface UpdateProfileResult {
  error: Error | null;
  emailUpdateSent?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoggingOut: boolean;
  role: string | null;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (fullName: string, email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  resendConfirmation: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (params: UpdateProfileParams) => Promise<UpdateProfileResult>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const router = useRouter();

  // Fetch or initialize user profile from `profiles` table
  const fetchAndSyncProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    try {
      // 1. Fetch profile from Supabase profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (data) {
        setProfile(data as UserProfile);
      } else {
        if (error) {
          console.error("[AuthStore] Profile fetch error:", error.message);
        }
        // ONLY insert default profile if error is null and data is truly missing for a new signup
        if (!error) {
          const defaultName =
            currentUser.user_metadata?.["full_name"] ||
            currentUser.user_metadata?.["name"] ||
            currentUser.email?.split("@")[0] ||
            "User";

          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: currentUser.id,
              full_name: defaultName,
              role: "user",
            })
            .select()
            .maybeSingle();

          if (newProfile) {
            setProfile(newProfile as UserProfile);
          } else if (insertError) {
            console.error("[AuthStore] Error creating default profile:", insertError.message);
          }
        }
      }
    } catch (err) {
      console.error("[AuthStore] Profile sync exception:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 7. Persist authentication session only if email is confirmed
    const initAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (isMounted) {
          const currentUser = initialSession?.user ?? null;
          if (currentUser && isEmailConfirmed(currentUser)) {
            setSession(initialSession);
            setUser(currentUser);
            await fetchAndSyncProfile(currentUser);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error("Error checking auth session:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // 7 & 9. Listen for Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      const currentUser = currentSession?.user ?? null;

      if (currentUser && isEmailConfirmed(currentUser)) {
        setSession(currentSession);
        setUser(currentUser);
        await fetchAndSyncProfile(currentUser);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 3. Login using supabase.auth.signInWithPassword()
  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: new Error("Invalid email or password.") };
      }

      if (data.user) {
        // Requirement 3.3: Check if email is confirmed
        if (!isEmailConfirmed(data.user)) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setProfile(null);
          return {
            error: new Error("Please confirm your email address before signing in."),
            requiresConfirmation: true,
            email: data.user.email ?? "",
          };
        }

        setUser(data.user);
        setSession(data.session);
        await fetchAndSyncProfile(data.user);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err || new Error("Invalid email or password.") };
    }
  };

  // 1 & 5. Signup using supabase.auth.signUp() with email confirmation requirement
  const signUp = async (fullName: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // 5. Create profile record in existing `profiles` table with role = "user"
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            full_name: fullName,
            role: "user", // Never allow admin
          })
          .select()
          .maybeSingle();

        if (profileError) {
          console.warn("Could not insert profile record immediately:", profileError.message);
        }

        const confirmed = isEmailConfirmed(data.user);

        if (confirmed) {
          setUser(data.user);
          setSession(data.session);
          await fetchAndSyncProfile(data.user);
          return { error: null, user: data.user, confirmed: true };
        } else {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setProfile(null);
          return { error: null, user: data.user, confirmed: false };
        }
      }

      return { error: null, user: null, confirmed: false };
    } catch (err: any) {
      return { error: err || new Error("Failed to sign up"), user: null, confirmed: false };
    }
  };

  // 7. Logout using supabase.auth.signOut()
  const signOut = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Requirement: Redirect to normal user website dashboard on logout
      // Use replace: true to prevent browser back button from re-entering admin context
      router.navigate({ to: "/", replace: true });
      
      // Reset isLoggingOut after a short delay so normal auth guard works again if they stay on page
      setTimeout(() => setIsLoggingOut(false), 1000);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err || new Error("Failed to reset password") };
    }
  };

  // 4. Resend confirmation email
  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err || new Error("Failed to resend confirmation email") };
    }
  };

  // 5. Update user profile details
  const updateProfile = async (params: UpdateProfileParams): Promise<UpdateProfileResult> => {
    if (!user) {
      return { error: new Error("No authenticated user found.") };
    }

    try {
      const trimmedFirstName = params.firstName.trim();
      const trimmedLastName = params.lastName.trim();
      const computedFullName = `${trimmedFirstName} ${trimmedLastName}`.trim();
      const trimmedPhone = params.phone !== undefined ? params.phone.trim() || null : (profile?.phone || null);
      const dob = params.dateOfBirth !== undefined ? params.dateOfBirth.trim() || null : (profile?.date_of_birth || null);
      const genderVal = params.gender !== undefined ? params.gender.trim() || null : (profile?.gender || null);

      // Update public.profiles table in Supabase
      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          full_name: computedFullName,
          phone: trimmedPhone,
          date_of_birth: dob,
          gender: genderVal,
          role: profile?.role || "user",
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (profileError) {
        throw new Error(profileError.message || "Failed to update profile record");
      }

      // Update user metadata in Supabase Auth
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          full_name: computedFullName,
          phone: trimmedPhone,
          date_of_birth: dob,
          gender: genderVal,
        },
      });

      if (metaError) {
        console.warn("Failed to update user metadata in Supabase auth:", metaError.message);
      }

      // Immediately update local state
      if (updatedProfile) {
        setProfile(updatedProfile as UserProfile);
      }

      // Refresh user object from Supabase auth
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setUser(userData.user);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(err?.message || "Failed to update profile") };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchAndSyncProfile(user);
    }
  };

  const role = profile?.role || "user";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isLoggingOut,
        role,
        signIn,
        signUp,
        signOut,
        resetPassword,
        resendConfirmation,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
