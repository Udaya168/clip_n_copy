import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Tag } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { OFFERS, withTag } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Student Deals — Clip N Copy" },
      {
        name: "description",
        content:
          "Up to 30% off stationery, student deals, back-to-college bundles and office savings at Clip N Copy, Kundalahalli Bengaluru.",
      },
      { property: "og:title", content: "Offers & Student Deals — Clip N Copy" },
      {
        property: "og:description",
        content: "Save on notebooks, pens, books and office supplies this season.",
      },
    ],
  }),
  component: Offers,
});

const TONES = {
  primary: "hero-gradient text-primary-foreground",
  accent: "accent-gradient text-accent-foreground",
  ink: "bg-ink text-ink-foreground",
};

function Offers() {
  return (
    <div className="section-shell py-10">
      <header className="max-w-2xl">
        <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-primary uppercase">
          <Tag className="size-3.5" /> Offers
        </p>
        <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">
          Deals worth filling the bag for
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Seasonal savings across stationery, books and office supplies — in store and online.
        </p>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {OFFERS.map((o) => (
          <Link
            key={o.id}
            to="/shop"
            search={{ tag: o.tag }}
            className={cn(
              "card-lift flex min-h-40 flex-col justify-between rounded-3xl p-6 shadow-soft",
              TONES[o.tone],
            )}
          >
            <div>
              <p className="font-display text-2xl font-black">{o.title}</p>
              <p className="mt-2 text-sm opacity-85">{o.sub}</p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">
              Shop now <ArrowRight className="size-4" />
            </span>
          </Link>
        ))}
      </div>

      {OFFERS.map((o) => {
        const products = withTag(o.tag).slice(0, 8);
        if (!products.length) return null;
        return (
          <section key={o.id} className="mt-14">
            <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-2xl font-extrabold">{o.title}</h2>
                <p className="text-sm text-muted-foreground">{o.sub}</p>
              </div>
              <Link
                to="/shop"
                search={{ tag: o.tag }}
                className="shrink-0 text-sm font-bold text-primary"
              >
                View all
              </Link>
            </div>
            <div className="grid-products">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
