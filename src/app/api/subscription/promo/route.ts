import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Allowed promotional codes (case-insensitive)
const VALID_PROMO_CODES = [
  "VARS15",
  "PROMO15",
  "FREE15",
  "CAMPUS15",
  "LAUNCH15",
  "UHASMART15",
  "STUDENT15",
  "FREESHOP15",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, userId: bodyUserId } = body;

    const rawCode = (code || "").toString().trim().toUpperCase();

    if (!rawCode) {
      return NextResponse.json(
        { error: "Please enter a valid subscription promo code." },
        { status: 400 }
      );
    }

    // Connect to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Database configuration error. Please contact campus support." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Resolve User ID
    let userId = bodyUserId;
    if (!userId) {
      const authHeader = req.headers.get("authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "").trim();
        const { data: userData } = await supabase.auth.getUser(token);
        userId = userData?.user?.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to redeem promo code." },
        { status: 401 }
      );
    }

    // 1. Validate promo code format / accepted list
    const isValidCode =
      VALID_PROMO_CODES.includes(rawCode) ||
      rawCode.endsWith("15") ||
      rawCode.startsWith("PROMO") ||
      rawCode.includes("FREE");

    if (!isValidCode) {
      return NextResponse.json(
        {
          error: `"${rawCode}" is not a recognized subscription promo code. Please check and try again.`,
        },
        { status: 400 }
      );
    }

    // 2. Enforce ONE-TIME use per seller:
    // Check subscription_payments table for any prior promo_code redemption
    const { data: priorPromoPayment } = await supabase
      .from("subscription_payments")
      .select("id,plan_name,created_at")
      .eq("seller_id", userId)
      .eq("payment_method", "promo_code")
      .limit(1)
      .maybeSingle();

    if (priorPromoPayment) {
      return NextResponse.json(
        {
          error:
            "You have already redeemed your one-time 15-day free promo. Each seller can only use this offer once.",
        },
        { status: 400 }
      );
    }

    // Also check profiles for promo_code_used if column exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id,role,subscription_status,subscription_expires_at,trial_ends_at,promo_code_used")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.promo_code_used) {
      return NextResponse.json(
        {
          error:
            "You have already redeemed your one-time 15-day free promo. Each seller can only use this offer once.",
        },
        { status: 400 }
      );
    }

    // 3. Calculate new 15-day expiration:
    // If the seller currently has an active subscription, add 15 days to their current expiry!
    // Otherwise, grant 15 full days from now.
    const now = Date.now();
    let baseTime = now;

    if (profile?.subscription_expires_at) {
      const currentExpiryMs = new Date(profile.subscription_expires_at).getTime();
      if (currentExpiryMs > now) {
        baseTime = currentExpiryMs;
      }
    }

    const durationDays = 15;
    const newExpiryDate = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000);
    const newExpiryIso = newExpiryDate.toISOString();
    const reference = `PROMO-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 4. Update Profile
    const profileUpdatePayload: Record<string, unknown> = {
      role: profile?.role === "admin" ? "admin" : "seller",
      subscription_status: "active",
      subscription_tier: `15-Day Promo (${rawCode})`,
      subscription_expires_at: newExpiryIso,
      trial_ends_at: newExpiryIso,
      subscription_reminder_sent: false,
    };

    // Attempt updating promo tracking fields
    try {
      await supabase
        .from("profiles")
        .update({
          ...profileUpdatePayload,
          promo_code_used: rawCode,
          promo_redeemed_at: new Date().toISOString(),
        })
        .eq("id", userId);
    } catch {
      // Fallback if columns don't exist yet
      await supabase.from("profiles").update(profileUpdatePayload).eq("id", userId);
    }

    // 5. Record redemption in subscription_payments to permanently lock one-time use
    await supabase.from("subscription_payments").insert({
      seller_id: userId,
      amount_ghs: 0,
      plan_name: `15-Day Free Promo (${rawCode})`,
      duration_days: durationDays,
      payment_method: "promo_code",
      momo_number: rawCode,
      momo_network: "promo",
      reference,
      status: "success",
    });

    const formattedExpiry = newExpiryDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return NextResponse.json({
      success: true,
      newExpiry: newExpiryIso,
      formattedExpiry,
      message: `🎉 Promo code "${rawCode}" applied! You have been granted 15 days of free campus posting (Valid until ${formattedExpiry}).`,
    });
  } catch (err) {
    console.error("Promo code redemption error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to apply promo code." },
      { status: 500 }
    );
  }
}
