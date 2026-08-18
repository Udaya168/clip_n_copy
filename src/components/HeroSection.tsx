import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Clock, Printer, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import heroImage from "@/assets/hero.webp";
import slideOffice from "@/assets/slide-office.webp";
import slidePrinting from "@/assets/slide-printing.webp";
import slideCollege from "@/assets/slide-college.webp";

const SLIDES = [
  {
    id: "main",
    title: "Everything you need,\nall in one place.",
    description: "Books, stationery, office supplies, printing & more delivered fast.",
    image: heroImage,
    cta: "Shop Now",
    ctaLink: "/shop",
    showSecondary: true,
    showBadges: true,
  },
  {
    id: "office",
    title: "Premium Office\nSupplies.",
    description: "Upgrade your workspace with our curated selection of office essentials.",
    image: slideOffice,
    cta: "Explore Office",
    ctaLink: "/shop?category=office-supplies",
    showSecondary: false,
    showBadges: false,
  },
  {
    id: "printing",
    title: "Professional\nPrinting Services.",
    description: "High-quality document printing, binding, and lamination services.",
    image: slidePrinting,
    cta: "Explore Services",
    ctaLink: "/services",
    showSecondary: false,
    showBadges: false,
  },
  {
    id: "college",
    title: "Back to School\nEssentials.",
    description: "Get ready for the new semester with our top-rated school supplies.",
    image: slideCollege,
    cta: "Shop School",
    ctaLink: "/shop?category=school-supplies",
    showSecondary: false,
    showBadges: false,
  },
];

const FADE_DURATION = 400; // ms for fade-out and fade-in each
const AUTOPLAY_DELAY = 5000; // ms between slides

const BADGES = [
  { icon: "clock", text: "Same-day Delivery" },
  { icon: "printer", text: "Printing & Binding" },
  { icon: "badge", text: "Genuine Brands" },
  { icon: "shield", text: "Secure Payment" },
];

function BadgeIcon({ icon }: { icon: string }) {
  const cls = "size-5 text-[#FF8C00]";
  switch (icon) {
    case "clock": return <Clock className={cls} />;
    case "printer": return <Printer className={cls} />;
    case "badge": return <BadgeCheck className={cls} />;
    case "shield": return <ShieldCheck className={cls} />;
    default: return null;
  }
}

