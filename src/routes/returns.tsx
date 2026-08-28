import { ShopLayout } from "@/components/ShopLayout";
import { RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

export default function ReturnsPage() {
  return (
    <ShopLayout>
      <div className="section-shell py-12 md:py-20 flex flex-col items-center justify-center text-center">
        <div className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary mb-6">
          <RotateCcw className="size-8" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Returns & Refunds</h1>
        <p className="mt-4 text-muted-foreground max-w-md">
          If you need to return an item, please contact our support team. We're currently processing all return requests manually.
        </p>
        <div className="mt-8">
          <Link
            to="/contact"
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </ShopLayout>
  );
}
