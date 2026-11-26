// Smart Campus Marketplace Search & Synonym Expansion Engine
import { categories } from "@/lib/data";

export interface SearchMatchResult {
  matches: boolean;
  score: number;
  matchedSynonyms: string[];
}

/**
 * Campus & E-Commerce Synonym Clusters
 * Grouping words that refer to the same or closely related products on campus.
 */
export const SYNONYM_CLUSTERS: string[][] = [
  // Fragrance / Sprays / Perfumes (User specific highlight)
  [
    "perfume",
    "perfumes",
    "spray",
    "sprays",
    "body spray",
    "bodyspray",
    "deodorant",
    "deodorants",
    "cologne",
    "colognes",
    "fragrance",
    "fragrances",
    "scent",
    "scents",
    "body mist",
    "mist",
    "roll on",
    "roll-on",
    "attar",
    "oud",
    "arabian oil",
    "oil perfume",
  ],

  // Phones / Smartphones / Mobiles
  [
    "phone",
    "phones",
    "smartphone",
    "smartphones",
    "mobile",
    "mobiles",
    "cellphone",
    "handset",
    "iphone",
    "iphones",
    "samsung",
    "galaxy",
    "tecno",
    "infinix",
    "redmi",
    "xiaomi",
    "oppo",
    "pixel",
    "android",
    "ios",
    "apple",
  ],

  // Laptops / Computers / PCs
  [
    "laptop",
    "laptops",
    "computer",
    "computers",
    "pc",
    "macbook",
    "macbooks",
    "notebook",
    "notebooks",
    "hp",
    "dell",
    "lenovo",
    "thinkpad",
    "acer",
    "asus",
    "desktop",
    "chromebook",
  ],

  // Audio / Earbuds / Headphones
  [
    "earbuds",
    "earbud",
    "airpods",
    "airpod",
    "earphones",
    "earphone",
    "headphones",
    "headphone",
    "headset",
    "headsets",
    "pods",
    "buds",
    "wireless buds",
    "bluetooth",
    "speaker",
    "speakers",
    "soundbar",
  ],

  // Chargers / Cables / Power
  [
    "charger",
    "chargers",
    "cable",
    "cables",
    "adapter",
    "adapters",
    "cord",
    "cords",
    "power bank",
    "powerbank",
    "type-c",
    "type c",
    "lightning",
    "usb",
    "fast charger",
    "plug",
  ],

  // Shoes / Sneakers / Footwear
  [
    "shoe",
    "shoes",
    "sneaker",
    "sneakers",
    "kicks",
    "footwear",
    "sandals",
    "sandal",
    "slippers",
    "slipper",
    "slides",
    "slide",
    "crocs",
    "croc",
    "heels",
    "heel",
    "boots",
    "boot",
    "loafers",
    "loafer",
    "canvas",
    "converse",
    "trainer",
    "trainers",
  ],

  // Clothes / Outfits / Apparel
  [
    "cloth",
    "clothes",
    "clothing",
    "wear",
    "wears",
    "outfit",
    "outfits",
    "shirt",
    "shirts",
    "t-shirt",
    "tshirt",
    "tshirts",
    "top",
    "tops",
    "trouser",
    "trousers",
    "pants",
    "pant",
    "jeans",
    "jean",
    "hoodie",
    "hoodies",
    "jacket",
    "jackets",
    "sweater",
    "sweatshirt",
    "sweatpants",
    "gown",
    "gowns",
    "dress",
    "dresses",
    "skirt",
    "skirts",
    "thrift",
    "vintage",
    "suit",
    "blazer",
    "shorts",
    "boxers",
  ],

  // Bags / Backpacks / Handbags
  [
    "bag",
    "bags",
    "backpack",
    "backpacks",
    "knapsack",
    "handbag",
    "handbags",
    "purse",
    "purses",
    "tote",
    "tote bag",
    "school bag",
    "schoolbag",
    "side bag",
    "waist bag",
    "crossbody",
    "pouch",
    "duffle",
  ],

  // Campus Food / Meals / Fast Chops
  [
    "food",
    "foods",
    "meal",
    "meals",
    "chop",
    "chops",
    "fast food",
    "snack",
    "snacks",
    "rice",
    "jollof",
    "fried rice",
    "waakye",
    "noodles",
    "indomie",
    "spaghetti",
    "pasta",
    "burger",
    "burgers",
    "pizza",
    "shawarma",
    "sandwich",
    "pie",
    "meatpie",
    "meat pie",
    "egg",
    "eggs",
    "chicken",
    "beef",
    "fish",
    "banku",
    "fufu",
    "porridge",
    "pastry",
    "pastries",
  ],

  // Drinks / Beverages
  [
    "drink",
    "drinks",
    "beverage",
    "beverages",
    "juice",
    "smoothie",
    "smoothies",
    "sobolo",
    "sobobi",
    "water",
    "soda",
    "coke",
    "malt",
    "cocktail",
  ],

  // Hostels / Accommodation / Rooms
  [
    "hostel",
    "hostels",
    "accommodation",
    "accommodations",
    "room",
    "rooms",
    "apartment",
    "apartments",
    "self-contain",
    "self contain",
    "single room",
    "chamber",
    "hall",
    "rent",
    "bed space",
    "bedspace",
    "lodge",
    "lodging",
    "housing",
  ],

  // Bed / Mattress / Bedding
  [
    "bed",
    "beds",
    "mattress",
    "mattresses",
    "foam",
    "mouka",
    "pillow",
    "pillows",
    "bedsheet",
    "bedsheets",
    "duvet",
    "duvets",
    "blanket",
    "blankets",
    "bedding",
  ],

  // Fans & Cooling
  [
    "fan",
    "fans",
    "standing fan",
    "rechargeable fan",
    "ceiling fan",
    "cooler",
    "mist fan",
    "table fan",
  ],

  // Fridge & Freezers
  [
    "fridge",
    "fridges",
    "refrigerator",
    "refrigerators",
    "freezer",
    "freezers",
    "table top",
    "tabletop",
  ],

  // Pressing Iron
  [
    "iron",
    "irons",
    "pressing iron",
    "steam iron",
    "dry iron",
  ],

  // Kettle & Cooking Appliances
  [
    "kettle",
    "kettles",
    "electric kettle",
    "water heater",
    "jug",
    "blender",
    "blenders",
    "mixer",
    "smoothie maker",
  ],

  // Gas & Cookers
  [
    "gas",
    "gas cylinder",
    "cylinder",
    "cylinders",
    "stove",
    "burner",
    "hot plate",
    "hotplate",
    "cooker",
  ],

  // Academic / Textbooks / Past Questions / Tools
  [
    "book",
    "books",
    "textbook",
    "textbooks",
    "novel",
    "novels",
    "pamphlet",
    "pamphlets",
    "handout",
    "handouts",
    "notes",
    "pasco",
    "past questions",
    "past question",
    "past-questions",
    "syllabus",
    "stethoscope",
    "lab coat",
    "labcoat",
    "dissection kit",
    "scrubs",
    "medical notes",
    "calculator",
    "scientific calculator",
    "casio",
  ],

  // Hair / Wigs / Barbing / Salons
  [
    "hair",
    "hairs",
    "wig",
    "wigs",
    "weave",
    "weaves",
    "frontal",
    "frontals",
    "closure",
    "closures",
    "braids",
    "braiding",
    "haircut",
    "cut",
    "fade",
    "barbering",
    "barber",
    "salon",
    "salons",
    "dreadlocks",
    "locs",
    "twists",
    "ghana weaving",
    "clipper",
    "clippers",
    "human hair",
    "bone straight",
  ],

  // Makeup / Skincare / Beauty
  [
    "makeup",
    "make-up",
    "cosmetics",
    "skincare",
    "skin care",
    "lotion",
    "lotions",
    "cream",
    "creams",
    "moisturizer",
    "sunscreen",
    "serum",
    "lip gloss",
    "lipgloss",
    "lipstick",
    "powder",
    "foundation",
    "eyelash",
    "eyelashes",
    "lashes",
    "nails",
    "acrylic nails",
    "press-on nails",
    "nail polish",
  ],

  // Provisions / Soap / Toiletries
  [
    "soap",
    "soaps",
    "bathing soap",
    "detergent",
    "detergents",
    "omo",
    "ariel",
    "liquid soap",
    "bleach",
    "shampoo",
    "conditioner",
    "sponge",
    "tissue",
    "toilet paper",
    "toothpaste",
    "toothbrush",
    "sanitary pad",
    "pads",
    "wipes",
    "toiletries",
    "provisions",
  ],

  // Printing & Document Services
  [
    "printing",
    "print",
    "photocopy",
    "photocopying",
    "xerox",
    "binding",
    "spiral binding",
    "laminating",
    "lamination",
    "stationery",
    "pen",
    "pens",
    "flyer",
    "flyers",
    "banner",
    "graphics",
    "typing",
  ],

  // Photography & Media
  [
    "camera",
    "cameras",
    "photography",
    "photoshoot",
    "photo shoot",
    "photographer",
    "portrait",
    "video",
    "videography",
    "editing",
    "ring light",
    "tripod",
  ],

  // Watches & Jewelry
  [
    "watch",
    "watches",
    "smartwatch",
    "smart watch",
    "wrist watch",
    "chain",
    "chains",
    "necklace",
    "necklaces",
    "ring",
    "rings",
    "earrings",
    "earring",
    "bracelet",
    "bracelets",
    "bangle",
    "jewelry",
    "jewellery",
    "shades",
    "sunglasses",
  ],
];

