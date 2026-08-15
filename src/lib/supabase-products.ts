import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { type Product, INITIAL_PRODUCTS, setProductsCache } from "./data";
import imgPens from "@/assets/cat-pens.png";
import imgNotebooks from "@/assets/cat-notebooks.png";
import imgBooks from "@/assets/cat-books.png";
import imgArt from "@/assets/cat-art.png";
import imgSchool from "@/assets/cat-school.png";
import imgFiles from "@/assets/cat-files.png";
import imgCalc from "@/assets/cat-calculators.png";
import imgTools from "@/assets/cat-office-tools.png";

export type SupabaseProduct = {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  brand: string;
  price: number;
  original_price?: number | null;
  stock: number | boolean;
  image_url?: string | null;
  rating?: number | null;
  review_count?: number | null;
  created_at?: string | null;
};

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  notebooks: imgNotebooks,
  "pens-pencils": imgPens,
  books: imgBooks,
  "art-craft": imgArt,
  "school-supplies": imgSchool,
  "files-folders": imgFiles,
  calculators: imgCalc,
  "office-supplies": imgTools,
};

export function normalizeCategorySlug(category: string): string {
  if (!category) return "notebooks";
  const lower = category.toLowerCase().trim();
  if (lower.includes("notebook")) return "notebooks";
  if (lower.includes("pen") || lower.includes("pencil")) return "pens-pencils";
  if (lower.includes("book")) return "books";
  if (lower.includes("school")) return "school-supplies";
  if (lower.includes("office")) return "office-supplies";
  if (lower.includes("art") || lower.includes("craft")) return "art-craft";
  if (lower.includes("file") || lower.includes("folder")) return "files-folders";
  if (lower.includes("calc")) return "calculators";
  if (lower.includes("bag")) return "bags";
  if (lower.includes("exam")) return "exam-essentials";
  return lower.replace(/\s+/g, "-");
}

export function mapSupabaseProduct(p: SupabaseProduct): Product {
  const normalizedCategory = normalizeCategorySlug(p.category);
  const fallbackImage = CATEGORY_FALLBACK_IMAGES[normalizedCategory] || imgNotebooks;
  const image = p.image_url && p.image_url.trim() !== "" ? p.image_url : fallbackImage;
  const price = Number(p.price) || 0;
  const rawMrp = Number(p.original_price ?? p.price) || price;
  const mrp = rawMrp < price ? price : rawMrp;
  const rating = Number(p.rating ?? 4.5);
  const reviews = Number(p.review_count ?? 0);
  const rawStock = typeof p.stock === "number" ? p.stock : p.stock ? 50 : 0;
  const stock = Math.max(0, Math.floor(Number(rawStock) || 0));

  return {
    id: String(p.id),
    name: p.name,
    brand: p.brand || "Classmate",
    category: normalizedCategory,
    price,
    mrp,
    rating,
    reviews,
    image,
    stock,
    description: p.description || `${p.name} by ${p.brand || "Classmate"}`,
    specs: {
      Brand: p.brand || "Classmate",
      Category: p.category || "Stationery",
      SKU: `CNC-${String(p.id).slice(0, 8).toUpperCase()}`,
      Stock: stock > 5 ? "In Stock" : stock > 0 ? `Only ${stock} left` : "Out of Stock",
    },
  };
}

export async function fetchSupabaseProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.warn("Supabase fetch error, using catalog fallback:", error.message);
      setProductsCache(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    if (!data || data.length === 0) {
      setProductsCache(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    const mapped = (data as SupabaseProduct[]).map(mapSupabaseProduct);
    setProductsCache(mapped);
    return mapped;
  } catch (err) {
    console.warn("Supabase fetch exception, using catalog fallback:", err);
    setProductsCache(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }
}

export function useSupabaseProducts() {
  return useQuery({
    queryKey: ["supabase-products"],
    queryFn: fetchSupabaseProducts,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
