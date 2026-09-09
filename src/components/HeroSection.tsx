import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Clock, Printer, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

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
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  // Set up autoplay plugin
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const onSelect = useCallback((api: CarouselApi) => {
    setActiveIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;

    onSelect(api);
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!api) return;
      api.scrollTo(index);
    },
    [api]
  );

  return (
    <section className="section-shell pt-4 md:pt-6 pb-2 md:pb-4">
      <div className="relative h-[42rem] md:h-[36rem] lg:h-[40rem] rounded-[2.5rem] bg-[#0B2455] text-white shadow-xl group isolate">
        <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
          opts={{
            loop: true,
            duration: 40,
          }}
          className="w-full h-full rounded-[2.5rem] overflow-hidden"
        >
          <CarouselContent>
            {SLIDES.map((slide, index) => (
              <CarouselItem key={slide.id} className="relative h-[42rem] md:h-[36rem] lg:h-[40rem]">
                <div className="absolute inset-0 size-full flex flex-col md:flex-row">
                  {/* Left Content */}
                  <div className="flex flex-col justify-center gap-6 sm:gap-8 p-8 sm:p-12 lg:p-16 w-full md:w-[55%] z-10 h-full relative">
                    <AnimatePresence mode="wait">
                      {activeIndex === index && (
                        <motion.div
                          key={`text-${slide.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="space-y-4"
                        >
                          <h1 className="max-w-xl font-display text-4xl leading-[1.1] font-black tracking-tight sm:text-5xl lg:text-6xl text-white whitespace-pre-line">
                            {slide.title}
                          </h1>
                          <p className="max-w-md text-lg text-blue-50 sm:text-xl font-medium drop-shadow-md">
                            {slide.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                      {activeIndex === index && (
                        <motion.div
                          key={`cta-${slide.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                          className="flex flex-wrap gap-4 relative z-20"
                        >
                          <Link
                            to={slide.ctaLink}
                            className="inline-flex h-14 items-center gap-2 rounded-full bg-[#FF8C00] px-8 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(255,140,0,0.5)] transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:bg-[#FF9B26] hover:shadow-[0_12px_24px_-6px_rgba(255,140,0,0.6)]"
                          >
                            {slide.cta} <ArrowRight className="size-5" />
                          </Link>
                          {slide.showSecondary && (
                            <Link
                              to="/services"
                              className="inline-flex h-14 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 text-sm font-bold backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:bg-white/20 hover:border-white/50"
                            >
                              Explore Services
                            </Link>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {slide.showBadges && (
                      <AnimatePresence mode="wait">
                        {activeIndex === index && (
                          <motion.ul
                            key={`badges-${slide.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2 sm:pt-4 text-sm text-blue-100 font-semibold sm:flex sm:flex-wrap sm:gap-x-8 relative z-20"
                          >
                            {BADGES.map((badge) => (
                              <li key={badge.text} className="flex items-center gap-2 drop-shadow-md">
                                <BadgeIcon icon={badge.icon} /> {badge.text}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Right Image */}
                  <div className="absolute inset-0 md:left-auto md:right-0 md:w-[65%] h-full overflow-hidden pointer-events-none">
                    <motion.div
                      animate={{
                        scale: activeIndex === index ? 1 : 1.05,
                      }}
                      transition={{ duration: 6, ease: "linear" }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <img
                        src={slide.image}
                        alt={slide.title.replace('\n', ' ')}
                        width={1600}
                        height={1100}
                        className="absolute inset-0 w-full h-full object-cover origin-center block"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </motion.div>
                    {/* Smoother, more elegant gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B2455] via-[#0B2455]/70 to-transparent md:bg-gradient-to-r md:from-[#0B2455] md:via-[#0B2455]/40 md:to-transparent" />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Custom positioned previous/next arrows within the hero container */}
          <div className="hidden md:block">
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 size-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 text-white border-white/20 hover:bg-black/40 hover:text-white hover:scale-110" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 size-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 text-white border-white/20 hover:bg-black/40 hover:text-white hover:scale-110" />
          </div>
        </Carousel>

        {/* Indicators */}
        <div className="absolute bottom-6 left-8 sm:left-12 lg:left-16 flex items-center gap-4 z-30">
          <div className="flex gap-2">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === activeIndex ? "w-8 bg-[#FF8C00]" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
