import imgPens from "@/assets/cat-pens.jpg";
import imgNotebooks from "@/assets/cat-notebooks.jpg";
import imgBooks from "@/assets/cat-books.jpg";
import imgArt from "@/assets/cat-art.jpg";
import imgSchool from "@/assets/cat-school.jpg";
import imgFiles from "@/assets/cat-files.jpg";
import imgCalc from "@/assets/cat-calculators.jpg";
import imgBags from "@/assets/cat-bags.jpg";
import imgHighlighters from "@/assets/cat-highlighters.jpg";
import imgSticky from "@/assets/cat-sticky.jpg";
import imgPaper from "@/assets/cat-paper.jpg";
import imgTools from "@/assets/cat-office-tools.jpg";

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
  services: ["In-store Shopping", "Delivery", "Printing", "Photocopy", "Binding"],
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
  stock: boolean;
  author?: string | undefined;
  bookCategory?: string | undefined;
  tags?: string[] | undefined;
  description?: string | undefined;
  specs?: Record<string, string> | undefined;
};

export const CATEGORIES = [
  { slug: "books", name: "Books", count: 420, image: imgBooks },
  { slug: "pens-pencils", name: "Pens & Pencils", count: 310, image: imgPens },
  { slug: "notebooks", name: "Notebooks", count: 265, image: imgNotebooks },
  { slug: "school-supplies", name: "School Supplies", count: 198, image: imgSchool },
  { slug: "office-supplies", name: "Office Supplies", count: 240, image: imgTools },
  { slug: "art-craft", name: "Art & Craft", count: 176, image: imgArt },
  { slug: "files-folders", name: "Files & Folders", count: 132, image: imgFiles },
  { slug: "calculators", name: "Calculators", count: 48, image: imgCalc },
  { slug: "bags", name: "Bags", count: 64, image: imgBags },
  { slug: "exam-essentials", name: "Exam Essentials", count: 87, image: imgSticky },
];

export const CATEGORY_NAME: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.name]),
);

const IMG: Record<string, string> = {
  pens: imgPens,
  notebooks: imgNotebooks,
  books: imgBooks,
  art: imgArt,
  school: imgSchool,
  files: imgFiles,
  calc: imgCalc,
  bags: imgBags,
  highlighters: imgHighlighters,
  sticky: imgSticky,
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
  img: keyof typeof IMG,
  tags?: string,
];

