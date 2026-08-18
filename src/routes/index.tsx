import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, FileText, BookOpen, Printer, Layers, Box, ShieldCheck, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard, ProductSkeleton } from "@/components/ProductCard";
import { SectionHead } from "@/components/SectionHead";
import { StoreSection } from "@/components/StoreSection";
import { UploadPrintModal } from "@/components/UploadPrintModal";
import { RAW_CATEGORIES } from "@/lib/data";
import { useShop } from "@/lib/shop-store";
import { useSupabaseProducts } from "@/lib/supabase-products";
import { useScrollRestoration } from "@/lib/useScrollRestoration";
import { LandingLayout } from "@/components/LandingLayout";
import { ProductCarousel, ProductCarouselItem } from "@/components/ProductCarousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clip N Copy — Stationery, Office Supplies & Printing Services" },
      {
        name: "description",
        content:
          "Shop notebooks, pens, markers, and office supplies online. High-quality print and photocopy services available in-store at ITPL Main Road, Bengaluru.",
      },
      { property: "og:title", content: "Stationery & Printing Services — Clip N Copy" },
      {
        property: "og:description",
        content:
          "From school supplies to corporate printing. Best prices on top brands in Kundalahalli.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { addToCart } = useShop();
  const [printOpen, setPrintOpen] = useState(false);
  const { data: products = [], isLoading, isError, error, refetch } = useSupabaseProducts();

  useScrollRestoration(!isLoading);

  const categoriesWithCounts = useMemo(() => {
    return RAW_CATEGORIES.map((c) => ({
      ...c,
      count: products.filter((p) => p.category === c.slug).length,
    }));
  }, [products]);

  const best = products.slice(0, 12);

  return (
    <LandingLayout>
      <HeroSection />

      {/* Categories - Compact Premium Cards */}
      <section className="section-shell py-12">
        <SectionHead
          title="Shop by Category"
          ctaLabel="View All →"
          to="/shop"
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {categoriesWithCounts.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
            >
              <Link
                to="/shop"
                search={{ category: c.slug }}
                className="group relative flex items-center gap-4 overflow-hidden rounded-[1.25rem] bg-white p-3 shadow-[0_4px_16px_-4px_rgba(11,92,255,0.08)] ring-1 ring-[#EAF2FF] transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_12px_28px_-6px_rgba(11,92,255,0.15)] hover:ring-[#DCEBFF]"
              >
                <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-[#F4F8FF] transition-transform duration-500 group-hover:scale-105 group-hover:bg-[#EAF2FF]">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="size-8 object-contain mix-blend-multiply transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:-translate-y-1"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center min-w-0 pr-2">
                  <h3 className="truncate font-bold text-[#0B2455] transition-colors group-hover:text-[#075BFF] text-sm sm:text-[15px]">
                    {c.name}
                  </h3>
                  <p className="mt-0.5 truncate text-[12px] font-medium text-[#075BFF]/70">{c.count} Products</p>
                </div>
                <ChevronRight className="absolute right-4 size-4 text-[#0B2455]/20 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-[#075BFF]" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="section-shell py-12">
        <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_4px_24px_-8px_rgba(11,92,255,0.08)] border border-[#EAF2FF] sm:p-10 lg:p-12">
          <SectionHead
            title="Best Sellers"
            ctaLabel="View All →"
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
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#0B2455] px-5 text-sm font-semibold text-white"
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
            <ProductCarousel>
              {best.map((p) => (
                <ProductCarouselItem key={p.id}>
                  <ProductCard product={p} />
                </ProductCarouselItem>
              ))}
            </ProductCarousel>
          )}
        </div>
      </section>

      {/* Printing & Services */}
      <section className="section-shell py-12">
        <div className="rounded-[2.5rem] bg-[#F4F8FF] p-8 sm:p-12 shadow-[0_4px_24px_-8px_rgba(11,92,255,0.08)] border border-[#EAF2FF] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#075BFF]/5 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 mb-10">
            <h2 className="font-display text-3xl font-black text-[#0B2455] sm:text-4xl">Printing & Services</h2>
            <p className="mt-3 max-w-2xl text-[#0B2455]/70 text-lg font-medium">High quality printing, binding & finishing — fast, reliable & professional.</p>
          </div>
          
          <div className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {[
              { name: "Printouts", icon: <Printer className="size-6" />, desc: "B&W and Color" },
              { name: "Spiral Binding", icon: <BookOpen className="size-6" />, desc: "Durable binding" },
              { name: "Lamination", icon: <Layers className="size-6" />, desc: "Glossy & Matte" },
              { name: "Visiting Cards", icon: <Box className="size-6" />, desc: "Premium quality" },
              { name: "Project Work", icon: <FileText className="size-6" />, desc: "Reports & files" }
            ].map((service) => (
              <button
                key={service.name}
                onClick={() => setPrintOpen(true)}
                className="group flex flex-col items-center justify-center gap-4 rounded-[1.25rem] bg-white p-6 shadow-[0_4px_16px_-4px_rgba(11,92,255,0.08)] border border-[#EAF2FF] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-6px_rgba(11,92,255,0.15)] hover:border-[#DCEBFF] text-center cursor-pointer"
              >
                <div className="grid size-14 place-items-center rounded-2xl bg-[#075BFF]/10 text-[#075BFF] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#075BFF] group-hover:text-white group-hover:shadow-[0_8px_16px_-4px_rgba(7,91,255,0.4)]">
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#0B2455]">{service.name}</h3>
                  <p className="mt-1 text-xs font-medium text-[#0B2455]/60">{service.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <StoreSection />

      {/* Benefits Strip */}
      <section className="section-shell py-10 pb-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8">
          {[
            { title: "Wide Range", desc: "1000+ products", icon: <Box className="size-6" /> },
            { title: "Fast Delivery", desc: "Within ITPL area", icon: <Zap className="size-6" /> },
            { title: "Best Prices", desc: "Unbeatable deals", icon: <ShieldCheck className="size-6" /> },
            { title: "Print & Bind", desc: "Ready in minutes", icon: <Printer className="size-6" /> }
          ].map((benefit) => (
            <div key={benefit.title} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left p-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
                {benefit.icon}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{benefit.title}</h4>
                <p className="mt-1 text-sm text-slate-500">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {printOpen && <UploadPrintModal onClose={() => setPrintOpen(false)} />}
    </LandingLayout>
  );
}
