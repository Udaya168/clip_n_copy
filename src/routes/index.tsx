import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Printer, Sparkles, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductCard, ProductSkeleton } from "@/components/ProductCard";
import { SectionHead } from "@/components/SectionHead";
import { StoreSection } from "@/components/StoreSection";
import { UploadPrintModal } from "@/components/UploadPrintModal";
import {
  BOOK_CATEGORIES,
  CATEGORIES,
  RAW_CATEGORIES,
  OFFICE_ESSENTIALS,
  PRINT_SERVICES,
  PRODUCTS,
  STUDENT_ESSENTIALS,
  inCategory,
  withTag,
} from "@/lib/data";
import { inr, useShop } from "@/lib/shop-store";
import slideCollege from "@/assets/slide-college.webp";
import slideOffice from "@/assets/slide-office.webp";

import { useSupabaseProducts } from "@/lib/supabase-products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clip N Copy — Stationery, Books & Printing Store in Kundalahalli" },
      {
        name: "description",
        content:
          "Buy notebooks, pens, books, school and office supplies online from Clip N Copy, ITPL Main Road Bengaluru. Printing, photocopy and binding with fast delivery.",
      },
      { property: "og:title", content: "Clip N Copy — Everything You Need. One Place." },
      {
        property: "og:description",
        content:
          "Stationery, books, office supplies, printing and binding from Clip N Copy, Kundalahalli Colony, Bengaluru.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { addToCart } = useShop();
  const [printOpen, setPrintOpen] = useState(false);
  const { data: products = [], isLoading, isError, error, refetch } = useSupabaseProducts();

  const categoriesWithCounts = useMemo(() => {
    return RAW_CATEGORIES.map((c) => ({
      ...c,
      count: products.filter((p) => p.category === c.slug).length,
    }));
  }, [products]);

  const flash = products.filter((p) => p.tags?.includes("flash"));
  const flashItems = flash.length > 0 ? flash : products.slice(0, 5);
  const best = products.slice(0, 12);
  const student =
    products.filter((p) => p.tags?.includes("student")).length > 0
      ? products.filter((p) => p.tags?.includes("student")).slice(0, 8)
      : products.slice(0, 8);
  const books = products.filter((p) => p.category === "books").slice(0, 8);
  const office = products.filter((p) => p.category === "office-supplies").slice(0, 8);

  return (
    <>
      <HeroCarousel />

      {/* Categories */}
      <section className="section-shell py-12">
        <SectionHead
          eyebrow="Shop by category"
          title="Browse the whole shop"
          sub="Ten aisles, thousands of products — tap a category to jump straight in."
          ctaLabel="All products"
          to="/shop"
        />
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 no-scrollbar md:mx-0 md:grid md:grid-cols-4 md:px-0">
          {categoriesWithCounts.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className="group surface-card card-lift w-40 shrink-0 overflow-hidden md:w-auto"
            >
              <div className="aspect-square overflow-hidden bg-secondary">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.count} items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash deals */}
      <section className="section-shell py-6">
        <div className="overflow-hidden rounded-3xl bg-ink p-6 text-ink-foreground sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase">
                <Sparkles className="size-3.5" /> Flash deals
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
                Today&apos;s best prices
              </h2>
            </div>
            <span className="flex w-fit shrink-0 items-center gap-2 rounded-full bg-ink-foreground/10 px-3 py-2 text-xs font-semibold">
              <Clock className="size-4 text-accent" /> Ends at 9:30 PM
            </span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-2xl bg-secondary" />
              ))
            ) : isError ? (
              <div className="col-span-full py-6 text-center text-sm text-accent">
                Failed to load deals from Supabase.
              </div>
            ) : flashItems.length === 0 ? (
              <div className="col-span-full py-6 text-center text-sm text-ink-foreground/70">
                No deal products available.
              </div>
            ) : (
              flashItems.map((p) => (
                <div key={p.id} className="surface-card card-lift overflow-hidden text-foreground">
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="block aspect-square overflow-hidden bg-secondary"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-108"
                    />
                  </Link>
                  <div className="space-y-1.5 p-3">
                    <p className="line-clamp-2 text-xs font-semibold">{p.name}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Star className="size-3 fill-accent text-accent" /> {p.rating.toFixed(1)}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-base font-bold">{inr(p.price)}</span>
                    </div>
                    <button
                      onClick={() => addToCart(p.id)}
                      className="h-9 w-full rounded-full bg-primary text-xs font-bold text-primary-foreground transition-transform active:scale-97"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="section-shell py-12">
        <SectionHead
          eyebrow="Loved by customers"
          title="Best Sellers"
          sub="The products our regulars keep coming back for."
          ctaLabel="View All Products"
          to="/shop"
        />
        {isLoading ? (
          <div className="grid-products">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="surface-card space-y-4 p-8 text-center border border-destructive/20">
            <p className="font-display text-lg font-bold text-destructive">
              Failed to load products from Supabase
            </p>
            <p className="text-sm text-muted-foreground">{error?.message}</p>
            <button
              onClick={() => refetch()}
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="surface-card p-8 text-center">
            <p className="font-display text-lg font-bold">No products found</p>
            <p className="text-sm text-muted-foreground">
              The Supabase products table is currently empty.
            </p>
          </div>
        ) : (
          <div className="grid-products">
            {best.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Student essentials */}
      <section className="section-shell py-6">
        <SectionHead
          eyebrow="For students"
          title="Student Essentials"
          sub="Everything for lectures, labs, submissions and exams."
          ctaLabel="Shop student picks"
          to="/shop"
          search={{ tag: "student" }}
        />
        <div className="flex flex-wrap gap-2">
          {STUDENT_ESSENTIALS.map((s) => (
            <Link
              key={s}
              to="/shop"
              search={{ q: s }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-soft transition-colors hover:border-primary hover:text-primary"
            >
              {s}
            </Link>
          ))}
        </div>
        <div className="mt-6 grid-products">
          {student.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="relative mt-8 overflow-hidden rounded-3xl">
          <img
            src={slideCollege}
            alt="College notebooks and pens"
            loading="lazy"
            width={1400}
            height={900}
            className="h-56 w-full object-cover sm:h-64"
          />
          <div className="absolute inset-0 bg-linear-to-r from-ink/85 via-ink/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6 text-ink-foreground sm:p-10">
            <h3 className="max-w-md font-display text-2xl font-black sm:text-3xl">
              Your College Essentials, Sorted.
            </h3>
            <Link
              to="/shop"
              search={{ tag: "student" }}
              className="inline-flex h-11 w-fit items-center gap-2 rounded-full accent-gradient px-5 text-sm font-bold text-accent-foreground"
            >
              Shop Student Essentials <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Books */}
      <section className="section-shell py-12">
        <SectionHead
          eyebrow="Bookshelf"
          title="Books for every syllabus"
          sub="Engineering, programming, school, competitive exams and good fiction."
          ctaLabel="All books"
          to="/shop"
          search={{ category: "books" }}
        />
        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 no-scrollbar md:mx-0 md:flex-wrap md:px-0">
          {BOOK_CATEGORIES.map((b) => (
            <Link
              key={b}
              to="/shop"
              search={{ category: "books", q: b }}
              className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              {b}
            </Link>
          ))}
        </div>
        <div className="grid-products">
          {books.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Office */}
      <section className="section-shell py-6">
        <SectionHead
          eyebrow="For work"
          title="Office Essentials"
          sub="Paper, files, markers and desk supplies — bulk friendly."
          ctaLabel="Shop office"
          to="/shop"
          search={{ category: "office-supplies" }}
        />
        <div className="mb-6 flex flex-wrap gap-2">
          {OFFICE_ESSENTIALS.map((s) => (
            <Link
              key={s}
              to="/shop"
              search={{ q: s }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              {s}
            </Link>
          ))}
        </div>
        <div className="grid-products">
          {office.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="relative mt-8 overflow-hidden rounded-3xl">
          <img
            src={slideOffice}
            alt="Office desk supplies"
            loading="lazy"
            width={1400}
            height={900}
            className="h-56 w-full object-cover sm:h-64"
          />
          <div className="absolute inset-0 bg-linear-to-r from-primary/90 via-primary/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6 text-primary-foreground sm:p-10">
            <h3 className="max-w-md font-display text-2xl font-black sm:text-3xl">
              Everything Your Workspace Needs.
            </h3>
            <Link
              to="/shop"
              search={{ category: "office-supplies" }}
              className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-card px-5 text-sm font-bold text-primary"
            >
              Shop Office Supplies <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Printing */}
      <section className="section-shell py-12">
        <SectionHead
          eyebrow="In-store services"
          title="Print. Bind. Done."
          sub="Walk in with a file, walk out with a finished document."
          ctaLabel="All services"
          to="/services"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINT_SERVICES.map((s) => (
            <div key={s.name} className="surface-card card-lift p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <Printer className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{s.name}</h3>
              <p className="text-sm font-semibold text-primary">{s.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setPrintOpen(true)}
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
        >
          Upload &amp; Print <ArrowRight className="size-4" />
        </button>
      </section>

      <StoreSection />

      <section className="section-shell pb-6">
        <div className="surface-card grid gap-4 p-6 text-center sm:grid-cols-3">
          <Stat value={`${PRODUCTS.length}+`} label="Products in catalog" />
          <Stat value="763" label="Google reviews" />
          <Stat value="15 min" label="Average print turnaround" />
        </div>
      </section>

      {printOpen && <UploadPrintModal onClose={() => setPrintOpen(false)} />}
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-black text-primary">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
