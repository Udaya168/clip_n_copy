import imgPens from "@/assets/cat-pens.webp";
import imgNotebooks from "@/assets/cat-notebooks.webp";
import imgArt from "@/assets/cat-art.webp";
import imgSchool from "@/assets/cat-school.webp";
import imgFiles from "@/assets/cat-files.webp";
import imgCalc from "@/assets/cat-calculators.webp";
import imgHighlighters from "@/assets/cat-highlighters.webp";
import imgPaper from "@/assets/cat-paper.webp";
import imgTools from "@/assets/cat-office-tools.webp";

export const STORE = {
  name: "Clip N Copy",
  tagline: "Total solutions in stationery & xerox",
  rating: 4.0,
  reviews: 763,
  phone: "099860 55335",
  phoneRaw: "09986055335",
  whatsapp: "919986055335",
  address:
    "Shop No. 171, 3rd Cross, 3rd Main, ITPL Main Rd, Kundalahalli Colony, Bengaluru, Karnataka 560037",
  hours: "Mon – Sun · 9:00 AM – 9:30 PM",
  services: ["In-store Shopping", "Delivery", "Printing", "Customization Printing", "Binding"],
};

export type ProductVariant = {
  name: string; // e.g. Blue, Black, Red
  images: string[];
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  image: string;
  stock: number;
  author?: string | undefined;
  bookCategory?: string | undefined;
  tags?: string[] | undefined;
  description?: string | undefined;
  features?: string[] | undefined;
  specs?: Record<string, string> | undefined;
  variants?: ProductVariant[] | undefined;
};

export const RAW_CATEGORIES = [
  { slug: "pens-pencils", name: "Stationery", image: imgPens },
  { slug: "notebooks", name: "Notebook", image: imgNotebooks },
  { slug: "school-supplies", name: "School Supplies", image: imgSchool },
  { slug: "office-supplies", name: "Office Supplies", image: imgTools },
  { slug: "art-craft", name: "Art & Craft", image: imgArt },
  { slug: "files-folders", name: "Files & Folders", image: imgFiles },
  { slug: "calculators", name: "Calculators", image: imgCalc },
];

export const CATEGORY_NAME: Record<string, string> = Object.fromEntries(
  RAW_CATEGORIES.map((c) => [c.slug, c.name]),
);

const IMG: Record<string, string> = {
  pens: imgPens,
  notebooks: imgNotebooks,
  art: imgArt,
  school: imgSchool,
  files: imgFiles,
  calc: imgCalc,
  highlighters: imgHighlighters,
  paper: imgPaper,
  tools: imgTools,
};

type Raw = [
  id: string,
  name: string,
  brand: string,
  category: string,
  price: number,
  mrp: number,
  rating: number,
  reviews: number,
  img: string, // Changed to string to allow direct paths
  tags?: string,
];

