import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { type Product, INITIAL_PRODUCTS, setProductsCache } from "./data";
import imgPens from "@/assets/cat-pens.webp";
import imgNotebooks from "@/assets/cat-notebooks.webp";
import imgArt from "@/assets/cat-art.webp";
import imgSchool from "@/assets/cat-school.webp";
import imgFiles from "@/assets/cat-files.webp";
import imgCalc from "@/assets/cat-calculators.webp";
import imgTools from "@/assets/cat-office-tools.webp";

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
  let rawUrl = p.image_url && p.image_url.trim() !== "" ? p.image_url : null;
  if (rawUrl && rawUrl.startsWith('/products/')) {
    rawUrl = rawUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  let image = rawUrl || fallbackImage;
  const price = Number(p.price) || 0;
  const rawMrp = Number(p.original_price ?? p.price) || price;
  const mrp = rawMrp < price ? price : rawMrp;
  let rating = Number(p.rating ?? 4.5);
  let reviews = Number(p.review_count ?? 0);
  let rawStock: number;
  if (typeof p.stock === "number" && !isNaN(p.stock)) {
    rawStock = p.stock;
  } else if (typeof p.stock === "string") {
    const parsed = parseInt(p.stock, 10);
    rawStock = !isNaN(parsed) ? parsed : 50;
  } else if (typeof p.stock === "boolean") {
    rawStock = p.stock ? 50 : 0;
  } else if (p.stock === null || p.stock === undefined) {
    rawStock = 50;
  } else {
    rawStock = 50;
  }
  const stock = Math.max(0, Math.floor(rawStock));

  let description = p.description || `${p.name} by ${p.brand || "Classmate"}`;
  let features: string[] | undefined;
  let specs: Record<string, string> | undefined = {
    Brand: p.brand || "Classmate",
    Category: p.category || "Stationery",
    SKU: `CNC-${String(p.id).slice(0, 8).toUpperCase()}`,
    Stock: stock > 5 ? "In Stock" : stock > 0 ? `Only ${stock} left` : "Out of Stock",
  };
  let variants: import("./data").ProductVariant[] | undefined;

  if (p.name === 'Reynolds Trimax') {
    description = "Reynolds Trimax is designed with advanced fluid ink technology for a smooth and precise writing experience. Its ink is designed to flow smoothly across the page for consistent writing performance during everyday use and longer writing sessions. Trimax is suitable for school, college, office and general writing.";
    features = [
      "Advanced fluid ink technology",
      "Smooth writing experience",
      "Precise writing performance",
      "Waterproof ink",
      "Fine 0.5 mm tip",
      "Designed for long writing sessions",
      "Suitable for school, college and office use"
    ];
    specs = {
      Brand: "Reynolds",
      Model: "Trimax",
      "Product Type": "Roller Ball Pen",
      "Tip Size": "0.5 mm",
      "Tip Type": "Fine",
      "Ink Technology": "Advanced Fluid Ink Technology",
      Ink: "Waterproof",
      "Ink Colour": "Selected Variant",
      "Body Material": "Plastic",
      "Available Colours": "Blue, Black, Red"
    };
    variants = [
      {
        name: "Blue",
        images: ["/products/reynolds-trimax.webp"]
      },
      {
        name: "Black",
        images: ["/products/trimax-black-1.webp"]
      },
      {
        name: "Red",
        images: ["/products/trimax-red-1.webp"]
      }
    ];
  } else if (p.id === 'luxor-fine-writer' || p.name?.toLowerCase().includes('luxor fine writer')) {
    description = "Luxor Fine Writer 05 is a fine-tip writing pen designed for smooth, precise and consistent writing. It features a strong Japanese polyacetal tip for fine, skip-free writing, along with a metal clip and metal adaptor for durability. With a 0.5 mm line width and a writing length of over 1,000 metres under standard machine test conditions, it is suitable for precision writing, drawing, signing, note-taking and everyday use.";
    features = [
      "Strong Japanese polyacetal tip",
      "Fine, skip-free writing",
      "Soft-touch writing experience",
      "0.5 mm fine line width",
      "Writing length over 1,000 metres under standard machine test conditions",
      "Metal clip for durability and premium appearance",
      "Suitable for precision writing, drawing and signing",
      "Suitable for school, college, office and everyday writing"
    ];
    specs = {
      Brand: "Luxor",
      "Product Name": "Fine Writer 05",
      "Product Type": "Fine-tip pen / Fineliner",
      "Line Width": "0.5 mm",
      "Tip Material": "Japanese polyacetal",
      "Ink Type": "Water-based ink",
      "Ink Colours": "Available in multiple colours",
      "Product Colour": "Selected Variant",
      "Writing Length": "Over 1,000 metres*",
      Clip: "Metal",
      "Metal Adaptor": "Yes",
      Use: "Writing, drawing and signing",
      "Country of Origin": "India"
    };
    rating = 0;
    reviews = 0;
    variants = [
      {
        name: "Blue",
        images: ["/products/luxor-fine-writer.webp"]
      },
      {
        name: "Black",
        images: ["/products/luxor-fine-writer-black.webp"]
      },
      {
        name: "Red",
        images: ["/products/luxor-fine-writer-red.webp"]
      }
    ];
  } else if (p.name?.toLowerCase().includes('apsara') && p.name?.toLowerCase().includes('drawing pencil')) {
    description = "Apsara Assorted Drawing Pencils are a set of six graphite drawing pencils designed for sketching, shading, detailing and artistic work. The assorted set includes different graphite grades, allowing users to create both lighter outlines and darker tones. The pencils feature quality wooden bodies, a hexagonal shape for comfortable handling and smooth graphite performance.";
    features = [
      "Assorted set of 6 drawing pencils",
      "Includes HB, 2B, 4B, 6B, 8B and 10B grades",
      "Premium-quality drawing pencils",
      "Smooth graphite performance",
      "Suitable for sketching and shading",
      "Different grades for light-to-dark tonal work",
      "Quality wooden body",
      "Hexagonal shape for comfortable grip",
      "Easy to sharpen",
      "Suitable for students, artists and hobbyists"
    ];
    specs = {
      Brand: "Apsara",
      "Product Name": "Assorted Drawing Pencils",
      "Product Type": "Graphite Drawing Pencils",
      "Pack Size": "6 pencils",
      "Grades Included": "HB, 2B, 4B, 6B, 8B, 10B",
      Material: "Wood and graphite",
      Shape: "Hexagonal",
      Use: "Drawing, sketching, shading and detailing",
      "Country of Origin": "India"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('apsara') && p.name?.toLowerCase().includes('absolute')) {
    description = "Apsara Absolute is an extra-dark writing pencil designed to provide strong, dark and comfortable writing with minimal pressure. It features an extra-strong lead designed to resist breakage, while the soft wood makes the pencil easy to sharpen. Its hexagonal shape provides a comfortable grip, and the pencil is designed to be easy to erase.";
    features = [
      "Extra-strong lead for improved break resistance",
      "Extra-dark lead for bold, clear writing",
      "Soft wood for easy sharpening",
      "Hexagonal shape for a comfortable grip",
      "Easy to erase",
      "Suitable for everyday writing and handwriting practice",
      "Suitable for students and school use"
    ];
    specs = {
      Brand: "Apsara",
      "Product Name": "Absolute Pencil",
      "Product Type": "Writing Pencil",
      "Pack Size": "10 pencils",
      Lead: "Extra-strong lead",
      Writing: "Extra-dark lead",
      Body: "Soft wood",
      Shape: "Hexagonal",
      Erasability: "Easy to erase",
      Use: "Writing and handwriting",
      Manufacturer: "Hindustan Pencils Pvt. Ltd.",
      "Country of Origin": "India"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('apsara') && p.name?.toLowerCase().includes('platinum')) {
    description = "Apsara Platinum is an extra-dark HB graphite pencil designed for smooth, comfortable everyday writing. Its soft-wood body is easy to sharpen, while the strong graphite lead provides dark and consistent writing with less pressure. The hexagonal shape provides a comfortable grip and helps prevent the pencil from rolling off the desk. It is suitable for school, college, office and everyday writing.";
    features = [
      "Extra-dark HB graphite lead",
      "Smooth and dark writing",
      "Strong, durable lead",
      "Soft-wood body",
      "Easy to sharpen",
      "Hexagonal body for comfortable grip",
      "Suitable for everyday writing",
      "Suitable for school, college and office use"
    ];
    specs = {
      Brand: "Apsara",
      "Product Name": "Platinum Pencil",
      "Product Type": "Graphite / Writing Pencil",
      "Lead Grade": "HB",
      "Lead Type": "Extra Dark",
      "Body Material": "Wood",
      "Body Shape": "Hexagonal",
      "Pencil Colour": "Natural wood / graphite body",
      Use: "Writing and everyday use",
      "Pack Size": "10 pencils",
      "Country of Origin": "India"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('cello') && p.name?.toLowerCase().includes('butterflow')) {
    description = "Cello Butterflow is a smooth-writing ballpoint pen designed for comfortable everyday writing. It uses specially formulated Lubriflow ink for a smooth writing experience and features a 0.7 mm tip for fine, controlled writing. Its comfortable grip makes it suitable for school, office, note-taking and everyday use.";
    features = [
      "Smooth-flowing Lubriflow ink",
      "0.7 mm fine writing tip",
      "Comfortable grip",
      "Smooth and controlled writing",
      "Lightweight everyday-use design",
      "Suitable for school and office use",
      "Available in multiple ink colours depending on variant"
    ];
    specs = {
      Brand: "Cello",
      "Product Name": "Butterflow Ball Pen",
      "Product Type": "Ballpoint Pen",
      "Tip Size": "0.7 mm",
      "Ink Type": "Specially formulated smooth-flow ink / Lubriflow ink",
      "Body Material": "Plastic",
      Grip: "Patterned / comfortable grip",
      Closure: "Cap",
      Use: "Writing, note-taking and everyday use",
      "Country of Origin": "India"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('parker') && p.name?.toLowerCase().includes('vector')) {
    description = "Parker Vector is a practical everyday ballpoint pen designed with a simple, durable and comfortable design. The Vector range combines a glossy resin body with polished chrome or stainless-steel trims and Parker's signature arrow clip. The ballpoint version uses a medium Parker refill with blue ink and is designed to provide a consistent and fluid writing experience for everyday writing.";
    features = [
      "Classic Parker Vector design",
      "Ballpoint writing system",
      "Medium refill",
      "Blue ink",
      "Glossy resin body",
      "Polished chrome/stainless-steel trims",
      "Signature Parker arrow clip",
      "Click-action mechanism",
      "Refillable design",
      "Suitable for students, professionals and everyday writing"
    ];
    specs = {
      Brand: "Parker",
      "Product Name": "Vector Ball Pen",
      "Product Type": "Ballpoint Pen",
      Model: "Vector",
      "Writing Mechanism": "Ballpoint",
      "Refill Type": "Parker Ballpoint Refill",
      "Refill Width": "Medium",
      "Ink Colour": "Blue",
      "Body Finish": "Glossy",
      "Body Material": "Resin / Plastic",
      Trim: "Chrome",
      Clip: "Parker Arrow Clip",
      Mechanism: "Click-action",
      Refillable: "Yes",
      Use: "Everyday writing",
      "Country of Origin": "India"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('classmate') && p.name?.toLowerCase().includes('octane')) {
    description = "Classmate Octane Ball Pen is designed for smooth and comfortable everyday writing. It features a 0.7 mm ballpoint tip, a comfortable textured grip and a lightweight plastic body. The pen is designed for fast, smooth writing and is suitable for school, college, office and everyday use. The Octane range is available in different ink colours, including blue and black.";
    features = [
      "0.7 mm ballpoint tip",
      "Smooth and fast writing",
      "Comfortable textured grip",
      "Lightweight plastic body",
      "Designed for everyday writing",
      "Suitable for students and professionals",
      "Available in blue and black ink variants",
      "Designed for longer writing performance"
    ];
    specs = {
      Brand: "Classmate",
      "Product Name": "Octane Ball Pen",
      "Product Type": "Ballpoint Pen",
      Model: "Octane",
      "Tip Size": "0.7 mm",
      "Ink Type": "Ballpoint Ink",
      "Ink Colour": "Selected Variant",
      "Body Material": "Plastic",
      "Body Shape": "Cylindrical / Round",
      Grip: "Textured / Ribbed Grip",
      Refillable: "Yes",
      "Writing Type": "Smooth Ballpoint Writing",
      "Ideal For": "School, College, Office & Everyday Writing",
      "Product Colour": "Selected Variant",
      "Country of Origin": "India"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('pentonic')) {
    description = "Pentonic Ball Pen is designed for smooth, effortless everyday writing. It features easy-flow, ultra-low-viscosity ink, a lightweight body and a sleek matte finish for comfortable writing during long writing sessions. The 0.7 mm tip produces precise, clean strokes and is suitable for school, office and everyday writing.";
    features = [
      "Smooth, effortless everyday writing",
      "Easy-flow, ultra-low-viscosity ink",
      "Lightweight body",
      "Sleek matte finish",
      "Comfortable writing during long sessions",
      "0.7 mm tip for precise, clean strokes",
      "Suitable for school, office and everyday writing"
    ];
    specs = {
      Brand: "Pentonic",
      "Product Name": "Ball Pen",
      "Product Type": "Ball Point Pen",
      "Tip Size": "0.7 mm",
      "Ink Technology": "Easy-flow / ultra-low-viscosity ink",
      Finish: "Matte",
      Body: "Lightweight",
      "Available Colours": "Blue, Black, Red",
      Use: "School, office and everyday writing",
      "Country of Origin": "India"
    };
    variants = [
      {
        name: "Blue",
        images: [image || "/products/pentonic.webp"]
      },
      {
        name: "Black",
        images: ["/products/pentonic-black.webp"]
      },
      {
        name: "Red",
        images: ["/products/pentonic-red.webp"]
      }
    ];
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('pilot') && p.name?.toLowerCase().includes('v7')) {
    description = "Pilot V7 Roller Ball Pen is a liquid-ink rollerball designed for smooth, precise and consistent writing. It uses a 0.7 mm tip with a tungsten-carbide ball and free-flowing liquid ink for clear, precise lines. The visible ink tank helps monitor ink level, making it suitable for school, office and everyday writing.";
    features = [
      "Liquid-ink rollerball",
      "Smooth, precise and consistent writing",
      "0.7 mm tip",
      "Tungsten-carbide ball",
      "Free-flowing liquid ink",
      "Clear, precise lines",
      "Visible ink tank",
      "Suitable for school, office and everyday writing"
    ];
    specs = {
      Brand: "Pilot",
      "Product Name": "V7 Hi-Tecpoint",
      "Product Type": "Liquid Ink Roller Ball Pen",
      "Tip Size": "0.7 mm",
      "Writing Width": "0.40 mm",
      "Ink Type": "Liquid Ink",
      "Ink Colours": "Blue, Black, Red",
      "Ball Material": "Tungsten Carbide",
      "Ink Flow": "Free-flowing",
      "Ink Tank": "Visible",
      Use: "School, office and everyday writing",
      "Country of Origin": "India"
    };
    variants = [
      {
        name: "Blue",
        images: [image || "/products/pilot-v7-roller-ball-pen.webp"]
      },
      {
        name: "Black",
        images: ["/products/pilot-v7-black.webp"]
      },
      {
        name: "Red",
        images: ["/products/pilot-v7-red.webp"]
      }
    ];
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('hauser') && p.name?.toLowerCase().includes('xo')) {
    const hauserImgUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWj0oaAQn5gMz6zcY1sAGGA6TMoiOKqeKGTEY2Mk0ICg&s";
    image = hauserImgUrl;
    description = "Hauser XO Ball Pen is an everyday ballpoint pen designed for smooth and comfortable writing. It features a fine 0.6 mm tip, a lightweight plastic body and a comfortable ribbed grip for easy handling. The pen is suitable for note-taking, journaling, underlining, schoolwork, office work and everyday writing.";
    features = [
      "0.6 mm fine ballpoint tip",
      "Smooth writing experience",
      "Comfortable ribbed grip",
      "Lightweight plastic body",
      "Cap-on / cap-off design",
      "Designed for comfortable everyday writing",
      "Suitable for school, college and office use",
      "Suitable for note-taking and journaling",
      "Available in Blue, Black and Red ink variants"
    ];
    specs = {
      Brand: "Hauser",
      "Product Name": "XO Ball Pen",
      Model: "XO",
      "Product Type": "Ballpoint Pen",
      "Tip Size": "0.6 mm",
      "Point Type": "Fine",
      "Ink Type": "Ballpoint Ink",
      "Ink Colour": "Selected Variant",
      "Product Colour": "Selected Variant",
      "Body Material": "Plastic",
      "Body Type": "Solid",
      "Grip Type": "Ribbed",
      Closure: "Cap-on / Cap-off",
      "Writing Type": "Fine Ballpoint Writing",
      "Ideal For": "School, College, Office & Everyday Writing",
      "Country of Origin": "India"
    };
    rating = 0;
    reviews = 0;
    variants = [
      {
        name: "Blue",
        images: [hauserImgUrl]
      },
      {
        name: "Black",
        images: [hauserImgUrl, "/products/hauser-black.webp"]
      },
      {
        name: "Red",
        images: [hauserImgUrl, "/products/hauser-red.webp"]
      }
    ];
  } else if (p.name?.toLowerCase().includes('nataraj') && p.name?.toLowerCase().includes('hb pencil')) {
    description = "Nataraj HB Pencil is a classic everyday writing pencil designed for smooth and reliable writing. The HB graphite grade provides a balanced combination of darkness and hardness, making it suitable for schoolwork, note-taking, examinations, drawing and everyday writing. The pencil features a wooden casing and a hexagonal shape that provides a comfortable grip and helps prevent the pencil from rolling off the desk.";
    features = [
      "HB graphite grade",
      "Smooth and consistent writing",
      "Durable wooden casing",
      "Hexagonal anti-roll design",
      "Easy to sharpen",
      "Suitable for school and office use",
      "Suitable for writing, drawing and sketching",
      "Reliable everyday pencil",
      "Graphite lead designed for clear, dark writing"
    ];
    specs = {
      Brand: "Nataraj",
      "Product Name": "Nataraj HB Pencil Pack",
      Model: "621",
      "Product Type": "Graphite Writing Pencil",
      Grade: "HB",
      "Lead Material": "Graphite",
      "Casing Material": "Wood",
      "Pencil Shape": "Hexagonal",
      Design: "Hexagonal / Anti-Roll",
      "Ideal For": "School, College, Office & Everyday Writing",
      Applications: "Writing, Drawing, Sketching & Exams",
      "Product Colour": "As shown in product image",
      "Country of Origin": "India"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('fevicol') && p.name?.toLowerCase().includes('mr')) {
    description = "Fevicol MR is a synthetic adhesive intended for everyday bonding applications such as paper, cardboard, polystyrene and wood.";
    features = [
      "Strong bonding",
      "Suitable for paper and cardboard",
      "Suitable for craft and school projects",
      "Suitable for household and office use",
      "Easy liquid application"
    ];
    specs = {
      Brand: "Fevicol",
      "Product Name": "Fevicol MR",
      "Product Type": "Synthetic adhesive",
      Application: "Paper, cardboard, polystyrene and wood",
      Form: "Liquid adhesive",
      Colour: "White",
      "Country of Origin": "India"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('geometry') || p.id?.includes('geometry')) {
    description = "Camlin Geometry Box is a complete mathematical instrument set designed for accurate measurement, drawing and geometric constructions. It is suitable for school students and everyday mathematics work, with the instruments organized in a compact protective box for convenient storage and carrying.";
    features = [
      "Complete geometry instrument set",
      "Suitable for school mathematics",
      "Useful for accurate measurement and construction",
      "Compact storage case",
      "Easy to carry and organize"
    ];
    specs = {
      Brand: "Camlin",
      "Product Name": "Geometry Box",
      "Product Type": "Geometry Instrument Set",
      Use: "Mathematics, measurement and geometric construction",
      "Pack Type": "Geometry Box"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('crayons') && p.name?.toLowerCase().includes('24')) {
    description = "A 24-shade crayon set designed for children's drawing, colouring and creative activities, with bright colours and easy handling.";
    features = [
      "24 assorted shades",
      "Bright colouring",
      "Easy grip",
      "Suitable for drawing and colouring",
      "Non-toxic formulation",
      "Suitable for children"
    ];
    specs = {
      Brand: "Camlin",
      "Product Type": "Crayons",
      "Shade Count": "24",
      Colour: "Assorted",
      Use: "Drawing and colouring"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('apsara') && p.name?.toLowerCase().includes('non dust')) {
    description = "Apsara Non Dust Eraser is designed to remove graphite marks cleanly while minimizing loose eraser dust. Its special formulation helps residue stick to the eraser rather than scatter across the paper.";
    features = [
      "Clean graphite erasing",
      "Minimal dust",
      "Soft erasing experience",
      "Helps keep paper clean",
      "Suitable for students, artists, engineers and architects"
    ];
    specs = {
      Brand: "Apsara",
      "Product Name": "Non Dust Eraser",
      "Product Type": "Graphite eraser",
      Use: "Pencil/graphite erasing"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('highlighter') || p.id?.includes('highlighter')) {
    description = "Camlin Highlighter Set is designed for highlighting important information in notes, textbooks, documents and study material. The bright fluorescent colours make important text easy to identify and are suitable for school, college, office and everyday study use.";
    features = [
      "Bright fluorescent colours",
      "Suitable for highlighting important text",
      "Useful for notes and study material",
      "Comfortable everyday use",
      "Suitable for school, college and office"
    ];
    specs = {
      Brand: "Camlin",
      "Product Name": "Highlighter Set",
      "Product Type": "Highlighter",
      "Ink Type": "Fluorescent ink",
      "Tip Type": "Chisel tip",
      Colour: "Assorted fluorescent colours",
      Use: "Highlighting and marking text"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('camlin') && p.name?.toLowerCase().includes('exam pad')) {
    description = "A sturdy exam/writing pad designed to provide a firm and smooth writing surface for examinations, note-taking and document support.";
    features = [
      "Firm writing surface",
      "Suitable for examinations",
      "Suitable for writing and note-taking",
      "Strong clip",
      "Easy to carry"
    ];
    specs = {
      Brand: "Camlin",
      "Product Type": "Exam Pad / Clipboard",
      Clip: "Yes",
      Use: "Exams, writing and document support"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('pencil box')) {
    description = "A compact pencil box designed for storing and organizing everyday stationery such as pencils, pens, erasers and sharpeners.";
    features = [
      "Compact storage",
      "Suitable for school use",
      "Easy to carry",
      "Helps organize stationery"
    ];
    specs = {
      Brand: "Classmate",
      "Product Type": "Pencil Box",
      Use: "Stationery storage"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('nataraj') && p.name?.toLowerCase().includes('eraser')) {
    description = "Nataraj erasers are designed for clean and smooth removal of graphite marks during everyday writing and schoolwork.";
    features = [
      "Smooth erasing",
      "Clean correction",
      "Suitable for pencil marks",
      "Suitable for school and everyday use"
    ];
    specs = {
      Brand: "Nataraj",
      "Product Type": "Eraser",
      Use: "Graphite/Pencil erasing"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('scissors') || p.id?.includes('scissors')) {
    description = "Camlin Scissors are designed for everyday cutting tasks at school, home, office and during craft activities. They provide controlled cutting and are suitable for stationery, paper and general craft work.";
    features = [
      "Suitable for paper and craft cutting",
      "Comfortable to handle",
      "Designed for everyday stationery use",
      "Suitable for school and office use"
    ];
    specs = {
      Brand: p.brand || "Camlin",
      "Product Name": p.name || "Camlin Scissors",
      "Product Type": "Scissors",
      Use: "Paper, stationery and craft cutting"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('sharpener') || p.id?.includes('sharpener')) {
    description = "Classmate Pencil Sharpener is a compact stationery accessory designed for sharpening standard wooden pencils. Its small design makes it convenient for school bags, pencil cases and everyday drawing and writing.";
    features = [
      "Compact design",
      "Easy to carry",
      "Suitable for standard wooden pencils",
      "Suitable for school and drawing use",
      "Convenient pencil-case accessory"
    ];
    specs = {
      Brand: p.brand || "Classmate",
      "Product Name": p.name || "Classmate Pencil Sharpener",
      "Product Type": "Pencil Sharpener",
      Use: "Sharpening wooden pencils"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('ruler') || p.id?.includes('ruler')) {
    description = "Camlin School Ruler is a 30 cm measuring scale designed for accurate measurement and straight-line drawing. It is suitable for school, study, office and everyday stationery use.";
    features = [
      "30 cm length",
      "Clear measurement markings",
      "Suitable for straight-line drawing",
      "Suitable for school and office use",
      "Easy to carry"
    ];
    specs = {
      Brand: p.brand || "Camlin",
      "Product Name": p.name || "School Ruler",
      "Product Type": "Ruler / Scale",
      Length: "30 cm",
      Use: "Measurement and straight-line drawing",
      Markings: "Measurement graduations"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('permanent marker') || p.id?.includes('permanent-marker')) {
    description = "Luxor Permanent Marker is designed for bold, durable marking on a wide range of surfaces. It is suitable for marking materials such as ceramic, metal, fabric, plastic, glass, wood and leather, making it useful for office, school, industrial and general-purpose marking.";
    features = [
      "Permanent marking",
      "Bright, clearly visible ink",
      "Suitable for multiple surfaces",
      "Acrylic tip",
      "Ventilated cap",
      "Suitable for general-purpose marking"
    ];
    specs = {
      Brand: "Luxor",
      "Product Type": "Permanent Marker",
      "Tip Type": "Bullet tip",
      "Line Width": "2.5 mm",
      "Ink Type": "Permanent ink",
      "Writing Length": "250–300 m under standard conditions",
      Use: "Ceramic, metal, fabric, plastic, glass, wood and leather"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('printer paper') || p.name?.toLowerCase().includes('jk copier') || p.id?.includes('printer-paper')) {
    description = "JK Copier A4 paper is designed for everyday printing and photocopying in offices, homes and professional environments. It is suitable for high-volume printing and supports reliable single- and double-sided document printing.";
    features = [
      "Suitable for printing and photocopying",
      "A4 size",
      "Designed for high-speed printing",
      "Suitable for everyday office use",
      "Smooth and reliable paper performance"
    ];
    specs = {
      Brand: "JK Paper",
      "Product Name": "JK Copier",
      "Product Type": "Copier / Printer Paper",
      Size: "A4",
      Use: "Printing and photocopying"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('whiteboard marker') || p.id?.includes('whiteboard-marker')) {
    description = "Camlin Whiteboard Markers are designed for smooth, clearly visible writing on non-porous whiteboard surfaces. The ink is designed to be easily erased, making the markers suitable for classrooms, offices, presentations and everyday whiteboard use.";
    features = [
      "Suitable for whiteboards",
      "Bright and clearly visible ink",
      "Easily erasable",
      "Suitable for classroom and office use",
      "Comfortable marker design"
    ];
    specs = {
      Brand: "Camlin",
      "Product Type": "Whiteboard Marker",
      "Ink Type": "Dry-erase / whiteboard ink",
      Use: "Whiteboard writing and presentations"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('document folder') || p.id?.includes('document-folder')) {
    description = "Solo Document Folder is designed to keep papers and documents organized and protected. Its practical format makes it suitable for storing office documents, reports, forms and everyday paperwork.";
    features = [
      "Helps organize documents",
      "Protects papers from damage",
      "Suitable for office and school use",
      "Easy to carry",
      "Suitable for everyday document storage"
    ];
    specs = {
      Brand: "Solo",
      "Product Type": "Document Folder",
      Use: "Document and paper storage"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('stapler') || p.id?.includes('stapler')) {
    description = "Kangaro Stapler is designed for reliable everyday stapling of documents and papers. Its compact and practical construction makes it suitable for office, school and home use.";
    features = [
      "Reliable stapling",
      "Suitable for office and school use",
      "Practical compact design",
      "Easy staple loading",
      "Suitable for everyday document work"
    ];
    specs = {
      Brand: "Kangaro",
      "Product Type": "Stapler",
      "Country of Origin": "India"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('file folder') || p.id?.includes('file-folder')) {
    description = "Solo File Folder is designed to organize and store documents, papers and office records. Its simple design makes it suitable for school, office and everyday document management.";
    features = [
      "Document organization",
      "Suitable for office records",
      "Suitable for school documents",
      "Easy to store and carry",
      "Helps keep papers organized"
    ];
    specs = {
      Brand: "Solo",
      "Product Type": "File Folder",
      Use: "Document and paper storage"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('punch machine') || p.id?.includes('punch-machine')) {
    description = "Kangaro Punch Machine is designed for making clean, evenly positioned holes in documents for filing and organization. It is suitable for everyday office, school and document-management tasks.";
    features = [
      "Clean hole punching",
      "Suitable for filing documents",
      "Practical office stationery tool",
      "Suitable for school and office use"
    ];
    specs = {
      Brand: "Kangaro",
      "Product Type": "Paper Punch"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('sticky notes') || p.id?.includes('sticky-notes')) {
    description = "Sticky Notes are convenient self-adhesive notes designed for reminders, quick messages, bookmarks and organizing information. They are useful for school, office, study and everyday note-taking.";
    features = [
      "Self-adhesive notes",
      "Easy to write on",
      "Useful for reminders",
      "Suitable for notes and messages"
    ];
    specs = {
      "Product Type": "Sticky Notes",
      Use: "Notes, reminders and organization"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('office register') || p.id?.includes('office-register')) {
    description = "Classmate Office Register is designed for organized everyday writing, record keeping and note-taking. It is suitable for office records, school work, meeting notes and general documentation.";
    features = [
      "Suitable for record keeping",
      "Useful for office and school work",
      "Designed for everyday writing",
      "Practical document organization"
    ];
    specs = {
      Brand: "Classmate",
      "Product Type": "Office Register",
      Use: "Office records and writing"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('paper clips') || p.id?.includes('paper-clips')) {
    description = "Paper Clips are simple stationery accessories used to hold papers and documents together without punching or permanently fastening them. They are useful for offices, schools and everyday document organization.";
    features = [
      "Holds papers together",
      "Reusable",
      "Easy to attach and remove",
      "Suitable for office and school use",
      "Useful for organizing documents"
    ];
    specs = {
      "Product Type": "Paper Clips",
      Use: "Holding and organizing documents"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('envelope') || p.id?.includes('envelope')) {
    description = "Envelope Pack is designed for storing, protecting and organizing documents, letters and papers. It is suitable for office correspondence, school paperwork and everyday document handling.";
    features = [
      "Protects documents",
      "Suitable for letters and papers",
      "Useful for office correspondence",
      "Suitable for school and everyday use",
      "Easy document storage"
    ];
    specs = {
      "Product Type": "Envelope"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('color pencil') || p.name?.toLowerCase().includes('colour pencil') || p.id?.includes('color-pencil') || p.id?.includes('colour-pencil')) {
    description = "Camlin Colour Pencils are designed for smooth and vibrant colouring, sketching and creative artwork. The pencils feature smooth, break-resistant leads and are suitable for school projects, drawing, colouring and general art activities.";
    features = [
      "Bright and vibrant colours",
      "Smooth colouring performance",
      "Break-resistant leads",
      "Comfortable to hold",
      "Suitable for drawing and colouring",
      "Suitable for school and art projects"
    ];
    specs = {
      Brand: "Camlin",
      "Product Type": "Colour Pencils",
      "Pack Type": "Assorted colour set",
      "Lead Type": "Colour pencil lead",
      Use: "Drawing, colouring, sketching and art projects"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('oil pastel') || p.id?.includes('oil-pastel')) {
    description = "Camel Oil Pastels are designed for vibrant and expressive artwork with rich colour application. They are suitable for drawing, colouring, blending and creating textured artwork on paper and other suitable art surfaces.";
    features = [
      "Rich and vibrant colours",
      "Smooth colour application",
      "Suitable for blending",
      "Suitable for drawing and colouring",
      "Ideal for school and creative artwork"
    ];
    specs = {
      Brand: "Camel",
      "Product Type": "Oil Pastels",
      "Number of Shades": "25",
      "Colour Type": "Assorted colours",
      Use: "Drawing, colouring, blending and artwork"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('sketch pen') || p.id?.includes('sketch-pen')) {
    description = "Camlin Sketch Pens are designed for smooth and colourful drawing, outlining, colouring and creative activities. They are suitable for school projects, illustrations, handwriting and general art use.";
    features = [
      "Bright colours",
      "Smooth writing and colouring",
      "Suitable for drawing and outlining",
      "Suitable for school projects",
      "Easy to use"
    ];
    specs = {
      Brand: "Camlin",
      "Product Type": "Sketch Pens",
      Use: "Drawing, colouring, outlining and creative work"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('poster colour') || p.name?.toLowerCase().includes('poster color') || p.id?.includes('poster-colour') || p.id?.includes('poster-color')) {
    description = "Camlin Poster Colours are designed for colourful artwork, school projects, poster making and traditional painting. The range provides vibrant shades suitable for creative and decorative applications.";
    features = [
      "Vibrant colours",
      "Suitable for poster making",
      "Suitable for school projects",
      "Suitable for traditional painting",
      "Suitable for art and craft activities"
    ];
    specs = {
      Brand: "Camlin / Camel",
      "Product Type": "Poster Colours",
      Use: "Painting, poster making, school projects and artwork"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('water colour') || p.name?.toLowerCase().includes('water color') || p.id?.includes('water-colour') || p.id?.includes('water-color')) {
    description = "Camlin Water Colours are designed for smooth and colourful painting on suitable art paper. They are suitable for students, beginners, school projects and everyday creative artwork.";
    features = [
      "Vibrant colour application",
      "Suitable for watercolour painting",
      "Easy to use",
      "Suitable for school projects",
      "Suitable for beginners and art activities"
    ];
    specs = {
      Brand: "Camlin",
      "Product Type": "Water Colour Set",
      "Colour Type": "Assorted shades",
      Use: "Watercolour painting, school projects and artwork"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('drawing book') || p.id?.includes('drawing-book')) {
    description = "Navneet Drawing Book is designed for drawing, colouring and creative artwork. The unruled pages provide a suitable surface for students and artists to practise drawing, sketching and colouring.";
    features = [
      "Unruled drawing pages",
      "Suitable for drawing and colouring",
      "Suitable for school and art activities",
      "Designed for creative practice",
      "Suitable for pencils, crayons and suitable colours depending on paper specification"
    ];
    specs = {
      Brand: "Navneet",
      "Product Type": "Drawing Book",
      Subject: "Art / Craft / Drawing",
      Ruling: "Unruled",
      Use: "Drawing, sketching and colouring"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('craft paper') || p.id?.includes('craft-paper')) {
    description = "Craft Paper Pack provides coloured and decorative sheets for creative projects, school activities, scrapbooking, paper crafts and general art-and-craft work.";
    features = [
      "Suitable for craft projects",
      "Suitable for school activities",
      "Useful for cutting, folding and crafting",
      "Suitable for creative artwork",
      "Multiple colours/designs where shown"
    ];
    specs = {
      "Product Type": "Craft Paper",
      "Paper Type": "Craft paper",
      Use: "Arts, crafts, school projects and decorative work"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('paint brush') || p.id?.includes('paint-brush')) {
    description = "Camel Artist Paint Brushes are designed for painting and creative artwork. The set is suitable for applying paints, creating details and working on different painting techniques depending on the brush shapes and sizes included.";
    features = [
      "Suitable for painting",
      "Multiple brush shapes/sizes where included",
      "Suitable for detailed and general painting",
      "Useful for school and hobby artwork",
      "Suitable for different painting techniques"
    ];
    specs = {
      Brand: "Camel",
      "Product Type": "Artist Paint Brush Set",
      Use: "Painting and artwork"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('plastic file') || p.id?.includes('plastic-file')) {
    description = "Solo A4 Plastic File is designed for storing and organising documents, notes and papers in an easy-to-carry format. Its durable plastic construction makes it suitable for everyday school, college and office use.";
    features = [
      "A4 document compatibility",
      "Durable plastic construction",
      "Lightweight and easy to carry",
      "Helps keep documents organised",
      "Suitable for school, college and office use"
    ];
    specs = {
      Brand: "Solo",
      "Product Type": "A4 Plastic File",
      Size: "A4",
      Material: "Plastic",
      Use: "Document storage and organisation",
      Colour: "Blue"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('button file') || p.id?.includes('button-file')) {
    description = "Solo Button File is a convenient document storage file designed to keep papers and documents organised. The button-style closure helps keep the contents securely inside and makes it suitable for everyday document carrying.";
    features = [
      "Button closure",
      "Easy document organisation",
      "Lightweight design",
      "Suitable for everyday carrying",
      "Suitable for school, college and office documents"
    ];
    specs = {
      Brand: "Solo",
      "Product Type": "Button File",
      Closure: "Button",
      Colour: "Blue",
      Use: "Document storage and organisation"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('ring binder') || p.id?.includes('ring-binder')) {
    description = "Solo Ring Binder File is designed to organise punched documents and papers using a ring mechanism. It is suitable for keeping notes, reports, records and other documents organised for school, college and office use.";
    features = [
      "Ring binder mechanism",
      "Helps organise punched documents",
      "Reusable document organisation",
      "Suitable for notes and records",
      "Suitable for office and educational use"
    ];
    specs = {
      Brand: "Solo",
      "Product Type": "Ring Binder File",
      "Ring Mechanism": "Ring binder",
      Colour: "Blue",
      Use: "Document filing and organisation"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('expanding file') || p.id?.includes('expanding-file')) {
    description = "Solo Expanding File Folder is designed to organise and separate multiple groups of documents in a single portable folder. Its expanding compartments make it useful for storing papers, records and documents that need to be kept organised.";
    features = [
      "Multiple expanding compartments",
      "Helps separate documents",
      "Portable design",
      "Suitable for office and personal organisation",
      "Useful for storing multiple document categories"
    ];
    specs = {
      Brand: "Solo",
      "Product Type": "Expanding File Folder",
      Colour: "White/Blue",
      Use: "Document storage and organisation"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('fx-82ms') || p.id?.includes('82ms') || p.name?.toLowerCase().includes('82ms')) {
    description = "Casio fx-82MS is a scientific calculator designed for mathematical and educational use. It provides a wide range of calculation functions in a compact design and is suitable for students and everyday mathematical work.";
    features = [
      "Scientific calculator",
      "Suitable for educational use",
      "Natural mathematical calculation workflow",
      "Compact design",
      "Easy-to-read display",
      "Suitable for school and college mathematics"
    ];
    specs = {
      Brand: "Casio",
      Model: "fx-82MS",
      "Product Type": "Scientific Calculator",
      Display: "Two-line display",
      Power: "Battery powered",
      Use: "Mathematics and education"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('mj-12d') || p.name?.toLowerCase().includes('mj12d') || p.id?.includes('12d')) {
    description = "Casio MJ-12D is a desktop-style calculator designed for everyday arithmetic and office calculations. Its large display and dedicated calculation keys make it suitable for business, office and general-purpose use.";
    features = [
      "Desktop calculator design",
      "Large easy-to-read display",
      "Suitable for office calculations",
      "Dedicated arithmetic keys",
      "Suitable for everyday calculations",
      "Compact desktop form"
    ];
    specs = {
      Brand: "Casio",
      Model: "MJ-12D",
      "Product Type": "Desktop Calculator",
      Display: "Large display",
      Use: "Office, business and general calculations",
      Features: "Basic arithmetic and business calculation functions"
    };
    rating = 0;
    reviews = 0;
  } else if ((p.name?.toLowerCase().includes('scientific') && p.name?.toLowerCase().includes('calculator')) || p.id?.includes('scientific-calculator')) {
    description = "Casio scientific calculators are designed for advanced mathematical calculations and are suitable for students, education and everyday technical calculations. The calculator provides dedicated functions for scientific and mathematical operations.";
    features = [
      "Scientific calculation functions",
      "Suitable for students",
      "Suitable for mathematical calculations",
      "Dedicated function keys",
      "Compact portable design",
      "Easy-to-read display"
    ];
    specs = {
      Brand: "Casio",
      "Product Type": "Scientific Calculator",
      Functions: "Scientific / mathematical calculations",
      Use: "Education, mathematics and scientific calculations"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('citizen') || p.id?.includes('citizen')) {
    description = "Citizen Basic Calculator is designed for everyday arithmetic and general-purpose calculations. Its straightforward keypad and display make it suitable for home, school, office and routine calculation tasks.";
    features = [
      "Basic arithmetic functions",
      "Easy-to-use keypad",
      "Clear display",
      "Compact design",
      "Suitable for home and office use",
      "Suitable for everyday calculations"
    ];
    specs = {
      Brand: "Citizen",
      "Product Type": "Basic Calculator",
      Functions: "Basic arithmetic calculations",
      Use: "Home, school, office and general calculations"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('basic calculator') || p.name?.toLowerCase() === 'calculator' || p.id?.includes('basic-calculator')) {
    description = "Basic Calculator is designed for everyday arithmetic calculations such as addition, subtraction, multiplication and division. It is suitable for school, home, office and general-purpose use.";
    features = [
      "Basic arithmetic operations",
      "Easy-to-use keypad",
      "Compact design",
      "Suitable for everyday calculations",
      "Suitable for school and office use"
    ];
    specs = {
      ...(p.brand ? { Brand: p.brand } : {}),
      "Product Type": "Basic Calculator",
      Functions: "Addition, subtraction, multiplication and division",
      Use: "General arithmetic calculations"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('pulse notebook') || p.id?.includes('pulse-notebook') || p.name?.toLowerCase().includes('pulse')) {
    description = "Classmate Pulse Notebook is designed for everyday writing, note-taking and school or college work. Its notebook format provides a practical writing surface for students and everyday users.";
    features = [
      "Suitable for everyday writing",
      "Student-friendly notebook",
      "Suitable for school and college use",
      "Practical writing format",
      "Easy to carry"
    ];
    specs = {
      Brand: "Classmate",
      "Product Type": "Notebook",
      Series: "Pulse",
      Use: "School, college and everyday writing"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('youva notebook') || p.id?.includes('youva-notebook') || p.name?.toLowerCase().includes('youva')) {
    description = "Navneet Youva notebooks are designed for regular school, college and everyday writing. The notebook provides a practical format for class notes, assignments and general writing.";
    features = [
      "Suitable for students",
      "Everyday writing",
      "Suitable for school and college",
      "Practical notebook format",
      "Easy to carry"
    ];
    specs = {
      Brand: "Navneet",
      "Product Type": "Notebook",
      Series: "Youva",
      Use: "School, college and everyday writing"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('king size') || p.id?.includes('king-size')) {
    description = "Classmate King Size Notebook is designed for students and everyday note-taking, offering a larger writing format for school, college and general writing needs.";
    features = [
      "King-size format",
      "Suitable for students",
      "Large writing area",
      "Suitable for school and college",
      "Everyday note-taking"
    ];
    specs = {
      Brand: "Classmate",
      "Product Type": "Notebook",
      Format: "King Size",
      Use: "School, college and general writing"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('long notebook') || p.id?.includes('long-notebook')) {
    description = "Classmate Long Notebook is designed for students and everyday writing, providing a practical long-format notebook for class notes, assignments and general use.";
    features = [
      "Long notebook format",
      "Suitable for students",
      "Good writing area",
      "School and college use",
      "Everyday note-taking"
    ];
    specs = {
      Brand: "Classmate",
      "Product Type": "Notebook",
      Format: "Long Notebook",
      Use: "School, college and everyday writing"
    };
    rating = 0;
    reviews = 0;
  } else if ((p.name?.toLowerCase().includes('navneet') && p.name?.toLowerCase().includes('spiral')) || p.id?.includes('navneet-spiral')) {
    description = "Navneet Spiral Notebook is designed for convenient everyday note-taking. Its spiral binding allows the notebook to open easily and is suitable for school, college and general writing.";
    features = [
      "Spiral binding",
      "Convenient note-taking",
      "Suitable for students",
      "Easy to open and use",
      "Suitable for school and college"
    ];
    specs = {
      Brand: "Navneet",
      "Product Type": "Spiral Notebook",
      Binding: "Spiral",
      Use: "School, college and everyday writing"
    };
    rating = 0;
    reviews = 0;
  } else if ((p.name?.toLowerCase().includes('spiral') && p.name?.toLowerCase().includes('a4')) || p.id?.includes('spiral-notebook-a4')) {
    description = "A4 Spiral Notebook provides a practical writing format for notes, assignments, office work and everyday writing. The spiral binding makes the notebook convenient to open and use.";
    features = [
      "A4 format",
      "Spiral binding",
      "Large writing area",
      "Suitable for notes and assignments",
      "Suitable for school, college and office use"
    ];
    specs = {
      ...(p.brand ? { Brand: p.brand } : {}),
      "Product Type": "Spiral Notebook",
      Size: "A4",
      Binding: "Spiral",
      Use: "Notes, assignments, school, college and office work"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('hardbound') || p.id?.includes('hardbound')) {
    description = "Hardbound Notebook features a rigid cover designed to provide a durable writing format for notes, journaling, office work and everyday use.";
    features = [
      "Hardbound cover",
      "Durable notebook format",
      "Suitable for notes",
      "Suitable for journaling",
      "Suitable for office and everyday use"
    ];
    specs = {
      ...(p.brand ? { Brand: p.brand } : {}),
      "Product Type": "Hardbound Notebook",
      Binding: "Hardbound",
      Cover: "Hard cover",
      Use: "Notes, journaling, office and everyday writing"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('project notebook') || p.id?.includes('project-notebook')) {
    description = "A4 Project Notebook provides a larger writing and project-work format suitable for school projects, assignments, planning and general note-taking.";
    features = [
      "A4 format",
      "Suitable for project work",
      "Large writing area",
      "Suitable for assignments",
      "School and college use"
    ];
    specs = {
      ...(p.brand && p.brand.toLowerCase() === 'navneet' ? { Brand: "Navneet" } : p.brand ? { Brand: p.brand } : {}),
      "Product Type": "Project Notebook",
      Size: "A4",
      Use: "Projects, assignments and note-taking"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase().includes('pocket notebook') || p.id?.includes('pocket-notebook')) {
    description = "Pocket Notebook is a compact notebook designed for quick notes, reminders, lists and everyday writing. Its small format makes it convenient to carry.";
    features = [
      "Compact size",
      "Portable design",
      "Suitable for quick notes",
      "Suitable for reminders and lists",
      "Easy to carry"
    ];
    specs = {
      ...(p.brand ? { Brand: p.brand } : {}),
      "Product Type": "Pocket Notebook",
      Format: "Pocket",
      Use: "Notes, reminders, lists and everyday writing"
    };
    rating = 0;
    reviews = 0;
  } else if (p.name?.toLowerCase() === 'classmate notebook' || p.id?.includes('classmate-notebook') || (p.name?.toLowerCase().includes('classmate') && p.name?.toLowerCase().includes('notebook'))) {
    description = "Classmate Notebook is a practical notebook for everyday writing, note-taking, schoolwork and general use.";
    features = [
      "Everyday writing",
      "Suitable for students",
      "School and college use",
      "Practical design",
      "Easy to carry"
    ];
    specs = {
      Brand: "Classmate",
      "Product Type": "Notebook",
      Use: "School, college and everyday writing"
    };
    rating = 0;
    reviews = 0;
  }

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
    description,
    features,
    specs,
    variants,
  };
}

export async function fetchSupabaseProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Supabase fetch error:", error.message);
      throw error;
    }
    if (!data || data.length === 0) {
      setProductsCache([]);
      return [];
    }
    
    const seenNames = new Set<string>();
    const filteredData = (data as SupabaseProduct[]).filter((p) => {
      const n = (p.name || "").toLowerCase().trim();
      const c = (p.category || "").toLowerCase();
      const id = (p.id || "").toLowerCase();
      if (
        c === "books" ||
        n.includes("python") ||
        n.includes("data structure") ||
        n.includes("engineering math") ||
        n.includes("exam guide") ||
        n.includes("robotics") ||
        n.includes("mini stapler") ||
        id.includes("mini-stapler") ||
        n.includes("oil pastel set") ||
        (n.includes("oil pastel") && n.includes("24")) ||
        id.includes("oil-pastel")
      ) {
        return false;
      }

      if (seenNames.has(n)) {
        return false;
      }
      seenNames.add(n);

      return true;
    });

    const mapped = filteredData.map(mapSupabaseProduct);
    setProductsCache(mapped);
    return mapped;
  } catch (err) {
    console.error("Supabase fetch exception:", err);
    throw err;
  }
}

export function useSupabaseProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const res = await fetchSupabaseProducts();
      setData(res);
    } catch (err: any) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, isLoading, isError, error, refetch: fetch };
}
