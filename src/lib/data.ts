import {
  Utensils,
  Shirt,
  Laptop,
  Sparkles,
  BookOpen,
  Printer,
  Camera,
  Layers,
  Home,
  ShoppingBasket,
  Scissors,
  LucideIcon,
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  icon: LucideIcon;
  image: string;
  color?: {
    bg: string;
    text: string;
  };
}

export interface CampusLocation {
  id: string;
  name: string;
}

export const campusLocations: CampusLocation[] = [
  { id: "ho-central", name: "Ho Central / Main Market" },
  { id: "bankoe", name: "Bankoe" },
  { id: "heve", name: "Heve" },
  { id: "dome", name: "Dome" },
  { id: "ahoe", name: "Ahoe" },
  { id: "fiave", name: "Fiave" },
  { id: "kpodzi", name: "Kpodzi" },
  { id: "htu-poly", name: "HTU / Poly Area" },
  { id: "barracks-airport", name: "Barracks / Airport Area" },
  { id: "sokode", name: "Sokode / Main Campus Area" },
  { id: "trafalgar", name: "Trafalgar / Ho Teaching Hospital" },
  { id: "dave", name: "Dave Campus & Surroundings" },
  { id: "lokoe", name: "Lokoe" },
  { id: "adaklu", name: "Adaklu / Border Hostels" },
  { id: "taviefe-anyirawase", name: "Taviefe / Anyirawase Road" },
  { id: "ho-wide", name: "Across Ho (Delivery Available)" },
];

export const ALL_CATEGORY_IMAGE = "/categories/all.jpg";

export const categories: Category[] = [
  {
    id: "hostels",
    name: "Hostels & Accommodations",
    shortName: "Hostels",
    description: "Student hostels, homestays, self-contain rooms & shared apartments",
    icon: Home,
    image: "/categories/hostels.jpg",
    color: {
      bg: "bg-indigo-50 dark:bg-indigo-950/60",
      text: "text-indigo-600 dark:text-indigo-400",
    },
  },
  {
    id: "food",
    name: "Food & Drinks",
    shortName: "Food",
    description: "Campus meals, snacks, smoothies, chops & fast food",
    icon: Utensils,
    image: "/categories/food.jpg",
    color: {
      bg: "bg-orange-50 dark:bg-orange-950/60",
      text: "text-orange-600 dark:text-orange-400",
    },
  },
  {
    id: "groceries",
    name: "Groceries & Essentials",
    shortName: "Groceries",
    description: "Provisions, toiletries, bottled water, snacks & daily dorm needs",
    icon: ShoppingBasket,
    image: "/categories/groceries.jpg",
    color: {
      bg: "bg-emerald-50 dark:bg-emerald-950/60",
      text: "text-emerald-600 dark:text-emerald-400",
    },
  },
  {
    id: "salons-barbers",
    name: "Salons & Barbers",
    shortName: "Salons",
    description: "Hair styling, braiding, dreadlocks, fades, barbering & wig revamping",
    icon: Scissors,
    image: "/categories/salons-barbers.jpg",
    color: {
      bg: "bg-pink-50 dark:bg-pink-950/60",
      text: "text-pink-600 dark:text-pink-400",
    },
  },
  {
    id: "fashion",
    name: "Fashion & Wears",
    shortName: "Fashion",
    description: "Clothing, thrift shoes, sneakers, watches, bags & accessories",
    icon: Shirt,
    image: "/categories/fashion.jpg",
    color: {
      bg: "bg-purple-50 dark:bg-purple-950/60",
      text: "text-purple-600 dark:text-purple-400",
    },
  },
  {
    id: "electronics",
    name: "Tech & Gadgets",
    shortName: "Tech",
    description: "Laptops, smartphones, chargers, power banks & device repairs",
    icon: Laptop,
    image: "/categories/electronics.jpg",
    color: {
      bg: "bg-sky-50 dark:bg-sky-950/60",
      text: "text-sky-600 dark:text-sky-400",
    },
  },
  {
    id: "beauty",
    name: "Beauty & Grooming",
    shortName: "Beauty",
    description: "Skincare, cosmetics, perfumes, makeup & personal care",
    icon: Sparkles,
    image: "/categories/beauty.jpg",
    color: {
      bg: "bg-rose-50 dark:bg-rose-950/60",
      text: "text-rose-600 dark:text-rose-400",
    },
  },
  {
    id: "academic-services",
    name: "Academic & Books",
    shortName: "Books",
    description: "Textbooks, medical notes, lab coats, dissection kits & tutoring",
    icon: BookOpen,
    image: "/categories/academic-services.jpg",
    color: {
      bg: "bg-amber-50 dark:bg-amber-950/60",
      text: "text-amber-700 dark:text-amber-400",
    },
  },
  {
    id: "printing",
    name: "Printing & Design",
    shortName: "Printing",
    description: "Photocopying, project binding, flyers, banner design & stationery",
    icon: Printer,
    image: "/categories/printing.jpg",
    color: {
      bg: "bg-teal-50 dark:bg-teal-950/60",
      text: "text-teal-600 dark:text-teal-400",
    },
  },
  {
    id: "photography",
    name: "Photography & Media",
    shortName: "Media",
    description: "Event coverage, portrait sessions, graduation shoots & editing",
    icon: Camera,
    image: "/categories/photography.jpg",
    color: {
      bg: "bg-violet-50 dark:bg-violet-950/60",
      text: "text-violet-600 dark:text-violet-400",
    },
  },
  {
    id: "other",
    name: "Other Services",
    shortName: "Services",
    description: "Room décor, laundry, errands & artisan services in Ho",
    icon: Layers,
    image: "/categories/other.jpg",
    color: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-300",
    },
  },
];

export function getCategoryIcon(categoryId: string): LucideIcon {
  const cat = categories.find((c) => c.id === categoryId);
  return cat ? cat.icon : Layers;
}

export function getCategoryImage(categoryId: string): string {
  if (categoryId === "all") return ALL_CATEGORY_IMAGE;
  const cat = categories.find((c) => c.id === categoryId);
  return cat?.image || ALL_CATEGORY_IMAGE;
}
