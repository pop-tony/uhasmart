import { createClient } from "@/lib/supabase/client";

export const MAX_VIDEO_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB max limit to protect storage & student mobile data
export const MAX_VIDEO_FILE_SIZE_MB = 15;

export interface ParsedVideo {
  type: "file" | "youtube" | "tiktok" | "instagram" | "other";
  rawUrl: string;
  streamUrl: string;
  embedUrl?: string | null;
  platformName: string;
}

/**
 * Returns a public streaming URL for a listing video.
 * Handles Supabase Storage keys or direct external URLs.
 */
export function getListingVideoUrl(videoPath?: string | null): string | null {
  if (!videoPath) return null;

  const trimmed = videoPath.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const supabase = createClient();
  if (!supabase) return null;

  const { data } = supabase.storage.from("listing-images").getPublicUrl(trimmed);
  return data?.publicUrl ?? null;
}

/**
 * Parses a video URL to detect if it's a direct video file, YouTube Short/video,
 * TikTok video, or Instagram Reel.
 */
export function parseVideoInfo(rawUrl?: string | null): ParsedVideo | null {
  if (!rawUrl) return null;

  const streamUrl = getListingVideoUrl(rawUrl);
  if (!streamUrl) return null;

  const lower = streamUrl.toLowerCase();

  // 1. YouTube (Watch, Share link, or YouTube Shorts)
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    let videoId: string | null = null;

    if (lower.includes("youtu.be/")) {
      videoId = streamUrl.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0] || null;
    } else if (lower.includes("youtube.com/shorts/")) {
      videoId = streamUrl.split("youtube.com/shorts/")[1]?.split("?")[0]?.split("&")[0] || null;
    } else if (lower.includes("watch?v=")) {
      videoId = streamUrl.split("watch?v=")[1]?.split("&")[0] || null;
    }

    if (videoId) {
      return {
        type: "youtube",
        rawUrl,
        streamUrl,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`,
        platformName: "YouTube",
      };
    }
  }

  // 2. TikTok
  if (lower.includes("tiktok.com")) {
    return {
      type: "tiktok",
      rawUrl,
      streamUrl,
      embedUrl: null, // TikTok iframe requires third-party scripts; we provide direct open/preview button
      platformName: "TikTok",
    };
  }

  // 3. Instagram Reels
  if (lower.includes("instagram.com/reel/") || lower.includes("instagram.com/p/")) {
    let reelId = streamUrl.split("/reel/")[1]?.split("/")[0]?.split("?")[0];
    if (!reelId && streamUrl.includes("/p/")) {
      reelId = streamUrl.split("/p/")[1]?.split("/")[0]?.split("?")[0];
    }

    return {
      type: "instagram",
      rawUrl,
      streamUrl,
      embedUrl: reelId ? `https://www.instagram.com/reel/${reelId}/embed` : null,
      platformName: "Instagram Reel",
    };
  }

  // 4. Native Video File (Supabase Storage or direct mp4/webm/mov)
  return {
    type: "file",
    rawUrl,
    streamUrl,
    embedUrl: null,
    platformName: "Video Tour",
  };
}
