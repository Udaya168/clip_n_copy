import { ChevronRight, Printer, Zap, Box, ShieldCheck, Book, Briefcase, Palette, FileText, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard, ProductSkeleton } from "@/components/ProductCard";
import { SectionHead } from "@/components/SectionHead";
import { StoreSection } from "@/components/StoreSection";
import { openPrintModal } from "@/lib/print-modal";
import { RAW_CATEGORIES, PRINT_SERVICES } from "@/lib/data";
import { useShop } from "@/lib/shop-store";
import { useSupabaseProducts } from "@/lib/supabase-products";
import { useScrollRestoration } from "@/lib/useScrollRestoration";
import { LandingLayout } from "@/components/LandingLayout";
import { ProductCarousel, ProductCarouselItem } from "@/components/ProductCarousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";


function getServiceIcon(name: string) {
  switch (name) {
    case "Customization Printing": return <Sparkles className="size-7" />;
    case "Printing":
    default:
      return <Printer className="size-7" />;
  }
}

export default function IndexPage() {
  const { addToCart } = useShop();
  const { data: products = [], isLoading, isError, error, refetch } = useSupabaseProducts();

  const handleOrder = (serviceName: string | null = null) => {
    openPrintModal(serviceName);
  };

  useScrollRestoration(!isLoading);

  const categoriesWithCounts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const categoryMap = new Map<string, { slug: string; name: string; image: string; count: number }>();
    
    products.forEach((p) => {
      if (!p.category) return;
      const slug = p.category;
      if (!categoryMap.has(slug)) {
        const raw = RAW_CATEGORIES.find(c => c.slug === slug);
        categoryMap.set(slug, {
          slug,
          name: raw ? raw.name : slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          image: raw ? raw.image : (RAW_CATEGORIES[0]?.image || ""),
          count: 0
        });
      }
      categoryMap.get(slug)!.count++;
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  }, [products]);

  const best = products.slice(0, 12);

  return (
    <LandingLayout>
      <HeroSection />

      {/* Categories - Compact Premium Cards */}
      <section className="section-shell py-6 md:py-8">
        <SectionHead
          title="Shop by Category"
          ctaLabel="View All →"
          to="/shop"
        />
        <div className="group/carousel relative -mx-4 sm:mx-0">
          <Carousel
            opts={{
              align: "start",
              loop: true
            }}
            className="w-full"
          >
            <CarouselContent className="px-4 sm:px-0 -ml-4">
              {categoriesWithCounts.map((c, i) => (
                <CarouselItem key={c.slug} className="pl-4 basis-[80%] sm:basis-[45%] md:basis-[33.33%] lg:basis-[25%]">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                  >
                    <Link to={`/shop?category=${c.slug }`}
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
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 hidden md:flex opacity-0 group-hover/carousel:opacity-100" />
            <CarouselNext className="-right-4 hidden md:flex opacity-0 group-hover/carousel:opacity-100" />
          </Carousel>
        </div>
      </section>

      {/* Best sellers */}
      <section className="section-shell py-6 md:py-8">
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
      <section className="section-shell py-6 md:py-8">
        <div className="rounded-[2.5rem] bg-[#F4F8FF] p-8 sm:p-12 shadow-[0_4px_24px_-8px_rgba(11,92,255,0.08)] border border-[#EAF2FF] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#075BFF]/5 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 mb-10">
            <h2 className="font-display text-3xl font-black text-[#0B2455] sm:text-4xl">Printing & Services</h2>
            <p className="mt-3 max-w-2xl text-[#0B2455]/70 text-lg font-medium">High quality printing, binding & finishing — fast, reliable & professional.</p>
          </div>
          
          <div className="relative z-10 grid gap-6 grid-cols-1 sm:grid-cols-2 max-w-3xl">
            {PRINT_SERVICES.map((service) => (
              <button
                key={service.name}
                onClick={() => handleOrder(service.name)}
                className="group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 rounded-[1.5rem] bg-white p-6 shadow-[0_4px_20px_-4px_rgba(11,92,255,0.08)] border border-[#EAF2FF] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-6px_rgba(11,92,255,0.16)] hover:border-[#DCEBFF] cursor-pointer w-full"
              >
                <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#075BFF]/10 text-[#075BFF] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#075BFF] group-hover:text-white group-hover:shadow-[0_8px_20px_-4px_rgba(7,91,255,0.4)]">
                  {getServiceIcon(service.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-xl font-bold text-[#0B2455]">{service.name}</h3>
                  </div>
                  <p className="mt-1 text-sm font-medium text-[#0B2455]/70 leading-relaxed">{service.note}</p>
                  <p className="mt-3 text-xs font-bold text-[#075BFF] group-hover:underline inline-flex items-center gap-1">
                    {service.name === "Printing" ? "Order now →" : "Customize your requirements →"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <StoreSection />

      {/* Benefits Strip */}
      <section className="section-shell py-6 pb-10 md:py-8 md:pb-12">
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
    </LandingLayout>
  );
}
