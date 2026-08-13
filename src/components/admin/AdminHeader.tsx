import { useAuth } from "@/lib/auth-store";
import { Link } from "@tanstack/react-router";
import { LogOut, Shield, User as UserIcon, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { user, profile, signOut } = useAuth();
  const adminName = profile?.full_name || (user?.user_metadata?.["full_name"] as string) || "Admin";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-lg font-black tracking-tight text-foreground sm:text-xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="hidden rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex items-center gap-1.5"
        >
          <Home className="size-3.5" /> View Storefront
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5">
          <div className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="size-4" />
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <p className="truncate text-xs font-bold text-foreground max-w-32">{adminName}</p>
            <p className="flex items-center gap-1 text-[10px] font-extrabold text-primary uppercase">
              <Shield className="size-2.5" /> Admin
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="rounded-full text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        >
          <LogOut className="size-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