const RAW: Raw[] = [
  ["reynolds-trimax", "Reynolds Trimax Gel Pen (Pack of 5)", "Reynolds", "pens-pencils", 49, 60, 4.4, 1284, "pens", "flash,best,student"],
  ["classmate-notebook", "Classmate Long Notebook 172 Pages", "Classmate", "notebooks", 69, 90, 4.3, 2410, "notebooks", "flash,best,student"],
  ["geometry-box", "Camlin Geometry Box Deluxe", "Camlin", "school-supplies", 119, 150, 4.2, 640, "school", "flash,student,exam"],
  ["cello-butterflow", "Cello Butterflow Ball Pen (Pack of 10)", "Cello", "pens-pencils", 32, 40, 4.1, 908, "pens", "flash,best,student"],
  ["a4-notebook", "A4 Hardbound Notebook 300 Pages", "Navneet", "notebooks", 89, 120, 4.5, 512, "notebooks", "flash,best,student"],
  ["parker-jotter", "Parker Jotter Standard Ball Pen", "Parker", "pens-pencils", 449, 550, 4.7, 386, "pens", "best"],
  ["apsara-pencils", "Apsara Platinum Pencils (Pack of 10)", "Apsara", "pens-pencils", 55, 70, 4.4, 1740, "school", "best,student"],
  ["faber-highlighter", "Faber-Castell Textliner Highlighters (Set of 5)", "Faber-Castell", "office-supplies", 145, 190, 4.6, 428, "highlighters", "best,student,office"],
  ["casio-fx991", "Casio FX-991EX Scientific Calculator", "Casio", "calculators", 1199, 1495, 4.8, 1122, "calc", "best,student,exam"],
  ["sticky-notes", "Sticky Notes Neon Pads (Pack of 6)", "3M Post-it", "office-supplies", 179, 240, 4.5, 690, "sticky", "best,student,office,exam"],
  ["classmate-record", "Classmate Record Book 120 Pages", "Classmate", "notebooks", 79, 99, 4.2, 305, "notebooks", "student,exam"],
  ["a4-printer-paper", "A4 Printer Paper 75 GSM (500 Sheets)", "JK Copier", "office-supplies", 329, 420, 4.6, 2140, "paper", "best,office"],
  ["kangaro-stapler", "Kangaro HD-10D Stapler with Pins", "Kangaro", "office-supplies", 139, 175, 4.4, 812, "tools", "best,office"],
  ["paper-clips", "Paper Clips Assorted (Box of 100)", "Solo", "office-supplies", 45, 60, 4.0, 220, "tools", "office"],
  ["ring-binder", "Ring Binder File A4 (Pack of 3)", "Solo", "files-folders", 265, 340, 4.3, 356, "files", "office,student"],
  ["clip-file", "Clip File Board A4 (Pack of 5)", "Solo", "files-folders", 199, 260, 4.1, 174, "files", "office,student"],
  ["display-folder", "Display Folder 20 Pockets", "Solo", "files-folders", 129, 165, 4.2, 141, "files", "office,student"],
  ["watercolor-set", "Camel Watercolour Cakes (12 Shades)", "Camel", "art-craft", 89, 110, 4.4, 980, "art", "best,art"],
  ["brush-set", "Artist Paint Brush Set (Set of 10)", "Camel", "art-craft", 165, 220, 4.3, 402, "art", "art"],
  ["color-pencils", "Faber-Castell Colour Pencils (24 Shades)", "Faber-Castell", "art-craft", 189, 245, 4.6, 1290, "art", "best,art,student"],
  ["chart-paper", "Chart Paper Assorted (Pack of 10)", "Navneet", "art-craft", 99, 130, 4.1, 118, "paper", "art"],
  ["project-file", "Project Report File with Spiral Sheets", "Clip N Copy", "school-supplies", 89, 120, 4.3, 264, "files", "student,exam"],
  ["exam-pad", "Exam Writing Pad with Clip", "Solo", "exam-essentials", 145, 190, 4.4, 375, "files", "exam,student"],
  ["graph-book", "Graph Book A4 (Pack of 2)", "Navneet", "exam-essentials", 78, 95, 4.2, 205, "notebooks", "exam,student"],
  ["drawing-book", "Drawing Book Spiral A3", "Navneet", "art-craft", 119, 150, 4.3, 188, "notebooks", "art,student"],
  ["school-bag", "Student Backpack 30L Water Resistant", "Skybags", "bags", 1299, 1899, 4.5, 745, "bags", "best,student"],
  ["laptop-bag", "Office Laptop Backpack 15.6\"", "American Tourister", "bags", 1799, 2599, 4.6, 512, "bags", "best,office"],
  ["engineering-drawing", "Engineering Drawing Textbook", "Charotar", "books", 389, 495, 4.6, 890, "books", "book:Engineering,best"],
  ["let-us-c", "Let Us C — Programming Fundamentals", "BPB", "books", 349, 450, 4.5, 1520, "books", "book:Programming,best"],
  ["robotics-basics", "Introduction to Robotics", "Pearson", "books", 599, 799, 4.4, 240, "books", "book:Robotics"],
  ["ncert-science", "School Science Reference Guide Class 10", "Navneet", "books", 289, 350, 4.3, 640, "books", "book:School,student"],
  ["gate-guide", "Competitive Exam Complete Guide 2026", "Arihant", "books", 549, 725, 4.4, 1090, "books", "book:Competitive Exams,exam"],
  ["fiction-novel", "The Quiet Monsoon — A Novel", "Penguin", "books", 299, 399, 4.5, 430, "books", "book:Fiction"],
  ["non-fiction-history", "India After Midnight — Non-Fiction", "HarperCollins", "books", 419, 550, 4.6, 355, "books", "book:Non-Fiction"],
  ["business-book", "Business Strategy Essentials", "Wiley", "books", 469, 620, 4.3, 210, "books", "book:Business,office"],
  ["self-dev", "Deep Focus — Habits That Compound", "Random House", "books", 329, 450, 4.7, 1860, "books", "book:Self Development,best"],
  ["whiteboard-marker", "Whiteboard Markers (Pack of 4)", "Camlin", "office-supplies", 129, 160, 4.3, 318, "highlighters", "office"],
  ["permanent-marker", "Permanent Markers Black (Pack of 10)", "Luxor", "office-supplies", 199, 250, 4.4, 260, "highlighters", "office"],
  ["envelopes", "Brown Envelopes A4 (Pack of 50)", "Solo", "office-supplies", 189, 240, 4.2, 132, "paper", "office"],
  ["register-long", "Long Register 400 Pages", "Navneet", "office-supplies", 209, 265, 4.4, 288, "notebooks", "office"],
  ["labels", "Self Adhesive Labels (Pack of 500)", "Solo", "office-supplies", 149, 195, 4.1, 96, "sticky", "office"],
  ["eraser-sharpener", "Eraser & Sharpener Combo Pack", "Apsara", "school-supplies", 59, 80, 4.2, 402, "school", "student"],
  ["scale-set", "Steel Ruler & Scale Set", "Camlin", "school-supplies", 69, 90, 4.1, 175, "school", "student"],
  ["gel-pen-blue", "Gel Pens Blue Fine Tip (Pack of 20)", "Linc", "pens-pencils", 189, 250, 4.5, 1440, "pens", "best,student"],
  ["mechanical-pencil", "Mechanical Pencil 0.5mm with Leads", "Uni-ball", "pens-pencils", 129, 165, 4.5, 520, "pens", "student"],
];