const RAW: Raw[] = [
  [
    "kangaro-stapler",
    "Kangaro Stapler",
    "Kangaro",
    "office-supplies",
    89,
    120,
    4.5,
    312,
    "/products/stapler.webp",
    "office,best",
  ],
  [
    "camlin-school-ruler-30cm",
    "Camlin School Ruler 30cm",
    "Camlin",
    "school-supplies",
    20,
    25,
    4.2,
    120,
    "/products/school-ruler-30cm.webp",
    "school,best",
  ],
  [
    "classmate-premium-pencil-box",
    "Classmate Premium Pencil Box",
    "Classmate",
    "school-supplies",
    149,
    200,
    4.6,
    512,
    "/products/premium-pencil-box.webp",
    "school,best",
  ],
  [
    "generic-sticky-notes",
    "Generic Sticky Notes",
    "Generic",
    "office-supplies",
    59,
    80,
    4.1,
    410,
    "/products/sticky-notes.webp",
    "office,best",
  ],
  [
    "navneet-youva-notebook",
    "Navneet Youva Notebook",
    "Navneet",
    "notebooks",
    65,
    65,
    4.8,
    850,
    "/products/navneet-youva-notebook.webp",
    "school,best",
  ],
  [
    "camlin-scissors",
    "Camlin Scissors",
    "Camlin",
    "school-supplies",
    55,
    70,
    4.3,
    289,
    "/products/camlin-scissors.webp",
    "office,school,best",
  ],
  [
    "camlin-geometry-box",
    "Camlin Geometry Box",
    "Camlin",
    "school-supplies",
    110,
    120,
    4.5,
    430,
    "/products/geometry-box.webp",
    "school,best",
  ],
  [
    "solo-document-folder",
    "Solo Document Folder",
    "Solo",
    "files-folders",
    35,
    40,
    4.4,
    190,
    "/products/document-folder.webp",
    "office,best",
  ],
  [
    "casio-basic-calculator",
    "Casio Basic Calculator",
    "Casio",
    "calculators",
    299,
    350,
    4.7,
    670,
    "/products/basic-calculator.webp",
    "office,school,best",
  ],
  [
    "jk-copier-a4-printer-paper",
    "JK Copier A4 Printer Paper",
    "JK Copier",
    "office-supplies",
    320,
    350,
    4.9,
    1400,
    "/products/a4-printer-paper.webp",
    "office,best",
  ],
  [
    "apsara-drawing-pencil-pack",
    "Apsara Drawing Pencil Pack",
    "Apsara",
    "art-craft",
    55,
    60,
    4.6,
    315,
    "/products/apsara.webp",
    "art,school,best",
  ],
  [
    "generic-office-register",
    "Generic Office Register",
    "Generic",
    "office-supplies",
    45,
    50,
    4.2,
    215,
    "/products/office-register.webp",
    "office,best",
  ],
  [
    "clip-file",
    "Clip File Board A4 (Pack of 5)",
    "Solo",
    "files-folders",
    199,
    260,
    4.1,
    174,
    "files",
    "office,student",
  ],
  [
    "display-folder",
    "Display Folder 20 Pockets",
    "Solo",
    "files-folders",
    129,
    165,
    4.2,
    141,
    "files",
    "office,student",
  ],
  [
    "watercolor-set",
    "Camel Watercolour Cakes (12 Shades)",
    "Camel",
    "art-craft",
    89,
    110,
    4.4,
    980,
    "art",
    "best,art",
  ],
  [
    "brush-set",
    "Artist Paint Brush Set (Set of 10)",
    "Camel",
    "art-craft",
    165,
    220,
    4.3,
    402,
    "art",
    "art",
  ],
  [
    "color-pencils",
    "Faber-Castell Colour Pencils (24 Shades)",
    "Faber-Castell",
    "art-craft",
    189,
    245,
    4.6,
    1290,
    "art",
    "best,art,student",
  ],
  [
    "chart-paper",
    "Chart Paper Assorted (Pack of 10)",
    "Navneet",
    "art-craft",
    99,
    130,
    4.1,
    118,
    "paper",
    "art",
  ],
  [
    "project-file",
    "Project Report File with Spiral Sheets",
    "Clip N Copy",
    "school-supplies",
    89,
    120,
    4.3,
    264,
    "files",
    "student,exam",
  ],
  [
    "exam-pad",
    "Exam Writing Pad with Clip",
    "Solo",
    "exam-essentials",
    145,
    190,
    4.4,
    375,
    "files",
    "exam,student",
  ],
  [
    "graph-book",
    "Graph Book A4 (Pack of 2)",
    "Navneet",
    "exam-essentials",
    78,
    95,
    4.2,
    205,
    "notebooks",
    "exam,student",
  ],
  [
    "drawing-book",
    "Drawing Book Spiral A3",
    "Navneet",
    "art-craft",
    119,
    150,
    4.3,
    188,
    "notebooks",
    "art,student",
  ],
  [
    "school-bag",
    "Student Backpack 30L Water Resistant",
    "Skybags",
    "bags",
    1299,
    1899,
    4.5,
    745,
    "bags",
    "best,student",
  ],
  [
    "laptop-bag",
    'Office Laptop Backpack 15.6"',
    "American Tourister",
    "bags",
    1799,
    2599,
    4.6,
    512,
    "bags",
    "best,office",
  ],
  [
    "whiteboard-marker",
    "Whiteboard Markers (Pack of 4)",
    "Camlin",
    "office-supplies",
    129,
    160,
    4.3,
    318,
    "highlighters",
    "office",
  ],
  [
    "permanent-marker",
    "Permanent Markers Black (Pack of 10)",
    "Luxor",
    "office-supplies",
    199,
    250,
    4.4,
    260,
    "highlighters",
    "office",
  ],
  [
    "envelopes",
    "Brown Envelopes A4 (Pack of 50)",
    "Solo",
    "office-supplies",
    189,
    240,
    4.2,
    132,
    "paper",
    "office",
  ],
  [
    "register-long",
    "Long Register 400 Pages",
    "Navneet",
    "office-supplies",
    209,
    265,
    4.4,
    288,
    "notebooks",
    "office",
  ],
  [
    "labels",
    "Self Adhesive Labels (Pack of 500)",
    "Solo",
    "office-supplies",
    149,
    195,
    4.1,
    96,
    "sticky",
    "office",
  ],
  [
    "eraser-sharpener",
    "Eraser & Sharpener Combo Pack",
    "Apsara",
    "school-supplies",
    59,
    80,
    4.2,
    402,
    "school",
    "student",
  ],
  [
    "scale-set",
    "Steel Ruler & Scale Set",
    "Camlin",
    "school-supplies",
    69,
    90,
    4.1,
    175,
    "school",
    "student",
  ],
  [
    "gel-pen-blue",
    "Gel Pens Blue Fine Tip (Pack of 20)",
    "Linc",
    "pens-pencils",
    189,
    250,
    4.5,
    1440,
    "pens",
    "best,student",
  ],
  [
    "mechanical-pencil",
    "Mechanical Pencil 0.5mm with Leads",
    "Uni-ball",
    "pens-pencils",
    129,
    165,
    4.5,
    520,
    "pens",
    "student",
  ],
];

