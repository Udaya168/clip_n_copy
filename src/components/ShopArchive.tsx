import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import imgNotebooks from "@/assets/cat-notebooks.webp";
import imgSchool from "@/assets/cat-school.webp";
import imgTools from "@/assets/cat-office-tools.webp";
import imgPens from "@/assets/cat-pens.webp";

const displayCategories = [
  { name: "All", slug: "All" },
  { name: "Notebooks", slug: "notebooks" },
  { name: "School Supplies", slug: "school-supplies" },
  { name: "Office Supplies", slug: "office-supplies" },
  { name: "Pens & Pencils", slug: "pens-pencils" },
  { name: "Calculators", slug: "calculators" }
];

const tiles = [
  { name: "Notebooks",       slug: "notebooks",       image: imgNotebooks, className: "aspect-[3/4]" },
  { name: "School Supplies", slug: "school-supplies", image: imgSchool,    className: "mt-8 aspect-[3/4]" },
  { name: "Office Supplies", slug: "office-supplies", image: imgTools,     className: "-mt-3 aspect-square sm:mt-12" },
  { name: "Pens & Pencils",  slug: "pens-pencils",    image: imgPens,      className: "aspect-[3/5] sm:mt-2" },
];

export function ShopArchive({
  products,
}: {
  products: { category: string }[];
}) {
  const navigate = useNavigate();

  const open = (slug: string) => {
    if (slug === "All") {
      navigate("/shop");
    } else {
      navigate(`/shop?category=${slug}`);
    }
  };

  return (
    <section className="mx-auto max-w-[1440px] border-x border-primary/10 bg-card px-4 py-20 sm:px-7 lg:py-28 animate-rise">
      <header className="mb-12 grid gap-6 lg:grid-cols-2 lg:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
            Department 01 · The curated shop
          </p>
          <h2 className="mt-3 font-display text-5xl font-light italic leading-[0.92] sm:text-7xl text-foreground">
            The Shop<br />
            <span className="font-extrabold not-italic">Archive.</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground lg:justify-self-end">
          Browse the everyday tools that keep Bengaluru studying, working and making.
        </p>
      </header>

      {/* Staggered image mosaic */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
        {tiles.map((item, index) => (
          <button
            key={item.name}
            onClick={() => open(item.slug)}
            className={`group relative overflow-hidden bg-secondary text-left outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ${item.className}`}
          >
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="size-full object-cover transition duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-primary/20 transition group-hover:bg-primary/35" />
            <span className="absolute inset-x-3 bottom-3 border border-primary-foreground/30 bg-primary/85 p-3 text-primary-foreground backdrop-blur sm:inset-x-5 sm:bottom-5">
              <small className="block text-[9px] font-bold uppercase opacity-60">0{index + 1}</small>
              <strong className="mt-1 block font-display text-sm sm:text-lg">{item.name}</strong>
            </span>
          </button>
        ))}
      </div>

      {/* Numbered category index with counts */}
      <div className="mt-12 grid border-t border-primary/15 sm:grid-cols-3">
        {displayCategories.map((item, index) => (
          <button
            key={item.name}
            onClick={() => open(item.slug)}
            className="group flex items-center gap-3 border-b border-primary/15 py-4 text-left sm:px-4 cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <span className="text-[10px] font-bold text-muted-foreground">0{index + 1}</span>
            <strong className="flex-1 font-display text-foreground">{item.name}</strong>
            <span className="text-[10px] font-bold text-muted-foreground">
              {item.slug === "All" ? products.length : products.filter((p) => p.category === item.slug).length}
            </span>
            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
          </button>
        ))}
      </div>
    </section>
  );
}
