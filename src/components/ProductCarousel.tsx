import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCarouselProps {
  children: React.ReactNode;
}

export function ProductCarousel({ children }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    dragFree: true
  });
  
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative group/carousel -mx-4 sm:mx-0">
      <div className="overflow-hidden px-4 sm:px-0" ref={emblaRef}>
        <div className="flex -ml-4 py-4">
          {children}
        </div>
      </div>
      
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className={`absolute -left-5 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-[#0B2455] transition-all duration-300 z-10 md:flex hidden focus:outline-none focus:ring-2 focus:ring-[#075BFF] ${
          !canScrollPrev ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/carousel:opacity-100 hover:scale-110 hover:bg-[#F4F8FF]"
        }`}
        aria-label="Previous products"
      >
        <ChevronLeft className="size-6" />
      </button>

      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        className={`absolute -right-5 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-[#0B2455] transition-all duration-300 z-10 md:flex hidden focus:outline-none focus:ring-2 focus:ring-[#075BFF] ${
          !canScrollNext ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/carousel:opacity-100 hover:scale-110 hover:bg-[#F4F8FF]"
        }`}
        aria-label="Next products"
      >
        <ChevronRight className="size-6" />
      </button>
    </div>
  );
}

export function ProductCarouselItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-0 shrink-0 grow-0 pl-4 w-[85%] sm:w-[45%] md:w-[33.333%] lg:w-[25%]">
      {children}
    </div>
  );
}
