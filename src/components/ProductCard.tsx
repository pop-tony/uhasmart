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
}

export default function ProductCard({ product, onInquire }: ProductCardProps) {
  const categoryObj = categories.find((c) => c.id === product.category);
  const CategoryIcon = getCategoryIcon(product.category);
  const sellerName = product.profiles?.business_name || product.profiles?.display_name || "Campus Seller";
  const [imageError, setImageError] = useState(false);

  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const isFlyer = product.listing_type === "flyer";
  const isHostel = product.category === "hostels";

  // Build primary image URL
  const allImagePaths = [product.image_path, ...(product.gallery_images || [])].filter(
    Boolean
  ) as string[];
  const primaryImageUrl =
    allImagePaths.length > 0 ? getListingImageUrl(allImagePaths[0]) : null;

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
      {/* Aspect-Square Image Container with smooth zoom & rounded corners */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 shadow-sm transition-all duration-300 group-hover:shadow-md">
        {primaryImageUrl && !imageError ? (
          <img
            src={primaryImageUrl}
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
          <div className="absolute left-3 top-3 z-10 rounded-full bg-purple-600/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>Flyer</span>
          </div>
        ) : isHostel ? (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-blue-600/90 px-3 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md flex items-center gap-1">
            <Home className="h-3 w-3" />
            <span>Hostel</span>
          </div>
        ) : product.video_url ? (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-rose-600/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md flex items-center gap-1">
            <Play className="h-3 w-3 fill-current" />
            <span>Video</span>
          </div>
        ) : null}

        {/* Wishlist Heart on top-right (Clean & responsive like PrissAura) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md shadow-sm transition-all duration-200 active:scale-90 ${
            wishlisted
              ? "bg-rose-500 text-white shadow-rose-500/30 scale-105"
              : "bg-white/80 dark:bg-black/80 text-slate-700 dark:text-slate-300 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:text-rose-500 hover:bg-white"
          }`}
          title={wishlisted ? "Remove from saved" : "Save to wishlist"}
          aria-label="Wishlist toggle"
        >
          <Heart
            className={`h-4 w-4 transition-transform ${
              wishlisted ? "fill-current scale-110" : ""
            }`}
          />
        </button>
      </div>

      {/* Typography & Details below Image (PrissAura Clean Design) */}
      <div className="mt-3 sm:mt-3.5 flex flex-col">
        {/* Category uppercase tracking */}
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
          {categoryObj?.name ?? product.category}
        </p>

        {/* Title */}
        <h3 className="mt-1 text-sm sm:text-base font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {product.title}
        </h3>

        {/* Location & Seller */}
        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{product.location}</span>
        </div>

        {/* Price & WhatsApp Action Row */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mr-1">GH₵</span>
            {priceDisplay}
          </p>

          {/* Quick WhatsApp Action Button */}
          {whatsAppUrl ? (
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white px-2.5 py-1 text-[11px] font-bold transition-all shadow-sm active:scale-95"
              title="Chat with seller on WhatsApp"
            >
              <Phone className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">View</span>
          )}
        </div>
      </div>
    </div>
  );
}