export const INITIAL_PRODUCTS: Product[] = RAW.map(
  ([id, name, brand, category, price, mrp, rating, reviews, imgKey, tagsStr]) => {
    let variants: ProductVariant[] | undefined;
    let description = `${name} by ${brand}`;
    let specs: Record<string, string> = {
      Brand: brand,
      Category: category,
      SKU: `CNC-${id.toUpperCase()}`,
      Stock: "In Stock",
    };

    let features: string[] | undefined;

    if (id === "reynolds-trimax") {
      variants = [
        {
          name: "Blue",
          images: [
            "/products/trimax-blue-1.webp",
            "/products/trimax-blue-2.webp",
            "/products/trimax-blue-3.webp",
            "/products/trimax-blue-4.webp",
          ],
        },
        {
          name: "Black",
          images: [
            "/products/trimax-black-1.webp",
          ],
        },
        {
          name: "Red",
          images: [
            "/products/trimax-red-1.webp",
          ],
        },
      ];
      description = "Reynolds Trimax is designed with advanced fluid ink technology to provide a smooth and precise writing experience. Its ink flows smoothly across the page and is designed for consistent writing performance during long writing sessions. Trimax is suitable for everyday writing, school, college and office use.";
      features = [
        "Advanced fluid ink technology",
        "Smooth writing experience",
        "Precise writing performance",
        "Designed for long writing sessions",
        "Waterproof ink",
        "Fine 0.5 mm tip",
        "Suitable for school, college and office use",
        "Available in multiple colours",
      ];
      specs = {
        Brand: "Reynolds",
        Product: "Trimax",
        "Product Type": "Roller Ball Pen",
        "Tip Size": "0.5 mm",
        "Tip Type": "Fine",
        "Ink Technology": "Advanced Fluid Ink Technology",
        Ink: "Waterproof",
        "Ink Colour": "Selected Colour",
        "Body Material": "Plastic",
        Refillable: "Yes",
        "Suitable For": "School, College, Office and Everyday Writing",
        "Available Colours": "Blue, Black, Red"
      };
    }

    return {
      id,
      name,
      brand,
      category,
      price,
      mrp,
      rating,
      reviews,
      image: imgKey.startsWith("/") ? imgKey : (IMG[imgKey] || imgNotebooks),
      stock: 50,
      tags: tagsStr ? tagsStr.split(",") : [],
      description,
      features,
      specs,
      variants,
    };
  },
);

export let PRODUCTS: Product[] = INITIAL_PRODUCTS;

type ProductsListener = () => void;
const productsListeners: ProductsListener[] = [];

export function subscribeProducts(listener: ProductsListener) {
  productsListeners.push(listener);
  return () => {
    const idx = productsListeners.indexOf(listener);
    if (idx !== -1) productsListeners.splice(idx, 1);
  };
}