export function HeroSection() {
  // activeIndex = what is currently rendered in the DOM
  const [activeIndex, setActiveIndex] = useState(0);
  // visible = controls CSS opacity (true = opacity-100, false = opacity-0)
  const [visible, setVisible] = useState(true);
  // isTransitioning = lock to prevent concurrent transitions
  const isTransitioning = useRef(false);
  // pendingIndex = if a navigation request comes during a transition, store it
  const pendingIndex = useRef<number | null>(null);
  const autoplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slide = SLIDES[activeIndex];

  // Core transition: fade out → swap → fade in
  const goToSlide = useCallback((nextIndex: number) => {
    // Same slide, no-op
    if (nextIndex === activeIndex && !isTransitioning.current) return;

    // If already transitioning, store the latest request
    if (isTransitioning.current) {
      pendingIndex.current = nextIndex;
      return;
    }

    isTransitioning.current = true;
    pendingIndex.current = null;

    // STEP 1: Fade out current slide
    setVisible(false);

    // STEP 2: After fade-out completes, swap the content
    transitionTimer.current = setTimeout(() => {
      setActiveIndex(nextIndex);

      // STEP 3: Small frame delay to let React render new content, then fade in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);

          // STEP 4: After fade-in completes, unlock transitions
          transitionTimer.current = setTimeout(() => {
            isTransitioning.current = false;

            // If a pending request came in during the transition, execute it now
            if (pendingIndex.current !== null && pendingIndex.current !== nextIndex) {
              const pending = pendingIndex.current;
              pendingIndex.current = null;
              goToSlide(pending);
            }
          }, FADE_DURATION);
        });
      });
    }, FADE_DURATION);
  }, [activeIndex]);

  const goNext = useCallback(() => {
    const next = (activeIndex + 1) % SLIDES.length;
    goToSlide(next);
  }, [activeIndex, goToSlide]);

  const goPrev = useCallback(() => {
    const prev = (activeIndex - 1 + SLIDES.length) % SLIDES.length;
    goToSlide(prev);
  }, [activeIndex, goToSlide]);

  // Autoplay: restart timer whenever activeIndex changes and transition finishes
  useEffect(() => {
    // Clear any existing timer
    if (autoplayTimer.current) {
      clearTimeout(autoplayTimer.current);
    }

    autoplayTimer.current = setTimeout(() => {
      const next = (activeIndex + 1) % SLIDES.length;
      goToSlide(next);
    }, AUTOPLAY_DELAY);

    return () => {
      if (autoplayTimer.current) {
        clearTimeout(autoplayTimer.current);
      }
    };
  }, [activeIndex, goToSlide]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, []);

  return (
    <section className="section-shell pt-6 md:pt-10 pb-6">
      <div className="relative h-[42rem] md:h-[36rem] lg:h-[40rem] overflow-hidden rounded-[2.5rem] bg-[#0B2455] text-white shadow-xl group isolate">

        {/* === SINGLE SLIDE — only one is ever in the DOM === */}
        <div
          className="absolute inset-0 size-full flex flex-col md:flex-row"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_DURATION}ms ease-in-out`,
          }}
        >
          {/* Left Content */}
          <div className="flex flex-col justify-center gap-8 p-8 sm:p-12 lg:p-16 w-full md:w-[60%] z-10 h-full">
            <div className="space-y-4">
              <h1 className="max-w-xl font-display text-4xl leading-[1.1] font-black tracking-tight sm:text-5xl lg:text-6xl text-white whitespace-pre-line">
                {slide.title}
              </h1>
              <p className="max-w-md text-lg text-blue-100 sm:text-xl font-medium">
                {slide.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to={slide.ctaLink}
                className="inline-flex h-14 items-center gap-2 rounded-full bg-[#FF8C00] px-8 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(255,140,0,0.5)] transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:bg-[#FF9B26] hover:shadow-[0_12px_24px_-6px_rgba(255,140,0,0.6)]"
              >
                {slide.cta} <ArrowRight className="size-5" />
              </Link>
              {slide.showSecondary && (
                <Link
                  to="/services"
                  className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 text-sm font-bold backdrop-blur transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:bg-white/20 hover:border-white/40"
                >
                  Explore Services
                </Link>
              )}
            </div>

            {slide.showBadges && (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-4 pt-4 text-sm text-blue-200 font-semibold sm:flex sm:flex-wrap sm:gap-x-8">
                {BADGES.map((badge) => (
                  <li key={badge.text} className="flex items-center gap-2">
                    <BadgeIcon icon={badge.icon} /> {badge.text}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right Image */}
          <div className="absolute inset-0 md:left-auto md:right-0 md:w-[60%] h-full overflow-hidden">
            <img
              src={slide.image}
              alt={slide.title.replace('\n', ' ')}
              width={1600}
              height={1100}
              className="absolute inset-0 w-full h-full object-cover origin-center block"
              loading={activeIndex === 0 ? "eager" : "lazy"}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2455] via-[#0B2455]/80 to-transparent md:bg-gradient-to-r md:from-[#0B2455] md:via-[#0B2455]/60 md:to-transparent" />
          </div>
        </div>

        {/* === CONTROLS — always visible, outside the fading slide === */}

        {/* Indicators */}
        <div className="absolute bottom-6 left-8 sm:left-12 lg:left-16 flex items-center gap-4 z-20">
          <div className="flex gap-2">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex ? "w-8 bg-[#FF8C00]" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Previous Arrow */}
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/20 backdrop-blur border border-white/10 flex items-center justify-center text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-black/40 hover:scale-110 z-20 focus:opacity-100 md:flex hidden"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-6" />
        </button>

        {/* Next Arrow */}
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/20 backdrop-blur border border-white/10 flex items-center justify-center text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-black/40 hover:scale-110 z-20 focus:opacity-100 md:flex hidden"
          aria-label="Next slide"
        >
          <ChevronRight className="size-6" />
        </button>

      </div>
    </section>
  );
}
