import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isLoggingOut } = useAuth();
  const [authStatus, setAuthStatus] = useState<"loading" | "authorized" | "unauthenticated" | "denied">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function verifyAdminAccess() {
      try {
        // 1. Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          if (isMounted) setAuthStatus("unauthenticated");
          return;
        }

        // 2. Get session.user.id
        const userId = session.user.id;

        // 3. Query profiles table: select id, full_name, role by exact ID
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("id", userId)
          .single();

        if (profileError || !profile) {
          if (isMounted) setAuthStatus("denied");
          return;
        }

        const userRole = profile.role;

        // 4 & 5. Check EXACTLY profile.role === 'admin'
        if (userRole === "admin") {
          if (isMounted) setAuthStatus("authorized");
        } else {
          // 6 & 7. If role is 'user' or non-admin, deny access
          if (isMounted) setAuthStatus("denied");
        }
      } catch (err) {
        console.error("[AdminGuard] Exception during role verification:", err);
        if (isMounted) setAuthStatus("denied");
      }
    }

    verifyAdminAccess();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      verifyAdminAccess();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // If the user intentionally triggered a logout, do not intercept the redirect
    if (isLoggingOut) return;

    if (authStatus === "unauthenticated") {
      // 8. If the user is not authenticated: redirect to /login
      toast.error("Please sign in as administrator to access Admin Portal.");
      navigate("/login");
    } else if (authStatus === "denied") {
      // 6 & 7. If role is user or missing: deny access and redirect to normal customer homepage
      toast.error("You do not have permission to access the Admin Portal.");
      navigate("/");
    }
  }, [authStatus, navigate, isLoggingOut]);

  if (authStatus === "loading") {
    return (
      <div className="section-shell flex min-h-[70vh] flex-col items-center justify-center py-16">
        <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span>Verifying administrator authorization...</span>
        </div>
      </div>
    );
  }

  // ONLY render Admin Portal if verified role === 'admin'
  if (authStatus !== "authorized") {
    return null;
  }

  return <>{children}</>;
}
