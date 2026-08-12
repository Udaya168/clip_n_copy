import { createFileRoute } from "@tanstack/react-router";
import { StoreSection } from "@/components/StoreSection";
import { STORE } from "@/lib/data";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Visit Clip N Copy — Kundalahalli, Bengaluru" },
      {
        name: "description",
        content:
          "Clip N Copy, Shop No. 171, ITPL Main Rd, Kundalahalli Colony, Bengaluru 560037. Rated 4.0 by 763 customers. In-store shopping, delivery, printing, photocopy and binding.",
      },
      { property: "og:title", content: "Visit Clip N Copy — Kundalahalli, Bengaluru" },
      {
        property: "og:description",
        content: "Store address, timings, reviews and contact details for Clip N Copy.",
      },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  return (
    <div className="pt-8">
      <div className="section-shell max-w-3xl">
        <h1 className="font-display text-3xl font-black sm:text-4xl">Visit Clip N Copy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {STORE.tagline} — school &amp; office stationery, house keeping materials, project binding
          and printing on ITPL Main Road.
        </p>
      </div>
      <StoreSection />
    </div>
  );
}
