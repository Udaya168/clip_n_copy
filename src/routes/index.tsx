import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { MapPin, Phone, MessageCircle, Heart, Minus, Plus, ChevronRight, ArrowRight, Check } from "lucide-react";
import { STORE, PRODUCTS, RAW_CATEGORIES } from "@/lib/data";
import { useShop } from "@/lib/shop-store";
import { LandingLayout } from "@/components/LandingLayout";
import { FaqSection } from "@/components/FaqSection";
import { ShopArchive } from "@/components/ShopArchive";
import { CollectionSwitcher } from "@/components/CollectionSwitcher";
import { ProductCard } from "@/components/ProductCard";
import { useScrollRestoration } from "@/lib/useScrollRestoration";

import heroImg from "@/assets/hero.webp";
import officeImg from "@/assets/slide-office.webp";
import printImg from "@/assets/slide-printing.webp";

export default function IndexPage() {
  const { addToCart, setQty, lines, wishlist, toggleWishlist } = useShop();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  useScrollRestoration(true);

  const bestSellers = useMemo(() => {
    let filtered = PRODUCTS.slice(0, 12);
    if (activeCategory !== "All") {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [activeCategory, searchQuery]);

  return (
    <LandingLayout>


      {/* 4. MAIN FEATURE AREA */}
      <section className="section-shell py-8 md:py-12">
        <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
          {/* Main Hero Card */}
          <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-lg relative isolate min-h-[460px] flex flex-col justify-center border border-border">
            {/* Background Image (Right Side) */}
            <div className="absolute inset-0 z-[-3]">
              <img 
                src={heroImg} 
                alt="Stationery flatlay"
                className="w-full h-full object-cover object-right"
              />
            </div>
            
            {/* Desktop Diagonal Mask */}
            <div 
              className="hidden sm:block absolute inset-0 z-[-2] bg-[#F7F9FC]" 
              style={{ clipPath: "polygon(0 0, 68% 0, 52% 100%, 0% 100%)" }}
            />
            {/* Mobile Gradient Overlay */}
            <div className="sm:hidden absolute inset-0 z-[-2] bg-gradient-to-r from-[#F7F9FC] via-[#F7F9FC]/95 to-[#F7F9FC]/40" />

            <div className="max-w-xl p-8 sm:p-12 z-10">
              <p className="text-[11px] sm:text-[13px] font-bold uppercase tracking-[0.1em] text-primary mb-4 flex items-center gap-3">
                <span className="w-10 h-[2px] bg-primary"></span>
                YOUR NEIGHBOURHOOD STATIONERY STORE
              </p>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[4.5rem] font-extrabold leading-[1.05] tracking-tight text-ink">
                Everything you need, all in one place.
              </h1>
              
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground font-medium max-w-[480px] leading-relaxed">
                Books, stationery, office supplies, printing and more — delivered fast across the ITPL area.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={() => scrollTo("shop")}
                  className="rounded-lg bg-primary px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] cursor-pointer inline-flex items-center gap-2"
                >
                  Shop now <ArrowRight className="size-4" />
                </button>
                <button
                  onClick={() => scrollTo("printing")}
                  className="rounded-lg bg-secondary px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-bold text-secondary-foreground transition-all hover:bg-secondary/90 hover:scale-[1.02] cursor-pointer"
                >
                  Explore printing
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-semibold text-ink">
                <span className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> Genuine brands
                </span>
                <span className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> Same-day delivery
                </span>
              </div>
            </div>
          </div>

          {/* Supporting Image 1 */}
          <Link to="/shop" className="group overflow-hidden rounded-lg bg-muted relative isolate aspect-video md:aspect-auto min-h-[180px] block cursor-pointer">
            <img src={officeImg} alt="Premium office supplies" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
              <h3 className="font-display text-white font-bold text-xl">Premium office supplies</h3>
            </div>
          </Link>

          {/* Supporting Image 2 */}
          <Link to="/services" className="group overflow-hidden rounded-lg bg-muted relative isolate aspect-video md:aspect-auto min-h-[180px] block cursor-pointer">
            <img src={printImg} alt="Professional printing" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
              <h3 className="font-display text-white font-bold text-xl">Professional printing</h3>
            </div>
          </Link>
        </div>
      </section>

      {/* 4.5 SHOP ARCHIVE */}
      <ShopArchive products={PRODUCTS} />

      {/* 4.7 COLLECTION SWITCHER */}
      <CollectionSwitcher />

      {/* 5. BEST SELLERS / SHOP GRID */}
      <section id="shop" className="section-shell py-8 md:py-12">
        <div className="flex items-end justify-between mb-8">
          <div className="flex flex-col">
            <p className="text-sm font-bold uppercase tracking-wider text-primary">From our real shelves</p>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mt-1">Best sellers</h2>
          </div>
          <Link to="/shop" className="text-primary font-bold hover:underline flex items-center gap-1">
            View all products <ChevronRight className="size-4" />
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6 max-w-md relative">
          <input 
            type="text" 
            placeholder="Search products or brands" 
            className="input-base pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {bestSellers.length === 0 ? (
          <div className="text-center py-12 rounded-lg border border-dashed border-border bg-background">
            <p className="font-display font-bold text-lg">No products found</p>
            <button 
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
              className="mt-2 text-primary text-sm font-semibold hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid-editorial">
            {bestSellers.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* 6. PRINTING SERVICES */}
      <section id="printing" className="bg-secondary text-secondary-foreground py-16 md:py-24 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full opacity-20 pointer-events-none mix-blend-overlay">
          <img src="/shelves.webp" alt="Printing Background" className="w-full h-full object-cover" style={{ maskImage: 'linear-gradient(to right, transparent, black)', WebkitMaskImage: 'linear-gradient(to right, transparent, black)' }} />
        </div>
        <div className="section-shell relative z-10">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold leading-tight">
              Print, bind and finish — ready in minutes.
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 text-base sm:text-lg font-medium text-secondary-foreground/80">
              <span className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-primary shrink-0" /> Document printing
              </span>
              <span className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-primary shrink-0" /> Spiral binding
              </span>
              <span className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-primary shrink-0" /> Lamination
              </span>
              <span className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-primary shrink-0" /> Custom brochures
              </span>
              <span className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-primary shrink-0" /> Banners & posters
              </span>
              <span className="flex items-center gap-3">
                <div className="size-1.5 rounded-full bg-primary shrink-0" /> ID cards & magazines
              </span>
            </div>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-bold text-secondary transition-all hover:bg-white/90 hover:scale-[1.02]"
              >
                Printing and services
              </Link>
              <a
                href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent("Hi Clip N Copy, I'd like to get a quote for some printing services.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02]"
              >
                <MessageCircle className="size-5" /> Get a print quote
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. STORE VISIT SECTION */}
      <section className="section-shell py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="flex flex-col">
            <h2 className="font-display text-3xl font-extrabold text-foreground">{STORE.name}</h2>
            <div className="mt-6 space-y-5 text-foreground/80">
              <p className="flex items-start gap-3">
                <MapPin className="size-5 mt-0.5 shrink-0 text-primary" />
                <span>{STORE.address}</span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="size-5 shrink-0 text-primary" />
                <span>{STORE.phone}</span>
              </p>
              <p className="flex items-center gap-3 font-medium">
                <span className="size-5 flex items-center justify-center font-bold text-primary">🕒</span>
                <span>Opening hours: {STORE.hours}</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="size-5 flex items-center justify-center font-bold text-[#F59E0B]">★</span>
                <span className="font-semibold text-foreground">Google rating: {STORE.rating.toFixed(1)} from {STORE.reviews} reviews</span>
              </p>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`tel:${STORE.phoneRaw}`}
                className="inline-flex items-center justify-center rounded-lg bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition-all hover:bg-secondary/90 hover:scale-[1.02]"
              >
                Call store
              </a>
              <a
                href={`https://wa.me/${STORE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#20bd5a] hover:scale-[1.02]"
              >
                WhatsApp
              </a>
              <a
                href="https://maps.google.com/?q=Clip+N+Copy+Kundalahalli"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-secondary/5 hover:scale-[1.02]"
              >
                Google Maps directions
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[4/5] rounded-lg overflow-hidden bg-muted relative isolate">
              <img src="/storefront.webp" alt="Store Front" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="aspect-[4/5] rounded-lg overflow-hidden bg-muted mt-8 relative isolate">
              <img src="/shelves.webp" alt="Shop Interior" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <FaqSection />
    </LandingLayout>
  );
}
