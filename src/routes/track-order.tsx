import { ShopLayout } from "@/components/ShopLayout";
import { Truck } from "lucide-react";
import { Link } from "react-router-dom";

export default function TrackOrderPage() {
  return (
    <ShopLayout>
      <div className="section-shell py-12 md:py-20 flex flex-col items-center justify-center text-center">
        <div className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary mb-6">
          <Truck className="size-8" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Track Order</h1>
        <p className="mt-4 text-muted-foreground max-w-md">
          Order tracking will be available soon. For now, please check your My Orders page or contact support for an update.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            to="/orders"
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            My Orders
          </Link>
          <Link
            to="/contact"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </ShopLayout>
  );
}
