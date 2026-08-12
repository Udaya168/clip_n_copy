import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { STORE } from "@/lib/data";

const SHOP = [
  { label: "Stationery", to: "/shop", search: { category: "pens-pencils" } },
  { label: "Books", to: "/shop", search: { category: "books" } },
  { label: "School Supplies", to: "/shop", search: { category: "school-supplies" } },
  { label: "Office Supplies", to: "/shop", search: { category: "office-supplies" } },
  { label: "Art & Craft", to: "/shop", search: { category: "art-craft" } },
  { label: "Offers", to: "/offers" },
];

const SERVICES = ["Printing", "Photocopy", "Binding", "Project Printing", "Resume Printing"];

const SUPPORT = ["Contact Us", "Track Order", "Returns", "Help"];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-ink text-ink-foreground">
      <div className="section-shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Clip N Copy"
              className="h-14 w-auto object-contain bg-white/90 rounded-lg p-1.5 shadow-sm"
            />
          </div>
          <p className="text-sm text-ink-foreground/70">
            Total solutions in stationery &amp; xerox — school and office stationery, house keeping
            materials, project binding and printing since day one.
          </p>
          <div className="flex gap-2">
            {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="grid size-9 place-items-center rounded-full border border-ink-foreground/20 transition-colors hover:border-accent hover:text-accent"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold tracking-wide uppercase">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/70">
            {SHOP.map((s) => (
              <li key={s.label}>
                <Link to={s.to} search={s.search as never} className="hover:text-accent">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="font-display text-sm font-bold tracking-wide uppercase">Services</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/70">
              {SERVICES.map((s) => (
                <li key={s}>
                  <Link to="/services" className="hover:text-accent">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold tracking-wide uppercase">
              Customer Support
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/70">
              {SUPPORT.map((s) => (
                <li key={s}>
                  <Link to="/store" className="hover:text-accent">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold tracking-wide uppercase">Store</h3>
          <p className="mt-4 font-semibold">{STORE.name}</p>
          <p className="mt-2 flex gap-2 text-sm text-ink-foreground/70">
            <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
            {STORE.address}
          </p>
          <a
            href={`tel:${STORE.phoneRaw}`}
            className="mt-3 flex items-center gap-2 text-sm font-semibold hover:text-accent"
          >
            <Phone className="size-4 text-accent" /> {STORE.phone}
          </a>
          <p className="mt-3 text-sm text-ink-foreground/60">{STORE.hours}</p>
        </div>
      </div>

      <div className="border-t border-ink-foreground/10">
        <div className="section-shell flex flex-col gap-2 py-5 text-xs text-ink-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Clip N Copy, Kundalahalli Colony, Bengaluru. All rights reserved.</p>
          <p>Demo storefront · prices and stock are indicative</p>
        </div>
      </div>
    </footer>
  );
}
