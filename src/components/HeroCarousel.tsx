import { Link } from "@tanstack/react-router";
import { ArrowRight, Star, Truck, Printer, BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import hero from "@/assets/hero.jpg";
import slideCollege from "@/assets/slide-college.jpg";
import slidePrinting from "@/assets/slide-printing.jpg";
import slideOffice from "@/assets/slide-office.jpg";
import { STORE } from "@/lib/data";
import { cn } from "@/lib/utils";

type Slide = {
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  to: string;
  search?: Record<string, string>;
  image: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Kundalahalli · ITPL Main Road",
    title: "Everything You Need. One Place.",
    sub: "Books, stationery, office supplies, printing and more.",
    cta: "Shop Now",
    to: "/shop",
    image: hero,
  },
  {
    eyebrow: "New semester",
    title: "Back to College Essentials",
    sub: "Everything students need for college.",
    cta: "Shop Now",
    to: "/shop",
    search: { category: "notebooks" },
    image: slideCollege,
  },
  {
    eyebrow: "Same-day service",
    title: "Print. Bind. Get It Done.",
    sub: "Professional printing and binding services.",
    cta: "Explore Services",
    to: "/services",
    image: slidePrinting,
  },
  {
    eyebrow: "For your desk",
    title: "Office Essentials",
    sub: "Everything you need for your workspace.",
    cta: "Shop Office Supplies",
    to: "/shop",
    search: { category: "office-supplies" },
    image: slideOffice,
  },
];

export function HeroCarousel() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[i]!;

  return (
    <section className="section-shell pt-6 md:pt-10">
      <div className="relative overflow-hidden rounded-3xl hero-gradient text-primary-foreground shadow-lift">
        <div className="grid items-stretch md:grid-cols-[1.05fr_0.95fr]">
          <div key={i} className="flex flex-col justify-center gap-5 p-6 sm:p-10 lg:p-14 rise-in">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground/12 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              <Star className="size-3.5 fill-accent text-accent" />
              {STORE.rating.toFixed(1)} ★ · {STORE.reviews} reviews · {slide.eyebrow}
            </span>
            <h1 className="max-w-xl font-display text-3xl leading-[1.08] font-black sm:text-4xl lg:text-5xl">
              {slide.title}
            </h1>
            <p className="max-w-md text-sm text-primary-foreground/80 sm:text-base">{slide.sub}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={slide.to}
                search={slide.search as never}
                className="inline-flex h-12 items-center gap-2 rounded-full accent-gradient px-6 text-sm font-bold text-accent-foreground shadow-glow transition-transform hover:-translate-y-0.5"
              >
                {slide.cta} <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-primary-foreground/30 px-6 text-sm font-semibold backdrop-blur transition-colors hover:bg-primary-foreground/10"
              >
                Explore Services
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-primary-foreground/75">
              <li className="flex items-center gap-1.5">
                <Truck className="size-4" /> Same-day delivery
              </li>
              <li className="flex items-center gap-1.5">
                <Printer className="size-4" /> Printing &amp; binding
              </li>
              <li className="flex items-center gap-1.5">
                <BadgeCheck className="size-4" /> Genuine brands
              </li>
            </ul>
            <div className="flex gap-2 pt-1">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.title}
                  onClick={() => setI(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    idx === i ? "w-8 bg-accent" : "w-3 bg-primary-foreground/35",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="relative order-first h-44 sm:h-56 md:order-none md:h-auto md:min-h-112">
            <img
              key={slide.image}
              src={slide.image}
              alt={slide.title}
              width={1600}
              height={1100}
              className="absolute inset-0 size-full object-cover md:rounded-l-[2.5rem]"
            />
            <div className="absolute inset-0 bg-linear-to-b from-primary/30 to-primary/70 md:bg-linear-to-r md:from-primary/50 md:to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