export function setProductsCache(newProducts: Product[]) {
  PRODUCTS = newProducts.length > 0 ? newProducts : INITIAL_PRODUCTS;
  const updated = getCategories(PRODUCTS);
  CATEGORIES.length = 0;
  CATEGORIES.push(...updated);
  productsListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

export const discountOf = (p: Product) =>
  p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

export const byId = (id: string): Product | undefined => {
  if (!id) return undefined;
  const cleanId = String(id).trim().toLowerCase();

  // 1. Exact ID match or lowercased ID match in current PRODUCTS cache
  let found = PRODUCTS.find((p) => String(p.id).toLowerCase() === cleanId);
  if (found) return found;

  // 2. Check if ID matches a static item in INITIAL_PRODUCTS
  const initItem = INITIAL_PRODUCTS.find((p) => String(p.id).toLowerCase() === cleanId);
  if (initItem) {
    // Try finding mapped product in PRODUCTS by matching name
    found = PRODUCTS.find((p) => p.name.toLowerCase() === initItem.name.toLowerCase());
    if (found) return found;
    return initItem;
  }

  // 3. Match by product name or partial name in current PRODUCTS cache
  found = PRODUCTS.find((p) => p.name.toLowerCase() === cleanId || p.name.toLowerCase().includes(cleanId));
  if (found) return found;

  return undefined;
};

export const withTag = (tag: string) => PRODUCTS.filter((p) => p.tags?.includes(tag));
export const inCategory = (slug: string) => PRODUCTS.filter((p) => p.category === slug);

export const getBrands = (productsList: Product[] = PRODUCTS) =>
  Array.from(new Set(productsList.map((p) => p.brand))).sort();
export const getCategories = (productsList: Product[] = PRODUCTS) =>
  RAW_CATEGORIES.map((c) => ({
    ...c,
    count: productsList.filter((p) => p.category === c.slug).length,
  }));

export const BRANDS = getBrands();
export const CATEGORIES: { slug: string; name: string; image: string; count: number }[] =
  getCategories();

export const STUDENT_ESSENTIALS = [
  "Notebooks",
  "Pens",
  "Pencils",
  "Highlighters",
  "Geometry Boxes",
  "Calculators",
  "Files",
  "Sticky Notes",
  "Record Books",
  "Project Materials",
];

export const OFFICE_ESSENTIALS = [
  "Printer Paper",
  "Files",
  "Folders",
  "Staplers",
  "Markers",
  "Sticky Notes",
  "Registers",
  "Envelopes",
  "Paper Clips",
  "Labels",
];

export const PRINT_SERVICES = [
  { name: "Printing", price: "High quality document printing", note: "Print your documents with custom settings" },
  { name: "Customization Printing", price: "Custom printing services", note: "Customize your requirements: Brochure, Banner, ID Card & Magazine" },
];

export const POPULAR_SEARCHES = [
  "Notebooks",
  "Pens",
  "Calculators",
  "Art Supplies",
];

export const REVIEWS = [
  {
    name: "Arjun Menon",
    rating: 5,
    date: "12 Jul 2026",
    text: "Best service and a variety of products available at good prices.",
    verified: true,
  },
  {
    name: "Sneha Rao",
    rating: 4,
    date: "28 Jun 2026",
    text: "Nice place to get all your stationery stuff at good price.",
    verified: true,
  },
  {
    name: "Karthik S",
    rating: 4,
    date: "09 Jun 2026",
    text: "Good variety of stationery and printing services.",
    verified: true,
  },
  {
    name: "Priya Nair",
    rating: 4,
    date: "22 May 2026",
    text: "Got my whole project printed and spiral bound in 20 minutes. Very helpful staff.",
    verified: true,
  },
];

export const OFFERS = [
  {
    id: "flat30",
    title: "Up to 30% OFF",
    sub: "Sitewide savings on stationery favourites",
    tone: "primary" as const,
    tag: "flash",
  },
  {
    id: "student",
    title: "Student Deals",
    sub: "Extra savings on notebooks, pens and exam kits",
    tone: "accent" as const,
    tag: "student",
  },
  {
    id: "college",
    title: "Back to College",
    sub: "Everything for the new semester in one cart",
    tone: "ink" as const,
    tag: "exam",
  },
  {
    id: "office",
    title: "Office Deals",
    sub: "Bulk paper, files and desk supplies",
    tone: "primary" as const,
    tag: "office",
  },
  {
    id: "bulk",
    title: "Buy More, Save More",
    sub: "Save up to ₹500 on orders above ₹1,999",
    tone: "accent" as const,
    tag: "best",
  },
];
