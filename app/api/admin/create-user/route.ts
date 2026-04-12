// FILE: app/api/admin/create-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type CreateUserRole = "doctor" | "patient";

type CreateUserPayload = {
  fullName: string;
  email: string;
  password: string;
  role: CreateUserRole;
  specialty?: string;
  assignedDoctorId?: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isRole(v: unknown): v is CreateUserRole {
  return v === "doctor" || v === "patient";
}

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "DR";
  if (parts.length === 1) {
    const w = parts[0];
    return (w[0] + (w[1] ?? w[0])).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function POST(req: NextRequest) {
  let newUserId: string | null = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Server misconfigured: missing Supabase env vars." },
        { status: 500 }
      );
    }

    // ── STEP 1: Verify admin session ──────────────────────────────────────
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {},
        remove() {},
      },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const adminUserId = authData.user.id;

    // ── STEP 2: Verify admin role + clinic ───────────────────────────────
    const { data: adminProfile, error: adminProfileError } = await supabaseAdmin
      .from("profiles")
      .select("id, role, clinic_id")
      .eq("id", adminUserId)
      .maybeSingle();

    if (adminProfileError) {
      return NextResponse.json(
        { error: "Failed to verify admin profile." },
        { status: 500 }
      );
    }
    if (!adminProfile) {
      return NextResponse.json({ error: "Admin profile not found." }, { status: 403 });
    }
    if (adminProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create doctor/patient accounts." },
        { status: 403 }
      );
    }

    const clinicId = adminProfile.clinic_id as string | null;
    if (!clinicId) {
      return NextResponse.json(
        { error: "Admin has no clinic. Please complete clinic setup first." },
        { status: 400 }
      );
    }

    // ── STEP 3: Parse + validate body ─────────────────────────────────────
    let raw: unknown;
    try { raw = await req.json(); }
    catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

    if (typeof raw !== "object" || raw === null) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const body = raw as Partial<CreateUserPayload>;

    if (!isNonEmptyString(body.fullName)) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }
    if (!isNonEmptyString(body.email)) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (!isNonEmptyString(body.password) || body.password.trim().length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    if (!isRole(body.role)) {
      return NextResponse.json(
        { error: "Role must be 'doctor' or 'patient'." },
        { status: 400 }
      );
    }

    const email    = body.email.trim().toLowerCase();
    const fullName = body.fullName.trim();
    const password = body.password;
    const role     = body.role;
    const specialty = isNonEmptyString(body.specialty)
      ? body.specialty.trim()
      : "General Practitioner";
    // For patients: optional doctor assignment from the admin form
    const assignedDoctorId = isNonEmptyString(body.assignedDoctorId)
      ? body.assignedDoctorId.trim()
      : null;

    // ── STEP 4: Create auth user ───────────────────────────────────────────
    console.log("[create-user] Creating auth user:", email, "role:", role);

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
      app_metadata: { role, clinic_id: clinicId },
    });

    if (createError || !created?.user) {
      const msg = createError?.message ?? "Failed to create auth user.";
      console.error("[create-user] Auth create error:", msg);
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    newUserId = created.user.id;
    console.log("[create-user] Auth user created:", newUserId);

    // ── STEP 5: Hard-confirm app_metadata ────────────────────────────────
    const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(newUserId, {
      app_metadata: { role, clinic_id: clinicId },
      user_metadata: { full_name: fullName },
    });

    if (metaError) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      newUserId = null;
      return NextResponse.json(
        { error: `Failed to assign role: ${metaError.message}` },
        { status: 500 }
      );
    }

    // ── STEP 6: Upsert profile row ────────────────────────────────────────
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        { id: newUserId, role, full_name: fullName, email, clinic_id: clinicId },
        { onConflict: "id" }
      );

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      newUserId = null;
      return NextResponse.json(
        { error: `Profile creation failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    console.log("[create-user] Profile upserted:", newUserId);

    // ── STEP 7: Upsert domain row ─────────────────────────────────────────
    // Using UPSERT (not insert) so retries never create duplicates
    if (role === "doctor") {
      const doctorRow = {
        profile_id:  newUserId,
        clinic_id:   clinicId,
        name:        fullName,
        specialty,
        email,
        phone:       "",
        experience:  "",
        status:      "active",
        rating:      5.0,
        patients:    0,
        utilization: 0,
        revenue:     0,
        initials:    buildInitials(fullName),
        grad:        "linear-gradient(135deg, #0f766e, #14b8a6)",
        bio:         "",
      };

      console.log("[create-user] Upserting doctor row for:", newUserId);

      const { error: docError } = await supabaseAdmin
        .from("doctors")
        .upsert(doctorRow, { onConflict: "profile_id" });

      if (docError) {
        console.error("[create-user] Doctor upsert error:", docError.message, docError.details);
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        newUserId = null;
        return NextResponse.json(
          {
            error:  `Doctor record failed: ${docError.message}`,
            detail: docError.details ?? null,
            hint:   docError.hint ?? null,
          },
          { status: 500 }
        );
      }

      console.log("[create-user] Doctor row upserted ✅");

    } else {
      // patient
      const patientRow = {
        profile_id:         newUserId,
        clinic_id:          clinicId,
        // This is the KEY fix: assignedDoctorId from the admin form
        assigned_doctor_id: assignedDoctorId,
        name:               fullName,
        email,
        age:                0,
        phone:              "",
        condition:          "",
        status:             "active",
        blood_type:         "",
        address:            "",
        last_visit:         "",
        visits:             0,
        medical_notes:      "",
      };

      console.log("[create-user] Upserting patient row for:", newUserId);

      const { error: patError } = await supabaseAdmin
        .from("patients")
        .upsert(patientRow, { onConflict: "profile_id" });

      if (patError) {
        console.error("[create-user] Patient upsert error:", patError.message, patError.details);
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        newUserId = null;
        return NextResponse.json(
          {
            error:  `Patient record failed: ${patError.message}`,
            detail: patError.details ?? null,
            hint:   patError.hint ?? null,
          },
          { status: 500 }
        );
      }

      console.log("[create-user] Patient row upserted ✅");
    }

    // ── STEP 8: Success ───────────────────────────────────────────────────
    return NextResponse.json(
      {
        ok: true,
        user: { id: newUserId, email, role, clinic_id: clinicId, name: fullName },
      },
      { status: 201 }
    );

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[create-user] Unhandled exception:", msg);
    if (newUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
      } catch (rb) {
        console.error("[create-user] Rollback failed:", rb);
      }
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}