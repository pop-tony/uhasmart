/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard, { ProductItem } from "@/components/ProductCard";
import ProductSkeletonCard from "@/components/ProductSkeletonCard";
import { categories, campusLocations, getCategoryIcon } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { getListingImageUrl } from "@/lib/storage";
import { useWishlist } from "@/lib/useWishlist";
import {
  Search,
  MapPin,
  Package,
  AlertTriangle,
  X,
  CheckCircle2,
  Phone,
  PhoneCall,
  MessageSquare,
  ChevronDown,
  Images,
  Heart,
  SlidersHorizontal,
  Play,
  ArrowRight,
  Store,
} from "lucide-react";
import { createWhatsAppUrl, createCallUrl, parseSellerPhones } from "@/lib/whatsapp";
import { parseVideoInfo } from "@/lib/video";

export default function MarketplaceView() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");
  const [onlySaved, setOnlySaved] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { wishlist, wishlistCount } = useWishlist();
  const shopSectionRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Sync parameters from URL
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
    const q = searchParams.get("query");
    if (q) {
      setSearchQuery(q);
      setSearchInput(q);
    }
    const loc = searchParams.get("location");
    if (loc) {
      const matched = campusLocations.find((l) => l.id === loc || l.name === loc);
      if (matched) {
        setSelectedLocation(matched.name);
      } else {
        setSelectedLocation(loc);
      }
    }
    const filter = searchParams.get("filter");
    if (filter === "saved") setOnlySaved(true);
  }, [searchParams]);

  // Product Details & Inquiry Bottom Sheet
  const [inquireProduct, setInquireProduct] = useState<ProductItem | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState<"photos" | "video">("photos");
  const [inquiryBody, setInquiryBody] = useState("");
  const [showInAppForm, setShowInAppForm] = useState(false);
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquiryNotice, setInquiryNotice] = useState("");
  const [inquiryError, setInquiryError] = useState("");
  const [sheetImgError, setSheetImgError] = useState(false);

  useEffect(() => {
    async function loadMarketplace() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("listings")
          .select(
            "id,title,description,category,price_ghs,price_max_ghs,price_type,listing_type,gallery_images,video_url,contact_phone,location,seller_id,image_path,created_at,profiles(display_name,business_name,phone_number,campus_location,subscription_status,subscription_expires_at,trial_ends_at,created_at)"
          )
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setListings(data as unknown as ProductItem[]);
        }
      } catch (err) {
        console.error("Error loading listings:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadMarketplace();
  }, [supabase]);

  // Hide expired listings
  const isSellerActive = (item: ProductItem): boolean => {
    if (!item.profiles) return true;
    const prof = item.profiles as {
      subscription_expires_at?: string | null;
      trial_ends_at?: string | null;
      created_at?: string | null;
    };

    let expiryDate: Date;
    if (prof.subscription_expires_at) {
      expiryDate = new Date(prof.subscription_expires_at);
    } else if (prof.trial_ends_at) {
      expiryDate = new Date(prof.trial_ends_at);
    } else if (prof.created_at) {
      expiryDate = new Date(new Date(prof.created_at).getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      return true;
    }

    return expiryDate.getTime() > Date.now();
  };

  const filteredProducts = useMemo(() => {
    return listings
      .filter((item) => {
        if (!isSellerActive(item)) return false;
        if (onlySaved && !wishlist.includes(item.id)) return false;

        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
        const matchesLocation = selectedLocation === "all" || item.location === selectedLocation;
        const matchesSearch =
          !searchQuery.trim() ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.profiles?.business_name ?? "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesLocation && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return Number(a.price_ghs) - Number(b.price_ghs);
        if (sortBy === "price-high") return Number(b.price_ghs) - Number(a.price_ghs);
        return 0;
      });
  }, [listings, selectedCategory, selectedLocation, searchQuery, sortBy, onlySaved, wishlist]);

  const isFiltering = selectedCategory !== "all" || searchQuery.trim() !== "" || onlySaved || selectedLocation !== "all";

  // Curated category sections when viewing "All" with no active search
  const homeSections = useMemo(() => {
    if (isFiltering) return [];

    const activeItems = listings.filter((item) => isSellerActive(item));

    const sectionDefs = [
      {
        id: "trending",
        category: "all",
        title: "Featured Campus Deals",
        subtitle: "Top student picks and verified listings across campus",
        products: activeItems.slice(0, 8),
      },
      {
        id: "hostels",
        category: "hostels",
        title: "Hostels & Accommodations",
        subtitle: "Verified student hostels, self-contain rooms & apartments in Ho",
        products: activeItems.filter((i) => i.category === "hostels"),
      },
      {
        id: "electronics",
        category: "electronics",
        title: "Tech & Gadgets",
        subtitle: "Laptops, smartphones, chargers, earbuds & campus tech essentials",
        products: activeItems.filter((i) => i.category === "electronics"),
      },
      {
        id: "fashion",
        category: "fashion",
        title: "Fashion & Thrift Wears",
        subtitle: "Campus thrift shoes, sneakers, bags, watches & stylish outfits",
        products: activeItems.filter((i) => i.category === "fashion"),
      },
      {
        id: "food",
        category: "food",
        title: "Campus Food & Drinks",
        subtitle: "Hot meals, fast chops, smoothies, snacks & dorm deliveries",
        products: activeItems.filter((i) => i.category === "food" || i.category === "groceries"),
      },
      {
        id: "academic",
        category: "academic-services",
        title: "Academic Books & Tools",
        subtitle: "Textbooks, medical notes, lab coats, dissection kits & printing",
        products: activeItems.filter(
          (i) => i.category === "academic-services" || i.category === "printing"
        ),
      },
      {
        id: "beauty",
        category: "salons-barbers",
        title: "Grooming, Salons & Beauty",
        subtitle: "Braiding, barbering, hair care, cosmetics & personal grooming",
        products: activeItems.filter(
          (i) => i.category === "salons-barbers" || i.category === "beauty"
        ),
      },
    ];

    return sectionDefs.filter((s) => s.products.length > 0);
  }, [listings, isFiltering]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    if (shopSectionRef.current) {
      shopSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setOnlySaved(false);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setOnlySaved(false);
    if (shopSectionRef.current) {
      shopSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  async function handleSendInquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !inquireProduct) return;

    setSendingInquiry(true);
    setInquiryNotice("");
    setInquiryError("");

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        throw new Error(
          "You must sign in to message sellers directly. Please click Sign In in the top menu."
        );
      }

      if (authData.user.id === inquireProduct.seller_id) {
        throw new Error("You cannot send an inquiry on your own product.");
      }

      const { data: inqData, error: inqErr } = await supabase
        .from("inquiries")
        .upsert({
          listing_id: inquireProduct.id,
          buyer_id: authData.user.id,
          seller_id: inquireProduct.seller_id,
        })
        .select()
        .single();

      if (inqErr) throw inqErr;

      const { error: msgErr } = await supabase.from("inquiry_messages").insert({
        inquiry_id: inqData.id,
        sender_id: authData.user.id,
        body: inquiryBody.trim(),
      });

      if (msgErr) throw msgErr;

      setInquiryNotice("Inquiry sent to seller! You can continue chatting in the Messages tab.");
      setInquiryBody("");
      setTimeout(() => {
        setInquireProduct(null);
        setInquiryNotice("");
      }, 2200);
    } catch (err) {
      setInquiryError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSendingInquiry(false);
    }
  }

  // Pre-calculate modal product details
  const modalSellerName =
    inquireProduct?.profiles?.business_name ||
    inquireProduct?.profiles?.display_name ||
    "Campus Seller";

  const sellerPhones = useMemo(() => {
    return parseSellerPhones(
      inquireProduct?.contact_phone,
      inquireProduct?.profiles?.phone_number
    );
  }, [inquireProduct]);

  const galleryPhotos =
    inquireProduct?.gallery_images && inquireProduct.gallery_images.length > 0
      ? inquireProduct.gallery_images
      : inquireProduct?.image_path
      ? [inquireProduct.image_path]
      : [];

  const activePhotoPath = galleryPhotos[activeGalleryIndex] || inquireProduct?.image_path;
  const modalImageUrl = activePhotoPath ? getListingImageUrl(activePhotoPath) : null;
  const ModalCategoryIcon = inquireProduct ? getCategoryIcon(inquireProduct.category) : Package;
  const modalCategoryObj = inquireProduct
    ? categories.find((c) => c.id === inquireProduct.category)
    : null;

  const videoInfo = useMemo(() => {
    return parseVideoInfo(inquireProduct?.video_url);
  }, [inquireProduct?.video_url]);

  const isFlyer = inquireProduct?.listing_type === "flyer";
  const isRange =
    inquireProduct?.price_type === "range" ||
    (inquireProduct?.price_max_ghs && inquireProduct.price_max_ghs > inquireProduct.price_ghs);

  const priceDisplay = inquireProduct
    ? isRange
      ? `${Number(inquireProduct.price_ghs).toFixed(0)} - ${Number(
          inquireProduct.price_max_ghs
        ).toFixed(0)}`
      : Number(inquireProduct.price_ghs).toFixed(0)
    : "0";

  const modalWhatsAppMessage = isFlyer
    ? `Hello ${modalSellerName}, I saw your promotional flyer "${inquireProduct?.title}" on VarsMart. I would like to find out more details!`
    : `Hello ${modalSellerName}, I saw your listing "${inquireProduct?.title}" (GH₵ ${priceDisplay}) on VarsMart. Is it still available?`;

  const modalWhatsAppUrl = inquireProduct && sellerPhones.whatsappPhone
    ? createWhatsAppUrl(sellerPhones.whatsappPhone, modalWhatsAppMessage)
    : null;

  const modalCallUrl = inquireProduct && sellerPhones.callPhone
    ? createCallUrl(sellerPhones.callPhone)
    : null;

  // Other active listings from the same seller
  const moreSellerItems = useMemo(() => {
    if (!inquireProduct?.seller_id) return [];
    return listings.filter(
      (item) =>
        item.seller_id === inquireProduct.seller_id &&
        item.id !== inquireProduct.id &&
        isSellerActive(item)
    );
  }, [listings, inquireProduct]);

  return (
    <div className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">
      {/* 1. AIRBNB-STYLE MOBILE SEARCH CAPSULE (Mobile Only - Eliminates heavy hero clutter) */}
      <div className="sm:hidden sticky top-16 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1.5 shadow-sm shadow-slate-900/5 transition-all focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/10"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-600/30">
            <Search className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <input
              ref={mobileInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Find hostels, gadgets, food..."
              className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
            />
          </div>

          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
              }}
              className="p-1 text-slate-400 hover:text-slate-600"
              aria-label="Clear input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Quick Filter toggle button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className={`rounded-full p-2 border transition ${
              selectedLocation !== "all" || sortBy !== "newest"
                ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/60 dark:border-blue-800"
                : "bg-white border-slate-200/80 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            }`}
            aria-label="Filter locations and sort"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Collapsible Mobile Location & Sort Dropdowns */}
        {mobileFilterOpen && (
          <div className="mt-2.5 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-3 pr-7 text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="all">All Ho Locations</option>
                {campusLocations.map((loc) => (
                  <option key={loc.id} value={loc.name} className="dark:bg-slate-900">
                    {loc.name}
                  </option>
                ))}
              </select>
              <MapPin className="pointer-events-none absolute right-2.5 top-2.5 h-3 w-3 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-3 pr-7 text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="newest" className="dark:bg-slate-900">Newest first</option>
                <option value="price-low" className="dark:bg-slate-900">Price: Low to High</option>
                <option value="price-high" className="dark:bg-slate-900">Price: High to Low</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3 w-3 text-slate-400" />
            </div>
          </div>
        )}
      </div>

      {/* 2. DESKTOP HERO SECTION (Hidden on mobile for ultra-light mobile experience) */}
      {!isFiltering && (
        <div className="hidden sm:block">
          <div className="relative w-full overflow-hidden bg-slate-900 text-white">
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80"
                alt="Campus Marketplace"
                className="h-full w-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-blue-950/60" />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:py-24 text-center">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
                CAMPUS STUDENT MARKETPLACE &bull; HO, VOLTA
              </p>
              <h1 className="mb-6 text-4xl sm:text-6xl font-black tracking-tight text-white">
                Everything You Need
              </h1>
              <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
                Buy and sell quality student gadgets, verified hostels, textbooks, food, and thrift fashion across Ho with direct WhatsApp contact.
              </p>

              <div className="mt-8 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    shopSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="cursor-pointer rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95"
                >
                  Explore Marketplace
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Trust & Stats Section */}
          <section className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 px-4 py-12">
            <div className="mx-auto max-w-4xl text-center">
              <div className="grid grid-cols-3 gap-6 items-center">
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
                    100%
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                    Student Verified
                  </p>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
                    500+
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                    Campus Listings
                  </p>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
                    Direct
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                    WhatsApp &amp; Calls
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 3. AIRBNB-STYLE MINIMALIST CATEGORY STRIP (Clean line icons + underline indicator) */}
      <div className="sticky top-16 sm:top-20 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pt-3 pb-2 scrollbar-none no-scrollbar">
            {/* All Products */}
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              className={`group flex flex-col items-center gap-1.5 pb-2 border-b-2 transition-all whitespace-nowrap active:scale-95 ${
                selectedCategory === "all" && !onlySaved
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Package className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span className="text-[11px] font-semibold">All Items</span>
            </button>

            {/* Saved Wishlist */}
            <button
              type="button"
              onClick={() => {
                setOnlySaved((prev) => !prev);
                setSelectedCategory("all");
              }}
              className={`group flex flex-col items-center gap-1.5 pb-2 border-b-2 transition-all whitespace-nowrap active:scale-95 ${
                onlySaved
                  ? "border-rose-500 text-rose-500 font-bold"
                  : "border-transparent text-slate-500 hover:text-rose-500 dark:text-slate-400"
              }`}
            >
              <div className="relative">
                <Heart className={`h-5 w-5 transition-transform group-hover:scale-110 ${onlySaved ? "fill-current" : ""}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold">Saved</span>
            </button>

            {/* All Categories as Airbnb Icons */}
            {categories.map((c) => {
              const Icon = c.icon;
              const isSelected = selectedCategory === c.id && !onlySaved;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategorySelect(c.id)}
                  className={`group flex flex-col items-center gap-1.5 pb-2 border-b-2 transition-all whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="text-[11px] font-semibold">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. MAIN PRODUCT FEED */}
      <div ref={shopSectionRef} className="mx-auto max-w-7xl px-3.5 py-6 sm:px-6 lg:px-8 sm:py-10">
        {/* Desktop Search Bar (Visible on desktop only) */}
        <div className="hidden sm:flex mb-8 items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : onlySaved
                ? "Your Saved Items"
                : selectedCategory !== "all"
                ? categories.find((c) => c.id === selectedCategory)?.name
                : "Explore Campus Deals"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              {isFiltering ? `${filteredProducts.length} items found` : "Top student listings across Ho"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-72 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1 pl-4"
            >
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search deals..."
                className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700"
                aria-label="Submit search"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="appearance-none rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2 pl-4 pr-8 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="all">All Locations</option>
                {campusLocations.map((loc) => (
                  <option key={loc.id} value={loc.name} className="dark:bg-slate-900">
                    {loc.name}
                  </option>
                ))}
              </select>
              <MapPin className="pointer-events-none absolute right-3 top-2.5 h-3 w-3 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2 pl-4 pr-8 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <SlidersHorizontal className="pointer-events-none absolute right-3 top-2.5 h-3 w-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Active Filter Clear Prompt */}
        {isFiltering && (
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Showing {filteredProducts.length} listings
            </span>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all filters &times;
            </button>
          </div>
        )}

        {/* Product Grid Content: Skeleton / Empty / Filtered / Multi-Section */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3.5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <ProductSkeletonCard key={n} />
            ))}
          </div>
        ) : isFiltering ? (
          filteredProducts.length === 0 ? (
            <div className="py-20 text-center">
              <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                No products found
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                No listings matched your criteria. Try adjusting your search query or location filter.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-5 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onInquire={(item) => {
                    setInquireProduct(item);
                    setActiveGalleryIndex(0);
                    setActiveMediaTab("photos");
                    setShowInAppForm(false);
                    setSheetImgError(false);
                  }}
                />
              ))}
            </div>
          )
        ) : (
          /* Multi-Section Themed Architecture */
          <div className="space-y-12 sm:space-y-16">
            {homeSections.map((section) => (
              <div key={section.id} className="space-y-4">
                <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {section.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      {section.subtitle}
                    </p>
                  </div>
                  {section.category !== "all" && (
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(section.category)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
                    >
                      <span>See all</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Airbnb-style 2-col on mobile, 4-col on desktop */}
                <div className="grid grid-cols-2 gap-3.5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                  {section.products.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onInquire={(item) => {
                        setInquireProduct(item);
                        setActiveGalleryIndex(0);
                        setActiveMediaTab("photos");
                        setShowInAppForm(false);
                        setSheetImgError(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. PRODUCT DETAILS & INQUIRY MODAL */}
      {inquireProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setInquireProduct(null)}
        >
          <div
            className="w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 border border-slate-100 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* iOS Pull Handle */}
            <div className="pt-3 pb-1 flex justify-center sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Scrollable Content */}
            <div ref={modalScrollRef} className="flex-1 overflow-y-auto px-5 py-4 sm:p-8 space-y-5">
              {/* Header: Category Pill & Close */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {modalCategoryObj?.name ?? inquireProduct.category}
                </span>
                <button
                  type="button"
                  onClick={() => setInquireProduct(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition"
                  aria-label="Close product modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Media Switcher (Photos vs Video Tour) */}
              {videoInfo && (
                <div className="flex rounded-full bg-slate-100 dark:bg-slate-800 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab("photos")}
                    className={`flex-1 py-1.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      activeMediaTab === "photos"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <Images className="h-3.5 w-3.5" />
                    <span>Photos ({galleryPhotos.length || 1})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab("video")}
                    className={`flex-1 py-1.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      activeMediaTab === "video"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Video Tour</span>
                  </button>
                </div>
              )}

              {/* Showcase Image / Video */}
              {activeMediaTab === "video" && videoInfo ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black">
                  {videoInfo.type === "youtube" && videoInfo.embedUrl ? (
                    <iframe
                      src={videoInfo.embedUrl}
                      title="Product Video Tour"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videoInfo.streamUrl}
                      controls
                      playsInline
                      poster={modalImageUrl || undefined}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ) : (
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                    {modalImageUrl && !sheetImgError ? (
                      <img
                        src={modalImageUrl}
                        alt={inquireProduct.title}
                        onError={() => setSheetImgError(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                        <ModalCategoryIcon className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                        <span className="mt-2 text-xs font-semibold text-slate-400">
                          {modalCategoryObj?.name ?? "VarsMart Listing"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {galleryPhotos.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                      {galleryPhotos.map((photoPath, idx) => {
                        const thumbUrl = getListingImageUrl(photoPath);
                        const isSelected = activeGalleryIndex === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveGalleryIndex(idx)}
                            className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                              isSelected
                                ? "border-blue-600 ring-2 ring-blue-600/30 scale-105"
                                : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            {thumbUrl && (
                              <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Title, Location & Price */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {inquireProduct.title}
                </h2>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{inquireProduct.location}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Student Verified
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400 mr-1">GH₵</span>
                    {priceDisplay}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {inquireProduct.description || "No description provided by seller."}
                </p>
              </div>

              {/* Seller Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shadow-sm">
                    {modalSellerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {modalSellerName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Campus Vendor &bull; {inquireProduct.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions: Direct WhatsApp & Call */}
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {modalWhatsAppUrl && (
                    <a
                      href={modalWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 active:scale-95 transition"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}
                  {modalCallUrl && (
                    <a
                      href={modalCallUrl}
                      className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition"
                    >
                      <PhoneCall className="h-4 w-4" />
                      <span>Call Seller</span>
                    </a>
                  )}
                </div>

                {/* More From This Seller Section */}
                {moreSellerItems.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Store className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                            More from {modalSellerName}
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            {moreSellerItems.length} other {moreSellerItems.length === 1 ? "listing" : "listings"} available
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const sellerTerm = modalSellerName;
                          setInquireProduct(null);
                          setSearchInput(sellerTerm);
                          setSearchQuery(sellerTerm);
                          setSelectedCategory("all");
                          shopSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>View all in feed</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Responsive Grid of Seller's other listings */}
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {moreSellerItems.map((item) => {
                        const itemImages = [item.image_path, ...(item.gallery_images || [])].filter(Boolean) as string[];
                        const itemThumb = itemImages.length > 0 ? getListingImageUrl(itemImages[0]) : null;
                        const isItemRange =
                          item.price_type === "range" ||
                          (item.price_max_ghs && item.price_max_ghs > item.price_ghs);
                        const itemPrice = isItemRange
                          ? `${Number(item.price_ghs).toFixed(0)} - ${Number(item.price_max_ghs).toFixed(0)}`
                          : Number(item.price_ghs).toFixed(0);

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setInquireProduct(item);
                              setActiveGalleryIndex(0);
                              setActiveMediaTab("photos");
                              setShowInAppForm(false);
                              setSheetImgError(false);
                              setInquiryNotice("");
                              setInquiryError("");
                              modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="group cursor-pointer rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-2 sm:p-2.5 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm transition-all active:scale-95 flex flex-col justify-between"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                setInquireProduct(item);
                                setActiveGalleryIndex(0);
                                setActiveMediaTab("photos");
                                setShowInAppForm(false);
                                setSheetImgError(false);
                                modalScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                              }
                            }}
                          >
                            <div>
                              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-700 mb-2">
                                {itemThumb ? (
                                  <img
                                    src={itemThumb}
                                    alt={item.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                                    <Package className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {item.title}
                              </p>
                            </div>

                            <div className="mt-1.5 flex items-center justify-between">
                              <p className="text-xs font-black text-blue-600 dark:text-blue-400">
                                GH₵ {itemPrice}
                              </p>
                              <span className="text-[10px] text-slate-400 truncate max-w-[50%]">
                                {item.location}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Collapsible In-App Messaging */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setShowInAppForm(!showInAppForm)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 inline-flex items-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Send in-app message on VarsMart</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${showInAppForm ? "rotate-180" : ""}`} />
                  </button>

                  {showInAppForm && (
                    <form onSubmit={handleSendInquiry} className="mt-3 space-y-2.5 text-left">
                      {inquiryNotice && (
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>{inquiryNotice}</span>
                        </div>
                      )}
                      {inquiryError && (
                        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/60 p-2.5 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>{inquiryError}</span>
                        </div>
                      )}
                      <textarea
                        required
                        rows={3}
                        value={inquiryBody}
                        onChange={(e) => setInquiryBody(e.target.value)}
                        placeholder={`Hi ${modalSellerName}, is this available? Where on campus can we meet?`}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={sendingInquiry}
                        className="w-full rounded-full bg-slate-900 dark:bg-white py-2.5 text-xs font-bold text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-50 transition"
                      >
                        {sendingInquiry ? "Sending..." : "Send In-App Message"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
