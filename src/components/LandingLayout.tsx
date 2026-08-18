import { type ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
