import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Clock, Printer, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

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
    ctaLink: "/shop"
  },
  {
    id: "office",
    title: "Premium Office\nSupplies.",
    description: "Upgrade your workspace with our curated selection of office essentials.",
    image: slideOffice,
    cta: "Explore Office",
    ctaLink: "/shop?category=office-supplies"
  },
  {
    id: "printing",
    title: "Professional\nPrinting Services.",
    description: "High-quality document printing, binding, and lamination services.",
    image: slidePrinting,
    cta: "Explore Services",
    ctaLink: "/services"
  },
  {
    id: "college",
    title: "Back to School\nEssentials.",
    description: "Get ready for the new semester with our top-rated school supplies.",
    image: slideCollege,
    cta: "Shop School",
    ctaLink: "/shop?category=school-supplies"
  }
];

export function HeroSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="section-shell pt-6 md:pt-10 pb-6">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0B2455] text-white shadow-xl group">
        
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {SLIDES.map((slide, index) => (
              <div key={slide.id} className="min-w-0 shrink-0 grow-0 basis-full relative h-[42rem] md:h-full md:min-h-[36rem] flex flex-col md:flex-row">
                
                {/* Left Content */}
                <div className="flex flex-col justify-center gap-8 p-8 sm:p-12 lg:p-16 w-full md:w-[60%] z-10 h-full">
                  <div className="space-y-4">
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="max-w-xl font-display text-4xl leading-[1.1] font-black tracking-tight sm:text-5xl lg:text-6xl text-white whitespace-pre-line"
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                      className="max-w-md text-lg text-blue-100 sm:text-xl font-medium"
                    >
                      {slide.description}
                    </motion.p>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                    className="flex flex-wrap gap-4"
                  >
                    <Link
                      to={slide.ctaLink}
                      className="inline-flex h-14 items-center gap-2 rounded-full bg-[#FF8C00] px-8 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(255,140,0,0.5)] transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:bg-[#FF9B26] hover:shadow-[0_12px_24px_-6px_rgba(255,140,0,0.6)]"
                    >
                      {slide.cta} <ArrowRight className="size-5" />
                    </Link>
                    {index === 0 && (
                      <Link
                        to="/services"
                        className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 text-sm font-bold backdrop-blur transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:bg-white/20 hover:border-white/40"
                      >
                        Explore Services
                      </Link>
                    )}
                  </motion.div>

                  {index === 0 && (
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-4 pt-4 text-sm text-blue-200 font-semibold sm:flex sm:flex-wrap sm:gap-x-8">
                      {[
                        { icon: <Clock className="size-5 text-[#FF8C00]" />, text: "Same-day Delivery" },
                        { icon: <Printer className="size-5 text-[#FF8C00]" />, text: "Printing & Binding" },
                        { icon: <BadgeCheck className="size-5 text-[#FF8C00]" />, text: "Genuine Brands" },
                        { icon: <ShieldCheck className="size-5 text-[#FF8C00]" />, text: "Secure Payment" }
                      ].map((badge, i) => (
                        <motion.li 
                          key={badge.text}
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1, duration: 0.4 }}
                          className="flex items-center gap-2"
                        >
                          {badge.icon} {badge.text}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Right Image */}
                <div className="absolute inset-0 md:left-auto md:right-0 md:w-[60%] h-full">
                  <motion.img
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.05 }}
                    transition={{ duration: 8, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                    src={slide.image}
                    alt={slide.title.replace('\n', ' ')}
                    width={1600}
                    height={1100}
                    className="absolute inset-0 size-full object-cover origin-center"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  {/* Gradient overlay to smoothly blend image into the dark background on desktop */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B2455] via-[#0B2455]/80 to-transparent md:bg-gradient-to-r md:from-[#0B2455] md:via-[#0B2455]/60 md:to-transparent" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-8 sm:left-12 lg:left-16 flex items-center gap-4 z-20">
          <div className="flex gap-2">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex ? "w-8 bg-[#FF8C00]" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/20 backdrop-blur border border-white/10 flex items-center justify-center text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-black/40 hover:scale-110 z-20 focus:opacity-100 md:flex hidden"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-6" />
        </button>

        <button
          onClick={scrollNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/20 backdrop-blur border border-white/10 flex items-center justify-center text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-black/40 hover:scale-110 z-20 focus:opacity-100 md:flex hidden"
          aria-label="Next slide"
        >
          <ChevronRight className="size-6" />
        </button>

      </div>
    </section>
  );
}
