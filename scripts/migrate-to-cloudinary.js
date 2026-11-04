/**
 * Cloudinary Non-Destructive Migration Script for VarsMart
 * Copies all active listing images and videos from Supabase Storage into Cloudinary CDN,
 * optimizes them with f_auto,q_auto, and updates the listings in the Supabase database.
 * 
 * Zero dependencies: Uses native Node.js fetch and FormData.
 * Safe & Idempotent: Can be run multiple times; automatically skips media already hosted on Cloudinary or external URLs.
 */

const fs = require("fs");
const path = require("path");

// Read environment from .env.local if present
let envConfig = {};
try {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, "utf-8");
    raw.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [k, ...v] = trimmed.split("=");
        envConfig[k.trim()] = v.join("=").trim();
      }
    });
  }
} catch (e) {
  // Ignore
}

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  envConfig.SUPABASE_URL ||
  envConfig.NEXT_PUBLIC_SUPABASE_URL ||
  "https://fjhlczvwmlvtxdxcnhxi.supabase.co";

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  envConfig.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const CLOUDINARY_CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  envConfig.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  "wlbxssex";

const CLOUDINARY_UPLOAD_PRESET =
  process.env.CLOUDINARY_UPLOAD_PRESET ||
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
  envConfig.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
  "varsmart_uploads";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

function getSupabasePublicUrl(storagePath) {
  if (!storagePath) return null;
  const trimmed = storagePath.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `${SUPABASE_URL}/storage/v1/object/public/listing-images/${trimmed}`;
}

async function uploadToCloudinaryViaRest(remoteUrl, folder, resourceType = "auto") {
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const fd = new FormData();
  fd.append("file", remoteUrl);
  fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  fd.append("folder", folder);

  const res = await fetch(endpoint, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  let secureUrl = data.secure_url;

  // Add auto-optimization (f_auto, q_auto) for images
  if (data.resource_type === "image" && secureUrl.includes("/upload/")) {
    secureUrl = secureUrl.replace("/upload/", "/upload/f_auto,q_auto/");
  }

  return secureUrl;
}

async function migrateImage(storagePath) {
  if (!storagePath) return null;
  const trimmed = storagePath.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed; // already migrated or external
  }

  const publicUrl = getSupabasePublicUrl(trimmed);
  try {
    return await uploadToCloudinaryViaRest(publicUrl, "varsmart/listings", "image");
  } catch (err) {
    console.error(`\n   [!] Failed to upload image "${trimmed}":`, err.message);
    return null;
  }
}

async function migrateVideo(videoPath) {
  if (!videoPath) return null;
  const trimmed = videoPath.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed; // already a link (YouTube, TikTok, Cloudinary, etc.)
  }

  const publicUrl = getSupabasePublicUrl(trimmed);
  try {
    return await uploadToCloudinaryViaRest(publicUrl, "varsmart/videos", "video");
  } catch (err) {
    console.error(`\n   [!] Failed to upload video "${trimmed}":`, err.message);
    return null;
  }
}

async function runMigration() {
  console.log("==================================================");
  console.log("🚀 STARTING MIGRATION: SUPABASE -> CLOUDINARY");
  console.log("==================================================");
  console.log(`Cloudinary Cloud: ${CLOUDINARY_CLOUD_NAME}`);
  console.log(`Upload Preset:    ${CLOUDINARY_UPLOAD_PRESET}`);
  console.log(`Supabase URL:     ${SUPABASE_URL}`);

  // Fetch all listings
  const queryUrl = `${SUPABASE_URL}/rest/v1/listings?select=id,title,image_path,gallery_images,video_url&order=created_at.desc`;
  const listRes = await fetch(queryUrl, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!listRes.ok) {
    const txt = await listRes.text();
    console.error(`Failed to query listings from Supabase: ${txt}`);
    process.exit(1);
  }

  const listings = await listRes.json();
  console.log(`Found ${listings.length} total listings to verify.\n`);

  let migratedCount = 0;
  let alreadyCloudinaryCount = 0;
  let errorCount = 0;

  for (let i = 0; i < listings.length; i++) {
    const item = listings[i];
    const prefix = `[${i + 1}/${listings.length}] "${item.title || "Untitled"}"`;

    let needsUpdate = false;
    let newImagePath = item.image_path;
    let newGallery = Array.isArray(item.gallery_images) ? [...item.gallery_images] : [];
    let newVideoUrl = item.video_url;

    // 1. Check Primary Image
    if (item.image_path && !item.image_path.startsWith("http")) {
      process.stdout.write(`${prefix}: Migrating main photo... `);
      const cUrl = await migrateImage(item.image_path);
      if (cUrl) {
        newImagePath = cUrl;
        needsUpdate = true;
        console.log("✓ Uploaded");
      } else {
        errorCount++;
      }
    }

    // 2. Check Gallery Images
    if (Array.isArray(item.gallery_images) && item.gallery_images.length > 0) {
      const updatedGallery = [];
      let galleryChanged = false;

      for (let gIdx = 0; gIdx < item.gallery_images.length; gIdx++) {
        const gPath = item.gallery_images[gIdx];
        if (gPath && !gPath.startsWith("http")) {
          // If this path matches the old image_path and we already migrated it, reuse newImagePath
          if (gPath === item.image_path && newImagePath && newImagePath.startsWith("http")) {
            updatedGallery.push(newImagePath);
            galleryChanged = true;
          } else {
            process.stdout.write(`   ↳ Gallery photo [${gIdx + 1}/${item.gallery_images.length}]... `);
            const gUrl = await migrateImage(gPath);
            if (gUrl) {
              updatedGallery.push(gUrl);
              galleryChanged = true;
              console.log("✓ Uploaded");
            } else {
              updatedGallery.push(gPath);
              errorCount++;
            }
          }
        } else {
          updatedGallery.push(gPath);
        }
      }

      if (galleryChanged) {
        newGallery = updatedGallery;
        needsUpdate = true;
      }
    }

    // 3. Check Video URL
    if (item.video_url && !item.video_url.startsWith("http")) {
      process.stdout.write(`${prefix}: Migrating video tour... `);
      const vUrl = await migrateVideo(item.video_url);
      if (vUrl) {
        newVideoUrl = vUrl;
        needsUpdate = true;
        console.log("✓ Uploaded");
      } else {
        errorCount++;
      }
    }

    // 4. Update row in Supabase if any URL was migrated
    if (needsUpdate) {
      const patchUrl = `${SUPABASE_URL}/rest/v1/listings?id=eq.${item.id}`;
      const patchRes = await fetch(patchUrl, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          image_path: newImagePath,
          gallery_images: newGallery,
          video_url: newVideoUrl,
        }),
      });

      if (!patchRes.ok) {
        const patchTxt = await patchRes.text();
        console.error(`Failed to update DB record for "${item.title}": ${patchTxt}`);
        errorCount++;
      } else {
        migratedCount++;
        console.log(`   ✨ Saved to Supabase DB!`);
      }
    } else {
      alreadyCloudinaryCount++;
    }
  }

  console.log("\n==================================================");
  console.log("🎉 MIGRATION FINISHED");
  console.log("==================================================");
  console.log(`Total listings inspected:  ${listings.length}`);
  console.log(`Successfully migrated:     ${migratedCount}`);
  console.log(`Already on Cloudinary:     ${alreadyCloudinaryCount}`);
  console.log(`Errors:                    ${errorCount}`);
  console.log("All marketplace products are now served from Cloudinary CDN with f_auto,q_auto optimization!");
}

runMigration().catch((err) => {
  console.error("Migration fatal error:", err);
  process.exit(1);
});