export const PRODUCTS: Product[] = RAW.map(
  ([id, name, brand, category, price, mrp, rating, reviews, img, tags]) => {
    const tagList = (tags ?? "").split(",").filter(Boolean);
    const bookTag = tagList.find((t) => t.startsWith("book:"));
    return {
      id,
      name,
      brand,
      category,
      price,
      mrp,
      rating,
      reviews,
      image: IMG[img]!,
      stock: true,
      bookCategory: bookTag?.slice(5),
      author: category === "books" ? brand : undefined,
      tags: tagList,
      description: `${name} from ${brand}, stocked at Clip N Copy Kundalahalli. Hand-picked for students and professionals — checked for quality before it reaches the shelf. Available for in-store pickup or same-day delivery around ITPL Main Road.`,
      specs: {
        Brand: brand,
        Category: CATEGORY_NAME[category] ?? category,
        SKU: `CNC-${id.toUpperCase().slice(0, 10)}`,
        Packaging: "Sealed retail pack",
        Warranty: "Manufacturer defect replacement",
        Delivery: "Same day within 5 km",
      },
    };
  },
);

export const discountOf = (p: Product) => Math.round(((p.mrp - p.price) / p.mrp) * 100);
export const byId = (id: string) => PRODUCTS.find((p) => p.id === id);
export const withTag = (tag: string) => PRODUCTS.filter((p) => p.tags?.includes(tag));
export const inCategory = (slug: string) => PRODUCTS.filter((p) => p.category === slug);

export const BRANDS = Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort();

export const BOOK_CATEGORIES = [
  "Engineering",
  "Programming",
  "Robotics",
  "School",
  "Competitive Exams",
  "Fiction",
  "Non-Fiction",
  "Business",
  "Self Development",
];

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
  { name: "B&W Printing", price: "Starting from ₹2/page", note: "Crisp laser prints, any volume" },
  { name: "Color Printing", price: "Starting from ₹5/page", note: "Laser colour printout & xerox" },
  { name: "Photocopy", price: "Fast document copies", note: "Jumbo xerox up to A0" },
  { name: "Spiral Binding", price: "Professional binding", note: "Spiral, comb & thesis binding" },
  { name: "Project Printing", price: "Perfect for college projects", note: "AutoCAD prints & lamination" },
  { name: "Resume Printing", price: "Professional-quality printing", note: "Premium bond paper" },
];

export const POPULAR_SEARCHES = [
  "Notebooks",
  "Pens",
  "Calculators",
  "Engineering Books",
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
