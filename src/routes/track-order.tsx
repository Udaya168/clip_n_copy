import { ShopLayout } from "@/components/ShopLayout";
import { MyOrdersList } from "@/components/orders/MyOrdersList";
import { useAuth } from "@/lib/auth-store";
import { Truck, LogIn, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function TrackOrderPage() {
  const { user, loading } = useAuth();

  return (
    <ShopLayout>
      <div className="section-shell py-8 md:py-12 max-w-5xl mx-auto min-h-[60vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">Loading...</p>
          </div>
        ) : user ? (
          <MyOrdersList />
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 animate-in fade-in zoom-in duration-300">
            <div className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary mb-6 shadow-sm">
              <Truck className="size-8" />
            </div>
            <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">Track Order</h1>
            <p className="mt-4 text-muted-foreground max-w-md text-lg">
              Please sign in to view and track your orders.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 shadow-md"
              >
                Sign In <LogIn className="ml-2 size-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
