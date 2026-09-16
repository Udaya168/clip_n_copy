import { useState } from "react";
import { GraduationCap, Briefcase, Palette, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

// We import the images using Vite's path alias to ensure they resolve properly in the bundler
import imgCollege from "@/assets/slide-college.webp";
import imgOffice from "@/assets/slide-office.webp";
import imgArt from "@/assets/cat-art.webp";
import imgPrinting from "@/assets/slide-printing.webp";

type CollectionKey = "students" | "offices" | "creators" | "events";

interface MiniProduct {
  id: string;
  brand: string;
  name: string;
  price: string;
  image: string;
  alt: string;
}

const collections: Record<
  CollectionKey,
  {
    label: string;
    icon: typeof GraduationCap;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    products: MiniProduct[];
  }
> = {
  students: {
    label: "Students",
    icon: GraduationCap,
    title: "Students",
    description: "Everything for the academic grind.",
    image: imgCollege,
    imageAlt: "Student desk with notebooks and pens",
    products: [
      { id: "navneet-youva-notebook", brand: "Navneet", name: "Youva Notebook", price: "₹65", image: "/products/navneet-youva-notebook.webp", alt: "Navneet Youva notebook" },
      { id: "apsara-drawing-pencil-pack", brand: "Apsara", name: "Drawing Pencil Pack", price: "₹55", image: "/products/apsara.webp", alt: "Apsara pencils" },
      { id: "camlin-geometry-box", brand: "Camlin", name: "Geometry Box", price: "₹110", image: "/products/geometry-box.webp", alt: "Camlin geometry box" },
      { id: "generic-sticky-notes", brand: "Generic", name: "Sticky Notes", price: "₹59", image: "/products/sticky-notes.webp", alt: "Sticky notes pack" },
    ],
  },
  offices: {
    label: "Offices",
    icon: Briefcase,
    title: "Offices",
    description: "Supplies that keep the floor moving.",
    image: imgOffice,
    imageAlt: "Office supplies arranged on a desk",
    products: [
      { id: "solo-document-folder", brand: "Solo", name: "Document Folder", price: "₹35", image: "/products/document-folder.webp", alt: "Solo document folder" },
      { id: "kangaro-stapler", brand: "Kangaro", name: "Kangaro Stapler", price: "₹89", image: "/products/stapler.webp", alt: "Kangaro stapler" },
      { id: "jk-copier-a4-printer-paper", brand: "JK Copier", name: "A4 Printer Paper", price: "₹320", image: "/products/a4-printer-paper.webp", alt: "A4 printer paper" },
      { id: "generic-office-register", brand: "Generic", name: "Office Register", price: "₹45", image: "/products/office-register.webp", alt: "Office register" },
    ],
  },
  creators: {
    label: "Creators",
    icon: Palette,
    title: "Creators",
    description: "Tools for sketch, colour and craft.",
    image: imgArt,
    imageAlt: "Art and craft supplies on a table",
    products: [
      { id: "camlin-scissors", brand: "Camlin", name: "Camlin Scissors", price: "₹55", image: "/products/camlin-scissors.webp", alt: "Camlin scissors" },
      { id: "apsara-drawing-pencil-pack", brand: "Apsara", name: "Drawing Pencil Pack", price: "₹55", image: "/products/apsara.webp", alt: "Apsara pencils" },
      { id: "generic-sticky-notes", brand: "Generic", name: "Sticky Notes", price: "₹59", image: "/products/sticky-notes.webp", alt: "Sticky notes pack" },
      { id: "camlin-geometry-box", brand: "Camlin", name: "Geometry Box", price: "₹110", image: "/products/geometry-box.webp", alt: "Camlin geometry box" },
    ],
  },
  events: {
    label: "Events",
    icon: Sparkles,
    title: "Events",
    description: "Print, finish and present every detail.",
    image: imgPrinting,
    imageAlt: "Printed sheets coming out of a printer",
    products: [
      { id: "generic-sticky-notes", brand: "Generic", name: "Sticky Notes", price: "₹59", image: "/products/sticky-notes.webp", alt: "Sticky notes pack" },
      { id: "solo-document-folder", brand: "Solo", name: "Document Folder", price: "₹35", image: "/products/document-folder.webp", alt: "Solo document folder" },
      { id: "jk-copier-a4-printer-paper", brand: "JK Copier", name: "A4 Printer Paper", price: "₹320", image: "/products/a4-printer-paper.webp", alt: "A4 printer paper" },
      { id: "kangaro-stapler", brand: "Kangaro", name: "Kangaro Stapler", price: "₹89", image: "/products/stapler.webp", alt: "Kangaro stapler" },
    ],
  },
};

const order: CollectionKey[] = ["students", "offices", "creators", "events"];

export function CollectionSwitcher() {
  const [active, setActive] = useState<CollectionKey>("students");
  const current = collections[active];
  const Icon = current.icon;

  return (
    <section id="collections" className="bg-[#0A1E46] py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="animate-rise">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#3B82F6]">
              Shop by intention
            </p>
            <h2 className="mt-4 font-display text-5xl font-extrabold italic leading-[0.95] text-white sm:text-6xl lg:text-[5rem]">
              Made for
              <br />
              your moment.
            </h2>
          </div>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Shop collections"
            className="hide-scrollbar flex gap-3 overflow-x-auto pb-4 lg:pb-0"
          >
            {order.map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={active === key}
                onClick={() => setActive(key)}
                className={`whitespace-nowrap rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  active === key
                    ? "bg-white text-[#0A1E46] shadow-lg scale-105"
                    : "border border-white/20 text-white hover:border-white/50 hover:bg-white/5"
                }`}
              >
                {collections[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel */}
        <div
          key={active}
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
          className="mt-12 grid overflow-hidden border border-white/10 lg:grid-cols-2 rounded-2xl"
        >
          {/* Lifestyle image */}
          <div className="relative min-h-[280px] lg:min-h-[400px] border-b border-white/10 lg:border-b-0 lg:border-r">
            <img
              src={current.image}
              alt={current.imageAlt}
              loading="lazy"
              className="collection-image absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A1E46]/80 via-[#0A1E46]/20 to-transparent lg:via-transparent lg:from-[#0A1E46]/60" />
          </div>

          {/* Detail panel */}
          <div className="p-6 sm:p-10 bg-[#0A1E46]/50 backdrop-blur-sm lg:bg-transparent flex flex-col justify-center">
            <div className="collection-rise">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#3B82F6]/60 text-[#3B82F6]">
                <Icon size={24} strokeWidth={2.5} />
              </span>
              <h3 className="mt-6 font-display text-4xl font-extrabold text-white sm:text-5xl tracking-tight">
                {current.title}
              </h3>
              <p className="mt-4 text-lg font-medium text-white/70 max-w-sm">{current.description}</p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 max-w-[480px]">
              {current.products.map((product, index) => (
                <Link
                  to={`/product/${product.id}`}
                  key={product.name}
                  className="collection-card group block bg-white p-3 transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-xl border border-border"
                  style={{ animationDelay: `${index * 60 + 100}ms` }}
                >
                  <div className="aspect-square overflow-hidden bg-[#F4F8FF] rounded-lg mb-3 flex items-center justify-center p-3">
                    <img
                      src={product.image}
                      alt={product.alt}
                      loading="lazy"
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 mix-blend-multiply"
                    />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#3B82F6] truncate">
                    {product.brand}
                  </p>
                  <h4 className="mt-1 text-sm font-bold leading-tight text-ink line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="mt-1.5 text-sm font-extrabold text-ink">
                    {product.price}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
