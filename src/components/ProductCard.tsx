/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Heart,
  FileText,
  Play,
  Home,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import { categories, getCategoryIcon } from "@/lib/data";
import { getListingImageUrl } from "@/lib/storage";
import { parseSellerPhones, createWhatsAppUrl } from "@/lib/whatsapp";
import { useWishlist } from "@/lib/useWishlist";

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price_ghs: number;
  price_max_ghs?: number | null;
  price_type?: "fixed" | "range";
  listing_type?: "product" | "flyer";
  gallery_images?: string[] | null;
  video_url?: string | null;
  location: string;
  seller_id?: string;
  image_path?: string | null;
  contact_phone?: string | null;
  created_at?: string;
  profiles?: {
    display_name: string;
    business_name?: string | null;
    phone_number?: string | null;
    campus_location?: string | null;
    subscription_status?: string | null;
    subscription_expires_at?: string | null;
  } | null;
}

interface ProductCardProps {
  product: ProductItem;
  onInquire?: (product: ProductItem) => void;
  isAuthenticated?: boolean;
  onRequireAuth?: (product: ProductItem) => void;
}

export default function ProductCard({
  product,
  onInquire,
  isAuthenticated = false,
  onRequireAuth,
}: ProductCardProps) {
  const categoryObj = categories.find((c) => c.id === product.category);
  const CategoryIcon = getCategoryIcon(product.category);
  const sellerName = product.profiles?.business_name || product.profiles?.display_name || "Campus Seller";
  const [imageError, setImageError] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const isFlyer = product.listing_type === "flyer";
  const isHostel = product.category === "hostels";

  // Build full array of valid images
  const allImagePaths = [product.image_path, ...(product.gallery_images || [])].filter(
    Boolean
  ) as string[];
  const totalImages = allImagePaths.length;
  const currentImageUrl =
    totalImages > 0 ? getListingImageUrl(allImagePaths[activeImageIdx]) : null;

  // Touch Swipe handlers for Airbnb-like card swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || totalImages <= 1) return;
    const deltaX = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(deltaX) > 35) {
      if (deltaX > 0) {
        // swipe left -> next image
        setActiveImageIdx((prev) => (prev + 1) % totalImages);
      } else {
        // swipe right -> previous image
        setActiveImageIdx((prev) => (prev - 1 + totalImages) % totalImages);
      }
    }
    setTouchStartX(null);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev + 1) % totalImages);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev - 1 + totalImages) % totalImages);
  };

  // Format price display (single vs range)
  const isRange =
    product.price_type === "range" ||
    (product.price_max_ghs && product.price_max_ghs > product.price_ghs);
  const priceDisplay = isRange
    ? `${Number(product.price_ghs).toFixed(0)} - ${Number(product.price_max_ghs).toFixed(0)}`
    : Number(product.price_ghs).toFixed(0);

  const whatsAppMessage = isFlyer
    ? `Hello ${sellerName}, I saw your flyer "${product.title}" on VarsMart. I would like more details!`
    : `Hello ${sellerName}, I saw your listing "${product.title}" (GH₵ ${priceDisplay}) on VarsMart. Is it still available?`;

  const phones = parseSellerPhones(product.contact_phone, product.profiles?.phone_number);
  const whatsAppUrl = createWhatsAppUrl(phones.whatsappPhone, whatsAppMessage);

  return (
    <div
      onClick={() => onInquire?.(product)}
      className="group relative flex flex-col cursor-pointer select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onInquire?.(product);
        }
      }}
    >
      {/* Aspect-Square Image Container with touch swiping & Airbnb-style pagination dots */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 shadow-sm transition-all duration-300 group-hover:shadow-md"
      >
        {currentImageUrl && !imageError ? (
          <img
            src={currentImageUrl}
            alt={product.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-400">
            <CategoryIcon className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            <span className="mt-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
              {categoryObj?.name ?? "VarsMart Item"}
            </span>
          </div>
        )}

        {/* Minimal Floating Badge on top-left (Flyer, Hostel, or Video) */}
        {isFlyer ? (
          <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-purple-600/90 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>Flyer</span>
          </div>
        ) : isHostel ? (
          <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-blue-600/90 px-2.5 py-0.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-md flex items-center gap-1">
            <Home className="h-3 w-3" />
            <span>Hostel</span>
          </div>
        ) : product.video_url ? (
          <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-rose-600/90 px-2.5 py-0.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-md flex items-center gap-1">
            <Play className="h-3 w-3 fill-current" />
            <span>Video</span>
          </div>
        ) : null}

        {/* Wishlist Heart on top-right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute right-2.5 top-2.5 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full backdrop-blur-md shadow-sm transition-all duration-200 active:scale-90 ${
            wishlisted
              ? "bg-rose-500 text-white shadow-rose-500/30 scale-105"
              : "bg-white/80 dark:bg-black/80 text-slate-700 dark:text-slate-300 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:text-rose-500 hover:bg-white"
          }`}
          title={wishlisted ? "Remove from saved" : "Save to wishlist"}
          aria-label="Wishlist toggle"
        >
          <Heart
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform ${
              wishlisted ? "fill-current scale-110" : ""
            }`}
          />
        </button>

        {/* Multi-Photo Desktop Chevrons & Airbnb-style Dots */}
        {totalImages > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="hidden sm:group-hover:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-black/90 shadow-md text-slate-800 dark:text-white backdrop-blur-md transition hover:scale-105"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              className="hidden sm:group-hover:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-black/90 shadow-md text-slate-800 dark:text-white backdrop-blur-md transition hover:scale-105"
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 backdrop-blur-sm">
              {allImagePaths.slice(0, 5).map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all duration-200 ${
                    i === activeImageIdx
                      ? "h-1.5 w-2.5 bg-white scale-110"
                      : "h-1.5 w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Typography & Details below Image */}
      <div className="mt-2.5 sm:mt-3 flex flex-col">
        {/* Category uppercase tracking */}
        <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <span className="truncate">{categoryObj?.name ?? product.category}</span>
          {sellerName && sellerName !== "Campus Seller" && (
            <span className="text-blue-600 dark:text-blue-400 truncate max-w-[120px] font-semibold lowercase">
              @{sellerName.replace(/\s+/g, "").toLowerCase()}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {product.title}
        </h3>

        {/* Location & Seller */}
        <div className="mt-0.5 flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
          <span className="truncate">
            {sellerName && sellerName !== "Campus Seller" ? `${sellerName} • ` : ""}
            {product.location}
          </span>
        </div>

        {/* Price & WhatsApp Action Row */}
        <div className="mt-1.5 flex items-center justify-between gap-1.5">
          <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mr-0.5">GH₵</span>
            {priceDisplay}
          </p>

          {/* Quick WhatsApp Action Button */}
          {whatsAppUrl ? (
            isAuthenticated ? (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white px-2 py-0.5 text-[10px] sm:text-[11px] font-bold transition-all shadow-sm active:scale-95"
                title="Chat with seller on WhatsApp"
              >
                <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                <span>Chat</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onRequireAuth) {
                    onRequireAuth(product);
                  } else if (onInquire) {
                    onInquire(product);
                  }
                }}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-600 dark:hover:text-white px-2 py-0.5 text-[10px] sm:text-[11px] font-bold transition-all shadow-sm active:scale-95"
                title="Sign in to contact seller"
              >
                <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>Chat</span>
              </button>
            )
          ) : (
            <span className="text-[10px] font-medium text-slate-400">View</span>
          )}
        </div>
      </div>
    </div>
  );
}
