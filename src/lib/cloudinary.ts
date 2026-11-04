export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "wlbxssex";

export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "varsmart_uploads";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
}

/**
 * Uploads a file (photo or video) directly from the client browser to Cloudinary
 * using an unsigned upload preset. This completely bypasses Vercel's 4.5MB serverless limit
 * and offloads 100% of bandwidth from Supabase Storage.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = "varsmart/listings"
): Promise<string> {
  const cloudName = CLOUDINARY_CLOUD_NAME;
  const uploadPreset = CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing (Cloud Name or Upload Preset).");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.error?.message ||
      `Upload failed with status ${response.status} (${response.statusText})`;
    throw new Error(`Media upload failed: ${message}`);
  }

  const data: CloudinaryUploadResult = await response.json();

  // If it's an image, automatically inject f_auto,q_auto for maximum compression & speed
  if (data.resource_type === "image" && data.secure_url.includes("/upload/")) {
    return data.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
  }

  return data.secure_url;
}

/**
 * Optimizes an existing Cloudinary image URL to ensure f_auto and q_auto are enabled.
 */
export function getOptimizedMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (
    trimmed.includes("res.cloudinary.com") &&
    trimmed.includes("/upload/") &&
    !trimmed.includes("f_auto")
  ) {
    return trimmed.replace("/upload/", "/upload/f_auto,q_auto/");
  }

  return trimmed;
}
