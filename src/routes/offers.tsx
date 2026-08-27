import React from "react";
import { ShopLayout } from "@/components/ShopLayout";

export default function OffersPage() {
  return (
    <ShopLayout>
      <div className="section-shell py-8">
        <h1 className="font-display text-3xl font-black">Special Offers</h1>
        <p className="mt-4 text-muted-foreground">Check back later for exclusive deals!</p>
      </div>
    </ShopLayout>
  );
}
