import { Check, MapPin, MessageCircle, Navigation, Phone, Star } from "lucide-react";
import storefront from "@/assets/storefront.png.asset.json";
import shelves from "@/assets/shelves.png.asset.json";
import { REVIEWS, STORE } from "@/lib/data";

export function StoreSection() {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${STORE.name} ${STORE.address}`,
  )}`;

  return (
    <section className="section-shell py-14">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-card overflow-hidden">
          <img
            src={storefront.url}
            alt="Clip N Copy storefront on ITPL Main Road, Kundalahalli"
            loading="lazy"
            className="h-64 w-full object-cover sm:h-80"
          />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-6 sm:flex sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-extrabold">Visit Clip N Copy</h2>
              <p className="mt-2 flex gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                {STORE.address}
              </p>
              <a
                href={`tel:${STORE.phoneRaw}`}
                className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary"
              >
                <Phone className="size-4" /> {STORE.phone}
              </a>
              <p className="mt-2 text-sm text-muted-foreground">{STORE.hours}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-success/12 px-3 py-1.5 text-sm font-bold text-success">
              {STORE.rating.toFixed(1)} <Star className="size-3.5 fill-current" />
            </span>
          </div>
          <div className="border-t border-border px-6 pb-6">
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {STORE.services.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm font-medium">
                  <Check className="size-4 text-success" /> {s}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                <Navigation className="size-4" /> Get Directions
              </a>
              <a
                href={`tel:${STORE.phoneRaw}`}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold"
              >
                <Phone className="size-4" /> Call Store
              </a>
              <a
                href={`https://wa.me/${STORE.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-success"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card relative overflow-hidden">
            <img
              src={shelves.url}
              alt="Stationery shelves stocked inside Clip N Copy"
              loading="lazy"
              className="h-52 w-full object-cover sm:h-60"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink/80 to-transparent" />
            <div className="absolute bottom-0 p-5 text-ink-foreground">
              <p className="font-display text-lg font-extrabold">Aisles stocked floor to ceiling</p>
              <p className="text-sm text-ink-foreground/80">
                Thousands of SKUs across stationery, files, art and exam supplies.
              </p>
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="font-display text-4xl font-black">{STORE.rating.toFixed(1)} ★</p>
                <p className="text-sm text-muted-foreground">{STORE.reviews} Google reviews</p>
              </div>
              <div className="min-w-40 flex-1 space-y-1.5">
                {[68, 20, 7, 3, 2].map((w, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-3 text-xs text-muted-foreground">{5 - idx}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <span className="block h-full accent-gradient" style={{ width: `${w}%` }} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <ul className="mt-5 space-y-4">
              {REVIEWS.map((r) => (
                <li key={r.name} className="border-t border-border pt-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                        {r.name.charAt(0)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                      </span>
                    </div>
                    <span className="flex shrink-0 items-center gap-0.5 text-accent">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-current" />
                      ))}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">“{r.text}”</p>
                  {r.verified && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-semibold text-success">
                      <Check className="size-3" /> Verified purchase
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="surface-card mt-6 overflow-hidden">
        <div className="relative h-56 bg-secondary sm:h-64">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(0deg, transparent 24%, oklch(0.9 0.02 260) 25%, transparent 26%), linear-gradient(90deg, transparent 24%, oklch(0.9 0.02 260) 25%, transparent 26%)",
              backgroundSize: "56px 56px",
            }}
          />
          <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow">
              <MapPin className="size-6" />
            </span>
            <p className="font-display font-bold">Clip N Copy · Kundalahalli Colony</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              ITPL Main Road, opposite Kundalahalli Gate — 2 min from Brookefield
            </p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 text-sm font-semibold text-primary underline underline-offset-4"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