// Pre-indexed map for instant O(1) synonym lookup
const SYNONYM_MAP: Map<string, Set<string>> = new Map();

for (const cluster of SYNONYM_CLUSTERS) {
  for (const term of cluster) {
    const key = term.toLowerCase().trim();
    if (!SYNONYM_MAP.has(key)) {
      SYNONYM_MAP.set(key, new Set());
    }
    const currentSet = SYNONYM_MAP.get(key)!;
    for (const related of cluster) {
      if (related.toLowerCase().trim() !== key) {
        currentSet.add(related.toLowerCase().trim());
      }
    }
  }
}

/**
 * Basic English stemmer for common campus product plurals and inflections
 */
export function stemWord(word: string): string {
  const w = word.toLowerCase().trim();
  if (w.length <= 3) return w;

  if (w.endsWith("ies") && w.length > 4) {
    return w.slice(0, -3) + "y";
  }
  if (w.endsWith("es") && (w.endsWith("shes") || w.endsWith("ches") || w.endsWith("xes") || w.endsWith("sses"))) {
    return w.slice(0, -2);
  }
  if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) {
    return w.slice(0, -1);
  }
  return w;
}

/**
 * Expand a user search query into its full set of keywords, stems, and synonyms
 */
export function expandSearchQuery(query: string): {
  originalQuery: string;
  tokens: string[];
  allKeywords: Set<string>;
  synonyms: Set<string>;
  matchedCategoryIds: string[];
} {
  const normalized = query.toLowerCase().trim();
  const rawTokens = normalized
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const allKeywords = new Set<string>();
  const synonyms = new Set<string>();
  const matchedCategoryIds: string[] = [];

  if (normalized) {
    allKeywords.add(normalized);
  }

  // Check whole query against synonyms
  if (SYNONYM_MAP.has(normalized)) {
    SYNONYM_MAP.get(normalized)!.forEach((syn) => {
      synonyms.add(syn);
      allKeywords.add(syn);
    });
  }

  // Process individual tokens
  for (const token of rawTokens) {
    allKeywords.add(token);

    // Add stem
    const stemmed = stemWord(token);
    if (stemmed !== token) {
      allKeywords.add(stemmed);
    }

    // Check token synonyms
    if (SYNONYM_MAP.has(token)) {
      SYNONYM_MAP.get(token)!.forEach((syn) => {
        synonyms.add(syn);
        allKeywords.add(syn);
      });
    }

    // Check stemmed synonyms
    if (stemmed !== token && SYNONYM_MAP.has(stemmed)) {
      SYNONYM_MAP.get(stemmed)!.forEach((syn) => {
        synonyms.add(syn);
        allKeywords.add(syn);
      });
    }

    // Match against categories
    for (const cat of categories) {
      if (
        cat.id.includes(token) ||
        cat.name.toLowerCase().includes(token) ||
        (cat.shortName && cat.shortName.toLowerCase().includes(token))
      ) {
        if (!matchedCategoryIds.includes(cat.id)) {
          matchedCategoryIds.push(cat.id);
        }
      }
    }
  }

  return {
    originalQuery: normalized,
    tokens: rawTokens,
    allKeywords,
    synonyms,
    matchedCategoryIds,
  };
}

