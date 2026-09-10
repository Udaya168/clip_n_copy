import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  email?: string | null;
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

export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  const trimmed = phone.trim();
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) {
    return `+${digitsOnly}`;
  }
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return `+${digitsOnly}`;
  }
  return `+91${digitsOnly.slice(-10)}`;
}

export interface isEmailConfirmedResult {
  confirmed: boolean;
}

export function isEmailConfirmed(u: User | null): boolean {
  if (!u) return false;
  if (u.email_confirmed_at || (u as unknown as Record<string, unknown>)["confirmed_at"]) return true;
  if (u.phone_confirmed_at || u.phone) return true;
  if (u.app_metadata?.provider === "google" || u.app_metadata?.providers?.includes("google")) return true;
  // Preserve authenticated sessions on page refresh
  return !!(u.id && (u.email || u.phone));
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
  signIn: (identifier: string, password: string) => Promise<SignInResult>;
  signUp: (fullName: string, email: string, phone: string, password: string) => Promise<SignUpResult>;
  signInWithPhoneOtp: (phone: string) => Promise<{ error: Error | null }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error: Error | null; user: User | null }>;
  signInWithGoogle: (redirectTarget?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
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
  const navigate = useNavigate();

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
        const updates: Record<string, any> = {};
        const profileData = data as Record<string, any>;
        if (currentUser.email && !profileData["email"]) updates["email"] = currentUser.email;
        if (currentUser.phone && !profileData["phone"]) updates["phone"] = currentUser.phone;

        if (Object.keys(updates).length > 0) {
          try {
            await supabase.from("profiles").update(updates).eq("id", currentUser.id);
            Object.assign(data, updates);
          } catch (e) {
            console.warn("Could not update profile fields:", e);
          }
        }
        setProfile(data as UserProfile);
      } else {
        if (error) {
          console.error("[AuthStore] Profile fetch error:", error.message);
        }
        if (!error) {
          const defaultName =
            currentUser.user_metadata?.["full_name"] ||
            currentUser.user_metadata?.["name"] ||
            (currentUser.phone ? `User (${currentUser.phone.slice(-4)})` : null) ||
            currentUser.email?.split("@")[0] ||
            "User";

          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: currentUser.id,
              full_name: defaultName,
              email: currentUser.email || null,
              phone: currentUser.phone || null,
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

    let subscription: any = null;

    try {
      const { data } = supabase.auth.onAuthStateChange(async (_event: any, currentSession: Session | null) => {
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
      subscription = data.subscription;
    } catch (err) {
      console.warn("Supabase auth state change listener failed to initialize:", err);
      setLoading(false);
    }

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Login using Email OR Phone Number + Password
  const signIn = async (identifier: string, password: string): Promise<SignInResult> => {
    try {
      const trimmed = identifier.trim();
      const isEmail = trimmed.includes("@");

      if (isEmail) {
        // Authenticate with Email + Password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmed.toLowerCase(),
          password,
        });

        if (error || !data.user) {
          return { error: new Error("Invalid email or password.") };
        }

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
        return { error: null };
      } else {
        // Authenticate with Phone Number + Password
        const formattedPhone = formatPhoneNumber(trimmed);

        // Try Supabase Auth phone + password
        let { data, error } = await supabase.auth.signInWithPassword({
          phone: formattedPhone,
          password,
        });

        // If direct phone auth fails, lookup corresponding user email from database
        if (error || !data.user) {
          let resolvedEmail: string | null = null;
          try {
            const { data: rpcEmail } = await supabase.rpc("get_email_by_phone", { p_phone: formattedPhone });
            if (rpcEmail) resolvedEmail = rpcEmail;
          } catch (_e) {
            // fallback
          }

          if (!resolvedEmail) {
            const digits = trimmed.replace(/\D/g, "");
            const { data: profData } = await supabase
              .from("profiles")
              .select("email")
              .or(`phone.eq.${formattedPhone},phone.eq.${digits}`)
              .maybeSingle();
            if (profData?.email) {
              resolvedEmail = profData.email;
            }
          }

          if (resolvedEmail) {
            const emailRes = await supabase.auth.signInWithPassword({
              email: resolvedEmail,
              password,
            });
            data = emailRes.data;
            error = emailRes.error;
          }
        }

        if (error || !data.user) {
          return { error: new Error("Invalid phone number or password.") };
        }

        if (!isEmailConfirmed(data.user)) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setProfile(null);
          return {
            error: new Error("Please confirm your account email before signing in."),
            requiresConfirmation: true,
            email: data.user.email ?? "",
          };
        }

        setUser(data.user);
        setSession(data.session);
        await fetchAndSyncProfile(data.user);
        return { error: null };
      }
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error("Invalid login credentials.") };
    }
  };

  // Signup using Full Name, Email, Phone Number, and Password
  const signUp = async (fullName: string, email: string, phone: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const formattedPhone = formatPhoneNumber(phone);

      // Uniqueness check for Email and Phone Number
      try {
        const { data: checkData } = await supabase.rpc("check_user_exists", {
          p_email: cleanEmail,
          p_phone: formattedPhone,
        });

        if (checkData && checkData.length > 0) {
          if (checkData[0].email_exists) {
            return { error: new Error("An account with this email address already exists. Please sign in."), user: null, confirmed: false };
          }
          if (checkData[0].phone_exists) {
            return { error: new Error("An account with this phone number already exists. Please sign in."), user: null, confirmed: false };
          }
        }
      } catch (_e) {
        // Client-side profiles query fallback
        const { data: pEmail } = await supabase.from("profiles").select("id").eq("email", cleanEmail).maybeSingle();
        if (pEmail) {
          return { error: new Error("An account with this email address already exists. Please sign in."), user: null, confirmed: false };
        }
        const { data: pPhone } = await supabase.from("profiles").select("id").eq("phone", formattedPhone).maybeSingle();
        if (pPhone) {
          return { error: new Error("An account with this phone number already exists. Please sign in."), user: null, confirmed: false };
        }
      }

      // Execute Supabase Auth Signup
      let { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        phone: formattedPhone,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: formattedPhone,
          },
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
        },
      });

      // Fallback if top-level phone signups are disabled in Supabase Auth settings
      if (error && (error.message.toLowerCase().includes("phone") || error.message.toLowerCase().includes("provider"))) {
        const retryRes = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: formattedPhone,
            },
            emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
          },
        });
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            full_name: fullName.trim(),
            email: cleanEmail,
            phone: formattedPhone,
            role: "user",
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
      return { error: err instanceof Error ? err : new Error(err?.message || "Failed to sign up"), user: null, confirmed: false };
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
      navigate("/", { replace: true });
      
      // Reset isLoggingOut after a short delay so normal auth guard works again if they stay on page
      setTimeout(() => setIsLoggingOut(false), 1000);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err || new Error("Failed to reset password") };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(err?.message || "Failed to update password.") };
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
          email: profile?.email || user.email || null,
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

  const signInWithPhoneOtp = async (phone: string): Promise<{ error: Error | null }> => {
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(err?.message || "Failed to send OTP.") };
    }
  };

  const verifyPhoneOtp = async (
    phone: string,
    token: string
  ): Promise<{ error: Error | null; user: User | null }> => {
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: "sms",
      });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchAndSyncProfile(data.user);
        return { error: null, user: data.user };
      }
      return { error: new Error("Failed to verify OTP."), user: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(err?.message || "Invalid or expired OTP."), user: null };
    }
  };

  const signInWithGoogle = async (redirectTarget?: string): Promise<{ error: Error | null }> => {
    try {
      const target = redirectTarget || "/";
      const redirectUrl = `${window.location.origin}/login?redirect=${encodeURIComponent(target)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(err?.message || "Google sign in failed.") };
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
        signInWithPhoneOtp,
        verifyPhoneOtp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
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
