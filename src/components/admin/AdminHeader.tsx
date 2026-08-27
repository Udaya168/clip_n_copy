import { useAuth } from "@/lib/auth-store";
import { Link } from "react-router-dom";
import { LogOut, Shield, User as UserIcon, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

      <div className="flex items-center justify-end gap-3 flex-1 ml-4">
        <div className="hidden md:flex relative max-w-sm w-full mr-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search products, orders..." 
            className="pl-9 bg-secondary/30 border-border rounded-full h-9 text-xs"
          />
        </div>

        <Link
          to="/"
          className="hidden rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex items-center gap-1.5 shrink-0"
        >
          <Home className="size-3.5" /> View Storefront
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-1.5 py-1.5 hover:bg-secondary/50 transition-colors shrink-0">
          <div className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="size-4" />
          </div>
          <div className="hidden sm:block text-left min-w-0 pr-2">
            <p className="truncate text-xs font-bold text-foreground max-w-24">{adminName}</p>
            <p className="flex items-center gap-1 text-[9px] font-extrabold text-primary uppercase">
              <Shield className="size-2" /> Admin
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut()}
          className="size-9 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer shrink-0"
          title="Logout"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