/**
 * Check if a product listing matches the search query (including synonyms) and calculate a relevance score
 */
export function matchProductWithSynonyms(
  item: {
    title?: string | null;
    description?: string | null;
    category?: string | null;
    location?: string | null;
    profiles?: {
      business_name?: string | null;
      display_name?: string | null;
    } | null;
  },
  query: string
): SearchMatchResult {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return { matches: true, score: 0, matchedSynonyms: [] };
  }

  const title = (item.title || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
  const category = (item.category || "").toLowerCase();
  const location = (item.location || "").toLowerCase();
  const businessName = (item.profiles?.business_name || "").toLowerCase();
  const displayName = (item.profiles?.display_name || "").toLowerCase();

  let score = 0;
  const matchedSynonyms: string[] = [];

  // 1. Direct whole phrase exact match in Title (highest weight)
  if (title.includes(trimmed)) {
    score += 100;
  }

  // 2. Direct whole phrase exact match in Description / Business Name
  if (description.includes(trimmed)) {
    score += 40;
  }
  if (businessName.includes(trimmed) || displayName.includes(trimmed)) {
    score += 35;
  }

  const expansion = expandSearchQuery(query);

  // 3. Match individual query tokens
  for (const token of expansion.tokens) {
    if (title.includes(token)) score += 30;
    else if (description.includes(token)) score += 15;
    else if (businessName.includes(token)) score += 10;
    else if (location.includes(token)) score += 8;
  }

  // 4. Match category associations
  if (expansion.matchedCategoryIds.includes(category)) {
    score += 25;
  }

  // 5. Match expanded synonyms (e.g. spray -> perfume, kicks -> shoes, airpods -> earbuds)
  expansion.synonyms.forEach((syn) => {
    if (title.includes(syn)) {
      score += 35;
      if (!matchedSynonyms.includes(syn)) matchedSynonyms.push(syn);
    } else if (description.includes(syn)) {
      score += 15;
      if (!matchedSynonyms.includes(syn)) matchedSynonyms.push(syn);
    } else if (category.includes(syn)) {
      score += 20;
      if (!matchedSynonyms.includes(syn)) matchedSynonyms.push(syn);
    }
  });

  return {
    matches: score > 0,
    score,
    matchedSynonyms,
  };
}

/**
 * Returns a friendly hint string if synonyms were found for a search term
 * e.g., for "spray" -> "Also matched: perfumes, cologne & fragrances"
 */
export function getSearchSynonymHint(query: string): string | null {
  const expansion = expandSearchQuery(query);
  if (expansion.synonyms.size === 0) return null;

  // Pick top 2-3 most distinct synonyms
  const topSyns: string[] = [];
  expansion.synonyms.forEach((s) => {
    if (s.length > 3 && !s.includes(expansion.originalQuery) && topSyns.length < 3) {
      topSyns.push(s);
    }
  });

  if (topSyns.length === 0) return null;

  return topSyns.join(", ");
}
