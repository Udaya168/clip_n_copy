import { ShopLayout } from "@/components/ShopLayout";
import { MyOrdersList } from "@/components/orders/MyOrdersList";
import { useAuth } from "@/lib/auth-store";
import { Link } from "react-router-dom";

export default function OrdersPage() {
  const { user } = useAuth();

  return (
    <ShopLayout>
      <div className="section-shell py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">My Orders</h1>
          {user ? (
            <MyOrdersList />
          ) : (
            <div className="surface-card flex flex-col items-center justify-center p-8 text-center sm:p-12">
              <h2 className="text-xl font-bold text-foreground">Sign in to view your orders</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                You must be logged in to view your order history and track current orders.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </ShopLayout>
  );
}
