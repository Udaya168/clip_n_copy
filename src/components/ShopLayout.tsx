import { type ReactNode } from "react";
import { ShopHeader } from "@/components/ShopHeader";
import { StoreClosedNotice } from "@/components/StoreClosedNotice";

export function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <ShopHeader />
      <div className="section-shell mt-4">
        <StoreClosedNotice />
      </div>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
