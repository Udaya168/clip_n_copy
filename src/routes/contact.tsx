import { StoreSection } from "@/components/StoreSection";
import { ArrowLeft } from "lucide-react";


import { useAppBack } from "@/lib/useAppBack";

export default function ContactPage() {
  const goBack = useAppBack();

  return (
    <div className="pt-8">
      <div className="section-shell max-w-3xl">
        <button
          onClick={() => goBack("/")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground mb-6 cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Back to Home
        </button>
        <div>
          <h1 className="font-display text-3xl font-black sm:text-4xl">Contact Us</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get in touch with us for any queries or visit our physical store.
          </p>
        </div>
      </div>
      <StoreSection />
    </div>
  );
}
