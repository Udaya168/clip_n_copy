import { type ReactNode } from "react";
import { ShopHeader } from "@/components/ShopHeader";

export function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <ShopHeader />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
