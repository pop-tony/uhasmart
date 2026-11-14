import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = [
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

    // 2. Check if caller has admin permissions
    const isSuperAdminEmail = ADMIN_EMAILS.includes(
      (callerUser.email || "").toLowerCase()
    );

    const { data: callerProfile } = await adminSupabase
      .from("profiles")
      .select("role, is_admin_role, is_moderator")
      .eq("id", callerUser.id)
      .maybeSingle();

    let rpcIsAdmin = false;
    try {
      const { data } = await adminSupabase.rpc("is_admin");
      rpcIsAdmin = Boolean(data);
    } catch {
      rpcIsAdmin = false;
    }

    const isAuthorized =
      isSuperAdminEmail ||
      callerProfile?.role === "admin" ||
      callerProfile?.is_admin_role === true ||
      rpcIsAdmin;

    if (!isAuthorized) {
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

    // 4. Clean up all public records referencing target user
    // A. Delete user's listings
    await adminSupabase.from("listings").delete().eq("seller_id", targetUserId);

    // B. Delete inquiries & inquiry messages
    await adminSupabase.from("inquiry_messages").delete().eq("sender_id", targetUserId);
    await adminSupabase.from("inquiries").delete().or(`buyer_id.eq.${targetUserId},seller_id.eq.${targetUserId}`);

    // C. Delete reports
    await adminSupabase.from("listing_reports").delete().eq("reported_by", targetUserId);

    // D. Delete subscription payments
    await adminSupabase.from("subscription_payments").delete().eq("seller_id", targetUserId);

    // E. Delete user roles
    await adminSupabase.from("user_roles").delete().eq("user_id", targetUserId);

    // F. Delete public profile
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
