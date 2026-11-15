import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Known administrator email addresses with automatic super-admin override
const ADMIN_EMAILS = [
  "rmgsecure81@gmail.com",
  "preciousdzihlornu4258@gmail.com",
  "davidselormwalker@gmail.com",
  "uhasmartofficial@gmail.com",
  "admin@uhasmart.com",
  "admin@varsmartgh.com",
];

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "https://fjhlczvwmlvtxdxcnhxi.supabase.co";

    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "";

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxjenZ3bWx2dHhkeGNuaHhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYxMDM5MSwiZXhwIjoyMTA3MTg2MzkxfQ.du8Fm4GNceDAmmijJAsQSEHrg36nLcH1EZBueA6rZL0";

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server Supabase credentials are not configured." },
        { status: 500 }
      );
    }

    // 1. Verify caller identity using their access token
    if (!token) {
      return NextResponse.json(
        { error: "Missing authorization token. Please sign in as an admin." },
        { status: 401 }
      );
    }

    const clientSupabase = createClient(supabaseUrl, anonKey || serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: callerData, error: callerError } = await clientSupabase.auth.getUser(token);
    if (callerError || !callerData?.user) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please sign in again." },
        { status: 401 }
      );
    }

    const callerUser = callerData.user;
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 2. Comprehensive Admin Verification:
    // Check A: Super admin email match
    const isSuperAdminEmail = ADMIN_EMAILS.includes(
      (callerUser.email || "").toLowerCase().trim()
    );

    // Check B: user_roles table (where VarsMart stores admin roles)
    const { data: adminRoleRow } = await adminSupabase
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id)
      .eq("role", "admin")
      .maybeSingle();

    // Check C: profiles table attributes
    const { data: callerProfile } = await adminSupabase
      .from("profiles")
      .select("role, is_admin_role, is_moderator")
      .eq("id", callerUser.id)
      .maybeSingle();

    // Check D: RPC is_admin using caller's authenticated token
    let rpcIsAdmin = false;
    try {
      const clientWithAuth = createClient(supabaseUrl, anonKey || serviceRoleKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      });
      const { data: rpcRes } = await clientWithAuth.rpc("is_admin");
      rpcIsAdmin = Boolean(rpcRes);
    } catch {
      rpcIsAdmin = false;
    }

    const isAuthorized =
      isSuperAdminEmail ||
      Boolean(adminRoleRow) ||
      callerProfile?.role === "admin" ||
      callerProfile?.is_admin_role === true ||
      rpcIsAdmin;

    if (!isAuthorized) {
      console.warn(`[AdminDeleteUser] Unauthorized delete attempt by user ${callerUser.id} (${callerUser.email})`);
      return NextResponse.json(
        { error: "Forbidden: You do not have administrator permissions to delete users." },
        { status: 403 }
      );
    }

    // 3. Parse target user ID
    const body = await req.json().catch(() => ({}));
    const { userId: targetUserId } = body;

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json(
        { error: "Target userId is required." },
        { status: 400 }
      );
    }

    if (targetUserId === callerUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own administrator account." },
        { status: 400 }
      );
    }

    console.log(`[AdminDeleteUser] Admin ${callerUser.email} is deleting user ${targetUserId}...`);

    // 4. Clean up all public records referencing target user with proper foreign key order
    // A. Find all listings owned by target user
    const { data: userListings } = await adminSupabase
      .from("listings")
      .select("id")
      .eq("seller_id", targetUserId);
    const listingIds = (userListings || []).map((l) => l.id);

    // B. Find all inquiries related to user (as buyer, as seller, or on their listings)
    const inquiryIdSet = new Set<string>();
    const { data: userInquiries } = await adminSupabase
      .from("inquiries")
      .select("id")
      .or(`buyer_id.eq.${targetUserId},seller_id.eq.${targetUserId}`);
    (userInquiries || []).forEach((i) => inquiryIdSet.add(i.id));

    if (listingIds.length > 0) {
      const { data: listingInquiries } = await adminSupabase
        .from("inquiries")
        .select("id")
        .in("listing_id", listingIds);
      (listingInquiries || []).forEach((i) => inquiryIdSet.add(i.id));
    }
    const allInquiryIds = Array.from(inquiryIdSet);

    // C. Delete inquiry messages
    if (allInquiryIds.length > 0) {
      await adminSupabase.from("inquiry_messages").delete().in("inquiry_id", allInquiryIds);
    }
    await adminSupabase.from("inquiry_messages").delete().eq("sender_id", targetUserId);

    // D. Delete inquiries
    if (allInquiryIds.length > 0) {
      await adminSupabase.from("inquiries").delete().in("id", allInquiryIds);
    }

    // E. Delete listing reports (reports on their listings & reports filed by user)
    if (listingIds.length > 0) {
      await adminSupabase.from("listing_reports").delete().in("listing_id", listingIds);
    }
    await adminSupabase.from("listing_reports").delete().eq("reported_by", targetUserId);

    // F. Delete listings
    if (listingIds.length > 0) {
      await adminSupabase.from("listings").delete().in("id", listingIds);
    }

    // G. Delete subscription payments
    await adminSupabase.from("subscription_payments").delete().eq("seller_id", targetUserId);

    // H. Delete user roles
    await adminSupabase.from("user_roles").delete().eq("user_id", targetUserId);

    // I. Delete public profile
    await adminSupabase.from("profiles").delete().eq("id", targetUserId);

    // 5. Purge user from Supabase Auth (auth.users)
    const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(targetUserId);

    if (authDeleteError) {
      console.error("[AdminDeleteUser] Supabase auth.admin.deleteUser error:", authDeleteError);
      return NextResponse.json(
        { error: `Database records cleared, but Auth user deletion failed: ${authDeleteError.message}` },
        { status: 500 }
      );
    }

    console.log(`[AdminDeleteUser] Successfully purged user ${targetUserId} from Supabase Auth & database.`);

    return NextResponse.json({
      success: true,
      message: "User account and login credentials have been completely deleted. The student can now re-register fresh with their same information.",
    });
  } catch (err) {
    console.error("[AdminDeleteUser] Unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete user account." },
      { status: 500 }
    );
  }
}
