import { createClient } from "@/lib/supabase/client";
import { getOptimizedMediaUrl } from "@/lib/cloudinary";

/**
 * Returns a publicly accessible URL for a listing image stored in Cloudinary CDN or Supabase Storage.
 * Handles full URLs, relative storage keys, or returns null if no image exists.
 */
export function getListingImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;

  // Already a full external URL (Cloudinary CDN or external)
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return getOptimizedMediaUrl(imagePath);
  }

  const supabase = createClient();
  if (!supabase) return null;

  const { data } = supabase.storage.from("listing-images").getPublicUrl(imagePath);
  return data?.publicUrl ?? null;
}
