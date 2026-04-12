// FILE: app/api/patient/book-appointment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type BookingPayload = {
  type:   string;
  date:   string;
  time:   string;
  notes?: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
    }

    // ── 1. Verify session ─────────────────────────────────────────────────
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

    const userId = authData.user.id;
    const role   = authData.user.app_metadata?.role as string | undefined;

    if (role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can book appointments." },
        { status: 403 }
      );
    }

    // ── 2. Get patient row ────────────────────────────────────────────────
    const { data: patientData, error: patientError } = await supabaseAdmin
      .from("patients")
      .select("id, name, clinic_id, assigned_doctor_id")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (patientError || !patientData) {
      return NextResponse.json({ error: "Patient profile not found." }, { status: 404 });
    }

    if (!patientData.assigned_doctor_id) {
      return NextResponse.json(
        { error: "No doctor assigned. Please contact your clinic admin." },
        { status: 400 }
      );
    }

    // ── 3. Get doctor + clinic in parallel ───────────────────────────────
    const [doctorResult, clinicResult] = await Promise.all([
      supabaseAdmin.from("doctors").select("id, name").eq("id", patientData.assigned_doctor_id).maybeSingle(),
      supabaseAdmin.from("clinics").select("id, booking_fee").eq("id", patientData.clinic_id).maybeSingle(),
    ]);

    if (doctorResult.error || !doctorResult.data) {
      return NextResponse.json({ error: "Assigned doctor not found." }, { status: 404 });
    }

    const doctorData  = doctorResult.data;
    const bookingFee  = (clinicResult.data as { booking_fee?: number } | null)?.booking_fee ?? 50;

    // ── 4. Validate payload ───────────────────────────────────────────────
    let raw: unknown;
    try { raw = await req.json(); }
    catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

    if (typeof raw !== "object" || raw === null) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const body = raw as Partial<BookingPayload>;

    if (!isNonEmptyString(body.type)) {
      return NextResponse.json({ error: "Appointment type is required." }, { status: 400 });
    }
    if (!isNonEmptyString(body.date)) {
      return NextResponse.json({ error: "Date is required." }, { status: 400 });
    }
    if (!isNonEmptyString(body.time)) {
      return NextResponse.json({ error: "Time is required." }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];
    if (body.date < today) {
      return NextResponse.json(
        { error: "Cannot book an appointment in the past." },
        { status: 400 }
      );
    }

    // ── 5. Insert (service role bypasses RLS) ─────────────────────────────
    const appointmentRow = {
      patient_id:   patientData.id,
      doctor_id:    doctorData.id,
      clinic_id:    patientData.clinic_id,
      user_id:      userId,
      patient_name: patientData.name,
      doctor_name:  doctorData.name,
      type:         body.type.trim(),
      date:         body.date.trim(),
      time:         body.time.trim(),
      room:         "TBD",
      fee:          bookingFee,
      status:       "upcoming",
      notes:        isNonEmptyString(body.notes) ? body.notes.trim() : null,
    };

    console.log("[book-appointment] Inserting:", JSON.stringify(appointmentRow, null, 2));

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("appointments")
      .insert(appointmentRow)
      .select("id, date, time, type, status, fee")
      .single();

    if (insertError) {
      console.error("[book-appointment] Insert error:", insertError.message);
      return NextResponse.json(
        { error: `Booking failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    console.log("[book-appointment] Booked ✅ id:", inserted.id);

    return NextResponse.json(
      { ok: true, appointment: inserted, fee: bookingFee },
      { status: 201 }
    );

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[book-appointment] Unhandled error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}